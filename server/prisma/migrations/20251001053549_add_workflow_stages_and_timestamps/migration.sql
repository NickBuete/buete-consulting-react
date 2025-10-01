-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'DATA_ENTRY';
ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'INTERVIEW';
ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'REPORT_DRAFT';
ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'REPORT_READY';
ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'SENT_TO_PRESCRIBER';
ALTER TYPE "public"."HmrReviewStatus" ADD VALUE 'FOLLOW_UP_DUE';

-- AlterTable
ALTER TABLE "public"."hmr_reviews" ADD COLUMN     "data_entry_started_at" TIMESTAMP(3),
ADD COLUMN     "interview_completed_at" TIMESTAMP(3),
ADD COLUMN     "interview_started_at" TIMESTAMP(3),
ADD COLUMN     "report_drafted_at" TIMESTAMP(3),
ADD COLUMN     "report_finalized_at" TIMESTAMP(3),
ADD COLUMN     "sent_to_prescriber_at" TIMESTAMP(3);
