# 📁 Cấu trúc dự án BattleShip Network Game

## Tổng quan cấu trúc thư mục

```
BTL/
│
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── Login.jsx       # Login/Register form
│   │   │   ├── GameBoard.jsx   # Game board display
│   │   │   ├── PlayerList.jsx  # Online players list
│   │   │   └── ShipPlacement.jsx # Ship placement UI
│   │   │
│   │   ├── pages/              # Page Components
│   │   │   ├── Lobby.jsx       # Main lobby page
│   │   │   └── Game.jsx        # Game play page
│   │   │
│   │   ├── context/            # React Context
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── SocketContext.jsx  # WebSocket connection
│   │   │
│   │   ├── config/             # Configuration
│   │   │   └── api.js          # API & Axios setup
│   │   │
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # Entry point
│   │   ├── App.css             # Main styles
│   │   └── index.css           # Global styles
│   │
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Dependencies
│   ├── vite.config.js          # Vite configuration
│   └── index.html              # HTML template
│
├── backend/                     # NodeJS Backend Server
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── database.js     # PostgreSQL connection
│   │   │   └── redis.js        # Redis connection
│   │   │
│   │   ├── database/           # Database setup
│   │   │   ├── schema.sql      # Database schema
│   │   │   └── init.js         # Database initialization
│   │   │
│   │   ├── services/           # Business Logic
│   │   │   ├── authService.js      # Authentication logic
│   │   │   ├── userService.js      # User management
│   │   │   └── gameService.js      # Game logic
│   │   │
│   │   ├── controllers/        # Request Handlers
│   │   │   ├── authController.js   # Auth endpoints
│   │   │   ├── userController.js   # User endpoints
│   │   │   └── gameController.js   # Game endpoints
│   │   │
│   │   ├── middleware/         # Express Middleware
│   │   │   ├── auth.js             # JWT authentication
│   │   │   └── errorHandler.js     # Error handling
│   │   │
│   │   ├── routes/             # API Routes
│   │   │   ├── auth.js         # Auth routes
│   │   │   ├── users.js        # User routes
│   │   │   └── games.js        # Game routes
│   │   │
│   │   ├── socket/             # WebSocket
│   │   │   └── gameSocket.js   # Socket.IO handlers
│   │   │
│   │   └── index.js            # Server entry point
│   │
│   ├── .env.example            # Environment template
│   ├── package.json            # Dependencies
│   └── README.md               # Backend documentation
│
├── server/                      # C TCP Server (Optional)
│   ├── server.c                # Main C server code
│   ├── Makefile                # Build configuration
│   └── README.md               # C server documentation
│
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # Detailed setup guide
├── ARCHITECTURE.md             # Architecture documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── PROJECT_STRUCTURE.md        # This file
└── .gitignore                  # Git ignore rules
```

## Chi tiết các module

### 🎨 Frontend (React)

#### Components (`frontend/src/components/`)

| File | Mục đích | Props chính |
|------|----------|-------------|
| `Login.jsx` | Form đăng nhập/đăng ký | - |
| `GameBoard.jsx` | Hiển thị bàn cờ 10x10 | `board`, `onCellClick`, `isMyBoard` |
| `PlayerList.jsx` | Danh sách người chơi online | `onChallenge` |
| `ShipPlacement.jsx` | UI đặt tàu | `onComplete` |

#### Pages (`frontend/src/pages/`)

| File | Mục đích | Route |
|------|----------|-------|
| `Lobby.jsx` | Lobby chính, thách đấu | `/` |
| `Game.jsx` | Màn hình chơi game | `/game` |

#### Context (`frontend/src/context/`)

| File | State quản lý |
|------|---------------|
| `AuthContext.jsx` | `user`, `token`, `login()`, `logout()` |
| `SocketContext.jsx` | `socket`, `connected`, `onlinePlayers` |

#### Config (`frontend/src/config/`)

| File | Chức năng |
|------|-----------|
| `api.js` | Axios client, API endpoints, interceptors |

### ⚙️ Backend (NodeJS)

#### Config (`backend/src/config/`)

| File | Chức năng |
|------|-----------|
| `database.js` | PostgreSQL Pool, query helpers |
| `redis.js` | Redis client, helper functions |

#### Services (`backend/src/services/`)

| File | Business Logic |
|------|----------------|
| `authService.js` | Register, login, logout, JWT |
| `userService.js` | User CRUD, ELO rating, leaderboard |
| `gameService.js` | Game rooms, ship placement, attacks |

#### Controllers (`backend/src/controllers/`)

| File | HTTP Endpoints |
|------|----------------|
| `authController.js` | `/api/auth/*` |
| `userController.js` | `/api/users/*` |
| `gameController.js` | `/api/games/*` |

#### Routes (`backend/src/routes/`)

| File | Prefix | Protected |
|------|--------|-----------|
| `auth.js` | `/api/auth` | Partial |
| `users.js` | `/api/users` | Yes |
| `games.js` | `/api/games` | Yes |

#### Socket (`backend/src/socket/`)

| File | WebSocket Events |
|------|------------------|
| `gameSocket.js` | Challenge, attack, chat, etc. |

### 🗄️ Database

#### PostgreSQL Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | `username`, `elo_rating`, `wins` |
| `game_rooms` | Active games | `room_code`, `player1_id`, `player2_id` |
| `game_history` | Past games | `moves_history`, `winner_id` |
| `items` | Power-ups | `name`, `effect_type` |
| `player_items` | User items | `user_id`, `item_id`, `quantity` |
| `leaderboard` | Rankings | `rank`, `elo_rating` |

#### Redis Keys

