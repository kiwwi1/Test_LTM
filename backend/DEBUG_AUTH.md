# 🔐 Debug Authentication Issues

## Lỗi: "Invalid or expired token"

### Nguyên nhân có thể:

1. ❌ **JWT_SECRET chưa set hoặc không đúng**
2. ❌ **Token đã hết hạn**
3. ❌ **Token không đúng format**
4. ❌ **Frontend gửi token sai cách**

---

## 🛠️ Cách Fix

### Bước 1: Kiểm tra JWT_SECRET trong .env

```bash
cd backend

# Mở file .env
notepad .env

# Hoặc Linux/Mac
nano .env
```

**Đảm bảo có dòng:**
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
```

**⚠️ QUAN TRỌNG**: JWT_SECRET phải:
- Dài ít nhất 32 ký tự
- Không có khoảng trắng thừa
- Không để mặc định như trong example

### Bước 2: Tạo JWT_SECRET mới (nếu chưa có)

**Cách 1: Dùng Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Cách 2: Dùng PowerShell (Windows)**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Cách 3: Online**
- https://randomkeygen.com/
- Copy "CodeIgniter Encryption Keys"

### Bước 3: Cập nhật .env

Copy secret key vừa tạo vào `.env`:

```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Bước 4: Restart Backend

```bash
# Stop backend (Ctrl+C)
# Start lại
npm run dev
```

### Bước 5: Clear localStorage và Login lại

**Trong Browser:**
1. Mở DevTools (F12)
2. Console tab
3. Chạy:
   ```javascript
   localStorage.clear()
   ```
4. Refresh page (F5)
5. Login lại

---

## 🔍 Debug Script

Chạy script này để kiểm tra:

```bash
cd backend
node debug-auth.js
```

Script sẽ check:
- ✅ JWT_SECRET có tồn tại không
- ✅ JWT_SECRET đủ dài không
- ✅ Có thể tạo và verify token không

---

## 📝 Các lỗi thường gặp

### ❌ Lỗi 1: "JWT_SECRET is not defined"

**Fix:**
```bash
# Trong .env, thêm dòng:
JWT_SECRET=your_secret_key_here_min_32_chars
```

### ❌ Lỗi 2: "Session expired"

**Nguyên nhân**: Redis chưa chạy hoặc session đã hết hạn

**Fix:**
```bash
# Windows
net start Redis

# Linux
sudo systemctl start redis

# Hoặc
redis-server
```

### ❌ Lỗi 3: "Access token required"

**Nguyên nhân**: Frontend không gửi token

**Fix trong frontend:**
```javascript
// Kiểm tra token có trong localStorage
console.log(localStorage.getItem('token'))

// Nếu null, login lại
```

### ❌ Lỗi 4: Token format không đúng

**Format đúng:**
```
Authorization: Bearer <token>
```

**Ví dụ:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Test Authentication

### Test với curl

```bash
# 1. Login để lấy token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy token từ response

# 2. Test với token
curl http://localhost:3000/api/users/leaderboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test trong Browser Console

```javascript
// Get token
const token = localStorage.getItem('token')
console.log('Token:', token)

// Test API
fetch('http://localhost:3000/api/users/leaderboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 🔐 Security Best Practices

### Development
```env
JWT_SECRET=dev_secret_key_not_for_production_32chars
JWT_EXPIRES_IN=7d
```

### Production
```env
JWT_SECRET=<random_64_char_string_from_secure_generator>
JWT_EXPIRES_IN=1h
```

**⚠️ QUAN TRỌNG:**
- ❌ KHÔNG commit file `.env` vào Git
- ❌ KHÔNG dùng secret key yếu
- ❌ KHÔNG share JWT_SECRET
- ✅ Dùng secret key khác nhau cho dev/prod
- ✅ Rotate secret key định kỳ

---

## 🚀 Quick Fix Checklist

- [ ] JWT_SECRET đã set trong `.env`
- [ ] JWT_SECRET dài >= 32 chars
- [ ] Backend đã restart sau khi sửa `.env`
- [ ] Redis đang chạy
- [ ] PostgreSQL đang chạy
- [ ] Frontend đã clear localStorage
- [ ] User đã login lại

---

## 💡 Tips

**Auto-generate .env khi thiếu:**

Tạo file `setup-env.js`:

```javascript
import fs from 'fs';
import crypto from 'crypto';

if (!fs.existsSync('.env')) {
  const secret = crypto.randomBytes(32).toString('hex');
  const env = `
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=battleship_db
DB_USER=postgres
DB_PASSWORD=postgres123

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=${secret}
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
  `.trim();
  
  fs.writeFileSync('.env', env);
  console.log('✅ .env file created with random JWT_SECRET');
} else {
  console.log('⚠️  .env already exists');
}
```

Chạy:
```bash
node setup-env.js
```

---

**Happy debugging! 🐛➡️✅**

