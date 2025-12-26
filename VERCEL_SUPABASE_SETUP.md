# Vercel + Supabase Deployment Guide

## Overview

This guide shows you how to:
1. **Develop locally** with PostgreSQL (Docker)
2. **Test your changes** in local database
3. **Push to Supabase** when ready
4. **Deploy to Vercel** for production

---

## Architecture

```
LOCAL DEVELOPMENT:
Your Computer
  ↓
Docker PostgreSQL (localhost:5432)
  ↓
Express API (localhost:4000)
  ↓
React App (localhost:3000)

PRODUCTION:
User
  ↓
Vercel (Frontend + API)
  ↓
Supabase PostgreSQL
  ↓
AWS Bedrock (AI)
```

---

## Part 1: Local Development Setup

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Generate Prisma client
npx prisma generate
cd ..
```

### Step 2: Setup Local Database

```bash
# Start local PostgreSQL with Docker
docker-compose up postgres -d

# Or use the convenience script
cd server && npm run db:local
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `buete_consulting`
- User: `postgres`
- Password: `postgres`

### Step 3: Configure Local Environment

```bash
# Copy environment templates
cp server/.env.local.example server/.env.local
cp .env.local.example .env.local

# No changes needed - defaults are set for local Docker!
```

**server/.env.local** (already configured):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buete_consulting?schema=public"
PORT=4000
NODE_ENV=development
JWT_SECRET="dev-jwt-secret-change-in-production-min-32-chars"
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**.env.local** (already configured):
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

### Step 4: Run Database Migrations

```bash
cd server

# Run migrations to create all tables
npx prisma migrate dev

# This will:
# 1. Create all database tables
# 2. Generate Prisma client
# 3. Apply all migrations
```

### Step 5: Create Admin User (Optional)

```bash
# Create an admin user for testing
npm run seed:admin

# Follow the prompts to create your first user
```

### Step 6: Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend (new terminal)
npm start
```

Your app is now running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Health: http://localhost:4000/api/health

### Step 7: Test Local Setup

```bash
# Check database connection
curl http://localhost:4000/api/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   ...
# }
```

---

## Part 2: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose settings:
   - **Name**: buete-consulting (or your choice)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or Pro if needed)
4. Wait 2-3 minutes for project creation

### Step 2: Get Connection Strings

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Copy TWO connection strings:

**Pooler Connection (for API calls):**
```
postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection (for migrations):**
```
postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
```

### Step 3: Configure Production Environment

```bash
# Copy production template
cp server/.env.production.example server/.env.production
```

**Edit `server/.env.production`:**
```env
# Pooler connection (for app runtime)
DATABASE_URL="postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres"

# Generate new JWT secret for production
JWT_SECRET="YOUR_SECURE_RANDOM_STRING_HERE"

# Your AWS credentials
AWS_ACCESS_KEY_ID=your-production-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-production-aws-secret-access-key

# Will update this after Vercel deployment
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### Step 4: Run Migrations to Supabase

```bash
cd server

# Set environment to production
export DATABASE_URL="[YOUR_DIRECT_CONNECTION_STRING]"

# Run migrations
npx prisma migrate deploy

# This creates all tables in Supabase
```

### Step 5: Verify Supabase Database

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all your tables:
   - users
   - clients
   - patients
   - hmr_reviews
   - medications
   - etc. (21 tables total)

### Step 6: Create Admin User in Supabase

```bash
# Using production environment
export DATABASE_URL="[YOUR_DIRECT_CONNECTION_STRING]"
npm run seed:admin

# Create your production admin user
```

---

## Part 3: Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Project

```bash
# From project root
vercel link

# Choose:
# - Setup new project? Y
# - Link to existing project? N (for first time)
# - Project name: buete-consulting (or your choice)
```

### Step 4: Configure Environment Variables

```bash
# Set production environment variables
vercel env add DATABASE_URL

# Paste your Supabase POOLER connection string:
postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Add DIRECT_URL for migrations
vercel env add DIRECT_URL
# Paste your Supabase DIRECT connection string

# Add other secrets
vercel env add JWT_SECRET
# Paste your secure random string

vercel env add AWS_ACCESS_KEY_ID
# Paste your AWS access key

