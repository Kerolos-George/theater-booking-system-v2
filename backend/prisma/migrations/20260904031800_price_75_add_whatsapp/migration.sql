-- AlterTable
ALTER TABLE "sections" ALTER COLUMN "price" SET DEFAULT 75;

-- Update existing section prices
UPDATE "sections" SET "price" = 75;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- Backfill existing rows (email was used previously as contact channel)
UPDATE "bookings" SET "whatsapp" = '' WHERE "whatsapp" IS NULL;

-- Make required
ALTER TABLE "bookings" ALTER COLUMN "whatsapp" SET NOT NULL;
