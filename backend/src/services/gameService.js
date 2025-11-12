import { query, transaction } from '../config/database.js';
import { setWithExpiry, getJSON, deleteKey } from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';

class GameService {
    // Tạo phòng game mới
    async createGameRoom(player1Id) {
        try {
            const roomCode = this.generateRoomCode();

            const result = await query(
                `INSERT INTO game_rooms (room_code, player1_id, status)
                 VALUES ($1, $2, 'WAITING')
                 RETURNING *`,
                [roomCode, player1Id]
            );

            const room = result.rows[0];

            // Lưu vào Redis
            await setWithExpiry(`room:${roomCode}`, {
                id: room.id,
                roomCode: room.room_code,
                player1Id: room.player1_id,
                player2Id: null,
                status: 'WAITING',
                createdAt: room.created_at
            }, 3600); // 1 hour

            return this.formatRoom(room);
        } catch (error) {
            console.error('Create room error:', error);
            throw error;
        }
    }

    // Join phòng game
    async joinGameRoom(roomCode, player2Id) {
        try {
            const result = await query(
                `UPDATE game_rooms 
                 SET player2_id = $1, status = 'PLAYING', started_at = CURRENT_TIMESTAMP
                 WHERE room_code = $2 AND status = 'WAITING' AND player1_id != $1
                 RETURNING *`,
                [player2Id, roomCode]
            );

            if (result.rows.length === 0) {
                throw new Error('Room not found or already full');
            }

            const room = result.rows[0];

            // Khởi tạo game state trong Redis
            await this.initializeGameState(room.id, room.player1_id, room.player2_id);

            return this.formatRoom(room);
        } catch (error) {
            console.error('Join room error:', error);
            throw error;
        }
    }

    // Khởi tạo game state
    async initializeGameState(roomId, player1Id, player2Id) {
        const gameState = {
            roomId,
            player1Id,
            player2Id,
            currentTurn: player1Id, // Player 1 đi trước
            player1Ships: null,
            player2Ships: null,
            player1Board: this.createEmptyBoard(),
            player2Board: this.createEmptyBoard(),
            moves: [],
            status: 'PLACING_SHIPS',
            startedAt: new Date().toISOString()
        };

        await setWithExpiry(`gamestate:${roomId}`, gameState, 7200); // 2 hours
        return gameState;
    }

    // Tạo board trống 10x10
    createEmptyBoard() {
        return Array(10).fill(null).map(() => Array(10).fill(0));
        // 0 = empty, 1 = ship, 2 = miss, 3 = hit
    }

    // Đặt tàu
    async placeShips(roomId, playerId, ships) {
        try {
            const gameState = await getJSON(`gamestate:${roomId}`);
            
            if (!gameState) {
                throw new Error('Game not found');
            }

            // Validate ships
            if (!this.validateShips(ships)) {
                throw new Error('Invalid ship placement');
            }

            // Lưu vị trí tàu
            if (playerId === gameState.player1Id) {
                gameState.player1Ships = ships;
            } else if (playerId === gameState.player2Id) {
                gameState.player2Ships = ships;
            } else {
                throw new Error('Player not in this game');
            }

            // Nếu cả 2 đã đặt xong, bắt đầu game
            if (gameState.player1Ships && gameState.player2Ships) {
                gameState.status = 'PLAYING';
            }

            await setWithExpiry(`gamestate:${roomId}`, gameState, 7200);

            return {
                success: true,
                status: gameState.status,
                bothReady: gameState.player1Ships && gameState.player2Ships
            };
        } catch (error) {
            console.error('Place ships error:', error);
            throw error;
        }
    }

    // Validate ships placement
    validateShips(ships) {
        // Ships format: [{name, size, positions: [[x,y], [x,y], ...]}]
        const expectedShips = [
            { name: 'Carrier', size: 5 },
            { name: 'Battleship', size: 4 },
            { name: 'Cruiser', size: 3 },
            { name: 'Submarine', size: 3 },
            { name: 'Destroyer', size: 2 }
        ];

        if (ships.length !== expectedShips.length) {
            return false;
        }

        const board = Array(10).fill(null).map(() => Array(10).fill(false));

        for (const ship of ships) {
            // Check if positions are valid and not overlapping
            if (ship.positions.length !== ship.size) {
                return false;
            }

            for (const [x, y] of ship.positions) {
                if (x < 0 || x >= 10 || y < 0 || y >= 10) {
                    return false;
                }
                if (board[x][y]) {
                    return false; // Overlap
                }
                board[x][y] = true;
            }

            // Check if positions are consecutive (horizontal or vertical)
            const positions = ship.positions.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
            const isHorizontal = positions.every(([x, y]) => x === positions[0][0]);
            const isVertical = positions.every(([x, y]) => y === positions[0][1]);

            if (!isHorizontal && !isVertical) {
                return false;
            }
        }

        return true;
    }

