# 🚀 ZyraTech Hub - Complete API Reference

**Base URL:** `https://api.zyratechhub.com`  
**Environment:** Production (Azure App Service)

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [User Management (Super Admin)](#user-management)
4. [Training Courses](#training-courses)
5. [Training Applications/Enrollments](#training-applications)
6. [Jobs & Applications](#jobs)
7. [Partnerships](#partnerships)
8. [Contact Inquiries](#contact)
9. [Messages](#messages)
10. [Newsletter](#newsletter)
11. [Payments & Transactions](#payments)
12. [Blog Articles](#blog)
13. [Gallery & Albums](#gallery)
14. [Projects Portfolio](#projects)
15. [FAQ](#faq)
16. [Testimonials](#testimonials)
17. [CMS Content](#cms-content)
18. [Impact Stories & Metrics](#impact)
19. [Settings](#settings)
20. [Activity Logs](#activity-logs)

---

## 🏥 Health Check

### Check API Status
```http
GET {{base_url}}/health
```
**Auth:** None  
**Response:**
```json
{
  "success": true,
  "message": "ZyraTech Hub API is running",
  "environment": "production",
  "timestamp": "2026-08-05T..."
}
```

---

## 🔐 Authentication

### 1. Login
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@zyratechhub.com",
  "password": "YourPassword123!"
}
```

