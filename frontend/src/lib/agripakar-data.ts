// Knowledge base AgriPakar Padi (Connected to JSON Database)
import penyakitData from "../../../json/penyakit.json";
import bobotGejalaData from "../../../json/bobot_gejala.json";
import basisKasusData from "../../../json/basis_kasus.json";

export type SymptomCategory = "Daun" | "Batang" | "Akar" | "Malai/Bulir";

export interface Symptom {
  code: string;
  weight: number;
  text: string;
  category: SymptomCategory;
  icon: string; // emoji as lightweight visual cue
}

export interface Disease {
  code: string;
  name: string;
}

export interface CaseRecord {
  id: string;
  diseaseCode: string;
  diseaseName: string;
  symptoms: string[];
  solution: string[];
}

export const CATEGORIES: SymptomCategory[] = ["Daun", "Batang", "Akar", "Malai/Bulir"];

export const DISEASES: Disease[] = penyakitData.map((d: any) => ({
  code: d.kode_unik,
  name: d.nama_penyakit,
}));

// Helper to auto-assign category & icon for UI aesthetics based on symptom text
function getCategoryAndIcon(text: string): { category: SymptomCategory; icon: string } {
  const t = text.toLowerCase();
  if (t.includes("akar")) return { category: "Akar", icon: "🪱" };
  if (t.includes("batang") || t.includes("pelepah") || t.includes("tunas") || t.includes("anakan")) return { category: "Batang", icon: "🌾" };
  if (t.includes("malai") || t.includes("bulir") || t.includes("gabah") || t.includes("biji") || t.includes("buah") || t.includes("kecambah") || t.includes("spora") || t.includes("ngengat")) return { category: "Malai/Bulir", icon: "🌱" };
  return { category: "Daun", icon: "🍃" }; // default fallback to Daun
}

export const SYMPTOMS: Symptom[] = bobotGejalaData.map((g: any) => {
  const { category, icon } = getCategoryAndIcon(g.keterangan);
  return {
    code: g.kode_gejala,
    weight: g.bobot,
    text: g.keterangan,
    category,
    icon,
  };
});

export const CASES: CaseRecord[] = basisKasusData.map((c: any) => {
  // Extract "Bercak dan Daun Cokelat (HP01)" -> name: "Bercak dan Daun Cokelat", code: "HP01"
  const match = c.diagnosis.match(/(.+?)\s*\((\w+)\)/);
  const diseaseName = match ? match[1].trim() : c.diagnosis;
  const diseaseCode = match ? match[2] : "";

  return {
    id: c.id_case,
    diseaseCode,
    diseaseName,
    symptoms: c.gejala,
    solution: c.solusi,
  };
});

// Nearest Neighbor similarity (Jaccard)
export interface DiagnosisResult {
  caseRecord: CaseRecord;
  score: number; // 0..1
  matched: string[];
  missing: string[]; // di case tapi tidak dipilih user
  extra: string[];   // dipilih user tapi tidak di case
}

export function diagnose(selected: string[]): DiagnosisResult[] {
  const sel = new Set(selected);
  const results = CASES.map((c) => {
    const caseSet = new Set(c.symptoms);
    const matched = c.symptoms.filter((s) => sel.has(s));
    const missing = c.symptoms.filter((s) => !sel.has(s));
    const extra = selected.filter((s) => !caseSet.has(s));
    const union = new Set([...c.symptoms, ...selected]);
    const score = union.size === 0 ? 0 : matched.length / union.size;
    return { caseRecord: c, score, matched, missing, extra };
  });
  return results.sort((a, b) => b.score - a.score);
}

export function getSymptom(code: string): Symptom | undefined {
  return SYMPTOMS.find((s) => s.code === code);
}
