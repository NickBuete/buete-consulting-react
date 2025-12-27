# Deploy to Production - Quick Guide

## ✅ Pre-Deployment Checklist

### Completed
- [x] Backend code complete
- [x] All services configured (Microsoft, Twilio, OpenAI)
- [x] Environment variables added to Vercel
- [x] Database schema ready

### Before You Deploy

**1. Verify Vercel Environment Variables**

Make sure these are set in Vercel Dashboard > Settings > Environment Variables:

**Database:**
```
DATABASE_URL=postgresql://postgres.jkhhcenobqxmssbebrcf:***@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres:***@db.jkhhcenobqxmssbebrcf.supabase.co:5432/postgres
```

**Authentication:**
```
JWT_SECRET=your-jwt-secret
```

**Microsoft Calendar:**
```
MICROSOFT_CLIENT_ID=microsoft-client-id
MICROSOFT_CLIENT_SECRET=microsoft-client-secret
MICROSOFT_TENANT_ID=microsoft-tenant-id
MICROSOFT_REDIRECT_URI=https://YOUR-API-URL.vercel.app/api/auth/microsoft/callback
```

**Twilio SMS:**
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+16055254712
SMS_ENABLED=true
```

**OpenAI:**
```
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3
AI_PROVIDER=openai
```

**CORS & Config:**
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=info
NODE_ENV=production
PORT=4000
```

**2. Important: Update These After First Deploy**

You'll need to update these with your actual Vercel URLs:
- `MICROSOFT_REDIRECT_URI` - Update with your API URL
- `ALLOWED_ORIGINS` - Update with your frontend URL

---

## 🚀 Deployment Steps

### Step 1: Commit and Push

```bash
# Check git status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add Phase 1 backend - Calendar, SMS, AI, Booking APIs"

# Push to main branch
git push origin main
```

Vercel will automatically detect the push and start deploying.

### Step 2: Monitor Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. You'll see your deployment in progress
3. Click on it to see build logs
4. Wait for "Building" → "Deploying" → "Ready"

### Step 3: Get Your Deployment URL

Once deployed, Vercel will show:
- **Production URL:** `https://buete-consulting-react.vercel.app` (or similar)
- **API URL:** Check your project settings

**Note:** Your backend might be at a separate URL like:
- `https://buete-consulting-react-server.vercel.app`

Or it might be at the same domain with `/api` path.

### Step 4: Run Production Database Migration

```bash
cd server

# Use your Supabase DIRECT_URL (not pooled)
DIRECT_URL="your-supabase-direct-url" \
npx prisma db push
```

Or if you prefer migrate:
```bash
DIRECT_URL="your-supabase-direct-url" \
npx prisma migrate deploy
```

### Step 5: Update Production URLs

**In Vercel Dashboard:**
1. Go to Settings > Environment Variables
2. Find `MICROSOFT_REDIRECT_URI`
3. Update to: `https://YOUR-ACTUAL-URL.vercel.app/api/auth/microsoft/callback`
4. Find `ALLOWED_ORIGINS`
5. Update to your actual frontend URL

**In Azure Portal:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Select "Buete Consulting HMR Calendar"
4. Click Authentication
5. Add Redirect URI: `https://YOUR-ACTUAL-URL.vercel.app/api/auth/microsoft/callback`
6. Save

### Step 6: Redeploy with Updated URLs

After updating environment variables:

**Option A:** Trigger redeploy in Vercel
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Option B:** Make a small change and push
```bash
# Make any small change (like adding a comment)
git commit --allow-empty -m "chore: Trigger redeploy with updated env vars"
git push origin main
```

---

## 🧪 Testing Production

### Test 1: Health Check

```bash
curl https://YOUR-URL.vercel.app/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-27T..."
}
```

### Test 2: Check Logs

In Vercel Dashboard > Logs, you should see:
```
{"level":"info","msg":"Twilio SMS service initialized"}
{"level":"info","msg":"OpenAI service initialized"}
{"level":"info","msg":"API server started","port":4000}
```

### Test 3: Database Connection

