# 🏢 Team Backend Setup Guide
## ZyraTech Hub Backend Development — Organized Folder Structure & Team Guidelines

**For Backend Team**: This is your single source of truth for how to build the ZyraTech Hub backend.

---

## 📋 Your Project Scope

**Project:** ZyraTech Hub STEM Education Platform  
**Backend Purpose:** API for 25 modules across 5 phases (11 weeks)  
**Tech Stack:** Node.js + Express + TypeScript + PostgreSQL + Prisma + AWS  
**Team Size:** 2-3+ backend developers  
**File Storage:** Cloudinary (images) + AWS S3 (documents)  
**Payments:** Paystack integration  

---

## 🗂️ BACKEND FOLDER STRUCTURE (To Be Created)

```
backend/
├── docs/                              # Documentation (team reference)
│   ├── PROJECT_OVERVIEW.md           # This file (keep updated!)
│   ├── ARCHITECTURE.md               # System design & data flows
│   ├── DATABASE_SCHEMA.md            # All Prisma models
│   ├── API_STANDARDS.md              # Coding standards & patterns
│   ├── SECURITY_CHECKLIST.md         # Security best practices
│   ├── DEPLOYMENT.md                 # Production deployment guide
│   └── TROUBLESHOOTING.md            # Common issues & solutions
│
├── src/
│   ├── config/                       # Configuration files
│   │   ├── database.ts               # Prisma client setup
│   │   ├── env.ts                    # Environment validation
│   │   └── cors.ts                   # CORS configuration
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.ts                   # JWT verification + RBAC
│   │   ├── errorHandler.ts           # Global error handling
│   │   ├── validation.ts             # Request validation
│   │   └── logging.ts                # Activity logging
│   │
│   ├── routes/                       # API endpoints organized by module
│   │   ├── auth.routes.ts            # Phase 1: Login, register, password reset
│   │   ├── users.routes.ts           # Phase 1: User management (admin)
│   │   ├── kyc.routes.ts             # Phase 1: KYC submission & review
│   │   ├── uploads.routes.ts         # Phase 1: File uploads
│   │   ├── settings.routes.ts        # Phase 1: System settings
│   │   ├── courses.routes.ts         # Phase 2: Training courses
│   │   ├── enrollments.routes.ts     # Phase 2: Student enrollments
│   │   ├── payments.routes.ts        # Phase 2: Paystack payments
│   │   ├── jobs.routes.ts            # Phase 2: Job listings
│   │   ├── newsletter.routes.ts      # Phase 2: Newsletter
│   │   ├── blog.routes.ts            # Phase 3: Blog posts
│   │   ├── faq.routes.ts             # Phase 3: FAQs
│   │   ├── testimonials.routes.ts    # Phase 3: Testimonials
│   │   ├── partnerships.routes.ts    # Phase 4: Partnerships
│   │   ├── admin.routes.ts           # Admin: Dashboard, reports, analytics
│   │   └── index.ts                  # Route aggregator
│   │
│   ├── controllers/                  # Business logic for routes
│   │   ├── auth.controller.ts        # Auth operations
│   │   ├── users.controller.ts       # User management
│   │   ├── courses.controller.ts     # Course operations
│   │   └── [other controllers...]
│   │
│   ├── services/                     # External services & utilities
│   │   ├── auth.service.ts           # JWT, bcrypt operations
│   │   ├── email.service.ts          # SendGrid email sending
│   │   ├── file.service.ts           # Cloudinary + S3 uploads
│   │   ├── payment.service.ts        # Paystack operations
│   │   ├── audit.service.ts          # Activity logging
│   │   └── [other services...]
│   │
│   ├── models/                       # Prisma schema (database models)
│   │   └── schema.prisma             # All 20+ database tables
│   │
│   ├── types/                        # TypeScript interfaces & types
│   │   ├── auth.types.ts             # Auth-related types
│   │   ├── course.types.ts           # Course-related types
│   │   ├── common.types.ts           # Shared types (pagination, etc.)
│   │   └── [other types...]
│   │
│   ├── utils/                        # Helper functions
│   │   ├── validators.ts             # Input validation functions
│   │   ├── response.ts               # API response formatter
│   │   ├── logger.ts                 # Logging utility
│   │   └── helpers.ts                # General utilities
│   │
│   └── index.ts                      # Express server entry point
│
├── tests/                            # Automated tests (Phase 5)
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── fixtures/                     # Test data
│
├── postman/                          # Postman collection
│   ├── ZyraTech-API.postman_collection.json
│   ├── ZyraTech-Dev.postman_environment.json
│   └── README.md
│
├── prisma/
│   ├── schema.prisma                 # Database schema definition
│   └── migrations/                   # Auto-generated migrations
│
├── scripts/                          # Helpful scripts
│   ├── seed-db.ts                    # Populate test data
│   ├── backup-db.ts                  # Database backup
│   └── check-migrations.ts           # Verify pending migrations
│
├── .env.example                      # Environment variables template
├── .env.local                        # Local development (git-ignored)
├── .gitignore                        # Git ignore rules
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
├── package-lock.json
├── README.md                         # Backend readme (for newcomers)
└── DEVELOPMENT.md                    # Development setup instructions

# Separate folder for documentation (shared with frontend)
docs/
├── BRAINSTORMING/
│   ├── BACKEND_BRAINSTORMING_SESSION.md       # Full planning doc
│   ├── POSTMAN_COLLECTION_STRUCTURE.md        # API endpoint specs
│   ├── DATABASE_SCHEMA_PREVIEW.md             # Schema details
│   ├── EXECUTIVE_SUMMARY.md                   # Project overview
│   └── QUICK_REFERENCE_GUIDE.md               # Quick lookup
│
└── API/
    ├── ARCHITECTURE_OVERVIEW.md               # System design
    └── [Auto-generated Swagger/OpenAPI docs]
```

