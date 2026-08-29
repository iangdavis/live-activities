DO $$
BEGIN
  CREATE TYPE "ApnsVerificationStatus" AS ENUM ('required', 'verified', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "apnsVerificationStatus" "ApnsVerificationStatus" NOT NULL DEFAULT 'required',
  ADD COLUMN IF NOT EXISTS "apnsVerificationError" TEXT,
  ADD COLUMN IF NOT EXISTS "apnsVerifiedAt" TIMESTAMP(3);

UPDATE "Project"
SET
  "apnsVerificationStatus" = CASE
    WHEN "apnsKeyEncrypted" IS NOT NULL
      AND "appleTeamId" IS NOT NULL
      AND "appleKeyId" IS NOT NULL
      AND "bundleId" IS NOT NULL
    THEN 'verified'::"ApnsVerificationStatus"
    ELSE 'required'::"ApnsVerificationStatus"
  END,
  "apnsVerificationError" = NULL,
  "apnsVerifiedAt" = CASE
    WHEN "apnsKeyEncrypted" IS NOT NULL
      AND "appleTeamId" IS NOT NULL
      AND "appleKeyId" IS NOT NULL
      AND "bundleId" IS NOT NULL
    THEN COALESCE("apnsVerifiedAt", "updatedAt")
    ELSE NULL
  END;
