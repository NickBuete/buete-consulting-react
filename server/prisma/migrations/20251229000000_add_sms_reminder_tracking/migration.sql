-- Add reminder tracking to hmr_reviews
ALTER TABLE "public"."hmr_reviews" ADD COLUMN "reminder_sent_at" TIMESTAMP(6);

-- Add message_type column to sms_logs for categorizing SMS types
ALTER TABLE "public"."sms_logs" ADD COLUMN "message_type" VARCHAR(50) NOT NULL DEFAULT 'general';

-- Add index for message_type for efficient querying
CREATE INDEX "sms_logs_message_type_idx" ON "public"."sms_logs"("message_type");