vercel env add AWS_SECRET_ACCESS_KEY
# Paste your AWS secret key

vercel env add ALLOWED_ORIGINS
# Enter: https://your-app-name.vercel.app

# Add other AWS Bedrock configs
vercel env add AWS_REGION
# us-east-1

vercel env add BEDROCK_MODEL_ID
# anthropic.claude-3-5-sonnet-20241022-v2:0
```

### Step 5: Deploy

```bash
# Deploy to production
vercel --prod

# Vercel will:
# 1. Build your React frontend
# 2. Build your Express backend
# 3. Deploy everything as serverless functions
# 4. Give you a URL: https://your-app.vercel.app
```

### Step 6: Update CORS Origins

After deployment, update allowed origins:

```bash
# Update the environment variable
vercel env add ALLOWED_ORIGINS

# Enter your actual Vercel URL:
https://your-app-12345.vercel.app

# Redeploy to apply changes
vercel --prod
```

### Step 7: Test Production Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "environment": "production"
# }
```

---

## Part 4: Development Workflow

### Daily Development Workflow

```bash
# 1. Start local database (if not running)
cd server && npm run db:local

# 2. Start development servers
# Terminal 1:
cd server && npm run dev

# Terminal 2:
npm start

# 3. Make code changes

# 4. Test locally at http://localhost:3000
```

### When You Need Database Changes

```bash
# 1. Update schema in server/prisma/schema.prisma

# 2. Create migration (local database)
cd server
npx prisma migrate dev --name describe_your_change

# Example:
npx prisma migrate dev --name add_patient_email_field

# 3. Test locally - make sure everything works!

# 4. When ready, push to Supabase
export DATABASE_URL="[YOUR_DIRECT_CONNECTION_STRING]"
npx prisma migrate deploy

# 5. Commit migrations to git
git add prisma/migrations
git commit -m "Add patient email field"
git push

# 6. Vercel will auto-deploy (if connected to GitHub)
# Or manually: vercel --prod
```

### Useful Database Commands

```bash
# View database with Prisma Studio (local)
cd server
npx prisma studio

# View database with Prisma Studio (Supabase)
export DATABASE_URL="[YOUR_DIRECT_CONNECTION_STRING]"
npx prisma studio

# Reset local database (WARNING: deletes all data)
npx prisma migrate reset

# Stop local database
npm run db:local:stop
# Or: docker-compose down
```

---

## Part 5: Environment Variable Reference

### Local Development (.env.local)

| Variable | Value | Description |
|----------|-------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/buete_consulting | Local Docker PostgreSQL |
| PORT | 4000 | Backend port |
| NODE_ENV | development | Environment |
| JWT_SECRET | dev-jwt-secret-... | Development JWT secret |
| ALLOWED_ORIGINS | http://localhost:3000 | Local frontend |

### Production (Vercel + Supabase)

| Variable | Example | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://postgres.abc123:[PWD]@...pooler... | Supabase pooler (for runtime) |
| DIRECT_URL | postgresql://postgres:[PWD]@db.abc123... | Supabase direct (for migrations) |
| JWT_SECRET | [32+ random chars] | Production JWT secret |
| AWS_ACCESS_KEY_ID | AKIA... | AWS access key |
| AWS_SECRET_ACCESS_KEY | [secret] | AWS secret key |
| AWS_REGION | us-east-1 | AWS region |
| BEDROCK_MODEL_ID | anthropic.claude-3-5... | Claude model |
| ALLOWED_ORIGINS | https://your-app.vercel.app | Production frontend URL |
| NODE_ENV | production | Auto-set by Vercel |

---

## Part 6: Troubleshooting

### Issue: "Can't reach database server"

**Local:**
```bash
# Check if PostgreSQL is running
docker ps

# If not running:
docker-compose up postgres -d
```

**Supabase:**
```bash
# Check connection string has correct password
# Check if IP is allowed in Supabase settings
# Supabase → Settings → Database → Connection pooling
```

### Issue: "Prisma migrate failed"

```bash
# Make sure you're using DIRECT_URL for migrations
export DATABASE_URL="[DIRECT_CONNECTION_STRING]"

# Not the pooler URL!
npx prisma migrate deploy
```

### Issue: "API timeout on Vercel"

