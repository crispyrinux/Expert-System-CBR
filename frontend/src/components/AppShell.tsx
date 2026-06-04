import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Leaf, Sprout, Wheat, Home, Stethoscope, History, UserCog, SwitchCamera } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role, changeRole } = useRole();
  const navigate = useNavigate();

  const toggleRole = () => changeRole(role === "user" ? "admin" : "user");

  useEffect(() => {
    if (path.startsWith("/admin") && role === "user") {
      navigate({ to: "/" });
    }
  }, [path, role, navigate]);

  return (
    <div className="relative min-h-screen bg-background pb-24 md:pb-0 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.03; }
            50% { transform: translateY(-20px) rotate(5deg); opacity: 0.08; }
        }
        .bg-element { animation: float-slow 10s ease-in-out infinite; }
      `}} />
      
      {/* Immersive Subtle Background (Replaces Splash) */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        {/* Floating Icons Varied */}
        <Leaf className="bg-element absolute -left-20 -top-10 h-[250px] w-[250px] text-primary md:h-[400px] md:w-[400px]" strokeWidth={1} />
        <Wheat className="bg-element absolute -right-20 bottom-10 h-[300px] w-[300px] text-primary md:h-[500px] md:w-[500px]" style={{ animationDelay: '-4s' }} strokeWidth={1} />
        <Sprout className="bg-element absolute -bottom-10 -left-20 h-[200px] w-[200px] text-primary md:h-[350px] md:w-[350px]" style={{ animationDelay: '-7s' }} strokeWidth={1} />
      </div>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between px-4 md:h-20 md:px-12">
          <Link to="/" className="flex items-center">
            <div className="flex flex-col leading-tight">
              <span className="text-3xl font-black tracking-tight text-primary-deep">AgriPakar</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Padi · Sistem Pakar</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-1 md:flex mr-4">
              <TopLink to="/" label="Beranda" active={path === "/"} />
              <TopLink to="/diagnosa" label="Diagnosa" active={path.startsWith("/diagnosa")} />
              <TopLink to="/riwayat" label="Riwayat" active={path.startsWith("/riwayat")} />
              {role === "admin" && <TopLink to="/admin" label="Admin" active={path.startsWith("/admin")} />}
            </nav>
            <button
              onClick={toggleRole}
              className="flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary-deep transition-colors hover:bg-primary/20 shadow-sm"
              title="Klik untuk simulasi Role"
            >
              <SwitchCamera className="h-4 w-4" />
              <span className="hidden sm:inline">Login: {role === "admin" ? "Admin" : "User"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden pb-safe-bottom">
        <div className={`mx-auto grid max-w-md px-2 py-2 mb-2 ${role === "admin" ? "grid-cols-4" : "grid-cols-3"}`}>
          <BottomLink to="/" label="Beranda" icon={Home} active={path === "/"} />
          <BottomLink to="/diagnosa" label="Diagnosa" icon={Stethoscope} active={path.startsWith("/diagnosa") || path.startsWith("/hasil") || path.startsWith("/proses") || path.startsWith("/validasi")} />
          <BottomLink to="/riwayat" label="Riwayat" icon={History} active={path.startsWith("/riwayat")} />
          {role === "admin" && <BottomLink to="/admin" label="Admin" icon={UserCog} active={path.startsWith("/admin")} />}
        </div>
      </nav>
    </div>
  );
}

export function useRole() {
  const [role, setRole] = useState<"user" | "admin">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("app_role") as "user" | "admin") || "user";
    }
    return "user";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setRole((localStorage.getItem("app_role") as "user" | "admin") || "user");
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("role_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("role_changed", handleStorageChange);
    };
  }, []);

  const changeRole = (newRole: "user" | "admin") => {
    localStorage.setItem("app_role", newRole);
    window.dispatchEvent(new Event("role_changed"));
  };

  return { role, changeRole };
}

function TopLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-xl px-5 py-2 text-base font-semibold transition-colors ${
        active ? "bg-secondary text-primary-deep" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

function BottomLink({ to, label, icon: Icon, active }: { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
        active ? "bg-secondary text-primary-deep" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
      {label}
    </Link>
  );
}
