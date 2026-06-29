# Quick Reference Guide
## ZyraTech Hub Backend — One-Page Cheat Sheet

---

## 🎯 STACK AT A GLANCE

```
Frontend Request
       ↓
Express.js API Server
       ↓
PostgreSQL Database
       ↓
External Services (Paystack, Cloudinary, SendGrid)
```

---

## 📊 DATABASE CHOICE

**PostgreSQL** ✅
- Why: Relational, ACID, RBAC, analytics-friendly
- ORM: Prisma (type-safe, migrations, easy relations)
- Hosting: Railway / Supabase / AWS RDS

---

## 🔐 AUTHENTICATION FLOW

```
1. User registers/logs in
   POST /auth/login { email, password }
   ↓
2. Backend returns JWT token (15-min) + refresh token (7-day)
   ↓
3. Frontend stores in localStorage
   ↓
4. Every request includes: Authorization: Bearer <token>
   ↓
5. Token expires? → POST /auth/refresh { refreshToken }
   ↓
6. New token issued
```

**Password Rules:** 8+ chars, 1 uppercase, 1 number, 1 special char

---

## 👥 RBAC MODEL

```
super_admin
├── Full system access
├── Can manage all departments
└── Can review KYC, manage users, see financials

admin (department-assigned)
├── Can only edit resources in their department
├── Examples: "Training Courses", "Blog Articles", "Payments"
└── Attempts to access wrong dept → 403 Forbidden
```

---

## 📚 25 MODULES ORGANIZED BY PHASE

### PHASE 1 (Week 1-2) — FOUNDATION
| # | Module | Endpoints | Status |
|---|--------|-----------|--------|
| 1 | Authentication | /auth/register, /login, /refresh, /logout | Core |
| 2 | Admin Profile | /auth/profile (CRUD + sessions) | Core |
| 3 | User Management | /admin/users (create, deactivate, KYC) | Core |
| 4 | File Uploads | /uploads/{image,document,bulk} | Core |
| 21 | Site Settings | /admin/settings | Core |

