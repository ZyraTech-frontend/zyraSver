# 🎓 Postman Beginner Tutorial - Step by Step

**For New Postman Users - Learn as You Go**

---

## Part 1: What is Postman?

Postman is a tool for **testing APIs**. Think of it like a web browser, but instead of visiting websites, you're testing your backend API endpoints.

### What You'll Learn
- How to make API requests
- How to check responses
- How to test all endpoints
- How to save tokens for future requests

---

## Part 2: Setup (Do This First!)

### Step 1: Download & Install Postman
1. Go to: https://www.postman.com/downloads/
2. Download for your OS (Windows/Mac/Linux)
3. Install and open it

### Step 2: Create a New Collection
A **collection** is like a folder that holds all your API requests.

**Steps:**
1. Open Postman
2. Click **"Create"** button (top left)
3. Click **"Collection"**
4. Name it: `ZyraTech Hub API`
5. Click **"Create"**

### Step 3: Create an Environment
An **environment** stores variables (like your API URL and tokens) that you'll reuse.

**Steps:**
1. Click the **gear icon** (top right)
2. Click **"Environments"**
3. Click **"Create New"**
4. Name it: `ZyraTech-Development`
5. Add these variables:

| Variable | Value | Type |
|----------|-------|------|
| BASE_URL | http://localhost:5000/api | string |
| ACCESS_TOKEN | (leave blank - we'll fill this after login) | string |
| REFRESH_TOKEN | (leave blank - we'll fill this after login) | string |

6. Click **"Save"**

### Step 4: Select Your Environment
1. Top right corner, find the **environment dropdown** (currently says "No environment")
2. Select **"ZyraTech-Development"**

✅ **Now you're ready to test APIs!**

---

## Part 3: First API Request - Login

Let's test the **Login endpoint**. This is the most important one!

### What We're Testing
- **Endpoint**: `POST /api/auth/login`
- **What it does**: Logs in a user and returns a token
- **Why**: We need this token to test other endpoints

### Step-by-Step: Create Login Request

#### Step 1: Create a New Request
1. In your collection `ZyraTech Hub API`, click the **+** icon (or right-click → Add Request)
2. Name it: **1. Login**
3. Click **"Save to ZyraTech Hub API"**

#### Step 2: Set Request Type & URL
1. Change the method from **GET** to **POST** (dropdown on left)
2. In the URL field, paste:
   ```
   {{BASE_URL}}/auth/login
   ```
   (This uses the variable we created)

#### Step 3: Add Headers
1. Click the **"Headers"** tab
2. Add this header:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 4: Add Request Body (JSON)
1. Click the **"Body"** tab
2. Select **"raw"** (radio button)
3. Select **"JSON"** from the dropdown
4. Paste this in the text area:

```json
{
  "email": "admin@zyratechhub.com",
  "password": "TestPassword123!"
}
```

#### Step 5: Send the Request
1. Click the **blue "Send"** button
2. Wait for response...

### What You Should See

**Response (if successful):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123xyz",
      "email": "admin@zyratechhub.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "status": "active"
    }
  },
  "message": "Login successful"
}
```

**Response (if failed):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": [...]
}
```

### Save the Token for Later Use

Now we need to save the token so we can use it in other requests.

**Steps:**
1. Click the **"Tests"** tab (next to Body)
2. Paste this code:

```javascript
// Save token to environment variable
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", jsonData.data.token);
  pm.environment.set("REFRESH_TOKEN", jsonData.data.refreshToken);
}
```

3. Click **"Send"** again
4. Now check your **environment** - the tokens should be saved!

✅ **First endpoint done! You now have a login token.**

---

## Part 4: Second Endpoint - Get Current User

Now let's use the token we just got.

### What We're Testing
- **Endpoint**: `GET /api/auth/me`
- **What it does**: Returns the current logged-in user info
- **Why**: Verify authentication is working

### Step-by-Step: Create Get Current User Request

#### Step 1: Create New Request
1. Click **+** in your collection
2. Name it: **2. Get Current User**
3. Click **"Save to ZyraTech Hub API"**

#### Step 2: Set Method & URL
1. Change method to **GET** (dropdown)
2. In URL field, paste:
   ```
   {{BASE_URL}}/auth/me
   ```

#### Step 3: Add Authorization Header
1. Click **"Headers"** tab
2. Add header:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |

**Important**: The word **"Bearer"** followed by a space, then the variable!

#### Step 4: Send Request
1. Click **Send**
2. You should see the current user data

