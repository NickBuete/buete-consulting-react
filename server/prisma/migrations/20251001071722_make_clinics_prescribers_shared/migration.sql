/*
  Warnings:

  - You are about to drop the column `owner_id` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `prescribers` table. All the data in the column will be lost.

*/

-- Drop RLS policies that depend on owner_id
DROP POLICY IF EXISTS "clinics_owner_isolation" ON "public"."clinics";
DROP POLICY IF EXISTS "prescribers_owner_isolation" ON "public"."prescribers";

-- Disable RLS on these tables as they are now globally shared
ALTER TABLE "public"."clinics" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prescribers" DISABLE ROW LEVEL SECURITY;

-- DropForeignKey
ALTER TABLE "public"."clinics" DROP CONSTRAINT "clinics_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."prescribers" DROP CONSTRAINT "prescribers_owner_id_fkey";

-- DropIndex
DROP INDEX "public"."clinics_owner_id_idx";

-- DropIndex
DROP INDEX "public"."prescribers_owner_id_idx";

-- AlterTable
ALTER TABLE "public"."clinics" DROP COLUMN "owner_id";

-- AlterTable
ALTER TABLE "public"."prescribers" DROP COLUMN "owner_id";
