# 🌐 Cross-Platform Guide

Hướng dẫn chạy BattleShip Game trên nhiều nền tảng.

## 📋 Tổng quan

Dự án hỗ trợ:
- ✅ **Windows** (7, 8, 10, 11)
- ✅ **Linux** (Ubuntu, Debian, CentOS, Arch, etc.)
- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Docker** (All platforms)

## 🏗️ Kiến trúc theo Platform

### Windows

```
┌──────────────────────────────────────┐
│         Frontend (React)              │
│         Port: 5173                    │
│         Browser: Chrome/Edge/Firefox  │
└────────────┬─────────────────────────┘
             │ HTTP/WebSocket
┌────────────▼─────────────────────────┐
│      Backend (NodeJS)                 │
│      Port: 3000                       │
│      Runtime: Node.js for Windows     │
└────┬────────────────────────┬────────┘
     │                        │
     ▼                        ▼
┌─────────────┐      ┌────────────────┐
│ PostgreSQL  │      │     Redis      │
│ Port: 5432  │      │   Port: 6379   │
│ (Windows)   │      │   (Windows)    │
└─────────────┘      └────────────────┘
     │
     │ Optional
     ▼
┌────────────────┐
│  C TCP Server  │
│  Port: 8888    │
│  (Winsock2)    │
└────────────────┘
```

### Linux

```
┌──────────────────────────────────────┐
│         Frontend (React)              │
│         Port: 5173                    │
│         Browser: Firefox/Chrome       │
└────────────┬─────────────────────────┘
             │ HTTP/WebSocket
┌────────────▼─────────────────────────┐
│      Backend (NodeJS)                 │
│      Port: 3000                       │
│      Runtime: Node.js for Linux       │
└────┬────────────────────────┬────────┘
     │                        │
     ▼                        ▼
┌─────────────┐      ┌────────────────┐
│ PostgreSQL  │      │     Redis      │
│ Port: 5432  │      │   Port: 6379   │
│ (Native)    │      │   (Native)     │
└─────────────┘      └────────────────┘
     │
     │ Optional
     ▼
┌────────────────┐
│  C TCP Server  │
│  Port: 8888    │
│  (BSD Sockets) │
└────────────────┘
```

## 🪟 Setup trên Windows

