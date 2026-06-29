# Postman Testing Guide - Simple & Clear

This is a **hands-on guide**. Do exactly what it says, step by step.

---

## PART 1: Setup (One Time Only)

### Step 1: Open Postman
- Download from postman.com
- Create account and login
- You'll see a blank screen

### Step 2: Create a Collection
- Click **"Collections"** on the left
- Click **"+ Create New Collection"**
- Name it: `ZyraTech API`
- Click **Create**

### Step 3: Create an Environment
Environments store your variables (like base URL and token).

- Click **"Environments"** on the left
- Click **"+ Create New Environment"**
- Name it: `Local Development`
- Add these variables:

| Variable | Initial Value | Current Value |
|----------|---|---|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `accessToken` | (empty) | (empty) |
| `refreshToken` | (empty) | (empty) |

- Click **Save**

### Step 4: Select Your Environment
- Top right of Postman, you'll see a dropdown
- Select **"Local Development"**

---

## PART 2: Testing the Endpoints

### ⚠️ IMPORTANT: Server Must Be Running
Before testing ANY endpoint, start your backend server:

```bash
cd backend
npm start
```

Wait for: `Server running on http://localhost:3000`

---

## TEST 1: Login (Get Your Token)

**This is your first test. Do this first.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **POST** (dropdown on left)
3. In the URL bar, paste:
   ```
   {{baseUrl}}/auth/login
   ```

4. Click **"Body"** tab below
5. Click **"raw"** radio button
6. Change dropdown from **"Text"** to **"JSON"**
7. Paste this JSON:
   ```json
   {
     "email": "superadmin@zyratech.com",
     "password": "SuperAdmin@123"
   }
   ```

8. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "superadmin@zyratech.com",
      "role": "super_admin",
      "name": "Super Admin"
    }
  }
}
```

### Save Your Token:

1. Copy the **accessToken** value (the long string)
2. Click **"Environments"** on left
3. Click **"Local Development"**
4. Find the **accessToken** row
5. Click in the **"Current Value"** column
6. Paste your token
7. Click **Save**

**Now your token is saved. Next requests will use it automatically.**

---

## TEST 2: Get Your User Info

**Use this to verify your login worked.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Keep it as **GET**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/auth/me
   ```

4. Click **"Headers"** tab below
5. You'll see two headers already added:
   - `Authorization` with value `Bearer {{accessToken}}`
   - `Content-Type` with value `application/json`

6. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-id",
    "email": "superadmin@zyratech.com",
    "role": "super_admin",
    "name": "Super Admin",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

✅ **If you see this, your login is working!**

---

## TEST 3: Create a New Admin User

**Only Super Admin can do this.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **POST**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users
   ```

4. Click **"Headers"** tab - your auth headers are already there ✅

5. Click **"Body"** tab
6. Click **"raw"** radio button
7. Make sure **"JSON"** is selected
8. Paste this JSON:
   ```json
   {
     "email": "admin1@zyratech.com",
     "name": "Admin One",
     "role": "admin",
     "department": "ADMISSIONS"
   }
   ```

9. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User created successfully",
  "data": {
    "id": "new-user-id",
    "email": "admin1@zyratech.com",
    "name": "Admin One",
    "role": "admin",
    "department": "ADMISSIONS",
    "createdAt": "2025-01-15T10:35:00Z"
  }
}
```

---

## TEST 4: List All Users

**Only Super Admin can do this.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Keep it as **GET**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users
   ```

4. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user-1",
        "email": "superadmin@zyratech.com",
        "name": "Super Admin",
        "role": "super_admin"
      },
      {
        "id": "user-2",
        "email": "admin1@zyratech.com",
        "name": "Admin One",
        "role": "admin"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  }
}
```

---

## TEST 5: Get a Single User

**Replace `:id` with an actual user ID from the list above.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Keep it as **GET**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users/user-2
   ```
   (Replace `user-2` with a real user ID from your system)

4. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-2",
    "email": "admin1@zyratech.com",
    "name": "Admin One",
    "role": "admin",
    "department": "ADMISSIONS",
    "createdAt": "2025-01-15T10:35:00Z"
  }
}
```

---

## TEST 6: Update a User

