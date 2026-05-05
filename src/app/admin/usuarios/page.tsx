"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";
import type { UserRole, UserPlan } from "@/lib/auth";

interface UserRecord {
  id: string; email: string; name: string; picture?: string;
  role: UserRole; plan?: UserPlan; active: boolean;
  registered_at: string; activated_at?: string;
}

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-BO", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function UserKpi({ code, value, index }: { code: string; value: number; index: number }) {
  const counted = useCountUp(value, 700, 150 + index * 60);
  return (
    <StaggerRow index={index}>
      <div className="adm-card p-4 text-center">
        <div className="adm-label mb-2">{code}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#000" }}>{counted}</div>
      </div>
    </StaggerRow>
  );
}

export default function AdminUsuariosPage() {
  const [users, setUsers]     = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);
  const [filtro, setFiltro]   = useState<"todos" | "pendientes" | "activos">("todos");
  const [roles, setRoles]     = useState<Record<string, UserRole>>({});
  const [plans, setPlans]     = useState<Record<string, UserPlan>>({});

  const cargar = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/usuarios").then(r => r.json()).then(d => {
      const lista: UserRecord[] = d.usuarios ?? [];
      setUsers(lista);
      const r: Record<string, UserRole> = {};
      const p: Record<string, UserPlan> = {};
      for (const u of lista) {
        r[u.id] = u.role !== "admin" ? u.role : "estudiante";
        p[u.id] = u.plan ?? "estandar";
      }
      setRoles(r); setPlans(p); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function activar(user: UserRecord) {
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "activate", role: roles[user.id], plan: plans[user.id] }),
    });
    await cargar(); setSaving(null);
  }

  async function desactivar(user: UserRecord) {
    if (!confirm(`¿Desactivar a ${user.name}?`)) return;
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "deactivate" }),
    });
    await cargar(); setSaving(null);
  }

  async function actualizar(user: UserRecord) {
    setSaving(user.id);
    await fetch("/api/admin/usuarios", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "update", role: roles[user.id], plan: plans[user.id] }),
    });
    await cargar(); setSaving(null);
  }

  const visibles   = users.filter(u => {
    if (u.role === "admin") return false;
    if (filtro === "pendientes") return !u.active;
    if (filtro === "activos") return u.active;
    return true;
  });
  const pendientes = users.filter(u => u.role !== "admin" && !u.active).length;

  return (
    <AdminShell title="Usuarios" code="USR — gestión de acceso" subtitle="Activa cuentas, asigna rol y plan. Los usuarios pendientes esperan aprobación.">

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <UserKpi code="TOTAL"  value={users.filter(u => u.role !== "admin").length}                     index={0} />
        <UserKpi code="PEND"   value={pendientes}                                                         index={1} />
        <UserKpi code="ACTV"   value={users.filter(u => u.role !== "admin" && u.active).length}          index={2} />
        <UserKpi code="ESTUD"  value={users.filter(u => u.role === "estudiante" && u.active).length}     index={3} />
        <UserKpi code="DOCENT" value={users.filter(u => u.role === "docente" && u.active).length}        index={4} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6">
        <span className="adm-muted">// filtro:</span>
        {(["todos", "pendientes", "activos"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="adm-btn"
            style={{ fontWeight: filtro === f ? 700 : 400, background: filtro === f ? "#000" : "transparent", color: filtro === f ? "#fff" : "#666" }}
          >
            {f.toUpperCase()}
            {f === "pendientes" && pendientes > 0 && (
              <span style={{ marginLeft: 6, fontSize: 9 }}>[{pendientes}]</span>
            )}
          </button>
        ))}
        <button onClick={cargar} className="adm-btn ml-auto">↻ refresh</button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="adm-muted py-12 text-center">// cargando usuarios...</div>
      ) : visibles.length === 0 ? (
        <div className="adm-card p-10 text-center adm-muted">
          {filtro === "pendientes" ? "// sin usuarios pendientes" : "// sin usuarios registrados"}
        </div>
      ) : (
        <div className="adm-card">
          {visibles.map((user, i) => {
            const isSaving = saving === user.id;
            return (
              <StaggerRow key={user.id} index={i}>
                <div className="adm-row px-4" style={{ flexWrap: "wrap" }}>
                  {/* Avatar initial */}
                  <div style={{ width: 28, height: 28, background: "#f0f0f0", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {user.name[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{user.name}</div>
                    <div className="adm-muted">{user.email}</div>
                    <div className="adm-muted" style={{ fontSize: 9 }}>reg: {formatFecha(user.registered_at)}</div>
                  </div>

                  {/* Selectores */}
                  {user.role !== "admin" && (
                    <div className="flex gap-2">
                      <select value={roles[user.id] ?? "estudiante"} onChange={e => setRoles(r => ({ ...r, [user.id]: e.target.value as UserRole }))} className="adm-select">
                        <option value="estudiante">estudiante</option>
                        <option value="docente">docente</option>
                      </select>
                      <select value={plans[user.id] ?? "estandar"} onChange={e => setPlans(p => ({ ...p, [user.id]: e.target.value as UserPlan }))} className="adm-select">
                        <option value="estandar">estandar</option>
                        <option value="pro">pro</option>
                      </select>
                    </div>
                  )}

                  {/* Estado */}
                  <span className={user.active ? "adm-badge-ok" : "adm-badge-warn"}>
                    {user.active ? `[OK] ${user.role}` : "[PEND]"}
                  </span>

                  {/* Acciones */}
                  <div className="flex gap-2 shrink-0">
                    {!user.active ? (
                      <button onClick={() => activar(user)} disabled={isSaving} className="adm-btn adm-btn-primary">
                        {isSaving ? "..." : "activar"}
                      </button>
                    ) : (
                      <>
                        <button onClick={() => actualizar(user)} disabled={isSaving} className="adm-btn adm-btn-primary">
                          {isSaving ? "..." : "guardar"}
                        </button>
                        <button onClick={() => desactivar(user)} disabled={isSaving} className="adm-btn adm-btn-danger">
                          desactivar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </StaggerRow>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
