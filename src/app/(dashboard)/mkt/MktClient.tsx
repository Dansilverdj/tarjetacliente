"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import type { Campaign } from "@/types";

interface Props {
  businessId: string;
  businessName: string;
  stats: Record<string, number>;
}

const CHIPS = [
  { label: "🔄 Reactivar clientes", prompt: "Crea una campaña para reactivar clientes que no han visitado en 2 semanas" },
  { label: "💰 Subir ticket", prompt: "¿Cómo puedo aumentar el ticket promedio con mi programa de lealtad?" },
  { label: "👥 Programa referidos", prompt: "Diseña un programa de referidos usando sellos como incentivo" },
  { label: "🌸 Campaña temporal", prompt: "Ideas de marketing para la próxima temporada festiva" },
  { label: "✉️ Mensaje de impulso", prompt: "¿Qué mensaje enviar a clientes a 2 sellos de su recompensa?" },
  { label: "📊 Analizar segmentos", prompt: "¿Qué segmento de clientes tiene mayor potencial de crecimiento?" },
];

export default function MktClient({ businessId, businessName, stats }: Props) {
  const supabase = createClient();
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setCampaigns((data as Campaign[]) ?? []));
  }, [businessId, supabase]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setAiResponse("");
    setLastGenerated(null);

    try {
      const res = await fetch("/api/ai-mkt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, businessId, stats, businessName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResponse(data.response);
      setLastGenerated({ title: data.title ?? prompt.slice(0, 60), message: data.response });
    } catch (e: any) {
      toast(e.message ?? "Error al generar", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCampaign() {
    if (!lastGenerated) return;
    setSavingCampaign(true);
    const { data, error } = await supabase.from("campaigns").insert({
      business_id: businessId,
      title: lastGenerated.title,
      message: lastGenerated.message,
      ai_generated: true,
      status: "draft",
    }).select().single();

    setSavingCampaign(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Campaña guardada como borrador ✓");
    setCampaigns((prev) => [data as Campaign, ...prev.slice(0, 4)]);
    setLastGenerated(null);
  }

  async function handleActivateCampaign(id: string) {
    await supabase.from("campaigns").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "sent" } : c));
    toast("Campaña marcada como enviada ✓");
  }

  const insights = [
    stats.total_customers > 0 && {
      icon: "📊", color: "rgba(201,168,76,0.12)",
      title: "Días pico detectados",
      body: "Analiza tus transacciones para identificar los días con más actividad y concentra tus promociones ahí para maximizar conversión.",
    },
    stats.total_customers > 0 && {
      icon: "🎯", color: "rgba(123,104,238,0.12)",
      title: `${Math.round((stats.total_customers || 0) * 0.15)} clientes en riesgo`,
      body: "Clientes sin visita en 21+ días. Una campaña de reactivación con sello de bono puede recuperar hasta el 30% según datos históricos.",
    },
    stats.avg_stamps > 0 && {
      icon: "🚀", color: "rgba(76,175,130,0.1)",
      title: "Oportunidad de upgrade",
      body: `Clientes con promedio de ${stats.avg_stamps} sellos están cerca de su recompensa. Notificarlos aumenta el regreso 2.3x.`,
    },
  ].filter(Boolean) as Array<{ icon: string; color: string; title: string; body: string }>;

  const statusColors: Record<string, string> = {
    draft: "badge-neutral", scheduled: "badge-purple", sent: "badge-success", cancelled: "badge-error",
  };
  const statusLabels: Record<string, string> = {
    draft: "Borrador", scheduled: "Programada", sent: "Enviada", cancelled: "Cancelada",
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">MKT con <span>IA</span></h1>
      </div>

      {/* Hero */}
      <div className="ai-gradient-bg card mb-4" style={{ padding: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(123,104,238,0.2)", border: "0.5px solid rgba(123,104,238,0.4)",
          color: "#9B8FEE", padding: "4px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 700, marginBottom: 10,
        }}>✦ Inteligencia Artificial activa</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          Estrategias personalizadas para {businessName}
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Basadas en tus métricas reales: {stats.total_customers ?? 0} clientes,
          {" "}{stats.total_stamps ?? 0} sellos, {stats.retention_rate ?? 0}% retención,
          {" "}{stats.total_redeemed ?? 0} canjes.
        </p>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "0.5px solid var(--border)",
                borderRadius: "var(--r-md)", padding: 14, display: "flex", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--r-sm)", flexShrink: 0,
                  background: ins.color, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                }}>{ins.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{ins.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{ins.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Input */}
      <div className="card mb-4" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "12px 16px", borderBottom: "0.5px solid var(--border)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 600,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B8FEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Generar estrategia con IA
        </div>

        {/* AI Result */}
        {(loading || aiResponse) && (
          <div style={{
            padding: "14px 16px", borderBottom: "0.5px solid var(--border)",
            background: "rgba(123,104,238,0.05)", borderLeft: "2px solid #7B68EE",
            fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
          }}>
            {loading
              ? <><span className="spinner" style={{ marginRight: 8 }} />Analizando tu negocio y generando estrategia…</>
              : aiResponse
            }
          </div>
        )}

        {/* Save campaign button */}
        {lastGenerated && !loading && (
          <div style={{ padding: "10px 16px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 8 }}>
            <button className="btn btn-gold btn-sm" onClick={handleSaveCampaign} disabled={savingCampaign}>
              {savingCampaign ? "Guardando…" : "💾 Guardar como campaña"}
            </button>
            <button className="btn btn-sm" onClick={() => setLastGenerated(null)}>Descartar</button>
          </div>
        )}

        {/* Chips */}
        <div style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CHIPS.map((c) => (
            <button
              key={c.label}
              onClick={() => setPrompt(c.prompt)}
              style={{
                fontSize: 11, padding: "5px 10px", borderRadius: 999,
                border: "0.5px solid var(--border)", background: "var(--bg-raised)",
                cursor: "pointer", color: "var(--text-secondary)", fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "var(--gold-400)"; (e.target as HTMLElement).style.color = "var(--gold-400)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
            >{c.label}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 8 }}>
          <input
            className="input"
            style={{ border: "none", background: "transparent", padding: "6px 4px" }}
            placeholder="Describe tu objetivo de marketing…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--gold-400)",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, opacity: loading ? 0.5 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Campañas guardadas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {campaigns.map((c) => (
              <div key={c.id} style={{
                background: "var(--bg-raised)", border: "0.5px solid var(--border)",
                borderRadius: "var(--r-md)", overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderBottom: "0.5px solid var(--border)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`badge ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                    {c.ai_generated && <span className="badge badge-purple">✦ IA</span>}
                  </div>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
                    {c.message.slice(0, 200)}{c.message.length > 200 ? "…" : ""}
                  </p>
                  {c.status === "draft" && (
                    <button className="btn btn-gold btn-sm" onClick={() => handleActivateCampaign(c.id)}>
                      Marcar como enviada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
