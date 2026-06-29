# ZyraTech Hub — Backend Architecture & Database Strategy
## Comprehensive Brainstorming Session | June 18, 2026

---

## EXECUTIVE SUMMARY

You're building a **STEM Education Platform** with a sophisticated multi-role admin system. The backend needs to handle 25 modules across three main categories:

1. **Content Management** (Courses, Blog, Jobs, Gallery, Projects, FAQ, Testimonials)
2. **Business Logic** (Payments via Paystack, Enrollments, Analytics, Partnerships)
3. **Admin Tools** (RBAC with department-based access, Activity Logs, Reports, User Management with KYC)

**Key Constraints & Decisions:**
- Bearer token authentication (JWT)
- Department-based RBAC (super_admin vs admin with department restrictions)
- Multi-file uploads (Cloudinary for images, S3 for docs)
- Paystack payment integration
- Real-time-style notifications (Phase 2)
- Complex analytics & reporting

---

## 1. DATABASE RECOMMENDATION: PostgreSQL

### Why PostgreSQL?

**✅ Relational Data Structure**
- Your data is highly relational: Users → Enrollments → Courses, Jobs → Applications, etc.
- Strong foreign key constraints prevent data corruption
- ACID compliance guarantees data integrity

**✅ Complex Queries & Reporting**
- Your admin needs advanced analytics: revenue by date, enrollment trends, course performance
- PostgreSQL excels at aggregations, joins, and time-series queries
- Window functions for rankings (top courses, top partners)

**✅ Full-Text Search**
- FAQ, Blog, Job listings, Course catalog all need search
- PostgreSQL's built-in `tsvector` and GIN indexes are excellent for this
- No need for external Elasticsearch initially

**✅ JSON Support**
- Flexible data like course curriculum (nested topics), course metadata, analytics metadata
- `JSONB` type with indexing for fast queries

**✅ Audit & Compliance**
- Activity logs are naturally time-series (append-only)
- Triggers can auto-log user actions
- Perfect for department-based access tracking

**✅ Scalability**
- Handles millions of records efficiently
- Connection pooling (pgBouncer) for high concurrency
- Replication for backups

### Why NOT MongoDB/NoSQL?

❌ **RBAC complexity** — You need strict role/department enforcement. SQL's constraints are much safer.
❌ **Financial data** — Payments require transactional consistency (ACID). NoSQL is riskier.
❌ **Analytics** — Aggregating enrollment by course/date is clunky in document DBs.
❌ **File references** — Multiple tables reference uploaded files. Better with foreign keys.

---

## 2. ORM RECOMMENDATION: Prisma

### Why Prisma?

**✅ Type Safety**
- Generated TypeScript types from schema → zero runtime surprises
- Auto-complete in VSCode for queries
- Fewer bugs in production

**✅ Migrations**
- Clean migration files (version-controlled)
- Easy to roll back
- Works seamlessly with PostgreSQL

**✅ Relations & Lazy Loading**
- Define relationships once, use everywhere
- `include()` / `select()` for efficient queries
- Prevents N+1 query problems

**✅ Developer Experience**
- Simple, readable syntax
- Built-in pagination helpers
- Great error messages

### Schema Preview (core entities):
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  role        String    // super_admin | admin
  department  String?   // null for super_admin
  kycStatus   String    // not_submitted | pending | verified | rejected
  createdAt   DateTime  @default(now())
}

model Course {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  price       Int
  status      String    // draft | published
  enrollments Enrollment[]
  createdAt   DateTime  @default(now())
}