### Yêu cầu

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/windows/))
- Redis ([Download](https://github.com/microsoftarchive/redis/releases))
- GCC (MSYS2) - Optional cho C server

### Cài đặt nhanh

```powershell
# 1. PostgreSQL
# Download và install từ website
# Password: postgres123

# 2. Redis
# Download Redis-x64-3.0.504.msi và install

# 3. Backend
cd backend
npm install
copy .env.example .env
# Edit .env với notepad
npm run init-db
npm run dev

# 4. Frontend (terminal mới)
cd frontend
npm install
npm run dev

# 5. C Server (optional, terminal mới)
cd server
make
.\server.exe
```

### Troubleshooting Windows

**❌ "psql is not recognized"**
```powershell
# Thêm vào PATH
setx PATH "%PATH%;C:\Program Files\PostgreSQL\15\bin"
```

**❌ "Redis connection refused"**
```powershell
# Start Redis service
net start Redis
```

**❌ Port đã được sử dụng**
```powershell
# Tìm process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

## 🐧 Setup trên Linux

### Ubuntu/Debian

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql redis-server build-essential

# 2. Setup PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE battleship_db;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';"

# 3. Start services
sudo systemctl start postgresql
sudo systemctl start redis

# 4. Backend
cd backend
npm install
cp .env.example .env
# Edit .env
nano .env
npm run init-db
npm run dev

# 5. Frontend (terminal mới)
cd frontend
npm install
npm run dev

# 6. C Server (optional, terminal mới)
cd server
make
./server
```

### CentOS/RHEL

```bash
# 1. Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 2. Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Install Redis
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis

# 4. Install build tools
sudo yum groupinstall "Development Tools"

# Continue with backend setup...
```

### Arch Linux

```bash
# 1. Install packages
sudo pacman -S nodejs npm postgresql redis base-devel

# 2. Initialize PostgreSQL
sudo -u postgres initdb -D /var/lib/postgres/data

# 3. Start services
sudo systemctl start postgresql
sudo systemctl start redis

# Continue with backend setup...
```

### Troubleshooting Linux

**❌ "Permission denied" cho port < 1024**
```bash
# Dùng port >= 1024 (mặc định là OK)
# Hoặc dùng sudo (không khuyến khích)
sudo node src/index.js
```

**❌ PostgreSQL authentication failed**
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Đổi dòng:
# local   all             postgres                                peer
# Thành:
# local   all             postgres                                md5

# Restart
sudo systemctl restart postgresql
```

**❌ Redis not starting**
```bash
# Check status
sudo systemctl status redis

# Check logs
sudo journalctl -u redis -f

# Restart
sudo systemctl restart redis
```

## 🍎 Setup trên macOS

### Cài đặt với Homebrew

```bash
# 1. Install Homebrew (nếu chưa có)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install dependencies
brew install node postgresql@15 redis

# 3. Start services
brew services start postgresql@15
brew services start redis

# 4. Create database
createdb battleship_db

# 5. Backend
cd backend
npm install
cp .env.example .env
npm run init-db
npm run dev

# 6. Frontend
cd frontend
npm install
npm run dev

# 7. C Server (optional)
cd server
make
./server
```

### Troubleshooting macOS

**❌ "command not found: brew"**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**❌ PostgreSQL không start**
```bash
# Remove old data
rm -rf /usr/local/var/postgres

# Initialize
initdb /usr/local/var/postgres

# Start
brew services start postgresql@15
```

## 🐳 Setup với Docker

### Docker Compose (All platforms)

Tạo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: battleship_db
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Chạy:

```bash
# Start tất cả services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📊 So sánh Platform

| Feature | Windows | Linux | macOS | Docker |
|---------|---------|-------|-------|--------|
| **Setup Difficulty** | Medium | Easy | Easy | Easiest |
| **Performance** | Good | Excellent | Excellent | Good |
| **PostgreSQL** | Native | Native | Homebrew | Container |
| **Redis** | MSI | Native | Homebrew | Container |
| **C Server** | Winsock2 | BSD Sockets | BSD Sockets | - |
| **Development** | ✅ | ✅ | ✅ | ✅ |
| **Production** | ✅ | ✅✅ | ✅ | ✅✅ |

**Recommended:**
- **Development**: Windows hoặc Linux
- **Production**: Linux + Docker

## 🔄 Cross-compilation

### Compile cho Windows trên Linux

```bash
# Install mingw
sudo apt install mingw-w64

# Compile C server
cd server
x86_64-w64-mingw32-gcc -o server.exe server.c -lws2_32
```

### Compile cho Linux trên Windows (WSL2)

```bash
# Install WSL2
wsl --install

# Trong WSL Ubuntu
sudo apt update
sudo apt install build-essential
cd /mnt/e/Code/LTM/BTL/server
make
```

## 🌍 Environment Variables

### Windows (.env)
```env
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Linux (.env)
```env
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Docker (.env)
```env
DB_HOST=postgres
DB_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
```

## 🚀 Quick Start per Platform

### Windows (PowerShell)
```powershell
# All-in-one
cd backend && npm install && npm run init-db && start npm run dev
cd ../frontend && npm install && start npm run dev
```

### Linux (Bash)
```bash
# All-in-one
cd backend && npm install && npm run init-db && npm run dev &
cd ../frontend && npm install && npm run dev &
```

### macOS (Zsh)
```zsh
# All-in-one
cd backend && npm install && npm run init-db && npm run dev &
cd ../frontend && npm install && npm run dev &
```

### Docker
```bash
# All-in-one
docker-compose up -d
```

## 📝 Platform-specific Notes

### Windows
- Dùng PowerShell hoặc CMD
- Path separator: `\`
- Line ending: CRLF
- Firewall: Cho phép port 3000, 5173, 8888

### Linux
- Dùng Bash
- Path separator: `/`
- Line ending: LF
- Firewall: `sudo ufw allow 3000,5173,8888/tcp`

### macOS
- Dùng Zsh (default) hoặc Bash
- Path separator: `/`
- Line ending: LF
- Firewall: System Preferences → Security & Privacy

## 🎯 Production Deployment

### Linux Server (Recommended)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clone project
git clone <repo>
cd BTL

# 3. Setup backend
cd backend
npm ci --production
cp .env.example .env
# Edit .env for production
npm run init-db

# 4. Use PM2
npm install -g pm2
pm2 start src/index.js --name battleship-backend
pm2 startup
pm2 save

# 5. Build frontend
cd ../frontend
npm ci
npm run build

# 6. Serve với nginx
sudo apt install nginx
# Copy dist/ to /var/www/html/
```

### Windows Server

```powershell
# Use IIS with iisnode
# Or PM2 như Linux
```

## 📚 Tài liệu thêm

- **DATABASE_SETUP.md** - Setup database chi tiết
- **server/BUILD_GUIDE.md** - Compile C server
- **SETUP_GUIDE.md** - Hướng dẫn tổng quát

---

**💡 Tip**: Chọn platform quen thuộc nhất để develop, sau đó deploy lên Linux server cho production!

