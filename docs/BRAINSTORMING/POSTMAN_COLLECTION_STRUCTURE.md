# Postman Collection Structure - ZyraTech Hub API
## Quick Reference for Testing with Postman

---

## ENVIRONMENT SETUP

### Variables to Create:

```
BASE_URL = http://localhost:3000/api
TOKEN = (auto-populated after login)
REFRESH_TOKEN = (auto-populated after login)
SUPER_ADMIN_ID = (for testing super-admin-only endpoints)
ADMIN_ID = (for testing admin endpoints)
STUDENT_ID = (for testing student endpoints)
COURSE_ID = (for testing enrollment)
JOB_ID = (for testing job application)
PAYMENT_REFERENCE = (returned from payment init)
```

---

## COLLECTION: MODULE 1 — AUTHENTICATION

### 1.1 Register Student
```
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "+233559554261"
}

Expected Response: 201
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "refreshToken": "...",
    "user": { "id", "name", "email", "role": "student" }
  }
}

Tests:
- pm.test("Status is 201")
- pm.test("Has token")
- pm.environment.set("TOKEN", pm.response.json().data.token)
```

### 1.2 Verify Email
```
POST {{BASE_URL}}/auth/verify-email
Content-Type: application/json

{
  "token": "email-verification-token"
}

Expected: 200 { "success": true, "message": "Email verified" }
```

### 1.3 Login (Student or Admin)
```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "admin@zyratech.com",
  "password": "AdminPass@123"
}

Expected Response: 200
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "super_admin|admin",
      "department": "Training Courses",
      "mustChangePassword": false,
      "kycStatus": "not_submitted|pending|verified|rejected",
      "accountStatus": "active|deactivated|pending_password",
      "createdAt": "timestamp",
      "lastLogin": "timestamp"
    }
  }
}

Tests:
- pm.test("Has token")
- pm.test("Role is admin or super_admin")
- pm.environment.set("TOKEN", pm.response.json().data.token)
- pm.environment.set("REFRESH_TOKEN", pm.response.json().data.refreshToken)
```

### 1.4 Change Password (Force Change on First Login)
```
POST {{BASE_URL}}/auth/change-password
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "currentPassword": "TempPassword123!",
  "newPassword": "NewSecurePass@456"
}

Expected: 200
{
  "success": true,
  "data": {
    "user": {
      "mustChangePassword": false
    }
  }
}
```

### 1.5 Submit KYC Documents
```
POST {{BASE_URL}}/auth/kyc/submit
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data

form-data:
- governmentId (file: Ghana Card scan)
- proofOfAddress (file: utility bill scan)

Expected: 200
{
  "success": true,
  "data": {
    "user": {
      "kycStatus": "pending",
      "kycSubmittedAt": "2026-06-18T10:30:00Z"
    }
  }
}
```

### 1.6 Check KYC Status
```
GET {{BASE_URL}}/auth/kyc/status
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": {
    "kycStatus": "pending|verified|rejected",
    "submittedAt": "timestamp",
    "reviewedAt": "timestamp",
    "rejectionReason": "Document illegible"
  }
}
```

### 1.7 Get Current User
```
GET {{BASE_URL}}/auth/me
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": { "user": { ... } }
}
```

### 1.8 Refresh Token
```
POST {{BASE_URL}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{REFRESH_TOKEN}}"
}

Expected: 200
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}

Tests:
- pm.environment.set("TOKEN", pm.response.json().data.token)
```

### 1.9 Forgot Password
```
POST {{BASE_URL}}/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Expected: 200
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

### 1.10 Reset Password
```
POST {{BASE_URL}}/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewPass@789"
}

Expected: 200
```

### 1.11 Logout
```
POST {{BASE_URL}}/auth/logout
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## COLLECTION: MODULE 3 — ADMIN USER MANAGEMENT (Super Admin Only)

### 3.1 List All Users
```
GET {{BASE_URL}}/admin/users?page=1&limit=20&role=admin&accountStatus=active
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "admin|super_admin",
      "department": "Training Courses",
      "accountStatus": "active|deactivated",
      "kycStatus": "verified",
      "createdAt": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 3.2 Create Admin User
```
POST {{BASE_URL}}/admin/users
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@zyratech.com",
  "phone": "+233559554262",
  "role": "admin",
  "department": "Training Courses",
  "temporaryPassword": "TempPass@123"
}

