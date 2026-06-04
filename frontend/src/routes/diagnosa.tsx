import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Calculator, Search, X, Check, Leaf, Sprout, Wheat, Flower2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SYMPTOMS, CATEGORIES, type SymptomCategory } from "@/lib/agripakar-data";
import { setSelected } from "@/lib/diagnosis-store";

const CAT_ICONS: Record<SymptomCategory, { icon: any; bg: string; text: string }> = {
  "Daun": { icon: Leaf, bg: "bg-primary/10", text: "text-primary-deep" },
  "Batang": { icon: Flower2, bg: "bg-primary/10", text: "text-primary-deep" },
  "Akar": { icon: Sprout, bg: "bg-primary/10", text: "text-primary-deep" },
  "Malai/Bulir": { icon: Wheat, bg: "bg-primary/10", text: "text-primary-deep" },
};

export const Route = createFileRoute("/diagnosa")({
  head: () => ({ meta: [{ title: "Input Gejala — AgriPakar Padi" }] }),
  component: Diagnosa,
});

function Diagnosa() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<SymptomCategory, boolean>>({
    "Daun": true, "Batang": false, "Akar": false, "Malai/Bulir": false,
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return SYMPTOMS;
    const q = query.toLowerCase();
    return SYMPTOMS.filter((s) => s.text.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const m: Record<SymptomCategory, typeof SYMPTOMS> = { "Daun": [], "Batang": [], "Akar": [], "Malai/Bulir": [] };
    filtered.forEach((s) => m[s.category].push(s));
    return m;
  }, [filtered]);

  function toggle(code: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  function handleSubmit() {
    if (picked.size === 0) return;
    setSelected(Array.from(picked));
    navigate({ to: "/proses" });
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <header className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-[60px]" />
          <div className="mb-2 flex items-center gap-3 md:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary-deep shadow-sm">
              <Search className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Langkah 1 dari 3 · Retrieve</p>
              <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Pilih Gejala</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Centang seluruh gejala yang terlihat pada tanaman padi Anda. Semakin lengkap gejala yang dipilih, semakin akurat hasil diagnosanya.
          </p>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari gejala (contoh: bercak coklat, daun layu...)"
            className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base font-medium shadow-soft placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Accordion categories */}
        <div className="space-y-3 pb-32">
          {CATEGORIES.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            const isOpen = open[cat] || query.trim().length > 0;
            const countPicked = items.filter((i) => picked.has(i.code)).length;
            return (
              <section key={cat} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                <button
                  onClick={() => setOpen((p) => ({ ...p, [cat]: !p[cat] }))}
                  className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <CatBadge category={cat} />
                    <div>
                      <h2 className="text-lg font-bold text-foreground md:text-xl">Gejala {cat}</h2>
                      <p className="text-xs font-medium text-muted-foreground md:text-sm">
                        {items.length} gejala{countPicked > 0 && ` · ${countPicked} dipilih`}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-6 w-6 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <ul className="divide-y divide-border border-t border-border">
                    {items.map((s) => {
                      const checked = picked.has(s.code);
                      const SIcon = CAT_ICONS[cat].icon;
                      return (
                        <li key={s.code}>
                          <button
                            onClick={() => toggle(s.code)}
                            className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors min-h-[64px] ${
                              checked ? "bg-primary/5" : "hover:bg-secondary/60"
                            }`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${checked ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary/70 text-muted-foreground'}`}>
                              <SIcon className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-muted-foreground/70 mb-0.5">{s.code}</p>
                              <p className="text-base font-medium leading-relaxed text-foreground">{s.text}</p>
                            </div>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background"
                              }`}
                            >
                              {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-4 py-8 text-center text-muted-foreground">
              Gejala tidak ditemukan untuk "{query}".
            </p>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 md:bottom-6 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-3 shadow-card backdrop-blur-xl">
          <button
            onClick={handleSubmit}
            disabled={picked.size === 0}
            className="flex h-16 w-full items-center justify-between gap-3 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-cta transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            <span className="flex items-center gap-3">
              <Calculator className="h-6 w-6" strokeWidth={2.5} />
              Hitung Diagnosa
            </span>
            <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-bold">
              {picked.size} gejala
            </span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function CatBadge({ category }: { category: SymptomCategory }) {
  const m = CAT_ICONS[category];
  const Icon = m.icon;
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${m.bg}`}>
      <Icon className={`h-5 w-5 ${m.text}`} strokeWidth={2} />
    </div>
  );
}
