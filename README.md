# ZyraTech Hub — Backend API 🚀

> The official enterprise-grade Node.js backend powering the **ZyraTech Hub STEM Education Platform**.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)

## 📖 Overview

This repository contains the robust, scalable, and fully Dockerized backend infrastructure for ZyraTech Hub. It is built to handle everything from student enrollment and Paystack payments to dynamic CMS content management, job applications, and granular Admin Department permissions.

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20)
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (Hosted on Supabase)
- **ORM:** Prisma
- **Storage:** Supabase Storage (S3 API via AWS SDK)
- **Security:** Helmet, Express Rate Limit, JWT, bcrypt
- **CI/CD:** GitHub Actions
- **Infrastructure:** Docker & Docker Compose

---

## 🚀 Quick Start (Recommended)

The easiest way to run the API locally is using Docker. This ensures you have the exact same environment as production.

### 1. Configure Environment
Create a `.env` file from the example template:
```bash
cp .env.example .env
```
Open `.env` and fill in your Supabase `DATABASE_URL` and S3 Access Keys.

### 2. Run with Docker
Start the database and the API in the background:
```bash
docker-compose up -d
```
That's it! Docker will automatically install dependencies, run Prisma migrations, run the database seeder, and start the API on `http://localhost:5000`.

---

## 💻 Manual Local Setup

If you prefer to run the application natively without Docker:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply database migrations (if setting up for the first time)
npx prisma migrate dev

# 4. Run the database seeder
npm run db:seed

# 5. Start the development server
npm run dev
```

---

## 🔐 Security & Infrastructure

### 1. Role-Based Access Control (RBAC)
All admin routes are strictly protected by `authMiddleware` and `checkPermission` middleware to ensure zero-trust security across different organizational departments (e.g., `training_courses`, `payments`, `settings`).

### 2. File Uploads (Supabase Storage)
The backend intercepts file uploads `(multer)` in memory and seamlessly streams them directly to your **Supabase S3 Bucket**. No files are stored locally, making the application 100% stateless and ready for cloud scaling.

### 3. CI/CD Pipeline
This repository includes a fully automated **GitHub Actions** pipeline (`.github/workflows/ci-cd.yml`):
- **CI:** Automatically tests and compiles TypeScript on every Pull Request.
- **CD:** Automatically deploys to the production server upon merging to the `main` branch.

---

## 📜 Available NPM Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the server in development mode with hot-reloading (nodemon). |
| `npm run build` | Compiles TypeScript into the `/dist` directory. |
| `npm start` | Runs the compiled JavaScript in production mode. |
| `npm run db:push` | Pushes the Prisma schema to the database (use for dev only). |
| `npm run db:seed` | Runs the seeder to populate the DB with Super Admins & Settings. |
