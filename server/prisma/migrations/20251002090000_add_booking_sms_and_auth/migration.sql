-- Add Microsoft auth fields and calendar sync toggle to users
ALTER TABLE "public"."users" ADD COLUMN "microsoft_access_token" TEXT;
ALTER TABLE "public"."users" ADD COLUMN "microsoft_refresh_token" TEXT;
ALTER TABLE "public"."users" ADD COLUMN "microsoft_token_expiry" TIMESTAMP(6);
ALTER TABLE "public"."users" ADD COLUMN "microsoft_email" VARCHAR(150);
ALTER TABLE "public"."users" ADD COLUMN "calendar_sync_enabled" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "users_microsoft_email_idx" ON "public"."users"("microsoft_email");

-- Availability slots per user
CREATE TABLE "public"."availability_slots" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "availability_slots_user_id_idx" ON "public"."availability_slots"("user_id");

ALTER TABLE "public"."availability_slots" ADD CONSTRAINT "availability_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Per-user booking settings
CREATE TABLE "public"."booking_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "buffer_time_before" INTEGER NOT NULL DEFAULT 15,
    "buffer_time_after" INTEGER NOT NULL DEFAULT 15,
    "default_duration" INTEGER NOT NULL DEFAULT 60,
    "allow_public_booking" BOOLEAN NOT NULL DEFAULT true,
    "require_approval" BOOLEAN NOT NULL DEFAULT false,
    "booking_url" VARCHAR(100),
    "confirmation_email_text" TEXT,
    "reminder_email_text" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."booking_settings" ADD CONSTRAINT "booking_settings_user_id_key" UNIQUE ("user_id");
ALTER TABLE "public"."booking_settings" ADD CONSTRAINT "booking_settings_booking_url_key" UNIQUE ("booking_url");

ALTER TABLE "public"."booking_settings" ADD CONSTRAINT "booking_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Checklist tokens for patient pre-appointment forms
CREATE TABLE "public"."checklist_tokens" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "checklist_tokens_token_key" ON "public"."checklist_tokens"("token");
CREATE INDEX "checklist_tokens_hmr_review_id_idx" ON "public"."checklist_tokens"("hmr_review_id");
CREATE INDEX "checklist_tokens_token_idx" ON "public"."checklist_tokens"("token");

-- SMS delivery logs
CREATE TABLE "public"."sms_logs" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER,
    "to_phone" VARCHAR(20) NOT NULL,
    "message_body" TEXT NOT NULL,
    "message_sid" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "error_msg" TEXT,
    "sent_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sms_logs_hmr_review_id_idx" ON "public"."sms_logs"("hmr_review_id");
CREATE INDEX "sms_logs_status_idx" ON "public"."sms_logs"("status");

-- One-time reschedule links tied to reviews
CREATE TABLE "public"."reschedule_tokens" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reschedule_tokens_hmr_review_id_key" ON "public"."reschedule_tokens"("hmr_review_id");
CREATE UNIQUE INDEX "reschedule_tokens_token_key" ON "public"."reschedule_tokens"("token");
CREATE INDEX "reschedule_tokens_hmr_review_id_idx" ON "public"."reschedule_tokens"("hmr_review_id");
CREATE INDEX "reschedule_tokens_token_idx" ON "public"."reschedule_tokens"("token");

ALTER TABLE "public"."reschedule_tokens" ADD CONSTRAINT "reschedule_tokens_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Structured interview responses per review
CREATE TABLE "public"."hmr_interview_responses" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "response" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_interview_responses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hmr_interview_responses_hmr_review_id_category_key" ON "public"."hmr_interview_responses"("hmr_review_id", "category");
CREATE INDEX "hmr_interview_responses_hmr_review_id_idx" ON "public"."hmr_interview_responses"("hmr_review_id");

ALTER TABLE "public"."hmr_interview_responses" ADD CONSTRAINT "hmr_interview_responses_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
