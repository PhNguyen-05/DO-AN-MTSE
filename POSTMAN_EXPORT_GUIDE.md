# Hướng dẫn Export Kết quả Test từ Postman

## 🎯 Mục tiêu
Lấy file `.json` chứa kết quả test API từ Postman

---

## 📋 Cách 1: Export Postman Collection (Kèm test history)

### Bước 1: Chạy Collection Runner
1. Trong Postman, chọn **EditProfile.postman_collection.json**
2. Click nút **Runner** hoặc **>** (Run) ở góc trái
3. **Manage Environments** → Tạo/chọn environment
4. Set variables:
   - `jwt_token`: Dán token từ seed.js
   - `base_url`: localhost:5000

### Bước 2: Chạy Tests
1. Chọn requests muốn test
2. Đặt số lần chạy (Iterations) = 1
3. Click **Run EditProfile API**
4. Chờ tất cả requests hoàn thành

### Bước 3: Export Results
1. **Postman** (góc trên cùng) → **Preferences**
2. Chọn tab **General**
3. Tìm **Request/Response Size Limit** → Đặt cao (5MB+)
4. Quay lại Collection Runner kết quả
5. Click **Save Results** (góc phải)
6. Chọn **Export as JSON**
7. Lưu file `test-results.json`

---

## 📋 Cách 2: Export Collection Definitions + Tests

### Bước 1: Thêm Test Scripts
Mỗi request trong Postman:
1. Tab **Tests**
2. Thêm code:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
});
```

### Bước 2: Export Collection
1. **File** → **Export**
2. Format: **Collection v2.1**
3. Lưu `EditProfile.postman_collection.json`

---

## 📋 Cách 3: Export cURL Commands (Thủ công)

Mỗi request:
1. Click **Code** (</>)
2. Chọn **cURL**
3. Copy command
4. Lưu vào file `curl-commands.sh`

**Ví dụ**:
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "name=Tran Van B" \
  -F "email=b@gmail.com" \
  -F "phone=0987654321" \
  -F "password=123"
```

---

## 📋 Cách 4: Tạo Report HTML từ Test Results

### Dùng Newman (CLI tool của Postman)

**Cài đặt Newman**:
```bash
npm install -g newman
npm install -g newman-reporter-html
```

**Chạy collection và tạo report**:
```bash
newman run EditProfile.postman_collection.json \
  -e environment.json \
  --reporters cli,html \
  --reporter-html-export ./reports/report.html
```

**Output**:
```
✓ Test Results Report: ./reports/report.html
```

Mở file HTML trong browser để xem report chi tiết.

---

## 📋 Cách 5: Export Postman Collection với Actual Responses

### Bước 1: Tạo Collection từ Requests
1. Mở **Collections**
2. Click **New** → **Collection**
3. Chọn **Add request from HTTP**

### Bước 2: Thực hiện requests
Mỗi request:
1. Điền URL, method, headers, body
2. Click **Send**
3. Response hiển thị bên phải
4. Click **Save Response** → **Save as example**

### Bước 3: Export
1. **File** → **Export**
2. Format: **Collection v2.1**
3. File sẽ chứa tất cả responses

---

## 🎯 File Output Format

### Collection JSON (v2.1)
```json
{
  "info": {
    "name": "EditProfile API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Update Profile",
      "request": { ... },
      "response": [ ... ]
    }
  ]
}
```

### Test Results JSON
```json
{
  "name": "EditProfile API",
  "id": "xxx-xxx-xxx",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "collection_id": "xxx",
  "requests_count": 4,
  "failed_count": 0,
  "executions": [
    {
      "id": "request-1",
      "name": "Update Profile - Success",
      "url": "http://localhost:5000/api/profile",
      "method": "PUT",
      "status": "passed",
      "responseCode": 200,
      "responseTime": 45,
      "tests": {
        "Status code is 200": true,
        "Response has success field": true
      }
    }
  ]
}
```

---

## 🚀 Script Tự động Export

### Tạo file `export-postman.sh` (macOS/Linux):
```bash
#!/bin/bash

# Configuration
COLLECTION="EditProfile.postman_collection.json"
ENVIRONMENT="environment.json"
OUTPUT_DIR="./test-results"

mkdir -p "$OUTPUT_DIR"

# Chạy tests
newman run "$COLLECTION" \
  -e "$ENVIRONMENT" \
  --reporters cli,json,html \
  --reporter-json-export "$OUTPUT_DIR/results.json" \
  --reporter-html-export "$OUTPUT_DIR/report.html"

echo "✓ Test results exported to: $OUTPUT_DIR"
```

### Chạy:
```bash
chmod +x export-postman.sh
./export-postman.sh
```

---

## ✅ Checklist Files Output

- [ ] `EditProfile.postman_collection.json` - Collection định nghĩa
- [ ] `test-results.json` - Kết quả chạy tests
- [ ] `report.html` - Report HTML visual
- [ ] `curl-commands.sh` - cURL commands
- [ ] `environment.json` - Variables/environments

---

## 💡 Tips

1. **Lưu responses examples**: Mỗi request → **Save Response** → **Save as example**
2. **Test automation**: Thêm test scripts để tự kiểm tra
3. **Environment variables**: Dùng `{{variable}}` để tái sử dụng giá trị
4. **Chaining requests**: Dùng `pm.globals.set()` để pass data giữa requests
5. **Share results**: Export HTML report để chia sẻ với team

---

## 📦 Files cần save

```
project/
├── EditProfile.postman_collection.json    ← Collection
├── environment.json                       ← Environment variables
├── test-results/
│   ├── results.json                      ← JSON test results
│   ├── report.html                       ← HTML report
│   └── report-latest.html                ← Latest report
└── SETUP_GUIDE.md                        ← This guide
```
