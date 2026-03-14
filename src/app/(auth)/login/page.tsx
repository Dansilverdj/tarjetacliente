"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
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
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          tarjetacliente<span style={{ color: "var(--gold-400)" }}>.vip</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Inicia sesión en tu panel
        </p>
      </div>

      <div className="card card-gold" style={{ padding: 28 }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
              ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />Entrando…</>
              : "Iniciar Sesión"
            }
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register" style={{ color: "var(--gold-400)", fontWeight: 600, textDecoration: "none" }}>
            Regístrate gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
