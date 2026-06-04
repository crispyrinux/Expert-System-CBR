// Simple session-scoped store untuk membawa data antar layar (prototype)
const KEY_SELECTED = "agripakar:selected";
const KEY_HISTORY = "agripakar:history";

export interface HistoryItem {
  date: string;
  diseaseName: string;
  score: number;
}

export function getSelected(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(sessionStorage.getItem(KEY_SELECTED) || "[]"); } catch { return []; }
}
export function setSelected(codes: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY_SELECTED, JSON.stringify(codes));
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
