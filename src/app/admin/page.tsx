"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashStats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  prompts: Array<{ etapa: number; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number }>;
}
interface MonografiaCount { total: number; cap1: number; cap2: number; completadas: number; }

// ── Hook: Typewriter ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 38, delay = 120) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(id); setDone(true); }
      }, speed);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [text, speed, delay]);
  return { displayed, done };
}

// ── Hook: Count-up ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900, delay = 300) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      if (elapsed < delay) { raf.current = requestAnimationFrame(step); return; }
      const progress = Math.min((elapsed - delay) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, delay]);
  return value;
}

// ── Animated KPI ─────────────────────────────────────────────────────────────
function KpiCard({ label, code, value }: { label: string; code: string; value: number }) {
  const n = useCountUp(value, 800, 200);
  return (
    <div className="admin-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="admin-label">{code}</span>
        <span className="admin-muted text-[10px]">[LIVE]</span>
      </div>
      <div className="admin-number">{n}</div>
      <div className="admin-caption border-t border-[#e5e7eb] pt-2">{label}</div>
    </div>
  );
}

// ── Typewriter line ───────────────────────────────────────────────────────────
function TypeLine({ text, speed = 22, delay = 0, className = "" }: { text: string; speed?: number; delay?: number; className?: string }) {
  const { displayed, done } = useTypewriter(text, speed, delay);
  return (
    <span className={className}>
      {displayed}
      {!done && <span className="admin-cursor">█</span>}
    </span>
  );
}

