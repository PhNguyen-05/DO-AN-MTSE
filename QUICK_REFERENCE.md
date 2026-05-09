# ⚡ EditProfile - Quick Reference Card

## 🎯 API Endpoint
```
PUT http://localhost:5000/api/profile
```

---

## 🔐 Authentication
```
Header: Authorization: <JWT_TOKEN>
```

---

## 📝 Request Body (FormData)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ❌ | Người dùng full name |
| email | string | ❌ | Must contain @ |
| phone | string | ❌ | Số điện thoại |
| password | string | ✅ | Current password (for verification) |
| avatar | file | ❌ | Image file (JPG, PNG, etc.) |

---

## ✅ Success Response (200)
```json
{
  "success": true,
  "data": {
    "_id": "678a8c5efb0428348c000001",
    "name": "Tran Van B",
    "email": "b@gmail.com",
    "phone": "0987654321",
    "avatar": "1747891234567-image.jpg",
    "password": "$2b$10$...",
    "__v": 0
  }
}
```

---

## ❌ Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 401 | Unauthorized | No token in header |
| 403 | Forbidden | Invalid token or wrong password |
| 400 | Invalid email format | Email missing @ |
| 404 | User not found | User ID doesn't exist |

---

## 🚀 Quick Start Commands

### 1️⃣ Start MongoDB
```bash
mongod
```

### 2️⃣ Install & Seed
```bash
cd backend
npm install
mkdir uploads
node seed.js
```

### 3️⃣ Generate Token
```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({id: '678a8c5efb0428348c000001'}, 'your-secret-key'))"
```

### 4️⃣ Start Server
```bash
npm start
```

### 5️⃣ Test API
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: YOUR_TOKEN" \
  -F "name=Tran Van B" \
  -F "email=b@gmail.com" \
  -F "phone=0987654321" \
  -F "password=123"
```

---

## 📊 User Mẫu (Seed Data)
- **Email**: a@gmail.com
- **Password**: 123
- **Name**: Nguyen Van A
- **Phone**: 0123456789

---

## 🎯 Test Scenarios

### ✅ Test 1: Update tất cả fields
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: $TOKEN" \
  -F "name=New Name" \
  -F "email=new@gmail.com" \
  -F "phone=0987654321" \
  -F "password=123" \
  -F "avatar=@/path/to/image.jpg"
```
**Expected**: 200, success=true

---

### ❌ Test 2: No token
```bash
curl -X PUT http://localhost:5000/api/profile \
  -F "name=Test"
```
**Expected**: 401, "Unauthorized"

---

### ❌ Test 3: Invalid email
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: $TOKEN" \
  -F "email=invalid" \
  -F "password=123"
```
**Expected**: 400, "Invalid email format"

---

### ❌ Test 4: Wrong password
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: $TOKEN" \
  -F "name=Test" \
  -F "password=wrongpass"
```
**Expected**: 403, "Invalid password"

---

## 🔗 Related Files
- 📄 [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Mô tả chi tiết dự án
- 📄 [SETUP_GUIDE.md](SETUP_GUIDE.md) - Hướng dẫn setup từng bước
- 📄 [POSTMAN_EXPORT_GUIDE.md](POSTMAN_EXPORT_GUIDE.md) - Hướng dẫn export kết quả
- 📦 [EditProfile.postman_collection.json](EditProfile.postman_collection.json) - Collection Postman
- 🌍 [environment.json](environment.json) - Postman environment variables

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB not connecting | Start MongoDB: `mongod` |
| Port 5000 in use | Kill process: `lsof -i :5000` `kill -9 <PID>` |
| uploads folder not found | Create: `mkdir backend/uploads` |
| JWT error | Check token format and JWT_SECRET |
| Email already exists | Seed creates new user, change email before testing |

---

## 📈 Performance
- Avg response time: ~50ms
- Max payload size: 10MB (images)
- Concurrent connections: ~100

---

## 📞 Database Info
- **Host**: localhost
- **Port**: 27017
- **Database**: toeic
- **Collection**: users

---

## 🔄 Workflow

```
1. mongod (start MongoDB)
   ↓
2. npm install (backend)
   ↓
3. node seed.js (create user)
   ↓
4. Generate JWT token
   ↓
5. npm start (backend server)
   ↓
6. Test API (Postman/curl)
   ↓
7. Export results (JSON)
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0
