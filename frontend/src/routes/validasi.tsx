import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/validasi")({
  head: () => ({ meta: [{ title: "Validasi Pakar — AgriPakar Padi" }] }),
  component: Validasi,
});

function Validasi() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-scale-in">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cta">
            <CheckCircle2 className="h-14 w-14" strokeWidth={2.5} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">Terima kasih!</h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Kasus baru Anda telah dikirim ke <span className="font-bold text-foreground">Petugas Penyuluh Lapangan (PPL)</span>. Pakar akan meninjau dan memperkaya basis pengetahuan AgriPakar.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-cta"
          >
            Kembali ke Beranda
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
        <button onClick={() => history.back()} className="inline-flex items-center gap-2 text-sm font-bold text-primary-deep">
          <ArrowLeft className="h-4 w-4" /> Kembali ke hasil
        </button>

        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-deep">Retain Phase · Validasi Pakar</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Kasus Baru Terdeteksi</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Sistem belum yakin dengan diagnosa ini (kemiripan &lt; 70%). Bantu kami memperkaya basis pengetahuan dengan mengirim ke Pakar PPL.
          </p>
        </header>

        <div className="flex items-start gap-4 rounded-3xl border-2 border-dashed border-warning bg-warning/10 p-5 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning text-warning-foreground">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Kombinasi gejala dan hasil diagnosa sementara Anda akan dikirim secara anonim ke basis data sebagai kandidat kasus baru untuk divalidasi oleh pakar.
          </p>
        </div>



        <button
          onClick={() => setSent(true)}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-cta active:scale-[0.98]"
        >
          <Send className="h-6 w-6" strokeWidth={2.5} />
          Kirim ke Pakar PPL
        </button>
      </div>
    </AppShell>
  );
}
