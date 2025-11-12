import authService from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class AuthController {
    // POST /api/auth/register
    register = asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const result = await authService.register(username, email, password);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result
        });
    });

    // POST /api/auth/login
    login = asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        const result = await authService.login(username, password);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });

    // POST /api/auth/logout (simplified - no auth needed)
    logout = asyncHandler(async (req, res) => {
        const { userId } = req.body;
        
        if (userId) {
            await authService.logout(userId);
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    });

    // GET /api/auth/verify (always return valid)
    verifyToken = asyncHandler(async (req, res) => {
        res.status(200).json({
            success: true,
            message: 'No authentication required'
        });
    });
}

export default new AuthController();

