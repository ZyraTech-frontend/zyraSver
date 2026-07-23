# Azure App Service Deployment Guide

## Overview

This document outlines the configuration changes made to deploy the ZyraTech Hub backend to **Azure App Service (Linux Web App - F1 Free Tier)** using Docker and GitHub Actions.

---

## Changes Applied

### 1. ✅ **Server Port Binding** (`src/index.ts`)

**What Changed:**
```typescript
// Before
const PORT = process.env.API_PORT || 5000;
app.listen(PORT, () => { ... });

// After
const PORT = process.env.WEBSITES_PORT || process.env.API_PORT || process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => { ... });
```

**Why:**
- Azure App Service sets `WEBSITES_PORT=8080` environment variable
- Server must bind to `0.0.0.0` to accept external traffic in containers
- Fallback chain ensures compatibility: Azure → Dev → Docker → Default

---

### 2. ✅ **Dockerfile Configuration** (`Dockerfile`)

**What Changed:**
```dockerfile
# Before
EXPOSE 5000
HEALTHCHECK ... fetch('http://localhost:5000/health')

# After
EXPOSE 8080
HEALTHCHECK ... fetch('http://localhost:8080/health')
```

**Why:**
- Azure expects the container to listen on port 8080
- Health check must probe the correct port for Azure App Service to detect readiness

---

### 3. ✅ **GitHub Actions Workflow** (`.github/workflows/ci-cd.yml`)

**What Changed:**
- Replaced AWS ECS deployment with Azure App Service deployment
- Uses **Docker Hub** as free image registry (not Azure Container Registry)
- Simplified workflow: Build → Migrate → Push to Docker Hub → Deploy to Azure

**Pipeline Flow:**
```
1. Push to main
   ↓
2. Build & Typecheck
   ↓
3. Apply Prisma migrations to Supabase
   ↓
4. Build Docker image (linux/amd64)
   ↓
5. Push to Docker Hub
   ↓
6. Deploy to Azure App Service via Publish Profile
   ↓
7. Azure pulls image and restarts container
```

---

## GitHub Secrets Required

Before deployment, add these secrets to your GitHub repository:

### Database Secrets
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Supabase direct connection (for migrations)

### Docker Hub Secrets
- `DOCKER_HUB_USERNAME` - Your Docker Hub username
- `DOCKER_HUB_PASSWORD` - Docker Hub personal access token or password

### Azure Secrets
- `AZURE_WEBAPP_NAME` - Your Azure Web App name (e.g., `zyratech-api`)
- `AZURE_WEBAPP_PUBLISH_PROFILE` - Publish profile XML from Azure Portal

---

## How to Get Azure Publish Profile

1. Go to **Azure Portal** → Your App Service (`zyratech-api`)
2. Click **Get Publish Profile** (top right)
3. Save the `.PublishSettings` file
4. Open the file in a text editor
5. Copy the entire `<publishProfile>` XML block
6. Add as GitHub Secret `AZURE_WEBAPP_PUBLISH_PROFILE`

---

## Environment Variables in Azure

Set these in Azure App Service Configuration:

### Database (Required)
```
DATABASE_URL = postgresql://user:password@host:5432/db
DIRECT_URL = postgresql://user:password@host:5432/db
```

### Application (Optional)
```
NODE_ENV = production
FRONTEND_URL = https://zyratechhub.com
API_PORT = 8080  (optional, Azure sets WEBSITES_PORT=8080)
API_BASE_URL = https://api.zyratechhub.com
```

### Services (As Needed)
```
JWT_SECRET = your-secret-key
SENDGRID_API_KEY = your-key
PAYSTACK_SECRET_KEY = your-key
AWS_ACCESS_KEY_ID = (if using S3)
AWS_SECRET_ACCESS_KEY = (if using S3)
S3_ENDPOINT = (if using S3)
AWS_S3_BUCKET = (if using S3)
```

---

## Deployment Process

### First Time Setup

1. **Create Docker Hub Account** (free)
   - Sign up at https://hub.docker.com
   - Create personal access token

2. **Add GitHub Secrets** (Settings → Secrets and variables → Actions)
   - `DOCKER_HUB_USERNAME`
   - `DOCKER_HUB_PASSWORD`
   - `AZURE_WEBAPP_NAME`
   - `AZURE_WEBAPP_PUBLISH_PROFILE`
   - `DATABASE_URL`
   - `DIRECT_URL`

3. **Commit & Push to Main**
   ```bash
   git add .
   git commit -m "Configure for Azure deployment"
   git push origin main
   ```

4. **Monitor GitHub Actions**
   - Go to Actions tab
   - Watch the deployment pipeline
   - Check logs if any step fails

### Subsequent Deployments

Simply push code to `main` branch:
```bash
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Apply migrations
3. Push to Docker Hub
4. Deploy to Azure App Service

---

## Monitoring Deployment

### GitHub Actions Logs
- Go to **Actions** → Latest workflow run
- Expand each step to see detailed logs

### Azure App Service Logs
1. Go to **Azure Portal** → App Service → **Log stream**
2. View real-time container logs
3. Check for startup errors

### Health Check
```bash
curl https://zyratech-api.azurewebsites.net/health
```

Should return:
```json
{
  "success": true,
  "message": "ZyraTech Hub API is running",
  "environment": "production",
  "timestamp": "2025-07-23T..."
}
```

---

## Troubleshooting

### "Application is running but failed to respond"
- Check if port is 8080 in Dockerfile and index.ts
- Verify health check endpoint works locally
- Review App Service logs for startup errors

### "Deployment failed: Image pull error"
- Verify Docker Hub credentials in GitHub secrets
- Ensure image tag matches in CI/CD workflow
- Check Docker Hub has the image pushed

### "Database connection failed"
- Verify `DATABASE_URL` and `DIRECT_URL` are set in Azure
- Test connection string locally first
- Ensure Supabase allows Azure IP addresses

### "Health check failing"
- Confirm server is binding to `0.0.0.0:8080`
- Test `/health` endpoint locally
- Check Dockerfile HEALTHCHECK port matches

---

## Cost Optimization (F1 Free Tier)

✅ **Free Components:**
- Azure App Service (F1 tier - 60 min/day, shared compute)
- Supabase PostgreSQL (500MB free)
- GitHub Actions (2000 minutes/month free)
- Docker Hub (public repos free)

⚠️ **Note:** F1 tier is for development/testing. For production, upgrade to B1 or higher.

---

## Local Development

To test changes locally before pushing:

```bash
# Build Docker image
docker build -t zyratech-backend:test .

# Run container (simulate Azure environment)
docker run -p 8080:8080 \
  -e WEBSITES_PORT=8080 \
  -e DATABASE_URL="postgresql://..." \
  -e DIRECT_URL="postgresql://..." \
  zyratech-backend:test

# Test health check
curl http://localhost:8080/health
```

---

## Rollback Strategy

If a deployment breaks production:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```
GitHub Actions will automatically deploy previous version.

### Option 2: Azure Portal Rollback
1. Go to **Azure App Service** → **Deployments**
2. Select previous successful deployment
3. Click **Redeploy**

---

## Next Steps

1. ✅ Code changes applied (index.ts, Dockerfile, ci-cd.yml)
2. ⏳ Add GitHub secrets
3. ⏳ Get Azure Publish Profile
4. ⏳ Push to main and monitor deployment
5. ⏳ Test `/health` endpoint
6. ⏳ Configure Azure environment variables

---

## Support

For deployment issues:
- Check GitHub Actions logs for build/push errors
- Review Azure App Service logs for runtime errors
- Verify all environment variables are set correctly
- Test Docker image locally before troubleshooting Azure

