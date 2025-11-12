import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { setWithExpiry } from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

class AuthService {
    // Đăng ký user mới
    async register(username, email, password) {
        try {
            // Kiểm tra username đã tồn tại
            const existingUser = await query(
                'SELECT id FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );

            if (existingUser.rows.length > 0) {
                throw new Error('Username or email already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Tạo user mới
            const result = await query(
                `INSERT INTO users (username, email, password_hash) 
                 VALUES ($1, $2, $3) 
                 RETURNING id, username, email, elo_rating, wins, losses, created_at`,
                [username, email, passwordHash]
            );

            const user = result.rows[0];

            // Tạo JWT token
            const token = this.generateToken(user.id);

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    eloRating: user.elo_rating,
                    wins: user.wins,
                    losses: user.losses,
                    createdAt: user.created_at
                },
                token
            };
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    // Đăng nhập
    async login(username, password) {
        try {
            // Tìm user
            const result = await query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (result.rows.length === 0) {
                throw new Error('Invalid username or password');
            }

            const user = result.rows[0];

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid username or password');
            }

            // Cập nhật last_login và status
            await query(
                `UPDATE users 
                 SET last_login = CURRENT_TIMESTAMP, status = 'ONLINE' 
                 WHERE id = $1`,
                [user.id]
            );

            // Tạo JWT token
            const token = this.generateToken(user.id);

            // Lưu session vào Redis
            await setWithExpiry(`session:${user.id}`, {
                userId: user.id,
                username: user.username,
                loginAt: new Date().toISOString()
            }, 7 * 24 * 60 * 60); // 7 days

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    eloRating: user.elo_rating,
                    wins: user.wins,
                    losses: user.losses,
                    draws: user.draws,
                    totalGames: user.total_games,
                    status: 'ONLINE',
                    avatarUrl: user.avatar_url
                },
                token
            };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Đăng xuất
    async logout(userId) {
        try {
            // Cập nhật status về OFFLINE
            await query(
                'UPDATE users SET status = $1 WHERE id = $2',
                ['OFFLINE', userId]
            );

            // Xóa session từ Redis
            await setWithExpiry(`session:${userId}`, null, 0);

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Tạo JWT token
    generateToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}

export default new AuthService();