Your AI calls might be too slow. Check function duration:
- Vercel Hobby: 10s max ❌
- Vercel Pro: 60s max ⚠️
- Vercel Enterprise: 900s max ✅

**Solutions:**
1. Upgrade to Vercel Pro ($20/month)
2. Move AI to AWS Lambda (separate deployment)
3. Use background jobs/queues

### Issue: "Module not found" on Vercel

```bash
# Make sure dependencies are in dependencies, not devDependencies
# Vercel only installs "dependencies" in production

# Check package.json - move if needed:
npm install --save package-name
# instead of:
npm install --save-dev package-name
```

### Issue: "Database connection pool exhausted"

Supabase Free tier limits:
- Max connections: 60
- Pooler: Helps manage connections

**Fix in DATABASE_URL:**
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
#                                              👆 Add this!
```

---

## Part 7: Cost Breakdown

### Free Tier (Development)

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| **Vercel** | Hobby Plan | Personal projects, testing |
| **Supabase** | 500MB DB, 50K MAU | Development + small production |
| **AWS Bedrock** | Pay per use | ~$0.015 per 1K tokens |

**Total: $0/month** (plus AWS usage)

### Production Setup

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Pro | $20/month | 60s function timeout, 100GB bandwidth |
| **Supabase** | Free/Pro | $0 or $25/month | Free is generous for most use cases |
| **AWS Bedrock** | Pay per use | Variable | ~$3-10/month for moderate use |

**Total: $20-55/month** (vs $90-160 for full AWS)

---

## Part 8: Going to Production Checklist

Before launching to real users:

- [ ] Change JWT_SECRET to secure random string (32+ chars)
- [ ] Update ALLOWED_ORIGINS to your production domain
- [ ] Enable Supabase database backups (Settings → Database → Point-in-Time Recovery)
- [ ] Set up Vercel production domain (Settings → Domains)
- [ ] Configure SSL certificate (automatic with Vercel)
- [ ] Test all API endpoints in production
- [ ] Create admin user in production database
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure monitoring/alerts
- [ ] Test authentication flow
- [ ] Test HMR workflow end-to-end
- [ ] Load test with realistic data
- [ ] Set up automated backups
- [ ] Document recovery procedures

---

## Part 9: Continuous Deployment (GitHub)

### Connect Vercel to GitHub

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Connect GitHub
4. Select your repository
5. Vercel will auto-deploy on every push to `main`

**Auto-deployment workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs npm run vercel-build
# 3. Deploys frontend + backend
# 4. Updates https://your-app.vercel.app
```

### Preview Deployments

Every pull request gets a preview URL:
```
https://your-app-git-feature-branch.vercel.app
```

Test features before merging!

---

## Part 10: Database Migration Strategy

### Safe Migration Workflow

```bash
# 1. TEST IN LOCAL FIRST
cd server
npx prisma migrate dev --name my_change

# 2. Test thoroughly locally
npm run dev
# Test all affected features

# 3. Backup Supabase (just in case)
# Supabase Dashboard → Database → Backups

# 4. Apply to Supabase
export DATABASE_URL="[DIRECT_CONNECTION_STRING]"
npx prisma migrate deploy

# 5. Verify in Supabase Dashboard
# Table Editor → Check new columns/tables

# 6. Deploy to Vercel
git add prisma/migrations
git commit -m "Database migration: describe change"
git push

# Auto-deploys via GitHub → Vercel
```

### Rollback Strategy

If migration fails in production:

```bash
# 1. Restore Supabase from backup
# Dashboard → Settings → Database → Point-in-Time Recovery

# 2. Revert code to previous version
git revert HEAD
git push

# Vercel auto-deploys previous version
```

---

## Summary

You now have:

✅ **Local development** with Docker PostgreSQL
✅ **Test locally** before pushing to production
✅ **Supabase** for production PostgreSQL
✅ **Vercel** for hosting frontend + API
✅ **Continuous deployment** via GitHub
✅ **Cost-effective** (~$20-55/month vs $90-160)

**Next Steps:**
1. Set up local environment (Part 1)
2. Test locally
3. Create Supabase project (Part 2)
4. Deploy to Vercel (Part 3)
5. Start building features!

**Support:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Author:** Claude Code Setup Assistant
