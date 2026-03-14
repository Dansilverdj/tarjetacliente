"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Business } from "@/types";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/tarjeta",
    label: "Mi Tarjeta",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/metricas",
    label: "Métricas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    href: "/encuesta",
    label: "Encuesta",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/mkt",
    label: "MKT con IA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    accent: true,
  },
];

interface Props {
  business: Business;
  customerCount: number;
  planLimit: number;
}

export default function Sidebar({ business, customerCount, planLimit }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const pct = Math.min((customerCount / planLimit) * 100, 100);
  const initial = business.name.charAt(0).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo">{initial}</div>
        <span className="sb-name" style={{ fontSize: 13, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {business.name}
        </span>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sb-item${pathname === item.href || pathname.startsWith(item.href + "/") ? " active" : ""}`}
          >
            {item.icon}
            <span style={item.accent ? { color: "#9B8FEE" } : {}}>{item.label}</span>
            {item.accent && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#7B68EE", flexShrink: 0 }} />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        <div className="flex justify-between text-sm text-muted" style={{ marginBottom: 6 }}>
          <span>Clientes</span>
          <span>{customerCount} / {planLimit}</span>
        </div>
        <div className="sb-plan-bar">
          <div className="sb-plan-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted">Plan actual</span>
          <span className="sb-plan-badge">{business.plan === "free" ? "Gratis" : business.plan}</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm w-full mt-4"
          style={{ justifyContent: "flex-start", gap: 8 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
