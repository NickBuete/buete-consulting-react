# Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Completed Items

- [x] Database schema migrated
- [x] Microsoft Azure AD app configured
- [x] Twilio SMS account set up
- [x] OpenAI API key obtained
- [x] `.env.production` updated with credentials
- [x] Backend server tested locally
- [x] All Phase 1 APIs implemented

### ⏳ Before First Deploy

- [ ] **Update Production URLs**
  - [ ] Get your Vercel deployment URL (after first deploy)
  - [ ] Update `MICROSOFT_REDIRECT_URI` in `.env.production`
  - [ ] Update `ALLOWED_ORIGINS` with production frontend URL

- [ ] **Azure AD Configuration**
  - [ ] Add production redirect URI to Azure app
  - [ ] URL format: `https://your-api-domain.vercel.app/api/auth/microsoft/callback`

- [ ] **Database Migration**
  - [ ] Run migration on production database (Supabase)
  - [ ] Verify all tables created

- [ ] **Vercel Environment Variables**
  - [ ] Add all variables from `.env.production` to Vercel dashboard

---

## 🚀 Deployment Steps

### Step 1: First Deploy to Get URL

```bash
# From project root
git add .
git commit -m "Add Phase 1 backend features"
git push origin main
```

Vercel will auto-deploy. Note the deployment URL (e.g., `https://buete-consulting-api.vercel.app`)

### Step 2: Update Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable from `.env.production`:

**Required Variables:**

```env
# Database
DATABASE_URL=postgresql://postgres.jkhhcenobqxmssbebrcf:***@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:***@db.jkhhcenobqxmssbebrcf.supabase.co:5432/postgres

# Auth
JWT_SECRET=JWT_SECRET
# AWS Bedrock (if still using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MAX_TOKENS=4096
BEDROCK_TEMPERATURE=0.3

# Microsoft
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
MICROSOFT_REDIRECT_URI=https://YOUR-API-URL.vercel.app/api/auth/microsoft/callback

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+16055254712
SMS_ENABLED=true

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3
AI_PROVIDER=openai

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
```

**Important:** Replace `YOUR-API-URL` and `your-frontend` with actual Vercel URLs after deployment.

### Step 3: Update Azure Redirect URI

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Select your app: "Buete Consulting HMR Calendar"
4. Click **Authentication** in left menu
5. Under **Redirect URIs**, add:
   ```
   https://YOUR-API-URL.vercel.app/api/auth/microsoft/callback
   ```
6. Click **Save**

### Step 4: Run Production Database Migration

```bash
# Using Supabase direct URL
DATABASE_URL="postgresql://postgres:gob7hl63ug6EUkfh@db.jkhhcenobqxmssbebrcf.supabase.co:5432/postgres" \
npx prisma migrate deploy
```

Or use Prisma Studio to verify schema:
```bash
DIRECT_URL="postgresql://postgres:gob7hl63ug6EUkfh@db.jkhhcenobqxmssbebrcf.supabase.co:5432/postgres" \
npx prisma studio
```

### Step 5: Update Frontend Environment Variables

Update your frontend to point to production API:

```env
# In root .env or Vercel frontend project
REACT_APP_API_URL=https://YOUR-API-URL.vercel.app
```

### Step 6: Redeploy

After updating all environment variables:

1. Go to Vercel Dashboard > Your Project > Deployments
2. Click on latest deployment
3. Click **Redeploy** button
4. Or push a new commit to trigger auto-deploy

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check

```bash
curl https://YOUR-API-URL.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-27T..."
}
```

### Test 2: Microsoft OAuth

1. Login to your production frontend
2. Navigate to settings/integrations
3. Click "Connect Microsoft Calendar"
4. Should redirect to Microsoft login
5. After auth, should redirect back to your app

Or test directly:
```
https://YOUR-API-URL.vercel.app/api/auth/microsoft/login
```

### Test 3: Database Connection

Check Vercel logs for database connection success:
```
{"level":"info","msg":"API server started"}
```

### Test 4: Public Booking Endpoint

```bash
curl https://YOUR-API-URL.vercel.app/api/booking/public/test-booking
```

Should return 404 (expected - no booking URL configured yet).

### Test 5: SMS Service

Check Vercel logs:
```
{"level":"info","msg":"Twilio SMS service initialized"}
```

---

## 🔍 Monitoring & Debugging

### Vercel Logs

View real-time logs:
1. Vercel Dashboard > Your Project > Logs
2. Filter by deployment
3. Check for errors or warnings

### Common Issues

**Issue: "Database connection failed"**
- Check DATABASE_URL format
- Verify Supabase credentials
- Check connection pooling settings

**Issue: "Microsoft OAuth redirect mismatch"**
- Verify redirect URI in Azure matches Vercel URL exactly
- Check for http vs https
- Ensure no trailing slashes

**Issue: "SMS not sending"**
- Check Twilio credentials in Vercel
- Verify phone number format
- Check Twilio console for errors

**Issue: "OpenAI API error"**
- Verify API key is correct
- Check OpenAI usage limits
- Ensure billing is set up

### Environment Variable Issues

If variables aren't loading:
1. Check they're set in Vercel dashboard
2. Ensure they're for the correct environment (Production)
3. Redeploy after adding variables
4. Check Vercel logs for "dotenv" or "env" messages

---

## 📊 Production Checklist

After successful deployment:

- [ ] Health endpoint returns 200 OK
- [ ] Database connection successful
- [ ] Microsoft OAuth flow works
- [ ] SMS service initializes (check logs)
- [ ] OpenAI service configured (check logs)
- [ ] Frontend can connect to API
- [ ] CORS allows frontend domain
- [ ] No errors in Vercel logs
- [ ] Booking API endpoints accessible

---

## 🔐 Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] CORS restricted to your domains only
- [ ] JWT secret is strong and random
- [ ] Database uses connection pooling
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Rate limiting enabled
- [ ] API tokens rotate periodically

---

## 📝 Important Notes

### Don't Commit to Git
- ❌ `.env` files with real credentials
- ❌ API keys or secrets
- ✅ `.env.example` with placeholder values

### Supabase Database
- Use **pooled connection** (`DATABASE_URL`) for app runtime
- Use **direct connection** (`DIRECT_URL`) for migrations only
- Connection limit: 1 for pooled (required by pgBouncer)

### Vercel Specifics
- Environment variables are encrypted
- Separate values for Preview/Production
- Redeploy needed after variable changes
- Build logs show dotenv loading

---

## 🆘 Rollback Plan

If deployment fails:

1. **Revert to Previous Deployment:**
   - Vercel Dashboard > Deployments
   - Find working deployment
   - Click **Promote to Production**

2. **Rollback Database:**
   ```bash
   npx prisma migrate resolve --rolled-back migration-name
   ```

3. **Restore Environment Variables:**
   - Keep backup of working variable values
   - Re-add if accidentally deleted

---

## 📞 Support Resources

- **Vercel Support:** https://vercel.com/support
- **Supabase Docs:** https://supabase.com/docs
- **Azure Support:** https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- **Twilio Support:** https://support.twilio.com
- **OpenAI Support:** https://help.openai.com

---

## 🎯 Success Criteria

Deployment is successful when:

✅ All API endpoints return expected responses
✅ Microsoft OAuth completes successfully
✅ Database queries work
✅ SMS service initializes without errors
✅ OpenAI service configured
✅ Frontend can authenticate and make API calls
✅ No errors in production logs
✅ Calendar events sync to Office 365
✅ Public booking creates reviews

---

**Last Updated:** 2025-12-27

**Status:** Ready to Deploy 🚀