Expected: 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@zyratech.com",
      "mustChangePassword": true,
      "kycStatus": "not_submitted",
      "accountStatus": "pending_password"
    }
  },
  "message": "Admin user created. Welcome email sent."
}

Tests:
- pm.test("User created with mustChangePassword = true")
- pm.test("KYC status is not_submitted")
```

### 3.3 Get User KYC Documents
```
GET {{BASE_URL}}/admin/users/{{ADMIN_ID}}/kyc
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": {
    "kycStatus": "pending",
    "documents": {
      "governmentId": {
        "url": "https://res.cloudinary.com/.../governmentId.jpg",
        "filename": "ghana_card.jpg",
        "uploadedAt": "2026-06-18T10:30:00Z"
      },
      "proofOfAddress": {
        "url": "https://res.cloudinary.com/.../proofOfAddress.pdf",
        "filename": "utility_bill.pdf",
        "uploadedAt": "2026-06-18T10:30:00Z"
      }
    },
    "submittedAt": "2026-06-18T10:30:00Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "rejectionReason": null
  }
}
```

### 3.4 Approve KYC
```
PATCH {{BASE_URL}}/admin/users/{{ADMIN_ID}}/kyc/approve
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": {
    "user": {
      "kycStatus": "verified",
      "kycReviewedAt": "2026-06-18T11:00:00Z"
    }
  }
}
```

### 3.5 Reject KYC
```
PATCH {{BASE_URL}}/admin/users/{{ADMIN_ID}}/kyc/reject
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "reason": "Document quality is too low, please resubmit a clearer photo"
}

Expected: 200
{
  "success": true,
  "data": {
    "user": {
      "kycStatus": "rejected",
      "kycRejectionReason": "Document quality is too low..."
    }
  }
}
```

### 3.6 Deactivate User
```
PATCH {{BASE_URL}}/admin/users/{{ADMIN_ID}}/deactivate
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "reason": "Left the company"
}

Expected: 200
{
  "success": true,
  "data": {
    "user": {
      "accountStatus": "deactivated",
      "deactivatedAt": "2026-06-18T11:00:00Z"
    }
  }
}
```

---

## COLLECTION: MODULE 4 — FILE UPLOADS

### 4.1 Upload Single Image
```
POST {{BASE_URL}}/uploads/image
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data

form-data:
- file (type: File, select an image)
- description (type: Text, "Course hero image")

Expected: 200
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "url": "https://res.cloudinary.com/zyratech/image/upload/v1687084800/courses/hero_abc123.webp",
    "filename": "hero_abc123.webp",
    "mimetype": "image/webp",
    "size": 245000,
    "uploadedAt": "2026-06-18T10:30:00Z"
  }
}

Tests:
- pm.test("URL is from cloudinary")
- pm.test("Size is less than 5MB")
```

### 4.2 Upload Document
```
POST {{BASE_URL}}/uploads/document
Authorization: Bearer {{TOKEN}}
Content-Type: multipart/form-data

form-data:
- file (type: File, select a PDF)
- type (type: Text, "resume")

Expected: 200
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "url": "https://res.cloudinary.com/.../resume_john.pdf",
    "filename": "resume_john.pdf",
    "size": 1024000,
    "uploadedAt": "2026-06-18T10:30:00Z"
  }
}
```

### 4.3 Delete File
```
DELETE {{BASE_URL}}/uploads/{{FILE_ID}}
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## COLLECTION: MODULE 5 — TRAINING COURSES

### 5.1 List Public Courses
```
GET {{BASE_URL}}/training-courses?page=1&limit=12&category=web&level=beginner&search=react
Content-Type: application/json

Expected: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "React Masterclass",
      "slug": "react-masterclass",
      "shortDescription": "Learn React from basics to advanced",
      "price": 50000,
      "category": "web",
      "level": "beginner",
      "image": "https://res.cloudinary.com/...",
      "enrollmentCount": 245,
      "rating": 4.8,
      "featured": true,
      "duration": "12 weeks"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

### 5.2 Get Course Detail
```
GET {{BASE_URL}}/training-courses/react-masterclass

