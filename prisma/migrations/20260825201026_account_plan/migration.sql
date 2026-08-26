-- CreateEnum
CREATE TYPE "AccountPlan" AS ENUM ('free', 'paid');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN "plan" "AccountPlan" NOT NULL DEFAULT 'free';
