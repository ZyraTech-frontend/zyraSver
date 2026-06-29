# Backend Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Applications                        │
│  ┌─────────────────────┐        ┌──────────────────────┐       │
│  │  Student Dashboard  │        │   Admin Dashboard    │       │
│  │  (React + Redux)    │        │  (React + Redux)     │       │
│  │  localhost:3000     │        │  localhost:3001      │       │
│  └──────────┬──────────┘        └──────────┬───────────┘       │
└─────────────┼──────────────────────────────┼──────────────────────┘
              │                              │
              │ HTTPS + JWT                  │ HTTPS + JWT
              │                              │
┌─────────────▼──────────────────────────────▼──────────────────────┐
│                      API Gateway / Load Balancer                 │
│                    (CORS enabled for both origins)               │
└─────────────┬─────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────────────┐
│               Express.js API Server (Node.js)                   │
│                      localhost:5000                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   MIDDLEWARE STACK                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ • CORS (whitelist: localhost:3000, 3001)               │ │
│  │ • Body Parser (10MB limit)                              │ │
│  │ • Error Handler (global)                                │ │
│  │ • Auth Middleware (JWT verification)                    │ │
│  │ • Role Middleware (RBAC)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────┬─────────────────┬──────────────────┐       │
│  │  ROUTES        │  SERVICES       │  UTILITIES       │       │
│  ├────────────────┼─────────────────┼──────────────────┤       │
│  │ • /auth        │ • S3Service     │ • JwtService     │       │
│  │ • /users       │ • Prisma ORM    │ • PasswordSvc    │       │
│  │ • /courses     │                 │ • Validators     │       │
│  │ • /enrollments │                 │ • ResponseHdlr   │       │
│  │ • /payments    │                 │                  │       │
│  │ • /kyc         │                 │                  │       │
│  │ • /upload      │                 │                  │       │
│  └────────────────┴─────────────────┴──────────────────┘       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   LOGGING & AUDIT                         │ │
│  │ • Activity Logs (all user actions)                        │ │
│  │ • Audit Trail (system events)                             │ │
│  │ • Error Logging (failed operations)                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────┬────────────────────────────────────────────────────┘
              │
              ├──────────────────────────────────────────┐
              │                                          │
┌─────────────▼──────────────┐          ┌──────────────▼──────────┐
│   AWS RDS PostgreSQL       │          │   AWS S3 + CloudFront   │
│                            │          │                         │
│ • 20+ Tables              │          │ • File Storage          │
│ • RBAC Data               │          │ • Image Optimization    │
│ • User Accounts           │          │ • CDN Distribution      │
│ • Courses & Enrollments   │          │ • 1-year cache for img  │
│ • Payments & Audits       │          │ • 1-hour cache for docs │
│ • Activity Logs           │          │ • HTTPS only            │
│                           │          │ • Private bucket        │
│ Connection: TCP 5432      │          │ Signed URLs for temp    │
│ Region: us-east-1         │          │ access & compliance     │
└───────────────────────────┘          └─────────────────────────┘

                    ┌─────────────────────────┐
                    │   External Services     │
                    ├─────────────────────────┤
                    │ • SendGrid (emails)     │
                    │ • Paystack (payments)   │
                    │ • Monitoring (logs)     │
                    └─────────────────────────┘
```

## Data Flow: User Registration

```
Frontend (POST /auth/register)
    │
    ├─ Email, password, firstName, lastName
    │
    ▼
Express Server
    │
    ├─ Validate input (email, password strength, name length)
    │
    ├─ Check if email exists (Prisma query)
    │
    ├─ Hash password (Bcrypt 12 rounds)
    │
    ├─ Create user in database (Prisma create)
    │
    ├─ Generate JWT tokens:
    │  ├─ Access token (15 min) 
    │  └─ Refresh token (7 days)
    │
    ├─ Save refresh token to Session table
    │
    ├─ Log activity (ActivityLog create)
    │
    ▼
Response to Frontend
    ├─ User object (id, email, firstName, lastName, role)
    ├─ Access token (use in Authorization header)
    └─ Refresh token (store securely, send on login)
