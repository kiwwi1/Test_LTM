-- BattleShip Database Schema

-- Drop existing tables if exists
DROP TABLE IF EXISTS player_items CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS game_history CASCADE;
DROP TABLE IF EXISTS game_rooms CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Bảng Users (Người chơi)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    elo_rating INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OFFLINE', -- OFFLINE, ONLINE, IN_GAME
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    avatar_url VARCHAR(255),
    CONSTRAINT check_status CHECK (status IN ('OFFLINE', 'ONLINE', 'IN_GAME'))
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_elo ON users(elo_rating DESC);

-- Bảng Game Rooms (Phòng chơi)
CREATE TABLE game_rooms (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    player1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    player2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'WAITING', -- WAITING, PLAYING, FINISHED
    winner_id INTEGER REFERENCES users(id),
    current_turn INTEGER, -- player_id của người đang tới lượt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    CONSTRAINT check_room_status CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED'))
);

CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_code ON game_rooms(room_code);

-- Bảng Game History (Lịch sử trận đấu)
CREATE TABLE game_history (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES game_rooms(id) ON DELETE CASCADE,
    player1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    player2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    winner_id INTEGER REFERENCES users(id),
    result VARCHAR(20), -- WIN, LOSE, DRAW, DISCONNECT
    total_turns INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    player1_ships_layout JSONB, -- Vị trí tàu player 1
    player2_ships_layout JSONB, -- Vị trí tàu player 2
    moves_history JSONB, -- Lịch sử các nước đi [{player_id, coord, result, timestamp}]
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_result CHECK (result IN ('WIN', 'LOSE', 'DRAW', 'DISCONNECT'))
);

CREATE INDEX idx_game_history_player1 ON game_history(player1_id);
CREATE INDEX idx_game_history_player2 ON game_history(player2_id);
CREATE INDEX idx_game_history_played_at ON game_history(played_at DESC);

-- Bảng Items (Vật phẩm hỗ trợ)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    effect_type VARCHAR(30) NOT NULL, -- RADAR, MULTI_SHOT, AIR_STRIKE, SONAR
    effect_data JSONB, -- Cấu hình hiệu ứng: {range: 3, pattern: 'cross'}
    cost INTEGER DEFAULT 0, -- Điểm để mua item
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_effect_type CHECK (effect_type IN ('RADAR', 'MULTI_SHOT', 'AIR_STRIKE', 'SONAR'))
);

-- Dữ liệu mẫu cho items
INSERT INTO items (name, description, effect_type, effect_data, cost) VALUES
('Radar Scan', 'Quét vùng 3x3 để phát hiện tàu', 'RADAR', '{"range": 3, "pattern": "square"}', 100),
('Cross Shot', 'Bắn theo hình chữ thập (+)', 'MULTI_SHOT', '{"pattern": "cross", "size": 3}', 150),
('Air Strike', 'Tấn công hàng ngang 5 ô', 'AIR_STRIKE', '{"pattern": "horizontal", "size": 5}', 200),
('Sonar Ping', 'Phát hiện 1 tàu ngẫu nhiên trong vùng 5x5', 'SONAR', '{"range": 5, "reveal_count": 1}', 120);

-- Bảng Player Items (Vật phẩm của người chơi)
CREATE TABLE player_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity CHECK (quantity >= 0),
    UNIQUE(user_id, item_id)
);

CREATE INDEX idx_player_items_user ON player_items(user_id);

-- Bảng Leaderboard (Bảng xếp hạng) - Có thể dùng materialized view
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    rank INTEGER,
    elo_rating INTEGER,
    total_games INTEGER,
    win_rate DECIMAL(5,2),
    wins INTEGER,
    losses INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaderboard_rank ON leaderboard(rank ASC);
CREATE INDEX idx_leaderboard_elo ON leaderboard(elo_rating DESC);

-- Function để tự động cập nhật leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS void AS $$
BEGIN
    DELETE FROM leaderboard;
    
    INSERT INTO leaderboard (user_id, rank, elo_rating, total_games, win_rate, wins, losses, updated_at)
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY elo_rating DESC) as rank,
        elo_rating,
        total_games,
        CASE 
            WHEN total_games > 0 THEN ROUND((wins::DECIMAL / total_games * 100), 2)
            ELSE 0
        END as win_rate,
        wins,
        losses,
        CURRENT_TIMESTAMP
    FROM users
    WHERE total_games > 0
    ORDER BY elo_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Tạo admin user mặc định (password: admin123)
INSERT INTO users (username, email, password_hash, elo_rating) VALUES
('admin', 'admin@battleship.com', '$2a$10$8Z9xK5X.7zB5Y8vN8HqJ5.2qP7xN5wE5K9LqT5Y9dM8F3vJ5E8K9e', 1500);

-- View để xem thống kê nhanh
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.elo_rating,
    u.wins,
    u.losses,
    u.draws,
    u.total_games,
    CASE 
        WHEN u.total_games > 0 THEN ROUND((u.wins::DECIMAL / u.total_games * 100), 2)
        ELSE 0
    END as win_rate,
    l.rank
FROM users u
LEFT JOIN leaderboard l ON u.id = l.user_id
ORDER BY u.elo_rating DESC;

-- Khởi tạo leaderboard
SELECT update_leaderboard();

