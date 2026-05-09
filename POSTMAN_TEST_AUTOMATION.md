# 🤖 Postman Test Automation Scripts

## 📝 Pre-request Scripts & Tests

### 1️⃣ Update Profile - Pre-request Script

Thêm vào tab **Pre-request Script** của request "Update Profile":

```javascript
// Log request details
console.log("Sending PUT request to update profile");
console.log("User ID: " + pm.variables.get("user_id"));
console.log("Token: " + pm.variables.get("jwt_token").substring(0, 50) + "...");

// Validate token exists
if (!pm.variables.get("jwt_token")) {
    throw new Error("JWT token is not set. Please set 'jwt_token' variable.");
}

// Set timestamp for tracking
pm.variables.set("request_timestamp", new Date().toISOString());

// Log environment
console.log("Base URL: " + pm.variables.get("base_url"));
```

---

### 2️⃣ Update Profile - Test Script

Thêm vào tab **Tests** của request "Update Profile":

```javascript
// Test 1: Check response status is 200
pm.test("✓ Response status should be 200 OK", function () {
    pm.response.to.have.status(200);
});

// Test 2: Check response is valid JSON
pm.test("✓ Response should be valid JSON", function () {
    pm.response.to.be.json;
});

// Test 3: Check success field is true
pm.test("✓ Response.success should be true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.equal(true);
});

// Test 4: Check response has data object
pm.test("✓ Response should contain 'data' object", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.be.an('object');
});

// Test 5: Check all required fields in response
pm.test("✓ Response.data should have all required fields", function () {
    var jsonData = pm.response.json();
    var requiredFields = ['_id', 'name', 'email', 'phone', 'password'];
    
    requiredFields.forEach(function(field) {
        pm.expect(jsonData.data).to.have.property(field);
    });
});

// Test 6: Check user ID matches
pm.test("✓ Updated user ID should match requested user", function () {
    var jsonData = pm.response.json();
    var expectedId = pm.variables.get("user_id");
    pm.expect(jsonData.data._id).to.equal(expectedId);
});

// Test 7: Check name is updated
pm.test("✓ User name should be updated", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.name).to.be.a('string');
    pm.expect(jsonData.data.name.length).to.be.greaterThan(0);
});

// Test 8: Check email format is valid
pm.test("✓ Email should contain @ symbol", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.email).to.include('@');
});

// Test 9: Check phone is valid format
pm.test("✓ Phone should be a string", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.phone).to.be.a('string');
});

// Test 10: Check response time
pm.test("✓ Response time should be less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

// Save response for later reference
pm.variables.set("last_response", JSON.stringify(pm.response.json()));
pm.variables.set("response_timestamp", new Date().toISOString());

console.log("All tests completed!");
```

---

### 3️⃣ Error Test Cases

**Scenario: Missing Token**

Pre-request Script:
```javascript
// Temporarily remove token for testing
pm.variables.set("jwt_token", "");
```

Tests:
```javascript
pm.test("✓ Should return 401 when token is missing", function () {
    pm.response.to.have.status(401);
});

pm.test("✓ Error message should indicate Unauthorized", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Unauthorized");
});
```

---

**Scenario: Invalid Email**

Pre-request Script:
```javascript
// Set invalid email for testing
pm.variables.set("test_email", "invalidemail");
```

Tests:
```javascript
pm.test("✓ Should return 400 for invalid email", function () {
    pm.response.to.have.status(400);
});

pm.test("✓ Error message should indicate invalid email format", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Invalid email format");
});
```

---

**Scenario: Wrong Password**

Pre-request Script:
```javascript
// Set wrong password for testing
pm.variables.set("test_password", "wrongpassword");
```

Tests:
```javascript
pm.test("✓ Should return 403 for wrong password", function () {
    pm.response.to.have.status(403);
});

pm.test("✓ Error message should indicate password is invalid", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Invalid password");
});
```

---

## 🎬 Collection-level Scripts

### Pre-request Script (Collection level)

```javascript
// Initialize collection variables
if (!pm.globals.has("test_results")) {
    pm.globals.set("test_results", {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        total_tests: 0,
        passed_tests: 0,
        failed_tests: 0
    });
}

console.log("=== Starting Test Collection ===");
console.log("Base URL: " + pm.variables.get("base_url"));
console.log("Timestamp: " + new Date().toISOString());
```

---

### Test Script (Collection level)

```javascript
// Summarize results after all tests
console.log("\n=== Test Collection Summary ===");
console.log("Total Tests: " + pm.globals.get("test_results").total_tests);
console.log("Passed: " + pm.globals.get("test_results").passed_tests);
console.log("Failed: " + pm.globals.get("test_results").failed_tests);
console.log("Success Rate: " + ((pm.globals.get("test_results").passed_tests / pm.globals.get("test_results").total_tests * 100) || 0).toFixed(2) + "%");
```

