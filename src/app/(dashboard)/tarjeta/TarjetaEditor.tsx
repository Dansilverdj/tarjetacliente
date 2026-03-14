"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import type { Business, LoyaltyProgram } from "@/types";

interface Props { business: Business; program: LoyaltyProgram | null; }

const COLORS = [
  { label: "Dorado",    value: "#C9A84C", bg: "linear-gradient(135deg,#0E0900,#2E2000)" },
  { label: "Platino",   value: "#B0BEC5", bg: "linear-gradient(135deg,#0D0D12,#1A1A2A)" },
  { label: "Esmeralda", value: "#1D9E75", bg: "linear-gradient(135deg,#041A10,#0F3020)" },
  { label: "Rubí",      value: "#E24B4A", bg: "linear-gradient(135deg,#1A0505,#380D0D)" },
  { label: "Zafiro",    value: "#4A90D9", bg: "linear-gradient(135deg,#050D1A,#0D1E38)" },
];

export default function TarjetaEditor({ business: init, program: initProg }: Props) {
  const supabase = createClient();
  const [biz, setBiz] = useState(init);
  const [prog, setProg] = useState(initProg);
  const [colorIdx, setColorIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const previewStamps = 4;

  const threshold = prog?.reward_threshold ?? 10;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tarjetacliente.vip";
  const cardUrl = `${appUrl}/c/${biz.slug}`;
  const color = COLORS[colorIdx].value;

  async function handleSave() {
    setSaving(true);
    const { error: bizErr } = await supabase
      .from("businesses")
      .update({ name: biz.name, logo_url: biz.logo_url, primary_color: color })
      .eq("id", biz.id);

    if (prog) {
      await supabase
        .from("loyalty_programs")
        .update({ reward_description: prog.reward_description })
        .eq("id", prog.id);
    }
    setSaving(false);
    if (bizErr) { toast(bizErr.message, "error"); return; }
    toast("Cambios guardados ✓");
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Mi <span>Tarjeta</span></h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* ── FORM ── */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nombre del Negocio</label>
            <input className="input" value={biz.name}
              onChange={(e) => setBiz({ ...biz, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">URL del Logo</label>
            <input className="input" placeholder="https://ejemplo.com/logo.png"
              value={biz.logo_url ?? ""}
              onChange={(e) => setBiz({ ...biz, logo_url: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Texto de la Recompensa</label>
            <input className="input"
              value={prog?.reward_description ?? "Tu Recompensa"}
              onChange={(e) => setProg(prog ? { ...prog, reward_description: e.target.value } : null)}
              placeholder="Ej: Corte Gratis" />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Objetivo de Sellos
              <span className="badge badge-purple">🔒 Premium</span>
            </label>
            <input className="input" value={threshold} disabled style={{ opacity: 0.4 }} />
            <span className="form-hint">Actualiza al plan Pro para personalizar.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Color de la Tarjeta</label>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {COLORS.map((c, i) => (
                <button key={i} title={c.label} onClick={() => setColorIdx(i)} style={{
                  width: 30, height: 30, borderRadius: "50%", background: c.bg,
                  border: colorIdx === i ? `2px solid ${c.value}` : "2px solid transparent",
                  outline: colorIdx === i ? `2px solid ${c.value}44` : "none",
                  cursor: "pointer", transition: "transform 0.15s",
                  transform: colorIdx === i ? "scale(1.2)" : "scale(1)",
                }} />
              ))}
            </div>
          </div>

          <button className="btn btn-gold btn-block" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Guardando…</> : "Guardar Cambios"}
          </button>

          <div style={{
            background: "var(--bg-raised)", border: "0.5px solid var(--border-gold)",
            borderRadius: "var(--r-md)", padding: "12px 14px",
          }}>
            <div style={{ fontSize: 11, color: "var(--gold-400)", fontWeight: 700, marginBottom: 6 }}>✦ URL de la tarjeta cliente</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", wordBreak: "break-all", marginBottom: 8 }}>{cardUrl}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText(cardUrl); toast("URL copiada ✓"); }}>Copiar enlace</button>
              <a href={cardUrl} target="_blank" rel="noreferrer" className="btn btn-sm">Ver tarjeta →</a>
            </div>
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textAlign: "center", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Previsualización
          </div>

          <div className="wallet-card" style={{ background: COLORS[colorIdx].bg, maxWidth: 340, margin: "0 auto" }}>
            <div className="wallet-card-border" />
            <div className="wallet-card-shimmer" />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 16, color: "#000",
              }}>
                {biz.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 700, color }}>{biz.name}</div>
                <div style={{ fontSize: 9, color: `${color}99`, letterSpacing: "0.08em", textTransform: "uppercase" }}>tarjetacliente.vip</div>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 10, color: `${color}99`, letterSpacing: "0.04em", marginBottom: 6 }}>
              {previewStamps}/{threshold} Sellos para tu recompensa
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(threshold, 5)}, 1fr)`, gap: 8, marginBottom: 12 }}>
              {Array.from({ length: Math.min(threshold, 10) }).map((_, i) => (
                <div key={i} className={`stamp-circle ${i < previewStamps ? "stamp-filled" : "stamp-empty"}`} style={{ fontSize: 13 }}>
                  {i < previewStamps ? "⭐" : ""}
                </div>
              ))}
            </div>

            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${(previewStamps / threshold) * 100}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 10 }} />
            </div>

            <div style={{ textAlign: "center", paddingTop: 12, borderTop: `0.5px solid ${color}30` }}>
              <div style={{ fontSize: 10, color: `${color}88`, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tu próxima Recompensa</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 700, color, marginTop: 2 }}>
                {prog?.reward_description ?? "Tu Recompensa"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${color}20` }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Cliente</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Vista previa</div>
              </div>
              <div style={{ fontSize: 9, color: `${color}55`, letterSpacing: "0.08em" }}>tarjetacliente.vip</div>
            </div>
          </div>

          {/* Wallet buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/api/wallet/apple?slug=${biz.slug}`} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
              background: "#000", color: "#fff", border: "1px solid #333", fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple Wallet
            </a>
            <a href={`/api/wallet/google?slug=${biz.slug}`} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
              background: "#fff", color: "#1a1a1a", border: "1px solid #ddd", fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Wallet
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
