# ZyraTech Hub — Frontend Integration Brief
> Hand this document to your AI assistant before touching any code.

---

## 🚨 CRITICAL RULE — READ FIRST

The website at **https://zyratechhub.com** is LIVE and hardcoded in React. It is in production and being used by real visitors.

**You must NOT:**
- Delete or replace any existing hardcoded JSX/HTML structure
- Modify the `main` branch directly
- Break any existing UI, layout, or styling
- Commit directly to `main` under any circumstance

**You must:**
- Work exclusively on the `dev` branch
- Create feature branches off `dev` for each integration task (e.g. `feature/courses-integration`)
- Keep all existing hardcoded UI intact and map API data INTO it
- Add loading states and error states wherever data is fetched
- Only merge to `main` after full testing and approval on the staging deployment

---

## 🏗️ Project Context

- **Platform:** ZyraTech Hub — STEM Education Platform based in Ghana
- **Frontend:** React (hosted on Azure App Service)
- **Backend:** Node.js + Express + TypeScript + PostgreSQL (Prisma ORM)
- **Live Website:** https://zyratechhub.com
- **Production API:** https://api.zyratechhub.com/api
- **GitHub Repo:** https://github.com/ZyraTech-frontend/zyratech-website

---

## 🔀 Branching & Deployment Rules

```
feature/xxx  →  dev  →  (staging slot review)  →  main  →  production
```

| Branch | Deploys To | API Points To |
|--------|-----------|---------------|
| `main` | https://zyratechhub.com (LIVE) | https://api.zyratechhub.com/api |
| `dev` | Azure Staging Slot (preview URL) | https://api.zyratechhub.com/api |

- Azure App Service has two deployment slots: **production** (`main`) and **staging** (`dev`)
- GitHub Actions auto-deploys each branch to its respective slot
- Never merge to `main` without full QA on the staging slot

---

## ⚙️ Environment Variables

Create a `.env` file (never commit it):

```env
# dev branch
REACT_APP_API_URL=https://api.zyratechhub.com/api
REACT_APP_ENABLE_DYNAMIC_API=true

# main branch (production) — set in Azure App Service config
REACT_APP_API_URL=https://api.zyratechhub.com/api
REACT_APP_ENABLE_DYNAMIC_API=true
```

Use feature flags to safely wrap new dynamic components:

```jsx
// Safe pattern — never breaks production
{process.env.REACT_APP_ENABLE_DYNAMIC_API === 'true' ? (
  <DynamicCoursesSection courses={courses} loading={loading} />
) : (
  <HardcodedCoursesSection />
)}
```

---

## 🔐 Authentication

All admin routes require a Bearer token. Public routes need no token.

**Login:**
```
POST https://api.zyratechhub.com/api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "data": { "token": "...", "user": { ... } } }
```

Store the token in `localStorage` or a React context. Send it as:
```
Authorization: Bearer <token>
```

**Get current user:**
```
GET /api/auth/me  →  requires Bearer token
```

---

## 📡 All API Endpoints

### Public Endpoints (no token required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/training-courses` | List all active courses |
| GET | `/training-courses/:id` | Single course details |
| POST | `/training/applications` | Student enrollment form |
| GET | `/jobs` | List active job openings |
| GET | `/jobs/:id` | Single job details |
| POST | `/jobs/applications` | Submit job application (multipart/form-data) |
| GET | `/settings/public` | Site settings (branding, contact, social links) |
| GET | `/blog/articles` | List published blog articles |
| GET | `/blog/articles/:slug` | Single article by slug |
| GET | `/gallery/albums` | Gallery albums with media |
| GET | `/gallery/albums/:id` | Single album |
| GET | `/content/items/:section` | CMS content by section slug |
| GET | `/content/pages/:slug` | CMS page by slug |
| GET | `/projects` | Projects portfolio |
| GET | `/projects/:slug` | Single project |
| GET | `/faq` | Published FAQs |
| GET | `/testimonials` | Published testimonials |
| GET | `/impact` | Impact metrics and stories |
| POST | `/newsletter/subscribe` | Newsletter signup |
| POST | `/newsletter/unsubscribe` | Newsletter unsubscribe |
| POST | `/partnerships` | Partnership application form |
| POST | `/contact` | Contact form submission |
| POST | `/messages` | General message submission |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login → returns JWT |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset with token from email |
| GET | `/auth/me` | Get current user (protected) |
| POST | `/auth/logout` | Logout (protected) |
| POST | `/auth/change-password` | Change password (protected) |

