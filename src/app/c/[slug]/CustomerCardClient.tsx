"use client";
import { useState } from "react";
import type { Business, LoyaltyProgram, Customer, LoyaltyBalance } from "@/types";

interface Survey {
  id: string;
  banner_message: string;
  question: string;
  option_a: string;
  option_b: string;
  votes_a: number;
  votes_b: number;
}

interface Props {
  business: Business & { loyalty_programs: LoyaltyProgram[] };
  program: LoyaltyProgram | null;
  customer: Customer | null;
  balance: LoyaltyBalance | null;
  survey: Survey | null;
}

export default function CustomerCardClient({ business, program, customer, balance, survey }: Props) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState({ a: survey?.votes_a ?? 0, b: survey?.votes_b ?? 0 });
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", phone: "" });
  const [registered, setRegistered] = useState(false);
  const [regError, setRegError] = useState("");
  const [showRegister, setShowRegister] = useState(!customer);

  const threshold = program?.reward_threshold ?? 10;
  const currentStamps = balance?.current_points ?? 0;
  const totalRedeemed = balance?.total_redeemed ?? 0;
  const pct = Math.min((currentStamps / threshold) * 100, 100);
  const color = business.primary_color ?? "#C9A84C";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tarjetacliente.vip";

  async function handleVote(option: "a" | "b") {
    if (voted) return;
    const res = await fetch("/api/survey/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: business.id, option }),
    });
    if (res.ok) {
      setVoted(true);
      setVotes((v) => ({ ...v, [option]: v[option as "a" | "b"] + 1 }));
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (!regForm.name && !regForm.phone) { setRegError("Ingresa tu nombre o teléfono"); return; }
    setRegistering(true);
    const res = await fetch("/api/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: business.id, name: regForm.name, phone: regForm.phone }),
    });
    setRegistering(false);
    if (!res.ok) { const d = await res.json(); setRegError(d.error ?? "Error"); return; }
    setRegistered(true);
    setShowRegister(false);
  }

  const totalVotes = votes.a + votes.b;
  const pctA = totalVotes > 0 ? Math.round((votes.a / totalVotes) * 100) : 0;
  const pctB = totalVotes > 0 ? Math.round((votes.b / totalVotes) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px 48px",
    }}>
      {/* Domain badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 28,
        background: "rgba(201,168,76,0.08)", border: "0.5px solid var(--border-gold)",
        borderRadius: 999, padding: "5px 14px",
        fontSize: 11, fontWeight: 700, color: "var(--gold-400)", letterSpacing: "0.06em",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)" }} />
        tarjetacliente.vip
      </div>

      {/* THE WALLET CARD */}
      <div style={{ width: "100%", maxWidth: 360, marginBottom: 24 }}>
        <div className="wallet-card" style={{
          background: `linear-gradient(135deg, #0E0900, #1E1500, #2E2000)`,
        }}>
          <div className="wallet-card-border" />
          <div className="wallet-card-shimmer" />

          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 18, color: "#000",
              overflow: "hidden",
            }}>
              {business.logo_url
                ? <img src={business.logo_url} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : business.name.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, color }}>
                {business.name}
              </div>
              <div style={{ fontSize: 9, color: `${color}88`, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Programa de Lealtad
              </div>
            </div>
          </div>

          {/* Stamps progress label */}
          <div style={{ textAlign: "center", fontSize: 11, color: `${color}99`, letterSpacing: "0.04em", marginBottom: 8 }}>
            {currentStamps} / {threshold} Sellos para tu recompensa
          </div>

          {/* Stamps grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${threshold <= 5 ? threshold : 5}, 1fr)`,
            gap: 8, marginBottom: 14,
          }}>
            {Array.from({ length: Math.min(threshold, 10) }).map((_, i) => (
              <div
                key={i}
                className={`stamp-circle ${i < currentStamps ? "stamp-filled" : "stamp-empty"}`}
                style={{ fontSize: 15 }}
              >
                {i < currentStamps ? "⭐" : ""}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              borderRadius: 10, transition: "width 0.8s ease",
            }} />
          </div>

          {/* Reward */}
          <div style={{
            textAlign: "center", paddingTop: 14,
            borderTop: `0.5px solid ${color}25`,
          }}>
            <div style={{ fontSize: 10, color: `${color}77`, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Tu próxima Recompensa
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 700, color, marginTop: 3 }}>
              {program?.reward_description ?? "Tu Recompensa"}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${color}15`,
          }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Cliente</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                {customer?.name ?? (registered ? regForm.name : "Invitado")}
              </div>
              {totalRedeemed > 0 && (
                <div style={{ fontSize: 10, color: `${color}88`, marginTop: 2 }}>
                  {totalRedeemed} recompensa{totalRedeemed !== 1 ? "s" : ""} canjeada{totalRedeemed !== 1 ? "s" : ""}
                </div>
              )}
            </div>
            <div style={{ fontSize: 9, color: `${color}44`, letterSpacing: "0.08em" }}>
              tarjetacliente.vip
            </div>
          </div>
        </div>
      </div>

      {/* Add to Wallet buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href={`/api/wallet/apple?slug=${business.slug}${customer ? `&token=${customer.qr_token}` : ""}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px", borderRadius: 12,
            background: "#000", color: "#fff", border: "1px solid #333",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Agregar a Apple Wallet
        </a>
        <a
          href={`/api/wallet/google?slug=${business.slug}${customer ? `&token=${customer.qr_token}` : ""}`}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px", borderRadius: 12,
            background: "#fff", color: "#111", border: "1px solid #ddd",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Wallet
        </a>
      </div>

      {/* Register form (if not a known customer) */}
      {showRegister && !registered && (
        <div style={{ width: "100%", maxWidth: 360, marginBottom: 24 }}>
          <div className="card card-gold" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              Únete al programa
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 18 }}>
              Regístrate para guardar tus sellos y recibir tu recompensa.
            </p>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Tu nombre</label>
                <input className="input" placeholder="Ej: Ana García"
                  value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="input" placeholder="4442227225" type="tel"
                  value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
              </div>
              {regError && <div style={{ fontSize: 12, color: "var(--error)" }}>{regError}</div>}
              <button className="btn btn-gold btn-block" type="submit" disabled={registering}>
                {registering ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Registrando…</> : "Registrarme"}
              </button>
            </form>
          </div>
        </div>
      )}

      {registered && (
        <div style={{
          width: "100%", maxWidth: 360, marginBottom: 24,
          background: "rgba(76,175,130,0.1)", border: "0.5px solid rgba(76,175,130,0.3)",
          borderRadius: "var(--r-lg)", padding: "16px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>¡Bienvenido al programa!</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Ya puedes acumular sellos. Muestra esta página en caja.
          </div>
        </div>
      )}

      {/* Survey */}
      {survey && (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12,
              background: "var(--bg-raised)", border: "0.5px solid var(--border-gold)",
              borderRadius: 999, padding: "4px 10px",
              fontSize: 11, fontWeight: 700, color: "var(--gold-400)",
            }}>
              ⭐ {survey.banner_message}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, lineHeight: 1.4 }}>
              {survey.question}
            </p>

            {!voted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => handleVote("a")}
                  className="btn btn-block"
                  style={{ justifyContent: "center", padding: "12px" }}
                >
                  {survey.option_a}
                </button>
                <button
                  onClick={() => handleVote("b")}
                  className="btn btn-block"
                  style={{ justifyContent: "center", padding: "12px" }}
                >
                  {survey.option_b}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: survey.option_a, pct: pctA, count: votes.a },
                  { label: survey.option_b, pct: pctB, count: votes.b },
                ].map((opt) => (
                  <div key={opt.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span>{opt.label}</span>
                      <span style={{ fontWeight: 700, color: "var(--gold-400)" }}>{opt.pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 7 }}>
                      <div className="progress-fill" style={{ width: `${opt.pct}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{opt.count} votos</div>
                  </div>
                ))}
                <div style={{
                  marginTop: 8, fontSize: 12, color: "var(--success)", fontWeight: 600,
                  textAlign: "center",
                }}>
                  ✓ ¡Gracias! Tu sello extra será acreditado.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Impulsado por</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 700 }}>
          tarjetacliente<span style={{ color: "var(--gold-400)" }}>.vip</span>
        </div>
      </div>
    </div>
  );
}
