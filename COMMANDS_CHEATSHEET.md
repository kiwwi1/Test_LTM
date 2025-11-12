# 📋 Commands Cheat Sheet

Tổng hợp các lệnh hay dùng cho BattleShip Game.

## 🗄️ PostgreSQL Commands

### Kết nối Database

```bash
# Kết nối vào PostgreSQL
psql -U postgres

# Kết nối vào database cụ thể
psql -U postgres -d battleship_db

# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432
```

### Quản lý Database

```bash
# Trong psql:

# Liệt kê tất cả databases
\l

# Kết nối vào database khác
\c battleship_db

# Liệt kê tất cả tables
\dt

# Xem cấu trúc table
\d users

# Xem dữ liệu trong table
SELECT * FROM users;
SELECT * FROM items;
SELECT * FROM leaderboard;

# Đếm số lượng records
SELECT COUNT(*) FROM users;

# Thoát
\q
```

### Database Operations

```bash
# Tạo database
CREATE DATABASE battleship_db;

# Xóa database (⚠️ Cẩn thận!)
DROP DATABASE battleship_db;

# Backup database
pg_dump -U postgres battleship_db > backup.sql

# Restore database
psql -U postgres battleship_db < backup.sql
```

### Useful Queries

```sql
-- Xem tất cả users và ELO
SELECT username, elo_rating, wins, losses 
FROM users 
ORDER BY elo_rating DESC;

-- Xem leaderboard top 10
SELECT * FROM leaderboard 
ORDER BY rank ASC 
LIMIT 10;

-- Xem các trận đấu gần đây
SELECT gh.*, 
       p1.username as player1,
       p2.username as player2,
       w.username as winner
FROM game_history gh
JOIN users p1 ON gh.player1_id = p1.id
JOIN users p2 ON gh.player2_id = p2.id
LEFT JOIN users w ON gh.winner_id = w.id
ORDER BY gh.played_at DESC
LIMIT 10;

-- Xem phòng chơi đang hoạt động
SELECT * FROM game_rooms 
WHERE status = 'PLAYING';

-- Reset ELO của user
UPDATE users 
SET elo_rating = 1000, wins = 0, losses = 0 
WHERE username = 'username_here';

-- Xóa tất cả game history (⚠️ Cẩn thận!)
TRUNCATE TABLE game_history CASCADE;
```

## 🔴 Redis Commands

### Kết nối Redis

```bash
# Kết nối vào Redis CLI
redis-cli

# Test connection
redis-cli ping

# Kiểm tra Redis info
redis-cli info
```

### Redis Operations

```bash
# Trong redis-cli:

# Test kết nối
PING

# Xem tất cả keys
KEYS *

# Xem giá trị của key
GET session:1

# Xem TTL (time to live) của key
TTL session:1

# Xóa key
DEL session:1

# Xóa tất cả keys (⚠️ Cẩn thận!)
FLUSHALL

# Thoát
EXIT
```

### Debug Redis

```bash
# Xem game state
redis-cli GET gamestate:1

# Xem sessions
redis-cli KEYS "session:*"

# Xem online users
redis-cli KEYS "online:*"

# Xem socket mappings
redis-cli KEYS "socket:*"
```

## 📦 NPM Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Initialize database
npm run init-db

# Check setup
npm run check-setup
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔧 Service Management (Windows)

### PostgreSQL

```bash
# Kiểm tra status
sc query postgresql-x64-15

# Start service
net start postgresql-x64-15

# Stop service
net stop postgresql-x64-15

# Restart service
net stop postgresql-x64-15 && net start postgresql-x64-15
```

### Redis

```bash
# Kiểm tra status
sc query Redis

# Start service
net start Redis

# Stop service
net stop Redis
```

## 🐳 Docker Commands

### Redis trong Docker

```bash
# Pull image
docker pull redis

# Run Redis container
docker run -d -p 6379:6379 --name battleship-redis redis

# Start container
docker start battleship-redis

# Stop container
docker stop battleship-redis

# View logs
docker logs battleship-redis

# Remove container
docker rm battleship-redis
```

### PostgreSQL trong Docker (Alternative)

```bash
# Run PostgreSQL container
docker run -d \
  --name battleship-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=battleship_db \
  -p 5432:5432 \
  postgres:15

# Start container
docker start battleship-postgres

# Stop container
docker stop battleship-postgres

# Connect to PostgreSQL
docker exec -it battleship-postgres psql -U postgres -d battleship_db
```

## 🛠️ Development Commands

### Git Commands

```bash
# Check status
git status

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/new-feature

# Add changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature
```

### Debug Commands

```bash
# View backend logs
cd backend
npm run dev
# Logs sẽ hiện trong terminal

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/users/leaderboard

# Test with data
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Port Management

```bash
# Xem ports đang dùng
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379
netstat -ano | findstr :5173

# Kill process theo PID
taskkill /PID <process_id> /F
```

## 🧹 Cleanup Commands

### Clear Node Modules

```bash
# Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Reset Database

```bash
# Drop và tạo lại database
psql -U postgres
DROP DATABASE battleship_db;
CREATE DATABASE battleship_db;
\q

# Khởi tạo lại
cd backend
npm run init-db
```

### Clear Redis

```bash
redis-cli FLUSHALL
```

## 🔍 Troubleshooting Commands

### Check Services

```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping

# Backend
curl http://localhost:3000/health

# Frontend
curl http://localhost:5173
```

### View Logs

```bash
# Backend logs (trong terminal đang chạy npm run dev)

# PostgreSQL logs
# Windows: C:\Program Files\PostgreSQL\15\data\log\

# Redis logs (nếu chạy dưới service)
# Windows Event Viewer
```

### Network Debug

```bash
# Test kết nối
ping localhost

# Test port
telnet localhost 3000
telnet localhost 5432

# View active connections
netstat -ano | findstr ESTABLISHED
```

## 📊 Performance Monitoring

### Database Stats

```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT * FROM pg_stat_activity;

-- Slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Redis Stats

```bash
# Memory usage
redis-cli INFO memory

# Stats
redis-cli INFO stats

# Clients
redis-cli CLIENT LIST
```

## 🎯 Quick Actions

### Reset Everything

```bash
# 1. Stop all services
# Ctrl+C trong các terminals

# 2. Clear databases
psql -U postgres
DROP DATABASE battleship_db;
CREATE DATABASE battleship_db;
\q

redis-cli FLUSHALL

# 3. Reinitialize
cd backend
npm run init-db

# 4. Start again
npm run dev
```

### Quick Test

```bash
# Test full stack
cd backend && npm run check-setup
```

### Create New User (CLI)

```sql
-- Trong psql
INSERT INTO users (username, email, password_hash)
VALUES ('player2', 'player2@example.com', '$2a$10$8Z9xK5X.7zB5Y8vN8HqJ5.2qP7xN5wE5K9LqT5Y9dM8F3vJ5E8K9e');
-- Password: admin123
```

## 💡 Tips & Tricks

### Generate JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Quick Backup

```bash
# Backup database
pg_dump -U postgres battleship_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup .env
copy .env .env.backup
```

### View Environment Variables

```bash
# PowerShell
Get-Content .env

# CMD
type .env
```

## 📞 Help Commands

```bash
# PostgreSQL help
psql --help
psql -U postgres -c "\?"

# Redis help
redis-cli --help

# NPM help
npm help

# Node version
node --version
npm --version
```

---

**💡 Pro Tip**: Bookmark file này để tra cứu nhanh các lệnh thường dùng!

