import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ShieldCheck, UserCog, CheckCircle, XCircle, Clock, ChevronDown, Sprout, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — AgriPakar Padi" }],
  }),
  component: AdminPage,
});

// Mock data untuk UI Halaman Admin
// Temanmu yang integrasi BE bisa mengganti ini dengan hasil fetch dari /api/admin/candidates
const MOCK_CANDIDATES = [
  {
    id: "c1",
    code: "CC-0001",
    title: "Kasus Baru: Hawar Daun Bakteri",
    consultationCode: "C-0001",
    date: "12 Okt 2026",
    predictedDisease: "P01 - Hawar Daun Bakteri",
    confidence: 85,
    symptoms: ["[G01] Bercak basah pada daun", "[G02] Daun menguning", "[G05] Garis basah memanjang"],
    status: "pending", // pending, approved, rejected
  },
  {
    id: "c2",
    code: "CC-0002",
    title: "Kasus Baru: Penyakit Tungro",
    consultationCode: "C-0002",
    date: "11 Okt 2026",
    predictedDisease: "P02 - Penyakit Tungro",
    confidence: 92,
    symptoms: ["[G03] Tanaman kerdil", "[G06] Daun berwarna kuning oranye", "[G07] Jumlah anakan sedikit"],
    status: "pending",
  },
  {
    id: "c3",
    code: "CC-0003",
    title: "Kasus Baru: Bercak Daun Coklat",
    consultationCode: "C-0003",
    date: "10 Okt 2026",
    predictedDisease: "P03 - Bercak Daun Coklat",
    confidence: 78,
    symptoms: ["[G04] Bercak coklat oval", "[G08] Bercak pada pelepah", "[G09] Daun mengering"],
    status: "pending",
  },
];

function AdminPage() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: "approve" | "reject"; id: string } | null>(null);

  const pendingCases = candidates.filter((c) => c.status === "pending");

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-deep mb-4">
              <UserCog className="h-4 w-4" /> Panel Admin
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Validasi Kasus Baru
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground leading-relaxed">
              Tinjau kandidat kasus baru dari pengguna. Kasus yang disetujui akan memperkaya sistem <span className="font-semibold text-foreground">Case-Based Reasoning (CBR)</span>.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-secondary/40 p-4 border border-border w-full md:w-auto">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black text-foreground leading-none">{pendingCases.length}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Menunggu Validasi</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Daftar Kandidat</h2>
          
          {pendingCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center bg-card/50">
              <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Semua kasus telah divalidasi</h3>
              <p className="mt-2 text-sm text-muted-foreground">Belum ada kandidat kasus baru saat ini.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 items-start">
              {pendingCases.map((c) => (
                <div
                  key={c.id}
                  className={`group relative overflow-hidden rounded-3xl border bg-card text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedCase === c.id ? "border-primary shadow-md ring-4 ring-primary/10" : "border-border shadow-sm"
                  }`}
                  onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)}
                >
                  <div className="p-6 cursor-pointer">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-foreground line-clamp-1">{c.title}</h4>
                        <p className="text-sm text-muted-foreground">{c.date} • {c.consultationCode}</p>
                      </div>
                      <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-foreground">
                        {c.code}
                      </span>
                    </div>

                    <div className="mb-4 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sistem Prediksi</p>
                      <p className="text-lg font-bold text-primary-deep">{c.predictedDisease}</p>
                      <div className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary-deep">
                        Akurasi awal: {c.confidence}%
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                      <span>Lihat {c.symptoms.length} rincian gejala</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${selectedCase === c.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-secondary/30 ${selectedCase === c.id ? "max-h-[500px] border-t border-border/50" : "max-h-0"}`}>
                    <div className="p-6 pt-5">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                          <Sprout className="h-4 w-4 text-muted-foreground" />
                          Gejala yang Dipilih ({c.symptoms.length})
                        </div>
                        <ul className="space-y-2">
                          {c.symptoms.map((sym, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                              <span className="font-medium text-foreground">{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 text-sm font-bold text-destructive transition-colors hover:bg-destructive/20 active:scale-95"
                          title="Tolak kasus ini"
                          onClick={(e) => { e.stopPropagation(); setActionModal({ type: "reject", id: c.id }); }}
                        >
                          <XCircle className="h-5 w-5" /> Tolak
                        </button>
                        <button
                          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-cta transition-colors hover:bg-primary/90 active:scale-95"
                          title="Setujui dan masukkan ke basis pengetahuan"
                          onClick={(e) => { e.stopPropagation(); setActionModal({ type: "approve", id: c.id }); }}
                        >
                          <CheckCircle className="h-5 w-5" /> Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setActionModal(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${actionModal.type === "approve" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              {actionModal.type === "approve" ? <CheckCircle className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>
            <h3 className="text-center text-xl font-bold text-foreground">
              {actionModal.type === "approve" ? "Setujui Kasus?" : "Tolak Kasus?"}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {actionModal.type === "approve" 
                ? "Kasus ini akan dimasukkan ke dalam basis pengetahuan (Knowledge Base) sistem untuk digunakan pada diagnosa berikutnya." 
                : "Kasus ini akan dihapus dari daftar kandidat dan tidak akan dimasukkan ke basis pengetahuan."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="h-12 flex-1 rounded-xl bg-secondary text-sm font-bold text-foreground transition-colors hover:bg-secondary/80"
                onClick={() => setActionModal(null)}
              >
                Batal
              </button>
              <button
                className={`h-12 flex-1 rounded-xl text-sm font-bold shadow-sm transition-colors ${actionModal.type === "approve" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
                onClick={() => {
                  setCandidates((prev) => prev.map((c) => (c.id === actionModal.id ? { ...c, status: actionModal.type === "approve" ? "approved" : "rejected" } : c)));
                  setActionModal(null);
                }}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
