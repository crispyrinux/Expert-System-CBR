import { PrismaClient, CaseSymptom, Prisma, Symptom } from "@prisma/client";

const prisma = new PrismaClient();

export type DiagnosisStatus =
  | "STRONG_DIAGNOSIS"
  | "POSSIBLE_DIAGNOSIS"
  | "NO_DIAGNOSIS";

export interface SymptomMatchDetail {
  symptomId: string;
  symptomCode: string;
  symptomDescription: string;
  isMatched: boolean;
  weight: number;
}

export interface CaseSimilarityResult {
  caseId: string;
  caseCode: string;
  caseTitle: string;
  caseDescription: string | null;
  caseSolutions: string[];
  diseaseId: string;
  diseaseCode: string;
  diseaseName: string;
  similarity: number;
  symptomDetails: SymptomMatchDetail[]; // Field baru untuk tabel
}

export interface BestDiagnosisResult {
  disease: {
    id: string;
    code: string;
    name: string;
  } | null;
  case: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    solutions: string[];
  } | null;
  similarity: number;
  symptomDetails: SymptomMatchDetail[]; // Field baru untuk tabel
  status: DiagnosisStatus;
  ambiguous: boolean;
  topMatches: CaseSimilarityResult[];
}

function normalizeSolutions(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export const cbrService = {
  /**
   * Menghitung similarity antara gejala input dengan satu case tertentu
   * Serta mengembalikan rincian kecocokannya untuk Explanation Facility
   */
  calculateCaseSimilarity(
    selectedSymptomIds: string[],
    caseSymptoms: (CaseSymptom & { symptom: Symptom })[]
  ): { similarity: number; details: SymptomMatchDetail[] } {
    if (caseSymptoms.length === 0) return { similarity: 0, details: [] };

    let totalWeight = 0;
    let matchedWeight = 0;
    const details: SymptomMatchDetail[] = [];

    for (const cs of caseSymptoms) {
      totalWeight += cs.weight;
      const isMatched = selectedSymptomIds.includes(cs.symptomId);
      
      if (isMatched) {
        matchedWeight += cs.weight;
      }

      details.push({
        symptomId: cs.symptomId,
        symptomCode: cs.symptom.code,
        symptomDescription: cs.symptom.description,
        isMatched,
        weight: cs.weight,
      });
    }

    if (totalWeight === 0) return { similarity: 0, details: [] };

    const similarity = (matchedWeight / totalWeight) * 100;
    return { 
      similarity: Number(similarity.toFixed(2)), 
      details 
    };
  },

  async calculateAllCases(
    selectedSymptomIds: string[]
  ): Promise<CaseSimilarityResult[]> {
    const cases = await prisma.caseBase.findMany({
      orderBy: { code: "asc" },
      include: {
        disease: true,
        caseSymptoms: {
          include: {
            symptom: true, // Tarik data master gejala agar bisa ditampilkan teksnya
          }
        },
      },
    });

    const fallbackSolutionsByDiseaseId = new Map<string, string[]>();
    for (const caseBase of cases) {
      const caseSolutions = normalizeSolutions(caseBase.solutions);
      if (caseSolutions.length > 0 && !fallbackSolutionsByDiseaseId.has(caseBase.diseaseId)) {
        fallbackSolutionsByDiseaseId.set(caseBase.diseaseId, caseSolutions);
      }
    }

    const results: CaseSimilarityResult[] = cases.map((caseBase) => {
      // Ambil kembalian berupa skor dan rinciannya
      const { similarity, details } = this.calculateCaseSimilarity(
        selectedSymptomIds,
        caseBase.caseSymptoms
      );
      
      const caseSolutions = normalizeSolutions(caseBase.solutions);

      return {
        caseId: caseBase.id,
        caseCode: caseBase.code,
        caseTitle: caseBase.title,
        caseDescription: caseBase.description,
        caseSolutions: caseSolutions.length > 0
          ? caseSolutions
          : fallbackSolutionsByDiseaseId.get(caseBase.diseaseId) ?? [],
        diseaseId: caseBase.disease.id,
        diseaseCode: caseBase.disease.code,
        diseaseName: caseBase.disease.name,
        similarity,
        symptomDetails: details, // Simpan detail rincian ke array hasil
      };
    });

    return results.sort((a, b) => b.similarity - a.similarity);
  },

  classifyDiagnosis(similarity: number): DiagnosisStatus {
    if (similarity >= 70) return "STRONG_DIAGNOSIS";
    if (similarity >= 40) return "POSSIBLE_DIAGNOSIS";
    return "NO_DIAGNOSIS";
  },

  detectAmbiguity(top1Sim: number, top2Sim: number, status: DiagnosisStatus): boolean {
    if (status === "NO_DIAGNOSIS") return false;
    return top1Sim - top2Sim < 10;
  },

  async findBestDiagnosis(
    selectedSymptomIds: string[]
  ): Promise<BestDiagnosisResult> {
    const sortedCases = await this.calculateAllCases(selectedSymptomIds);

    if (sortedCases.length === 0) {
      return {
        disease: null,
        case: null,
        similarity: 0,
        symptomDetails: [],
        status: "NO_DIAGNOSIS",
        ambiguous: false,
        topMatches: [],
      };
    }

    const bestMatch = sortedCases[0];
    const status = this.classifyDiagnosis(bestMatch.similarity);

    let ambiguous = false;
    if (sortedCases.length > 1) {
      ambiguous = this.detectAmbiguity(
        bestMatch.similarity,
        sortedCases[1].similarity,
        status
      );
    }

    return {
      disease: {
        id: bestMatch.diseaseId,
        code: bestMatch.diseaseCode,
        name: bestMatch.diseaseName,
      },
      case: {
        id: bestMatch.caseId,
        code: bestMatch.caseCode,
        title: bestMatch.caseTitle,
        description: bestMatch.caseDescription,
        solutions: bestMatch.caseSolutions,
      },
      similarity: bestMatch.similarity,
      symptomDetails: bestMatch.symptomDetails, // Oper rincian terbaik ke hasil akhir
      status,
      ambiguous,
      topMatches: sortedCases.slice(0, 5),
    };
  },
};