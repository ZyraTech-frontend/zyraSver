# 🚀 QUICK START CARD - Print This!

**For**: ZyraTech Hub Backend Team  
**Date**: June 18, 2026

---

## 📖 Read These (In Order)

```
1️⃣  docs/GUIDES/README_TEAM_START_HERE.md
2️⃣  docs/GUIDES/TEAM_BACKEND_SETUP.md
3️⃣  backend/docs/API_STANDARDS.md
4️⃣  docs/BRAINSTORMING/EXECUTIVE_SUMMARY.md
5️⃣  docs/BRAINSTORMING/POSTMAN_COLLECTION_STRUCTURE.md
```

**Time**: ~2 hours

---

## 💻 Setup (First Day)

```bash
# Navigate to backend folder
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with:
# - DATABASE_URL=postgresql://...
# - AWS_REGION=your-region
# - AWS_ACCESS_KEY_ID=...
# - AWS_SECRET_ACCESS_KEY=...
# - PAYSTACK_SECRET_KEY=...

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev

# Test (in another terminal)
curl http://localhost:5000/health
```

---

## 📁 Where Things Are

| What | Where |
|------|-------|
| **Write code** | `backend/src/` |
| **Database models** | `backend/prisma/schema.prisma` |
| **Coding standards** | `backend/docs/API_STANDARDS.md` |
| **Team workflow** | `docs/GUIDES/TEAM_BACKEND_SETUP.md` |
| **Tech decisions** | `docs/BRAINSTORMING/EXECUTIVE_SUMMARY.md` |
| **All 25 modules** | `docs/BRAINSTORMING/POSTMAN_COLLECTION_STRUCTURE.md` |
| **Configuration** | `backend/.env` + `backend/package.json` |
| **Tests** | `backend/tests/` |

---

## 🔧 Daily Commands

```bash
# Start development server
npm run dev

# Watch mode (rebuilds on changes)
npm run watch

# Run tests
npm run test

# Build for production
npm run build

# Generate Prisma types
npx prisma generate

# Create database migration
npx prisma migrate dev --name my_migration

# Open Prisma Studio (GUI for database)
npx prisma studio

# Format code
npm run format

# Lint code
npm run lint
```

---

## ✅ Team Roles (5 Phases)

**Phase 1 (Weeks 1-2)**: Auth, Users, KYC, Uploads  
**Phase 2 (Weeks 3-5)**: Courses, Enrollments, Payments  
**Phase 3 (Weeks 6-7)**: Blog, FAQ, Testimonials, Gallery  
**Phase 4 (Weeks 8-9)**: Partnerships, Analytics, Impact  
**Phase 5 (Weeks 10-11)**: Tests, Optimization, Deployment  

See `TEAM_BACKEND_SETUP.md` for your specific role.

---

## 📋 Folder Structure

```
backend/
├── src/              ← YOUR CODE HERE
│   ├── routes/       ← API endpoints
│   ├── controllers/  ← Business logic
│   ├── services/     ← External APIs
│   ├── middleware/   ← Auth, validation
│   └── utils/        ← Helpers
├── prisma/           ← DATABASE
│   └── schema.prisma ← Models
├── tests/            ← TEST SUITES
├── docs/             ← STANDARDS
├── package.json      ← DEPENDENCIES
└── .env              ← SECRETS
```

---

## 🎯 Before You Code

- [ ] Read all 5 guides (2 hours)
- [ ] Set up `.env` with your credentials
- [ ] Run `npm install`
- [ ] Run `npm run dev` and test health check
- [ ] Read `backend/docs/API_STANDARDS.md` (MANDATORY!)
- [ ] Check `POSTMAN_COLLECTION_STRUCTURE.md` for what you're building

---

## 🐛 Troubleshooting

**`npm install` fails?**  
→ Clear cache: `npm cache clean --force` then retry

**Database connection error?**  
→ Check `.env` has valid DATABASE_URL

**Port 5000 already in use?**  
→ Change `PORT` in `.env` or kill process: `lsof -i :5000`

**TypeScript errors?**  
→ Run: `npx prisma generate` to generate types

**Tests fail?**  
→ Check `.env.test` exists and database is running

---

## 🚀 First Task

1. **Join Phase 1** (check `TEAM_BACKEND_SETUP.md`)
2. **Pick a module** from `POSTMAN_COLLECTION_STRUCTURE.md`
3. **Create controller** in `backend/src/controllers/`
4. **Follow standards** in `backend/docs/API_STANDARDS.md`
5. **Test your code** with Postman
6. **Push to GitHub** when complete

---

## 📞 Need Help?

1. Check `backend/docs/API_STANDARDS.md` (answers 90% of questions)
2. Check `docs/BRAINSTORMING/EXECUTIVE_SUMMARY.md` (architecture questions)
3. Check `docs/BRAINSTORMING/DATABASE_SCHEMA_PREVIEW.md` (database questions)
4. Ask your Phase Lead (from `TEAM_BACKEND_SETUP.md`)

---

## ✨ Key Rules

✅ **Always follow** `backend/docs/API_STANDARDS.md`  
✅ **Write tests** for your code  
✅ **Never commit** `.env` (it's git-ignored)  
✅ **Run tests** before pushing  
✅ **Use TypeScript** for type safety  
✅ **Follow folder structure** - consistency matters  

---

**Print this card and pin it to your desk!** 📌

More details: `docs/GUIDES/README_TEAM_START_HERE.md`

🚀 **You're ready to build!**

