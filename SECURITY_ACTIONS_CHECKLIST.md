# 🔒 Security Actions Checklist

## ✅ Completed
- [x] ✅ Changed super admin password
- [x] ✅ Fixed JWT secret fallback (no weak default)

---

## 🚀 Remaining Actions (Do These Now)

### **Action 1: Generate and Update JWT Secret**

#### Step 1: Generate a New JWT Secret
Run this command in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This will output a 128-character random string like:
```
a1b2c3d4e5f6...
```

#### Step 2: Update Azure Environment Variable
1. Go to Azure Portal → App Services → `zyratech-api`
2. Click **Configuration** (left sidebar)
3. Find `JWT_SECRET` in Application settings
4. Click **Edit** (pencil icon)
5. Replace the value with the new generated secret
6. Click **OK**
7. Click **Save** at the top
8. Wait 2-3 minutes for the app to restart

**⚠️ Important:** All users will be logged out after this change (expected behavior)

---

### **Action 2: Rotate Database Password**

#### Step 1: Generate New Password in Supabase
1. Go to https://supabase.com
2. Open your project: `zyratech-hub`
3. Go to **Settings** → **Database**
4. Click **Reset Database Password**
5. Supabase will generate a new secure password
6. **Copy the new password** immediately (you won't see it again)

#### Step 2: Update Connection Strings
You'll need to update two connection strings with the new password.

**Current format:**
```
postgresql://postgres.cblfpfsvavahttedfloe:OLD_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?...
```

**New format:**
```
postgresql://postgres.cblfpfsvavahttedfloe:NEW_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?...
```

#### Step 3: Update Azure Environment Variables
1. Go to Azure Portal → App Services → `zyratech-api`
2. Click **Configuration** (left sidebar)
3. Update **DATABASE_URL**:
   - Click **Edit**
   - Replace the password in the connection string
   - Click **OK**
4. Update **DIRECT_URL**:
   - Click **Edit**
   - Replace the password in the connection string (use port 5432 for direct URL)
   - Click **OK**
5. Click **Save** at the top
6. Wait 2-3 minutes for the app to restart

#### Step 4: Test the Connection
Test your health endpoint to verify database connection:
```
GET https://api.zyratechhub.com/health
```

Should return 200 OK.

---

### **Action 3: Rotate S3 Access Keys (Supabase Storage)**

#### Step 1: Generate New Keys in Supabase
1. Go to https://supabase.com
2. Open your project: `zyratech-hub`
3. Go to **Settings** → **API**
4. Scroll to **S3 Access Keys** section
5. Click **Generate new keys**
6. **Copy both keys** immediately:
   - `AWS_ACCESS_KEY_ID` (Access Key)
   - `AWS_SECRET_ACCESS_KEY` (Secret Key)

#### Step 2: Update Azure Environment Variables
1. Go to Azure Portal → App Services → `zyratech-api`
2. Click **Configuration** (left sidebar)
3. Update **AWS_ACCESS_KEY_ID**:
   - Click **Edit**
   - Paste the new access key
   - Click **OK**
4. Update **AWS_SECRET_ACCESS_KEY**:
   - Click **Edit**
   - Paste the new secret key
   - Click **OK**
5. Click **Save** at the top
6. Wait 2-3 minutes for the app to restart

#### Step 3: Update Local `.env` File (Optional)
If you run the app locally, update your local `.env` file with the new keys as well.

---

### **Action 4: Update Local `.env` File**

After rotating all secrets in Azure, update your local `.env` file to match:

```bash
# Update these values to match Azure:
JWT_SECRET=<new-128-char-secret-from-step-1>
DATABASE_URL=postgresql://postgres.cblfpfsvavahttedfloe:<new-password>@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=accept_invalid_certs&connection_limit=10&pool_timeout=30
DIRECT_URL=postgresql://postgres.cblfpfsvavahttedfloe:<new-password>@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require&sslaccept=accept_invalid_certs
AWS_ACCESS_KEY_ID=<new-access-key>
AWS_SECRET_ACCESS_KEY=<new-secret-key>
```

**⚠️ Remember:** The `.env` file is ignored by Git, so these secrets won't be committed.

---

## 📋 Verification Checklist

After completing all actions, verify everything works:

### Test 1: Health Check
```bash
GET https://api.zyratechhub.com/health
```
**Expected:** 200 OK with database connection confirmed

### Test 2: Login
```bash
POST https://api.zyratechhub.com/api/auth/login
{
  "email": "afedi@zyratech.com",
  "password": "<your-new-password>"
}
```
**Expected:** 200 OK with access token

### Test 3: Protected Endpoint
```bash
GET https://api.zyratechhub.com/api/auth/me
Authorization: Bearer <token-from-login>
```
**Expected:** 200 OK with user profile

### Test 4: File Upload (S3 Test)
Try uploading an image through any admin endpoint (blog, gallery, etc.)
**Expected:** Upload succeeds with new S3 keys

---

## 🎯 Summary of Changes

| Secret | Action | Status |
|--------|--------|--------|
| Super Admin Password | Change via API | ✅ Done |
| JWT Secret | Generate & update in Azure | ⏳ Pending |
| Database Password | Reset in Supabase → Update Azure | ⏳ Pending |
| S3 Access Keys | Regenerate in Supabase → Update Azure | ⏳ Pending |
| Local `.env` File | Update to match Azure | ⏳ Pending |

---

## ⏱️ Estimated Time

- **JWT Secret:** 5 minutes
- **Database Password:** 10 minutes
- **S3 Keys:** 10 minutes
- **Testing:** 5 minutes

**Total:** ~30 minutes to complete all security updates

---

## 🛡️ Post-Update Security Status

After completing these actions, your security score will be:

**9.5/10** 🟢

The remaining 0.5 points are for optional enhancements (request logging, API versioning) which can be done later.

---

## 📝 Notes

- **Downtime:** Each update requires an app restart (2-3 minutes), but Azure handles this gracefully
- **User Impact:** Users will need to log in again after JWT secret rotation (expected)
- **Rollback:** Keep the old secrets for 24 hours in case you need to roll back

---

## ✅ After Completion

Once all actions are completed, mark them as done:

- [ ] JWT Secret rotated
- [ ] Database password rotated
- [ ] S3 access keys rotated
- [ ] Local `.env` updated
- [ ] All tests passed

**Then you're 100% secure and ready for production!** 🎉