---

## 📝 TEAM CODING STANDARDS

### File Naming Convention

```
✅ CORRECT:
- auth.controller.ts
- user.service.ts
- course.routes.ts
- auth.types.ts
- activity-logging.middleware.ts

❌ WRONG:
- AuthController.ts (don't use PascalCase for files)
- auth_controller.ts (use camelCase, not snake_case)
- authcontroller.ts (use dots for separation)
```

### Function Naming

```
✅ CORRECT:
export async function createCourse() { }
export async function getUserById() { }
export const validateEmail = () => { }

❌ WRONG:
export async function Create_Course() { }
export async function get_user_by_id() { }
```

### Directory Organization Rule

**One module = One file** (initially)

```
Phase 1:
- auth.controller.ts       (Register, Login, Refresh, KYC, Password Reset)
- users.controller.ts      (Create admin, list users, deactivate)
- uploads.controller.ts    (Upload image, upload document, delete)
- courses.controller.ts    (Will grow in Phase 2)

Phase 2:
- enrollments.controller.ts (Student enroll, list, update)
- payments.controller.ts    (Initialize, verify, refund)

When a controller gets >300 lines, split it:
courses.controller.ts (290 lines) → becomes:
├── courses/
│   ├── create.ts         (Create course)
│   ├── read.ts           (Get single, list)
│   ├── update.ts         (Update course)
│   ├── delete.ts         (Publish/unpublish)
│   └── index.ts          (Export all)
```

---

## 🚦 PHASE BREAKDOWN (Team Assignment)

### Phase 1 — Foundation (Week 1-2)
**Lead Developer**: Senior Backend Dev  
**Tasks**:
- [ ] PostgreSQL setup + Prisma schema
- [ ] Auth middleware (JWT + RBAC)
- [ ] Routes: auth, users, kyc, uploads
- [ ] Activity logging schema
- [ ] Create Postman collection for frontend team

**Completion Criteria**:
- All auth endpoints work in Postman
- Admin can create users, review KYC
- Students can upload files
- Everything logged to activity_logs table

---

### Phase 2 — Business Logic (Week 3-5)
**Lead Developer**: Second Backend Dev  
**Tasks**:
- [ ] Course CRUD + publishing
- [ ] Student enrollment system
- [ ] Paystack payment integration
- [ ] Job listings + applications
- [ ] Newsletter subscription

