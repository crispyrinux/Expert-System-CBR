// Simple session-scoped store untuk membawa data antar layar (prototype)
const KEY_CONSULTATION_ID = "agripakar:consultationId";
const KEY_HISTORY = "agripakar:history";

export interface HistoryItem {
  date: string;
  diseaseName: string;
  score: number;
}

export function getConsultationId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY_CONSULTATION_ID);
}

export function setConsultationId(id: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY_CONSULTATION_ID, id);
}

export function clearConsultationId() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY_CONSULTATION_ID);
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_HISTORY) || "[]"); } catch { return []; }
}
export function pushHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;
  const list = [item, ...getHistory()].slice(0, 5);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(list));
}
