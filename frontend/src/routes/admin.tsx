import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  ShieldCheck,
  Sprout,
  UserCog,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  api,
  type CandidateDetail,
  type CandidateSummary,
} from "@/lib/api-client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel - AgriPakar Padi" }],
  }),
  component: AdminPage,
});

type CandidateAction = "approve" | "reject";

const STATUS_LABEL: Record<CandidateSummary["status"], string> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Menunggu Validasi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function AdminPage() {
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [details, setDetails] = useState<Record<string, CandidateDetail>>({});
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: CandidateAction; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pendingCases = useMemo(
    () => candidates.filter((candidate) => candidate.status === "UNDER_REVIEW"),
    [candidates],
  );

  async function loadCandidates() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat kandidat kasus.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  async function toggleCandidate(candidateId: string) {
    const nextSelected = selectedCase === candidateId ? null : candidateId;
    setSelectedCase(nextSelected);
    if (!nextSelected || details[nextSelected]) return;

    setDetailLoadingId(nextSelected);
    setError(null);
    try {
      const detail = await api.getCandidateDetail(nextSelected);
      setDetails((prev) => ({ ...prev, [nextSelected]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail kandidat.");
    } finally {
      setDetailLoadingId(null);
    }
  }

  async function runAction() {
    if (!actionModal || actionLoading) return;

    setActionLoading(true);
    setError(null);
    try {
      if (actionModal.type === "approve") {
        await api.approveCandidate(actionModal.id);
      } else {
        await api.rejectCandidate(actionModal.id);
      }
      setDetails((prev) => {
        const next = { ...prev };
        delete next[actionModal.id];
        return next;
      });
      setSelectedCase(null);
      setActionModal(null);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aksi kandidat gagal.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-deep">
              <UserCog className="h-4 w-4" /> Panel Admin
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Validasi Kasus Baru
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              Data kandidat diambil langsung dari backend. Kasus yang disetujui akan masuk ke basis kasus CBR.
            </p>
          </div>
          <div className="flex w-full items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-4 md:w-auto">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black leading-none text-foreground">{pendingCases.length}</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Menunggu Validasi
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">Daftar Kandidat</h2>
            <button
              onClick={loadCandidates}
              disabled={loading}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border bg-card py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memuat kandidat dari backend...
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
              <ShieldCheck className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-xl font-bold text-foreground">Belum ada kandidat kasus</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Kandidat akan muncul setelah pengguna mengonfirmasi hasil diagnosa.
              </p>
            </div>
          ) : (
            <div className="grid items-start gap-5 sm:grid-cols-2">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  detail={details[candidate.id]}
                  detailLoading={detailLoadingId === candidate.id}
                  selected={selectedCase === candidate.id}
                  onToggle={() => toggleCandidate(candidate.id)}
                  onAction={(type) => setActionModal({ type, id: candidate.id })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {actionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => (actionLoading ? undefined : setActionModal(null))}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                actionModal.type === "approve"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {actionModal.type === "approve" ? (
                <CheckCircle className="h-7 w-7" />
              ) : (
                <XCircle className="h-7 w-7" />
              )}
            </div>
            <h3 className="text-center text-xl font-bold text-foreground">
              {actionModal.type === "approve" ? "Setujui Kasus?" : "Tolak Kasus?"}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {actionModal.type === "approve"
                ? "Backend akan membuat CaseBase baru dan mengubah status kandidat menjadi APPROVED."
                : "Backend akan mengubah status kandidat menjadi REJECTED."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="h-12 flex-1 rounded-xl bg-secondary text-sm font-bold text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-60"
                onClick={() => setActionModal(null)}
                disabled={actionLoading}
              >
                Batal
              </button>
              <button
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  actionModal.type === "approve"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
                onClick={runAction}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function CandidateCard({
  candidate,
  detail,
  detailLoading,
  selected,
  onToggle,
  onAction,
}: {
  candidate: CandidateSummary;
  detail?: CandidateDetail;
  detailLoading: boolean;
  selected: boolean;
  onToggle: () => void;
  onAction: (type: CandidateAction) => void;
}) {
  const canReview = candidate.status === "UNDER_REVIEW";
  const createdAt = new Date(candidate.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        selected ? "border-primary shadow-md ring-4 ring-primary/10" : "border-border shadow-sm"
      }`}
    >
      <button className="w-full cursor-pointer p-6 text-left" onClick={onToggle}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-bold text-foreground">{candidate.code}</h4>
            <p className="text-sm text-muted-foreground">{createdAt}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              candidate.status === "UNDER_REVIEW"
                ? "bg-warning/15 text-warning-foreground"
                : candidate.status === "APPROVED"
                  ? "bg-primary/15 text-primary-deep"
                  : candidate.status === "REJECTED"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-foreground"
            }`}
          >
            {STATUS_LABEL[candidate.status]}
          </span>
        </div>

        <div className="mb-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prediksi Sistem</p>
          <p className="text-lg font-bold text-primary-deep">{candidate.disease}</p>
          <div className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary-deep">
            {candidate.symptomCount} gejala kandidat
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-primary">
          <span>{selected ? "Tutup detail" : "Lihat rincian gejala"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${selected ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div
        className={`overflow-hidden bg-secondary/30 transition-all duration-300 ease-in-out ${
          selected ? "max-h-[760px] border-t border-border/50" : "max-h-0"
        }`}
      >
        <div className="p-6 pt-5">
          {detailLoading ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat detail...
            </div>
          ) : detail ? (
            <>
              <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-bold text-foreground">{detail.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {detail.consultation ? `Konsultasi ${detail.consultation.code}` : "Tanpa relasi konsultasi"}
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sprout className="h-4 w-4 text-muted-foreground" />
                  Gejala yang Dipilih ({detail.candidateCaseSymptoms.length})
                </div>
                <ul className="space-y-2">
                  {detail.candidateCaseSymptoms.map((item) => (
                    <li key={item.id} className="rounded-xl bg-card px-3 py-2 text-sm text-muted-foreground">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-foreground">
                          [{item.symptom.code}] {item.symptom.description}
                        </span>
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
                          {item.weight}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {canReview ? (
                <div className="flex gap-3">
                  <button
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 text-sm font-bold text-destructive transition-colors hover:bg-destructive/20 active:scale-95"
                    title="Tolak kasus ini"
                    onClick={() => onAction("reject")}
                  >
                    <XCircle className="h-5 w-5" /> Tolak
                  </button>
                  <button
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-cta transition-colors hover:bg-primary/90 active:scale-95"
                    title="Setujui dan masukkan ke basis pengetahuan"
                    onClick={() => onAction("approve")}
                  >
                    <CheckCircle className="h-5 w-5" /> Setujui
                  </button>
                </div>
              ) : (
                <p className="rounded-xl bg-card px-4 py-3 text-sm font-semibold text-muted-foreground">
                  Aksi tidak tersedia untuk status {STATUS_LABEL[candidate.status]}.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">Detail belum dimuat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
