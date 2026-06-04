import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronDown, Sprout, Zap, RotateCcw, Brain } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { diagnose, getSymptom } from "@/lib/agripakar-data";
import { getSelected, pushHistory } from "@/lib/diagnosis-store";

export const Route = createFileRoute("/hasil")({
  head: () => ({ meta: [{ title: "Hasil Diagnosa — AgriPakar Padi" }] }),
  component: Hasil,
});

function Hasil() {
  const navigate = useNavigate();
  const [showLogic, setShowLogic] = useState(false);
  const [showSolusi, setShowSolusi] = useState(false);

  const selected = useMemo(() => (typeof window === "undefined" ? [] : getSelected()), []);
  const results = useMemo(() => (selected.length ? diagnose(selected) : []), [selected]);
  const top = results[0];

  useEffect(() => {
    if (selected.length === 0) navigate({ to: "/diagnosa" });
  }, [selected, navigate]);

  useEffect(() => {
    if (!top) return;
    pushHistory({
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      diseaseName: top.caseRecord.diseaseName,
      score: top.score,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!top) return null;

  const pct = Math.round(top.score * 100);
  const certaintyLabel = pct >= 70 ? "Kepastian Tinggi" : pct >= 40 ? "Kepastian Sedang" : "Kepastian Rendah";
  const certaintyTone = pct >= 70 ? "bg-primary text-primary-foreground" : pct >= 40 ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <AppShell>
      <div className="space-y-6 pb-8 animate-fade-in">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Langkah 3 dari 3 · Reuse</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Hasil Diagnosa</h1>
        </header>

        {/* Similarity Score Card */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <RadialScore value={pct} />
            <div className="flex-1 text-center md:text-left">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${certaintyTone}`}>
                {pct >= 70 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {certaintyLabel}
              </span>
              <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{top.caseRecord.diseaseName}</h2>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                {top.caseRecord.diseaseCode} · Kasus {top.caseRecord.id}
              </p>
              <p className="mt-3 text-base text-muted-foreground">
                Sistem menemukan <span className="font-bold text-foreground">{top.matched.length}</span> dari{" "}
                <span className="font-bold text-foreground">{top.caseRecord.symptoms.length}</span> gejala referensi cocok dengan input Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Solusi */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <button
            onClick={() => setShowSolusi((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Zap className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Tindakan Segera (Solusi)</h3>
                <p className="text-sm text-muted-foreground">Fase Reuse · Panduan Penanganan</p>
              </div>
            </div>
            <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform ${showSolusi ? "rotate-180" : ""}`} />
          </button>
          
          {showSolusi && (
            <div className="border-t border-border p-5 md:p-6 animate-fade-in bg-secondary/10">
              <ul className="space-y-3">
                {top.caseRecord.solution.map((s, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl bg-card border border-border p-5 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary-deep ring-1 ring-primary/20">
                      {i + 1}
                    </span>
                    <p className="text-base font-medium leading-relaxed text-foreground">{s}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Explanation Facility */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <button
            onClick={() => setShowLogic((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left transition-colors hover:bg-secondary/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <Brain className="h-6 w-6 text-primary-deep" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Explanation Facility</h3>
                <p className="text-sm text-muted-foreground">Lihat detail logika sistem pakar</p>
              </div>
            </div>
            <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform ${showLogic ? "rotate-180" : ""}`} />
          </button>
          
          {showLogic && (
            <div className="border-t border-border p-5 md:p-6 animate-fade-in bg-secondary/10">
              
              {/* 1. Penjelasan Kasus */}
              <div className="mb-6 rounded-2xl bg-primary-deep p-5 text-primary-foreground shadow-md">
                <h4 className="mb-2 font-bold text-lg flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Penjelasan Kasus
                </h4>
                <p className="text-sm md:text-base leading-relaxed text-primary-foreground/90">
                  Diagnosis ini didasarkan pada Kasus {top.caseRecord.id} ({top.caseRecord.diseaseName}, disimpan dari laporan referensi pakar). 
                  Kasus tersebut memiliki kemiripan sebesar {pct}% dengan gejala yang Anda masukkan.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* 2. Confidence Statement */}
                <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                  <h4 className="mb-2 font-bold text-lg text-foreground">Confidence Statement</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pct >= 70 
                      ? <><strong className="text-primary-deep">Skor kemiripan {pct}% ≥ 70% (Strong Diagnosis).</strong> Diagnosis dapat diandalkan.</>
                      : pct >= 40
                      ? <><strong className="text-warning">Skor kemiripan {pct}% ≥ 40% (Possible Diagnosis).</strong> Kepastian sedang, perlu peninjauan lebih lanjut.</>
                      : <><strong className="text-destructive">Skor kemiripan {pct}% &lt; 40% (No Diagnosis).</strong> Kepastian sangat rendah. Disarankan konsultasi langsung dengan pakar.</>}
                  </p>
                </div>

                {/* 3. Novelty / Ambiguity */}
                {pct < 40 ? (
                  <div className="rounded-2xl bg-warning/15 border border-warning/30 p-5 shadow-sm">
                    <h4 className="mb-2 font-bold text-lg text-warning-foreground">Novelty (Kasus Baru)</h4>
                    <p className="text-sm font-medium text-warning-foreground/90 leading-relaxed">
                      Kombinasi gejala ini belum ada di basis pengetahuan. Kasus akan disimpan sebagai kandidat (Candidate Case) untuk divalidasi oleh pakar (Retain).
                    </p>
                    <Link to="/validasi" className="mt-3 inline-block rounded-lg bg-warning px-4 py-2 text-xs font-bold text-warning-foreground shadow-sm hover:bg-warning/90 transition-colors">
                      Menuju Validasi Pakar →
                    </Link>
                  </div>
                ) : results.length > 1 && (pct - Math.round(results[1].score * 100) < 10) ? (
                  <div className="rounded-2xl bg-warning/15 border border-warning/30 p-5 shadow-sm">
                    <h4 className="mb-2 font-bold text-lg text-warning-foreground">Ambiguitas Terdeteksi</h4>
                    <p className="text-sm font-medium text-warning-foreground/90 leading-relaxed">
                      Selisih kemiripan dengan kandidat ke-2 kurang dari 10%. Kemungkinan ada gejala kunci yang tumpang tindih. Mohon periksa kembali tanaman Anda.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-secondary/60 border border-border p-5 shadow-sm">
                    <h4 className="mb-2 font-bold text-lg text-foreground">Status Identifikasi</h4>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Tidak terdeteksi ambiguitas signifikan atau kebaruan. Prediksi kasus sudah lazim dikenali oleh sistem (Reuse).
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Rincian Kecocokan Gejala */}
              <div className="mb-6 rounded-2xl bg-card border border-border p-5 shadow-sm">
                <h4 className="mb-2 font-bold text-lg text-foreground">Rincian Kecocokan Gejala</h4>
                <p className="mb-4 text-sm text-muted-foreground">Kontribusi tiap gejala terhadap skor kemiripan akhir.</p>
                
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead className="bg-secondary text-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Gejala</th>
                          <th className="px-4 py-3 text-center font-bold">Status</th>
                          <th className="px-4 py-3 text-center font-bold">Bobot</th>
                          <th className="px-4 py-3 text-center font-bold">Kontribusi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Array.from(new Set([...top.caseRecord.symptoms, ...selected])).sort().map((code) => {
                          const sym = getSymptom(code);
                          const inUser = selected.includes(code);
                          const inCase = top.caseRecord.symptoms.includes(code);
                          
                          // Mocking logic for the UI to match the Figma slide
                          // Backend will replace this calculation logic with the real CBR algorithm
                          const bobot = sym?.weight ?? 0;
                          const kontribusi = (inUser && inCase) ? bobot : 0;
                          const status = (inUser && inCase) ? "Cocok" : "Tidak ada";
                          
                          return (
                            <tr key={code} className={inUser && inCase ? "bg-primary/5" : ""}>
                              <td className="px-4 py-3 text-foreground">{sym?.text ?? "—"}</td>
                              <td className="px-4 py-3 text-center font-medium">
                                <span className={inUser && inCase ? "text-primary-deep font-bold" : "text-muted-foreground"}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-muted-foreground">{inCase ? bobot : "-"}</td>
                              <td className="px-4 py-3 text-center font-bold text-primary-deep">{kontribusi}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-secondary/60 border-t-2 border-border font-bold">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right">Total Similarity</td>
                          <td className="px-4 py-3 text-center text-primary-deep text-base">{pct}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* 5. Penjelasan Kandidat Lain */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <h4 className="mb-3 font-bold text-lg text-foreground">Penjelasan Kandidat Lain</h4>
                <ul className="space-y-3">
                  {results.slice(1, 5).map((r) => (
                    <li key={r.caseRecord.id} className="text-sm text-foreground flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">
                        <strong className="text-primary-deep">{r.caseRecord.diseaseName}: {Math.round(r.score * 100)}%</strong> 
                        <span className="text-muted-foreground"> (tidak dipilih karena kemiripan lebih rendah)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </section>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-4 md:flex-row">
          <Link
            to="/diagnosa"
            className="flex min-h-[3.5rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-cta active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} />
            Diagnosa Ulang
          </Link>
          <Link
            to="/"
            className="flex min-h-[3.5rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 text-base font-bold text-foreground active:scale-[0.98] transition-transform"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function RadialScore({ value }: { value: number }) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 70 ? "var(--primary)" : value >= 40 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative flex items-center justify-center animate-scale-in" style={{ width: size, height: size }}>
      {/* Success Aura Glow */}
      {value >= 70 && (
        <div className="absolute inset-0 scale-110 rounded-full bg-primary/20 blur-2xl animate-pulse" />
      )}
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--secondary)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-foreground">{value}%</span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Similarity</span>
      </div>
    </div>
  );
}
