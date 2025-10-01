-- CreateTable
CREATE TABLE "public"."hmr_medical_history" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "year" VARCHAR(10),
    "condition" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_medical_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_allergies" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "allergen" VARCHAR(255) NOT NULL,
    "reaction" VARCHAR(255),
    "severity" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_pathology" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "date" VARCHAR(50),
    "test" VARCHAR(255) NOT NULL,
    "result" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_pathology_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hmr_medical_history_hmr_review_id_idx" ON "public"."hmr_medical_history"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_allergies_hmr_review_id_idx" ON "public"."hmr_allergies"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_pathology_hmr_review_id_idx" ON "public"."hmr_pathology"("hmr_review_id");

-- AddForeignKey
ALTER TABLE "public"."hmr_medical_history" ADD CONSTRAINT "hmr_medical_history_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_allergies" ADD CONSTRAINT "hmr_allergies_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_pathology" ADD CONSTRAINT "hmr_pathology_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