model Enrollment {
  id          String    @id @default(cuid())
  studentId   String
  courseId    String
  status      String    // pending | active | completed | cancelled
  student     User      @relation(fields: [studentId], references: [id])
  course      Course    @relation(fields: [courseId], references: [id])
}
```

---

## 3. API FRAMEWORK RECOMMENDATION: Node.js + Express or Fastify

### Node.js with Express.js (simpler, more tutorials)

**Pros:**
- Same language as frontend (JavaScript/TypeScript)
- Rich ecosystem (middleware, auth libraries)
- Easy for your frontend developer to help debug

**Cons:**
- Slower than alternatives for CPU-heavy work
- Needs clusters/PM2 for multi-core usage

### Node.js with Fastify (faster, modern)

**Pros:**
- 2-3x faster than Express
- Built-in validation (JSON Schema)
- Better for high-traffic scenarios
- Similar ecosystem

**Cons:**
- Slightly less documentation than Express
- Steeper learning curve

### 🎯 **RECOMMENDATION: Express.js for Phase 1**
- Faster to prototype
- Your frontend dev can jump in
- Scale to Fastify later if needed

---

## 4. DATABASE SCHEMA OVERVIEW (Core Tables)

```
┌─────────────────────────────────────────────────────────┐
│ AUTHENTICATION & USERS                                  │
├─────────────────────────────────────────────────────────┤
│ • users (id, email, role, department, kycStatus, ...)  │
│ • kycDocuments (id, userId, governmentId, address, ...) │
│ • refreshTokens (token, userId, expiresAt)             │
│ • sessions (id, userId, device, ip, createdAt)         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CONTENT MANAGEMENT                                      │
├─────────────────────────────────────────────────────────┤
│ • courses (id, title, slug, price, status, ...)        │
│ • blogPosts (id, title, slug, content, status, ...)    │
│ • projects (id, title, slug, description, ...)         │
│ • jobs (id, title, status, salary, locations, ...)     │
│ • galleryImages (id, url, caption, albumId, ...)       │
│ • faqs (id, category, question, answer, ...)           │
│ • testimonials (id, name, quote, rating, ...)          │
│ • heroSlides (id, title, backgroundImage, order, ...)  │
│ • services (id, title, description, ...)               │
│ • benefits (id, title, description, ...)               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BUSINESS LOGIC                                          │
├─────────────────────────────────────────────────────────┤
│ • enrollments (id, studentId, courseId, status, ...)   │
│ • payments (id, reference, amount, courseId, ...)      │
│ • partnerships (id, organization, contact, type, ...)  │
│ • jobApplications (id, jobId, applicantEmail, ...)     │
│ • messages (id, senderEmail, subject, status, ...)     │
│ • newsletter (id, email, source, status, ...)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADMIN & AUDIT                                           │
├─────────────────────────────────────────────────────────┤
│ • activityLogs (id, userId, action, resource, ...)     │
│ • settings (key, value, category, updatedAt)           │
│ • reports (id, name, type, frequency, ...)             │
│ • impactMetrics (id, title, value, category, ...)      │
│ • contentCMS (id, section, content, updatedAt)         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. KEY DESIGN DECISIONS FOR DATABASE

### 5.1 – Department-Based RBAC

**Database Structure:**
```
users table:
├── role: 'super_admin' | 'admin'
├── department: 'Training Courses' | 'Blog Articles' | 'Payments' | null (for super_admin)
└── permissions: JSONB (future-proofing)

Example query (backend checks):
SELECT * FROM users WHERE id = ? AND role = 'admin' AND department = 'Training Courses'
```

**Backend Logic:**
```javascript
// Middleware: Check RBAC
async checkDepartmentAccess(req, res, next) {
  const user = req.user;
  const requiredDept = req.body.department || getResourceDepartment(req.path);
  
  if (user.role === 'super_admin') return next(); // Pass through
  if (user.role === 'admin' && user.department === requiredDept) return next();
  
  return res.status(403).json({ message: 'Access denied' });
}
```

### 5.2 – Activity Logs (Immutable Audit Trail)

**Design:**
- Append-only (never update or delete, only INSERT)
- Includes: user, action, resource, before/after data
- Indexes on userId, createdAt for quick admin queries
- Archive old logs to separate table after 1 year

**Example table:**
```
activityLogs:
├── id (primary key)
├── userId
├── action: 'create' | 'update' | 'delete'
├── resourceType: 'course' | 'user' | 'payment'
├── resourceId
├── changes: JSONB { before: {...}, after: {...} }
├── ip: '192.168.1.1'
├── userAgent: 'Mozilla...'
└── createdAt (immutable)
```

### 5.3 – File Storage References

**Database:**
```
uploadedFiles table:
├── id (primary key)
├── cloudinaryId (or S3 key)
├── url: 'https://res.cloudinary.com/...'
├── fileType: 'image' | 'document'
├── mimeType: 'image/jpeg'
├── size: 2048000
├── uploadedBy (userId)
└── createdAt

// Then reference by ID in other tables:
courses.imageId → uploadedFiles.id
users.avatarId → uploadedFiles.id
jobApplications.resumeId → uploadedFiles.id
```

### 5.4 – KYC Document Management