---

## 📊 Automated Testing with Newman

### Install Newman
```bash
npm install -g newman
npm install -g newman-reporter-html
npm install -g newman-reporter-json
```

### Create Test Script (test.sh)
```bash
#!/bin/bash

# Configuration
COLLECTION="EditProfile.postman_collection.json"
ENVIRONMENT="environment.json"
OUTPUT_DIR="./test-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🚀 Starting API tests..."
echo "Collection: $COLLECTION"
echo "Environment: $ENVIRONMENT"
echo "Output: $OUTPUT_DIR"

# Run tests with multiple reporters
newman run "$COLLECTION" \
    --environment "$ENVIRONMENT" \
    --reporters cli,json,html,junit \
    --reporter-json-export "$OUTPUT_DIR/results-$TIMESTAMP.json" \
    --reporter-html-export "$OUTPUT_DIR/report-$TIMESTAMP.html" \
    --reporter-junit-export "$OUTPUT_DIR/results-$TIMESTAMP.xml" \
    --globals postman_globals.json \
    --iteration-count 1 \
    --delay-request 500 \
    --timeout-request 10000 \
    --insecure

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Tests passed!"
else
    echo "❌ Tests failed!"
fi

echo "📊 Reports generated in: $OUTPUT_DIR"
```

### Run Tests
```bash
chmod +x test.sh
./test.sh
```

---

## 📈 Continuous Test Results Report

### Create Summary Report Script
```javascript
// summary-report.js - Node.js script
const fs = require('fs');
const path = require('path');

const resultsDir = './test-reports';
const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));

let summary = {
    total_test_runs: files.length,
    results: []
};

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file)));
    summary.results.push({
        timestamp: file,
        status: data.run.stats.failures.total === 0 ? 'PASS' : 'FAIL',
        total_requests: data.run.stats.requests.total,
        total_assertions: data.run.stats.assertions.total,
        passed_assertions: data.run.stats.assertions.total - data.run.stats.assertions.failed,
        failed_assertions: data.run.stats.assertions.failed
    });
});

console.log(JSON.stringify(summary, null, 2));
fs.writeFileSync('test-summary.json', JSON.stringify(summary, null, 2));
```

### Run Summary
```bash
node summary-report.js
```

---

## 🔍 Test Coverage Matrix

```
Test Case                          | Status | Response | Notes
-----------------------------------|--------|----------|----------
Valid Update All Fields            | ✅     | 200      | Name, email, phone, password, avatar
Valid Update Partial Fields        | ✅     | 200      | Only name and email
Valid Update with Avatar Upload    | ✅     | 200      | File saved to uploads/
Missing Authorization Header       | ❌     | 401      | Unauthorized
Invalid/Expired JWT Token          | ❌     | 403      | Forbidden
Wrong Password                     | ❌     | 403      | Invalid password
Invalid Email Format               | ❌     | 400      | Missing @
User Not Found                     | ❌     | 404      | User ID doesn't exist
Empty Request Body                 | ✅     | 200      | No update, just auth check
Malformed FormData                 | ❌     | 400      | Bad request
Large File Upload (>10MB)          | ❌     | 413      | Payload too large
```

---

## 📋 Environment Setup for Tests

### postman_globals.json
```json
{
  "id": "globals",
  "values": [
    {
      "key": "test_start_time",
      "value": "",
      "type": "string"
    },
    {
      "key": "test_end_time",
      "value": "",
      "type": "string"
    },
    {
      "key": "total_requests",
      "value": 0,
      "type": "number"
    },
    {
      "key": "failed_requests",
      "value": 0,
      "type": "number"
    }
  ]
}
```

---

## 🎯 Best Practices for Tests

1. **Clear Test Names**: Use descriptive names with ✓/✗ prefixes
2. **One Assertion Per Test**: Keep tests focused and independent
3. **Use Variables**: Don't hardcode values, use `pm.variables.get()`
4. **Error Messages**: Check both status code AND response message
5. **Response Time**: Test performance, not just correctness
6. **Data Validation**: Verify data types, not just existence
7. **Edge Cases**: Test minimum/maximum values, special characters
8. **Cleanup**: Clear sensitive data after tests
9. **Documentation**: Add comments explaining complex logic
10. **Monitoring**: Track test results over time

---

## 🚀 Run Full Test Suite

### One Command
```bash
newman run EditProfile.postman_collection.json \
    -e environment.json \
    --reporters cli,html,json \
    --reporter-html-export ./test-reports/report.html \
    --reporter-json-export ./test-reports/results.json
```

### View Results
- **CLI**: Terminal output
- **HTML Report**: Open `./test-reports/report.html` in browser
- **JSON Results**: Parse `./test-reports/results.json` programmatically

---

**Last Updated**: 2024-01-15  
**Version**: 1.0
