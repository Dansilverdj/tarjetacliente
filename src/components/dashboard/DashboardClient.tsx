"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import type { Customer, LoyaltyBalance, LoyaltyProgram, Business } from "@/types";

interface CustomerRow extends Customer {
  loyalty_balances: LoyaltyBalance[];
}

interface Props {
  business: Business;
  program: LoyaltyProgram | null;
  initialCustomers: CustomerRow[];
  initialCount: number;
}

const PAGE_SIZE = 20;

export default function DashboardClient({ business, program, initialCustomers, initialCount }: Props) {
  const supabase = createClient();
  const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showSello, setShowSello] = useState<CustomerRow | null>(null);
  const [showEdit, setShowEdit] = useState<CustomerRow | null>(null);

  // New customer form
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async (q: string, pg: number) => {
    setLoading(true);
    let query = supabase
      .from("customers")
      .select(`*, loyalty_balances(*)`, { count: "exact" })
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("joined_at", { ascending: false })
      .range((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE - 1);

    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, count: total } = await query;
    setCustomers((data as CustomerRow[]) ?? []);
    setCount(total ?? 0);
    setLoading(false);
  }, [supabase, business.id]);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search, 1), 300);
    setPage(1);
    return () => clearTimeout(t);
  }, [search, fetchCustomers]);

  async function handleAddCustomer() {
    if (!form.name && !form.phone) {
      toast("Ingresa al menos nombre o teléfono", "error"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("customers").insert({
      business_id: business.id,
      name: form.name || null,
      phone: form.phone || null,
      email: form.email || null,
    });
    setSaving(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Cliente agregado ✓");
    setShowAdd(false);
    setForm({ name: "", phone: "", email: "" });
    fetchCustomers(search, page);
  }

  async function handleAddStamp(customer: CustomerRow) {
    if (!program) { toast("No hay programa activo", "error"); return; }
    setSaving(true);
    const { error } = await supabase.rpc("add_stamp", {
      p_business_id: business.id,
      p_customer_id: customer.id,
      p_program_id: program.id,
    });
    setSaving(false);
    if (error) { toast(error.message, "error"); return; }
    toast(`Sello agregado a ${customer.name ?? customer.phone} ✓`);
    setShowSello(null);
    fetchCustomers(search, page);
  }

  async function handleUpdateCustomer() {
    if (!showEdit) return;
    setSaving(true);
    const { error } = await supabase
      .from("customers")
      .update({ name: showEdit.name, phone: showEdit.phone, email: showEdit.email })
      .eq("id", showEdit.id);
    setSaving(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Cliente actualizado ✓");
    setShowEdit(null);
    fetchCustomers(search, page);
  }

  async function handleExportCSV() {
    const { data } = await supabase
      .from("customers")
      .select(`*, loyalty_balances(*)`)
      .eq("business_id", business.id)
      .eq("is_active", true);

    if (!data?.length) { toast("No hay clientes para exportar", "info"); return; }

    const headers = ["Nombre", "Teléfono", "Email", "Fecha Inscripción", "Sellos", "Canjes"];
    const rows = data.map((c: CustomerRow) => {
      const bal = c.loyalty_balances?.[0];
      return [
        c.name ?? "", c.phone ?? "", c.email ?? "",
        new Date(c.joined_at).toLocaleDateString("es-MX"),
        bal?.current_points ?? 0, bal?.total_redeemed ?? 0,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `clientes-${business.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast("CSV descargado ✓");
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const getBalance = (c: CustomerRow) => c.loyalty_balances?.[0];

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard de <span>Clientes</span></h1>
        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-sm" onClick={() => window.location.href = "/api/scan"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><line x1="14" y1="17" x2="20" y2="17"/><line x1="17" y1="14" x2="17" y2="20"/>
            </svg>
            Escanear QR
          </button>
          <button className="btn btn-gold btn-sm" onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Cliente
          </button>
          <button className="btn btn-sm" onClick={handleExportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap mb-4">
        <svg className="search-icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="input"
          placeholder="Buscar por nombre, teléfono o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <span className="spinner" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Inscripción</th>
                <th>Sellos</th>
                <th>Recompensas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    {search ? "No se encontraron clientes" : "Aún no hay clientes. ¡Agrega el primero!"}
                  </td>
                </tr>
              ) : customers.map((c) => {
                const bal = getBalance(c);
                const stamps = bal?.current_points ?? 0;
                const redeemed = bal?.total_redeemed ?? 0;
                const threshold = program?.reward_threshold ?? 10;
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name ?? "—"}</strong></td>
                    <td style={{ color: "var(--text-secondary)" }}>{c.phone ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{c.email ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {new Date(c.joined_at).toLocaleDateString("es-MX")}
                    </td>
                    <td>
                      <span className="badge badge-gold">⭐ {stamps}/{threshold}</span>
                    </td>
                    <td>
                      <span className={`badge ${redeemed > 0 ? "badge-gold" : "badge-neutral"}`}>
                        {redeemed}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-gold btn-sm"
                          onClick={() => setShowSello(c)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Sello
                        </button>
                        <button className="btn btn-sm" onClick={() => setShowEdit(c)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderTop: "0.5px solid var(--border)",
        }}>
          <button
            className="btn btn-sm"
            disabled={page <= 1}
            onClick={() => { const p = page - 1; setPage(p); fetchCustomers(search, p); }}
          >Anterior</button>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Página {page} de {totalPages || 1} · {count} clientes
          </span>
          <button
            className="btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => { const p = page + 1; setPage(p); fetchCustomers(search, p); }}
          >Siguiente</button>
        </div>
      </div>

      {/* ── MODAL: Nuevo Cliente ── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-gold-light)", marginBottom: 6 }}>
              Nuevo Cliente
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
              Ingresa los datos del cliente para registrarlo en tu programa.
            </p>
            <div className="flex-col gap-4" style={{ display: "flex" }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="input" placeholder="Ej: Daniel García" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="input" placeholder="4442227225" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span style={{ color: "var(--text-muted)" }}>(opcional)</span></label>
                <input className="input" placeholder="correo@ejemplo.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <button className="btn btn-gold btn-block" onClick={handleAddCustomer} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Guardando…</> : "Agregar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Agregar Sello ── */}
      {showSello && (
        <div className="modal-backdrop" onClick={() => setShowSello(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSello(null)}>✕</button>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-gold-light)", marginBottom: 6 }}>
              Agregar Sello
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
              Cliente: <strong style={{ color: "var(--text-primary)" }}>{showSello.name ?? showSello.phone}</strong>
            </p>

            {/* Stamp preview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
              {Array.from({ length: program?.reward_threshold ?? 10 }).map((_, i) => {
                const current = getBalance(showSello)?.current_points ?? 0;
                return (
                  <div
                    key={i}
                    className={`stamp-circle ${i < current ? "stamp-filled" : "stamp-empty"}`}
                    style={{ fontSize: 16 }}
                  >
                    {i < current ? "⭐" : ""}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", marginBottom: 20 }}>
              Sellos actuales: <strong style={{ color: "var(--gold-400)" }}>
                {getBalance(showSello)?.current_points ?? 0}
              </strong> / {program?.reward_threshold ?? 10}
            </div>

            <button className="btn btn-gold btn-block" onClick={() => handleAddStamp(showSello)} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />Agregando…</> : "✦ Confirmar Sello"}
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Cliente ── */}
      {showEdit && (
        <div className="modal-backdrop" onClick={() => setShowEdit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEdit(null)}>✕</button>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-gold-light)", marginBottom: 20 }}>
              Editar Cliente
            </h2>
            <div className="flex-col gap-4" style={{ display: "flex" }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="input" value={showEdit.name ?? ""}
                  onChange={(e) => setShowEdit({ ...showEdit, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="input" value={showEdit.phone ?? ""}
                  onChange={(e) => setShowEdit({ ...showEdit, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" value={showEdit.email ?? ""}
                  onChange={(e) => setShowEdit({ ...showEdit, email: e.target.value })} />
              </div>
              <button className="btn btn-gold btn-block" onClick={handleUpdateCustomer} disabled={saving}>
                {saving ? "Guardando…" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
