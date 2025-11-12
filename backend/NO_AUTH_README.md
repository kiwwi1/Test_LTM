# 🔓 No Authentication Mode

Authentication đã được **TẮT** để đơn giản hóa development và testing.

## ⚠️ Quan trọng

- ❌ **KHÔNG dùng cho production**
- ✅ Chỉ dùng cho development/demo
- 🔒 Bật lại authentication trước khi deploy

## 🔄 Thay đổi

### Backend

**Trước (có auth):**
```javascript
// Cần token trong header
headers: {
  'Authorization': 'Bearer <token>'
}
```

**Bây giờ (không auth):**
```javascript
// Không cần token, chỉ cần userId trong body/query
body: {
  userId: 1
}
```

### API Changes

#### User APIs

```javascript
// Get profile
GET /api/users/profile?userId=1

// Get online players
GET /api/users/online

// Get leaderboard
GET /api/users/leaderboard

// Update status
PUT /api/users/status
Body: { userId: 1, status: 'ONLINE' }
```

#### Game APIs

```javascript
// Create room
POST /api/games/create
Body: { userId: 1 }

// Join room
POST /api/games/join
Body: { roomCode: 'ABC123', userId: 1 }

// Place ships
POST /api/games/:roomId/place-ships
Body: { userId: 1, ships: [...] }

// Attack
POST /api/games/:roomId/attack
Body: { userId: 1, x: 5, y: 5 }

// Get history
GET /api/games/history?userId=1

// Get replay
GET /api/games/:gameId/replay?userId=1
```

#### Auth APIs (simplified)

```javascript
// Register (vẫn hoạt động bình thường)
POST /api/auth/register
Body: { username, email, password }

// Login (vẫn trả về user nhưng không cần token)
POST /api/auth/login
Body: { username, password }

// Logout
POST /api/auth/logout
Body: { userId: 1 }

// Verify (always returns valid)
GET /api/auth/verify
```

### WebSocket

**Trước:**
```javascript
const socket = io(URL, {
  auth: {
    token: jwt_token
  }
});
```

**Bây giờ:**
```javascript
const socket = io(URL, {
  auth: {
    userId: 1  // Chỉ cần userId
  }
});
```

## 🧪 Testing

### Test với curl

```bash
# Get leaderboard (không cần token)
curl http://localhost:3000/api/users/leaderboard

# Get profile
curl http://localhost:3000/api/users/profile?userId=1

# Create game room
curl -X POST http://localhost:3000/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test trong Browser Console

```javascript
// Get leaderboard
fetch('http://localhost:3000/api/users/leaderboard')
  .then(r => r.json())
  .then(console.log)

// Create room
fetch('http://localhost:3000/api/games/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 1 })
})
  .then(r => r.json())
  .then(console.log)
```

## 🔧 Frontend Changes Needed

### AuthContext (simplified)

```javascript
// Không cần lưu token
const login = async (username, password) => {
  const response = await authAPI.login({ username, password });
  const { user } = response.data;
  
  setUser(user);
  localStorage.setItem('user', JSON.stringify(user));
  // Không cần lưu token nữa
  
  return { success: true };
};
```

### API calls (add userId)

```javascript
// Trước
const response = await api.get('/users/profile');

// Bây giờ
const userId = JSON.parse(localStorage.getItem('user')).id;
const response = await api.get(`/users/profile?userId=${userId}`);
```

### Socket connection

```javascript
// Trước
const socket = io(SOCKET_URL, {
  auth: { token: token }
});

// Bây giờ
const userId = JSON.parse(localStorage.getItem('user')).id;
const socket = io(SOCKET_URL, {
  auth: { userId: userId }
});
```

## 🔒 Bật lại Authentication

Nếu muốn bật lại auth:

1. Restore files từ git:
```bash
git checkout backend/src/routes/
git checkout backend/src/controllers/
git checkout backend/src/socket/gameSocket.js
```

2. Hoặc tìm commit trước khi remove auth:
```bash
git log --oneline
git checkout <commit-id> -- backend/src/
```

## 📝 Notes

- userId mặc định: `1` (admin user)
- Không cần JWT_SECRET trong .env nữa
- Redis vẫn được dùng cho game state
- PostgreSQL vẫn được dùng cho data

## ⚡ Quick Start

```bash
# Backend
cd backend
npm run dev

# Frontend (cần update để không gửi token)
cd frontend
npm run dev

# Test
curl http://localhost:3000/api/users/leaderboard
```

---

**✅ Bây giờ app chạy đơn giản hơn, không cần lo về JWT token!**

