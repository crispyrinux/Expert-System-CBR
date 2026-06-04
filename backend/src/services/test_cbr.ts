import { PrismaClient } from '@prisma/client';
import { cbrService } from './cbr.service.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDir = path.resolve(__dirname, '../../../json');

async function runTests() {
  console.log("=== Starting CBR Engine Unit Tests ===\n");
  
  // 1. Load test cases from JSON
  const testCasesContent = await fs.readFile(path.join(jsonDir, 'test_case.json'), 'utf8');
  const testCases = JSON.parse(testCasesContent);
  
  // 2. Fetch all symptoms to map codes to IDs
  const symptomsDb = await prisma.symptom.findMany();
  const symptomCodeToIdMap = new Map();
  symptomsDb.forEach(s => symptomCodeToIdMap.set(s.code, s.id));
  
  // 3. Fetch all diseases to map IDs back to codes for easy reading
  const diseasesDb = await prisma.disease.findMany();
  const diseaseIdToCodeMap = new Map();
  diseasesDb.forEach(d => diseaseIdToCodeMap.set(d.id, d.code));
  
  let passed = 0;
  let failed = 0;
  
  for (const tc of testCases) {
    const inputCodes: string[] = tc.gejala_input;
    const expectedDiseaseCode: string = tc.expected_result;
    
    // Map symptom codes to IDs
    const inputIds = inputCodes.map((code: string) => symptomCodeToIdMap.get(code)).filter(Boolean);
    
    // Run the engine
    const result = await cbrService.findBestDiagnosis(inputIds);
    
    const predictedDiseaseCode = result.disease ? diseaseIdToCodeMap.get(result.disease.id) : 'NONE';
    const isPass = predictedDiseaseCode === expectedDiseaseCode;
    
    if (isPass) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`Test Case: ${tc.id_test}`);
    console.log(`Input: ${inputCodes.join(', ')}`);
    console.log(`Expected: ${expectedDiseaseCode}`);
    console.log(`Predicted: ${predictedDiseaseCode} (Case: ${result.case?.code ?? 'N/A'})`);
    console.log(`Similarity: ${result.similarity}%`);
    console.log(`Status: ${result.status} | Ambiguous: ${result.ambiguous}`);
    
    if (result.topMatches.length > 1) {
       console.log(`Top 2 matches: [1] ${result.topMatches[0].caseCode} (${result.topMatches[0].similarity}%) vs [2] ${result.topMatches[1].caseCode} (${result.topMatches[1].similarity}%)`);
    }

    console.log(`Result: ${isPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('----------------------------------------------------');
  }
  
  console.log(`\n=== Test Summary ===`);
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  await prisma.$disconnect();
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
