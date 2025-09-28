-- Tenant ownership columns
ALTER TABLE "public"."clinics" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "public"."prescribers" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "public"."patients" ADD COLUMN "owner_id" INTEGER;
ALTER TABLE "public"."hmr_reviews" ADD COLUMN "owner_id" INTEGER;

ALTER TABLE "public"."clinics"
  ADD CONSTRAINT "clinics_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."prescribers"
  ADD CONSTRAINT "prescribers_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."patients"
  ADD CONSTRAINT "patients_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."hmr_reviews"
  ADD CONSTRAINT "hmr_reviews_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "clinics_owner_id_idx" ON "public"."clinics"("owner_id");
CREATE INDEX IF NOT EXISTS "prescribers_owner_id_idx" ON "public"."prescribers"("owner_id");
CREATE INDEX IF NOT EXISTS "patients_owner_id_idx" ON "public"."patients"("owner_id");
CREATE INDEX IF NOT EXISTS "hmr_reviews_owner_id_idx" ON "public"."hmr_reviews"("owner_id");

DO $$
DECLARE
  fallback_user_id INTEGER;
BEGIN
  SELECT "id" INTO fallback_user_id FROM "public"."users" ORDER BY "id" LIMIT 1;

  IF fallback_user_id IS NULL THEN
    IF EXISTS (SELECT 1 FROM "public"."clinics")
       OR EXISTS (SELECT 1 FROM "public"."prescribers")
       OR EXISTS (SELECT 1 FROM "public"."patients")
       OR EXISTS (SELECT 1 FROM "public"."hmr_reviews") THEN
      RAISE EXCEPTION 'Cannot backfill owner_id – add a user first or clear existing tenant data.';
    END IF;
  ELSE
    UPDATE "public"."clinics" SET "owner_id" = fallback_user_id WHERE "owner_id" IS NULL;
    UPDATE "public"."prescribers" SET "owner_id" = fallback_user_id WHERE "owner_id" IS NULL;
    UPDATE "public"."patients" SET "owner_id" = fallback_user_id WHERE "owner_id" IS NULL;
    UPDATE "public"."hmr_reviews" SET "owner_id" = fallback_user_id WHERE "owner_id" IS NULL;
  END IF;
END $$;

ALTER TABLE "public"."clinics" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "public"."prescribers" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "public"."patients" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "public"."hmr_reviews" ALTER COLUMN "owner_id" SET NOT NULL;

-- Create user role enum and migrate existing role values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "public"."UserRole" AS ENUM ('BASIC', 'PRO', 'ADMIN');
  END IF;
END $$;

UPDATE "public"."users"
SET "role" = CASE
  WHEN lower("role") = 'admin' THEN 'ADMIN'
  WHEN lower("role") = 'pro' THEN 'PRO'
  ELSE 'BASIC'
END
WHERE "role" IS NOT NULL;

ALTER TABLE "public"."users"
  ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "public"."users"
  ALTER COLUMN "role" TYPE "public"."UserRole"
  USING "role"::text::"public"."UserRole";

ALTER TABLE "public"."users"
  ALTER COLUMN "role" SET DEFAULT 'BASIC';

-- Row-level security helpers
CREATE OR REPLACE FUNCTION public.app_current_user_id() RETURNS integer LANGUAGE sql AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::integer
$$;

-- Clinics RLS
ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clinics" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clinics_owner_isolation" ON "public"."clinics";
CREATE POLICY "clinics_owner_isolation" ON "public"."clinics"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

-- Prescribers RLS
ALTER TABLE "public"."prescribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prescribers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prescribers_owner_isolation" ON "public"."prescribers";
CREATE POLICY "prescribers_owner_isolation" ON "public"."prescribers"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

-- Patients RLS
ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."patients" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "patients_owner_isolation" ON "public"."patients";
CREATE POLICY "patients_owner_isolation" ON "public"."patients"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

-- HMR reviews RLS
ALTER TABLE "public"."hmr_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_reviews" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_reviews_owner_isolation" ON "public"."hmr_reviews";
CREATE POLICY "hmr_reviews_owner_isolation" ON "public"."hmr_reviews"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

-- Helper policy predicate for dependent tables
CREATE OR REPLACE FUNCTION public.review_is_owned(review_id integer) RETURNS boolean LANGUAGE sql AS $$
  SELECT EXISTS (
    SELECT 1 FROM "public"."hmr_reviews" r
    WHERE r."id" = review_id AND r."owner_id" = public.app_current_user_id()
  );
$$;

-- HMR medications
ALTER TABLE "public"."hmr_medications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_medications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_medications_owner_isolation" ON "public"."hmr_medications";
CREATE POLICY "hmr_medications_owner_isolation" ON "public"."hmr_medications"
  USING (public.review_is_owned("hmr_review_id"))
  WITH CHECK (public.review_is_owned("hmr_review_id"));

-- HMR symptoms
ALTER TABLE "public"."hmr_symptoms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_symptoms" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_symptoms_owner_isolation" ON "public"."hmr_symptoms";
CREATE POLICY "hmr_symptoms_owner_isolation" ON "public"."hmr_symptoms"
  USING (public.review_is_owned("hmr_review_id"))
  WITH CHECK (public.review_is_owned("hmr_review_id"));

-- HMR action items
ALTER TABLE "public"."hmr_action_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_action_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_action_items_owner_isolation" ON "public"."hmr_action_items";
CREATE POLICY "hmr_action_items_owner_isolation" ON "public"."hmr_action_items"
  USING (public.review_is_owned("hmr_review_id"))
  WITH CHECK (public.review_is_owned("hmr_review_id"));

-- HMR attachments
ALTER TABLE "public"."hmr_attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_attachments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_attachments_owner_isolation" ON "public"."hmr_attachments";
CREATE POLICY "hmr_attachments_owner_isolation" ON "public"."hmr_attachments"
  USING (public.review_is_owned("hmr_review_id"))
  WITH CHECK (public.review_is_owned("hmr_review_id"));

-- HMR audit logs
ALTER TABLE "public"."hmr_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_audit_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hmr_audit_logs_owner_isolation" ON "public"."hmr_audit_logs";
CREATE POLICY "hmr_audit_logs_owner_isolation" ON "public"."hmr_audit_logs"
  USING (public.review_is_owned("hmr_review_id"))
  WITH CHECK (public.review_is_owned("hmr_review_id"));