**Completion Criteria**:
- Complete course → enrollment → payment flow works
- Paystack webhooks tested
- All endpoints in Postman

---

### Phase 3 — Content Management (Week 6-7)
**Lead Developer**: Third Backend Dev or First Dev (after Phase 1 handoff)  
**Tasks**:
- [ ] Blog posts CRUD
- [ ] FAQ management
- [ ] Testimonials
- [ ] Gallery management
- [ ] Contact form inbox

**Completion Criteria**:
- All content endpoints working
- Search functionality tested

---

### Phase 4 — Analytics & Marketing (Week 8-9)
**Lead Developer**: Senior Dev  
**Tasks**:
- [ ] Partnership management
- [ ] Impact metrics dashboard
- [ ] Revenue analytics
- [ ] Enrollment reports
- [ ] Success stories

**Completion Criteria**:
- Admin can see all reports
- Analytics data accurate

---

### Phase 5 — Optimization & Polish (Week 10-11)
**Lead Developer**: Entire team  
**Tasks**:
- [ ] Performance optimization
- [ ] API documentation (Swagger)
- [ ] Security audit
- [ ] Load testing
- [ ] Production deployment

**Completion Criteria**:
- Zero vulnerabilities (OWASP)
- 99.9% uptime SLA
- Response time < 200ms
- API docs published

---

## 💻 DEVELOPMENT WORKFLOW

### Before You Start Coding

1. **Read all documentation**
   ```
   ✅ Read docs/PROJECT_OVERVIEW.md (this file!)
   ✅ Read docs/API_STANDARDS.md
   ✅ Read docs/ARCHITECTURE.md
   ✅ Read docs/DATABASE_SCHEMA.md
   ```

2. **Understand your module**
   - Check POSTMAN_COLLECTION_STRUCTURE.md for your endpoints
   - Check DATABASE_SCHEMA_PREVIEW.md for your database models
   - Check EXECUTIVE_SUMMARY.md for why choices were made

3. **Set up your environment**
   ```bash
   git clone <repo>
   cp .env.example .env.local
   # Fill in AWS credentials, database URL, etc.
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

### During Coding (Daily)

1. **Create a branch for your phase/module**
   ```bash
   git checkout -b phase-1/auth
   # or
   git checkout -b phase-2/payments
   ```

2. **Follow the folder structure**
   - Routes go in `src/routes/`
   - Controllers go in `src/controllers/`
   - Services go in `src/services/`
   - Types go in `src/types/`

3. **Write TypeScript, not JavaScript**
   - Define types for all functions
   - Use strict mode
   - Don't use `any`

4. **Test in Postman before committing**
   - Create endpoint
   - Test in Postman
   - Add to collection
   - Commit

5. **Keep code reviews in mind**
   ```bash
   git add .
   git commit -m "feat(phase-1): Add user registration endpoint"
   git push origin phase-1/auth
   # Create Pull Request for review
   ```

### Before You Finish (Code Review Checklist)

```
[ ] All functions have TypeScript types
[ ] No console.log() in production code (use logger)
[ ] No hardcoded API keys or secrets
[ ] Error handling is consistent
[ ] Endpoint tested in Postman
[ ] Postman collection updated
[ ] Activity logs captured for all admin actions
[ ] Comments added for complex logic
[ ] No unused imports
[ ] Variable names are clear (not a, b, x, y)
```

---

## 📚 REFERENCE DOCUMENTS FOR TEAM

Keep these links bookmarked:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **TEAM_BACKEND_SETUP.md** | This file - team organization | Before starting |
| **docs/PROJECT_OVERVIEW.md** | What we're building | First day |
| **docs/API_STANDARDS.md** | How to code | Every day |
| **docs/ARCHITECTURE.md** | System design | When confused |
| **docs/DATABASE_SCHEMA.md** | Database details | When working with DB |
| **POSTMAN_COLLECTION_STRUCTURE.md** | API endpoints | Before building |
| **BRAINSTORMING/...md** | Historical planning | Reference only |

---

## 🔐 SECURITY REMINDERS (FOR ALL DEVELOPERS)

Before committing code:

```
❌ DON'T:
- Commit .env file (use .env.example)
- Log passwords or tokens
- Skip input validation
- Use SQL queries (use Prisma)
- Delete audit logs
- Hardcode API keys