Expected: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "React Masterclass",
    "slug": "react-masterclass",
    "description": "Comprehensive HTML description",
    "price": 50000,
    "discountPrice": 40000,
    "category": "web",
    "level": "beginner",
    "image": "https://...",
    "curriculum": [
      {
        "title": "Module 1: Basics",
        "topics": ["JSX", "Components", "State"],
        "duration": "2 weeks"
      }
    ],
    "instructors": [
      {
        "name": "John Instructor",
        "title": "Senior Developer",
        "avatar": "https://..."
      }
    ],
    "tools": ["React", "Redux", "TypeScript"],
    "prerequisites": ["JavaScript basics"],
    "outcomes": ["Build React apps", "Master hooks"],
    "status": "published",
    "featured": true,
    "enrollmentCount": 245,
    "rating": 4.8,
    "createdAt": "2026-01-15T00:00:00Z",
    "updatedAt": "2026-06-18T10:30:00Z"
  }
}
```

### 5.3 Admin: Create Course
```
POST {{BASE_URL}}/admin/training-courses
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "title": "New React Course",
  "slug": "new-react-course",
  "description": "<h1>Learn React</h1>...",
  "shortDescription": "Master React",
  "price": 75000,
  "discountPrice": 60000,
  "category": "web",
  "level": "intermediate",
  "imageId": "file-uuid",
  "duration": "10 weeks",
  "curriculum": [
    {
      "title": "Module 1",
      "topics": ["Topic A", "Topic B"],
      "duration": "2 weeks"
    }
  ],
  "instructors": [
    {
      "name": "Instructor Name",
      "title": "Developer",
      "avatarId": "file-uuid"
    }
  ],
  "tools": ["React", "Redux"],
  "prerequisites": ["JavaScript"],
  "outcomes": ["Can build React apps"],
  "featured": true
}

Expected: 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New React Course",
    "status": "draft",
    "createdAt": "2026-06-18T10:30:00Z"
  }
}

Tests:
- pm.test("Course created in draft mode")
- pm.environment.set("COURSE_ID", pm.response.json().data.id)
```

### 5.4 Admin: Publish Course
```
PATCH {{BASE_URL}}/admin/training-courses/{{COURSE_ID}}/publish
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "status": "published"
}

Expected: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published"
  }
}
```

---

## COLLECTION: MODULE 6 — ENROLLMENTS

### 6.1 Student Self-Enroll
```
POST {{BASE_URL}}/enrollments
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "courseId": "{{COURSE_ID}}"
}

Expected: 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "courseId": "uuid",
    "status": "pending",
    "paymentStatus": "pending",
    "enrolledAt": "2026-06-18T10:30:00Z"
  },
  "message": "Enrollment created. Proceed to payment."
}
```

### 6.2 Get My Enrollments
```
GET {{BASE_URL}}/enrollments/mine
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "courseId": "uuid",
      "courseTitle": "React Masterclass",
      "status": "active",
      "paymentStatus": "paid",
      "enrolledAt": "2026-06-18T10:30:00Z",
      "progress": 35
    }
  ]
}
```

### 6.3 Admin: List All Enrollments
```
GET {{BASE_URL}}/admin/enrollments?page=1&limit=20&status=active&courseId=uuid
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "courseTitle": "React Masterclass",
      "status": "active",
      "paymentStatus": "paid",
      "enrolledAt": "2026-06-18T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## COLLECTION: MODULE 7 — PAYMENTS (Paystack)

### 7.1 Initialize Payment
```
POST {{BASE_URL}}/payments/initialize
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": 5000000,
  "courseId": "{{COURSE_ID}}",
  "callbackUrl": "http://localhost:3000/training/payment-success"
}

Expected: 200
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "PAY-ABC123DEF456",
    "accessCode": "ac123...",
    "amount": 5000000
  },
  "message": "Payment initialized. Redirect to Paystack checkout."
}

Tests:
- pm.environment.set("PAYMENT_REFERENCE", pm.response.json().data.reference)
```

### 7.2 Verify Payment
```
GET {{BASE_URL}}/payments/verify/{{PAYMENT_REFERENCE}}
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": {
    "reference": "PAY-ABC123DEF456",
    "status": "success",
    "amount": 5000000,
    "paidAt": "2026-06-18T10:35:00Z",
    "enrollment": {
      "id": "uuid",
      "status": "active"
    }
  },
  "message": "Payment verified. Enrollment activated."
}
```

