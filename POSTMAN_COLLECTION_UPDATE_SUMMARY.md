# ✅ Postman Collection Updated!

## 📝 What Was Updated

Your Postman collection (`zyratech-postman-collection.json`) has been updated with:

### 1. **New Custom Domain**
- **Old URL:** `http://3.16.26.212:5000/api` (AWS)
- **New URL:** `https://api.zyratechhub.com/api` (Azure with custom domain)

### 2. **Updated Login Credentials**
- **Email:** `afedi@zyratech.com`
- **Password:** `TempPassword123!`

### 3. **Auto-Save Token Feature**
The login request now automatically saves your access token to collection variables after successful login. You don't need to manually copy-paste it anymore!

---

## 🚀 How to Use the Updated Collection

### **Step 1: Import the Collection**

1. Open Postman
2. Click **Import** button (top left)
3. Select file: `zyratech-postman-collection.json`
4. Click **Import**

---

### **Step 2: Test the Login**

1. Open the collection: **ZyraTech Hub API - Production (Azure)**
2. Go to **1. Authentication & Profile** → **Login**
3. Click **Send**

**The token will automatically save!** ✅

You'll see in the Postman console:
```
✅ Access token auto-saved!
```

---

### **Step 3: Test Protected Endpoints**

Now all authenticated requests will automatically use the saved token:

- **Get Your Profile:** `GET /api/auth/me`
- **List Users:** `GET /api/admin/users`
- **List Courses:** `GET /api/admin/training-courses`
- **And all other admin endpoints...**

---

## 📚 Collection Contents

The collection includes **100+ endpoints** across **19 modules**:

1. ✅ Authentication & Profile (17 endpoints)
2. ✅ User Management (8 endpoints)
3. ✅ Training Courses (6 endpoints)
4. ✅ Training Applications/Enrollments (5 endpoints)
5. ✅ Jobs & Applications (8 endpoints)
6. ✅ Partnerships (5 endpoints)
7. ✅ Contact Inquiries (5 endpoints)
8. ✅ Messages (5 endpoints)
9. ✅ Newsletter (4 endpoints)
10. ✅ Payments & Transactions (5 endpoints)
11. ✅ Blog Articles (6 endpoints)
12. ✅ Gallery & Albums (9 endpoints)
13. ✅ Projects Portfolio (6 endpoints)
14. ✅ FAQ (7 endpoints)
15. ✅ Testimonials (6 endpoints)
16. ✅ CMS Content (9 endpoints)
17. ✅ Impact Stories & Metrics (10 endpoints)
18. ✅ Settings (5 endpoints)
19. ✅ Activity Logs (1 endpoint)

---

## 🔐 Collection Variables

The collection uses these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `https://api.zyratechhub.com/api` | Your Azure API base URL |
| `admin_token` | Auto-saved after login | JWT access token |
| `access_token` | Auto-saved after login | JWT access token (alternative name) |

---

## ⚡ Quick Test Checklist

- [ ] Import the updated collection into Postman
- [ ] Run the Login request
- [ ] Verify token is auto-saved (check console)
- [ ] Test `GET /api/auth/me` to get your profile
- [ ] Test `GET /api/admin/users` to list users
- [ ] Test other endpoints as needed

---

## 🎉 You're All Set!

Your Postman collection is now fully configured for your Azure-hosted backend with the custom domain `api.zyratechhub.com`. All 100+ endpoints are ready to test!

---

## 📖 Additional Resources

- `POSTMAN_TESTING_GUIDE.md` - Detailed testing instructions
- `COMPLETE_API_ENDPOINTS_REFERENCE.md` - Full API documentation
- `CUSTOM_DOMAIN_SETUP_GUIDE.md` - Custom domain setup details

---

**Happy Testing!** 🚀