✅ DO:
- Use bcrypt for passwords (already set up)
- Verify JWT tokens (middleware exists)
- Validate all inputs (helpers exist)
- Use Prisma for queries
- Append-only for audit logs
- Use environment variables for secrets
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before going to production:

```
Infrastructure:
[ ] PostgreSQL backup automated (daily)
[ ] S3 bucket versioning enabled
[ ] CloudFront cache invalidation set up
[ ] SSL/TLS certificates valid
[ ] Rate limiting configured

Code:
[ ] All endpoints documented (Swagger)
[ ] Error messages don't leak system info
[ ] Validation on all inputs
[ ] No console.log() statements
[ ] API keys in environment variables only
[ ] CORS configured for production domain only

Testing:
[ ] Manual testing in Postman
[ ] Load testing (1000+ concurrent users)
[ ] Security audit completed
[ ] All edge cases tested

Monitoring:
[ ] Error tracking (Sentry)
[ ] Performance monitoring
[ ] Database monitoring
[ ] Log aggregation
[ ] Uptime monitoring
```

---

## 📞 COMMUNICATION PROTOCOL

### Daily Standup (If Remote Team)

**Every morning, in team chat:**
```
Progress (what did I accomplish yesterday):
- Built auth/register endpoint
- Created activity logging middleware

Today (what I'm working on):
- Build auth/login endpoint
- Update Postman collection

Blockers (anything stopping me):
- Need AWS S3 credentials (waiting on lead dev)
- Unsure about pagination format
```

### Weekly Sync (In-Person or Video)

**Every Friday 4 PM:**
```
1. Phase progress (on track?)
2. Demo new endpoints in Postman
3. Discuss any design issues
4. Assign next week's tasks
5. Review Postman collection
```

### Code Review Process

1. Finish coding your module/endpoint
2. Test thoroughly in Postman
3. Update docs & Postman collection
4. Create Pull Request (PR)
5. Wait for 1 approval from another dev
6. Merge to main
7. Mark task complete

---

## 🎯 YOUR FIRST WEEK (Team Timeline)

### Day 1 — Understanding
```
Morning:
- Read all documentation (TEAM_BACKEND_SETUP.md through EXECUTIVE_SUMMARY.md)
- Understand 25 modules & 5 phases
- Understand database schema (20+ tables)

Afternoon:
- Each dev gets assigned a Phase
- Review Postman collection for your phase
- Download Postman & import collection
- Set up local environment (.env, npm install)
```

### Day 2 — Setup
```
Morning:
- Database connection test (npm run dev)
- Prisma setup (npm run prisma:generate)
- Create database (npm run prisma:migrate)
- View data in Prisma Studio (npm run prisma:studio)

Afternoon:
- Existing scaffold reviewed (middleware, utils, types)
- Each dev creates their first route file
- Test basic endpoint in Postman
```

### Day 3 — Phase 1 Kickoff (Senior Dev)
```
Morning:
- Lead dev builds auth/register & auth/login
- Live code demo to team
- Explain patterns & conventions

Afternoon:
- Team starts building:
  - Dev 1: auth.routes + auth.controller (Phase 1 lead)
  - Dev 2: users.routes + users.controller
  - Dev 3: kyc.routes + kyc.controller
```

### Day 4-5 — Integration
```
- Auth endpoints working
- User management endpoints working
- KYC endpoints working
- All endpoints tested in Postman
- Activity logs captured
- Postman collection updated
- First PR reviews & merges
- Ready for frontend integration testing
```

---

## 📊 PROGRESS TRACKING

### GitHub Board (Kanban)

Each phase as a GitHub Project:
```
Phase 1 - Foundation:
├── To Do
│   ├── Set up database
│   ├── Build auth endpoints
│   ├── Build user management
│   └── Build file uploads
├── In Progress
│   └── (current tasks)
└── Done
    ├── ✅ Database schema
    └── ✅ Auth middleware
```

