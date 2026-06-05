import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronDown, Zap, RotateCcw, Brain, Save } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/ui/announcement";
import { getConsultationId, pushHistory, clearConsultationId } from "@/lib/diagnosis-store";
import { api, type DiagnosisResult } from "@/lib/api-client";

export const Route = createFileRoute("/hasil")({
  head: () => ({ meta: [{ title: "Hasil Diagnosa — AgriPakar Padi" }] }),
  component: Hasil,
});

function Hasil() {
  const navigate = useNavigate();
  const [showLogic, setShowLogic] = useState(false);
  const [showSolusi, setShowSolusi] = useState(true);
  
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    tag: string;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const cid = getConsultationId();
    if (!cid) {
      navigate({ to: "/diagnosa" });
      return;
    }

    api.getDiagnosis(cid)
      .then((data) => {
        setResult(data);
        setLoading(false);
        if (data.diagnosis.disease) {
           pushHistory({
            id: cid,
             date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
             diseaseName: data.diagnosis.disease.name,
             score: data.diagnosis.similarity / 100, 
           });
        }
      })
      .catch((err) => {
        console.error("Failed to load diagnosis result", err);
        setLoading(false);
      });
  }, [navigate]);

  async function handleConfirm() {
    const cid = getConsultationId();
    if (!cid || confirming) return;
    
    setConfirming(true);
    try {
      await api.confirmDiagnosis(cid);
      setConfirmed(true);
      setNotice({
        type: "success",
        tag: "Retain",
        title: "Diagnosa dikonfirmasi",
        message: "Data diteruskan ke pakar untuk proses validasi.",
      });
    } catch (error) {
      console.error(error);
      setNotice({
        type: "error",
        tag: "Gagal",
        title: "Konfirmasi belum tersimpan",
        message: "Periksa koneksi backend, lalu coba lagi.",
      });
    } finally {
      setConfirming(false);
    }
  }
  
  function handleReset() {
      clearConsultationId();
      navigate({ to: "/diagnosa" });
  }

  if (loading) {
    return (
      <AppShell>
         <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground font-medium">Memuat hasil...</p>
         </div>
      </AppShell>
    );
  }

  if (!result || !result.diagnosis.disease) {
    return (
      <AppShell>
         <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center animate-fade-in">
             <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
             </div>
             <div>
                 <h2 className="text-2xl font-bold text-foreground mb-2">Tidak Ada Diagnosa Pasti</h2>
                 <p className="text-muted-foreground max-w-md">Gejala yang Anda masukkan tidak cukup mirip dengan kasus mana pun di basis pengetahuan kami. Mohon konsultasikan langsung dengan pakar pertanian.</p>
             </div>
             <button onClick={handleReset} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">Mulai Ulang</button>
         </div>
      </AppShell>
    )
  }

  const diag = result.diagnosis;
  const pct = Math.round(diag.similarity);
  const disease = diag.disease;
  const bestCase = diag.case;
  const solutions = bestCase?.solutions ?? [];
  
  const certaintyLabel = diag.status === "STRONG_DIAGNOSIS" ? "Kepastian Tinggi" : diag.status === "POSSIBLE_DIAGNOSIS" ? "Kepastian Sedang" : "Kepastian Rendah";
  const certaintyTone = diag.status === "STRONG_DIAGNOSIS" ? "bg-primary text-primary-foreground" : diag.status === "POSSIBLE_DIAGNOSIS" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <AppShell>
      <div className="space-y-6 pb-8 animate-fade-in">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Langkah 3 dari 3 - Reuse & Revise</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Hasil Diagnosa</h1>
        </header>

        {notice && (
          <div className="mx-auto w-full max-w-5xl">
            <Announcement
              themed
              className={`w-full justify-start px-4 py-2 text-left ${
                notice.type === "success"
                  ? "border-primary/25 bg-primary/10 text-primary-deep"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <AnnouncementTag
                className={
                  notice.type === "success"
                    ? "bg-primary/15 text-primary-deep"
                    : "bg-destructive/10 text-destructive"
                }
              >
                {notice.tag}
              </AnnouncementTag>
              <AnnouncementTitle>
                {notice.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span className="shrink-0 font-bold">{notice.title}</span>
                <span className="hidden truncate font-medium opacity-80 sm:inline">{notice.message}</span>
              </AnnouncementTitle>
            </Announcement>
          </div>
        )}

        {/* Similarity Score Card */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <RadialScore value={pct} status={diag.status} />
            <div className="flex-1 text-center md:text-left">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${certaintyTone}`}>
                {diag.status === "STRONG_DIAGNOSIS" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {certaintyLabel}
              </span>
              <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{disease?.name}</h2>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                {disease?.code} - Kecocokan Terbaik: Kasus {bestCase?.code || result.topMatches[0]?.caseCode || "N/A"}
              </p>
              <p className="mt-3 text-base text-muted-foreground">
                Sistem menemukan kemiripan sebesar <span className="font-bold text-foreground">{pct}%</span> antara gejala tanaman Anda dengan basis pengetahuan historis kami.
              </p>
            </div>
          </div>
        </section>

        {/* Solutions */}
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
                <h3 className="text-lg font-bold text-foreground">Tindakan Pengendalian</h3>
                <p className="text-sm text-muted-foreground">
                  Solusi dari {bestCase?.title || `kasus ${bestCase?.code || "terpilih"}`}
                </p>
              </div>
            </div>
            <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform ${showSolusi ? "rotate-180" : ""}`} />
          </button>

          {showSolusi && (
            <div className="border-t border-border bg-secondary/10 p-5 animate-fade-in md:p-6">
              {solutions.length > 0 ? (
                <ol className="space-y-3">
                  {solutions.map((solution, index) => (
                    <li key={`${bestCase?.code || "case"}-${index}`} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary-deep ring-1 ring-primary/20">
                        {index + 1}
                      </span>
                      <p className="text-base font-medium leading-relaxed text-foreground">{solution}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-5 text-warning-foreground">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="font-bold">Solusi belum tersedia</h4>
                    <p className="mt-1 text-sm font-medium opacity-90">
                      Case terpilih belum memiliki data solusi. Perlu validasi pakar sebelum rekomendasi pengendalian ditampilkan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Retain Action */}
        <section className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           <div>
               <h3 className="text-lg font-bold text-primary-deep">Bantu Sistem Belajar (Retain)</h3>
               <p className="text-sm text-primary-deep/80 mt-1 max-w-xl">Jika hasil diagnosa ini sesuai dengan kondisi nyata di lapangan, konfirmasikan agar sistem dapat menyimpannya sebagai kasus baru dan meningkatkan akurasi di masa depan.</p>
           </div>
           <button 
             onClick={handleConfirm}
             disabled={confirming || confirmed}
             className="flex shrink-0 items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {confirmed ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {confirming ? "Menyimpan..." : confirmed ? "Terkonfirmasi" : "Konfirmasi Diagnosa"}
           </button>
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
                <p className="text-sm text-muted-foreground">Lihat detail logika sistem pakar (CBR Engine)</p>
              </div>
            </div>
            <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform ${showLogic ? "rotate-180" : ""}`} />
          </button>
          
          {showLogic && (
            <div className="border-t border-border p-5 md:p-6 animate-fade-in bg-secondary/10">
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Confidence Statement */}
                <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                  <h4 className="mb-2 font-bold text-lg text-foreground">Confidence Statement</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {diag.status === "STRONG_DIAGNOSIS" 
                      ? <><strong className="text-primary-deep">Skor kemiripan {pct}% &gt;= 70% (Strong Diagnosis).</strong> Diagnosis dapat diandalkan berdasarkan histori.</>
                      : diag.status === "POSSIBLE_DIAGNOSIS"
                      ? <><strong className="text-warning">Skor kemiripan {pct}% &gt;= 40% (Possible Diagnosis).</strong> Kepastian sedang, perlu peninjauan visual tambahan.</>
                      : <><strong className="text-destructive">Skor kemiripan {pct}% &lt; 40% (No Diagnosis).</strong> Kepastian sangat rendah. Sistem merekomendasikan pemeriksaan manual.</>}
                  </p>
                </div>

                {/* Novelty / Ambiguity */}
                {diag.ambiguous ? (
                  <div className="rounded-2xl bg-warning/15 border border-warning/30 p-5 shadow-sm">
                    <h4 className="mb-2 font-bold text-lg text-warning-foreground">Ambiguitas Terdeteksi (Revise Phase)</h4>
                    <p className="text-sm font-medium text-warning-foreground/90 leading-relaxed">
                      Sistem CBR mendeteksi selisih kemiripan dengan peringkat ke-2 sangat tipis (&lt; 10%). Ada kemungkinan overlap gejala. Kami menyarankan Anda mengecek opsi penyakit lain di bawah.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-secondary/60 border border-border p-5 shadow-sm">
                    <h4 className="mb-2 font-bold text-lg text-foreground">Status Identifikasi</h4>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Tidak terdeteksi ambiguitas signifikan. Prediksi kasus ini memiliki jarak kemiripan yang aman dari kandidat lainnya.
                    </p>
                  </div>
                )}
              </div>

              {/* ===== TABEL RINCIAN KECOCOKAN GEJALA DITAMBAHKAN DI SINI ===== */}
              {diag.symptomDetails && diag.symptomDetails.length > 0 && (
                <div className="mb-6 rounded-2xl bg-card border border-border p-5 shadow-sm">
                  <h4 className="mb-2 font-bold text-lg text-foreground">Rincian Kecocokan Gejala</h4>
                  <p className="mb-4 text-sm text-muted-foreground">Detail kontribusi bobot tiap gejala terhadap perhitungan skor kemiripan (Kasus {bestCase?.code}).</p>
                  
                  <div className="overflow-hidden rounded-xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead className="bg-secondary text-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Kode</th>
                            <th className="px-4 py-3 text-left font-bold">Deskripsi Gejala</th>
                            <th className="px-4 py-3 text-center font-bold">Bobot Gejala</th>
                            <th className="px-4 py-3 text-center font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {diag.symptomDetails.map((detail) => (
                            <tr key={detail.symptomId} className={detail.isMatched ? "bg-primary/5" : ""}>
                              <td className="px-4 py-3 text-foreground font-medium">{detail.symptomCode}</td>
                              <td className="px-4 py-3 text-foreground leading-relaxed">{detail.symptomDescription}</td>
                              <td className="px-4 py-3 text-center text-muted-foreground">{detail.weight}</td>
                              <td className="px-4 py-3 text-center font-medium">
                                <span className={detail.isMatched ? "text-primary-deep font-bold" : "text-muted-foreground"}>
                                  {detail.isMatched ? "Cocok" : "Tidak ada"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-secondary/60 border-t-2 border-border font-bold">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right">Total Similarity Final</td>
                            <td className="px-4 py-3 text-center text-primary-deep text-base">{pct}%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Penjelasan Kandidat Lain */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <h4 className="mb-3 font-bold text-lg text-foreground">Kandidat Kasus Lainnya (Top 5 Matches)</h4>
                <ul className="space-y-3">
                  {result.topMatches.slice(1).map((r) => (
                    <li key={r.caseCode} className="text-sm text-foreground flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">
                        <strong className="text-primary-deep">{r.diseaseName} (Kasus {r.caseCode}): {Math.round(r.similarity)}%</strong> 
                        <span className="text-muted-foreground"> (tidak dipilih karena kemiripan lebih rendah)</span>
                      </span>
                    </li>
                  ))}
                  {result.topMatches.length <= 1 && (
                     <li className="text-sm text-muted-foreground italic">Tidak ada kandidat relevan lainnya.</li>
                  )}
                </ul>
              </div>

            </div>
          )}
        </section>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-4 md:flex-row">
          <button
            onClick={handleReset}
            className="flex min-h-[3.5rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-cta active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} />
            Diagnosa Ulang
          </button>
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

function RadialScore({ value, status }: { value: number, status: string }) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = status === "STRONG_DIAGNOSIS" ? "var(--primary)" : status === "POSSIBLE_DIAGNOSIS" ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative flex items-center justify-center animate-scale-in" style={{ width: size, height: size }}>
      {status === "STRONG_DIAGNOSIS" && (
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