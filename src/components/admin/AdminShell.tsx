"use client";

import { useState, useEffect, useRef } from "react";

// ── Hook: Typewriter ──────────────────────────────────────────────────────────
export function useTypewriter(text: string, speed = 40, delay = 80) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
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
export function useCountUp(target: number, duration = 900, delay = 300) {
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

// ── Hook: Staggered reveal ────────────────────────────────────────────────────
export function useStaggerVisible(index: number, baseDelay = 400, step = 80) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), baseDelay + step * index);
    return () => clearTimeout(t);
  }, [index, baseDelay, step]);
  return visible;
}

// ── Stagger wrapper ───────────────────────────────────────────────────────────
export function StaggerRow({ children, index, baseDelay = 400 }: { children: React.ReactNode; index: number; baseDelay?: number }) {
  const visible = useStaggerVisible(index, baseDelay);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}

// ── CSS Scoped to admin ───────────────────────────────────────────────────────
const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;400;700&display=swap');

  .adm { font-family: 'IBM Plex Mono', ui-monospace, monospace !important; }
  .adm * { font-family: inherit; }

  .adm-label   { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #000; }
  .adm-muted   { font-size: 10px; color: #999; }
  .adm-caption { font-size: 11px; color: #666; line-height: 1.4; }
  .adm-card    { background: rgba(255,255,255,0.7); border: 1px solid #e5e7eb; }
  .adm-row     { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
  .adm-row:last-child { border-bottom: none; }
  .adm-btn     { font-family: inherit; font-size: 11px; font-weight: 700; border: 1px solid #e5e7eb; background: transparent; cursor: pointer; padding: 6px 14px; letter-spacing: 0.05em; transition: all 0.1s; }
  .adm-btn:hover { background: #f5f5f5; border-color: #000; }
  .adm-btn-danger { color: #c00; }
  .adm-btn-danger:hover { background: #fff5f5; border-color: #c00; }
  .adm-btn-primary { background: #000; color: #fff; border-color: #000; }
  .adm-btn-primary:hover { background: #222; }
  .adm-btn-primary:disabled { background: #ccc; border-color: #ccc; cursor: not-allowed; }
  .adm-input   { font-family: inherit; font-size: 12px; border: 1px solid #e5e7eb; background: rgba(255,255,255,0.8); padding: 8px 12px; width: 100%; outline: none; transition: border-color 0.1s; color: #000; }
  .adm-input:focus { border-color: #000; }
  .adm-select  { font-family: inherit; font-size: 12px; border: 1px solid #e5e7eb; background: rgba(255,255,255,0.8); padding: 7px 10px; outline: none; cursor: pointer; color: #000; }
  .adm-select:focus { border-color: #000; }
  .adm-textarea { font-family: inherit; font-size: 12px; border: 1px solid #e5e7eb; background: rgba(255,255,255,0.8); padding: 10px 12px; width: 100%; outline: none; resize: vertical; color: #000; line-height: 1.7; }
  .adm-textarea:focus { border-color: #000; }
  .adm-badge-ok   { font-size: 10px; font-weight: 700; color: #000; background: transparent; border: 1px solid #000; padding: 2px 7px; letter-spacing: 0.08em; }
  .adm-badge-warn { font-size: 10px; font-weight: 700; color: #666; border: 1px solid #ccc; padding: 2px 7px; }
  .adm-badge-err  { font-size: 10px; font-weight: 700; color: #c00; border: 1px solid #fcc; padding: 2px 7px; }
  .adm-table   { width: 100%; border-collapse: collapse; font-size: 12px; }
  .adm-table th { text-align: left; font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #999; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  .adm-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
  .adm-table tr:last-child td { border-bottom: none; }
  .adm-table tr:hover td { background: rgba(0,0,0,0.015); }

  @keyframes adm-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .adm-cursor { display:inline-block; animation: adm-blink 1s step-end infinite; }

  @media (prefers-reduced-motion: reduce) {
    .adm-cursor { animation: none; }
  }
`;

// ── Page header with typewriter ───────────────────────────────────────────────
function AdminHeader({ title, code, subtitle }: { title: string; code: string; subtitle?: string }) {
  const { displayed, done } = useTypewriter(title, 50, 100);
  return (
    <div className="flex items-start justify-between mb-8 pb-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
      <div>
        <div className="adm-muted mb-1">// {code}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#000", lineHeight: 1, margin: 0 }}>
          {displayed}{!done && <span className="adm-cursor">█</span>}
        </h1>
        {subtitle && (
          <p className="adm-caption mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── Main shell export ─────────────────────────────────────────────────────────
interface AdminShellProps {
  title: string;
  code: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AdminShell({ title, code, subtitle, children }: AdminShellProps) {
  return (
    <div className="adm">
      <style>{ADMIN_CSS}</style>
      <AdminHeader title={title} code={code} subtitle={subtitle} />
      {children}
    </div>
  );
}
