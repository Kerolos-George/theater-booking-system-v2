-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "entry_code_used_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "bookings_entry_code_idx" ON "bookings"("entry_code");
