import authService from '../services/authService.js';
import { getJSON } from '../config/redis.js';

// Middleware xác thực JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token required' 
            });
        }

        // Verify token
        const decoded = authService.verifyToken(token);
        
        // Check session trong Redis
        const session = await getJSON(`session:${decoded.userId}`);
        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: 'Session expired. Please login again' 
            });
        }

        // Gắn userId vào request
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// Middleware kiểm tra user có trong game không
export const checkInGame = async (req, res, next) => {
    try {
        const gameState = await getJSON(`user:${req.userId}:game`);
        
        if (!gameState) {
            return res.status(400).json({
                success: false,
                message: 'You are not in a game'
            });
        }

        req.gameState = gameState;
        next();
    } catch (error) {
        console.error('Check in game error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export default { authenticateToken, checkInGame };

