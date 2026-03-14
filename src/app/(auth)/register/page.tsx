"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ businessName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden"); return; }
    if (form.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { business_name: form.businessName },
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
    router.refresh();
  }

  const steps = ["Crea tu cuenta", "Se genera tu tarjeta", "Comparte con clientes"];

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 52, height: 52, borderRadius: 14,
          background: "linear-gradient(135deg,var(--gold-700),var(--gold-400))",
          marginBottom: 14,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Empieza gratis hoy
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Hasta 100 clientes sin costo · Sin tarjeta de crédito
        </p>
      </div>

      {/* How it works */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, position: "relative" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
            {i < steps.length - 1 && (
              <div style={{
                position: "absolute", top: 12, left: "60%", width: "80%", height: 1,
                background: "var(--border-gold)",
              }} />
            )}
            <div style={{
              width: 26, height: 26, borderRadius: "50%", margin: "0 auto 6px",
              background: "linear-gradient(135deg,var(--gold-700),var(--gold-400))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#000", position: "relative", zIndex: 1,
            }}>{i + 1}</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.3 }}>{s}</div>
          </div>
        ))}
      </div>

      <div className="card card-gold" style={{ padding: 28 }}>
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nombre de tu negocio</label>
            <input
              className="input"
              placeholder="Ej: Barbería El Rey"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="tu@negocio.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(226,75,74,0.1)", border: "0.5px solid rgba(226,75,74,0.3)",
              borderRadius: "var(--r-md)", padding: "10px 14px",
              fontSize: 12, color: "var(--error)",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gold btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />Creando cuenta…</>
              : "✦ Crear cuenta gratis"
            }
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            Al registrarte aceptas nuestros{" "}
            <Link href="/terminos" style={{ color: "var(--gold-400)", textDecoration: "none" }}>Términos</Link>
            {" "}y{" "}
            <Link href="/privacidad" style={{ color: "var(--gold-400)", textDecoration: "none" }}>Privacidad</Link>
          </p>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--gold-400)", fontWeight: 600, textDecoration: "none" }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
