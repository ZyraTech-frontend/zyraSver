# 🚀 Final Deployment Steps - Azure Backend Migration

## ✅ Completed Tasks

1. ✅ Updated `src/index.ts` - Server now listens on port 8080 and binds to `0.0.0.0`
2. ✅ Updated `Dockerfile` - Exposes port 8080 and uses Node 24
3. ✅ Updated `.github/workflows/ci-cd.yml` - Configured for Azure Container Registry (ACR) and Azure App Service deployment
4. ✅ Upgraded to Node 24 - Avoids GitHub Actions Node 20 deprecation
5. ✅ All changes pushed to `main` branch

---

## 🔑 Required GitHub Secrets

You have these secrets already configured:
- ✅ `AZURE_ACR_LOGIN_SERVER`
- ✅ `AZURE_ACR_USERNAME`
- ✅ `AZURE_ACR_PASSWORD`
- ✅ `DATABASE_URL`
- ✅ `DIRECT_URL`

### ⚠️ Missing Secrets - You Need to Add These:

#### 1. `AZURE_WEBAPP_NAME`
- **Value**: `zyratech-api`
- **How to add**:
  1. Go to your GitHub repository
  2. Click **Settings** → **Secrets and variables** → **Actions**
  3. Click **New repository secret**
  4. Name: `AZURE_WEBAPP_NAME`
  5. Value: `zyratech-api`
  6. Click **Add secret**

#### 2. `AZURE_WEBAPP_PUBLISH_PROFILE`
- **How to get it**:
  1. Go to [Azure Portal](https://portal.azure.com)
  2. Search for your App Service: `zyratech-api`
  3. In the left menu, click **Overview**
  4. Click **Get publish profile** button at the top
  5. A `.PublishSettings` XML file will download
  6. Open the file and copy **all the XML content**

- **How to add it to GitHub**:
  1. Go to your GitHub repository
  2. Click **Settings** → **Secrets and variables** → **Actions**
  3. Click **New repository secret**
  4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
  5. Value: Paste the entire XML content from the downloaded file
  6. Click **Add secret**

---

## 🚀 Next Steps

### Step 1: Add the Missing Secrets
Follow the instructions above to add both `AZURE_WEBAPP_NAME` and `AZURE_WEBAPP_PUBLISH_PROFILE` to your GitHub repository secrets.

### Step 2: Trigger Deployment
Once you've added the secrets:

**Option A - Automatic (Recommended)**:
- The workflow will automatically trigger because we just pushed to `main`
- Go to your repository → **Actions** tab
- You should see "CI/CD Pipeline" running

**Option B - Manual Trigger**:
1. Go to your repository → **Actions** tab
2. Click on **CI/CD Pipeline** workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

### Step 3: Monitor Deployment
1. Watch the GitHub Actions workflow progress
2. Check for any errors in the logs
3. The deployment should complete successfully with all secrets configured

### Step 4: Verify Deployment
Once the workflow completes:

1. **Test Health Endpoint**:
   ```bash
   curl https://zyratech-api.azurewebsites.net/health
   ```

2. **Expected Response**:
   ```json
   {
     "success": true,
     "message": "ZyraTech Hub API is running",
     "environment": "production",
     "timestamp": "2025-01-XX..."
   }
   ```

3. **Test API Endpoints**:
   - Use Postman or your frontend to test actual API routes
   - Check that database connections work via Supabase

---

## 🔧 Azure App Service Configuration

Make sure your Azure Web App (`zyratech-api`) has these settings:

### Application Settings (Environment Variables)
Go to: Azure Portal → App Service → Configuration → Application settings

**Required**:
- `WEBSITES_PORT` = `8080`
- `DATABASE_URL` = Your Supabase connection string
- `DIRECT_URL` = Your Supabase direct connection string (for migrations)
- `NODE_ENV` = `production`
- `JWT_SECRET` = Your JWT secret
- `FRONTEND_URL` = `https://zyratechhub.com`

**Optional (if using these features)**:
- `SUPABASE_KEY` = Your Supabase API key
- `SUPABASE_URL` = Your Supabase project URL
- Other service-specific keys (Stripe, email, etc.)

### Container Settings
- **Image Source**: Azure Container Registry (ACR)
- **Registry**: Your ACR login server
- **Image**: `zyratech-backend:latest`
- **Continuous Deployment**: Enabled (webhook)

---

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Repository (main branch)                        │
│  - Code changes pushed                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions Workflow                                │
│  1. Build & Typecheck                                   │
│  2. Run Prisma Migrations (Supabase)                    │
│  3. Build Docker Image                                  │
│  4. Push to Azure Container Registry (ACR)              │
│  5. Deploy to Azure App Service                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Azure Container Registry (ACR)                         │
│  - Stores Docker images                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Azure App Service (zyratech-api)                       │
│  - Runs containerized backend                           │
│  - Exposes API on port 8080                             │
│  - Connects to Supabase PostgreSQL                      │
└─────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase (Database + Storage)                          │
│  - PostgreSQL database                                  │
│  - File storage (S3-compatible)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

### If Deployment Fails

1. **Check GitHub Actions Logs**:
   - Go to repository → Actions tab
   - Click on the failed workflow run
   - Review each step's logs for errors

2. **Common Issues**:

   **"Error: Input required and not supplied: username"**
   - Missing or incorrect ACR secrets
   - Verify `AZURE_ACR_USERNAME` and `AZURE_ACR_PASSWORD` are set

   **"Failed to authenticate to Azure Container Registry"**
   - ACR credentials might be expired
   - Regenerate credentials in Azure Portal → Container Registry → Access keys

   **"Deployment to Azure Web App failed"**
   - Missing `AZURE_WEBAPP_PUBLISH_PROFILE` secret
   - Re-download publish profile and update secret

   **"Container failed to start"**
   - Check Azure Portal → App Service → Log stream
   - Verify environment variables are set correctly
   - Ensure `WEBSITES_PORT=8080` is configured

3. **Database Connection Issues**:
   - Verify `DATABASE_URL` and `DIRECT_URL` secrets are correct
   - Check Supabase project is active
   - Test connection from Azure Portal console

---

## 📞 Support Resources

- **Azure Portal**: https://portal.azure.com
- **GitHub Actions**: Your repo → Actions tab
- **Supabase Dashboard**: https://app.supabase.com
- **Azure Documentation**: https://docs.microsoft.com/azure/app-service/

---

## ✨ Summary

Your backend is now configured to deploy automatically to Azure App Service using:
- ✅ Azure Container Registry for Docker images
- ✅ GitHub Actions for CI/CD
- ✅ Supabase for PostgreSQL database
- ✅ Node 24 (no deprecation warnings)
- ✅ Port 8080 for Azure compatibility

**Next**: Add the two missing secrets and watch your deployment succeed! 🎉
