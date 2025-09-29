-- Enum for report lifecycle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HmrReportStatus') THEN
    CREATE TYPE "public"."HmrReportStatus" AS ENUM ('DRAFT', 'READY', 'SIGNED_OFF');
  END IF;
END $$;

-- Primary report table (one per review)
CREATE TABLE "public"."hmr_reports" (
    "id" SERIAL PRIMARY KEY,
    "owner_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "status" "public"."HmrReportStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "recommendations" TEXT,
    "generated_by" VARCHAR(150),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL
);

ALTER TABLE "public"."hmr_reports"
  ADD CONSTRAINT "hmr_reports_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."hmr_reports"
  ADD CONSTRAINT "hmr_reports_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."hmr_reports"
  ADD CONSTRAINT "hmr_reports_review_id_key" UNIQUE ("review_id");

CREATE INDEX "hmr_reports_owner_id_idx" ON "public"."hmr_reports" ("owner_id");
CREATE INDEX "hmr_reports_review_id_idx" ON "public"."hmr_reports" ("review_id");

-- Audit entries for AI generations
CREATE TABLE "public"."hmr_report_audit" (
    "id" SERIAL PRIMARY KEY,
    "report_id" INTEGER NOT NULL,
    "model_used" VARCHAR(150) NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."hmr_report_audit"
  ADD CONSTRAINT "hmr_report_audit_report_id_fkey"
  FOREIGN KEY ("report_id") REFERENCES "public"."hmr_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "hmr_report_audit_report_id_idx" ON "public"."hmr_report_audit" ("report_id");

-- RLS policies
ALTER TABLE "public"."hmr_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_reports" FORCE ROW LEVEL SECURITY;
CREATE POLICY "hmr_reports_owner_isolation" ON "public"."hmr_reports"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

ALTER TABLE "public"."hmr_report_audit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_report_audit" FORCE ROW LEVEL SECURITY;
CREATE POLICY "hmr_report_audit_owner_isolation" ON "public"."hmr_report_audit"
  USING (EXISTS (
    SELECT 1 FROM "public"."hmr_reports" r
    WHERE r.id = "report_id" AND r.owner_id = public.app_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."hmr_reports" r
    WHERE r.id = "report_id" AND r.owner_id = public.app_current_user_id()
  ));
