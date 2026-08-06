# 🌐 Custom Domain Setup Guide - api.zyratechhub.com

## Overview
This guide will help you configure `api.zyratechhub.com` as your custom domain for the ZyraTech backend API, replacing the long Azure default URL.

**Current URL:** `https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net`  
**New Custom Domain:** `https://api.zyratechhub.com`

---

## 📋 Prerequisites

- [x] Backend successfully deployed to Azure App Service (`zyratech-api`)
- [x] Domain `zyratechhub.com` already registered and owned by you
- [ ] Access to your domain registrar/DNS provider (e.g., Namecheap, GoDaddy, Cloudflare, AWS Route 53)
- [ ] Azure Portal access

---

## 🚀 Step-by-Step Setup

### **Step 1: Get Domain Verification Details from Azure**

1. Go to **Azure Portal**: https://portal.azure.com
2. Navigate to **App Services** → **zyratech-api**
3. In the left sidebar, click **Custom domains** (under Settings)
4. Click **+ Add custom domain** button
5. In the "Custom domain" field, enter: `api.zyratechhub.com`
6. Click **Validate**

Azure will show you the DNS records you need to add. You'll see something like:

**Domain Verification Record (TXT Record):**
```
Host: asuid.api.zyratechhub.com
Type: TXT
Value: <VERIFICATION-CODE-FROM-AZURE>
```

**Domain Mapping Record (CNAME Record):**
```
Host: api
Type: CNAME
Value: zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net
```

**📝 Important:** Keep this Azure tab open - you'll need these values in the next step!

---

### **Step 2: Add DNS Records to Your Domain Provider**

Now go to your domain registrar/DNS provider where you manage `zyratechhub.com` and add these DNS records:

#### Record 1: TXT Record (Domain Verification)
- **Type:** TXT
- **Host/Name:** `asuid.api` or `asuid.api.zyratechhub.com` (depends on your provider)
- **Value/Points to:** The verification code from Azure (from Step 1)
- **TTL:** 3600 (or leave default)

#### Record 2: CNAME Record (Domain Mapping)
- **Type:** CNAME
- **Host/Name:** `api` or `api.zyratechhub.com` (depends on your provider)
- **Value/Points to:** `zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net`
- **TTL:** 3600 (or leave default)

**📝 Note:** Different DNS providers have different formats:
- **Namecheap:** Use just `api` for host
- **GoDaddy:** Use just `api` for host
- **Cloudflare:** Use just `api` for host
- **AWS Route 53:** Use `api.zyratechhub.com` for record name

---

### **Step 3: Wait for DNS Propagation**

DNS changes can take time to propagate:
- **Minimum:** 5-10 minutes
- **Maximum:** 24-48 hours (usually much faster)

**Check DNS propagation:**
1. Open PowerShell/CMD
2. Run this command:
   ```powershell
   nslookup api.zyratechhub.com
   ```
3. You should see it pointing to `zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net`

**Or use online tools:**
- https://dnschecker.org/#CNAME/api.zyratechhub.com
- https://www.whatsmydns.net/#CNAME/api.zyratechhub.com

---

### **Step 4: Complete Domain Validation in Azure**

Once DNS has propagated (wait 10-15 minutes after adding records):

1. Go back to **Azure Portal** → **App Services** → **zyratech-api** → **Custom domains**
2. Click **+ Add custom domain** again
3. Enter: `api.zyratechhub.com`
4. Click **Validate**
5. If validation succeeds ✅, click **Add custom domain**
6. Azure will add the custom domain to your app

**If validation fails:**
- Wait longer for DNS propagation (try again in 10-15 minutes)
- Double-check your DNS records are correct
- Make sure there are no typos in the CNAME or TXT records

---

### **Step 5: Enable HTTPS/SSL (Free Managed Certificate)**

After the custom domain is added, enable HTTPS:

1. In **Azure Portal** → **App Services** → **zyratech-api** → **Custom domains**
2. Find your custom domain `api.zyratechhub.com` in the list
3. Click on it to open the binding settings
4. Under **TLS/SSL binding**, select:
   - **TLS/SSL type:** SNI SSL
   - **Certificate:** Create App Service Managed Certificate (FREE)
5. Click **Add binding**
6. Wait 2-5 minutes for the certificate to be provisioned

**✅ Your custom domain is now secured with HTTPS!**

---

### **Step 6: Test Your Custom Domain**

#### Test 1: Health Check Endpoint
Open your browser or Postman and test:
```
GET https://api.zyratechhub.com/health
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "ZyraTech Hub API is running",
  "environment": "production",
  "timestamp": "2026-08-05T..."
}
```

#### Test 2: Authentication Endpoints
Test in Postman:
```
POST https://api.zyratechhub.com/api/auth/register
POST https://api.zyratechhub.com/api/auth/login
GET https://api.zyratechhub.com/api/auth/me
```

#### Test 3: Other API Endpoints
```
GET https://api.zyratechhub.com/api/trainings
GET https://api.zyratechhub.com/api/blog
GET https://api.zyratechhub.com/api/projects
GET https://api.zyratechhub.com/api/testimonials
```

---

### **Step 7: Update Environment Variables (Optional)**

If your backend needs to know its own URL (e.g., for CORS or email links), update the Azure environment variable:

1. Go to **Azure Portal** → **App Services** → **zyratech-api** → **Configuration**
2. Find or add this variable:
   - **Name:** `API_URL`
   - **Value:** `https://api.zyratechhub.com`
