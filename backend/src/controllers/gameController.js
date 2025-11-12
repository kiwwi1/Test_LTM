import gameService from '../services/gameService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class GameController {
    // POST /api/games/create
    createRoom = asyncHandler(async (req, res) => {
        const { userId } = req.body; // Get userId from body
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const room = await gameService.createGameRoom(userId);

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: room
        });
    });

    // POST /api/games/join
    joinRoom = asyncHandler(async (req, res) => {
        const { roomCode, userId } = req.body;

        if (!roomCode || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Room code and userId are required'
            });
        }

        const room = await gameService.joinGameRoom(roomCode, userId);

        res.status(200).json({
            success: true,
            message: 'Joined room successfully',
            data: room
        });
    });

    // POST /api/games/:roomId/place-ships
    placeShips = asyncHandler(async (req, res) => {
        const { roomId } = req.params;
        const { userId, ships } = req.body;

        if (!userId || !ships || !Array.isArray(ships)) {
            return res.status(400).json({
                success: false,
                message: 'userId and ships data are required'
            });
        }

        const result = await gameService.placeShips(
            parseInt(roomId), 
            userId, 
            ships
        );

        res.status(200).json({
            success: true,
            message: 'Ships placed successfully',
            data: result
        });
    });

    // POST /api/games/:roomId/attack
    attack = asyncHandler(async (req, res) => {
        const { roomId } = req.params;
        const { userId, x, y } = req.body;

        if (!userId || x === undefined || y === undefined) {
            return res.status(400).json({
                success: false,
                message: 'userId and attack coordinates are required'
            });
        }

        const result = await gameService.processAttack(
            parseInt(roomId),
            userId,
            parseInt(x),
            parseInt(y)
        );

        res.status(200).json({
            success: true,
            data: result
        });
    });

    // GET /api/games/history?userId=1
    getHistory = asyncHandler(async (req, res) => {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const history = await gameService.getGameHistory(userId, limit);

        res.status(200).json({
            success: true,
            data: history
        });
    });

    // GET /api/games/:gameId/replay?userId=1
    getReplay = asyncHandler(async (req, res) => {
        const { gameId } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const replay = await gameService.getGameReplay(parseInt(gameId), userId);

        res.status(200).json({
            success: true,
            data: replay
        });
    });
}

export default new GameController();

