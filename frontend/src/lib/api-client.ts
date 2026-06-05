const rawApiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");
const API_BASE_URL = normalizedApiBaseUrl.endsWith("/api")
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api`;

async function parseErrorResponse(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    return new Error(data.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    throw await parseErrorResponse(res, `Request failed: ${path}`);
  }
  return res.json() as Promise<T>;
}

async function requestEmpty(path: string, init?: RequestInit): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    throw await parseErrorResponse(res, `Request failed: ${path}`);
  }
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface Symptom {
  id: string;
  code: string;
  description: string;
}

export interface ConsultationResponse {
  consultationId: string;
  status: string;
}

export interface DiagnosisResult {
  consultationId: string;
  status: string;
  diagnosis: {
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
    status: string;
    ambiguous: boolean;
  };
  topMatches: Array<{
    caseCode: string;
    diseaseName: string;
    similarity: number;
  }>;
}

export interface CandidateSummary {
  id: string;
  code: string;
  disease: string;
  symptomCount: number;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface CandidateDetail {
  id: string;
  code: string;
  consultationId: string | null;
  diseaseId: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  consultation: {
    code: string;
    createdAt: string;
  } | null;
  disease: {
    id: string;
    code: string;
    name: string;
    description: string | null;
  };
  candidateCaseSymptoms: Array<{
    id: string;
    candidateCaseId: string;
    symptomId: string;
    weight: number;
    symptom: Symptom;
  }>;
}

export interface CandidateActionResponse {
  message: string;
  caseId?: string;
  code?: string;
}

export const api = {
  async health(): Promise<HealthResponse> {
    return requestJson<HealthResponse>("/health");
  },

  async getSymptoms(): Promise<Symptom[]> {
    return requestJson<Symptom[]>("/master/symptoms");
  },

  async createConsultation(): Promise<ConsultationResponse> {
    return requestJson<ConsultationResponse>("/consultations", {
      method: "POST",
    });
  },

  async addSymptoms(consultationId: string, symptomIds: string[]): Promise<void> {
    return requestEmpty(`/consultations/${consultationId}/symptoms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptomIds }),
    });
  },

  async getDiagnosis(consultationId: string): Promise<DiagnosisResult> {
    return requestJson<DiagnosisResult>(`/consultations/${consultationId}/diagnose`);
  },

  async confirmDiagnosis(consultationId: string): Promise<CandidateActionResponse> {
    return requestJson<CandidateActionResponse>(`/consultations/${consultationId}/confirm`, {
      method: "POST",
    });

  },

  async getCandidates(): Promise<CandidateSummary[]> {
    return requestJson<CandidateSummary[]>("/admin/candidates");
  },

  async getCandidateDetail(candidateId: string): Promise<CandidateDetail> {
    return requestJson<CandidateDetail>(`/admin/candidates/${candidateId}`);
  },

  async approveCandidate(candidateId: string): Promise<CandidateActionResponse> {
    return requestJson<CandidateActionResponse>(`/admin/candidates/${candidateId}/approve`, {
      method: "POST",
    });
  },

  async rejectCandidate(candidateId: string): Promise<CandidateActionResponse> {
    return requestJson<CandidateActionResponse>(`/admin/candidates/${candidateId}/reject`, {
      method: "POST",
    });
  },
};
