# 🧪 Postman Testing Guide - ZyraTech Azure Backend

## 🎯 Base URL
```
https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net
```

---

## ✅ Step 1: Test Health Endpoint (No Auth Required)

### Request Configuration
- **Method**: `GET`
- **URL**: `https://zyratech-api.azurewebsites.net/health`
- **Headers**: None
- **Body**: None

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "ZyraTech Hub API is running",
  "environment": "production",
  "timestamp": "2026-01-27T..."
}
```

---

## 🔧 Troubleshooting Postman Connection Issues

### Issue: "Could not send request - Cloud Agent Error"

**Solution 1: Switch to Desktop Agent**
1. Look at the bottom right of Postman window
2. Click on **"Auto"** or **"Cloud Agent"** dropdown
3. Select **"Postman Desktop Agent"**
4. Try the request again

**Solution 2: Disable Postman Proxy**
1. Go to Postman Settings (⚙️ icon)
2. Click on **"Proxy"** tab
3. Make sure **"Use system proxy"** is OFF
4. Try the request again

**Solution 3: Check SSL Certificate Verification**
1. Go to Postman Settings (⚙️ icon)
2. Click on **"General"** tab
3. Turn OFF **"SSL certificate verification"** temporarily
4. Try the request again
5. (Turn it back ON after testing)

---

## 🔐 Step 2: Test Authentication Endpoints

### Register New User
- **Method**: `POST`
- **URL**: `https://zyratech-api.azurewebsites.net/api/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

### Expected Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

---

### Login User
- **Method**: `POST`
- **URL**: `https://zyratech-api.azurewebsites.net/api/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "Test123!@#"
  }
  ```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Important**: Copy the `accessToken` from the response - you'll need it for protected routes!

---

## 🔒 Step 3: Test Protected Endpoints (Requires Auth)

### Get User Profile
- **Method**: `GET`
- **URL**: `https://zyratech-api.azurewebsites.net/api/auth/me`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
  ```
  (Replace `YOUR_ACCESS_TOKEN_HERE` with the token from login/register)

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "..."
  }
}
```

---

## 📚 Other API Endpoints to Test

### Training Courses
- **GET** `/api/trainings` - Get all courses
- **GET** `/api/trainings/:id` - Get specific course
- **POST** `/api/trainings/:id/enroll` - Enroll in course (requires auth)

### Blog Articles
- **GET** `/api/blog` - Get all articles
- **GET** `/api/blog/:slug` - Get specific article

### Contact
- **POST** `/api/contact` - Submit contact form

### Gallery
- **GET** `/api/gallery` - Get all gallery items

### Projects Portfolio
- **GET** `/api/projects` - Get all projects
- **GET** `/api/projects/:id` - Get specific project

### Testimonials
- **GET** `/api/testimonials` - Get all testimonials

### Newsletter
- **POST** `/api/newsletter/subscribe` - Subscribe to newsletter

---

## 🎨 Postman Collection Setup

### Create Environment Variables (Recommended)
1. Click on **"Environments"** in Postman (left sidebar)
2. Click **"Create Environment"**
3. Name it: `ZyraTech Production`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://zyratech-api.azurewebsites.net` | `https://zyratech-api.azurewebsites.net` |
| `access_token` | (empty - will be set automatically) | (empty) |

5. **Save** the environment
6. Select it from the environment dropdown (top right)

### Use Variables in Requests
- Change URL from `https://zyratech-api.azurewebsites.net/health` to:
  ```
  {{base_url}}/health
  ```

- For Authorization header, use:
  ```
  Bearer {{access_token}}
  ```

### Auto-Set Token After Login (Advanced)
In the **Tests** tab of your login request, add this script:
```javascript
// Auto-save access token to environment
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.accessToken) {
        pm.environment.set("access_token", response.data.accessToken);
        console.log("✅ Access token saved!");
    }
}
```

Now the token will automatically save after successful login!

---

## 🚨 Common Errors & Solutions

### 401 Unauthorized
- **Cause**: Missing or invalid access token
- **Solution**: Login again and copy the new token

### 403 Forbidden
- **Cause**: You don't have permission for this resource
- **Solution**: Check if your user role has access

### 404 Not Found
- **Cause**: Wrong endpoint URL
- **Solution**: Check the endpoint path (remember `/api` prefix)

### 429 Too Many Requests
- **Cause**: Rate limit exceeded (100 requests/minute)
- **Solution**: Wait a minute and try again

### 500 Internal Server Error
- **Cause**: Server-side error
- **Solution**: Check Azure logs or contact admin

---

## 📊 Azure App Service Health Check

Before testing in Postman, verify the Azure app is running:

### Option 1: Browser
Open in your browser:
```
https://zyratech-api.azurewebsites.net/health
```

### Option 2: PowerShell/CMD
```powershell
curl https://zyratech-api.azurewebsites.net/health
```

### Option 3: Azure Portal
1. Go to https://portal.azure.com
2. Find your App Service: `zyratech-api`
3. Click on **"Overview"**
4. Check **Status** should be "Running"
5. Click on **"Log stream"** to see live logs

---

## 📝 Quick Reference

### Health Check (Test connectivity)
```
GET https://zyratech-api.azurewebsites.net/health
```

### Register
```
POST https://zyratech-api.azurewebsites.net/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```
POST https://zyratech-api.azurewebsites.net/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Protected Route Example
```
GET https://zyratech-api.azurewebsites.net/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ Success Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can access protected routes with token
- [ ] Can fetch public data (courses, blog, gallery)
- [ ] Environment variables set up in Postman
- [ ] Token auto-saves after login

---

## 🎉 You're Ready!

Your backend is now live on Azure and ready to be tested with Postman. Start with the health check, then move on to authentication, and finally test all your API endpoints.

**Pro Tip**: Create a Postman Collection for all your endpoints and share it with your frontend team!
