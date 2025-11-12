# 📖 Hướng dẫn cài đặt chi tiết

## Môi trường phát triển

### Windows

#### 1. Cài đặt Node.js

```bash
# Tải từ: https://nodejs.org/
# Chọn phiên bản LTS (18.x hoặc cao hơn)

# Kiểm tra cài đặt
node --version
npm --version
```

#### 2. Cài đặt PostgreSQL

```bash
# Tải từ: https://www.postgresql.org/download/windows/
# Chọn PostgreSQL 15 hoặc cao hơn

# Trong quá trình cài đặt:
# - Ghi nhớ password cho user postgres
# - Port mặc định: 5432
# - Cài đặt pgAdmin 4 (tùy chọn)

# Tạo database
# Mở pgAdmin hoặc psql:
psql -U postgres
CREATE DATABASE battleship_db;
\q
```

#### 3. Cài đặt Redis

**Cách 1: Tải trực tiếp (Recommended cho Windows)**
```bash
# Tải từ: https://github.com/microsoftarchive/redis/releases
# Giải nén và chạy redis-server.exe
```

**Cách 2: Docker (nếu có Docker Desktop)**
```bash
docker run -d -p 6379:6379 --name battleship-redis redis
```

**Cách 3: WSL2**
```bash
# Trong WSL2 Ubuntu
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### 4. Cài đặt GCC (cho C server)

```bash
# Cài MSYS2: https://www.msys2.org/

# Sau khi cài MSYS2, mở MSYS2 terminal:
pacman -S mingw-w64-x86_64-gcc
pacman -S make

# Thêm vào PATH:
# C:\msys64\mingw64\bin
```

#### 5. Cài đặt Git

```bash
# Tải từ: https://git-scm.com/download/win
```

## Cài đặt Project

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd BTL
```

### Bước 2: Setup Backend

```bash
cd backend
npm install

# Tạo file .env
copy .env.example .env

# Chỉnh sửa .env:
notepad .env
```

**Nội dung file .env:**
```env
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battleship_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# TCP Server
TCP_SERVER_HOST=localhost
TCP_SERVER_PORT=8888

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Khởi tạo database:**
```bash
npm run init-db
```

**Chạy backend:**
```bash
npm run dev
```

Mở trình duyệt và truy cập: http://localhost:3000/health
Nếu thấy `{"status":"ok",...}` là thành công!

### Bước 3: Setup Frontend

Mở terminal mới:

```bash
cd frontend
npm install

# Tạo file .env
copy .env.example .env
```

**Nội dung file .env:**
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**Chạy frontend:**
```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

### Bước 4: Setup C Server (Optional)

Mở terminal mới:

```bash
cd server

# Compile
make

# Chạy
.\server.exe
```

## Kiểm tra cài đặt

### 1. Kiểm tra Backend

```bash
# Test health endpoint
curl http://localhost:3000/health

# Hoặc mở browser
http://localhost:3000/health
```

### 2. Kiểm tra Frontend

Mở browser: http://localhost:5173
Bạn sẽ thấy trang Login

### 3. Kiểm tra PostgreSQL

```bash
psql -U postgres -d battleship_db
\dt
```

Bạn sẽ thấy các bảng: users, game_rooms, game_history, items, player_items, leaderboard

### 4. Kiểm tra Redis

```bash
redis-cli
ping
# Sẽ trả về: PONG
```

## Demo Account

Sau khi chạy `npm run init-db`, sẽ có sẵn account:

- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Lỗi: PostgreSQL connection refused

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows Services -> PostgreSQL -> Start

# Hoặc
pg_isready -h localhost -p 5432

# Kiểm tra password trong .env đúng chưa
```

### Lỗi: Redis connection refused

**Giải pháp:**
```bash
# Chạy redis-server.exe
# Hoặc khởi động Docker container

# Kiểm tra Redis đang chạy
redis-cli ping
```

### Lỗi: Port already in use

**Giải pháp:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

### Lỗi: npm install failed

**Giải pháp:**
```bash
# Clear cache
npm cache clean --force

# Xóa node_modules và package-lock.json
rmdir /s node_modules
del package-lock.json

# Cài lại
npm install
```

### Lỗi: CORS error

**Giải pháp:**
- Kiểm tra CORS_ORIGIN trong backend/.env
- Đảm bảo frontend chạy đúng port 5173
- Restart backend sau khi thay đổi .env

### Lỗi: JWT token invalid

**Giải pháp:**
- Xóa localStorage trong browser (F12 -> Application -> Local Storage -> Clear)
- Đăng nhập lại

### Lỗi: Cannot compile C server

**Giải pháp:**
```bash
# Kiểm tra GCC đã cài
gcc --version

# Nếu chưa có, cài MSYS2 và gcc
# Thêm C:\msys64\mingw64\bin vào PATH

# Compile thủ công
gcc -Wall -Wextra -O2 -o server.exe server.c -lws2_32
```

## Production Deployment

### Backend

```bash
cd backend

# Build (nếu có TypeScript)
npm run build

# Chạy production
NODE_ENV=production npm start
```

### Frontend

```bash
cd frontend

# Build
npm run build

# Serve với nginx hoặc serve
npm install -g serve
serve -s dist -p 5173
```

### Database Migration

```bash
# Backup database
pg_dump -U postgres battleship_db > backup.sql

# Restore
psql -U postgres battleship_db < backup.sql
```

## Tips

1. **Development:**
   - Dùng `npm run dev` cho auto-reload
   - Bật DevTools trong browser (F12)
   - Xem Console để debug

2. **Database:**
   - Dùng pgAdmin để xem database
   - Tạo backup thường xuyên

3. **Testing:**
   - Test với 2 browser khác nhau
   - Hoặc 1 normal + 1 incognito window

4. **Performance:**
   - Redis giúp game nhanh hơn
   - PostgreSQL cho dữ liệu lâu dài

## Support

Nếu gặp vấn đề, tham khảo:
- README.md
- Issues trong GitHub
- Liên hệ team phát triển