### PHASE 2 (Week 3-5) — REVENUE
| # | Module | Endpoints | Status |
|---|--------|-----------|--------|
| 5 | Courses | /training-courses (public) + /admin/* | Core |
| 6 | Enrollments | /enrollments (student) + /admin/* | Core |
| 7 | Payments | /payments/initialize, verify, webhook | Paystack |
| 17 | Jobs | /jobs (public) + /admin/* | Core |
| 19 | Newsletter | /newsletter/{subscribe, unsubscribe} + admin | Core |

### PHASE 3 (Week 6-7) — CONTENT
| # | Module | Endpoints | Status |
|---|--------|-----------|--------|
| 8 | CMS | /admin/content/* (hero, services, benefits, etc) | Core |
| 9 | Hero Slider | /admin/hero-slides | Core |
| 13 | FAQ | /faqs (public) + /admin/* | Core |
| 14 | Blog | /blog-posts (public) + /admin/* | Core |
| 16 | Gallery | /gallery (public) + /admin/* | Core |
| 18 | Messages | /contact (public) + /admin/messages | Core |
| 12 | Testimonials | /testimonials + /admin/* | Core |

### PHASE 4 (Week 8-9) — MARKETING
| # | Module | Endpoints | Status |
|---|--------|-----------|--------|
| 10 | Partnerships | /partnerships + /admin/* | Core |
| 11 | Impact Metrics | /api/impact/{metrics, stories} | Core |
| 15 | Projects | /projects + /admin/* | Core |

### PHASE 5 (Week 10-11) — ADMIN TOOLS
| # | Module | Endpoints | Status |
|---|--------|-----------|--------|
| 20 | Activity Logs | /admin/activity-logs | Audit |
| 22 | Reports & Analytics | /admin/{reports, analytics} | Reports |
| 23 | Notifications | /admin/notifications | Optional |
| 25 | System Health | /admin/system/health | Monitor |

---

## 🛣️ API ENDPOINT PATTERNS

### Public Endpoints (No Auth)
```
GET    /training-courses              (list all)
GET    /training-courses/:slug        (get one)
GET    /jobs                          (list all)
GET    /jobs/:id                      (get one)
POST   /auth/register                 (signup)
POST   /auth/login                    (login)
POST   /contact                       (contact form)
```

### Protected Endpoints (Bearer Token Required)
```
GET    /auth/me                       (current user)
POST   /auth/change-password          (force change)
POST   /auth/kyc/submit               (upload docs)
POST   /enrollments                   (student enroll)
GET    /enrollments/mine              (my courses)
POST   /payments/initialize           (start payment)
```

### Admin Endpoints (RBAC Enforced)
```
GET    /admin/users                   (super admin only)
POST   /admin/users                   (create admin)
PATCH  /admin/users/:id/kyc/approve   (review KYC)
POST   /admin/training-courses        (create course)
PUT    /admin/training-courses/:id    (update course)
PATCH  /admin/training-courses/:id/publish  (publish)
GET    /admin/messages                (inbox)
PATCH  /admin/messages/:id/read       (mark read)
```

---

## 📋 STANDARD RESPONSE FORMAT

### Success (200, 201)
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "optional message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error (4xx, 5xx)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Already exists" },
    { "field": "password", "message": "Too weak" }
  ]
}
```

---

## 🔒 SECURITY CHECKLIST

- ✅ JWT tokens (15-min access, 7-day refresh)
- ✅ Bcrypt password hashing (12+ rounds)
- ✅ Input validation (prevent XSS, SQL injection)
- ✅ CORS (frontend domain only)
- ✅ Rate limiting (5 login attempts / 15 min)
- ✅ HTTPS only in production
- ✅ Activity logs (append-only audit trail)
- ✅ File validation (type, size, content)
- ✅ Paystack webhook signature verification
- ✅ Environment variables (no hardcoded keys)

---

## 📊 DATABASE TABLES (20+)

```
Users
├── id, email, password, role, department
├── kycStatus, accountStatus, mustChangePassword
└── createdAt, lastLogin

Courses
├── id, title, slug, price, description
├── status (draft|published), featured
└── curriculum, instructors (JSON)

Enrollments
├── studentId, courseId
├── status, paymentStatus, progress
└── enrolledAt, completedAt

Payments
├── reference, amount, email, courseId
├── status (pending|success|failed|refunded)
└── paidAt, refundedAt

Jobs
├── id, title, slug, type, category
├── status, featured, deadline
└── salary (min, max)

[And 15+ more...]
```

---

## 🧪 TESTING WITH POSTMAN

### Setup
```
Environment Variables:
- BASE_URL = http://localhost:3000/api
- TOKEN = (auto-set after login)
- REFRESH_TOKEN = (auto-set after login)
```

### Test Every Endpoint
```
1. Status code correct (200, 201, 400, 403, 404)
2. Response format matches docs
3. Pagination works (page, limit, total)
4. Filtering works (search, category, status)
5. Auth enforced (401 without token)
6. RBAC enforced (403 with wrong department)
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] PostgreSQL backup automated daily
- [ ] Environment variables configured (.env)
- [ ] CORS restricted to frontend domains
- [ ] Rate limiting enabled
- [ ] Error monitoring (Sentry) configured
- [ ] API logs exported (CloudWatch / ELK)
- [ ] SSL/TLS certificate installed
- [ ] Database indexes created
- [ ] Load testing passed (1000+ concurrent users)
- [ ] Security audit completed
- [ ] API documentation published (Swagger)
- [ ] Disaster recovery plan tested

---

## 💾 MIGRATION STRATEGY

```
Day 1-2:  Core tables (users, courses, enrollments, payments)
Day 3-4:  Content tables (blog, jobs, faqs, gallery)
Day 5-6:  Admin tables (activity_logs, settings, reports)
Day 7:    Add indexes & constraints
Day 8+:   Optimize & stress test
```

---

## 🎯 SUCCESS METRICS

| Metric | Target | Tool |
|--------|--------|------|
| API Response Time | < 200ms | New Relic / DataDog |
| Uptime | 99.9% | Status page |
| Error Rate | < 0.1% | Sentry |
| Database Query | < 100ms | PostgreSQL EXPLAIN |
| Concurrent Users | 1000+ | Load testing |

---

## 📞 TEAM ROLES & RESPONSIBILITIES

| Role | Responsibility | Deliverable |
|------|-----------------|-------------|
| Backend Dev | Build API, database design | Working endpoints |
| Frontend Dev | Test with Postman, report issues | API integration |
| DevOps | Hosting, CI/CD, monitoring | Production deployment |
| QA | End-to-end testing, security | Test report |
| PM | Timeline, budget, stakeholder updates | Sprint reviews |

---

## 🆘 COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token expired | Refresh token |
| 403 Forbidden | Wrong department | Check user.department |
| 400 Bad Request | Invalid input | Validate JSON schema |
| 500 Internal Error | Database error | Check logs, rollback |
| Slow queries | Missing indexes | Add indexes to common fields |
| CORS blocked | Frontend domain not allowed | Update CORS config |

---

## 📚 RECOMMENDED PACKAGES

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "prisma": "^4.16.0",
    "@prisma/client": "^4.16.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

---

## 🔗 EXTERNAL INTEGRATIONS

| Service | Purpose | Config |
|---------|---------|--------|
| Paystack | Payment processing | Public key + Secret key |
| Cloudinary | Image hosting/CDN | Cloud name + API key |
| AWS S3 | Document storage | Bucket + access keys |
| SendGrid | Email delivery | API key |
| Sentry | Error tracking | DSN |
| PostgreSQL | Database | Connection string |

---

## 📖 DOCUMENTATION NEEDED

1. **API Docs** (Swagger/OpenAPI) — Auto-generated from TypeScript
2. **Database Schema** — SQL export + ER diagram
3. **Environment Setup** — How to run locally
4. **Deployment Guide** — How to deploy to production
5. **Architecture Diagram** — System overview
6. **Security Policy** — Password rules, rate limits, etc.
7. **Troubleshooting Guide** — Common issues & fixes
8. **Postman Collection** — All endpoints with examples

---

## ⏱️ TIMELINE AT A GLANCE

```
Week 1-2:  ████░░░░░░░░░░ Auth + Users + Files (Foundation)
Week 3-5:  ████████░░░░░░░░░░░░ Courses + Payments + Jobs (Revenue)
Week 6-7:  ██████░░░░░░░░░░░░░░ Blog + Gallery + Content (Content)
Week 8-9:  ████░░░░░░░░░░░░░░░░ Partnerships + Impact (Marketing)
Week 10-11: ██░░░░░░░░░░░░░░░░░░ Reports + Admin Tools (Polish)
```

**Ready by:** Week 11 / Day 77

---

## 🎓 LEARNING RESOURCES

- **Prisma:** prisma.io/docs
- **Express.js:** expressjs.com
- **JWT:** jwt.io
- **PostgreSQL:** postgresql.org/docs
- **REST API Design:** restfulapi.net
- **OWASP Security:** owasp.org/top-10
- **Postman:** postman.com/docs

---

## 💡 PRO TIPS

1. **Start simple:** Get Phase 1 working before Phase 2
2. **Test with Postman first:** Before touching frontend
3. **Version your API:** Use `/api/v1/` from day one
4. **Document as you code:** Auto-generate docs from TypeScript
5. **Monitor from day 1:** Logs, error tracking, performance metrics
6. **Use transactions:** Multi-step operations (enroll → pay → email)
7. **Cache wisely:** Redis for popular courses, trending data
8. **Backup daily:** Automated PostgreSQL backups to S3
9. **Rate limit aggressively:** Especially auth endpoints
10. **Audit everything:** All admin actions logged

---

**Last Updated:** June 18, 2026  
**Status:** Ready to implement  
**Questions?** Refer to the full 3-document brainstorming pack
