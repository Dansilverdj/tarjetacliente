"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  stats: Record<string, number>;
  byDay: Array<{ day: string; total: number }>;
  topCustomers: Array<{
    current_points: number;
    total_visits: number;
    total_redeemed: number;
    customers: { name: string | null; phone: string | null };
  }>;
}

// Fill missing days in last 7 days
function fillWeek(data: Array<{ day: string; total: number }>) {
  const map = Object.fromEntries(data.map((d) => [d.day.slice(0, 10), d.total]));
  return Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = d.toISOString().slice(0, 10);
    return {
      day: format(d, "EEE", { locale: es }),
      total: map[key] ?? 0,
      isoKey: key,
    };
  });
}

export default function MetricasClient({ stats, byDay, topCustomers }: Props) {
  const weekData = fillWeek(byDay);
  const maxBar = Math.max(...weekData.map((d) => d.total), 1);

  const statCards = [
    { label: "Clientes activos",     value: stats.total_customers  ?? 0, delta: null,            icon: "👥" },
    { label: "Sellos otorgados",      value: stats.total_stamps     ?? 0, delta: null,            icon: "⭐" },
    { label: "Recompensas canjeadas", value: stats.total_redeemed   ?? 0, delta: null,            icon: "🎁" },
    { label: "Tasa de retención",     value: `${stats.retention_rate ?? 0}%`, delta: null,       icon: "🔄" },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Métricas del <span>Negocio</span></h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card mb-4">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
          Sellos otorgados — últimos 7 días
        </h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              axisLine={false} tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            />
            <YAxis hide domain={[0, maxBar + 1]} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-raised)", border: "0.5px solid var(--border-gold)",
                borderRadius: 8, fontSize: 12, color: "var(--text-primary)",
              }}
              cursor={{ fill: "rgba(201,168,76,0.06)" }}
              formatter={(v: number) => [v, "Sellos"]}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {weekData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.total === maxBar ? "var(--gold-400)" : "var(--gold-700)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement ring + top customers */}
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Engagement Score</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="35" fill="none" stroke="var(--bg-overlay)" strokeWidth="8"/>
              <circle
                cx="45" cy="45" r="35" fill="none"
                stroke="var(--gold-400)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="219.9"
                strokeDashoffset={219.9 - (219.9 * Math.min((stats.retention_rate ?? 0) / 100, 1))}
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <text x="45" y="50" textAnchor="middle" fontSize="18" fontWeight="600"
                fill="var(--gold-400)" fontFamily="var(--font-serif)">
                {stats.retention_rate ?? 0}
              </text>
            </svg>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-serif)", color: "var(--gold-400)" }}>
                {(stats.retention_rate ?? 0) >= 70 ? "Excelente" : (stats.retention_rate ?? 0) >= 50 ? "Bueno" : "En progreso"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
                Tasa de clientes que<br/>regresaron este mes
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Top Clientes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topCustomers.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Aún no hay datos</p>
            ) : topCustomers.slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: i === 0 ? "var(--gold-700)" : "var(--bg-overlay)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: i === 0 ? "var(--gold-200)" : "var(--text-secondary)",
                  flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.customers?.name ?? c.customers?.phone ?? "Sin nombre"}
                  </div>
                  <div style={{ height: 4, background: "var(--bg-overlay)", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(c.total_visits / (topCustomers[0]?.total_visits || 1)) * 100}%`,
                      background: "linear-gradient(90deg,var(--gold-700),var(--gold-400))",
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--gold-400)", fontWeight: 600, flexShrink: 0 }}>
                  {c.total_visits} visitas
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
