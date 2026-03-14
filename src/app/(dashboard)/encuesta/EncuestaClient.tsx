"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";

interface SurveyConfig {
  id?: string;
  business_id: string;
  banner_message: string;
  question: string;
  option_a: string;
  option_b: string;
  is_active: boolean;
  votes_a: number;
  votes_b: number;
}

interface Props { businessId: string }

export default function EncuestaClient({ businessId }: Props) {
  const supabase = createClient();
  const [config, setConfig] = useState<SurveyConfig>({
    business_id: businessId,
    banner_message: "¡Gana un sello extra! Contesta nuestra encuesta.",
    question: "",
    option_a: "",
    option_b: "",
    is_active: false,
    votes_a: 0,
    votes_b: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("surveys" as any)
        .select("*")
        .eq("business_id", businessId)
        .single();
      if (data) setConfig(data as SurveyConfig);
      setLoading(false);
    })();
  }, [businessId, supabase]);

  async function handleSave() {
    setSaving(true);
    const payload = {
      business_id: businessId,
      banner_message: config.banner_message,
      question: config.question,
      option_a: config.option_a,
      option_b: config.option_b,
      is_active: config.is_active,
    };

    let error;
    if (config.id) {
      ({ error } = await supabase.from("surveys" as any).update(payload).eq("id", config.id));
    } else {
      const { data, error: err } = await supabase.from("surveys" as any).insert(payload).select().single();
      error = err;
      if (data) setConfig({ ...config, ...(data as SurveyConfig) });
    }

    setSaving(false);
    if (error) { toast((error as any).message, "error"); return; }
    toast("Encuesta guardada ✓");
  }

  const total = config.votes_a + config.votes_b;
  const pctA = total > 0 ? Math.round((config.votes_a / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((config.votes_b / total) * 100) : 0;

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><span className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Gestionar <span>Encuesta</span></h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
        Configura la encuesta que verán tus clientes y revisa los resultados.
      </p>

      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Config */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Configuración</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {config.is_active ? "Activada" : "Desactivada"}
              </span>
              <div
                className={`toggle${config.is_active ? " on" : ""}`}
                onClick={() => setConfig({ ...config, is_active: !config.is_active })}
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Mensaje del Banner</label>
              <input className="input"
                value={config.banner_message}
                onChange={(e) => setConfig({ ...config, banner_message: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pregunta</label>
              <input className="input"
                placeholder="Ej: ¿Qué te pareció el servicio?"
                value={config.question}
                onChange={(e) => setConfig({ ...config, question: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Opción 1</label>
                <input className="input"
                  placeholder="Ej: Excelente"
                  value={config.option_a}
                  onChange={(e) => setConfig({ ...config, option_a: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Opción 2</label>
                <input className="input"
                  placeholder="Ej: Puede mejorar"
                  value={config.option_b}
                  onChange={(e) => setConfig({ ...config, option_b: e.target.value })}
                />
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Guardando…</> : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            Resultados de la Encuesta Actual
          </h2>

          {total === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Aún no hay respuestas. Activa la encuesta para empezar a recopilar datos.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{config.option_a || "Opción 1"} 👍</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold-400)" }}>{pctA}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pctA}%` }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{config.votes_a} respuestas</div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{config.option_b || "Opción 2"} 🤔</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>{pctB}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pctB}%`, background: "var(--bg-hover)" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{config.votes_b} respuestas</div>
              </div>

              <div style={{ fontSize: 11, color: "var(--text-muted)", paddingTop: 8, borderTop: "0.5px solid var(--border)" }}>
                Total de respuestas: <strong style={{ color: "var(--text-primary)" }}>{total}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