    // Xử lý tấn công
    async processAttack(roomId, attackerId, targetX, targetY) {
        try {
            const gameState = await getJSON(`gamestate:${roomId}`);

            if (!gameState || gameState.status !== 'PLAYING') {
                throw new Error('Game not in playing state');
            }

            // Check turn
            if (gameState.currentTurn !== attackerId) {
                throw new Error('Not your turn');
            }

            // Determine defender
            const defenderId = attackerId === gameState.player1Id 
                ? gameState.player2Id 
                : gameState.player1Id;

            const defenderShips = attackerId === gameState.player1Id
                ? gameState.player2Ships
                : gameState.player1Ships;

            // Check if hit
            let hit = false;
            let sunkShip = null;

            for (const ship of defenderShips) {
                const hitIndex = ship.positions.findIndex(([x, y]) => x === targetX && y === targetY);
                
                if (hitIndex !== -1) {
                    hit = true;
                    ship.hits = ship.hits || [];
                    ship.hits.push(hitIndex);

                    // Check if ship is sunk
                    if (ship.hits.length === ship.size) {
                        sunkShip = ship.name;
                    }
                    break;
                }
            }

            // Record move
            const move = {
                player: attackerId,
                coord: [targetX, targetY],
                result: hit ? 'HIT' : 'MISS',
                sunkShip,
                timestamp: new Date().toISOString()
            };

            gameState.moves.push(move);

            // Update board
            const board = attackerId === gameState.player1Id 
                ? gameState.player2Board 
                : gameState.player1Board;
            
            board[targetX][targetY] = hit ? 3 : 2; // 3 = hit, 2 = miss

            // Check if game over
            const gameOver = this.checkGameOver(defenderShips);
            
            if (gameOver) {
                gameState.status = 'FINISHED';
                await this.endGame(roomId, attackerId, defenderId, gameState);
            } else {
                // Switch turn
                gameState.currentTurn = defenderId;
            }

            await setWithExpiry(`gamestate:${roomId}`, gameState, 7200);

            return {
                hit,
                sunkShip,
                gameOver,
                winner: gameOver ? attackerId : null
            };
        } catch (error) {
            console.error('Process attack error:', error);
            throw error;
        }
    }

    // Check if all ships are sunk
    checkGameOver(ships) {
        return ships.every(ship => {
            const hits = ship.hits || [];
            return hits.length === ship.size;
        });
    }

    // Kết thúc game
    async endGame(roomId, winnerId, loserId, gameState) {
        try {
            await transaction(async (client) => {
                // Update game_rooms
                await client.query(
                    `UPDATE game_rooms 
                     SET status = 'FINISHED', winner_id = $1, ended_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [winnerId, roomId]
                );

                // Save to game_history
                const duration = Math.floor((Date.now() - new Date(gameState.startedAt).getTime()) / 1000);
                
                await client.query(
                    `INSERT INTO game_history 
                     (room_id, player1_id, player2_id, winner_id, result, total_turns, 
                      duration_seconds, player1_ships_layout, player2_ships_layout, moves_history)
                     VALUES ($1, $2, $3, $4, 'WIN', $5, $6, $7, $8, $9)`,
                    [
                        roomId,
                        gameState.player1Id,
                        gameState.player2Id,
                        winnerId,
                        gameState.moves.length,
                        duration,
                        JSON.stringify(gameState.player1Ships),
                        JSON.stringify(gameState.player2Ships),
                        JSON.stringify(gameState.moves)
                    ]
                );

                // Update player stats and ELO (moved to userService)
            });

            // Clear Redis game state
            await deleteKey(`gamestate:${roomId}`);

            return { success: true };
        } catch (error) {
            console.error('End game error:', error);
            throw error;
        }
    }

    // Lấy lịch sử game
    async getGameHistory(userId, limit = 20) {
        try {
            const result = await query(
                `SELECT gh.*, 
                        p1.username as player1_name,
                        p2.username as player2_name,
                        w.username as winner_name
                 FROM game_history gh
                 JOIN users p1 ON gh.player1_id = p1.id
                 JOIN users p2 ON gh.player2_id = p2.id
                 LEFT JOIN users w ON gh.winner_id = w.id
                 WHERE gh.player1_id = $1 OR gh.player2_id = $1
                 ORDER BY gh.played_at DESC
                 LIMIT $2`,
                [userId, limit]
            );

            return result.rows.map(row => ({
                id: row.id,
                roomId: row.room_id,
                player1: { id: row.player1_id, username: row.player1_name },
                player2: { id: row.player2_id, username: row.player2_name },
                winner: row.winner_id ? { id: row.winner_id, username: row.winner_name } : null,
                result: row.result,
                totalTurns: row.total_turns,
                duration: row.duration_seconds,
                playedAt: row.played_at
            }));
        } catch (error) {
            console.error('Get game history error:', error);
            throw error;
        }
    }

    // Lấy replay
    async getGameReplay(gameId, userId) {
        try {
            const result = await query(
                `SELECT * FROM game_history 
                 WHERE id = $1 AND (player1_id = $2 OR player2_id = $2)`,
                [gameId, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Game not found');
            }

            const game = result.rows[0];

            return {
                id: game.id,
                player1Ships: game.player1_ships_layout,
                player2Ships: game.player2_ships_layout,
                moves: game.moves_history,
                winner: game.winner_id,
                duration: game.duration_seconds
            };
        } catch (error) {
            console.error('Get replay error:', error);
            throw error;
        }
    }

    // Generate room code
    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Format room object
    formatRoom(room) {
        return {
            id: room.id,
            roomCode: room.room_code,
            player1Id: room.player1_id,
            player2Id: room.player2_id,
            status: room.status,
            winnerId: room.winner_id,
            createdAt: room.created_at,
            startedAt: room.started_at,
            endedAt: room.ended_at
        };
    }
}

export default new GameService();

