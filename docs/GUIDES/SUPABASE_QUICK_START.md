# ⚡ Supabase Quick Setup (5 Minutes)

## STEP 1: Create Supabase Account (2 min)

1. Go to **https://supabase.com**
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"** (easiest)
4. Authorize with your GitHub account
5. ✅ Account created!

---

## STEP 2: Create Your First Project (2 min)

1. Click **"New Project"** button (or "Create a new project")
2. Fill in:
   - **Project name**: `zyratech-hub`
   - **Database Password**: `ZyraTech@Secure@2026` (save this!)
   - **Region**: `US East 1` (or closest to you)
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes (Supabase is setting up your database)
5. ✅ You'll see green "Project is ready" message

---

## STEP 3: Get Your Database Connection String (1 min)

1. In Supabase dashboard, click **Settings** (⚙️ icon, bottom left)
2. Click **"Database"** (left sidebar)
3. Look for **"Connection string"** section
4. Select **"URI"** tab (not "Connection Pooler")
5. Click **"Copy"** button
6. The string will look like:
   ```
   postgresql://postgres:ZyraTech@Secure@2026@abcdef123.supabase.co:5432/postgres
   ```

---

## STEP 4: Update Your .env File

Edit `backend/.env` and replace the DATABASE_URL:

```bash
# Paste the connection string you copied from Supabase
DATABASE_URL="postgresql://postgres:ZyraTech@Secure@2026@YOUR_HOST_HERE.supabase.co:5432/postgres"

# Keep these as is
JWT_SECRET="your-super-secret-key-at-least-32-characters-long-change-this-to-something-random"
JWT_ACCESS_EXPIRY=900
JWT_REFRESH_EXPIRY=604800
API_PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_FRONTEND_URL=http://localhost:3001
BCRYPT_ROUNDS=12
LOG_LEVEL=debug
```

---

## STEP 5: Create Database Tables

Run these commands in your terminal:

```bash
# Navigate to backend folder
cd backend

# Install Prisma (if not installed)
npm install @prisma/client prisma

# Generate Prisma Client
npx prisma generate

# Create all tables in Supabase
npx prisma migrate deploy
```

If you get error "no migrations", run instead:

```bash
npx prisma migrate dev --name init
```

---

## STEP 6: Verify It Works

Create `backend/verify-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ DATABASE CONNECTED! Ready to build APIs');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Run it:

```bash
node verify-db.js
```

You should see:
```
✅ DATABASE CONNECTED! Ready to build APIs
```

---

## STEP 7: View Your Database (Optional)

Open Prisma Studio:

```bash
npx prisma studio
```

This opens **http://localhost:5555** where you can see all your tables and data visually.

---

## STEP 8: Share with Your Team

Each team member should:

1. Get the same DATABASE_URL from you
2. Create their own `backend/.env` with that DATABASE_URL
3. Run `npx prisma generate`
4. Run `npm install`
5. They can now work on the same database!

---

## ✅ Done!

Your Supabase is now ready. You have:
- ✅ PostgreSQL database in the cloud
- ✅ All tables created (User, Course, Payment, etc.)
- ✅ Team can access from anywhere
- ✅ Free tier (plenty for development)

---

## Next: Build Module 1 APIs

Now we'll build:
- 1.1 POST /auth/register
- 1.2 POST /auth/verify-email
- 1.3 POST /auth/login
- 1.4 POST /auth/change-password
- ... and 7 more endpoints

All with professional security! 🚀

---

## Troubleshooting

**"Connection refused"?**
→ Check DATABASE_URL is correct

**"Tables don't exist"?**
→ Run: `npx prisma migrate deploy`

**"Permission denied"?**
→ Check database password is correct

---

**Once you complete these 7 steps, come back and we'll build the APIs!** ✅

