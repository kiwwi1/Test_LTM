import { query } from '../config/database.js';
import { setWithExpiry, getJSON } from '../config/redis.js';

class UserService {
    // Lấy thông tin user theo ID
    async getUserById(userId) {
        try {
            const result = await query(
                `SELECT id, username, email, elo_rating, wins, losses, draws, 
                        total_games, status, created_at, last_login, avatar_url
                 FROM users WHERE id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            return this.formatUser(result.rows[0]);
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    // Lấy danh sách người chơi online
    async getOnlinePlayers(excludeUserId = null) {
        try {
            let queryText = `
                SELECT id, username, elo_rating, wins, losses, status, avatar_url
                FROM users 
                WHERE status IN ('ONLINE', 'IN_GAME')
            `;
            
            const params = [];
            if (excludeUserId) {
                queryText += ' AND id != $1';
                params.push(excludeUserId);
            }

            queryText += ' ORDER BY elo_rating DESC LIMIT 50';

            const result = await query(queryText, params);

            return result.rows.map(user => this.formatUser(user));
        } catch (error) {
            console.error('Get online players error:', error);
            throw error;
        }
    }

    // Cập nhật status user
    async updateUserStatus(userId, status) {
        try {
            await query(
                'UPDATE users SET status = $1 WHERE id = $2',
                [status, userId]
            );

            // Cập nhật cache Redis
            await setWithExpiry(`user:${userId}:status`, status, 3600);

            return { success: true };
        } catch (error) {
            console.error('Update user status error:', error);
            throw error;
        }
    }

    // Lấy bảng xếp hạng
    async getLeaderboard(limit = 50) {
        try {
            // Update leaderboard
            await query('SELECT update_leaderboard()');

            // Get top players
            const result = await query(
                `SELECT l.rank, u.id, u.username, l.elo_rating, l.total_games, 
                        l.win_rate, l.wins, l.losses, u.avatar_url
                 FROM leaderboard l
                 JOIN users u ON l.user_id = u.id
                 ORDER BY l.rank ASC
                 LIMIT $1`,
                [limit]
            );

            return result.rows.map(row => ({
                rank: row.rank,
                user: {
                    id: row.id,
                    username: row.username,
                    avatarUrl: row.avatar_url
                },
                eloRating: row.elo_rating,
                totalGames: row.total_games,
                winRate: parseFloat(row.win_rate),
                wins: row.wins,
                losses: row.losses
            }));
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    }

    // Cập nhật ELO rating sau trận đấu
    async updateEloRating(winnerId, loserId) {
        try {
            // Lấy ELO hiện tại
            const users = await query(
                'SELECT id, elo_rating FROM users WHERE id IN ($1, $2)',
                [winnerId, loserId]
            );

            const winner = users.rows.find(u => u.id === winnerId);
            const loser = users.rows.find(u => u.id === loserId);

            // Tính ELO mới (K-factor = 32)
            const K = 32;
            const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_rating - winner.elo_rating) / 400));
            const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo_rating - loser.elo_rating) / 400));

            const newWinnerElo = Math.round(winner.elo_rating + K * (1 - expectedWinner));
            const newLoserElo = Math.round(loser.elo_rating + K * (0 - expectedLoser));

            // Cập nhật database
            await query(
                `UPDATE users 
                 SET elo_rating = $1, wins = wins + 1, total_games = total_games + 1
                 WHERE id = $2`,
                [newWinnerElo, winnerId]
            );

            await query(
                `UPDATE users 
                 SET elo_rating = $1, losses = losses + 1, total_games = total_games + 1
                 WHERE id = $2`,
                [newLoserElo, loserId]
            );

            return {
                winner: { id: winnerId, newElo: newWinnerElo, change: newWinnerElo - winner.elo_rating },
                loser: { id: loserId, newElo: newLoserElo, change: newLoserElo - loser.elo_rating }
            };
        } catch (error) {
            console.error('Update ELO error:', error);
            throw error;
        }
    }

    // Format user object
    formatUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            eloRating: user.elo_rating,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            totalGames: user.total_games,
            status: user.status,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            avatarUrl: user.avatar_url
        };
    }
}

export default new UserService();

