-- CreateEnum
CREATE TYPE "public"."HmrReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LivingArrangement" AS ENUM ('ALONE', 'WITH_FAMILY', 'WITH_CARER', 'RESIDENTIAL_AGED_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SymptomType" AS ENUM ('DIZZINESS', 'FALLS', 'DROWSINESS', 'NAUSEA', 'HEADACHE', 'PAIN', 'MOBILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."ActionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MedicationStatus" AS ENUM ('CURRENT', 'CEASED', 'NEEDS_REVIEW', 'OTC');

-- CreateTable
CREATE TABLE "public"."clinics" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "contact_email" VARCHAR(150),
    "contact_phone" VARCHAR(50),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "suburb" VARCHAR(100),
    "state" VARCHAR(100),
    "postcode" VARCHAR(10),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescribers" (
    "id" SERIAL NOT NULL,
    "clinic_id" INTEGER,
    "honorific" VARCHAR(30),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "provider_number" VARCHAR(50),
    "contact_email" VARCHAR(150),
    "contact_phone" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "prescribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "preferred_name" VARCHAR(100),
    "date_of_birth" DATE,
    "contact_email" VARCHAR(150),
    "contact_phone" VARCHAR(50),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "suburb" VARCHAR(100),
    "state" VARCHAR(100),
    "postcode" VARCHAR(10),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(50),
    "medicare_number" VARCHAR(50),
    "lives_alone" BOOLEAN,
    "living_arrangement" "public"."LivingArrangement",
    "uses_webster" BOOLEAN,
    "other_supports" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medications" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "form" VARCHAR(100),
    "strength" VARCHAR(100),
    "route" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_reviews" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "prescriber_id" INTEGER,
    "clinic_id" INTEGER,
    "referred_by" VARCHAR(150),
    "referral_date" DATE,
    "referral_reason" TEXT,
    "referral_notes" TEXT,
    "status" "public"."HmrReviewStatus" NOT NULL DEFAULT 'PENDING',
    "accepted_at" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "calendar_event_id" VARCHAR(255),
    "visit_location" VARCHAR(255),
    "visit_notes" TEXT,
    "assessment_summary" TEXT,
    "past_medical_history" TEXT,
    "allergies" TEXT,
    "pathology" TEXT,
    "medical_goals" TEXT,
    "goal_barriers" TEXT,
    "living_arrangement" "public"."LivingArrangement",
    "uses_webster" BOOLEAN,
    "lives_alone" BOOLEAN,
    "other_supports" TEXT,
    "follow_up_due_at" DATE,
    "claimed_at" TIMESTAMP(3),
    "report_url" VARCHAR(255),
    "report_body" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_medications" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "medication_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "dose" VARCHAR(255),
    "frequency" VARCHAR(255),
    "indication" TEXT,
    "status" "public"."MedicationStatus" NOT NULL DEFAULT 'CURRENT',
    "is_new" BOOLEAN,
    "is_changed" BOOLEAN,
    "notes" TEXT,
    "verification_required" BOOLEAN,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_symptoms" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "symptom" "public"."SymptomType" NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "severity" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_action_items" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "priority" "public"."ActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."ActionStatus" NOT NULL DEFAULT 'OPEN',
    "due_date" TIMESTAMP(3),
    "assigned_to_user_id" INTEGER,
    "resolution_notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "hmr_action_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_attachments" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150),
    "storage_path" VARCHAR(500) NOT NULL,
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hmr_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hmr_audit_logs" (
    "id" SERIAL NOT NULL,
    "hmr_review_id" INTEGER NOT NULL,
    "changed_by_user_id" INTEGER,
    "change_type" VARCHAR(150) NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hmr_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prescribers_clinic_id_idx" ON "public"."prescribers"("clinic_id");

-- CreateIndex
CREATE INDEX "patients_client_id_idx" ON "public"."patients"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "medications_name_key" ON "public"."medications"("name");

-- CreateIndex
CREATE INDEX "hmr_reviews_patient_id_idx" ON "public"."hmr_reviews"("patient_id");

-- CreateIndex
CREATE INDEX "hmr_reviews_prescriber_id_idx" ON "public"."hmr_reviews"("prescriber_id");

-- CreateIndex
CREATE INDEX "hmr_reviews_clinic_id_idx" ON "public"."hmr_reviews"("clinic_id");

-- CreateIndex
CREATE INDEX "hmr_medications_hmr_review_id_idx" ON "public"."hmr_medications"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_medications_medication_id_idx" ON "public"."hmr_medications"("medication_id");

-- CreateIndex
CREATE UNIQUE INDEX "hmr_symptoms_hmr_review_id_symptom_key" ON "public"."hmr_symptoms"("hmr_review_id", "symptom");

-- CreateIndex
CREATE INDEX "hmr_action_items_hmr_review_id_idx" ON "public"."hmr_action_items"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_action_items_assigned_to_user_id_idx" ON "public"."hmr_action_items"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "hmr_attachments_hmr_review_id_idx" ON "public"."hmr_attachments"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_attachments_uploaded_by_user_id_idx" ON "public"."hmr_attachments"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "hmr_audit_logs_hmr_review_id_idx" ON "public"."hmr_audit_logs"("hmr_review_id");

-- CreateIndex
CREATE INDEX "hmr_audit_logs_changed_by_user_id_idx" ON "public"."hmr_audit_logs"("changed_by_user_id");

-- AddForeignKey
ALTER TABLE "public"."prescribers" ADD CONSTRAINT "prescribers_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_reviews" ADD CONSTRAINT "hmr_reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_reviews" ADD CONSTRAINT "hmr_reviews_prescriber_id_fkey" FOREIGN KEY ("prescriber_id") REFERENCES "public"."prescribers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_reviews" ADD CONSTRAINT "hmr_reviews_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_medications" ADD CONSTRAINT "hmr_medications_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_medications" ADD CONSTRAINT "hmr_medications_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_symptoms" ADD CONSTRAINT "hmr_symptoms_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_action_items" ADD CONSTRAINT "hmr_action_items_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_action_items" ADD CONSTRAINT "hmr_action_items_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_attachments" ADD CONSTRAINT "hmr_attachments_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_attachments" ADD CONSTRAINT "hmr_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_audit_logs" ADD CONSTRAINT "hmr_audit_logs_hmr_review_id_fkey" FOREIGN KEY ("hmr_review_id") REFERENCES "public"."hmr_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hmr_audit_logs" ADD CONSTRAINT "hmr_audit_logs_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
