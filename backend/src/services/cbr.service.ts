import { PrismaClient, CaseSymptom, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export type DiagnosisStatus =
  | "STRONG_DIAGNOSIS"
  | "POSSIBLE_DIAGNOSIS"
  | "NO_DIAGNOSIS";

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
   * Rumus: (Total bobot gejala yang cocok / Total bobot semua gejala pada case) * 100
   */
  calculateCaseSimilarity(
    selectedSymptomIds: string[],
    caseSymptoms: CaseSymptom[]
  ): number {
    if (caseSymptoms.length === 0) return 0;

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const cs of caseSymptoms) {
      totalWeight += cs.weight;
      if (selectedSymptomIds.includes(cs.symptomId)) {
        matchedWeight += cs.weight;
      }
    }

    if (totalWeight === 0) return 0;

    const similarity = (matchedWeight / totalWeight) * 100;
    return Number(similarity.toFixed(2));
  },

  /**
   * Menghitung similarity untuk semua cases yang ada di database
   */
  async calculateAllCases(
    selectedSymptomIds: string[]
  ): Promise<CaseSimilarityResult[]> {
    const cases = await prisma.caseBase.findMany({
      orderBy: { code: "asc" },
      include: {
        disease: true,
        caseSymptoms: true,
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
      const similarity = this.calculateCaseSimilarity(
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
      };
    });

    // Mengurutkan secara menurun (descending) berdasarkan similarity tertinggi
    return results.sort((a, b) => b.similarity - a.similarity);
  },

  /**
   * Mengklasifikasikan diagnosis berdasarkan similarity tertinggi
   */
  classifyDiagnosis(similarity: number): DiagnosisStatus {
    if (similarity >= 70) return "STRONG_DIAGNOSIS";
    if (similarity >= 40) return "POSSIBLE_DIAGNOSIS";
    return "NO_DIAGNOSIS";
  },

  /**
   * Mendeteksi ambiguitas apabila selisih ranking 1 dan 2 < 10%
   */
  detectAmbiguity(top1Sim: number, top2Sim: number, status: DiagnosisStatus): boolean {
    if (status === "NO_DIAGNOSIS") return false;
    return top1Sim - top2Sim < 10;
  },

  /**
   * Menggabungkan semua proses CBR untuk menemukan diagnosis terbaik
   */
  async findBestDiagnosis(
    selectedSymptomIds: string[]
  ): Promise<BestDiagnosisResult> {
    const sortedCases = await this.calculateAllCases(selectedSymptomIds);

    if (sortedCases.length === 0) {
      return {
        disease: null,
        case: null,
        similarity: 0,
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
      status,
      ambiguous,
      topMatches: sortedCases.slice(0, 5), // Menyimpan 5 hasil teratas untuk keperluan history/referensi API
    };
  },
};
