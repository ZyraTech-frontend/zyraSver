# ZyraTech Hub — Backend API

> The official Node.js / Express backend powering the ZyraTech Hub STEM Education Platform.

## 🚀 Overview

This repository contains the robust, scalable backend infrastructure for ZyraTech Hub. It is built to handle everything from student enrollment and Paystack payments, to dynamic CMS content management, job applications, and granular admin department permissions.

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL (Hosted on Supabase)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **File Storage:** AWS S3 / Supabase Storage (via Multer)
- **Payments:** Paystack API Integration

## 📦 Core Modules Built

1. **Authentication & RBAC:** Secure login, password management, and granular department permissions (e.g., `training_courses`, `blog_articles`, `payments`).
2. **Users & KYC:** Admin management and secure identity verification handling.
3. **Training & Applications:** Course management and multi-step student enrollment endpoints.
4. **Jobs & Career:** Career portal integration for job listings and applicant tracking.
5. **Payments:** Automated webhook handling for Paystack transactions.
6. **CMS & Settings:** Dynamic page content, hero sliders, and global platform configurations.
7. **Blog & Projects:** SEO-friendly content publishing and project portfolio management.
8. **Gallery:** Media albums supporting both images and embedded videos.
9. **FAQ & Testimonials:** Platform support and social proof management.
10. **Partnerships & Contact:** Public inquiry forms and administrative inbox.
11. **Impact & Activity Logs:** Platform statistics tracking and system-wide audit logs.

## 💻 Running Locally

1. Clone the repository.
2. Run `npm install` to install all dependencies.
3. Configure your `.env` file with your `DATABASE_URL` and `DIRECT_URL`.
4. Run `npx prisma generate` to build the Prisma Client.
5. Run `npm run dev` to start the development server on port 5000.

## 🔒 Security

All admin routes are strictly protected by `authMiddleware` and `checkPermission` middleware to ensure zero-trust security across different organizational departments.