```

## Data Flow: File Upload

```
Frontend (POST /upload/image + FormData)
    │
    ├─ File buffer, filename, mimetype
    │
    ▼
Express Server
    │
    ├─ Verify JWT token (authMiddleware)
    │
    ├─ Validate file:
    │  ├─ Type (jpeg, png, webp only)
    │  ├─ Size (< 5MB)
    │  └─ MIME type matches extension
    │
    ├─ Call S3Service.uploadImage()
    │  │
    │  ├─ Generate S3 key: images/{timestamp}-{filename}
    │  │
    │  ├─ Upload to S3 bucket (zyratech-assets)
    │  │
    │  ├─ Set Cache-Control: public, max-age=31536000 (1 year)
    │  │
    │  └─ Return CloudFront URL
    │
    ├─ Save to UploadedFile table:
    │  ├─ filename, s3Key, url, mimetype, size
    │  ├─ fileType: "image"
    │  └─ uploadedBy: userId
    │
    ├─ Log activity (upload successful)
    │
    ▼
Response to Frontend
    └─ { url: "https://cdn.example.com/images/...", id, filename, size }
```

## Database Schema Overview

### Relationships Map

```
┌─────────────┐
│    User     │◄──────┐
├─────────────┤       │
│ id          │       │
│ email       │       │
│ firstName   │   ┌───┴──────────┐
│ lastName    │   │              │
│ role        │   │              │
│ status      │   │              │
│ departmentId├──►│ Department   │
└─────────────┘   │              │
        │         └──────────────┘
        │
    ┌───┴────────────────────┬────────────────┬──────────────┐
    │                        │                │              │
┌───▼────┐          ┌────────▼──┐      ┌─────▼─┐      ┌────▼──────┐
│Session │          │ActivityLog│      │ KYC   │      │UploadedFile
├────────┤          ├───────────┤      ├───────┤      ├───────────┤
│ Token  │          │Action     │      │Status │      │S3 Key     │
│ExpiresAt          │Entity     │      │Verified       │URL        │
└────────┘          └───────────┘      └───────┘      └────┬──────┘
                                                            │
                            ┌──────────────────────────────┤
                            │                              │
                       ┌────▼──────┐              ┌────────▼─┐
                       │ Enrollment│              │ Payment  │
                       ├───────────┤              ├──────────┤
                       │ userId    │              │userId    │
                       │ courseId  │              │courseId  │
                       │ status    │              │amount    │
                       │ progress  │              │status    │
                       └────┬──────┘              └──────────┘
                            │
                            │
                       ┌────▼──────┐
                       │  Course   │
                       ├───────────┤
                       │ id        │
                       │ title     │
                       │ price     │
                       │ status    │
                       │ deptId    │
                       └───────────┘
                            │
                       ┌────▼──────────┐
                       │CourseModule   │
                       ├───────────────┤
                       │courseId       │
                       │content        │
                       │videoUrl (S3)  │
                       │resources (S3) │
                       └───────────────┘
```

### Core Tables (20+)

| Table | Purpose | Records | Key Fields |
|-------|---------|---------|-----------|
| User | Accounts | 10K+ | email, role, status |
| Session | JWT refresh | 100K+ | token, expiresAt |
| KYC | ID verification | 10K+ | status, idNumber |
| Department | Organization | 10+ | code, hod |
| Course | Course catalog | 100+ | code, price, status |
| CourseModule | Curriculum | 500+ | courseId, order |
| Enrollment | Student courses | 50K+ | userId, courseId |
| Payment | Transactions | 50K+ | amount, status |
| UploadedFile | S3 references | 100K+ | s3Key, url |
| ActivityLog | User actions | 1M+ | action, entity |
| AuditTrail | System events | 500K+ | event, severity |

## Authentication Flow

### Login Flow

```
Frontend /auth/login
    ├─ Email & password
    │
    ▼
Backend
    ├─ Find user by email
    ├─ Compare password (Bcrypt)
    ├─ Check user status (not suspended)
    ├─ Generate JWT tokens
    └─ Save refresh token to database
    │
    ▼