### 7.3 Payment Webhook (Mock)
```
POST {{BASE_URL}}/payments/webhook
Content-Type: application/json
x-paystack-signature: <HMAC signature>

{
  "event": "charge.success",
  "data": {
    "reference": "PAY-ABC123DEF456",
    "amount": 5000000,
    "customer": {
      "email": "john@example.com"
    },
    "metadata": {
      "courseId": "uuid"
    }
  }
}

Expected: 200
{
  "success": true,
  "message": "Webhook processed"
}
```

### 7.4 Admin: List Transactions
```
GET {{BASE_URL}}/admin/transactions?page=1&limit=20&status=success
Authorization: Bearer {{TOKEN}}

Expected: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reference": "PAY-ABC123",
      "amount": 5000000,
      "status": "success",
      "customerEmail": "john@example.com",
      "courseTitle": "React Masterclass",
      "paidAt": "2026-06-18T10:35:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 320,
    "totalPages": 16
  }
}
```

### 7.5 Admin: Refund Transaction
```
POST {{BASE_URL}}/admin/transactions/{{TRANSACTION_ID}}/refund
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}

Expected: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "refunded",
    "refundedAt": "2026-06-18T11:00:00Z",
    "refundReason": "Customer requested cancellation"
  },
  "message": "Refund processed successfully"
}
```

---

## QUICK TEST SCENARIOS

### Scenario 1: Admin Onboarding Flow
```
1. Super Admin creates new admin
   POST /admin/users
   → mustChangePassword = true

2. New admin logs in
   POST /auth/login
   → Response includes mustChangePassword = true

3. Admin forced to change password
   POST /auth/change-password
   → mustChangePassword = false

4. Admin prompted for KYC
   POST /auth/kyc/submit
   → kycStatus = "pending"

5. Super Admin reviews KYC
   GET /admin/users/:id/kyc
   PATCH /admin/users/:id/kyc/approve
   → kycStatus = "verified"

6. Admin can now access dashboard
   GET /admin/dashboard
   → 200 OK
```

### Scenario 2: Student Course Enrollment & Payment
```
1. Student registers
   POST /auth/register
   
2. Student views public courses
   GET /training-courses
   
3. Student views course detail
   GET /training-courses/react-masterclass
   
4. Student enrolls
   POST /enrollments
   → status = "pending", paymentStatus = "pending"
   
5. Student initializes payment
   POST /payments/initialize
   → Redirected to Paystack
   
6. Paystack redirect callback
   Backend verifies payment
   → Enrollment status = "active"
   
7. Student can see active enrollment
   GET /enrollments/mine
   → Shows course with status "active"
```

### Scenario 3: Department-Based Access Control
```
1. Super Admin creates admin with dept = "Training Courses"
   POST /admin/users
   
2. Admin logs in
   POST /auth/login
   → department = "Training Courses"
   
3. Admin tries to edit Training Course
   PUT /admin/training-courses/123
   → Authorization check: dept = "Training Courses" ✅
   → 200 OK
   
4. Admin tries to edit Blog Article
   PUT /admin/blog-posts/456
   → Authorization check: dept = "Blog Articles" ❌
   → 403 Forbidden
```

---

## NOTES FOR YOUR FRONTEND GUY

1. **Save environment variables:** After login, Postman auto-saves TOKEN & REFRESH_TOKEN
2. **Check response format:** Every endpoint should follow standard response structure
3. **Test pagination:** Use page=1, page=2, limit=10 to verify pagination works
4. **Test filters:** Search, category, status filters should actually filter results
5. **Test auth:** Requests without token should return 401
6. **Test RBAC:** Department-based access should return 403 when accessing wrong dept
7. **Test rate limits:** Spam login endpoint, should get 429 after 5 attempts
8. **Check audit logs:** After each admin action, verify it's logged in activity_logs

---

**This collection will grow as backend is built.**  
**Current Status:** Module 1-7 (Auth, Users, Files, Courses, Enrollments, Payments)  
**Next to test:** Modules 8-25 (CMS, Blog, Jobs, Gallery, Analytics, etc.)
