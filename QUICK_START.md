# Quick Start Guide - Vercel + Supabase

Get up and running in 15 minutes!

## Prerequisites

- Node.js 16+ installed
- Docker Desktop installed and running
- Git installed

---

## Step 1: Install Dependencies (2 minutes)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Generate Prisma client
npx prisma generate

# Go back to root
cd ..
```

---

## Step 2: Start Local Database (1 minute)

```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Verify it's running
docker ps
# You should see: buete-consulting-db
```

---

## Step 3: Setup Environment Files (1 minute)

```bash
# Copy environment templates (defaults are already set!)
cp server/.env.local.example server/.env.local
cp .env.local.example .env.local

# No changes needed for local development!
```

---

## Step 4: Run Database Migrations (1 minute)

```bash
cd server

# Create all database tables
npx prisma migrate dev

# When prompted for migration name, press Enter (default is fine)
```

---

## Step 5: Create Admin User (1 minute)

```bash
# Still in server/ directory
npm run seed:admin

# Follow the prompts:
# - Username: admin (or your choice)
# - Email: admin@example.com (or your choice)
# - Password: [choose a password]
# - Role: ADMIN
```

---

## Step 6: Start Development Servers (30 seconds)

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend (open new terminal)
npm start
```

---

## Step 7: Test! (30 seconds)

Open your browser:
- Frontend: http://localhost:3000
- Backend Health: http://localhost:4000/api/health

You should see the login page. Use the credentials you just created!

---

## You're Done! 🎉

Your local development environment is ready.

**Next Steps:**
- Read [VERCEL_SUPABASE_SETUP.md](VERCEL_SUPABASE_SETUP.md) for full deployment guide
- Start building features!
- When ready to deploy, follow Part 2 (Supabase) and Part 3 (Vercel)

---

## Common Commands

```bash
# Start local database
cd server && npm run db:local

# Stop local database
cd server && npm run db:local:stop

# View database with GUI
cd server && npx prisma studio

# Reset database (WARNING: deletes all data)
cd server && npx prisma migrate reset

# Create new migration after schema changes
cd server && npx prisma migrate dev --name describe_your_change
```

---

## Troubleshooting

**"Port 4000 already in use"**
```bash
# Kill the process using port 4000
lsof -ti:4000 | xargs kill -9
```

**"Can't connect to database"**
```bash
# Make sure Docker is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres
```

**"Module not found" errors**
```bash
# Reinstall dependencies
rm -rf node_modules server/node_modules
npm install
cd server && npm install && npx prisma generate
```

---

**Need help?** Check the full guide: [VERCEL_SUPABASE_SETUP.md](VERCEL_SUPABASE_SETUP.md)
