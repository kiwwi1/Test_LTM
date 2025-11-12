import { Server } from 'socket.io';
import authService from '../services/authService.js';
import gameService from '../services/gameService.js';
import userService from '../services/userService.js';
import { setWithExpiry, getJSON, deleteKey } from '../config/redis.js';

class GameSocket {
    constructor(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    // No authentication required - get userId from handshake
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                // Get userId from handshake query or auth
                const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
                
                if (!userId) {
                    return next(new Error('userId is required'));
                }

                socket.userId = parseInt(userId);
                
                // Lưu socket mapping
                await setWithExpiry(`socket:${socket.userId}`, socket.id, 86400); // 24h
                
                next();
            } catch (error) {
                next(new Error('Connection error'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`✅ User ${socket.userId} connected via Socket.IO`);

            // Update user status to online
            userService.updateUserStatus(socket.userId, 'ONLINE');

            // Notify other users
            this.broadcastOnlineUsers();

            // Handle events
            socket.on('player:ready', () => this.handlePlayerReady(socket));
            socket.on('game:challenge', (data) => this.handleChallenge(socket, data));
            socket.on('game:challenge_response', (data) => this.handleChallengeResponse(socket, data));
            socket.on('game:place_ships', (data) => this.handlePlaceShips(socket, data));
            socket.on('game:attack', (data) => this.handleAttack(socket, data));
            socket.on('game:surrender', (data) => this.handleSurrender(socket, data));
            socket.on('game:chat', (data) => this.handleChat(socket, data));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    // Handle player ready
    async handlePlayerReady(socket) {
        await userService.updateUserStatus(socket.userId, 'ONLINE');
        socket.emit('player:ready_ack', { success: true });
        this.broadcastOnlineUsers();
    }

    // Handle challenge
    async handleChallenge(socket, data) {
        try {
            const { targetUserId } = data;
            const challenger = await userService.getUserById(socket.userId);
            
            // Get target socket
            const targetSocketId = await getJSON(`socket:${targetUserId}`);
            
            if (targetSocketId) {
                // Send challenge to target user
                this.io.to(targetSocketId).emit('game:challenge_received', {
                    challengerId: socket.userId,
                    challengerName: challenger.username,
                    challengerElo: challenger.eloRating
                });

                socket.emit('game:challenge_sent', { 
                    success: true,
                    message: 'Challenge sent'
                });
            } else {
                socket.emit('error', { message: 'User is not online' });
            }
        } catch (error) {
            console.error('Challenge error:', error);
            socket.emit('error', { message: error.message });
        }
    }

    // Handle challenge response
    async handleChallengeResponse(socket, data) {
        try {
            const { challengerId, accepted } = data;
            const challengerSocketId = await getJSON(`socket:${challengerId}`);

            if (accepted) {
                // Create game room
                const room = await gameService.createGameRoom(challengerId);
                await gameService.joinGameRoom(room.roomCode, socket.userId);

                // Join socket room
                socket.join(`room:${room.id}`);
                
                if (challengerSocketId) {
                    const challengerSocket = this.io.sockets.sockets.get(challengerSocketId);
                    challengerSocket?.join(`room:${room.id}`);
                }

                // Notify both players
                this.io.to(`room:${room.id}`).emit('game:started', {
                    roomId: room.id,
                    roomCode: room.roomCode,
                    player1Id: challengerId,
                    player2Id: socket.userId
                });

                // Update status
                await userService.updateUserStatus(challengerId, 'IN_GAME');
                await userService.updateUserStatus(socket.userId, 'IN_GAME');
            } else {
                // Notify challenger
                if (challengerSocketId) {
                    this.io.to(challengerSocketId).emit('game:challenge_declined', {
                        userId: socket.userId
                    });
                }
            }
        } catch (error) {
            console.error('Challenge response error:', error);
            socket.emit('error', { message: error.message });
        }
    }

    // Handle place ships
    async handlePlaceShips(socket, data) {
        try {
            const { roomId, ships } = data;
            const result = await gameService.placeShips(roomId, socket.userId, ships);

            socket.emit('game:ships_placed', { success: true });

            // If both players ready, notify room
            if (result.bothReady) {
                const gameState = await getJSON(`gamestate:${roomId}`);
                this.io.to(`room:${roomId}`).emit('game:both_ready', {
                    currentTurn: gameState.currentTurn
                });
            }
        } catch (error) {
            console.error('Place ships error:', error);
            socket.emit('error', { message: error.message });
        }
    }

    // Handle attack
    async handleAttack(socket, data) {
        try {
            const { roomId, x, y } = data;
            const result = await gameService.processAttack(roomId, socket.userId, x, y);

            // Notify both players
            this.io.to(`room:${roomId}`).emit('game:attack_result', {
                attackerId: socket.userId,
                coord: { x, y },
                hit: result.hit,
                sunkShip: result.sunkShip,
                gameOver: result.gameOver,
                winner: result.winner
            });

            // If game over, update ELO and status
            if (result.gameOver) {
                const gameState = await getJSON(`gamestate:${roomId}`);
                const loserId = result.winner === gameState.player1Id 
                    ? gameState.player2Id 
                    : gameState.player1Id;

                const eloUpdate = await userService.updateEloRating(result.winner, loserId);

                this.io.to(`room:${roomId}`).emit('game:ended', {
                    winner: result.winner,
                    eloChanges: eloUpdate
                });

                // Update status
                await userService.updateUserStatus(gameState.player1Id, 'ONLINE');
                await userService.updateUserStatus(gameState.player2Id, 'ONLINE');

                this.broadcastOnlineUsers();
            }
        } catch (error) {
            console.error('Attack error:', error);
            socket.emit('error', { message: error.message });
        }
    }

    // Handle surrender
    async handleSurrender(socket, data) {
        try {
            const { roomId } = data;
            const gameState = await getJSON(`gamestate:${roomId}`);

            if (!gameState) {
                throw new Error('Game not found');
            }

            const winnerId = socket.userId === gameState.player1Id 
                ? gameState.player2Id 
                : gameState.player1Id;

            // End game
            await gameService.endGame(roomId, winnerId, socket.userId, gameState);

            // Update ELO
            const eloUpdate = await userService.updateEloRating(winnerId, socket.userId);

            // Notify both players
            this.io.to(`room:${roomId}`).emit('game:ended', {
                winner: winnerId,
                reason: 'surrender',
                eloChanges: eloUpdate
            });

            // Update status
            await userService.updateUserStatus(gameState.player1Id, 'ONLINE');
            await userService.updateUserStatus(gameState.player2Id, 'ONLINE');

            this.broadcastOnlineUsers();
        } catch (error) {
            console.error('Surrender error:', error);
            socket.emit('error', { message: error.message });
        }
    }

    // Handle chat
    async handleChat(socket, data) {
        try {
            const { roomId, message } = data;
            const user = await userService.getUserById(socket.userId);

            this.io.to(`room:${roomId}`).emit('game:chat_message', {
                userId: socket.userId,
                username: user.username,
                message,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Chat error:', error);
        }
    }

    // Handle disconnect
    async handleDisconnect(socket) {
        console.log(`❌ User ${socket.userId} disconnected`);

        try {
            // Check if user is in a game
            const gameState = await getJSON(`user:${socket.userId}:game`);
            
            if (gameState) {
                const { roomId } = gameState;
                const fullGameState = await getJSON(`gamestate:${roomId}`);

                if (fullGameState && fullGameState.status === 'PLAYING') {
                    // User disconnected during game - auto lose
                    const winnerId = socket.userId === fullGameState.player1Id
                        ? fullGameState.player2Id
                        : fullGameState.player1Id;

                    await gameService.endGame(roomId, winnerId, socket.userId, fullGameState);

                    this.io.to(`room:${roomId}`).emit('game:ended', {
                        winner: winnerId,
                        reason: 'disconnect'
                    });
                }
            }

            // Update user status
            await userService.updateUserStatus(socket.userId, 'OFFLINE');
            await deleteKey(`socket:${socket.userId}`);

            // Broadcast updated online users
            this.broadcastOnlineUsers();
        } catch (error) {
            console.error('Disconnect handler error:', error);
        }
    }

    // Broadcast online users to all connected clients
    async broadcastOnlineUsers() {
        try {
            const onlinePlayers = await userService.getOnlinePlayers();
            this.io.emit('player:list_update', { players: onlinePlayers });
        } catch (error) {
            console.error('Broadcast online users error:', error);
        }
    }
}

export default GameSocket;

