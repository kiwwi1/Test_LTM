import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// No authentication required
router.get('/profile', userController.getProfile);
router.get('/online', userController.getOnlinePlayers);
router.get('/leaderboard', userController.getLeaderboard);
router.put('/status', userController.updateStatus);

export default router;

