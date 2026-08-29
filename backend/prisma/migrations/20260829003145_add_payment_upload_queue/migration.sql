-- CreateEnum
CREATE TYPE "PaymentUploadJobStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "payment_upload_jobs" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "status" "PaymentUploadJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_upload_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_upload_jobs_booking_id_key" ON "payment_upload_jobs"("booking_id");

-- CreateIndex
CREATE INDEX "payment_upload_jobs_status_created_at_idx" ON "payment_upload_jobs"("status", "created_at");