**Database Structure:**
```
users.kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected'
users.kycSubmittedAt
users.kycReviewedAt
users.kycReviewedBy (super_admin userId)
users.kycRejectionReason

kycDocuments table:
├── id
├── userId
├── governmentId: { url, filename, uploadedAt }
├── proofOfAddress: { url, filename, uploadedAt }
└── createdAt

// When admin rejects, still keep the docs and reason
// User can resubmit → creates new kycDocuments record
```

---

## 6. POSTMAN API STRUCTURE & ENDPOINT ORGANIZATION

Your frontend guy will test 25 modules. Here's how to organize the Postman collection:

```
ZyraTech Hub Backend API
├── Authentication
│   ├── POST /auth/register
│   ├── POST /auth/login
│   ├── POST /auth/refresh
│   ├── POST /auth/logout
│   ├── GET /auth/me
│   └── ...
├── Admin - Users (Super Admin Only)
│   ├── GET /admin/users
│   ├── POST /admin/users
│   ├── PUT /admin/users/:id
│   ├── PATCH /admin/users/:id/deactivate
│   └── ...
├── Training Courses
│   ├── GET /training-courses (public)
│   ├── GET /admin/training-courses (admin)
│   ├── POST /admin/training-courses
│   └── ...
├── Payments (Paystack)
│   ├── POST /payments/initialize
│   ├── GET /payments/verify/:reference
│   ├── POST /payments/webhook
│   └── ...
├── [20+ more modules]
└── Health Check
    └── GET /health
```

### Standard Response Format (Postman test):
```json
{
  "success": true,
  "data": { ... },
  "message": "string",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 7. IMPLEMENTATION ROADMAP (Phases)

**Phase 1 – Foundation (Week 1-2)** ✅ Highest Priority
- PostgreSQL + Prisma setup
- User authentication (register/login/refresh)
- Admin onboarding (password change, KYC submission/review)
- File upload service (Cloudinary integration)
- Settings endpoints
- **Deliverable:** Postman collection with working auth flow

**Phase 2 – Core Business (Week 3-5)**
- Training courses (CRUD + enrollments)
- Payments (Paystack integration)
- Jobs (CRUD + applications)
- Newsletter signup
- **Deliverable:** End-to-end course enrollment → payment flow

**Phase 3 – Content Management (Week 6-7)**
- Blog, FAQ, Testimonials (CRUD)
- Hero slider, Services, Benefits
- Gallery (with album grouping)
- Contact/Messages inbox
- **Deliverable:** All content endpoints tested in Postman

**Phase 4 – Marketing & Analytics (Week 8-9)**
- Partnerships CRUD
- Impact metrics & success stories
- Revenue analytics
- Activity logs
- **Deliverable:** Admin dashboard can fetch all data

**Phase 5 – Admin Tools & Refinement (Week 10-11)**
- Reports & scheduled reporting
- System health monitoring
- Notification system (WebSocket optional)
- Performance optimization
- **Deliverable:** Production-ready API docs

---

## 8. SECURITY CHECKLIST


### 8.1 – Authentication & Authorization
- ✅ JWT tokens (15-min access, 7-day refresh)
- ✅ bcrypt password hashing (salt rounds ≥ 12)
- ✅ Department-based RBAC middleware
- ✅ Rate limiting on auth endpoints (5 login attempts / 15 min)
- ✅ Session management (logout revokes token)
- ✅ CORS restricted to your frontend domain

### 8.2 – Data Protection
- ✅ Input validation (Joi/Zod schema on all endpoints)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS prevention (sanitize HTML content from blog/CMS)
- ✅ CSRF protection (if cookies used)
- ✅ Encrypted KYC documents (at rest in Cloudinary)
- ✅ PII handling (don't log passwords, tokens)

### 8.3 – Payment Security
- ✅ Verify Paystack webhook signature (HMAC SHA512)
- ✅ Idempotency on webhook processing
- ✅ Never expose Paystack secret key in frontend
- ✅ Amount validation (verify amount matches course price)
- ✅ Store transaction reference for audit

### 8.4 – File Uploads
- ✅ Validate file type (image/pdf only)
- ✅ Enforce size limits (5MB images, 10MB docs)
- ✅ Virus scan via Cloudinary API
- ✅ Whitelist allowed extensions
- ✅ Generate unique filenames (prevent overwrite)

### 8.5 – Logging & Monitoring
- ✅ All admin actions logged to activity_logs table
- ✅ Failed login attempts logged
- ✅ KYC reviews logged with reviewer name
- ✅ Refunds logged with reason
- ✅ Error monitoring (Sentry or similar)

---

## 9. CRITICAL API PATTERNS

### 9.1 – Authentication Flow

**User Journey:**
```
1. Student registers → email verification → login
2. Admin logs in → checks mustChangePassword flag
3. If true: force password change → then check kycStatus
4. If kycStatus = 'not_submitted': force KYC submission
5. All clear: redirect to dashboard
```

**Response from /auth/login must include:**
```json
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "role": "super_admin|admin",
    "department": "Training Courses",
    "mustChangePassword": false,
    "kycStatus": "not_submitted|pending|verified|rejected"
  }
}
```

### 9.2 – Pagination (All List Endpoints)

**Request:**
```
GET /admin/courses?page=2&limit=20&search=react&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [...array of 20 items...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

### 9.3 – Error Handling

**Consistent Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    },
    {
      "field": "password",
      "message": "Must contain uppercase, number, special char"
    }
  ]
}
```

### 9.4 – File Upload Pattern

**Request (multipart/form-data):**
```
POST /uploads/image
Content-Type: multipart/form-data

