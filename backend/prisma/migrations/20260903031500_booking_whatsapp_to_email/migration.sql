-- Rename whatsapp column to email
ALTER TABLE "bookings" RENAME COLUMN "whatsapp" TO "email";

-- Replace index
DROP INDEX IF EXISTS "bookings_whatsapp_idx";
CREATE INDEX "bookings_email_idx" ON "bookings"("email");
