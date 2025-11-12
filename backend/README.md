# BattleShip Backend Server

NodeJS backend cho BattleShip Network Game - Đóng vai trò trung gian giữa React frontend và C TCP server.

## Cài đặt

### 1. Cài dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Copy file `.env.example` thành `.env` và điều chỉnh các giá trị:
```bash
cp .env.example .env
```

### 3. Cài đặt PostgreSQL
- Tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/
- Tạo database:
```sql
CREATE DATABASE battleship_db;
```

### 4. Cài đặt Redis
- Windows: Tải từ https://github.com/microsoftarchive/redis/releases
- Hoặc dùng Docker: `docker run -p 6379:6379 redis`

### 5. Khởi tạo Database
```bash
npm run init-db
```

### 6. Chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Cấu trúc Project

```
backend/
├── src/
│   ├── index.js                 # Entry point
│   ├── config/
│   │   ├── database.js         # PostgreSQL config
│   │   └── redis.js            # Redis config
│   ├── database/
│   │   ├── init.js             # Database initialization
│   │   └── schema.sql          # SQL schema
│   ├── services/
│   │   ├── authService.js      # Authentication logic
│   │   ├── userService.js      # User management
│   │   ├── gameService.js      # Game logic
│   │   └── tcpClientService.js # Communication với C server
│   ├── controllers/
│   │   ├── authController.js   # Auth endpoints
│   │   ├── userController.js   # User endpoints
│   │   └── gameController.js   # Game endpoints
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── errorHandler.js     # Error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── games.js
│   └── socket/
│       └── gameSocket.js       # WebSocket handlers
├── package.json
└── .env
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `GET /api/users/online` - Danh sách người chơi online
- `GET /api/users/leaderboard` - Bảng xếp hạng

### Games
- `POST /api/games/challenge` - Gửi lời thách đấu
- `POST /api/games/accept` - Chấp nhận thách đấu
- `GET /api/games/history` - Lịch sử trận đấu
- `GET /api/games/:id/replay` - Xem lại trận đấu

## WebSocket Events

### Client → Server
- `player:ready` - Người chơi sẵn sàng
- `game:place_ships` - Đặt tàu
- `game:attack` - Tấn công
- `game:surrender` - Đầu hàng
- `game:chat` - Chat trong game

### Server → Client
- `player:list_update` - Cập nhật danh sách người chơi
- `game:challenge_received` - Nhận lời thách đấu
- `game:started` - Game bắt đầu
- `game:attack_result` - Kết quả tấn công
- `game:ended` - Game kết thúc
- `game:chat_message` - Tin nhắn chat

## Giao thức với C TCP Server

Backend NodeJS giao tiếp với C TCP server thông qua JSON messages:

```json
{
  "cmd": "COMMAND_NAME",
  "payload": {
    // Data here
  }
}
```

Xem chi tiết trong `src/services/tcpClientService.js`