file: <binary image data>
description: "Course hero image"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-uuid",
    "url": "https://res.cloudinary.com/...",
    "filename": "course-hero.webp",
    "size": 245000,
    "uploadedAt": "2026-06-18T10:30:00Z"
  }
}
```

### 9.5 – Department-Based Access

**Example: Admin updating a training course**
```
PUT /admin/training-courses/123
Authorization: Bearer <token>

Body: { title: "New Title" }

Backend checks:
1. Is user authenticated? ✅
2. Is user an admin? ✅
3. Does user's department = "Training Courses"? ✅
4. Update course ✅
```

If department doesn't match: `403 Forbidden`

---

## 10. POSTMAN COLLECTION SETUP RECOMMENDATIONS

### 10.1 – Environment Variables

Create an environment with:
```
{{BASE_URL}} = http://localhost:3000/api (local) or https://api.zyratechhub.com (prod)
{{TOKEN}} = (auto-set after login)
{{REFRESH_TOKEN}} = (auto-set after login)
{{ADMIN_ID}} = (use for KYC review endpoints)
{{COURSE_ID}} = (use for testing enrollments)
```

### 10.2 – Pre-Request Scripts (Postman)

```javascript
// Auto-refresh token if expired
if (new Date(pm.environment.get('token_expiry')) < new Date()) {
  pm.sendRequest({
    url: pm.environment.get('BASE_URL') + '/auth/refresh',
    method: 'POST',
    body: {
      mode: 'raw',
      raw: JSON.stringify({ 
        refreshToken: pm.environment.get('REFRESH_TOKEN') 
      })
    }
  }, function(err, response) {
    pm.environment.set('TOKEN', response.json().token);
  });
}
```

### 10.3 – Test Scripts (Postman)

Each endpoint should have tests:
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response structure is correct", function () {
  var data = pm.response.json();
  pm.expect(data).to.have.property('success');
  pm.expect(data).to.have.property('data');
  pm.expect(data).to.have.property('meta');
});

// Save for next request
if (pm.response.code === 200) {
  pm.environment.set('COURSE_ID', pm.response.json().data[0].id);
}
```

### 10.4 – Request Organization

```
├── 1. Authentication
│   ├── Register Student
│   ├── Login (stores TOKEN)
│   ├── Login - Force Password Change (if admin)
│   ├── Upload KYC Documents (if admin)
│   ├── Get Current User
│   └── Refresh Token
├── 2. Admin - User Management (Super Admin)
│   ├── Create Admin User
│   ├── List All Users
│   ├── Get User Details
│   ├── Review & Approve KYC
│   └── Reject KYC
├── 3. Content - Courses
│   ├── List Public Courses
│   ├── Get Course Detail
│   ├── Create Course (Admin)
│   ├── Update Course
│   ├── Delete Course
│   └── Publish Course
├── [... repeat for Jobs, Blog, Gallery, FAQ, etc...]
├── 4. Business - Payments
│   ├── Initialize Payment
│   ├── Verify Payment
│   ├── Webhook (mock)
│   ├── List Transactions (Admin)
│   └── Process Refund (Super Admin)
├── 5. Business - Enrollments
│   ├── Student Enroll in Course
│   ├── List My Enrollments
│   ├── Admin List All Enrollments
│   └── Update Enrollment Status
└── [... continue for all 25 modules...]
```

