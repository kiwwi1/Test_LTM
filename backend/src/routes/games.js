import express from 'express';
import gameController from '../controllers/gameController.js';

const router = express.Router();

// No authentication required
router.post('/create', gameController.createRoom);
router.post('/join', gameController.joinRoom);
router.post('/:roomId/place-ships', gameController.placeShips);
router.post('/:roomId/attack', gameController.attack);
router.get('/history', gameController.getHistory);
router.get('/:gameId/replay', gameController.getReplay);

export default router;

