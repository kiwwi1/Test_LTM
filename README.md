# 🚢 BattleShip Network Game

Trò chơi bắn thuyền (BattleShip) mạng đa người chơi, được xây dựng với kiến trúc Client-Server sử dụng **ReactJS**, **NodeJS**, và **C TCP Server**.

![BattleShip](https://img.shields.io/badge/Game-BattleShip-blue)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![Redis](https://img.shields.io/badge/Redis-7+-red)

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Kiến trúc](#kiến-trúc)
- [Cài đặt](#cài-đặt)
- [Sử dụng](#sử-dụng)
- [API Documentation](#api-documentation)
- [Phân công công việc](#phân-công-công-việc)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)

## 🎮 Tổng quan

BattleShip Network Game là phiên bản mở rộng của trò chơi "bắn thuyền" truyền thống, cho phép hai người chơi kết nối qua mạng TCP/IP để đấu với nhau.

### Luật chơi

1. Mỗi người chơi có một bảng 10x10 để đặt 5 loại tàu
2. Các tàu: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
3. Lần lượt tấn công vị trí đối thủ
4. Ai đánh chìm hết tàu của đối thủ trước sẽ thắng

## ✨ Tính năng

### Chức năng cơ bản

✅ **Hệ thống tài khoản**
- Đăng ký và đăng nhập
- Quản lý profile người chơi
- Lưu lịch sử trận đấu
- Hệ thống ELO rating

✅ **Gameplay**
- Đặt tàu trên bảng 10x10
- Tấn công lần lượt
- Hiển thị kết quả hit/miss real-time
- Kiểm tra thắng/thua tự động

✅ **Multiplayer**
- Kết nối TCP/IP
- Gửi lời thách đấu
- Chấp nhận/từ chối thách đấu
- Đầu hàng giữa chừng

✅ **Giao diện**
- Responsive design
- Real-time updates
- Beautiful UI với Tailwind CSS
- Toast notifications

### Tính năng nâng cao

🚀 **Chat trong game** - Trò chuyện với đối thủ trong trận đấu

🚀 **Replay system** - Xem lại các trận đấu đã chơi

🚀 **Leaderboard** - Bảng xếp hạng theo ELO

🚀 **Online players** - Xem danh sách người chơi online

🚀 **Game history** - Lịch sử trận đấu chi tiết

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         ReactJS Frontend (Port 5173)                 │   │
│  │  - Login/Register UI                                 │   │
│  │  - Game Board                                        │   │
│  │  - Lobby & Player List                               │   │
│  │  - Chat & Notifications                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           │ HTTP/WebSocket                    │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      NodeJS Backend Server (Port 3000)              │   │
│  │  - Express REST API                                  │   │
│  │  - Socket.IO for real-time                           │   │
│  │  - Business Logic                                    │   │
│  │  - Authentication (JWT)                              │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                    │                              │
│           │                    │                              │
│           ▼                    ▼                              │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │   PostgreSQL    │  │      Redis       │                  │
│  │  (Port 5432)    │  │   (Port 6379)    │                  │
│  │                 │  │                  │                  │
│  │  - Users        │  │  - Game State    │                  │
│  │  - Game History │  │  - Sessions      │                  │
│  │  - Leaderboard  │  │  - Online Users  │                  │
│  └─────────────────┘  └──────────────────┘                  │
│                                                               │
│                        Backend Layer                          │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ TCP/IP
                            ▼
┌───────────────────────────────────────────────────────────────┐
│               C TCP Server (Port 8888)                        │
│         [Optional - Demo/High Performance]                    │
└───────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu

1. **Client → NodeJS Backend**: HTTP REST API cho các thao tác cơ bản
2. **Client ↔ NodeJS Backend**: WebSocket (Socket.IO) cho real-time game updates
3. **NodeJS ↔ PostgreSQL**: Lưu trữ dữ liệu persistent
4. **NodeJS ↔ Redis**: Cache và game state real-time
5. **NodeJS ↔ C Server**: TCP protocol cho game logic (optional)

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js 18+ và npm
- PostgreSQL 15+
- Redis 7+
- GCC compiler (cho C server)
- Git

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd BTL
```

### Bước 2: Setup Database

#### PostgreSQL

```bash
# Tạo database
createdb battleship_db

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE battleship_db;
\q
```

#### Redis

```bash
# Windows: Tải từ https://github.com/microsoftarchive/redis/releases
# Hoặc dùng Docker
docker run -d -p 6379:6379 redis
```

### Bước 3: Setup Backend

```bash
cd backend

# Cài dependencies
npm install

# Copy environment file
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
# DB_HOST, DB_PASSWORD, JWT_SECRET, etc.

# Khởi tạo database
npm run init-db

# Chạy server
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### Bước 4: Setup Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Copy environment file
cp .env.example .env

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

### Bước 5: Setup C Server (Optional)

```bash
cd server

# Compile
make

# Chạy
make run
```

C Server sẽ chạy tại port `8888`

## 🚀 Sử dụng

### 1. Đăng ký/Đăng nhập

- Mở trình duyệt và truy cập `http://localhost:5173`
- Đăng ký tài khoản mới hoặc đăng nhập
- Account demo: `admin` / `admin123`

### 2. Lobby

- Xem danh sách người chơi online
- Xem bảng xếp hạng
- Gửi lời thách đấu hoặc chấp nhận thách đấu

### 3. Đặt tàu

- Chọn tàu muốn đặt
- Click vào bảng để đặt
- Chuyển hướng ngang/dọc bằng nút Direction
- Click "Ready!" khi đã đặt xong 5 tàu

### 4. Chơi game

- Chờ đến lượt của bạn
- Click vào ô trên bảng đối thủ để tấn công
- Theo dõi kết quả hit/miss
- Chat với đối thủ
- Có thể đầu hàng bất cứ lúc nào

### 5. Kết thúc

- Xem kết quả thắng/thua
- Xem thay đổi ELO rating
- Quay lại lobby để chơi tiếp

## 📚 API Documentation

### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "password123"
}
```

### Users

```http
GET /api/users/profile
Authorization: Bearer <token>
```

```http
GET /api/users/online
Authorization: Bearer <token>
```

```http
GET /api/users/leaderboard?limit=50
Authorization: Bearer <token>
```

### Games

```http
GET /api/games/history?limit=20
Authorization: Bearer <token>
```

```http
GET /api/games/:gameId/replay
Authorization: Bearer <token>
```

### WebSocket Events

#### Client → Server

- `player:ready` - Người chơi sẵn sàng
- `game:challenge` - Gửi lời thách đấu
- `game:challenge_response` - Phản hồi thách đấu
- `game:place_ships` - Đặt tàu
- `game:attack` - Tấn công
- `game:surrender` - Đầu hàng
- `game:chat` - Chat

#### Server → Client

- `player:list_update` - Cập nhật danh sách người chơi
- `game:challenge_received` - Nhận lời thách đấu
- `game:started` - Game bắt đầu
- `game:attack_result` - Kết quả tấn công
- `game:ended` - Game kết thúc
- `game:chat_message` - Tin nhắn chat

## 👥 Phân công công việc

### Đặng Quang Huy - Module "Tài khoản + Kết nối + Quản lý người chơi"

**Tính năng đã hoàn thành:**

1. ✅ Xử lý luồng (Stream handling) - 1 điểm
2. ✅ Cài đặt cơ chế I/O qua socket (1/2 phần) - 1 điểm
3. ✅ Đăng ký và quản lý tài khoản - 2 điểm
4. ✅ Đăng nhập và quản lý phiên làm việc - 2 điểm
5. ✅ Hiển thị danh sách người chơi sẵn sàng - 2 điểm
6. ✅ Gửi lời thách đấu - 2 điểm
7. ✅ Chấp nhận / Từ chối lời thách đấu - 1 điểm
8. ✅ Truyền kết quả và log trận đấu - 2 điểm
9. ✅ Triển khai hệ thống tính điểm - 2 điểm
10. ✅ Tính năng nâng cao (phần 1) - 2 điểm

**Tổng điểm: 17/17 điểm**

### Lê Bá Ngọc Hiểu - Module "Trận đấu + Gameplay"

**Tính năng đã hoàn thành:**

1. ✅ Cài đặt cơ chế I/O qua socket (1/2 phần) - 1 điểm
2. ✅ Truyền thông tin nước đi - 2 điểm
3. ✅ Kiểm tra tính hợp lệ của nước đi - 2 điểm
4. ✅ Xác định kết quả trận đấu - 1 điểm
5. ✅ Lưu thông tin và xem lại (replay) - 2 điểm
6. ✅ Đầu hàng / đề nghị hòa - 1 điểm
7. ✅ Yêu cầu đấu lại - 1 điểm
8. ✅ Tính năng nâng cao (phần 2) - 2 điểm
   - Chat trong trận
   - Kết bạn
9. ✅ Giao diện đồ họa người dùng - 3 điểm

**Tổng điểm: 15/15 điểm**

## 🛠️ Công nghệ sử dụng

### Frontend

- **React 19.2.0** - UI Library
- **React Router** - Routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend

- **Node.js & Express** - Server framework
- **Socket.IO** - WebSocket server
- **PostgreSQL** - Primary database
- **Redis** - Cache & real-time data
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### C Server

- **Winsock2** - TCP socket programming
- **JSON** - Data format

## 📖 Cơ sở lý thuyết

### 1. Ma trận 2D (Grid)

Bàn chơi được biểu diễn bằng ma trận 2D kích thước 10x10:
- `0` = ô trống
- `1` = có tàu
- `2` = bắn trượt (miss)
- `3` = bắn trúng (hit)

### 2. Đặt tàu

- Mỗi tàu có kích thước cố định
- Có thể đặt theo hướng ngang hoặc dọc
- Kiểm tra va chạm khi đặt
- Không được đè lên nhau

### 3. Luật chơi

- Mỗi lượt bắn 1 lần
- Chuyển lượt giữa hai người chơi
- Kết thúc khi một bên mất hết tàu

### 4. Giao thức mạng

- **TCP**: Đảm bảo kết nối tin cậy
- **JSON**: Format dữ liệu dễ parse
- **WebSocket**: Real-time bidirectional communication

### 5. Kiến trúc phần mềm

- **Separation of Concerns**: Tách biệt logic, data, presentation
- **REST API**: Stateless API design
- **Event-driven**: Socket events cho real-time features

### 6. ELO Rating System

Sử dụng công thức ELO chuẩn để tính điểm:
```
New Rating = Old Rating + K × (Actual Score - Expected Score)
```

Với K-factor = 32

## 📝 Giao thức truyền thông

### Cấu trúc tin nhắn

```json
{
  "cmd": "COMMAND_NAME",
  "payload": {
    // data
  }
}
```

### Các lệnh chính

| Lệnh | Mô tả | Dữ liệu |
|------|-------|---------|
| `REGISTER` | Đăng ký tài khoản | `{username, password, email}` |
| `LOGIN` | Đăng nhập | `{username, password}` |
| `PLAYER_LIST` | Danh sách người chơi | `{players: [...]}` |
| `CHALLENGE` | Gửi thách đấu | `{target_id}` |
| `CHALLENGE_REPLY` | Phản hồi thách đấu | `{challenger_id, status}` |
| `PLACE_SHIP` | Đặt tàu | `{ships: [...]}` |
| `MOVE` | Tấn công | `{coord: [x, y]}` |
| `MOVE_RESULT` | Kết quả tấn công | `{coord, result, ship_sunk}` |
| `GAME_END` | Kết thúc game | `{result, log_id}` |
| `CHAT` | Chat | `{message}` |

## 🔧 Troubleshooting

### Backend không kết nối được PostgreSQL

```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432

# Kiểm tra credentials trong .env
```

### Frontend không kết nối được Backend

```bash
# Kiểm tra backend đang chạy
curl http://localhost:3000/health

# Kiểm tra CORS settings
```

### WebSocket không kết nối

```bash
# Kiểm tra firewall
# Kiểm tra port 3000 có mở không
netstat -ano | findstr :3000
```

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập.

## 👨‍💻 Contributors

- **Đặng Quang Huy** - Backend & Networking
- **Lê Bá Ngọc Hiểu** - Frontend & Game Logic

---

Made with ❤️ for Network Programming Course

# Test_LTM
