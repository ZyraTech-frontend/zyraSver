# Azure Deployment Setup Checklist

## ✅ Code Changes (COMPLETED)

- [x] Updated `src/index.ts` - Port binding to WEBSITES_PORT and 0.0.0.0
- [x] Updated `Dockerfile` - Port changed to 8080, health check updated
- [x] Updated `.github/workflows/ci-cd.yml` - Switched from AWS to Azure deployment
- [x] Created `docs/AZURE_DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide

---

## ⏳ Pre-Deployment Setup (DO THIS NEXT)

### Step 1: Create Docker Hub Account
- [ ] Go to https://hub.docker.com
- [ ] Sign up for free account
- [ ] Note your **username**
- [ ] Create personal access token:
  - Profile → Account Settings → Security → Personal access tokens
  - Create token → Copy and save securely

### Step 2: Get Azure Publish Profile
- [ ] Go to Azure Portal
- [ ] Navigate to App Service: `zyratech-api`
- [ ] Click **Get Publish Profile** (top right corner)
- [ ] Open downloaded `.PublishSettings` file in text editor
- [ ] Find and copy the entire `<publishProfile>` XML block
- [ ] Save this somewhere secure

### Step 3: Get Supabase Credentials
- [ ] Go to Supabase Dashboard
- [ ] Select your project
- [ ] Go to **Settings** → **Database**
- [ ] Copy `DATABASE_URL` (PostgreSQL connection string)
- [ ] Copy `DIRECT_URL` (for migrations)
- [ ] Save both securely

---

## ⏳ GitHub Secrets Setup (DO THIS NEXT)

### How to Add Secrets:
1. Go to GitHub Repository
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret below

### Secrets to Add:

#### Docker Hub Credentials
| Secret Name | Value | Source |
|---|---|---|
| `DOCKER_HUB_USERNAME` | your-docker-hub-username | Docker Hub account |
| `DOCKER_HUB_PASSWORD` | your-personal-access-token | Docker Hub settings |

#### Azure Credentials
| Secret Name | Value | Source |
|---|---|---|
| `AZURE_WEBAPP_NAME` | `zyratech-api` | Your Azure Web App name |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | (entire XML from .PublishSettings) | Azure Portal |

#### Database Credentials
| Secret Name | Value | Source |
|---|---|---|
| `DATABASE_URL` | postgresql://... | Supabase settings |
| `DIRECT_URL` | postgresql://... | Supabase settings |

---

## ⏳ Azure Environment Variables Setup (DO THIS NEXT)

### How to Set Them:
1. Go to Azure Portal
2. Navigate to App Service: `zyratech-api`
3. Click **Configuration** (left sidebar)
4. Click **New application setting** for each variable
5. Add the variables below

### Variables to Add:

#### Required (Database)
```
DATABASE_URL = <your-supabase-connection-string>
DIRECT_URL = <your-supabase-direct-url>
```

#### Optional (Recommended)
```
NODE_ENV = production
FRONTEND_URL = https://zyratechhub.com
JWT_SECRET = <your-secret-key>
```

#### If Using Payment/Email/S3
```
SENDGRID_API_KEY = <your-sendgrid-key>
PAYSTACK_SECRET_KEY = <your-paystack-key>
AWS_ACCESS_KEY_ID = <supabase-s3-access-key>
AWS_SECRET_ACCESS_KEY = <supabase-s3-secret-key>
AWS_S3_BUCKET = <your-bucket-name>
S3_ENDPOINT = <supabase-s3-endpoint>
```

**After adding all variables, click "Save"**

---

## ⏳ First Deployment (DO THIS NEXT)

### Step 1: Commit Code Changes
```bash
# Navigate to project directory
cd /path/to/ServersideZyraTech

# Add all changes
git add .

# Commit
git commit -m "Configure backend for Azure App Service deployment

- Updated Express server to listen on WEBSITES_PORT (8080)
- Bind to 0.0.0.0 for containerized environments
- Updated Dockerfile to expose port 8080
- Migrated CI/CD from AWS ECS to Azure App Service
- Uses Docker Hub for image registry (free tier)
- Database remains on Supabase (no changes)"

# Push to main branch
git push origin main
```

### Step 2: Monitor Deployment
1. Go to GitHub Repository
2. Click **Actions** tab
3. Watch the workflow run:
   - Build and Typecheck
   - Apply Prisma migrations
   - Build Docker image
   - Push to Docker Hub
   - Deploy to Azure App Service
4. Check logs if any step fails

### Step 3: Verify Deployment
Once workflow completes successfully:

```bash
# Test health endpoint
curl https://zyratech-api.azurewebsites.net/health

# Expected response:
# {
#   "success": true,
#   "message": "ZyraTech Hub API is running",
#   "environment": "production",
#   "timestamp": "..."
# }
```

---

## 🔍 Troubleshooting

### GitHub Actions Failed: "Secrets not found"
- **Solution:** Verify all 6 secrets are added in GitHub Settings
- **Check:** Settings → Secrets and variables → Actions

### Deployment Failed: "Image pull failed"
- **Solution:** Verify Docker Hub username/password are correct
- **Check:** Can you login to Docker Hub manually?

### Azure Deployment Failed: "Health check failed"
- **Solution:** Check Azure App Service logs
- **Action:** Go to Azure Portal → App Service → Log stream

### API Returns 502 Bad Gateway
- **Cause:** Container not running or not responding on port 8080
- **Check:** Azure App Service logs for startup errors
- **Verify:** `WEBSITES_PORT` environment variable is set to 8080

---

## ✅ After Successful First Deployment

- [ ] Health check endpoint responds (https://zyratech-api.azurewebsites.net/health)
- [ ] Can test API endpoints
- [ ] Database connection works
- [ ] No errors in Azure logs
- [ ] Future commits to `main` auto-deploy

---

## 📋 Summary of What Was Done

| Component | Old Setup | New Setup | Status |
|-----------|-----------|-----------|--------|
| **Backend Hosting** | AWS ECS | Azure App Service (F1 Free) | ✅ |
| **Port Binding** | 5000 (hardcoded) | 8080 (WEBSITES_PORT) | ✅ |
| **IP Binding** | localhost only | 0.0.0.0 (external access) | ✅ |
| **Docker Port** | 5000 | 8080 | ✅ |
| **Image Registry** | AWS ECR (paid) | Docker Hub (free) | ✅ |
| **CI/CD Pipeline** | AWS OIDC + ECS | GitHub Actions + Azure Deploy | ✅ |
| **Database** | Supabase | Supabase (NO CHANGE) | ✅ |
| **Files Storage** | Supabase S3 API | Supabase S3 API (NO CHANGE) | ✅ |

---

## Questions?

Refer to: `docs/AZURE_DEPLOYMENT_GUIDE.md` for detailed information on each component.

