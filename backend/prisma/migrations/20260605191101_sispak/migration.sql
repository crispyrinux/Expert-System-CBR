/*
  Warnings:

  - A unique constraint covering the columns `[consultationId]` on the table `CandidateCase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CandidateCase" ADD COLUMN     "consultationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCase_consultationId_key" ON "CandidateCase"("consultationId");

-- AddForeignKey
ALTER TABLE "CandidateCase" ADD CONSTRAINT "CandidateCase_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
