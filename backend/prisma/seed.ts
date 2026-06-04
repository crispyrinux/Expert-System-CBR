import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DiseaseJson = {
  kode_unik: string;
  nama_penyakit: string;
};

type SymptomJson = {
  kode_unik: string;
  gejala: string;
};

type SymptomWeightJson = {
  kode_gejala: string;
  bobot: number | string;
  keterangan?: string;
};

type CaseBaseJson = {
  id_case: string;
  diagnosis: string;
  gejala: string[];
  bobot_gejala?: Array<number | string>;
  solusi?: string[];
};

type TestCaseJson = {
  id_test: string;
  gejala_input: string[];
  expected_result: string;
};

type ModelCounts = {
  disease: number;
  symptom: number;
  symptomWeight: number;
  caseBase: number;
  caseSymptom: number;
  testCase: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDir = path.resolve(__dirname, "../../json");

const readJson = async <T>(fileName: string): Promise<T> => {
  const filePath = path.join(jsonDir, fileName);
  const content = await readFile(filePath, "utf8");

  return JSON.parse(content) as T;
};

const normalizeCode = (value: string): string => value.trim().toUpperCase();

const toWeight = (value: number | string, context: string): number => {
  const weight = Number(value);

  if (!Number.isFinite(weight)) {
    throw new Error(`Bobot tidak valid untuk ${context}: ${value}`);
  }

  return weight;
};

const extractDiseaseCode = (diagnosis: string): string => {
  const matchedCode = diagnosis.match(/\bHP\d+\b/i)?.[0];

  if (!matchedCode) {
    throw new Error(`Kode penyakit tidak ditemukan dari diagnosis: ${diagnosis}`);
  }

  return normalizeCode(matchedCode);
};

const indexByCode = <T extends { id: string; code: string }>(items: T[]) =>
  new Map(items.map((item) => [item.code, item]));

const seedDiseases = async (diseases: DiseaseJson[]) => {
  for (const disease of diseases) {
    const code = normalizeCode(disease.kode_unik);

    await prisma.disease.upsert({
      where: { code },
      update: {
        name: disease.nama_penyakit,
      },
      create: {
        code,
        name: disease.nama_penyakit,
      },
    });
  }
};

const seedSymptoms = async (symptoms: SymptomJson[]) => {
  for (const symptom of symptoms) {
    const code = normalizeCode(symptom.kode_unik);

    await prisma.symptom.upsert({
      where: { code },
      update: {
        description: symptom.gejala,
      },
      create: {
        code,
        description: symptom.gejala,
      },
    });
  }
};

const seedSymptomWeights = async (
  symptomWeights: SymptomWeightJson[],
  symptomMap: Map<string, { id: string; code: string }>,
) => {
  for (const symptomWeight of symptomWeights) {
    const symptomCode = normalizeCode(symptomWeight.kode_gejala);
    const symptom = symptomMap.get(symptomCode);

    if (!symptom) {
      throw new Error(`Symptom tidak ditemukan untuk bobot: ${symptomCode}`);
    }

    const weight = toWeight(symptomWeight.bobot, `bobot gejala ${symptomCode}`);
    const note = symptomWeight.keterangan ?? null;

    await prisma.symptomWeight.upsert({
      where: { symptomId: symptom.id },
      update: {
        weight,
        note,
      },
      create: {
        symptomId: symptom.id,
        weight,
        note,
      },
    });
  }
};

const seedCaseBases = async (
  caseBases: CaseBaseJson[],
  diseaseMap: Map<string, { id: string; code: string }>,
) => {
  for (const caseBase of caseBases) {
    const code = normalizeCode(caseBase.id_case);
    const diseaseCode = extractDiseaseCode(caseBase.diagnosis);
    const disease = diseaseMap.get(diseaseCode);

    if (!disease) {
      throw new Error(`Disease tidak ditemukan untuk case ${code}: ${diseaseCode}`);
    }

    await prisma.caseBase.upsert({
      where: { code },
      update: {
        diseaseId: disease.id,
        title: caseBase.diagnosis,
        solutions: (caseBase.solusi ?? []) as Prisma.InputJsonValue,
      },
      create: {
        code,
        diseaseId: disease.id,
        title: caseBase.diagnosis,
        solutions: (caseBase.solusi ?? []) as Prisma.InputJsonValue,
      },
    });
  }
};

const seedCaseSymptoms = async (
  caseBases: CaseBaseJson[],
  caseBaseMap: Map<string, { id: string; code: string }>,
  symptomMap: Map<string, { id: string; code: string }>,
  symptomWeightMap: Map<string, number>,
) => {
  for (const caseBase of caseBases) {
    const caseCode = normalizeCode(caseBase.id_case);
    const persistedCaseBase = caseBaseMap.get(caseCode);

    if (!persistedCaseBase) {
      throw new Error(`CaseBase tidak ditemukan: ${caseCode}`);
    }

    for (const [index, rawSymptomCode] of caseBase.gejala.entries()) {
      const symptomCode = normalizeCode(rawSymptomCode);
      const symptom = symptomMap.get(symptomCode);

      if (!symptom) {
        throw new Error(`Symptom tidak ditemukan untuk case ${caseCode}: ${symptomCode}`);
      }

      const rawWeight = caseBase.bobot_gejala?.[index] ?? symptomWeightMap.get(symptomCode);

      if (rawWeight === undefined) {
        throw new Error(`Bobot tidak ditemukan untuk ${caseCode} - ${symptomCode}`);
      }

      const weight = toWeight(rawWeight, `case ${caseCode} gejala ${symptomCode}`);

      await prisma.caseSymptom.upsert({
        where: {
          caseBaseId_symptomId: {
            caseBaseId: persistedCaseBase.id,
            symptomId: symptom.id,
          },
        },
        update: {
          weight,
        },
        create: {
          caseBaseId: persistedCaseBase.id,
          symptomId: symptom.id,
          weight,
        },
      });
    }
  }
};

const seedTestCases = async (
  testCases: TestCaseJson[],
  diseaseMap: Map<string, { id: string; code: string }>,
) => {
  for (const testCase of testCases) {
    const code = normalizeCode(testCase.id_test);
    const expectedDiseaseCode = normalizeCode(testCase.expected_result);
    const expectedDisease = diseaseMap.get(expectedDiseaseCode);

    if (!expectedDisease) {
      throw new Error(`Expected disease tidak ditemukan untuk test case ${code}: ${expectedDiseaseCode}`);
    }

    const isAmbiguousTc15 = code === "TC15" && expectedDiseaseCode === "HP07";
    const notes = isAmbiguousTc15
      ? "Expected lama HP07, tetapi input gejala terlalu umum. Schema saat ini belum memiliki status NO_DIAGNOSIS/UNDIAGNOSED dan expectedDiseaseId masih wajib."
      : null;

    await prisma.testCase.upsert({
      where: { code },
      update: {
        title: `Test case ${code}`,
        inputSymptoms: testCase.gejala_input as Prisma.InputJsonValue,
        expectedDiseaseId: expectedDisease.id,
        status: isAmbiguousTc15 ? "DRAFT" : "READY",
        notes,
      },
      create: {
        code,
        title: `Test case ${code}`,
        inputSymptoms: testCase.gejala_input as Prisma.InputJsonValue,
        expectedDiseaseId: expectedDisease.id,
        status: isAmbiguousTc15 ? "DRAFT" : "READY",
        notes,
      },
    });
  }
};

const getCounts = async (): Promise<ModelCounts> => {
  const [
    disease,
    symptom,
    symptomWeight,
    caseBase,
    caseSymptom,
    testCase,
  ] = await Promise.all([
    prisma.disease.count(),
    prisma.symptom.count(),
    prisma.symptomWeight.count(),
    prisma.caseBase.count(),
    prisma.caseSymptom.count(),
    prisma.testCase.count(),
  ]);

  return {
    disease,
    symptom,
    symptomWeight,
    caseBase,
    caseSymptom,
    testCase,
  };
};

const main = async () => {
  const [diseases, symptoms, symptomWeights, caseBases, testCases] =
    await Promise.all([
      readJson<DiseaseJson[]>("penyakit.json"),
      readJson<SymptomJson[]>("gejala.json"),
      readJson<SymptomWeightJson[]>("bobot_gejala.json"),
      readJson<CaseBaseJson[]>("basis_kasus.json"),
      readJson<TestCaseJson[]>("test_case.json"),
    ]);

  await seedDiseases(diseases);
  await seedSymptoms(symptoms);

  const diseaseMap = indexByCode(
    await prisma.disease.findMany({
      select: { id: true, code: true },
    }),
  );
  const symptomMap = indexByCode(
    await prisma.symptom.findMany({
      select: { id: true, code: true },
    }),
  );
  const symptomWeightMap = new Map(
    symptomWeights.map((item) => [
      normalizeCode(item.kode_gejala),
      toWeight(item.bobot, `bobot gejala ${item.kode_gejala}`),
    ]),
  );

  await seedSymptomWeights(symptomWeights, symptomMap);
  await seedCaseBases(caseBases, diseaseMap);

  const caseBaseMap = indexByCode(
    await prisma.caseBase.findMany({
      select: { id: true, code: true },
    }),
  );

  await seedCaseSymptoms(caseBases, caseBaseMap, symptomMap, symptomWeightMap);
  await seedTestCases(testCases, diseaseMap);

  const counts = await getCounts();

  console.log("Seed data awal Sistem Pakar Padi CBR selesai.");
  console.table(counts);
};

main()
  .catch((error) => {
    console.error("Seed gagal:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
