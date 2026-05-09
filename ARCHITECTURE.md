# 🏗️ EditProfile Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Application (src/App.js, EditProfile.js)          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ EditProfile Component                              │  │  │
│  │  │ - Form input (name, email, phone, avatar)         │  │  │
│  │  │ - File upload handler                             │  │  │
│  │  │ - axios.put("/api/profile", formData)             │  │  │
│  │  │ - localStorage.getItem("token")                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ HTTP Request
                     │ PUT /api/profile
                     │ Authorization: JWT_TOKEN
                     │ FormData: {name, email, phone, password, avatar}
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server (server.js)                           │  │
│  │  Listen on port 5000                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ authMiddleware.js                                        │  │
│  │ ├─ Extract token from Authorization header              │  │
│  │ ├─ jwt.verify(token, JWT_SECRET)                        │  │
│  │ ├─ Set req.userId from decoded token                    │  │
│  │ └─ Return 401/403 if token invalid                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ upload.js (Multer)                                       │  │
│  │ ├─ Disk storage configuration                           │  │
│  │ ├─ Save to: uploads/{timestamp}-{originalname}          │  │
│  │ └─ Set req.file with filename                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                CONTROLLER LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  profileController.js                                    │  │
│  │  handleProfileUpdate(req, res)                           │  │
│  │  ├─ Extract: req.userId, req.body, req.file             │  │
│  │  ├─ Call: profileService.updateProfileData()            │  │
│  │  ├─ Response: {success: true, data: updatedProfile}     │  │
│  │  └─ Error handling: catch & response error              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SERVICE LAYER (Business Logic)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  profileService.js                                       │  │
│  │  updateProfileData(userId, updatedFields)               │  │
│  │  ├─ Get user from repository                            │  │
│  │  ├─ Check user exists (404)                             │  │
│  │  ├─ bcrypt.compare(password, user.password) (403)       │  │
│  │  ├─ Validate email format (400)                         │  │
│  │  ├─ Delete password field (not updating)                │  │
│  │  └─ Call: userRepository.persistChanges()               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              REPOSITORY LAYER (Data Access)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  userRepository.js                                       │  │
│  │  findUserById(userId)                                    │  │
│  │  └─ User.findById(userId)                               │  │
│  │                                                          │  │
│  │  persistChanges(userId, updatedFields)                  │  │
│  │  └─ User.findByIdAndUpdate(userId, fields, {new: true})│  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MODEL LAYER (Mongoose)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User.js (Schema Definition)                             │  │
│  │  {                                                        │  │
│  │    name: String                                          │  │
│  │    email: { type: String, unique: true }                │  │
│  │    phone: String                                         │  │
│  │    avatar: String                                        │  │
│  │    password: String                                      │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (MongoDB)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB (localhost:27017)                               │  │
│  │  Database: toeic                                         │  │
│  │  Collection: users                                       │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ {                                                  │  │  │
│  │  │   _id: ObjectId("..."),                            │  │  │
│  │  │   name: "Tran Van B",                              │  │  │
│  │  │   email: "b@gmail.com",                            │  │  │
│  │  │   phone: "0987654321",                             │  │  │
│  │  │   avatar: "1747891234567-image.jpg",              │  │  │
│  │  │   password: "$2b$10$hashed...",                    │  │  │
│  │  │ }                                                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Data Flow Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. Client Sends Request
   ├─ URL: PUT /api/profile
   ├─ Header: Authorization: <JWT_TOKEN>
   └─ Body: FormData {name, email, phone, password, avatar}

2. Server Receives Request
   ├─ Express.js catches PUT /api/profile

3. Middleware Chain Executes
   ├─ authMiddleware
   │  ├─ Extract token from Authorization header
   │  ├─ jwt.verify(token, JWT_SECRET)
   │  ├─ If valid: Set req.userId
   │  └─ If invalid: Return 401/403
   │
   └─ upload.single("avatar")
      ├─ Parse FormData
      ├─ Extract file (if exists)
      └─ Save to uploads/{timestamp}-{filename}

4. Controller Handles Request
   ├─ profileController.handleProfileUpdate()
   ├─ Combine req.body + req.file
   └─ Call profileService.updateProfileData()

5. Service Executes Business Logic
   ├─ profileService.updateProfileData(userId, fields)
   ├─ userRepository.findUserById(userId)
   │  ├─ Query: User.findById(userId)
   │  └─ If not found: Throw 404
   ├─ bcrypt.compare(fields.password, user.password)
   │  └─ If mismatch: Throw 403
   ├─ Validate email format (must contain @)
   │  └─ If invalid: Throw 400
   ├─ Delete password field
   └─ userRepository.persistChanges(userId, fields)
      └─ Query: User.findByIdAndUpdate(userId, fields, {new: true})

6. Database Execution
   ├─ MongoDB updates document
   └─ Returns updated user object

7. Response to Client
   ├─ Controller returns response
   ├─ Response: {success: true, data: updatedUser}
   └─ Status: 200 OK

┌─────────────────────────────────────────────────────────────────┐
│                        ERROR FLOW                                │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: No Token
├─ authMiddleware catches missing Authorization header
├─ Response: {message: "Unauthorized"}
└─ Status: 401

Scenario 2: Invalid Token
├─ jwt.verify() throws error
├─ Response: {message: "Forbidden"}
└─ Status: 403

Scenario 3: Invalid Email
├─ Service validates: !email.includes("@")
├─ Response: {message: "Invalid email format"}
└─ Status: 400

Scenario 4: Wrong Password
├─ bcrypt.compare() returns false
├─ Response: {message: "Invalid password"}
└─ Status: 403

Scenario 5: User Not Found
├─ User.findById() returns null
├─ Response: {message: "User not found"}
└─ Status: 404
```

---

## 🔒 Authentication & Authorization

```
Token Creation (seed.js / generateToken.js)
│
├─ User ID: "678a8c5efb0428348c000001"
├─ Secret Key: "your-secret-key"
├─ Algorithm: HS256
└─ Token: jwt.sign({ id: userId }, secret)

Token Usage (Client -> API)
│
├─ Store in: localStorage
├─ Send in: Authorization header
├─ Format: "Authorization: <TOKEN>"
└─ Verification: jwt.verify(token, secret)

Token Payload (After Verification)
│
├─ decoded.id: "678a8c5efb0428348c000001"
├─ Set to: req.userId
└─ Used in: Service layer to identify user
```

---

## 📂 File Upload Flow

```
Client Selects File
│
├─ File: profile.jpg
├─ Size: 2MB
└─ Type: image/jpeg

Client Sends FormData
│
├─ form.append("avatar", file)
├─ Content-Type: multipart/form-data
└─ Request to: PUT /api/profile

Multer Middleware (upload.js)
│
├─ Intercept file in request
├─ Create directory: uploads/ (if not exists)
├─ Generate filename: {Date.now()}-{originalname}
│  └─ Example: 1747891234567-profile.jpg
├─ Save file to: uploads/1747891234567-profile.jpg
└─ Set: req.file.filename = "1747891234567-profile.jpg"

Controller Receives
│
├─ req.file.filename: "1747891234567-profile.jpg"
├─ Append to update fields: {avatar: "...filename"}
└─ Pass to service

Database Update
│
├─ Store filename: avatar: "1747891234567-profile.jpg"
└─ Client can access: http://localhost:5000/uploads/1747891234567-profile.jpg

Database & File Storage
│
├─ MongoDB (localhost:27017)
│  └─ Collection: users
│     └─ document.avatar = "1747891234567-profile.jpg"
│
└─ File System
   └─ backend/uploads/
      └─ 1747891234567-profile.jpg (actual file)
```

---

## 🔄 Complete Request/Response Cycle

### Successful Update Request

**Request**:
```http
PUT /api/profile HTTP/1.1
Host: localhost:5000
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Tran Van B
------WebKitFormBoundary
Content-Disposition: form-data; name="email"

tranvanb@gmail.com
------WebKitFormBoundary
Content-Disposition: form-data; name="phone"

0987654321
------WebKitFormBoundary
Content-Disposition: form-data; name="password"

123
------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="profile.jpg"
Content-Type: image/jpeg

[binary image data]
------WebKitFormBoundary--
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "678a8c5efb0428348c000001",
    "name": "Tran Van B",
    "email": "tranvanb@gmail.com",
    "phone": "0987654321",
    "avatar": "1747891234567-profile.jpg",
    "password": "$2b$10$hashed_password",
    "__v": 0
  }
}
```

---

## 🎯 Key Components Summary

| Component | File | Purpose | Key Methods |
|-----------|------|---------|-------------|
| Server | server.js | Express setup, routing | express(), listen() |
| Model | User.js | DB schema | mongoose.model() |
| Middleware Auth | authMiddleware.js | JWT verification | jwt.verify() |
| Middleware Upload | upload.js | File upload handling | multer.diskStorage() |
| Controller | profileController.js | Request handler | handleProfileUpdate() |
| Service | profileService.js | Business logic | updateProfileData() |
| Repository | userRepository.js | DB queries | findUserById(), persistChanges() |
| Seed | seed.js | Test data | bcrypt.hash(), User.create() |

---

**Architecture Version**: 1.0  
**Last Updated**: 2024-01-15
