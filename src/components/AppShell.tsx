import { Link, useLocation } from "@tanstack/react-router";
import { FileText, ListChecks, Settings2, History } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Crear OC", icon: FileText },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/listas", label: "Listas", icon: ListChecks },
  { to: "/config", label: "Configuración", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">CIGO</div>
              <div className="text-xs text-muted-foreground">Órdenes de compra</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              const active =
                l.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
