# 🚀 PostgreSQL Quick Start (5 Minutes)

Choose your option and follow:

---

## ⚡ Option A: Windows PostgreSQL Installer (Fastest)

```bash
# 1. Download from: https://www.postgresql.org/download/windows/
# 2. Install, set password: AdminPostgres@123
# 3. Open Command Prompt and run:

psql -U postgres -h localhost

# 4. Paste these commands:

CREATE DATABASE zyratech_db;
CREATE USER zyratech_user WITH PASSWORD 'ZyraTech@Secure123';
GRANT ALL PRIVILEGES ON DATABASE zyratech_db TO zyratech_user;
ALTER DATABASE zyratech_db OWNER TO zyratech_user;

# 5. Exit with: \q

# 6. Copy this DATABASE_URL to backend/.env:
# DATABASE_URL="postgresql://zyratech_user:ZyraTech@Secure123@localhost:5432/zyratech_db"
```

---

## 🐳 Option B: Docker (Cleanest)

```bash
# 1. Create docker-compose.yml in project root with content below
# 2. Run from project root:

docker-compose up -d

# 3. Verify running:
docker-compose ps

# 4. Create database:
docker exec zyratech_postgres psql -U postgres -c "CREATE DATABASE zyratech_db;"
docker exec zyratech_postgres psql -U postgres -c "CREATE USER zyratech_user WITH PASSWORD 'ZyraTech@Secure123';"
docker exec zyratech_postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE zyratech_db TO zyratech_user;"

# 5. Copy this to backend/.env:
# DATABASE_URL="postgresql://zyratech_user:ZyraTech@Secure123@localhost:5432/zyratech_db"
```

**docker-compose.yml content:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: zyratech_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: AdminPostgres@123
      POSTGRES_DB: zyratech_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## ☁️ Option C: Supabase Cloud (Zero Setup)

```bash
# 1. Go to: https://supabase.com
# 2. Sign up with GitHub
# 3. Create new project
# 4. Wait 2 minutes for database to be ready
# 5. Copy connection string from Settings > Database
# 6. Paste into backend/.env as DATABASE_URL
```

---

## ✅ Verify Connection Works

```bash
# From backend folder:
cd backend

# Create test file (test-db.js):
# [See DATABASE_SETUP.md for full content]

# Run test:
node test-db.js

# Should output:
# ✓ Database connection successful!
```

---

## 🔧 Set Up Prisma

```bash
cd backend

# 1. Install Prisma
npm install prisma @prisma/client

# 2. Generate Prisma client
npx prisma generate

# 3. Create tables from schema
npx prisma migrate dev --name init

# 4. View database (optional)
npx prisma studio
```

---

## ✨ After Setup

Your DATABASE_URL in `backend/.env` should be:

```
DATABASE_URL="postgresql://zyratech_user:ZyraTech@Secure123@localhost:5432/zyratech_db"
```

Then run:
```bash
cd backend
npm install
npm run dev
```

You'll see:
```
✓ Database connected
✓ Server running on http://localhost:5000
```

---

## 🆘 If Something Fails

**Can't connect?**
```bash
# Test from command line
psql -U zyratech_user -h localhost -d zyratech_db -c "SELECT 1;"
```

**Docker not working?**
```bash
# Check container
docker logs zyratech_postgres

# Restart
docker-compose restart
```

**Need full help?**
→ See `backend/DATABASE_SETUP.md` for detailed guide

---

**Ready?** Pick Option A, B, or C above and let me know when database is running! ✅

Then we build Module 1 Authentication! 🚀

