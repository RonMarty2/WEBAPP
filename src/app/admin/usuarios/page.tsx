"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserRole, UserPlan } from "@/lib/auth";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  plan?: UserPlan;
  active: boolean;
  registered_at: string;
  activated_at?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  estudiante: "Estudiante",
  docente: "Docente",
};

const PLAN_LABELS: Record<string, string> = {
  estandar: "Estándar",
  pro: "Pro",
};

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-BO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "activos">("todos");

  // Per-row selectors
  const [roles, setRoles] = useState<Record<string, UserRole>>({});
  const [plans, setPlans] = useState<Record<string, UserPlan>>({});

  const cargar = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((d) => {
        const lista: UserRecord[] = d.usuarios ?? [];
        setUsers(lista);
        const r: Record<string, UserRole> = {};
        const p: Record<string, UserPlan> = {};
        for (const u of lista) {
          r[u.id] = u.role !== "admin" ? u.role : "estudiante";
          p[u.id] = u.plan ?? "estandar";
        }
        setRoles(r);
        setPlans(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function activar(user: UserRecord) {
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "activate", role: roles[user.id], plan: plans[user.id] }),
    });
    await cargar();
    setSaving(null);
  }

  async function desactivar(user: UserRecord) {
    if (!confirm(`¿Desactivar a ${user.name}?`)) return;
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "deactivate" }),
    });
    await cargar();
    setSaving(null);
  }

  async function actualizar(user: UserRecord) {
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "update", role: roles[user.id], plan: plans[user.id] }),
    });
    await cargar();
    setSaving(null);
  }

  const visibles = users.filter((u) => {
    if (u.role === "admin") return false;
    if (filtro === "pendientes") return !u.active;
    if (filtro === "activos") return u.active;
    return true;
  });

  const pendientes = users.filter((u) => u.role !== "admin" && !u.active).length;

  const selectStyle = {
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
    color: "#e2e8f0", padding: "6px 10px", fontSize: 13, cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>👥 Usuarios</h1>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>
          Activa cuentas, asigna rol y plan. Los usuarios pendientes esperan tu aprobación.
        </p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total usuarios", value: users.filter(u => u.role !== "admin").length, color: "#94a3b8" },
          { label: "Pendientes", value: pendientes, color: pendientes > 0 ? "#f59e0b" : "#22c55e" },
          { label: "Activos", value: users.filter(u => u.role !== "admin" && u.active).length, color: "#22c55e" },
          { label: "Estudiantes", value: users.filter(u => u.role === "estudiante" && u.active).length, color: "#06b6d4" },
          { label: "Docentes", value: users.filter(u => u.role === "docente" && u.active).length, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "12px 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {(["todos", "pendientes", "activos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              border: "1px solid",
              borderColor: filtro === f ? "#06b6d4" : "#1e293b",
              background: filtro === f ? "rgba(6,182,212,0.12)" : "transparent",
              color: filtro === f ? "#06b6d4" : "#64748b",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pendientes" && pendientes > 0 && (
              <span style={{ marginLeft: 6, background: "#f59e0b", color: "#000", borderRadius: 99, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>
                {pendientes}
              </span>
            )}
          </button>
        ))}
        <button onClick={cargar} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 6, border: "1px solid #1e293b", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualizar
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} /> Cargando...
        </div>
      ) : visibles.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          {filtro === "pendientes" ? "No hay usuarios pendientes." : "No hay usuarios registrados aún."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibles.map((user) => {
            const isSaving = saving === user.id;
            return (
              <div
                key={user.id}
                className="card"
                style={{
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  borderColor: !user.active ? "rgba(245,158,11,0.25)" : "transparent",
                  background: !user.active ? "rgba(245,158,11,0.03)" : undefined,
                }}
              >
                {/* Avatar */}
                {user.picture ? (
                  <img src={user.picture} alt="" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>
                    {user.name[0]}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{user.email}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>
                    Registro: {formatFecha(user.registered_at)}
                    {user.activated_at && <span style={{ marginLeft: 10 }}>· Activado: {formatFecha(user.activated_at)}</span>}
                  </div>
                </div>

                {/* Selectores rol + plan */}
                {user.role !== "admin" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <select
                      value={roles[user.id] ?? "estudiante"}
                      onChange={(e) => setRoles((r) => ({ ...r, [user.id]: e.target.value as UserRole }))}
                      style={selectStyle}
                    >
                      <option value="estudiante">🎓 Estudiante</option>
                      <option value="docente">👨‍🏫 Docente</option>
                    </select>
                    <select
                      value={plans[user.id] ?? "estandar"}
                      onChange={(e) => setPlans((p) => ({ ...p, [user.id]: e.target.value as UserPlan }))}
                      style={selectStyle}
                    >
                      <option value="estandar">⭐ Estándar</option>
                      <option value="pro">🚀 Pro</option>
                    </select>
                  </div>
                )}

                {/* Estado actual */}
                <div style={{ fontSize: 12, flexShrink: 0 }}>
                  {user.active ? (
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>
                      ● {ROLE_LABELS[user.role]} · {user.plan ? PLAN_LABELS[user.plan] : "—"}
                    </span>
                  ) : (
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>⏳ Pendiente</span>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {!user.active ? (
                    <button
                      onClick={() => activar(user)}
                      disabled={isSaving}
                      style={{
                        padding: "7px 16px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.4)",
                        background: "rgba(34,197,94,0.1)", color: "#4ade80", fontSize: 13,
                        cursor: isSaving ? "not-allowed" : "pointer", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {isSaving ? <div className="spinner" style={{ width: 12, height: 12 }} /> : null}
                      Activar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => actualizar(user)}
                        disabled={isSaving}
                        style={{
                          padding: "7px 14px", borderRadius: 7, border: "1px solid rgba(6,182,212,0.35)",
                          background: "rgba(6,182,212,0.08)", color: "#06b6d4", fontSize: 13,
                          cursor: isSaving ? "not-allowed" : "pointer",
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => desactivar(user)}
                        disabled={isSaving}
                        style={{
                          padding: "7px 14px", borderRadius: 7, border: "1px solid rgba(248,113,113,0.3)",
                          background: "transparent", color: "#f87171", fontSize: 13,
                          cursor: isSaving ? "not-allowed" : "pointer",
                        }}
                      >
                        Desactivar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
