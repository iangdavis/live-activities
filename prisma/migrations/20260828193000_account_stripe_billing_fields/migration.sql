-- Add Stripe billing columns used by the billing portal and webhook flows.
ALTER TABLE "Account"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionItemId" TEXT;

CREATE INDEX IF NOT EXISTS "Account_stripeCustomerId_idx" ON "Account"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Account_stripeSubscriptionId_idx" ON "Account"("stripeSubscriptionId");