Response
    ├─ accessToken (valid 15 min)
    ├─ refreshToken (valid 7 days)
    └─ User object
```

### Token Refresh Flow

```
Frontend /auth/refresh
    ├─ Refresh token
    │
    ▼
Backend
    ├─ Find session by token
    ├─ Verify token not expired
    ├─ Verify user still active
    ├─ Generate new access token
    └─ Update refresh token
    │
    ▼
Response
    ├─ New accessToken
    └─ New refreshToken
```

### Protected Request Flow

```
Frontend API Call
    ├─ GET /api/users/profile
    ├─ Header: Authorization: Bearer <accessToken>
    │
    ▼
Express authMiddleware
    ├─ Extract token from header
    ├─ Verify JWT signature
    ├─ Check token expiry
    ├─ Decode payload
    ├─ Attach user data to req.user
    │
    ▼
Route Handler
    ├─ Use req.user (id, email, role)
    ├─ Query database
    └─ Return response
```

## Role-Based Access Control (RBAC)

### Roles & Permissions

```
ADMIN
├─ Create/edit courses
├─ Manage users
├─ Review KYC
├─ View reports
└─ Manage payments

DEPARTMENT_HEAD
├─ Create courses in dept
├─ Manage instructors
├─ View enrollment stats
└─ Approve KYC (dept users)

INSTRUCTOR
├─ Create course modules
├─ View enrolled students
├─ Grade submissions
└─ View class reports

STUDENT
├─ Enroll in courses
├─ View course content
├─ Submit assignments
└─ View own progress

SUPPORT
├─ Help desk tickets
├─ View user data
└─ Reset passwords
```

### Middleware Implementation

```
authMiddleware
├─ Verifies JWT token exists & valid
└─ Attaches user to req.user

roleMiddleware(['ADMIN', 'DEPARTMENT_HEAD'])
├─ Checks req.user.role in allowed list
└─ Returns 403 if not authorized

Usage:
router.get('/admin-users',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  handler
);
```

## Error Handling Flow

```
Request to Endpoint
    │
    ▼
Try-Catch Block
    │
    ├─ ValidationError
    │  └─ Response: 400 + { errors: {...} }
    │
    ├─ AuthenticationError
    │  └─ Response: 401 + "Invalid token"
    │
    ├─ AuthorizationError
    │  └─ Response: 403 + "Access denied"
    │
    ├─ Prisma Error (P2002 - duplicate)
    │  └─ Response: 409 + "Email already exists"
    │
    ├─ Prisma Error (P2025 - not found)
    │  └─ Response: 404 + "Record not found"
    │
    └─ Other Errors
       └─ Response: 500 + "Internal Server Error"
```

## API Response Format

### Success (200)
```json
{
  "success": true,
  "message": "Success",
  "data": { /* actual data */ },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Paginated (200)
```json
{
  "success": true,
  "message": "Success",
  "data": [/* array */],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field": "error description" },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Performance Considerations

### Database Optimization
- ✅ Indexes on frequently queried fields (email, userId, courseId, status)
- ✅ Soft deletes (deletedAt field) for data retention
- ✅ Pagination (10-50 items per request)
- ✅ Relation eager loading (include when needed)

### Caching Strategy (Phase 4+)
- User profiles (5 min cache)
- Course catalog (1 day cache)
- Department data (1 day cache)
- User permissions (session lifetime)

### S3 Optimization
- Images: CloudFront CDN (1-year cache)
- Documents: S3 (1-hour cache)
- Automatic cache invalidation on delete
- Signed URLs for secure temporary access

### Rate Limiting (Phase 3+)
- Login: 5 attempts/minute
- API: 100 requests/minute (user)
- File upload: 10MB/request

---

## Deployment Checklist (Future)

- [ ] Environment variables configured
- [ ] Database backups enabled (automated daily)
- [ ] S3 versioning enabled
- [ ] CloudFront caching optimized
- [ ] HTTPS enforced (API & CDN)
- [ ] CORS configured for production domains
- [ ] Error monitoring enabled (Sentry/LogRocket)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF protection (if needed)

---

**Architecture is production-ready!** Ready to build Phase 1. 🚀
