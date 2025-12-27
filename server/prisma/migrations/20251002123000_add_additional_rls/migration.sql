-- RLS for HMR child tables (inherits owner from hmr_reviews)
ALTER TABLE "public"."hmr_medications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_medications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_medications_owner_isolation" ON "public"."hmr_medications";
CREATE POLICY "hmr_medications_owner_isolation" ON "public"."hmr_medications"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_symptoms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_symptoms" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_symptoms_owner_isolation" ON "public"."hmr_symptoms";
CREATE POLICY "hmr_symptoms_owner_isolation" ON "public"."hmr_symptoms"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_action_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_action_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_action_items_owner_isolation" ON "public"."hmr_action_items";
CREATE POLICY "hmr_action_items_owner_isolation" ON "public"."hmr_action_items"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_attachments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_attachments_owner_isolation" ON "public"."hmr_attachments";
CREATE POLICY "hmr_attachments_owner_isolation" ON "public"."hmr_attachments"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_audit_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_audit_logs_owner_isolation" ON "public"."hmr_audit_logs";
CREATE POLICY "hmr_audit_logs_owner_isolation" ON "public"."hmr_audit_logs"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_medical_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_medical_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_medical_history_owner_isolation" ON "public"."hmr_medical_history";
CREATE POLICY "hmr_medical_history_owner_isolation" ON "public"."hmr_medical_history"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_allergies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_allergies" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_allergies_owner_isolation" ON "public"."hmr_allergies";
CREATE POLICY "hmr_allergies_owner_isolation" ON "public"."hmr_allergies"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

ALTER TABLE "public"."hmr_pathology" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_pathology" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_pathology_owner_isolation" ON "public"."hmr_pathology";
CREATE POLICY "hmr_pathology_owner_isolation" ON "public"."hmr_pathology"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r.id = "hmr_review_id" AND r.owner_id = public.app_current_user_id()
  ));

-- Enable RLS on shared/internal tables (no policies = no PostgREST access)
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hosting_info" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."medications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."medication_indications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prescribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
