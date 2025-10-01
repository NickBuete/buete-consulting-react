/*
  Warnings:

  - A unique constraint covering the columns `[name,strength,form]` on the table `medications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."medications_name_key";

-- AlterTable
ALTER TABLE "public"."medications" ADD COLUMN     "generic_name" VARCHAR(255),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."medication_indications" (
    "id" SERIAL NOT NULL,
    "medication_id" INTEGER NOT NULL,
    "indication" VARCHAR(255) NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "medication_indications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medication_indications_medication_id_idx" ON "public"."medication_indications"("medication_id");

-- CreateIndex
CREATE INDEX "medication_indications_indication_idx" ON "public"."medication_indications"("indication");

-- CreateIndex
CREATE UNIQUE INDEX "medication_indications_medication_id_indication_key" ON "public"."medication_indications"("medication_id", "indication");

-- CreateIndex
CREATE INDEX "medications_name_idx" ON "public"."medications"("name");

-- CreateIndex
CREATE INDEX "medications_generic_name_idx" ON "public"."medications"("generic_name");

-- CreateIndex
CREATE UNIQUE INDEX "medications_name_strength_form_key" ON "public"."medications"("name", "strength", "form");

-- AddForeignKey
ALTER TABLE "public"."medication_indications" ADD CONSTRAINT "medication_indications_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