---

## ⚠️ Critical Field Notes

These are known gotchas — get them wrong and you'll get a 400/500 error:

| Endpoint | Field | Type | Example |
|----------|-------|------|---------|
| Training courses | `price` | **String** (not number) | `"GHS 500"` |
| Job listings | `requirements` | **String[]** | `["NodeJS", "React"]` |
| Job listings | `responsibilities` | **String[]** | `["Build features"]` |
| Job listings | `benefits` | **String[]** | `["Health insurance"]` |
| Job applications | `resumeFile` | **File upload** | multipart/form-data |
| Partnerships | `agreedToTerms` | **Boolean** | `true` (required) |
| Partnerships | `organizationName` | String | required field |
| Contact | `fullName` | String | required field |
| Messages | `sender` | String | required field |
| Messages | `content` | String | required field |

---

## 📋 Form Request Bodies

### Training Application
```json
{
  "courseId": "COURSE_ID",
  "applicantName": "Jane Student",
  "email": "jane@example.com",
  "phone": "0201234567",
  "experienceLevel": "Beginner"
}
```

### Job Application (multipart/form-data)
```
jobId: JOB_ID
applicantName: Bob Worker
email: bob@example.com
phone: 0209998888
coverLetter: I would love to work here.
resumeFile: [FILE]
```

### Contact Form
```json
{
  "fullName": "Jane Visitor",
  "email": "jane@example.com",
  "subject": "General Inquiry",
  "message": "I have a question about your robotics courses."
}
```

### Partnership Application
```json
{
  "organizationName": "Tech Corp",
  "contactName": "Bob Manager",
  "email": "bob@techcorp.com",
  "phone": "0200000000",
  "proposal": "We would like to partner on STEM education.",
  "agreedToTerms": true
}
```

### Newsletter Subscribe
```json
{
  "email": "subscriber@example.com",
  "name": "Jane Subscriber"
}
```

### Message
```json
{
  "sender": "John Visitor",
  "email": "john@example.com",
  "content": "What courses do you offer for beginners?"
}
```

---

## 🧱 Integration Strategy (Follow This Order)

### Step 1 — Audit before touching anything
- Read every existing component file
- Identify which sections are hardcoded and map them to the corresponding API endpoint
- Do NOT modify anything yet

### Step 2 — Set up API service layer
Create a central `src/services/api.js` file:

```js
const BASE_URL = process.env.REACT_APP_API_URL;

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json())
};
```

### Step 3 — Build with mock data first
Before hitting the real API, create `src/mocks/` with JSON files that mirror the API response shape. Integrate components against mock data first.

### Step 4 — Replace mock with real API calls
Swap mock data for real `fetch`/`axios` calls. Always handle:
- Loading state (spinner or skeleton screen)
- Error state (fallback UI, never a blank screen)
- Empty state (no data returned)

### Step 5 — Test on staging slot
Push to `dev` branch → verify on Azure staging URL → get approval → merge to `main`

---

## 🎨 UX Requirements

Since the live site is currently instant (hardcoded), every dynamic section MUST have:

1. **Loading state** — skeleton screens or spinners while fetching
2. **Error state** — graceful fallback, never a broken layout
3. **Empty state** — friendly message if API returns no data

The user experience must feel as fast and smooth as the current hardcoded version.

---

## 📦 API Response Shape

All API responses follow this consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Always check `response.success` before using `response.data`.

---

## 🔒 Security Rules

- Never hardcode the API URL — always use `process.env.REACT_APP_API_URL`
- Never commit `.env` files to GitHub
- Never expose JWT tokens in URLs or logs
- Store tokens in `localStorage` or React context only
- All admin-facing features must check for a valid token before rendering

---

## ✅ Pre-Merge Checklist

Before any PR from `dev` → `main`:

- [ ] All hardcoded UI still intact (nothing deleted)
- [ ] Loading states on every data-fetching component
- [ ] Error states on every data-fetching component
- [ ] No console errors or warnings
- [ ] Tested on Azure staging slot
- [ ] Environment variables set correctly in Azure App Service config
- [ ] No `.env` files committed
- [ ] No API URLs hardcoded in source code
