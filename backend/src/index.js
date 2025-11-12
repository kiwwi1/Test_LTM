import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gameRoutes from './routes/games.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import socket handler
import GameSocket from './socket/gameSocket.js';

// Import configs
import pool from './config/database.js';
import redisClient from './config/redis.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket
const gameSocket = new GameSocket(httpServer);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    
    httpServer.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connections
        await pool.end();
        await redisClient.quit();
        
        process.exit(0);
    });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===============================================');
    console.log('🚀  BattleShip Backend Server');
    console.log('🚀 ===============================================');
    console.log(`🚀  Server running on port ${PORT}`);
    console.log(`🚀  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚀  HTTP: http://localhost:${PORT}`);
    console.log(`🚀  WebSocket: ws://localhost:${PORT}`);
    console.log('🚀 ===============================================');
    console.log('');
});

export default app;

