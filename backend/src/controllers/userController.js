import userService from '../services/userService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class UserController {
    // GET /api/users/profile?userId=1 (get by query param)
    getProfile = asyncHandler(async (req, res) => {
        const userId = req.query.userId || req.body.userId || 1; // Default to user 1
        const user = await userService.getUserById(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    });

    // GET /api/users/online
    getOnlinePlayers = asyncHandler(async (req, res) => {
        const excludeUserId = req.query.excludeUserId;
        const players = await userService.getOnlinePlayers(excludeUserId);

        res.status(200).json({
            success: true,
            data: players
        });
    });

    // GET /api/users/leaderboard
    getLeaderboard = asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = await userService.getLeaderboard(limit);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    });

    // PUT /api/users/status
    updateStatus = asyncHandler(async (req, res) => {
        const { userId, status } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        if (!['ONLINE', 'OFFLINE', 'IN_GAME'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await userService.updateUserStatus(userId, status);

        res.status(200).json({
            success: true,
            message: 'Status updated'
        });
    });
}

export default new UserController();

