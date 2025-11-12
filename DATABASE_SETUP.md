# 🗄️ Hướng dẫn Setup Database từng bước

## Mục lục
1. [Cài đặt PostgreSQL](#1-cài-đặt-postgresql)
2. [Cài đặt Redis](#2-cài-đặt-redis)
3. [Khởi tạo Database](#3-khởi-tạo-database)
4. [Kiểm tra kết nối](#4-kiểm-tra-kết-nối)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Cài đặt PostgreSQL

### Bước 1.1: Tải PostgreSQL

1. Truy cập: https://www.postgresql.org/download/windows/
2. Download PostgreSQL Installer (phiên bản 15 hoặc mới hơn)
3. Chạy file `.exe` vừa tải

### Bước 1.2: Cài đặt PostgreSQL

1. **Welcome Screen**: Click "Next"

2. **Installation Directory**: 
   - Để mặc định: `C:\Program Files\PostgreSQL\15`
   - Click "Next"

3. **Select Components**: Check tất cả (đặc biệt là):
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (công cụ quản lý database)
   - ✅ Command Line Tools
   - Click "Next"

4. **Data Directory**:
   - Để mặc định: `C:\Program Files\PostgreSQL\15\data`
   - Click "Next"

5. **Password**: 
   - **⚠️ QUAN TRỌNG**: Đặt password cho user `postgres`
   - Ví dụ: `postgres123` (ghi nhớ password này!)
   - Nhập lại password để confirm
   - Click "Next"

6. **Port**:
   - Để mặc định: `5432`
   - Click "Next"

7. **Locale**:
   - Chọn "English, United States"
   - Click "Next"

8. **Pre Installation Summary**:
   - Xem lại thông tin
   - Click "Next"

9. Đợi cài đặt hoàn tất (3-5 phút)

10. **Completing Setup**:
    - Bỏ tick "Launch Stack Builder"
    - Click "Finish"

### Bước 1.3: Kiểm tra PostgreSQL đã cài đặt

Mở Command Prompt hoặc PowerShell:

```bash
# Kiểm tra version
psql --version

# Nếu hiện: psql (PostgreSQL) 15.x => Thành công!
```

**Nếu lỗi "psql is not recognized":**

1. Mở System Properties → Environment Variables
2. Chỉnh sửa biến `Path`
3. Thêm: `C:\Program Files\PostgreSQL\15\bin`
4. Click OK và restart terminal

---

## 2. Cài đặt Redis

### Option A: Redis for Windows (Recommended)

#### Bước 2.1: Tải Redis

1. Truy cập: https://github.com/microsoftarchive/redis/releases
2. Tải file: `Redis-x64-3.0.504.msi` (hoặc version mới nhất)
3. Chạy file `.msi`

#### Bước 2.2: Cài đặt Redis

1. **Welcome**: Click "Next"
2. **License Agreement**: Accept và click "Next"
3. **Installation Folder**: Để mặc định `C:\Program Files\Redis`
4. **Port**: Để mặc định `6379`
5. **Add to PATH**: ✅ Check option này
6. Click "Install"
7. Đợi cài đặt xong
8. Click "Finish"

#### Bước 2.3: Kiểm tra Redis

```bash
# Mở Command Prompt mới
redis-cli --version

# Test kết nối
redis-cli ping
# Nếu trả về: PONG => Thành công!
```

### Option B: Redis trong Docker (Alternative)

```bash
# Cài Docker Desktop trước: https://www.docker.com/products/docker-desktop

# Chạy Redis container
docker run -d -p 6379:6379 --name battleship-redis redis

# Test
docker exec -it battleship-redis redis-cli ping
```

### Option C: Redis trên WSL2 (Alternative)

```bash
# Mở WSL2 Ubuntu terminal

# Update packages
sudo apt update

# Cài Redis
sudo apt install redis-server -y

# Chỉnh sửa config
sudo nano /etc/redis/redis.conf
# Tìm dòng: supervised no
# Đổi thành: supervised systemd
# Ctrl+X, Y, Enter để save

# Start Redis
sudo service redis-server start

# Test
redis-cli ping
```

---

## 3. Khởi tạo Database

### Bước 3.1: Tạo Database battleship_db

#### Cách 1: Dùng Command Line (Recommended)

```bash
# Mở Command Prompt hoặc PowerShell

# Đăng nhập vào PostgreSQL
psql -U postgres

# Nhập password đã đặt ở bước 1.2

# Tạo database
CREATE DATABASE battleship_db;

# Kiểm tra database đã tạo
\l

# Thoát
\q
```

#### Cách 2: Dùng pgAdmin 4 (GUI)

1. Mở **pgAdmin 4** (đã cài kèm PostgreSQL)
2. Kết nối đến server:
   - Click vào "Servers" → "PostgreSQL 15"
   - Nhập password của user postgres
3. Tạo database:
   - Right-click "Databases" → "Create" → "Database"
   - Database name: `battleship_db`
   - Owner: `postgres`
   - Click "Save"

### Bước 3.2: Cấu hình Backend .env

```bash
cd E:\Code\LTM\BTL\backend

# Tạo file .env từ template
copy .env.example .env

# Mở file .env
notepad .env
```

**Chỉnh sửa các giá trị sau trong file .env:**

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battleship_db
DB_USER=postgres
DB_PASSWORD=postgres123        # ⚠️ Đổi thành password bạn đã đặt

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                # Để trống nếu không set password

# JWT Secret - Tạo chuỗi ngẫu nhiên dài
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d

# C TCP Server
TCP_SERVER_HOST=localhost
TCP_SERVER_PORT=8888

# CORS
CORS_ORIGIN=http://localhost:5173
```

**💡 Tip: Tạo JWT_SECRET ngẫu nhiên:**
```bash
# Dùng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 3.3: Cài đặt Dependencies

```bash
# Đảm bảo đang ở thư mục backend
cd E:\Code\LTM\BTL\backend

# Cài packages
npm install
```

### Bước 3.4: Chạy Script Khởi tạo Database

```bash
# Chạy script tạo tables và dữ liệu mẫu
npm run init-db
```

**Kết quả mong đợi:**

```
🚀 Initializing database...
✅ Connected to PostgreSQL database
✅ Database initialized successfully!
📊 Created tables:
   - users
   - game_rooms
   - game_history
   - items
   - player_items
   - leaderboard

👤 Default admin account:
   Username: admin
   Password: admin123

✅ Database setup complete!
```

---

## 4. Kiểm tra kết nối

### 4.1: Kiểm tra PostgreSQL

#### Cách 1: Command Line

```bash
# Kết nối vào database
psql -U postgres -d battleship_db

# Xem danh sách tables
\dt

# Kết quả sẽ hiện:
#              List of relations
#  Schema |     Name      | Type  |  Owner
# --------+---------------+-------+----------
#  public | game_history  | table | postgres
#  public | game_rooms    | table | postgres
#  public | items         | table | postgres
#  public | leaderboard   | table | postgres
#  public | player_items  | table | postgres
#  public | users         | table | postgres

# Xem dữ liệu trong table users
SELECT * FROM users;

# Nên thấy 1 user admin

# Thoát
\q
```

#### Cách 2: pgAdmin 4

1. Mở pgAdmin 4
2. Navigate: Servers → PostgreSQL 15 → Databases → battleship_db → Schemas → public → Tables
3. Right-click table "users" → "View/Edit Data" → "All Rows"
4. Sẽ thấy user admin đã được tạo

### 4.2: Kiểm tra Redis

```bash
# Test ping
redis-cli ping
# Kết quả: PONG

# Xem thông tin server
redis-cli info server

# Test set/get
redis-cli set test "hello"
redis-cli get test
# Kết quả: "hello"

# Xóa test key
redis-cli del test
```

### 4.3: Kiểm tra Backend kết nối Database

```bash
# Đảm bảo ở thư mục backend
cd E:\Code\LTM\BTL\backend

# Chạy backend
npm run dev
```

**Kết quả mong đợi:**

```
✅ Connected to PostgreSQL database
✅ Connected to Redis
✅ Redis is ready

🚀 ===============================================
🚀  BattleShip Backend Server
🚀 ===============================================
🚀  Server running on port 3000
🚀  Environment: development
🚀  HTTP: http://localhost:3000
🚀  WebSocket: ws://localhost:3000
🚀 ===============================================
```

**Test health endpoint:**

Mở browser hoặc dùng curl:

```bash
# Browser
http://localhost:3000/health

# hoặc curl
curl http://localhost:3000/health
```

Kết quả:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 1.234
}
```

---

## 5. Troubleshooting

### ❌ Lỗi: "psql: error: connection to server failed"

**Nguyên nhân**: PostgreSQL service chưa chạy

**Giải pháp**:

```bash
# Windows: Mở Services
# Tìm "postgresql-x64-15"
# Right-click → Start

# Hoặc dùng command
net start postgresql-x64-15
```

### ❌ Lỗi: "password authentication failed"

**Nguyên nhân**: Password trong .env không đúng

**Giải pháp**:

1. Kiểm tra lại password trong file `.env`
2. Đảm bảo giống với password đã đặt khi cài PostgreSQL
3. Không có khoảng trắng thừa

### ❌ Lỗi: "database battleship_db does not exist"

**Nguyên nhân**: Chưa tạo database

**Giải pháp**:

```bash
psql -U postgres
CREATE DATABASE battleship_db;
\q
```

### ❌ Lỗi: "Redis connection refused"

**Nguyên nhân**: Redis chưa chạy

**Giải pháp**:

**Windows:**
```bash
# Kiểm tra Redis service
sc query Redis

# Start Redis
net start Redis
```

**Docker:**
```bash
docker start battleship-redis
```

**WSL2:**
```bash
sudo service redis-server start
```

### ❌ Lỗi: "port 5432 is already in use"

**Nguyên nhân**: PostgreSQL đã chạy trên port đó

**Giải pháp**:

```bash
# Tìm process
netstat -ano | findstr :5432

# Hoặc đổi port trong .env
DB_PORT=5433
```

### ❌ Lỗi: "npm run init-db failed"

**Nguyên nhân**: Kết nối database không thành công

**Giải pháp**:

1. Kiểm tra PostgreSQL đang chạy:
```bash
pg_isready -h localhost -p 5432
```

2. Kiểm tra credentials trong `.env`

3. Test kết nối thủ công:
```bash
psql -U postgres -h localhost -p 5432
```

4. Xem log chi tiết:
```bash
cd backend
node src/database/init.js
```

### ❌ Lỗi: "Cannot find module 'pg'"

**Nguyên nhân**: Chưa cài dependencies

**Giải pháp**:

```bash
cd backend
npm install
```

---

## 6. Verify toàn bộ Setup

### Checklist ✅

Chạy lần lượt các lệnh sau để đảm bảo mọi thứ hoạt động:

```bash
# 1. PostgreSQL version
psql --version
# ✅ Should show: psql (PostgreSQL) 15.x

# 2. Redis version
redis-cli --version
# ✅ Should show: redis-cli x.x.x

# 3. PostgreSQL running
pg_isready -h localhost -p 5432
# ✅ Should show: localhost:5432 - accepting connections

# 4. Redis running
redis-cli ping
# ✅ Should show: PONG

# 5. Database exists
psql -U postgres -l | findstr battleship_db
# ✅ Should show: battleship_db

# 6. Tables created
psql -U postgres -d battleship_db -c "\dt"
# ✅ Should show 6 tables

# 7. Backend connects
cd backend
npm run dev
# ✅ Should show: Connected to PostgreSQL and Redis
```

---

## 7. Dữ liệu mẫu

Sau khi chạy `npm run init-db`, database sẽ có:

### Users Table
| username | password | elo_rating |
|----------|----------|------------|
| admin    | admin123 | 1500       |

### Items Table (4 items)
| name | effect_type | cost |
|------|-------------|------|
| Radar Scan | RADAR | 100 |
| Cross Shot | MULTI_SHOT | 150 |
| Air Strike | AIR_STRIKE | 200 |
| Sonar Ping | SONAR | 120 |

---

## 8. Backup & Restore

### Backup Database

```bash
# Backup toàn bộ database
pg_dump -U postgres battleship_db > backup.sql

# Backup chỉ schema
pg_dump -U postgres --schema-only battleship_db > schema.sql

# Backup chỉ data
pg_dump -U postgres --data-only battleship_db > data.sql
```

### Restore Database

```bash
# Drop database cũ (cẩn thận!)
psql -U postgres -c "DROP DATABASE battleship_db;"

# Tạo database mới
psql -U postgres -c "CREATE DATABASE battleship_db;"

# Restore
psql -U postgres battleship_db < backup.sql
```

---

## 9. Reset Database

Nếu muốn reset database về trạng thái ban đầu:

```bash
# Cách 1: Chạy lại init script
cd backend
npm run init-db

# Cách 2: Drop và tạo lại
psql -U postgres
DROP DATABASE battleship_db;
CREATE DATABASE battleship_db;
\q

npm run init-db
```

---

## 10. Next Steps

Sau khi setup database thành công:

1. ✅ Setup Frontend `.env`
2. ✅ Chạy Backend: `cd backend && npm run dev`
3. ✅ Chạy Frontend: `cd frontend && npm run dev`
4. ✅ Mở browser: http://localhost:5173
5. ✅ Login với: `admin` / `admin123`

---

## 📞 Support

Nếu gặp vấn đề khác, hãy:

1. Xem log trong terminal
2. Kiểm tra file `.env` (password, host, port)
3. Đảm bảo services đang chạy (PostgreSQL, Redis)
4. Tham khảo [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

**🎉 Chúc bạn setup thành công!**

