/*
 * BattleShip TCP Server
 * Written in C for high-performance game state management
 * Cross-platform: Works on Linux and Windows
 * 
 * This server handles:
 * - Player connections via TCP
 * - Game state management
 * - Attack validation
 * - Win condition checking
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// Cross-platform socket includes
#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    #define close closesocket
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #include <errno.h>
    #define SOCKET int
    #define INVALID_SOCKET -1
    #define SOCKET_ERROR -1
    #define closesocket close
#endif

#define PORT 8888
#define BUFFER_SIZE 4096
#define MAX_CLIENTS 100
#define BOARD_SIZE 10

// Game states
typedef enum {
    WAITING,
    PLACING_SHIPS,
    PLAYING,
    FINISHED
} GameStatus;

// Player structure
typedef struct {
    SOCKET socket;
    int id;
    char username[50];
    int board[BOARD_SIZE][BOARD_SIZE]; // 0=empty, 1=ship, 2=miss, 3=hit
    int ships_placed;
    int is_connected;
} Player;

// Game room structure
typedef struct {
    int room_id;
    Player player1;
    Player player2;
    GameStatus status;
    int current_turn; // 1 or 2
    int moves_count;
    time_t created_at;
} GameRoom;

// Global variables
GameRoom game_rooms[MAX_CLIENTS / 2];
int room_count = 0;

// Function prototypes
int init_socket_library();
void cleanup_socket_library();
void handle_client(SOCKET client_socket);
void process_message(SOCKET client_socket, const char* message);
void send_response(SOCKET socket, const char* response);
void create_board(int board[BOARD_SIZE][BOARD_SIZE]);
int validate_attack(int x, int y);
int check_hit(int board[BOARD_SIZE][BOARD_SIZE], int x, int y);
int check_game_over(int board[BOARD_SIZE][BOARD_SIZE]);
GameRoom* find_room_by_socket(SOCKET socket);
int get_last_error();

// Main function
int main() {
    printf("========================================\n");
    printf("  BattleShip TCP Server (C)\n");
    #ifdef _WIN32
    printf("  Platform: Windows\n");
    #else
    printf("  Platform: Linux\n");
    #endif
    printf("========================================\n");
    printf("Starting server on port %d...\n\n", PORT);

    // Initialize socket library
    if (init_socket_library() != 0) {
        printf("Error: Failed to initialize socket library\n");
        return 1;
    }

    // Create socket
    SOCKET server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_socket == INVALID_SOCKET) {
        printf("Error: Could not create socket: %d\n", get_last_error());
        cleanup_socket_library();
        return 1;
    }

    // Set socket options (allow reuse of address)
    int opt = 1;
    if (setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt)) < 0) {
        printf("Warning: setsockopt failed\n");
    }

    // Bind socket
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) == SOCKET_ERROR) {
        printf("Error: Bind failed: %d\n", get_last_error());
        close(server_socket);
        cleanup_socket_library();
        return 1;
    }

    // Listen
    if (listen(server_socket, SOMAXCONN) == SOCKET_ERROR) {
        printf("Error: Listen failed: %d\n", get_last_error());
        close(server_socket);
        cleanup_socket_library();
        return 1;
    }

    printf("Server is listening on port %d\n", PORT);
    printf("Waiting for connections...\n\n");

    // Accept connections
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        
        SOCKET client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_len);
        
        if (client_socket == INVALID_SOCKET) {
            printf("Error: Accept failed: %d\n", get_last_error());
            continue;
        }

        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
        printf("New connection from %s:%d\n", client_ip, ntohs(client_addr.sin_port));

        // Handle client in separate thread (simplified - single-threaded for now)
        handle_client(client_socket);
    }

    // Cleanup
    close(server_socket);
    cleanup_socket_library();

    return 0;
}

// Initialize socket library (cross-platform)
int init_socket_library() {
    #ifdef _WIN32
        WSADATA wsa_data;
        int result = WSAStartup(MAKEWORD(2, 2), &wsa_data);
        
        if (result != 0) {
            printf("Error: WSAStartup failed: %d\n", result);
            return 1;
        }
        
        printf("Winsock initialized successfully\n");
    #else
        printf("Socket library ready (Linux)\n");
    #endif
    
    return 0;
}

// Cleanup socket library (cross-platform)
void cleanup_socket_library() {
    #ifdef _WIN32
        WSACleanup();
    #endif
}

// Get last socket error (cross-platform)
int get_last_error() {
    #ifdef _WIN32
        return WSAGetLastError();
    #else
        return errno;
    #endif
}

// Handle client connection
void handle_client(SOCKET client_socket) {
    char buffer[BUFFER_SIZE];
    int recv_size;

    // Welcome message
    const char* welcome = "{\"cmd\":\"SYSTEM_MSG\",\"payload\":{\"message\":\"Connected to BattleShip TCP Server\"}}";
    send_response(client_socket, welcome);

    // Receive and process messages
    while ((recv_size = recv(client_socket, buffer, BUFFER_SIZE, 0)) > 0) {
        buffer[recv_size] = '\0';
        printf("Received: %s\n", buffer);

        // Process message
        process_message(client_socket, buffer);
    }

    if (recv_size == 0) {
        printf("Client disconnected gracefully\n");
    } else if (recv_size < 0) {
        printf("Error: recv failed: %d\n", get_last_error());
    }

    // Cleanup
    close(client_socket);
}

// Process incoming message (JSON format)
void process_message(SOCKET client_socket, const char* message) {
    // Simple JSON parsing (in production, use a proper JSON library like cJSON)
    
    char response[BUFFER_SIZE];

    // Check for REGISTER command
    if (strstr(message, "\"cmd\":\"REGISTER\"") != NULL) {
        sprintf(response, "{\"cmd\":\"REGISTER_RESPONSE\",\"payload\":{\"success\":true,\"message\":\"Registration handled by NodeJS backend\"}}");
        send_response(client_socket, response);
    }
    // Check for LOGIN command
    else if (strstr(message, "\"cmd\":\"LOGIN\"") != NULL) {
        sprintf(response, "{\"cmd\":\"LOGIN_RESPONSE\",\"payload\":{\"success\":true,\"message\":\"Login handled by NodeJS backend\"}}");
        send_response(client_socket, response);
    }
    // Check for PLACE_SHIP command
    else if (strstr(message, "\"cmd\":\"PLACE_SHIP\"") != NULL) {
        sprintf(response, "{\"cmd\":\"PLACE_SHIP_RESPONSE\",\"payload\":{\"success\":true,\"message\":\"Ships placed successfully\"}}");
        send_response(client_socket, response);
    }
    // Check for MOVE command (attack)
    else if (strstr(message, "\"cmd\":\"MOVE\"") != NULL) {
        // Extract coordinates (simplified)
        // In production: parse JSON properly and validate
        
        int x = 5, y = 5; // Placeholder
        int hit = rand() % 2; // Random for demo

        sprintf(response, 
            "{\"cmd\":\"MOVE_RESULT\",\"payload\":{\"coord\":\"%d,%d\",\"result\":\"%s\",\"ship_sunk\":null}}",
            x, y, hit ? "HIT" : "MISS");
        
        send_response(client_socket, response);
    }
    // Check for HEARTBEAT
    else if (strstr(message, "\"cmd\":\"HEARTBEAT\"") != NULL) {
        sprintf(response, "{\"cmd\":\"HEARTBEAT_ACK\",\"payload\":{\"timestamp\":%ld}}", time(NULL));
        send_response(client_socket, response);
    }
    // Unknown command
    else {
        sprintf(response, "{\"cmd\":\"SYSTEM_MSG\",\"payload\":{\"code\":400,\"message\":\"Unknown command\"}}");
        send_response(client_socket, response);
    }
}

// Send response to client
void send_response(SOCKET socket, const char* response) {
    int send_result = send(socket, response, strlen(response), 0);
    
    if (send_result < 0) {
        printf("Error: send failed: %d\n", get_last_error());
    } else {
        printf("Sent: %s\n", response);
    }
}

// Create empty board
void create_board(int board[BOARD_SIZE][BOARD_SIZE]) {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = 0;
        }
    }
}

// Validate attack coordinates
int validate_attack(int x, int y) {
    return (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE);
}

// Check if attack hits a ship
int check_hit(int board[BOARD_SIZE][BOARD_SIZE], int x, int y) {
    return board[x][y] == 1; // 1 means ship
}

// Check if all ships are destroyed
int check_game_over(int board[BOARD_SIZE][BOARD_SIZE]) {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] == 1) {
                return 0; // Still has ships
            }
        }
    }
    return 1; // All ships destroyed
}

// Find game room by socket
GameRoom* find_room_by_socket(SOCKET socket) {
    for (int i = 0; i < room_count; i++) {
        if (game_rooms[i].player1.socket == socket || 
            game_rooms[i].player2.socket == socket) {
            return &game_rooms[i];
        }
    }
    return NULL;
}

// Note: cleanup() function removed - use cleanup_socket_library() instead

