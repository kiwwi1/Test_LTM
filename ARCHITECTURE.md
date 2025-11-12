# 🏗️ Kiến trúc hệ thống BattleShip Network Game

## Tổng quan kiến trúc

BattleShip Network Game sử dụng kiến trúc **Client-Server** với 3 tầng chính:

1. **Presentation Layer (Frontend)** - ReactJS
2. **Application Layer (Backend)** - NodeJS
3. **Data Layer** - PostgreSQL + Redis

## Sơ đồ kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT SIDE                              │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    React Application                        │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Login      │  │    Lobby     │  │     Game     │    │  │
│  │  │  Component   │  │  Component   │  │  Component   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  GameBoard   │  │ PlayerList   │  │ ShipPlace    │    │  │
│  │  │  Component   │  │  Component   │  │  Component   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │              Context Providers                      │   │  │
│  │  │  - AuthContext (JWT, User state)                   │   │  │
│  │  │  - SocketContext (WebSocket connection)            │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │              API Layer                              │   │  │
│  │  │  - Axios HTTP client                                │   │  │
│  │  │  - Socket.IO client                                 │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             │
┌────────────────────────────┼───────────────────────────────────────┐
│                            ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │               NodeJS Express Server                        │   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │                  Middleware Layer                     │ │   │
│  │  │  - CORS                                               │ │   │
│  │  │  - Body Parser                                        │ │   │
│  │  │  - JWT Authentication                                 │ │   │
│  │  │  - Error Handler                                      │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Auth       │  │    User      │  │    Game      │    │   │
│  │  │  Routes      │  │   Routes     │  │   Routes     │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │         │                 │                  │             │   │
│  │         ▼                 ▼                  ▼             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Auth       │  │    User      │  │    Game      │    │   │
│  │  │ Controllers  │  │ Controllers  │  │ Controllers  │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │         │                 │                  │             │   │
│  │         ▼                 ▼                  ▼             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Auth       │  │    User      │  │    Game      │    │   │
│  │  │  Services    │  │  Services    │  │  Services    │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │                                                             │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │            Socket.IO Server                        │   │   │
│  │  │  - Game events handling                            │   │   │
│  │  │  - Real-time communication                         │   │   │
│  │  │  - Room management                                 │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                       │                    │                        │
│                       │                    │                        │
└───────────────────────┼────────────────────┼────────────────────────┘
                        │                    │
                        ▼                    ▼
        ┌───────────────────────┐  ┌──────────────────┐
        │    PostgreSQL         │  │      Redis       │
        │                       │  │                  │
        │  ┌─────────────────┐ │  │  ┌────────────┐ │
        │  │ users           │ │  │  │ Sessions   │ │
        │  │ game_rooms      │ │  │  │ Game State │ │
        │  │ game_history    │ │  │  │ Online     │ │
        │  │ items           │ │  │  │ Users      │ │
        │  │ player_items    │ │  │  │ Sockets    │ │
        │  │ leaderboard     │ │  │  └────────────┘ │
        │  └─────────────────┘ │  │                  │
        └───────────────────────┘  └──────────────────┘
```

## Chi tiết các tầng

### 1. Frontend (React)

#### Cấu trúc thư mục
```
frontend/src/
├── components/          # Reusable components
│   ├── Login.jsx
│   ├── GameBoard.jsx
│   ├── PlayerList.jsx
│   └── ShipPlacement.jsx
├── pages/              # Page components
│   ├── Lobby.jsx
│   └── Game.jsx
├── context/            # React Context
│   ├── AuthContext.jsx
│   └── SocketContext.jsx
├── config/             # Configuration
│   └── api.js
└── App.jsx             # Main app component
```

#### Luồng dữ liệu (Data Flow)

```
User Action → Component → Context → API/Socket → Backend
                ↑                                    ↓
                └────────────── Response ────────────┘
```

#### State Management

- **AuthContext**: Quản lý authentication state (user, token)
- **SocketContext**: Quản lý WebSocket connection
- **Component State**: Local state cho UI

### 2. Backend (NodeJS)

#### Cấu trúc thư mục
```
backend/src/
├── config/             # Configuration
│   ├── database.js     # PostgreSQL config
│   └── redis.js        # Redis config
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── userController.js
│   └── gameController.js
├── services/           # Business logic
│   ├── authService.js
│   ├── userService.js
│   └── gameService.js
├── middleware/         # Express middleware
│   ├── auth.js
│   └── errorHandler.js
├── routes/             # API routes
│   ├── auth.js
│   ├── users.js
│   └── games.js
├── socket/             # WebSocket handlers
│   └── gameSocket.js
└── index.js            # Entry point
```

#### Request Flow

```
HTTP Request
    ↓
Express Router
    ↓