Logs should show successful Prisma connection:
```
No errors about database connection
```

### Test 4: Microsoft OAuth (When Ready)

After updating redirect URI:
```
https://YOUR-URL.vercel.app/api/auth/microsoft/login
```

Should redirect to Microsoft login page.

---

## ⚠️ Common Issues & Fixes

### Issue: "Database connection failed"

**Check:**
- DATABASE_URL is set in Vercel
- Connection string includes `?pgbouncer=true&connection_limit=1`
- Using pooled connection (port 6543, not 5432)

**Fix:**
```
DATABASE_URL=postgresql://postgres.jkhhcenobqxmssbebrcf:gob7hl63ug6EUkfh@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Issue: "CORS error" from frontend

**Check:**
- ALLOWED_ORIGINS includes your frontend URL
- No trailing slashes in URLs
- HTTPS (not HTTP) in production

**Fix:**
Update in Vercel:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
```

### Issue: "Microsoft OAuth redirect mismatch"

**Check:**
- Redirect URI in Vercel matches Azure exactly
- Redirect URI added to Azure app registration
- No http vs https mismatch

**Fix:**
1. Copy exact URL from Vercel
2. Add to Azure Authentication > Redirect URIs
3. Update MICROSOFT_REDIRECT_URI in Vercel
4. Redeploy

### Issue: "Environment variables not loading"

**Check:**
- Variables are set for "Production" environment (not just Preview)
- Redeployed after adding variables
- No typos in variable names

**Fix:**
1. Double-check all variable names match code
2. Ensure they're set for Production environment
3. Trigger new deployment

---

## 📊 Success Checklist

After deployment, verify:

- [ ] Health endpoint returns 200 OK
- [ ] No errors in Vercel logs
- [ ] Database connection successful (check logs)
- [ ] Twilio service initialized (check logs)
- [ ] OpenAI service configured (check logs)
- [ ] Can access public endpoints (without auth)
- [ ] CORS allows your frontend domain

---

## 🎯 Post-Deployment Tasks

Once production is running smoothly:

### 1. Update Frontend API URL

If you have a separate frontend, update its environment variables:

```env
REACT_APP_API_URL=https://your-api.vercel.app
```

Or if using same domain:
```env
REACT_APP_API_URL=https://your-app.vercel.app/api
```

### 2. Test Complete Flow

1. Frontend can connect to API
2. Authentication works
3. Microsoft OAuth completes
4. Public booking creates reviews
5. Calendar events sync
6. SMS sends (verify phone first)

### 3. Monitor & Optimize

- Set up error tracking (Sentry)
- Monitor API response times
- Check database query performance
- Review Twilio/OpenAI usage

### 4. Security Hardening

- [ ] Rotate JWT secret periodically
- [ ] Review CORS origins
- [ ] Check rate limiting
- [ ] Audit API permissions
- [ ] Review log sanitization

---

## 🆘 If Something Goes Wrong

### Rollback to Previous Deployment

1. Vercel Dashboard > Deployments
2. Find last working deployment
3. Click "..." menu
4. Click "Promote to Production"

### Check Logs for Errors

```bash
# In Vercel Dashboard > Logs
# Filter by:
# - Error level
# - Specific function
# - Time range
```

### Test Locally Again

If production fails but local works:
- Environment variable mismatch
- Database connection string difference
- CORS configuration

---

## 📝 Your Deployment URLs

**Fill these in after deployment:**

Frontend URL: `https://___________________.vercel.app`

Backend/API URL: `https://___________________.vercel.app`

Microsoft Redirect: `https://___________________.vercel.app/api/auth/microsoft/callback`

---

## 🎉 You're Ready!

Your backend is production-ready with:
- ✅ Microsoft Calendar sync
- ✅ SMS notifications
- ✅ AI report generation
- ✅ Public booking API
- ✅ Complete HMR workflow

**Next:** Build frontend components to use these APIs!

---

**Last Updated:** 2025-12-27

**Status:** Ready to Deploy 🚀

Good luck with your deployment!
