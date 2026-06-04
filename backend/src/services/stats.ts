import { PrismaClient } from '@prisma/client';
import { cbrService } from './cbr.service.js';

const prisma = new PrismaClient();

async function runStats() {
  console.log("=== KNOWLEDGE BASE STATS ===");
  
  const totalDisease = await prisma.disease.count();
  const totalSymptoms = await prisma.symptom.count();
  const totalCases = await prisma.caseBase.count();
  const totalCaseSymptoms = await prisma.caseSymptom.count();
  
  const avgSymptomsPerCase = totalCases > 0 ? (totalCaseSymptoms / totalCases).toFixed(2) : 0;
  
  console.log(`Total Disease: ${totalDisease}`);
  console.log(`Total Symptoms: ${totalSymptoms}`);
  console.log(`Total Cases: ${totalCases}`);
  console.log(`Total CaseSymptoms: ${totalCaseSymptoms}`);
  console.log(`Rata-rata gejala per case: ${avgSymptomsPerCase}`);
  
  console.log("\n=== CONTOH OUTPUT findBestDiagnosis() ===");
  
  // Menggunakan Test Case 1: G46, G47, G50, G45 -> HP13
  // Perlu mencari ID gejala-gejala ini
  const symptoms = await prisma.symptom.findMany({
    where: {
      code: {
        in: ['G46', 'G47', 'G50', 'G45']
      }
    }
  });
  
  const symptomIds = symptoms.map(s => s.id);
  const result = await cbrService.findBestDiagnosis(symptomIds);
  
  console.log(JSON.stringify(result, null, 2));

  await prisma.$disconnect();
}

runStats().catch(e => {
  console.error(e);
  process.exit(1);
});
