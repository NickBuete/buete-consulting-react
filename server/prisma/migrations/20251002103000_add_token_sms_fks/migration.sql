-- Add foreign keys for checklist tokens and SMS logs to hmr_reviews
ALTER TABLE "public"."checklist_tokens"
  ADD CONSTRAINT "checklist_tokens_hmr_review_id_fkey"
  FOREIGN KEY ("hmr_review_id")
  REFERENCES "public"."hmr_reviews"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "public"."sms_logs"
  ADD CONSTRAINT "sms_logs_hmr_review_id_fkey"
  FOREIGN KEY ("hmr_review_id")
  REFERENCES "public"."hmr_reviews"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
