# Security Vulnerability Testing Guide

## Your Admin Page
- **URL**: `http://oasisimggh.org/dashboard/login.html`
- **Status**: ⚠️ Using HTTP (not HTTPS)

---

## Test 1: Can You Access Users List Without Login?

### What We're Testing
Try to access the users API endpoint WITHOUT logging in first.

### Step-by-Step (Using Browser Address Bar)

1. **Open a new browser tab**
2. **Copy and paste this URL**:
   ```
   http://oasisimggh.org/api/admin/users
   ```
3. **Press Enter**

### What You Should See

**If SECURE (Good):**
```json
{
  "success": false,
  "message": "Unauthorized - please login first",
  "errors": ["No token provided"]
}
```
✅ This means only logged-in users can access it.

**If INSECURE (Bad):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user1",
      "email": "admin@oasisimggh.org",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "createdAt": "2026-06-18T10:30:00Z"
    },
    {
      "id": "user2",
      "email": "john@oasisimggh.org",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "createdAt": "2026-06-18T11:00:00Z"
    }
  ],
  "message": "Users retrieved"
}
```
❌ This means ANYONE can see all users without logging in!

---

## Test 2: Can You Access Specific User Data?

### What We're Testing
Try to get details of a specific user WITHOUT login.

### Step-by-Step

1. **Open a new browser tab**
2. **Copy and paste this URL** (replace `user1` with any user ID):
   ```
   http://oasisimggh.org/api/admin/users/user1
   ```
3. **Press Enter**

### What You Should See

**If SECURE:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": ["No token provided"]
}
```
✅ Good - user data is protected.

**If INSECURE:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user1",
      "email": "admin@oasisimggh.org",
      "firstName": "Admin",
      "lastName": "User",
      "phone": "+233559554262",
      "role": "super_admin",
      "status": "active",
      "createdAt": "2026-06-18T10:30:00Z"
    }
  },
  "message": "User retrieved"
}
```
❌ Bad - user profile is exposed.

---

## Test 3: Can You List All Courses?

### What We're Testing
Access courses data without authentication.

### Step-by-Step

1. **Open a new browser tab**
2. **Paste this URL**:
   ```
   http://oasisimggh.org/api/courses
   ```
3. **Press Enter**

### What You Should See

**If SECURE:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**If INSECURE:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course1",
      "title": "Advanced TypeScript",
      "description": "Learn TypeScript deeply",
      "createdBy": "instructor1",
      "createdAt": "2026-06-18T10:30:00Z"
    }
  ]
}
```

---

## Test 4: Can You Access Payment Data?

### What We're Testing
Access sensitive payment information.

### Step-by-Step

1. **Open a new browser tab**
2. **Paste this URL**:
   ```
   http://oasisimggh.org/api/payments
   ```
3. **Press Enter**

### What You Should See

**If SECURE:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**If INSECURE:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment1",
      "userId": "user1",
      "amount": 50000,
      "currency": "GHS",
      "status": "success",
      "reference": "PAY-12345",
      "createdAt": "2026-06-18T10:30:00Z"
    }
  ]
}
```

---

## Test 5: Can You Access KYC Data (Identity Info)?

### What We're Testing
Access personal identification data.

### Step-by-Step

1. **Open a new browser tab**
2. **Paste this URL**:
   ```
   http://oasisimggh.org/api/kyc
   ```
3. **Press Enter**

### What You Should See

**If SECURE:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**If INSECURE:**
```json
{
  "success": true,
  "data": [
    {
      "id": "kyc1",
      "userId": "user1",
      "firstName": "John",
      "lastName": "Doe",
      "idNumber": "GHA-123456789",
      "idType": "PASSPORT",
      "status": "approved",
      "approvedAt": "2026-06-18T10:30:00Z"
    }
  ]
}
```

---

## Test 6: Try SQL Injection (Check Database Protection)

### What We're Testing
If the API is vulnerable to SQL injection attacks.

### Step-by-Step

1. **Open a new browser tab**
2. **Paste this URL** (this is a common SQL injection test):
   ```
   http://oasisimggh.org/api/admin/users?search=' OR '1'='1
   ```
3. **Press Enter**

### What You Should See

**If SECURE (Prisma protects you):**
```json
{
  "success": false,
  "message": "Invalid search parameter" 
  // or similar validation error
}
```
✅ Good - database is protected.

**If INSECURE:**
```json
{
  "success": true,
  "data": [
    // ALL users returned (SQL injection worked!)
  ]
}
```
❌ Bad - database might be vulnerable.

---

## Test 7: Check for Exposed API Documentation

### What We're Testing
If your API documentation is publicly accessible (might expose endpoints).

### Step-by-Step

Try these common documentation URLs:

1. **Swagger UI**:
   ```
   http://oasisimggh.org/api/docs
   ```

2. **OpenAPI**:
   ```
   http://oasisimggh.org/api/openapi.json
   ```

3. **API Documentation**:
   ```
   http://oasisimggh.org/api/documentation
   ```

### What You Should See

**If SECURE:**
- 404 Not Found (documentation is not exposed)

**If INSECURE:**
- Swagger UI showing all endpoints
- JSON file with full API structure
- This helps attackers understand your API

---

## Test 8: Check CORS Headers (Cross-Origin Requests)

### Using Browser DevTools

1. **Right-click on your admin page**
2. **Click "Inspect" or press F12**
3. **Go to "Console" tab**
4. **Paste this code**:

```javascript
fetch('http://oasisimggh.org/api/admin/users')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.log('Error:', e))
```

5. **Press Enter**

### What You Should See

**If SECURE:**
```
Error: Access to fetch at 'http://oasisimggh.org/api/admin/users' from origin 'different-domain.com' has been blocked by CORS policy
```
✅ Good - CORS is restricting access.

**If INSECURE:**
```json
{
  "success": true,
  "data": [
    // Users list returned!
  ]
}
```
❌ Bad - anyone from any domain can access your API.

---

## Results Summary

Fill in your test results:

| Test | URL | Result | Secure? |
|------|-----|--------|---------|
| Users List | `/api/admin/users` | ✅ or ❌ | YES / NO |
| Single User | `/api/admin/users/[id]` | ✅ or ❌ | YES / NO |
| Courses | `/api/courses` | ✅ or ❌ | YES / NO |
| Payments | `/api/payments` | ✅ or ❌ | YES / NO |
| KYC Data | `/api/kyc` | ✅ or ❌ | YES / NO |
| SQL Injection | `/api/admin/users?search=...` | ✅ or ❌ | YES / NO |
| HTTPS | Admin Page | HTTP / HTTPS | NO / YES |

---

## What Each Result Means

### ✅ SECURE Results
- API returns "Unauthorized" or "403 Forbidden"
- No user data visible without login token
- HTTPS is enabled
- Documentation is not exposed
- CORS restrictions are in place

### ❌ INSECURE Results
- API returns user data without login
- Credentials visible in requests
- Using HTTP (not HTTPS)
- Public API documentation
- CORS allows any domain

---

## Next Steps

**If you found security issues:**
1. Let me know what you found
2. I'll create a **bugfix spec** to fix each vulnerability
3. We'll add proper authentication, HTTPS, and protection

**Common Fixes:**
- Add authentication middleware to all endpoints
- Enable HTTPS/SSL certificates
- Add rate limiting
- Restrict CORS to trusted domains only
- Hide API documentation from public
- Use Prisma (which protects against SQL injection)

---

**Run these tests now and tell me what you find!**