---

## 11. DATABASE MIGRATION STRATEGY

### Day 1-2: Initial Schema
```sql
-- Core tables only:
users, courses, enrollments, payments
-- With all indexes and foreign keys
```

### Day 3-4: Content Tables
```sql
blog_posts, jobs, faqs, testimonials, gallery
```

### Day 5-6: Admin Tables
```sql
activity_logs, settings, kyc_documents, reports
```

### Day 7+: Optimize & Add Indexes
- Full-text search indexes on blog, jobs, faqs
- Date range indexes for analytics
- Composite indexes on common query patterns

---

## 12. TESTING STRATEGY (Postman → Backend Dev)

### For Your Frontend Guy (Postman):

**Test Checklist:**
- ✅ All endpoints return correct status codes (200, 201, 400, 403, 404, 500)
- ✅ Response format matches documented structure
- ✅ Pagination works (page=1, page=2, etc)
- ✅ Filtering works (search, category, status)
- ✅ Authentication fails with bad token
- ✅ Department-based access enforced
- ✅ File uploads accept images/docs, reject others
- ✅ Paystack webhook signature verified
- ✅ Rate limiting triggers after N attempts

### Backend Acceptance Criteria:
1. All 25 modules have working endpoints
2. Postman collection passes all tests without manual intervention
3. Admin can create users, review KYC, manage content
4. Students can enroll and pay
5. All admin actions logged in activity_logs
6. API docs generated (Swagger/OpenAPI)

---

## 13. TECH STACK SUMMARY

| Layer | Recommendation | Rationale |
|-------|-----------------|-----------|
| **Database** | PostgreSQL 14+ | Relational, ACID, great for RBAC & analytics |
| **ORM** | Prisma | Type safety, migrations, easy relations |
| **API Framework** | Express.js + TypeScript | Easy to prototype, frontend dev can help |
| **Auth** | JWT (bcrypt) | Stateless, scales horizontally |
| **File Storage** | Cloudinary (images) + S3 (docs) | Managed, CDN, auto-optimization |
| **Payment** | Paystack SDK | Already in frontend, webhooks built-in |
| **Email** | SendGrid or Mailgun | Reliable, good deliverability |
| **Validation** | Zod or Joi | Schema-based, catches errors early |
| **Logging** | Winston or Pino | Structured logs, easy to search |
| **API Documentation** | Swagger/OpenAPI | Auto-generated from TypeScript |
| **Testing** | Jest + Supertest | Unit tests + integration tests |
| **Hosting** | Railway, Render, or AWS | Easy deployment, PostgreSQL included |

---

## 14. ENVIRONMENT VARIABLES (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zyratech

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=another_secret_key
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# AWS S3
AWS_S3_BUCKET=zyratech-docs
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email (SendGrid)
SENDGRID_API_KEY=SG...

# Frontend URL (CORS)
FRONTEND_URL=https://zyratechhub.com
ADMIN_FRONTEND_URL=https://admin.zyratechhub.com

# Node Environment
NODE_ENV=development
PORT=3000

