# Database Migration Guide - Phase 1

## Overview

This migration adds support for:
- Microsoft Calendar integration (OAuth tokens)
- Booking system (availability, settings)
- Patient checklist tokens
- SMS logging

## Running the Migration

### Development

```bash
cd server
npx prisma migrate dev --name add_calendar_booking_features
```

### Production (Vercel/Supabase)

```bash
cd server
DATABASE_URL="your-direct-connection-url" npx prisma migrate deploy
```

**Important:** Use the `DIRECT_URL` from your `.env.production` file, not the pooled connection.

## Database Changes

### Modified Tables

#### `users`
- Added `microsoft_access_token` (TEXT, nullable)
- Added `microsoft_refresh_token` (TEXT, nullable)
- Added `microsoft_token_expiry` (TIMESTAMP, nullable)
- Added `microsoft_email` (VARCHAR(150), nullable)
- Added `calendar_sync_enabled` (BOOLEAN, default false)

### New Tables

#### `availability_slots`
Stores pharmacist's weekly availability schedule.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | Foreign key to users |
| day_of_week | INT | 0=Monday, 6=Sunday |
| start_time | VARCHAR(5) | HH:MM format |
| end_time | VARCHAR(5) | HH:MM format |
| is_available | BOOLEAN | Slot enabled/disabled |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

#### `booking_settings`
Configuration for each pharmacist's booking page.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | Foreign key to users (unique) |
| buffer_time_before | INT | Minutes before appointment |
| buffer_time_after | INT | Minutes after appointment |
| default_duration | INT | Default appointment duration (min) |
| allow_public_booking | BOOLEAN | Enable public booking page |
| require_approval | BOOLEAN | Require manual approval |
| booking_url | VARCHAR(100) | Custom URL slug (unique) |
| confirmation_email_text | TEXT | Custom confirmation email |
| reminder_email_text | TEXT | Custom reminder email |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

#### `checklist_tokens`
Secure tokens for patient pre-appointment checklist access.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| hmr_review_id | INT | Foreign key to hmr_reviews |
| token | VARCHAR(255) | Unique secure token |
| expires_at | TIMESTAMP | Token expiry time |
| used_at | TIMESTAMP | When token was used |
| created_at | TIMESTAMP | Creation time |

#### `sms_logs`
Track all SMS messages sent through the system.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| hmr_review_id | INT | Foreign key to hmr_reviews (nullable) |
| to_phone | VARCHAR(20) | Recipient phone number |
| message_body | TEXT | SMS content |
| message_sid | VARCHAR(100) | Twilio message ID |
| status | VARCHAR(50) | pending/sent/failed |
| error_msg | TEXT | Error message if failed |
| sent_at | TIMESTAMP | When message was sent |
| created_at | TIMESTAMP | Creation time |

## Rollback

If you need to rollback this migration:

```bash
cd server
npx prisma migrate resolve --rolled-back add_calendar_booking_features
```

Then manually drop the new tables and columns using SQL:

```sql
-- Drop new tables
DROP TABLE IF EXISTS sms_logs;
DROP TABLE IF EXISTS checklist_tokens;
DROP TABLE IF EXISTS booking_settings;
DROP TABLE IF EXISTS availability_slots;

-- Remove columns from users table
ALTER TABLE users
  DROP COLUMN IF EXISTS microsoft_access_token,
  DROP COLUMN IF EXISTS microsoft_refresh_token,
  DROP COLUMN IF EXISTS microsoft_token_expiry,
  DROP COLUMN IF EXISTS microsoft_email,
  DROP COLUMN IF EXISTS calendar_sync_enabled;
```

## Post-Migration Steps

1. **Verify Migration Success:**
   ```bash
   npx prisma studio
   ```
   Check that all new tables appear in Prisma Studio.

2. **Test API Endpoints:**
   - Test Microsoft OAuth: `GET /api/auth/microsoft/login`
   - Test booking settings: `GET /api/booking/settings`

3. **Set Up Initial Data:**
   - Configure your availability slots
   - Set up your booking settings
   - Create a custom booking URL

## Troubleshooting

### Error: "Migration failed to apply"
- Ensure you're using the direct database URL (not pooled)
- Check database permissions
- Review migration logs for specific errors

### Error: "Column already exists"
- You may have partially applied changes
- Use `npx prisma db pull` to sync schema with database
- Manually verify database state

### Supabase Connection Issues
- Use the `DIRECT_URL` from Supabase dashboard
- Ensure port 5432 (not 6543 pooler port)
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

## Next Steps

After successful migration:
1. ✅ Update your `.env` file with Microsoft/Twilio/OpenAI credentials
2. ✅ Follow [PHASE1_SETUP.md](../PHASE1_SETUP.md) for service configuration
3. ✅ Test the booking flow end-to-end
4. ✅ Set up SMS reminders cron job

---

**Last Updated:** 2025-12-27