// ── Staggered row reveal ──────────────────────────────────────────────────────
function StaggerRow({ children, index }: { children: React.ReactNode; index: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 * index + 400);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]           = useState<DashStats | null>(null);
  const [monoCounts, setMonoCounts] = useState<MonografiaCount>({ total: 0, cap1: 0, cap2: 0, completadas: 0 });
  const [tick, setTick]             = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then(r => r.json()).then(d => setStats(d)).catch(() => null);
    fetch("/api/admin/monografias")
      .then(r => r.json())
      .then((d: Array<{ etapa_actual: number; status: string }>) => {
        if (!Array.isArray(d)) return;
        setMonoCounts({
          total:       d.length,
          cap1:        d.filter(m => m.etapa_actual >= 1).length,
          cap2:        d.filter(m => m.etapa_actual >= 2).length,
          completadas: d.filter(m => m.status === "completa" || m.etapa_actual >= 3).length,
        });
      }).catch(() => null);
  }, []);

  const usoTotal = stats?.prompts?.reduce((a, p) => a + p.uso_total, 0) ?? 0;
  const now      = new Date();
  const timeStr  = now.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const AI_LABELS: Record<number, string> = { 0: "TEMA", 1: "CAP_I", 2: "CAP_II", 3: "CAP_III-V" };

  const ACTIONS = [
    { href: "/admin/usuarios",     code: "USR", label: "Usuarios & Docs",  desc: "Monografías activas y documentos subidos." },
    { href: "/admin/estadisticas", code: "STAT", label: "Estadísticas",    desc: "Métricas de generación por etapa." },
    { href: "/admin/modelos",      code: "API",  label: "Modelos & APIs",  desc: "Groq, OpenAI, Anthropic — cascade fallback." },
    { href: "/admin/prompts",      code: "PRMT", label: "Prompts",         desc: "Instrucciones de IA por etapa." },
  ];

  const STATUS = [
    { code: "MEM",  label: "Almacenamiento",  value: "IN-MEMORY (session)",            state: "WARN" },
    { code: "AI",   label: "IA Provider",     value: "Groq > Anthropic > OpenAI",      state: "OK"   },
    { code: "TEX",  label: "LaTeX Engine",    value: "Generator .tex available",        state: "OK"   },
    { code: "PAY",  label: "Pagos",           value: "Pending integration",             state: "IDLE" },
  ];

  const stateColor: Record<string, string> = {
    OK:   "text-[#000]",
    WARN: "text-[#555]",
    IDLE: "text-[#aaa]",
  };
  const stateDot: Record<string, string> = {
    OK:   "bg-[#000]",
    WARN: "bg-[#888]",
    IDLE: "bg-[#ccc]",
  };

  return (
    <>
      {/* ── Scoped styles (only admin) ──────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;400;700&display=swap');

        .admin-mono * { font-family: 'IBM Plex Mono', ui-monospace, monospace !important; }

        .admin-label  { font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
                        text-transform: uppercase; color: #000; }
        .admin-muted  { font-size: 10px; color: #999; }
        .admin-caption{ font-size: 11px; color: #666; line-height: 1.4; }
        .admin-number { font-size: 40px; font-weight: 700; color: #000; line-height: 1; letter-spacing: -0.02em; }
        .admin-card   { background: #fff; border: 1px solid #e5e7eb; }
        .admin-divider{ border: none; border-top: 1px solid #e5e7eb; margin: 0; }
        .admin-row    { display: flex; align-items: center; gap: 12px;
                        padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .admin-row:last-child { border-bottom: none; }

        @keyframes admin-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .admin-cursor { display:inline-block; animation: admin-blink 1s step-end infinite;
                        font-size:0.9em; vertical-align:baseline; }

        @media (prefers-reduced-motion: reduce) {
          .admin-cursor { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="admin-mono">

        {/* ── Terminal header bar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e5e7eb]">
          <div>
            <div className="admin-muted mb-1">
              // SISTEMA CENTRAL — LABORATORIO ACADÉMICO PRO
            </div>
            <h1 className="text-2xl font-bold text-[#000] tracking-tight leading-none">
              <TypeLine text="Dashboard" speed={55} delay={80} />
            </h1>
          </div>
          <div className="text-right hidden sm:block">
            <div className="admin-muted">{tick >= 0 && timeStr}</div>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#000] animate-pulse" />
              <span className="admin-label text-[9px]">ONLINE</span>
            </div>
          </div>
        </div>

        {/* ── ASCII decoration ─────────────────────────────────────────── */}
        <div className="admin-muted text-[10px] mb-6 hidden md:block select-none" aria-hidden>
          {"/*──────────────────────────────────────────────────────────────*/"}
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="admin-label mb-3">// métricas activas</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <KpiCard code="MONO" label="Monografías creadas" value={monoCounts.total}       />
          <KpiCard code="CAP1" label="Con Capítulo I"      value={monoCounts.cap1}        />
          <KpiCard code="CAP2" label="Con Capítulo II"     value={monoCounts.cap2}        />
          <KpiCard code="DONE" label="Completadas"         value={monoCounts.completadas} />
        </div>

        {/* ── IA Monitor ───────────────────────────────────────────────── */}
        {stats && (
          <div className="admin-card mb-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
              <span className="admin-label">// monitor IA</span>
              <span className="admin-muted">
                TOTAL: <strong className="text-[#000]">{usoTotal}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e5e7eb]">
              {stats.prompts.map((p, i) => (
                <div key={p.etapa} className="px-4 py-4">
                  <div className="admin-label mb-2">{AI_LABELS[p.etapa] ?? `ETG_${p.etapa}`}</div>
                  <StaggerRow index={i}>
                    <div className="text-2xl font-bold text-[#000] leading-none">{p.uso_total}</div>
                    <div className="admin-muted mt-1">
                      {p.tiempo_promedio_seg > 0 ? `avg: ${p.tiempo_promedio_seg}s` : "avg: —"}
                    </div>
                  </StaggerRow>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Access ─────────────────────────────────────────────── */}
        <div className="admin-label mb-3">// acceso rápido</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {ACTIONS.map((a, i) => (
            <StaggerRow key={a.href} index={i}>
              <a
                href={a.href}
                className="admin-card p-4 flex gap-4 items-start no-underline group
                           hover:border-[#000] transition-colors duration-150"
              >
                <span className="admin-label text-[11px] w-10 shrink-0 pt-0.5">[{a.code}]</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[#000] mb-1">{a.label}</div>
                  <div className="admin-caption">{a.desc}</div>
                </div>
                <span className="admin-muted group-hover:text-[#000] transition-colors text-[16px] leading-none">→</span>
              </a>
            </StaggerRow>
          ))}
        </div>

        {/* ── System Status ─────────────────────────────────────────────── */}
        <div className="admin-label mb-3">// estado del sistema</div>
        <div className="admin-card">
          <div className="px-4 py-2 border-b border-[#e5e7eb] flex items-center gap-2">
            <span className="admin-muted text-[10px]">sys.status</span>
            <span className="admin-muted text-[10px]">—</span>
            <span className="admin-muted text-[10px]">4 services</span>
          </div>
          <div className="px-4 py-2">
            {STATUS.map((s, i) => (
              <StaggerRow key={s.code} index={i + 4}>
                <div className="admin-row">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stateDot[s.state]}`} />
                  <span className="admin-label w-12 shrink-0">{s.code}</span>
                  <span className="text-[12px] font-bold text-[#000] w-28 shrink-0">{s.label}</span>
                  <span className={`text-[12px] font-mono flex-1 ${stateColor[s.state]}`}>{s.value}</span>
                  <span className="admin-muted text-[10px] shrink-0">[{s.state}]</span>
                </div>
              </StaggerRow>
            ))}
          </div>
        </div>

        {/* ── Footer ASCII ─────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-[#e5e7eb]">
          <div className="admin-muted text-[10px]">
            {"/*──────────────────────────────────────────────────────────────*/"}
          </div>
          <div className="admin-muted text-[10px] mt-1">
            © LABORATORIO ACADÉMICO PRO — build/session — all rights reserved
          </div>
        </div>

      </div>
    </>
  );
}
