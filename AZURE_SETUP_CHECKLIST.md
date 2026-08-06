# Azure Deployment Setup Checklist

## ✅ Code Changes (COMPLETED)

- [x] Updated `src/index.ts` - Port binding to WEBSITES_PORT and 0.0.0.0
- [x] Updated `Dockerfile` - Port changed to 8080, health check updated
- [x] Updated `.github/workflows/ci-cd.yml` - Switched from AWS to Azure deployment with ACR
- [x] Created `docs/AZURE_DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide

---

## ✅ GitHub Secrets (COMPLETED)

- [x] `AZURE_ACR_LOGIN_SERVER` = `zyratechhubacr.azurecr.io`
- [x] `AZURE_ACR_USERNAME` = (from Azure Container Registry)
- [x] `AZURE_ACR_PASSWORD` = (from Azure Container Registry)
- [x] `AZURE_WEBAPP_NAME` = `zyratech-api`
- [x] `AZURE_WEBAPP_PUBLISH_PROFILE` = (downloaded from Azure Portal)
- [x] `DATABASE_URL` = (Supabase connection string)
- [x] `DIRECT_URL` = (Supabase direct URL)

---

## ✅ GitHub Actions Deployment (COMPLETED)

- [x] Docker image built successfully
- [x] Docker image pushed to ACR: `zyratechhubacr.azurecr.io/zyratech-backend:latest`
- [x] Deployment workflow completed without errors

---

## 🚨 CRITICAL: Docker Registry Authentication (DO THIS NOW)

**Current Issue:** Azure App Service cannot pull the Docker image from ACR because it's missing authentication credentials.

**Error:** `ImagePullUnauthorizedFailure`

### ⚠️ Fix Required: Add 3 Docker Registry Settings

Go to **Azure Portal → App Service → `zyratech-api` → Configuration** and add:

1. **DOCKER_REGISTRY_SERVER_URL**
   - Value: `https://zyratechhubacr.azurecr.io`
   
2. **DOCKER_REGISTRY_SERVER_USERNAME**
   - Value: Get from Azure Portal → Container registries → `zyratechhubacr` → Access keys
   
3. **DOCKER_REGISTRY_SERVER_PASSWORD**
   - Value: Get from Azure Portal → Container registries → `zyratechhubacr` → Access keys

**📖 See detailed instructions:** `AZURE_ACR_AUTHENTICATION_FIX.md`

---

## ⏳ Azure Environment Variables Setup (DO THIS AFTER AUTHENTICATION FIX)

### How to Set Them:
1. Go to Azure Portal
2. Navigate to App Service: `zyratech-api`
3. Click **Configuration** (left sidebar)
4. Click **New application setting** for each variable
5. Add the variables below

### ✅ Already Added (From Previous Setup):
```
DATABASE_URL = <your-supabase-connection-string>
DIRECT_URL = <your-supabase-direct-url>
FRONTEND_URL = https://zyratechhub.com
JWT_SECRET = zyratech-jwt-secret-key-change-this-in-production-at-least-32-chars-long
NODE_ENV = production
WEBSITES_PORT = 8080
WEBSITES_ENABLE_APP_SERVICE_STORAGE = false
```

### 🚨 Required for ACR Authentication (ADD THESE NOW):
```
DOCKER_REGISTRY_SERVER_URL = https://zyratechhubacr.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME = <from-acr-access-keys>
DOCKER_REGISTRY_SERVER_PASSWORD = <from-acr-access-keys>
```

**📖 See detailed instructions:** `AZURE_ACR_AUTHENTICATION_FIX.md`

---

## ⏳ Additional Environment Variables (Optional - Add Later If Needed)

If you plan to use payment processing, email, or file storage:

```
SENDGRID_API_KEY = <your-sendgrid-key>
PAYSTACK_SECRET_KEY = <your-paystack-key>
AWS_ACCESS_KEY_ID = <supabase-s3-access-key>
AWS_SECRET_ACCESS_KEY = <supabase-s3-secret-key>
AWS_S3_BUCKET = <your-bucket-name>
S3_ENDPOINT = <supabase-s3-endpoint>
```

---

## ✅ First Deployment Status

### ✅ Code Committed and Pushed
- [x] All Azure configuration changes committed
- [x] Pushed to `main` branch
- [x] GitHub Actions workflow triggered

### ✅ GitHub Actions Workflow
- [x] Build and Typecheck - PASSED
- [x] Prisma migrations applied - PASSED
- [x] Docker image built - PASSED
- [x] Docker image pushed to ACR - PASSED
- [x] Deployment to Azure - PASSED