3. Click **Save**
4. Wait for the app to restart (2-3 minutes)

---

### **Step 8: Update Frontend Configuration**

Update your frontend to use the new custom domain instead of the Azure default URL:

**Before:**
```javascript
const API_BASE_URL = 'https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net';
```

**After:**
```javascript
const API_BASE_URL = 'https://api.zyratechhub.com';
```

**Update in:**
- Frontend environment variables (`.env` files)
- API configuration files
- Any hardcoded API URLs

---

### **Step 9: Update Postman Environment**

Update your Postman environment variables:

1. Open Postman
2. Go to **Environments** → **ZyraTech Production**
3. Update the `base_url` variable:
   - **Old value:** `https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net`
   - **New value:** `https://api.zyratechhub.com`
4. Save the environment

Now all your Postman requests using `{{base_url}}` will automatically use the new custom domain!

---

## 🔍 Troubleshooting

### Issue: "Domain validation failed"
**Causes:**
- DNS records not propagated yet
- Incorrect DNS record values
- Typo in the CNAME or TXT record

**Solutions:**
1. Wait 15-30 minutes for DNS propagation
2. Use `nslookup api.zyratechhub.com` to verify DNS records
3. Double-check the CNAME points to the correct Azure URL
4. Verify TXT record has the correct verification code

---

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN" when accessing custom domain
**Cause:** DNS records not yet propagated globally

**Solution:**
1. Wait longer (can take up to 24-48 hours, usually 1-2 hours)
2. Check DNS propagation using https://dnschecker.org/#CNAME/api.zyratechhub.com
3. Try accessing from a different network or device

---

### Issue: "NET::ERR_CERT_COMMON_NAME_INVALID" - SSL certificate error
**Cause:** Managed certificate not yet provisioned or binding not configured

**Solution:**
1. Go to Azure Portal → App Services → zyratech-api → Custom domains
2. Verify the TLS/SSL binding is configured for `api.zyratechhub.com`
3. If not, add the binding with "App Service Managed Certificate"
4. Wait 5-10 minutes for certificate provisioning

---

### Issue: Custom domain works but old Azure URL still accessible
**This is normal!** Both URLs will work:
- ✅ `https://api.zyratechhub.com` (your custom domain)
- ✅ `https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net` (Azure default)

You can't disable the Azure default URL, but you should update all your apps to use the custom domain.

---

### Issue: "403 Forbidden" or "CORS error" after switching to custom domain
**Cause:** Backend CORS configuration doesn't allow the new custom domain

**Solution:**
Check your CORS configuration in `src/index.ts` - it should already allow all origins or your frontend domain. The custom domain shouldn't affect CORS if configured correctly.

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] DNS records added to domain provider
- [ ] DNS propagation complete (`nslookup api.zyratechhub.com` works)
- [ ] Custom domain validated and added in Azure
- [ ] HTTPS/SSL certificate provisioned (SNI SSL binding)
- [ ] Health endpoint works: `https://api.zyratechhub.com/health`
- [ ] Authentication endpoints work with custom domain
- [ ] All API endpoints accessible via custom domain
- [ ] Frontend updated to use new custom domain
- [ ] Postman environment updated with new base URL
- [ ] Environment variables updated (if needed)

---

## 📝 DNS Record Reference

For your reference, here are the final DNS records you should have:

### Your Domain Provider DNS Settings

| Type  | Host/Name | Value/Points To | TTL  |
|-------|-----------|-----------------|------|
| CNAME | api       | zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net | 3600 |
| TXT   | asuid.api | <verification-code-from-azure> | 3600 |

**Note:** Some providers may require the full domain name (e.g., `api.zyratechhub.com` instead of just `api`)

---

## 🎉 After Successful Setup

Once everything is working:

1. **New API Base URL:** `https://api.zyratechhub.com`
2. **Example Endpoints:**
   - Health Check: `https://api.zyratechhub.com/health`
   - Register: `https://api.zyratechhub.com/api/auth/register`
   - Login: `https://api.zyratechhub.com/api/auth/login`
   - Courses: `https://api.zyratechhub.com/api/trainings`

3. **Update Documentation:**
   - Update README.md with new API URL
   - Update API documentation
   - Notify your frontend team

4. **Monitor:**
   - Check Azure logs to ensure everything is working
   - Monitor any errors in Application Insights (if enabled)

---

## 📚 Additional Resources

- [Azure App Service Custom Domain Documentation](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain)
- [Azure App Service SSL/TLS Documentation](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate)
- [DNS Propagation Checker](https://dnschecker.org)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check Azure App Service **Log stream** for errors
2. Verify DNS records using `nslookup` or online tools
3. Wait sufficient time for DNS propagation (at least 30 minutes)
4. Double-check all DNS record values match Azure's requirements
5. Ensure your domain is not behind a CDN that might interfere with validation

---

## 📊 Summary

| Item | Before | After |
|------|--------|-------|
| **API URL** | `https://zyratech-api-evcqfth0hkbdeydf.francecentral-01.azurewebsites.net` | `https://api.zyratechhub.com` |
| **SSL Certificate** | Azure default certificate | Free Azure Managed Certificate |
| **DNS Records** | None | CNAME + TXT verification |
| **Custom Domain** | ❌ Not configured | ✅ Configured |
| **HTTPS** | ✅ Available | ✅ Available |

---

**🎯 Next Step:** Follow the steps above starting with Step 1 - Get Domain Verification Details from Azure!
