# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy BattleShip Game trong 5 phút!

## 🎯 Prerequisites (Cài trước)

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- ✅ Redis ([Download](https://github.com/microsoftarchive/redis/releases))

## 🚀 Các bước thực hiện

### Bước 1: Clone & Install

```bash
# Clone project (hoặc đã có rồi thì bỏ qua)
cd E:\Code\LTM\BTL

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Bước 2: Setup Database

```bash
# Tạo database PostgreSQL
psql -U postgres
# Nhập password postgres
CREATE DATABASE battleship_db;
\q
```

### Bước 3: Configure Environment

```bash
# Backend
cd backend
copy .env.example .env
# Chỉnh sửa .env:
# - DB_PASSWORD=<postgres_password>
# - JWT_SECRET=<random_32_chars>

# Frontend
cd ../frontend
copy .env.example .env
# Không cần sửa gì (mặc định OK)
```

### Bước 4: Initialize Database

```bash
cd backend
npm run init-db
```

**Kết quả mong đợi:**
```
✅ Database initialized successfully!
📊 Created tables: users, game_rooms, game_history, items, player_items, leaderboard
👤 Default admin account: admin / admin123
```

### Bước 5: Check Setup (Optional)

```bash
cd backend
npm run check-setup
```

**Nếu tất cả ✅ → Bạn đã sẵn sàng!**

### Bước 6: Start Services

Mở **3 terminals**:

**Terminal 1 - Redis:**
```bash
# Windows
redis-server

# Hoặc Docker
docker run -d -p 6379:6379 redis
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

Đợi thấy:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
🚀 Server running on port 3000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Đợi thấy:
```
VITE ready in xxx ms
➜ Local: http://localhost:5173/
```

### Bước 7: Play! 🎮

1. Mở browser: **http://localhost:5173**
2. Login với: `admin` / `admin123`
3. Mở thêm 1 tab incognito để tạo user thứ 2
4. Challenge và chơi!

## 🔍 Troubleshooting nhanh

### ❌ PostgreSQL không kết nối được

```bash
# Kiểm tra service đang chạy
sc query postgresql-x64-15

# Start nếu chưa chạy
net start postgresql-x64-15
```

### ❌ Redis không kết nối được

```bash
# Kiểm tra
redis-cli ping

# Nếu lỗi, start Redis
net start Redis
```

### ❌ Backend lỗi khi chạy

```bash
# Xem lại .env file
notepad .env

# Kiểm tra password đúng chưa
psql -U postgres -d battleship_db
```

### ❌ Frontend không load được

```bash
# Clear cache và reinstall
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
npm run dev
```

## 📚 Tài liệu chi tiết

Nếu gặp vấn đề, xem:

- **DATABASE_SETUP.md** - Hướng dẫn setup database từng bước
- **SETUP_GUIDE.md** - Hướng dẫn đầy đủ
- **README.md** - Tổng quan dự án
- **ARCHITECTURE.md** - Kiến trúc hệ thống

## 🎉 Xong!

Bây giờ bạn có thể:
- ✅ Đăng ký tài khoản mới
- ✅ Challenge người chơi khác
- ✅ Đặt tàu và chiến đấu
- ✅ Chat trong game
- ✅ Xem leaderboard

**Chúc bạn chơi vui vẻ!** 🚢💥

