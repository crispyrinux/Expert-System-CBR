-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CandidateCaseStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('DRAFT', 'READY', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomWeight" (
    "id" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseBase" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "solutions" JSONB,
    "approvedFromCandidateCaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSymptom" (
    "id" TEXT NOT NULL,
    "caseBaseId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "patientLabel" VARCHAR(150),
    "notes" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationSymptom" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "weight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisResult" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION,
    "explanation" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateCase" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "CandidateCaseStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateCaseSymptom" (
    "id" TEXT NOT NULL,
    "candidateCaseId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateCaseSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "inputSymptoms" JSONB NOT NULL,
    "expectedDiseaseId" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TestCaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Disease_code_key" ON "Disease"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Symptom_code_key" ON "Symptom"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SymptomWeight_symptomId_key" ON "SymptomWeight"("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseBase_code_key" ON "CaseBase"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CaseBase_approvedFromCandidateCaseId_key" ON "CaseBase"("approvedFromCandidateCaseId");

-- CreateIndex
CREATE INDEX "CaseBase_diseaseId_idx" ON "CaseBase"("diseaseId");

-- CreateIndex
CREATE INDEX "CaseSymptom_symptomId_idx" ON "CaseSymptom"("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSymptom_caseBaseId_symptomId_key" ON "CaseSymptom"("caseBaseId", "symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_code_key" ON "Consultation"("code");

-- CreateIndex
CREATE INDEX "ConsultationSymptom_symptomId_idx" ON "ConsultationSymptom"("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationSymptom_consultationId_symptomId_key" ON "ConsultationSymptom"("consultationId", "symptomId");

-- CreateIndex
CREATE INDEX "DiagnosisResult_consultationId_idx" ON "DiagnosisResult"("consultationId");

-- CreateIndex
CREATE INDEX "DiagnosisResult_diseaseId_idx" ON "DiagnosisResult"("diseaseId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCase_code_key" ON "CandidateCase"("code");

-- CreateIndex
CREATE INDEX "CandidateCase_diseaseId_idx" ON "CandidateCase"("diseaseId");

-- CreateIndex
CREATE INDEX "CandidateCaseSymptom_symptomId_idx" ON "CandidateCaseSymptom"("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateCaseSymptom_candidateCaseId_symptomId_key" ON "CandidateCaseSymptom"("candidateCaseId", "symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_code_key" ON "TestCase"("code");

-- CreateIndex
CREATE INDEX "TestCase_expectedDiseaseId_idx" ON "TestCase"("expectedDiseaseId");

-- AddForeignKey
ALTER TABLE "SymptomWeight" ADD CONSTRAINT "SymptomWeight_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseBase" ADD CONSTRAINT "CaseBase_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseBase" ADD CONSTRAINT "CaseBase_approvedFromCandidateCaseId_fkey" FOREIGN KEY ("approvedFromCandidateCaseId") REFERENCES "CandidateCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSymptom" ADD CONSTRAINT "CaseSymptom_caseBaseId_fkey" FOREIGN KEY ("caseBaseId") REFERENCES "CaseBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSymptom" ADD CONSTRAINT "CaseSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSymptom" ADD CONSTRAINT "ConsultationSymptom_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationSymptom" ADD CONSTRAINT "ConsultationSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisResult" ADD CONSTRAINT "DiagnosisResult_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisResult" ADD CONSTRAINT "DiagnosisResult_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCase" ADD CONSTRAINT "CandidateCase_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCaseSymptom" ADD CONSTRAINT "CandidateCaseSymptom_candidateCaseId_fkey" FOREIGN KEY ("candidateCaseId") REFERENCES "CandidateCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateCaseSymptom" ADD CONSTRAINT "CandidateCaseSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_expectedDiseaseId_fkey" FOREIGN KEY ("expectedDiseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