Middleware (CORS, Auth)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Database/Redis
    ↓
Response
```

#### WebSocket Flow

```
Client connects
    ↓
Authentication
    ↓
Join rooms
    ↓
Listen to events
    ↓
Emit events to clients
```

### 3. Database Layer

#### PostgreSQL Schema

```sql
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── elo_rating
├── wins, losses, draws
└── status

game_rooms
├── id (PK)
├── room_code (UNIQUE)
├── player1_id (FK)
├── player2_id (FK)
├── status
└── winner_id (FK)

game_history
├── id (PK)
├── room_id (FK)
├── player1_id (FK)
├── player2_id (FK)
├── winner_id (FK)
├── moves_history (JSONB)
└── played_at

items
├── id (PK)
├── name
├── effect_type
└── effect_data (JSONB)

player_items
├── id (PK)
├── user_id (FK)
├── item_id (FK)
└── quantity

leaderboard
├── id (PK)
├── user_id (FK)
├── rank
└── elo_rating
```

#### Redis Data Structure

```
Key Pattern                    Type      Purpose
─────────────────────────────────────────────────────
session:{userId}               Hash      User session
gamestate:{roomId}             Hash      Current game state
socket:{userId}                String    Socket ID mapping
online:{userId}                String    Online status
user:{userId}:game             Hash      User's current game
```

## Giao thức giao tiếp

### HTTP REST API

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify

Users:
GET    /api/users/profile
GET    /api/users/online
GET    /api/users/leaderboard

Games:
POST   /api/games/create
POST   /api/games/join
POST   /api/games/:roomId/place-ships
POST   /api/games/:roomId/attack
GET    /api/games/history
GET    /api/games/:gameId/replay
```

### WebSocket Events

```
Client → Server:
- player:ready
- game:challenge
- game:challenge_response
- game:place_ships
- game:attack
- game:surrender
- game:chat

Server → Client:
- player:list_update
- game:challenge_received
- game:challenge_sent
- game:challenge_declined
- game:started
- game:ships_placed
- game:both_ready
- game:attack_result
- game:ended
- game:chat_message
- error
```

## Security

### Authentication Flow

```
1. User login → Backend validates credentials
2. Backend generates JWT token
3. Token sent to client
4. Client stores token in localStorage
5. Client includes token in all requests
6. Backend verifies token in middleware
7. Request proceeds if valid
```

### JWT Token Structure

```json
{
  "userId": 123,
  "iat": 1234567890,
  "exp": 1234567890
}
```

### WebSocket Authentication

```javascript
// Client
socket = io(URL, {
  auth: {
    token: jwt_token
  }
});

// Server
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  verify(token);
  next();
});
```

## Scaling Considerations

### Horizontal Scaling

- **Backend**: Multiple NodeJS instances behind load balancer
- **Redis**: Redis Cluster hoặc Sentinel
- **PostgreSQL**: Master-Slave replication

### Caching Strategy

- **Redis** cache cho:
  - User sessions
  - Game state (temporary)
  - Online users list
  - Socket mappings

- **PostgreSQL** cho:
  - User profiles
  - Game history
  - Leaderboard
  - Items

### Performance Optimization

1. **Database Indexing**
   - Index on username, email
   - Index on elo_rating (for leaderboard)
   - Index on game_history.played_at

2. **Connection Pooling**
   - PostgreSQL pool size: 20
   - Redis connection reuse

3. **WebSocket Rooms**
   - Players join room for their game
   - Broadcast only to relevant players

## Error Handling

### API Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### WebSocket Error

```javascript
socket.emit('error', {
  message: 'Error description',
  code: 'ERROR_CODE'
});
```

## Monitoring & Logging

### Logs

- Request/Response logs
- Error logs
- Game events logs
- Connection logs

### Metrics

- Active users
- Games in progress
- Response time
- Error rate

## Deployment

### Development

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
PostgreSQL: localhost:5432
Redis: localhost:6379
```

### Production

```
Frontend: HTTPS + CDN
Backend:  HTTPS + Load Balancer
Database: Managed PostgreSQL
Redis:    Managed Redis
```

## Testing Strategy

### Unit Tests

- Services logic
- Controllers
- Utility functions

### Integration Tests

- API endpoints
- Database operations
- Socket events

### E2E Tests

- User registration flow
- Game play flow
- Chat functionality

## Future Improvements

1. **Microservices**
   - Split services: Auth, Game, Chat
   - API Gateway

2. **Message Queue**
   - RabbitMQ/Kafka for async tasks
   - Game history processing

3. **Analytics**
   - Game statistics
   - User behavior tracking

4. **Mobile App**
   - React Native version
   - Same backend API

5. **AI Opponent**
   - Single player mode
   - Difficulty levels

