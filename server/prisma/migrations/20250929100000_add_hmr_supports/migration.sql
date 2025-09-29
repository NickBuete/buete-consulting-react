-- HMR education advice table
CREATE TABLE "public"."hmr_education_advice" (
    "id" SERIAL PRIMARY KEY,
    "owner_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "advice" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL
);

ALTER TABLE "public"."hmr_education_advice"
  ADD CONSTRAINT "hmr_education_advice_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."hmr_education_advice"
  ADD CONSTRAINT "hmr_education_advice_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "hmr_education_advice_owner_id_idx" ON "public"."hmr_education_advice" ("owner_id");
CREATE INDEX "hmr_education_advice_review_id_idx" ON "public"."hmr_education_advice" ("review_id");

-- HMR recommendations table
CREATE TABLE "public"."hmr_recommendations" (
    "id" SERIAL PRIMARY KEY,
    "owner_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL
);

ALTER TABLE "public"."hmr_recommendations"
  ADD CONSTRAINT "hmr_recommendations_owner_id_fkey"
  FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."hmr_recommendations"
  ADD CONSTRAINT "hmr_recommendations_review_id_fkey"
  FOREIGN KEY ("review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "hmr_recommendations_owner_id_idx" ON "public"."hmr_recommendations" ("owner_id");
CREATE INDEX "hmr_recommendations_review_id_idx" ON "public"."hmr_recommendations" ("review_id");

-- Row level security
ALTER TABLE "public"."hmr_education_advice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_education_advice" FORCE ROW LEVEL SECURITY;
CREATE POLICY "hmr_education_owner_isolation" ON "public"."hmr_education_advice"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());

ALTER TABLE "public"."hmr_recommendations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."hmr_recommendations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "hmr_recommendations_owner_isolation" ON "public"."hmr_recommendations"
  USING ("owner_id" = public.app_current_user_id())
  WITH CHECK ("owner_id" = public.app_current_user_id());
