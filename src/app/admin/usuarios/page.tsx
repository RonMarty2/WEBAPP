"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";
import type { UserPlan, UserRole } from "@/lib/auth";

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

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function UserKpi({ code, value, index }: { code: string; value: number; index: number }) {
  const counted = useCountUp(value, 700, 150 + index * 60);
  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-4 text-center">
        <div className="adm-label mb-2">{code}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#edf2fb" }}>{counted}</div>
      </div>
    </StaggerRow>
  );
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "activos">("todos");
  const [roles, setRoles] = useState<Record<string, UserRole>>({});
  const [plans, setPlans] = useState<Record<string, UserPlan>>({});

  const cargar = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((d) => {
        const lista: UserRecord[] = d.usuarios ?? [];
        setUsers(lista);
        const nextRoles: Record<string, UserRole> = {};
        const nextPlans: Record<string, UserPlan> = {};
        for (const user of lista) {
          nextRoles[user.id] = user.role !== "admin" ? user.role : "estudiante";
          nextPlans[user.id] = user.plan ?? "estandar";
        }
        setRoles(nextRoles);
        setPlans(nextPlans);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargar();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargar]);

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

  const visibles = users.filter((user) => {
    if (user.role === "admin") return false;
    if (filtro === "pendientes") return !user.active;
    if (filtro === "activos") return user.active;
    return true;
  });
  const pendientes = users.filter((user) => user.role !== "admin" && !user.active).length;

  return (
    <AdminShell title="Usuarios" code="USR ACCESS" subtitle="Activa cuentas, asigna rol y controla el flujo real de alumnos dentro del sistema.">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <UserKpi code="TOTAL" value={users.filter((user) => user.role !== "admin").length} index={0} />
        <UserKpi code="PEND" value={pendientes} index={1} />
        <UserKpi code="ACTV" value={users.filter((user) => user.role !== "admin" && user.active).length} index={2} />
        <UserKpi code="ESTUD" value={users.filter((user) => user.role === "estudiante" && user.active).length} index={3} />
        <UserKpi code="DOCENT" value={users.filter((user) => user.role === "docente" && user.active).length} index={4} />
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="adm-muted">filtro:</span>
        {(["todos", "pendientes", "activos"] as const).map((item) => (
          <button key={item} onClick={() => setFiltro(item)} className={`adm-btn ${filtro === item ? "adm-btn-active" : ""}`}>
            {item.toUpperCase()}
            {item === "pendientes" && pendientes > 0 ? <span style={{ marginLeft: 6, fontSize: 9 }}>[{pendientes}]</span> : null}
          </button>
        ))}
        <button onClick={cargar} className="adm-btn ml-auto">refresh</button>
      </div>

      {loading ? (
        <div className="adm-muted py-12 text-center">{"// cargando usuarios..."}</div>
      ) : visibles.length === 0 ? (
        <div className="adm-card p-10 text-center adm-muted">
          {filtro === "pendientes" ? "// sin usuarios pendientes" : "// sin usuarios registrados"}
        </div>
      ) : (
        <div className="adm-card">
          {visibles.map((user, index) => {
            const isSaving = saving === user.id;
            return (
              <StaggerRow key={user.id} index={index}>
                <div className="adm-row px-4" style={{ flexWrap: "wrap" }}>
                  <div
                    className="adm-surface"
                    style={{
                      width: 34,
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      color: "#edf2fb",
                    }}
                  >
                    {user.name[0]?.toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2fb" }}>{user.name}</div>
                    <div className="adm-muted">{user.email}</div>
                    <div className="adm-muted" style={{ fontSize: 9 }}>reg: {formatFecha(user.registered_at)}</div>
                  </div>

                  {user.role !== "admin" ? (
                    <div className="flex gap-2">
                      <select
                        value={roles[user.id] ?? "estudiante"}
                        onChange={(e) => setRoles((prev) => ({ ...prev, [user.id]: e.target.value as UserRole }))}
                        className="adm-select"
                      >
                        <option value="estudiante">estudiante</option>
                        <option value="docente">docente</option>
                      </select>
                      <select
                        value={plans[user.id] ?? "estandar"}
                        onChange={(e) => setPlans((prev) => ({ ...prev, [user.id]: e.target.value as UserPlan }))}
                        className="adm-select"
                      >
                        <option value="estandar">estandar</option>
                        <option value="pro">pro</option>
                      </select>
                    </div>
                  ) : null}

                  <span className={user.active ? "adm-badge-ok" : "adm-badge-warn"}>
                    {user.active ? `[OK] ${user.role}` : "[PEND]"}
                  </span>

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