### 🚨 Current Blocker: Image Pull Authentication
- [ ] **Fix ACR authentication** (see `AZURE_ACR_AUTHENTICATION_FIX.md`)
- [ ] Add `DOCKER_REGISTRY_SERVER_URL`
- [ ] Add `DOCKER_REGISTRY_SERVER_USERNAME`
- [ ] Add `DOCKER_REGISTRY_SERVER_PASSWORD`
- [ ] Wait 5 minutes for restart
- [ ] Test `/health` endpoint

---

## 🔍 Verification Steps (After Authentication Fix)

Once you've added the 3 Docker registry settings and waited 5 minutes:

### Test 1: Health Check Endpoint
```bash
curl https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "ZyraTech Hub API is running",
  "environment": "production",
  "timestamp": "2025-01-08T..."
}
```

### Test 2: Check Azure Logs
1. Go to Azure Portal → App Service → `zyratech-api`
2. Click **Log stream** (left sidebar under Monitoring)
3. Look for successful startup messages:
   - ✅ `Successfully pulled image`
   - ✅ `Server running on 0.0.0.0:8080`
   - ✅ `Environment: production`

### Test 3: Test API Endpoints in Postman
Use the Postman Desktop Agent (not Cloud Agent) to test:
- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/courses` - Get courses
- `/api/blog` - Get blog posts

**📖 See:** `POSTMAN_TESTING_GUIDE.md` for detailed testing instructions

---

## 🔍 Troubleshooting

### Issue: "ImagePullUnauthorizedFailure" (CURRENT ISSUE)
**Solution:** Add the 3 Docker registry authentication settings to Azure App Service Configuration (see `AZURE_ACR_AUTHENTICATION_FIX.md`)

### Issue: "Still getting 503 after adding registry settings"
**Solution:**
1. Wait 5 minutes for Azure to restart the container
2. Check Azure Portal → App Service → Log stream for errors
3. Verify the registry settings are saved correctly

### Issue: "Container logs show 'Authentication required'"
**Solution:** Double-check the ACR password - try using `password2` instead of `password`

### Issue: "Health check times out"
**Solution:**
1. Verify `WEBSITES_PORT=8080` is set in Configuration
2. Check if container started successfully in Log stream
3. Verify Dockerfile exposes port 8080

### Issue: API Returns 502 Bad Gateway
**Cause:** Container not running or not responding on port 8080
**Check:** Azure App Service logs for startup errors
**Verify:** All environment variables are set correctly

---

## ✅ After Successful Deployment

Once the authentication fix is applied and the container is running:

- [ ] Health check endpoint responds successfully
- [ ] Can test API endpoints in Postman
- [ ] Database connection works (test auth endpoints)
- [ ] No errors in Azure Log stream
- [ ] Future commits to `main` auto-deploy via GitHub Actions

---

## 📋 Summary of Migration Status

| Component | Old Setup | New Setup | Status |
|-----------|-----------|-----------|--------|
| **Backend Hosting** | AWS ECS | Azure App Service (F1 Free) | ✅ |
| **Port Binding** | 5000 (hardcoded) | 8080 (WEBSITES_PORT) | ✅ |
| **IP Binding** | localhost only | 0.0.0.0 (external access) | ✅ |
| **Docker Port** | 5000 | 8080 | ✅ |
| **Image Registry** | AWS ECR | Azure Container Registry | ✅ |
| **CI/CD Pipeline** | AWS ECS Deploy | GitHub Actions + Azure Deploy | ✅ |
| **GitHub Secrets** | AWS credentials | Azure ACR + Supabase | ✅ |
| **Docker Image Build** | - | Building and pushing successfully | ✅ |
| **ACR Authentication** | - | **NEEDS FIX** | 🚨 |
| **Container Running** | - | Pending authentication fix | ⏳ |
| **Database** | Supabase | Supabase (NO CHANGE) | ✅ |
| **Files Storage** | Supabase S3 API | Supabase S3 API (NO CHANGE) | ✅ |

---

## 🎯 Current Focus

**PRIORITY 1:** Fix ACR authentication by adding the 3 Docker registry settings
- See detailed guide: `AZURE_ACR_AUTHENTICATION_FIX.md`
- This is blocking the container from starting

**PRIORITY 2:** Verify deployment after authentication fix
- Test `/health` endpoint
- Check Azure logs for successful startup
- Test API endpoints in Postman

---

## 📚 Related Documentation

- `AZURE_ACR_AUTHENTICATION_FIX.md` - **READ THIS FIRST** - Detailed fix for current issue
- `docs/AZURE_DEPLOYMENT_GUIDE.md` - Comprehensive Azure deployment guide
- `POSTMAN_TESTING_GUIDE.md` - How to test API endpoints after deployment
- `FINAL_DEPLOYMENT_STEPS.md` - Final verification steps