**Replace `:id` with an actual user ID.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **PUT**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users/user-2
   ```

4. Click **"Body"** tab
5. Click **"raw"** and **"JSON"**
6. Paste this JSON:
   ```json
   {
     "name": "Admin One Updated",
     "department": "FINANCE"
   }
   ```

7. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-2",
    "email": "admin1@zyratech.com",
    "name": "Admin One Updated",
    "role": "admin",
    "department": "FINANCE"
  }
}
```

---

## TEST 7: Change User Role

**Replace `:id` with an actual user ID.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **PATCH**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users/user-2/role
   ```

4. Click **"Body"** tab
5. Click **"raw"** and **"JSON"**
6. Paste this JSON:
   ```json
   {
     "role": "department_head"
   }
   ```

7. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User role updated successfully",
  "data": {
    "id": "user-2",
    "role": "department_head"
  }
}
```

---

## TEST 8: Suspend a User

**Replace `:id` with an actual user ID.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **PATCH**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users/user-2/suspend
   ```

4. Click **"Body"** tab
5. Click **"raw"** and **"JSON"**
6. Paste this JSON:
   ```json
   {
     "suspended": true,
     "reason": "Account needs review"
   }
   ```

7. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User suspended successfully",
  "data": {
    "id": "user-2",
    "suspended": true
  }
}
```

---

## TEST 9: Delete a User

**Replace `:id` with an actual user ID. You can't delete yourself.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **DELETE**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/users/user-2
   ```

4. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "User deleted successfully",
  "data": {
    "id": "user-2"
  }
}
```

---

## TEST 10: Logout

**End your session.**

### In Postman:

1. Click **"+ Tab"** to create a new request
2. Change **GET** to **POST**
3. In the URL bar, paste:
   ```
   {{baseUrl}}/auth/logout
   ```

4. Your auth headers are already there
5. Click **"Send"**

### What You Should See:

```json
{
  "status": true,
  "message": "Logout successful"
}
```

---

## QUICK REFERENCE: All Endpoints

| Method | Endpoint | What It Does | Auth? |
|--------|----------|-------------|-------|
| POST | `/auth/login` | Login with email & password | ❌ No |
| GET | `/auth/me` | Get your user info | ✅ Yes |
| POST | `/auth/logout` | Logout | ✅ Yes |
| POST | `/auth/forgot-password` | Start password reset | ❌ No |
| POST | `/auth/reset-password` | Complete password reset | ❌ No |
| POST | `/auth/refresh` | Get new access token | ❌ No |
| GET | `/users` | List all users | ✅ Yes (Super Admin) |
| GET | `/users/:id` | Get one user | ✅ Yes (Super Admin) |
| POST | `/users` | Create new user | ✅ Yes (Super Admin) |
| PUT | `/users/:id` | Update user | ✅ Yes (Super Admin) |
| PATCH | `/users/:id/role` | Change user role | ✅ Yes (Super Admin) |
| PATCH | `/users/:id/suspend` | Suspend user | ✅ Yes (Super Admin) |
| DELETE | `/users/:id` | Delete user | ✅ Yes (Super Admin) |

---

## Common Errors & Fixes

| Error | Meaning | Fix |
|-------|---------|-----|
| `401 Unauthorized` | Token is missing or wrong | Go back to TEST 1 and save your token |
| `403 Forbidden` | You don't have permission | You need Super Admin role |
| `404 Not Found` | Endpoint doesn't exist | Check URL spelling - use `{{baseUrl}}` |
| `400 Bad Request` | Wrong data format | Check JSON in Body tab |
| `Connection refused` | Server not running | Run `npm start` in backend folder |

---

## Your Checklist

- [ ] Postman installed and logged in
- [ ] Collection created (`ZyraTech API`)
- [ ] Environment created and selected (`Local Development`)
- [ ] Server running (`npm start` in backend)
- [ ] TEST 1 passed (Login)
- [ ] TEST 2 passed (Get Me)
- [ ] TEST 3 passed (Create User)
- [ ] TEST 4 passed (List Users)
- [ ] TEST 5 passed (Get User)
- [ ] TEST 6 passed (Update User)
- [ ] TEST 7 passed (Change Role)
- [ ] TEST 8 passed (Suspend)
- [ ] TEST 9 passed (Delete)
- [ ] TEST 10 passed (Logout)

---

**That's it. You now know how to test the API. Try it.**
