import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getConsultationId } from "@/lib/diagnosis-store";
import { api } from "@/lib/api-client";
import { Sprout, Search, Database, Calculator, Receipt, Leaf, Wheat } from "lucide-react";

export const Route = createFileRoute("/proses")({
  head: () => ({ meta: [{ title: "Memproses Diagnosa — AgriPakar Padi" }] }),
  component: Proses,
});

function Proses() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cid = getConsultationId();
    if (!cid) {
      navigate({ to: "/diagnosa" });
      return;
    }

    // Minimum delay for UI (2.5s) combined with API call
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2500));
    const apiCall = api.getDiagnosis(cid);

    Promise.all([apiCall, minDelay])
      .then(([diagnosisData]) => {
        // Diagnosis is ready in backend, we can navigate to hasil
        navigate({ to: "/hasil" });
      })
      .catch((err) => {
        console.error("Diagnosis error:", err);
        setError("Gagal memproses diagnosa. Silakan coba lagi.");
      });
  }, [navigate]);

  if (error) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 max-w-md">
                <p className="text-destructive font-bold mb-4">{error}</p>
                <button onClick={() => navigate({ to: "/diagnosa" })} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium">Kembali</button>
            </div>
        </div>
     )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background font-sans text-foreground antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-progress {
            0% { left: -30%; width: 30%; }
            50% { left: 30%; width: 40%; }
            100% { left: 100%; width: 30%; }
        }
        .animate-progress { animation: loading-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        
        @keyframes scan-radar {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-scan-radar { animation: scan-radar 3s linear infinite; }
        
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-pulse-ring { animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        
        @keyframes fade-in-step {
            0% { opacity: 0.2; transform: translateY(5px); }
            50% { opacity: 1; transform: translateY(0); font-weight: 700; color: hsl(var(--primary)); }
            100% { opacity: 0.5; transform: translateY(0); color: hsl(var(--foreground)); }
        }
        .step-1 { animation: fade-in-step 4s infinite 0s; }
        .step-2 { animation: fade-in-step 4s infinite 1s; }
        .step-3 { animation: fade-in-step 4s infinite 2s; }
        .step-4 { animation: fade-in-step 4s infinite 3s; }
        
        @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.05; }
            50% { transform: translateY(-20px) rotate(5deg); opacity: 0.1; }
        }
        .bg-element { animation: float-slow 8s ease-in-out infinite; }
      `}} />

      {/* Immersive Tech-Forward Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-background to-secondary/15">
        {/* Abstract Tech/Farming Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Floating Icons Varied */}
        <Leaf className="bg-element absolute -left-20 -top-10 h-[250px] w-[250px] text-primary md:h-[400px] md:w-[400px]" strokeWidth={1} />
        <Wheat className="bg-element absolute -right-20 bottom-10 h-[300px] w-[300px] text-primary md:h-[500px] md:w-[500px]" style={{ animationDelay: '-4s' }} strokeWidth={1} />
        <Sprout className="bg-element absolute -bottom-10 -left-20 h-[200px] w-[200px] text-primary md:h-[350px] md:w-[350px]" style={{ animationDelay: '-7s' }} strokeWidth={1} />
      </div>

      {/* Main Processing Canvas */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center md:max-w-2xl">
        
        {/* Sophisticated Scanning Animation */}
        <div className="relative mb-10 flex h-40 w-40 items-center justify-center md:h-56 md:w-56">
          {/* Pulsing Rings */}
          <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-primary/60"></div>
          <div className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-primary/60" style={{ animationDelay: '1.25s' }}></div>
          
          {/* Radar Scan Background */}
          <div className="absolute inset-4 overflow-hidden rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_40px_rgba(22,101,52,0.15)]">
            <div className="animate-scan-radar absolute inset-0 origin-bottom-left bg-gradient-to-tr from-transparent via-primary/30 to-primary/50"></div>
          </div>
          
          {/* Central Tech/Plant Icon */}
          <div className="relative z-10 flex items-center justify-center rounded-full border border-border bg-card p-5 shadow-xl md:p-6">
            <Sprout className="h-12 w-12 text-primary md:h-16 md:w-16" strokeWidth={2.5} />
          </div>
        </div>

        {/* Typography: Main Headline */}
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Menganalisis Diagnosa
        </h1>

        {/* Dynamic Processing Steps */}
        <div className="mb-10 w-full max-w-[320px] rounded-2xl border border-border bg-card p-6 text-left shadow-card md:max-w-[420px] md:p-8">
          <ul className="space-y-4 text-sm md:text-base md:space-y-6">
            <li className="step-1 flex items-center gap-4 opacity-20">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="font-medium text-foreground/80">Mengidentifikasi Gejala...</span>
            </li>
            <li className="step-2 flex items-center gap-4 opacity-20">
              <Database className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="font-medium text-foreground/80">Menganalisis Basis Pengetahuan...</span>
            </li>
            <li className="step-3 flex items-center gap-4 opacity-20">
              <Calculator className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="font-medium text-foreground/80">Menghitung Skor Kemiripan...</span>
            </li>
            <li className="step-4 flex items-center gap-4 opacity-20">
              <Receipt className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="font-medium text-foreground/80">Menyiapkan Rekomendasi Solusi...</span>
            </li>
          </ul>
        </div>

        {/* Linear Progress Bar */}
        <div className="relative h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-secondary md:max-w-md md:h-2.5">
          <div className="animate-progress absolute bottom-0 top-0 rounded-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]"></div>
        </div>
      </main>
    </div>
  );
}
