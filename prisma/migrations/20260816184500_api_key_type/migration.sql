-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('SECRET', 'PUBLIC');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN "type" "ApiKeyType" NOT NULL DEFAULT 'SECRET';
ALTER TABLE "ApiKey" ADD COLUMN "revealedKey" TEXT;

-- CreateIndex
CREATE INDEX "ApiKey_projectId_type_idx" ON "ApiKey"("projectId", "type");
