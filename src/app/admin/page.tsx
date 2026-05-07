"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface DashStats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  prompts: Array<{ etapa: number; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number }>;
}

interface MonografiaCount {
  total: number;
  cap1: number;
  cap2: number;
  completadas: number;
}

function MetricCard({
  code,
  label,
  value,
  detail,
  index,
}: {
  code: string;
  label: string;
  value: number;
  detail: string;
  index: number;
}) {
  const counted = useCountUp(value, 800, 140 + index * 70);

  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="adm-label">{code}</span>
          <span className="adm-muted">live</span>
        </div>
        <div className="adm-kpi-num" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{counted}</div>
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(140, 154, 176, 0.16)" }}>
          <div className="text-[13px] font-bold" style={{ color: "#edf2fb" }}>{label}</div>
          <div className="adm-caption mt-1">{detail}</div>
        </div>
      </div>
    </StaggerRow>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [monoCounts, setMonoCounts] = useState<MonografiaCount>({ total: 0, cap1: 0, cap2: 0, completadas: 0 });
  const [tick, setTick] = useState("");

  useEffect(() => {
    const updateClock = () => {
      setTick(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => null);

    fetch("/api/admin/monografias")
      .then((r) => r.json())
      .then((d: Array<{ etapa_actual: number; status: string }>) => {
        if (!Array.isArray(d)) return;
        setMonoCounts({
          total: d.length,
          cap1: d.filter((m) => m.etapa_actual >= 1).length,
          cap2: d.filter((m) => m.etapa_actual >= 2).length,
          completadas: d.filter((m) => m.status === "completa" || m.etapa_actual >= 3).length,
        });
      })
      .catch(() => null);
  }, []);

  const usoTotal = stats?.prompts?.reduce((acc, prompt) => acc + prompt.uso_total, 0) ?? 0;
  const serviceHealth = [
    { code: "AI", label: "Cadena de IA", value: "Operativa, revisar servicios por asignacion", state: "stable" },
    { code: "MONO", label: "Monografia", value: "Validar que mono-001 tenga proveedor activo", state: "attention" },
    { code: "STORE", label: "Persistencia", value: "Modo archivo local .store en desarrollo", state: "stable" },
    { code: "LATEX", label: "Exportacion", value: "Motor tex disponible para compilacion", state: "stable" },
  ];

  const actions = [
    {
      href: "/admin/modelos",
      code: "CTRL/AI",
      title: "Modelos y APIs",
      desc: "Configura proveedores y elimina bloqueos de servicios como mono-001.",
    },
    {
      href: "/admin/usuarios",
      code: "CTRL/USR",
      title: "Usuarios",
      desc: "Controla altas, activaciones, roles y carga operativa real.",
    },
    {
      href: "/admin/estadisticas",
      code: "CTRL/STAT",
      title: "Estadisticas",
      desc: "Observa ritmo de generacion, etapas y comportamiento del sistema.",
    },
    {
      href: "/admin/prompts",
      code: "CTRL/PRM",
      title: "Prompts maestros",
      desc: "Ajusta el nucleo de redaccion sin perder el rigor del flujo.",
    },
  ];

  return (
    <AdminShell
      title="Centro de Mando"
      code="CMD CORE"
      subtitle="Bunker estrategico del sistema. Todo el control operativo, de IA y de alumnos converge aqui."
    >
      <div className="adm-card adm-card-strong p-5 mb-8">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="adm-label mb-3">panorama ejecutivo</div>
            <div className="text-[26px] font-bold leading-tight" style={{ color: "#edf2fb" }}>
              El panel ahora esta pensado como sala de control, no como consola improvisada.
            </div>
            <div className="adm-caption mt-3 max-w-2xl">
              Monitorea actividad real, riesgo operativo y estado de la IA desde una superficie mas sobria, mas firme y mas propia del nucleo administrativo.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="adm-surface p-4">
              <div className="adm-label mb-2">reloj</div>
              <div className="text-[22px] font-bold" style={{ color: "#edf2fb" }}>{tick || "--:--:--"}</div>
            </div>
            <div className="adm-surface p-4">
              <div className="adm-label mb-2">uso IA</div>
              <div className="text-[22px] font-bold" style={{ color: "#edf2fb" }}>{usoTotal}</div>
            </div>
            <div className="adm-surface p-4 col-span-2">
              <div className="adm-label mb-2">prioridad inmediata</div>
              <div className="text-[13px] font-bold" style={{ color: "#edf2fb" }}>
                Confirmar proveedor y modelo activos para el servicio de monografia.
              </div>
              <div className="adm-caption mt-1">Ese es el origen del error que viste en la captura del generador.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
        <MetricCard code="MONO" label="Monografias" value={monoCounts.total} detail="Total de proyectos creados." index={0} />
        <MetricCard code="CAP1" label="Capitulo I" value={monoCounts.cap1} detail="Proyectos con primer avance real." index={1} />
        <MetricCard code="CAP2" label="Capitulo II" value={monoCounts.cap2} detail="Trabajo que ya cruzo el marco teorico." index={2} />
        <MetricCard code="DONE" label="Completadas" value={monoCounts.completadas} detail="Documentos cerrados o listos." index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-8">
        <div className="adm-card p-5">
          <div className="adm-label mb-4">acceso tactico</div>
          <div className="grid gap-3 md:grid-cols-2">
            {actions.map((action, index) => (
              <StaggerRow key={action.href} index={index}>
                <Link href={action.href} className="block adm-surface p-4 no-underline transition-transform duration-150 hover:-translate-y-[2px]">
                  <div className="adm-label mb-2">{action.code}</div>
                  <div className="text-[15px] font-bold" style={{ color: "#edf2fb" }}>{action.title}</div>
                  <div className="adm-caption mt-2">{action.desc}</div>
                </Link>
              </StaggerRow>
            ))}
          </div>
        </div>

        <div className="adm-card p-5">
          <div className="adm-label mb-4">estado de sistema</div>
          <div className="space-y-2">
            {serviceHealth.map((item, index) => (
              <StaggerRow key={item.code} index={index + 4}>
                <div className="adm-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="adm-label mb-2">{item.code}</div>
                      <div className="text-[14px] font-bold" style={{ color: "#edf2fb" }}>{item.label}</div>
                      <div className="adm-caption mt-1">{item.value}</div>
                    </div>
                    <span className={item.state === "stable" ? "adm-badge-ok" : "adm-badge-warn"}>
                      {item.state === "stable" ? "estable" : "atencion"}
                    </span>
                  </div>
                </div>
              </StaggerRow>
            ))}
          </div>
        </div>
      </div>

      {stats ? (
        <div className="adm-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="adm-label">trafico por etapa</div>
            <div className="adm-muted">prompts activos registrados</div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {stats.prompts.map((prompt, index) => (
              <StaggerRow key={prompt.etapa} index={index + 8}>
                <div className="adm-surface p-4">
                  <div className="adm-label mb-2">etapa {prompt.etapa}</div>
                  <div className="text-[28px] font-bold" style={{ color: "#edf2fb" }}>{prompt.uso_total}</div>
                  <div className="adm-caption mt-2">
                    Este mes: {prompt.uso_este_mes} <br />
                    Tiempo promedio: {prompt.tiempo_promedio_seg > 0 ? `${prompt.tiempo_promedio_seg}s` : "sin dato"}
                  </div>
                </div>
              </StaggerRow>
            ))}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