**Response (success):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "abc123xyz",
      "email": "admin@zyratechhub.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "status": "active",
      "createdAt": "2026-06-18T10:30:00Z",
      "lastLogin": "2026-06-18T10:35:00Z"
    }
  },
  "message": "User retrieved"
}
```

✅ **Second endpoint done! You used the token in the request.**

---

## Part 5: Third Endpoint - List Users (Super Admin Only)

This endpoint shows all users in the system. Only super admin can use it.

### What We're Testing
- **Endpoint**: `GET /api/admin/users`
- **What it does**: Lists all users with pagination
- **Access**: Super Admin only
- **Why**: Test that our user management works

### Step-by-Step: Create List Users Request

#### Step 1: Create New Request
1. Click **+** in your collection
2. Name it: **3. List All Users**
3. Save to collection

#### Step 2: Set Method & URL
1. Method: **GET**
2. URL:
   ```
   {{BASE_URL}}/admin/users?page=1&limit=20
   ```

**What those parameters mean:**
- `page=1` - Show page 1 (first 20 users)
- `limit=20` - Show 20 users per page

#### Step 3: Add Authorization Header
1. Click **"Headers"** tab
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |
| Content-Type | application/json |

#### Step 4: Send Request
1. Click **Send**

**Response (success):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user1",
      "email": "admin@zyratechhub.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "super_admin",
      "status": "active",
      "createdAt": "2026-06-18T10:30:00Z"
    },
    {
      "id": "user2",
      "email": "john@zyratechhub.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-06-18T11:00:00Z"
    }
  ],
  "message": "Users retrieved",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**meta** = Pagination info (total users, current page, etc)

✅ **Third endpoint done! You're testing like a pro!**

---

## Part 6: Fourth Endpoint - Create a New User

Now we'll create a new user (super admin only).

### What We're Testing
- **Endpoint**: `POST /api/admin/users`
- **What it does**: Creates a new user in the system
- **Access**: Super Admin only
- **Why**: Test user creation

### Step-by-Step: Create User Request

#### Step 1: Create New Request
1. Click **+** in collection
2. Name it: **4. Create New User**
3. Save

#### Step 2: Set Method & URL
1. Method: **POST**
2. URL:
   ```
   {{BASE_URL}}/admin/users
   ```

#### Step 3: Add Headers
1. Click **"Headers"** tab
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |
| Content-Type | application/json |

#### Step 4: Add Request Body
1. Click **"Body"** tab
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "email": "jane@zyratechhub.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+233559554262",
  "role": "admin",
  "password": "SecurePassword123!"
}
```

**What each field means:**
- `email` - Unique email address
- `firstName` - User's first name
- `lastName` - User's last name
- `phone` - Contact number
- `role` - User type (super_admin, admin, editor, student, partner)
- `password` - Initial password (must have uppercase, lowercase, number, special char)

#### Step 5: Send Request
1. Click **Send**

**Response (success):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id-xyz",
      "email": "jane@zyratechhub.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-06-18T12:30:00Z"
    }
  },
  "message": "User created successfully"
}
```

**Save the new user ID** for testing other endpoints:
1. Click **"Tests"** tab
2. Add:

```javascript
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("NEW_USER_ID", jsonData.data.user.id);
}
```

✅ **Fourth endpoint done! You can now create users!**

---

## Part 7: Fifth Endpoint - Get Single User

Retrieve details of one specific user.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **5. Get Single User**

#### Step 2: Set Method & URL
1. Method: **GET**
2. URL:
   ```
   {{BASE_URL}}/admin/users/{{NEW_USER_ID}}
   ```
   (Uses the ID we saved from creating a user)

#### Step 3: Add Header
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |

#### Step 4: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id-xyz",
      "email": "jane@zyratechhub.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-06-18T12:30:00Z",
      "lastLogin": null
    }
  },
  "message": "User retrieved"
}
```

✅ **Fifth endpoint done!**

---

## Part 8: Sixth Endpoint - Update User

Update an existing user's details.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **6. Update User**

#### Step 2: Set Method & URL
1. Method: **PUT** (not POST!)
2. URL:
   ```
   {{BASE_URL}}/admin/users/{{NEW_USER_ID}}
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "firstName": "Janet",
  "lastName": "Smith-Jones",
  "phone": "+233559554263"
}
```

**Note**: Only include fields you want to update. Others will stay the same.

#### Step 5: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id-xyz",
      "firstName": "Janet",
      "lastName": "Smith-Jones",
      "phone": "+233559554263",
      "role": "admin",
      "status": "active"
    }
  },
  "message": "User updated successfully"
}
```

✅ **Sixth endpoint done!**

---

## Part 9: Seventh Endpoint - Change User Role

Change a user's role (admin, editor, student, etc).

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **7. Change User Role**

#### Step 2: Set Method & URL
1. Method: **PATCH** (not PUT or POST!)
2. URL:
   ```
   {{BASE_URL}}/admin/users/{{NEW_USER_ID}}/role
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "role": "editor"
}
```

**Available roles:**
- super_admin
- admin
- editor
- student
- partner

#### Step 5: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id-xyz",
      "role": "editor",
      "status": "active"
    }
  },
  "message": "User role changed successfully"
}
```

✅ **Seventh endpoint done!**

---

