-- RLS for booking and scheduling tables
ALTER TABLE "public"."availability_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."availability_slots" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "availability_slots_owner_isolation" ON "public"."availability_slots";
CREATE POLICY "availability_slots_owner_isolation" ON "public"."availability_slots"
  USING ("user_id" = public.app_current_user_id())
  WITH CHECK ("user_id" = public.app_current_user_id());

ALTER TABLE "public"."booking_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."booking_settings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "booking_settings_owner_isolation" ON "public"."booking_settings";
CREATE POLICY "booking_settings_owner_isolation" ON "public"."booking_settings"
  USING ("user_id" = public.app_current_user_id())
  WITH CHECK ("user_id" = public.app_current_user_id());

-- RLS for review-linked tables
ALTER TABLE "public"."checklist_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."checklist_tokens" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklist_tokens_owner_isolation" ON "public"."checklist_tokens";
CREATE POLICY "checklist_tokens_owner_isolation" ON "public"."checklist_tokens"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."sms_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sms_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sms_logs_owner_isolation" ON "public"."sms_logs";
CREATE POLICY "sms_logs_owner_isolation" ON "public"."sms_logs"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."reschedule_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reschedule_tokens" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reschedule_tokens_owner_isolation" ON "public"."reschedule_tokens";
CREATE POLICY "reschedule_tokens_owner_isolation" ON "public"."reschedule_tokens"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_interview_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_interview_responses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_interview_responses_owner_isolation" ON "public"."hmr_interview_responses";
CREATE POLICY "hmr_interview_responses_owner_isolation" ON "public"."hmr_interview_responses"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));