### Weekly Stats

**Track these metrics:**
```
- Endpoints built this week
- Postman collection updated (%)
- Bugs found & fixed
- Code review turnaround (hours)
- Test coverage (if applicable)
- Performance (avg response time)
```

---

## 🆘 GETTING UNSTUCK

### "I don't understand how X works"

1. Check docs/ folder (your first stop)
2. Look at existing code for patterns
3. Ask in team chat (mention what you've tried)
4. Schedule pairing session with senior dev

### "I think I found a bug in the brainstorming docs"

1. Note the discrepancy
2. Discuss with team in standup
3. Update docs/ folder if decision changes
4. Communicate change to frontend team

### "My endpoint doesn't work"

1. Check TypeScript errors (npm run dev)
2. Check logs (look at src/utils/logger.ts)
3. Add debug console.log() temporarily
4. Test in Postman with correct format
5. Ask for code review

### "I'm way ahead of schedule"

1. Code review other PRs
2. Improve documentation
3. Add unit tests
4. Optimize database queries
5. Help other devs

---

## ✅ BEFORE YOU GO LIVE

**Final Team Checklist:**

```
Code Quality:
[ ] All TypeScript types defined
[ ] No console.log() statements
[ ] Error messages helpful (not exposing system info)
[ ] All inputs validated
[ ] Rate limiting working

Database:
[ ] All migrations applied
[ ] Indexes created on key fields
[ ] Activity logs working
[ ] Soft deletes implemented

Security:
[ ] Passwords bcrypt hashed
[ ] JWT tokens verified
[ ] RBAC enforced (dept-based)
[ ] API keys in environment variables only
[ ] CORS configured for production domains

Testing:
[ ] All endpoints work in Postman
[ ] Auth flow tested (register → login → protected endpoint)
[ ] RBAC tested (admin can't access wrong dept)
[ ] File upload tested (image & document)
[ ] Paystack payment tested (sandbox mode)
[ ] Error cases tested (wrong token, validation errors)

Documentation:
[ ] README.md updated
[ ] API docs generated (Swagger)
[ ] Database migrations documented
[ ] Deployment steps documented
[ ] Team knows their responsibilities

Deployment:
[ ] Backup strategy confirmed
[ ] Monitoring set up
[ ] CI/CD pipeline working
[ ] Database backups automated
[ ] Error tracking (Sentry) enabled
```

---

## 🎓 LEARNING RESOURCES (For Team)

### Required Reading
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Prisma Documentation](https://prisma.io/docs/)
- [OWASP Security Top 10](https://owasp.org/www-project-top-ten/)
- [REST API Design Best Practices](https://restfulapi.net/)

### Recommended Videos
- "Node.js Security" on YouTube
- "Database Indexing" for PostgreSQL
- "TypeScript Advanced Types"

### Tools You'll Use
- **VS Code** - Code editor
- **Postman** - API testing
- **pgAdmin** - Database management (optional)
- **Git/GitHub** - Version control
- **Terminal/CMD** - Running commands

---

## 📞 CONTACTS & ESCALATION

**When you need help:**

| Issue | Who to Ask | Response Time |
|-------|-----------|----------------|
| Technical architecture question | Lead Dev | 1 hour |
| Code review needed | Any team member | < 2 hours |
| Database schema question | Lead Dev | 30 min |
| Environment setup issue | Lead Dev | 15 min |
| Postman collection sync | Frontend dev contact | 1 hour |
| Production issue | Lead Dev + team | Immediate |

---

## 🎯 SUCCESS = EVERYONE FOLLOWING THIS GUIDE

✅ Everyone reads the same documentation  
✅ Everyone follows the same folder structure  
✅ Everyone writes code the same way  
✅ Everyone tests in Postman before committing  
✅ Everyone maintains the Postman collection  
✅ Everyone updates docs when things change  

**This is your team's playbook. Stick to it.** 🏈

---

**Document Status:** ✅ READY FOR TEAM USE  
**Last Updated:** Today  
**Next Review:** After Phase 1 completion  

**Questions? Discuss in team standup.** 🚀