| Pattern | Type | TTL | Purpose |
|---------|------|-----|---------|
| `session:{userId}` | Hash | 7 days | User session |
| `gamestate:{roomId}` | Hash | 2 hours | Current game |
| `socket:{userId}` | String | 24 hours | Socket mapping |
| `online:{userId}` | String | 5 min | Online status |

### 🔧 Server (C)

| File | Purpose |
|------|---------|
| `server.c` | TCP server implementation |
| `Makefile` | Compilation rules |

## Luồng dữ liệu chính

### 1. Authentication Flow

```
User Input
  ↓
Login.jsx
  ↓
authAPI.login()
  ↓
POST /api/auth/login
  ↓
authController.login()
  ↓
authService.login()
  ↓
PostgreSQL (verify user)
  ↓
Generate JWT
  ↓
Return token + user
  ↓
Store in AuthContext
  ↓
Redirect to Lobby
```

### 2. Challenge Flow

```
Lobby.jsx
  ↓
Click "Challenge" button
  ↓
socket.emit('game:challenge')
  ↓
gameSocket.handleChallenge()
  ↓
Find target socket
  ↓
socket.to(target).emit('game:challenge_received')
  ↓
Target user sees modal
  ↓
Accept/Decline
  ↓
socket.emit('game:challenge_response')
  ↓
Create game room (if accepted)
  ↓
socket.emit('game:started')
  ↓
Both navigate to /game
```

### 3. Game Flow

```
Game.jsx loads
  ↓
ShipPlacement phase
  ↓
Place all 5 ships
  ↓
socket.emit('game:place_ships')
  ↓
Wait for opponent
  ↓
Both ready → 'game:both_ready'
  ↓
Playing phase
  ↓
Your turn → Click opponent board
  ↓
socket.emit('game:attack')
  ↓
gameService.processAttack()
  ↓
Check hit/miss
  ↓
Update boards in Redis
  ↓
socket.emit('game:attack_result')
  ↓
Update UI
  ↓
Check game over
  ↓
If over → Update ELO → 'game:ended'
  ↓
Show result
```

## API Endpoints Summary

### Authentication

```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout (protected)
GET    /api/auth/verify        # Verify token (protected)
```

### Users

```
GET    /api/users/profile      # Get user profile (protected)
GET    /api/users/online       # List online players (protected)
GET    /api/users/leaderboard  # Get leaderboard (protected)
PUT    /api/users/status       # Update status (protected)
```

### Games

```
POST   /api/games/create           # Create room (protected)
POST   /api/games/join             # Join room (protected)
POST   /api/games/:id/place-ships  # Place ships (protected)
POST   /api/games/:id/attack       # Attack (protected)
GET    /api/games/history          # Get history (protected)
GET    /api/games/:id/replay       # Get replay (protected)
```

## WebSocket Events Summary

### Client → Server

```javascript
socket.emit('player:ready');
socket.emit('game:challenge', { targetUserId });
socket.emit('game:challenge_response', { challengerId, accepted });
socket.emit('game:place_ships', { roomId, ships });
socket.emit('game:attack', { roomId, x, y });
socket.emit('game:surrender', { roomId });
socket.emit('game:chat', { roomId, message });
```

### Server → Client

```javascript
socket.on('player:list_update', (data) => {});
socket.on('game:challenge_received', (data) => {});
socket.on('game:challenge_sent', () => {});
socket.on('game:challenge_declined', () => {});
socket.on('game:started', (data) => {});
socket.on('game:ships_placed', () => {});
socket.on('game:both_ready', (data) => {});
socket.on('game:attack_result', (data) => {});
socket.on('game:ended', (data) => {});
socket.on('game:chat_message', (data) => {});
socket.on('error', (error) => {});
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Backend (`.env`)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=battleship_db
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

TCP_SERVER_HOST=localhost
TCP_SERVER_PORT=8888

CORS_ORIGIN=http://localhost:5173
```

## Scripts Commands

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend

```bash
npm start        # Start production server
npm run dev      # Start development server (nodemon)
npm run init-db  # Initialize database
```

### C Server

```bash
make            # Compile server
make run        # Compile and run
make clean      # Clean build files
```

## Ports Used

| Service | Port | Purpose |
|---------|------|---------|
| React (Vite) | 5173 | Frontend dev server |
| NodeJS (Express) | 3000 | Backend API + WebSocket |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| C TCP Server | 8888 | Game server (optional) |

## Dependencies Summary

### Frontend Main Dependencies

```json
{
  "react": "19.2.0",
  "react-router-dom": "6.22.0",
  "socket.io-client": "4.6.1",
  "axios": "1.6.7",
  "react-hot-toast": "2.4.1"
}
```

### Backend Main Dependencies

```json
{
  "express": "4.18.2",
  "socket.io": "4.6.1",
  "pg": "8.11.0",
  "redis": "4.6.7",
  "jsonwebtoken": "9.0.2",
  "bcryptjs": "2.4.3",
  "cors": "2.8.5"
}
```

## File Size Estimates

```
BTL/
├── frontend/           ~50 MB (với node_modules)
│   ├── src/           ~50 KB
│   └── node_modules/  ~50 MB
│
├── backend/           ~30 MB (với node_modules)
│   ├── src/          ~100 KB
│   └── node_modules/ ~30 MB
│
└── server/           ~10 KB
    └── server.c      ~10 KB
```

## Code Statistics (Estimated)

```
Language         Files    Lines    Code
────────────────────────────────────────
JavaScript/JSX      25    3500    2800
SQL                  1     200     150
C                    1     400     300
Markdown             6    1500    1200
JSON                 4     150     150
────────────────────────────────────────
Total               37    5750    4600
```

---

📝 **Note**: Cấu trúc này được thiết kế để dễ mở rộng và bảo trì. Mỗi module có trách nhiệm riêng biệt theo nguyên tắc Separation of Concerns.