# API Base URL
API_BASE_URL=http://localhost:3000/api
```

---

## 15. IMMEDIATE NEXT STEPS

### For Backend Developer:

1. **Set up project structure:**
   ```bash
   npm init -y
   npm install express typescript dotenv cors bcryptjs jsonwebtoken
   npm install -D nodemon ts-node @types/node
   npm install @prisma/client
   npx prisma init
   ```

2. **Create Prisma schema** with all 25+ tables

3. **Build auth middleware** (JWT verification, RBAC check)

4. **Implement Phase 1 endpoints:**
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh
   - POST /auth/change-password
   - POST /auth/kyc/submit
   - GET /admin/users
   - POST /admin/users

5. **Create Postman collection** and share with frontend guy

### For Frontend Developer (Testing):

1. Import Postman collection
2. Set up environment variables (BASE_URL, TOKEN, etc)
3. Test each endpoint as backend builds them
4. Document any inconsistencies or improvements

### For Project Manager:

1. Set up PostgreSQL instance (local or cloud: Railway, Supabase, etc)
2. Create Postman workspace for team collaboration
3. Schedule integration testing after Phase 1
4. Plan Paystack sandbox testing for Phase 2

---

## 16. POSTMAN EXPORT TEMPLATE

When backend is ready, export the collection as JSON and include:

```json
{
  "info": {
    "name": "ZyraTech Hub API v2.1",
    "description": "Complete API for STEM education platform"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{
      "key": "token",
      "value": "{{TOKEN}}",
      "type": "string"
    }]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        // All auth endpoints with examples
      ]
    },
    // ... all 25 modules
  ]
}
```

---

## 17. FINAL RECOMMENDATIONS

### 🎯 Best Practices:

1. **Start simple, iterate:** Build Phase 1 fully before Phase 2
2. **Document as you code:** Auto-generate API docs from TypeScript + OpenAPI
3. **Test with Postman first:** Before touching frontend integration
4. **Version your API:** Use `/api/v1/` path prefix from day one
5. **Monitor from day 1:** Logs, error tracking (Sentry), performance monitoring
6. **Backup strategy:** Daily automated PostgreSQL backups to S3

### ⚠️ Pitfalls to Avoid:

1. ❌ Don't mix auth tokens with passwords in logs
2. ❌ Don't skip input validation (leads to SQL injection, XSS)
3. ❌ Don't delete audit logs (always append-only)
4. ❌ Don't hardcode API keys (use .env)
5. ❌ Don't test with real Paystack keys (use sandbox)
6. ❌ Don't deploy without rate limiting (bots will hammer your API)

### 💡 Pro Tips:

1. Use database transactions for multi-step operations (enroll → payment → email)
2. Implement soft deletes for sensitive data (users, payments)
3. Add request/response logging middleware
4. Use Redis for caching (popular courses, settings)
5. Implement webhook retry logic for Paystack failures

---

## 18. QUESTIONS FOR STAKEHOLDERS

1. **Hosting:** Will you use Railway, Render, AWS, or self-hosted?
2. **Email:** Which email service? SendGrid, Mailgun, custom SMTP?
3. **Scalability:** Expected concurrent users in first 6 months?
4. **Analytics:** Do you need real-time dashboards or daily reports?
5. **Notifications:** Real-time (WebSocket) or email-based is fine for now?
6. **Backup:** How many days of backup history?
7. **SLA:** What's the acceptable downtime?

---

## 19. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React + Redux)                                    │
│  - admin.zyratechhub.com (admin portal)                     │
│  - zyratechhub.com (public website)                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │  API Gateway /    │
         │  Load Balancer    │
         │  (CORS, Rate Limit)
         └─────────┬─────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│ Node.js + Express (Backend API)                             │
│  - Auth middleware (JWT + RBAC)                             │
│  - 25 API modules with business logic                       │
│  - Webhook handlers (Paystack)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬────────────────┐
        │                     │                │
    ┌───▼────┐          ┌────▼─────┐   ┌─────▼──────┐
    │PostgreSQL          │ Cloudinary   AWS S3
    │(core data)         │ (images)     (documents)
    └────────┘          └──────────┘   └────────────┘
        │
    ┌───▼──────────────────┐
    │ Activity Logs        │
    │ (audit trail)        │
    └─────────────────────┘
        │
    ┌───▼──────────────────┐
    │ External Services    │
    │ • Paystack           │
    │ • SendGrid           │
    │ • Sentry (errors)    │
    └─────────────────────┘
```

---

## SUMMARY: KEY TAKEAWAYS FOR YOUR TEAM

✅ **Database:** PostgreSQL with Prisma ORM  
✅ **API Framework:** Express.js + TypeScript  
✅ **Auth:** JWT (15-min access, 7-day refresh)  
✅ **RBAC:** Role + Department-based access control  
✅ **File Storage:** Cloudinary + AWS S3  
✅ **Payment:** Paystack integration  
✅ **Testing:** Postman collection for frontend dev  
✅ **Audit:** Append-only activity logs  
✅ **Phases:** 5 phases over 11 weeks  

**Estimated Effort:**  
- Backend dev: ~8-10 weeks (full-time)
- Frontend integration: ~3-4 weeks (parallel)
- Testing & optimization: ~2 weeks

**Go-Live Checklist:**
- [ ] All 25 modules tested in Postman
- [ ] Admin can manage all content
- [ ] Students can enroll and pay
- [ ] Audit logs working
- [ ] Error monitoring active
- [ ] Rate limiting configured
- [ ] Backups automated
- [ ] API docs published
- [ ] Security audit completed

---

**Document Status:** ✅ Complete  
**Version:** 1.0  
**Last Updated:** June 18, 2026  
**Prepared for:** Backend Team Meeting
