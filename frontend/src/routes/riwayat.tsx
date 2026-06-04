import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getHistory, type HistoryItem } from "@/lib/diagnosis-store";

export const Route = createFileRoute("/riwayat")({
  head: () => ({ meta: [{ title: "Riwayat Diagnosa — AgriPakar Padi" }] }),
  component: Riwayat,
});

function Riwayat() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => setItems(getHistory()), []);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <header className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-[60px]" />
          <div className="mb-2 flex items-center gap-3 md:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary-deep shadow-sm">
              <History className="h-7 w-7" />
            </div>
            <div>
              <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Riwayat Diagnosa</h1>
              <p className="mt-1 text-base text-muted-foreground">Catatan kasus terakhir Anda</p>
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/40 p-10 text-center">
            <p className="text-base font-medium text-muted-foreground">Belum ada riwayat diagnosa.</p>
            <Link
              to="/diagnosa"
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-cta"
            >
              <Stethoscope className="h-5 w-5" /> Mulai Diagnosa
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((h, i) => (
              <li key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-soft">
                <div>
                  <p className="text-base font-bold text-foreground">{h.diseaseName}</p>
                  <p className="text-xs font-medium text-muted-foreground">{h.date}</p>
                </div>
                <span className="rounded-full bg-primary/15 px-4 py-1.5 text-sm font-bold text-primary-deep">
                  {Math.round(h.score * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