## Part 10: Eighth Endpoint - Suspend User

Suspend (deactivate) a user.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **8. Suspend User**

#### Step 2: Set Method & URL
1. Method: **PATCH**
2. URL:
   ```
   {{BASE_URL}}/admin/users/{{NEW_USER_ID}}/suspend
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "suspend": true
}
```

**To activate later, use:**
```json
{
  "suspend": false
}
```

#### Step 5: Send
1. Click **Send**

**Response (when suspended):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id-xyz",
      "status": "suspended"
    }
  },
  "message": "User suspended successfully"
}
```

✅ **Eighth endpoint done!**

---

## Part 11: Ninth Endpoint - Delete User

Delete a user from the system.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **9. Delete User**

#### Step 2: Set Method & URL
1. Method: **DELETE** (not POST!)
2. URL:
   ```
   {{BASE_URL}}/admin/users/{{NEW_USER_ID}}
   ```

#### Step 3: Add Header
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |

**Note**: DELETE requests usually don't have a body

#### Step 4: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "User deleted successfully"
}
```

✅ **Ninth endpoint done!**

---

## Part 12: Tenth Endpoint - Refresh Token

When your access token expires (15 minutes), use this to get a new one.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **10. Refresh Token**

#### Step 2: Set Method & URL
1. Method: **POST**
2. URL:
   ```
   {{BASE_URL}}/auth/refresh
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "refreshToken": "{{REFRESH_TOKEN}}"
}
```

#### Step 5: Send & Save New Token
1. Click **Send**
2. Add this to **"Tests"** tab:

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", jsonData.data.token);
  pm.environment.set("REFRESH_TOKEN", jsonData.data.refreshToken);
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (new token)",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (new refresh token)"
  },
  "message": "Token refreshed"
}
```

✅ **Tenth endpoint done!**

---

## Part 13: Eleventh Endpoint - Logout

End the user session.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **11. Logout**

#### Step 2: Set Method & URL
1. Method: **POST**
2. URL:
   ```
   {{BASE_URL}}/auth/logout
   ```

#### Step 3: Add Header
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Authorization | Bearer {{ACCESS_TOKEN}} |

#### Step 4: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Logged out successfully"
}
```

✅ **Eleventh endpoint done!**

---

## Part 14: Twelfth Endpoint - Forgot Password

Request a password reset.

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **12. Forgot Password**

#### Step 2: Set Method & URL
1. Method: **POST**
2. URL:
   ```
   {{BASE_URL}}/auth/forgot-password
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "email": "jane@zyratechhub.com"
}
```

#### Step 5: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "If an account exists, a password reset link has been sent"
}
```

✅ **Twelfth endpoint done!**

---

## Part 15: Thirteenth Endpoint - Reset Password

Reset password with token (from email).

### Step-by-Step

#### Step 1: Create New Request
1. Click **+**
2. Name it: **13. Reset Password**

#### Step 2: Set Method & URL
1. Method: **POST**
2. URL:
   ```
   {{BASE_URL}}/auth/reset-password
   ```

#### Step 3: Add Headers
1. Click **"Headers"**
2. Add:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 4: Add Body
1. Click **"Body"**
2. Select **"raw"** and **"JSON"**
3. Paste:

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword789!"
}
```

**Note**: In real use, you'll get the token from the email link

#### Step 5: Send
1. Click **Send**

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Password reset successfully"
}
```

✅ **All 13 endpoints done!**

---

## Summary: Your Postman Collection

You now have **13 complete endpoints** in your Postman collection:

```
1. Login ✅
2. Get Current User ✅
3. List All Users ✅
4. Create New User ✅
5. Get Single User ✅
6. Update User ✅
7. Change User Role ✅
8. Suspend User ✅
9. Delete User ✅
10. Refresh Token ✅
11. Logout ✅
12. Forgot Password ✅
13. Reset Password ✅
```

---

## Key Takeaways

### HTTP Methods
- **GET** = Retrieve data
- **POST** = Create new data
- **PUT** = Update all fields
- **PATCH** = Update specific fields
- **DELETE** = Remove data

### Authorization
- Always include: `Authorization: Bearer {{ACCESS_TOKEN}}`
- For login: Don't include authorization (no token yet)

### Response Codes
- **200** = Success
- **201** = Created successfully
- **400** = Bad request (check your JSON)
- **401** = Unauthorized (check your token)
- **403** = Forbidden (not allowed)
- **404** = Not found
- **409** = Conflict (email already exists)
- **500** = Server error

### Variables
- `{{BASE_URL}}` = http://localhost:5000/api
- `{{ACCESS_TOKEN}}` = Your login token
- `{{NEW_USER_ID}}` = ID of user you created

---

## Next Time

Tomorrow you can:
1. Test all these endpoints
2. Try different values
3. See how errors work
4. Test with your team
5. Build Module 3 endpoints

---

**You're now a Postman expert!** 🎉

