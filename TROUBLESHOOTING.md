# 🔧 Troubleshooting Guide

## ❌ Lỗi: POST http://localhost:3000/api/auth/login net::ERR_FAILED

### Nguyên nhân:
Backend không chạy hoặc không truy cập được.

### ✅ Fix từng bước:

#### Bước 1: Kiểm tra Backend có đang chạy không

```bash
# Mở terminal mới
cd E:\Code\LTM\BTL\backend

# Check xem có process nào đang chạy không
netstat -ano | findstr :3000
```

**Nếu không thấy gì** → Backend chưa chạy!

#### Bước 2: Start Backend

```bash
cd E:\Code\LTM\BTL\backend

# Kiểm tra dependencies
npm install

# Start backend
npm run dev
```

**Kết quả mong đợi:**
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
✅ Redis is ready
🚀 Server running on port 3000
```

#### Bước 3: Kiểm tra Backend Health

Mở browser hoặc dùng curl:

```bash
# Browser
http://localhost:3000/health

# Hoặc curl
curl http://localhost:3000/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 1.234
}
```

**Nếu không truy cập được** → Đọc tiếp!

---

## 🔍 Debug Chi Tiết

### Check 1: PostgreSQL có chạy không?

```bash
# Windows
sc query postgresql-x64-15

# Nếu STOPPED:
net start postgresql-x64-15
```

### Check 2: Redis có chạy không?

```bash
# Windows
sc query Redis

# Nếu STOPPED:
net start Redis

# Test Redis
redis-cli ping
# Phải trả về: PONG
```

### Check 3: File .env có đúng không?

```bash
cd backend
notepad .env
```

**Phải có các dòng này:**
```env
PORT=3000
DB_HOST=localhost
DB_NAME=battleship_db
REDIS_HOST=localhost
```

**Nếu không có file .env:**

```bash
# Tạo tự động
npm run setup-env

# Hoặc copy từ example
copy .env.example .env
```

### Check 4: Database đã khởi tạo chưa?

```bash
cd backend
npm run init-db
```

### Check 5: Port 3000 bị chiếm?

```bash
# Kiểm tra process nào đang dùng port 3000
netstat -ano | findstr :3000

# Kill process nếu có
taskkill /PID <process_id> /F

# Hoặc đổi PORT trong .env
# PORT=3001
```

---

## 📋 Checklist Fix

Làm theo thứ tự:

- [ ] **PostgreSQL đang chạy**: `sc query postgresql-x64-15`
- [ ] **Redis đang chạy**: `redis-cli ping`
- [ ] **File .env tồn tại**: `dir .env`
- [ ] **Dependencies đã install**: `npm install`
- [ ] **Database đã init**: `npm run init-db`
- [ ] **Backend đang chạy**: `npm run dev`
- [ ] **Health check OK**: http://localhost:3000/health
- [ ] **Frontend đã restart**: Ctrl+C → `npm run dev`

---

## 🚀 Quick Fix Script

Chạy lệnh này để fix tự động:

```bash
# Backend
cd E:\Code\LTM\BTL\backend

# 1. Check setup
npm run check-setup

# 2. Nếu có lỗi, fix:
net start postgresql-x64-15
net start Redis
npm install
npm run setup-env
npm run init-db

# 3. Start
npm run dev
```

---

## 🌐 Frontend Issues

### Lỗi CORS

**Triệu chứng:** Console shows CORS error

**Fix:**
```bash
# Backend .env
CORS_ORIGIN=http://localhost:5173
```

Restart backend.

### Lỗi "Cannot read properties of null"

**Fix:** Clear localStorage

```javascript
// Browser Console (F12)
localStorage.clear()
location.reload()
```

---

## 🔥 Common Errors

### Error 1: "ECONNREFUSED"

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:** PostgreSQL chưa chạy
```bash
net start postgresql-x64-15
```

### Error 2: "Redis connection refused"

```
Error: Redis connection to localhost:6379 failed
```

**Fix:** Redis chưa chạy
```bash
net start Redis
```

### Error 3: "Database does not exist"

```
Error: database "battleship_db" does not exist
```

**Fix:** Chưa tạo database
```bash
npm run init-db
```

### Error 4: "Port 3000 is already in use"

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:** Kill process cũ
```bash
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Error 5: "Cannot find module"

```
Error: Cannot find module 'express'
```

**Fix:** Chưa install dependencies
```bash
npm install
```

---

## 🎯 Test từng bước

### Test 1: Backend Health

```bash
curl http://localhost:3000/health
```

✅ **Success:** `{"status":"ok"}`  
❌ **Fail:** Backend không chạy

### Test 2: Login API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

✅ **Success:** Returns user data  
❌ **Fail:** Check database

### Test 3: Leaderboard (no auth)

```bash
curl http://localhost:3000/api/users/leaderboard
```

✅ **Success:** Returns array  
❌ **Fail:** Check database init

---

## 🔄 Complete Reset

Nếu tất cả đều không work, reset toàn bộ:

```bash
# 1. Stop all
# Ctrl+C tất cả terminals

# 2. Reset backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# 3. Reset database
psql -U postgres
DROP DATABASE battleship_db;
CREATE DATABASE battleship_db;
\q

npm run init-db

# 4. Start services
net start postgresql-x64-15
net start Redis

# 5. Start backend
npm run dev

# 6. Start frontend (terminal mới)
cd ../frontend
npm run dev
```

---

## 📞 Still Having Issues?

### Check Logs

**Backend logs:** Xem trong terminal đang chạy `npm run dev`

**Browser logs:** F12 → Console tab

**Network logs:** F12 → Network tab → Check failed requests

### Get Help

1. Copy error message từ terminal
2. Copy error từ browser console (F12)
3. Check file: `backend/NO_AUTH_README.md`
4. Check file: `DATABASE_SETUP.md`

---

## 💡 Tips

**Luôn chạy theo thứ tự:**

1. ✅ PostgreSQL
2. ✅ Redis  
3. ✅ Backend
4. ✅ Frontend

**Luôn check:**
- Terminal backend có lỗi không
- Browser console (F12) có lỗi không
- Network tab (F12) request có đến backend không

---

**Good luck! 🍀**

