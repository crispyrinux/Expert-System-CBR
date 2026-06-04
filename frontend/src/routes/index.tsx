import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, ArrowRight, Sprout, ShieldAlert, TrendingUp, Leaf, Droplets, Wheat, FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getHistory, type HistoryItem } from "@/lib/diagnosis-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriPakar Padi — Diagnosa Penyakit Padi" },
      { name: "description", content: "Sistem pakar diagnosa penyakit padi berbasis Case-Based Reasoning untuk petani Indonesia." },
    ],
  }),
  component: Beranda,
});

function Beranda() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => setHistory(getHistory()), []);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Hero */}
        <section className="grid items-center gap-8 pt-4 pb-8 md:grid-cols-2 md:gap-12 lg:gap-20 lg:pt-12 lg:pb-16">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm font-medium text-primary-deep">
              <Sprout className="h-4 w-4" /> Sistem Pakar Padi
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:mt-6 md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Panen <span className="text-primary">Melimpah,</span><br />
              Bebas Penyakit.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:mt-6 md:text-xl">
              Diagnosa penyakit padi secara cepat dengan bantuan Sistem Pakar berbasis 13 kasus referensi ahli. Akurat dan terpercaya.
            </p>

            <Link
              to="/diagnosa"
              className="group relative mt-6 flex min-h-[3.5rem] w-full items-center justify-between gap-4 rounded-2xl bg-foreground px-6 text-base font-semibold text-background transition-all duration-300 hover:scale-[1.02] hover:bg-foreground/90 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] active:scale-[0.98] sm:w-auto sm:rounded-full sm:px-8 sm:text-lg md:mt-8"
            >
              {/* Outer Pulse Ring */}
              <div className="absolute -inset-1 z-[-1] rounded-2xl sm:rounded-full bg-primary/20 opacity-0 blur-md transition-opacity group-hover:animate-pulse group-hover:opacity-100" />
              
              <span className="flex items-center gap-3">
                <Stethoscope className="h-6 w-6 text-primary group-hover:animate-[spin_3s_linear_infinite]" strokeWidth={2} />
                Mulai Diagnosa
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 transition-transform duration-300 group-hover:translate-x-2 group-hover:bg-primary/20 group-hover:text-primary">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {/* Organic shaped image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] md:rounded-br-[6rem] md:rounded-tl-[6rem] bg-secondary shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.2)] md:aspect-[5/4]">
              <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center transition-transform duration-1000 hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent mix-blend-overlay" />
            </div>

            
            {/* Decorative dots/circles for aesthetic balance */}
            <div className="absolute -right-8 -top-8 -z-10 hidden h-32 w-32 rounded-full border-[1.5px] border-emerald-500/20 md:block" />
            <div className="absolute -right-4 -top-4 -z-10 hidden h-24 w-24 rounded-full border-[1.5px] border-emerald-500/30 bg-emerald-50/50 md:block" />
          </div>
        </section>

        {/* Quick stats */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          <StatCard icon={Leaf} value="57" label="Gejala" />
          <StatCard icon={ShieldAlert} value="13" label="Penyakit" />
          <StatCard icon={TrendingUp} value="Instan" label="Analisis" />
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Riwayat */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Riwayat Kasus Terakhir</h2>
              <Link to="/riwayat" className="text-sm font-semibold text-primary-deep">Semua →</Link>
            </div>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <EmptyHistory />
              ) : (
                history.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-foreground">{h.diseaseName}</p>
                      <p className="text-xs text-muted-foreground">{h.date}</p>
                    </div>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary-deep">
                      {Math.round(h.score * 100)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">Tips Pencegahan Hama</h2>
            <ul className="mt-4 space-y-3">
              {TIPS.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

const TIPS = [
  { icon: Droplets, title: "Atur sistem pengairan", desc: "Pengairan berselang (intermittent) menekan kelembapan & hawar daun." },
  { icon: Wheat, title: "Tanam serempak", desc: "Penanaman serentak satu hamparan memutus siklus wereng & tungro." },
  { icon: FlaskConical, title: "Pupuk berimbang", desc: "Hindari Nitrogen berlebih — picu blas dan busuk pelepah." },
];

function StatCard({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="group flex flex-col items-center justify-center rounded-[1.25rem] bg-secondary/40 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/70 hover:shadow-card md:rounded-3xl md:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary shadow-sm transition-transform duration-300 group-hover:scale-110 md:h-12 md:w-12">
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>
      <p className="mt-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary md:mt-4 md:text-3xl lg:text-4xl">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground md:mt-1 md:text-sm">{label}</p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground flex flex-col items-center gap-2">
        <Sprout className="h-6 w-6 opacity-50" />
        Belum ada riwayat diagnosa.<br />Mulai diagnosa pertama Anda.
      </p>
    </div>
  );
}
