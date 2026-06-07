'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Copy, Printer, Check } from 'lucide-react';
import type { ProyectoDefensa } from '@/types/defensa';
import { useMaestroActivo } from '@/lib/maestro/useMaestroActivo';
import { ProgresoFlujo } from '@/components/compartido/ProgresoFlujo';
import { SiguienteModulo } from '@/components/compartido/SiguienteModulo';

function colorPuntaje(p: number): string {
  if (p >= 8) return 'text-emerald-600';
  if (p >= 5) return 'text-amber-600';
  return 'text-rose-600';
}

export default function ReporteDefensa() {
  const params = useParams<{ id: string }>();
  const maestro = useMaestroActivo();
  const [p, setP] = useState<ProyectoDefensa | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`/api/defensa/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setP(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="def-muted py-10 text-center text-sm">Generando reporte…</div>;
  if (estado === 'error' || !p) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="def-card p-6 text-center">
          <p className="font-semibold">No encontramos esta preparación</p>
          <Link href="/defensa/proyectos" className="def-accent-text mt-2 inline-block text-sm">← Mis defensas</Link>
        </div>
      </div>
    );
  }

  const preguntas = p.preguntas?.items ?? [];
  const sim = p.simulacro;
  const respuestas = sim?.respuestas ?? [];
  const promedio = typeof sim?.promedio === 'number' ? sim.promedio : null;

  // Promedio por categoría — solo cuenta respuestas EVALUADAS (puntaje no null).
  const porCategoria = new Map<string, { suma: number; n: number }>();
  respuestas.forEach((r) => {
    if (r.puntaje === null) return;
    const c = porCategoria.get(r.categoria) ?? { suma: 0, n: 0 };
    c.suma += r.puntaje; c.n += 1;
    porCategoria.set(r.categoria, c);
  });
  const categorias = [...porCategoria.entries()].map(([cat, v]) => ({ cat, prom: v.suma / v.n })).sort((a, b) => a.prom - b.prom);
  const debiles = categorias.filter((c) => c.prom < 7).map((c) => c.cat);

  const construirTexto = (): string => {
    const l: string[] = [];
    l.push(`# Preparación de defensa — ${p.titulo}`);
    if (p.tema) l.push(`Tema: ${p.tema}`);
    if (p.carrera) l.push(`Carrera: ${p.carrera}`);
    l.push('');

    if (preguntas.length) {
      l.push(`## Banco de preguntas (${preguntas.length})`);
      preguntas.forEach((q) => l.push(`- [${q.categoria}] ${q.pregunta}${q.puntosClave ? ` — clave: ${q.puntosClave}` : ''}`));
      l.push('');
    }

    if (respuestas.length) {
      l.push('## Último simulacro');
      if (promedio !== null) l.push(`Promedio: ${promedio.toFixed(1)}/10${sim?.fecha ? ` (${sim.fecha.slice(0, 10)})` : ''}`);
      if (categorias.length) l.push(`Por categoría: ${categorias.map((c) => `${c.cat} ${c.prom.toFixed(1)}`).join(' · ')}`);
      if (debiles.length) l.push(`A reforzar: ${debiles.join(', ')}`);
      l.push('');
      respuestas.forEach((r, i) => {
        l.push(`${i + 1}. [${r.categoria}] ${r.pregunta}`);
        if (r.respuesta) l.push(`   Respuesta: ${r.respuesta}`);
        const punt = r.puntaje === null ? 'sin evaluar' : `${r.puntaje}/10`;
        l.push(`   Puntaje: ${punt}${r.feedback ? ` — ${r.feedback}` : ''}`);
      });
      l.push('');
    }

    return l.join('\n');
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(construirTexto());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sin clipboard */ }
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="print:hidden">
        <Link href={`/defensa/proyectos/${params.id}`} className="def-muted inline-flex items-center gap-1 text-sm hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Volver a la preparación
        </Link>
      </div>

      <div className="mt-3 print:hidden">
        <ProgresoFlujo actual="defensa" modalidad={maestro?.modalidad} tipoTrabajoLabel={maestro?.modalidad ?? undefined} />
      </div>

      <header className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="def-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="def-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="def-accent-text text-xs font-semibold uppercase tracking-wider">Documento consolidado</p>
            <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
            {(p.tema || p.carrera) && <p className="def-muted text-sm">{[p.carrera, p.tema].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={copiar} className="def-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={() => window.print()} className="def-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="Preguntas" valor={preguntas.length ? String(preguntas.length) : '—'} sub="en el banco" />
        <Indicador label="Respondidas" valor={respuestas.length ? String(respuestas.length) : '—'} sub="en simulacro" />
        <Indicador label="Promedio" valor={promedio !== null ? `${promedio.toFixed(1)}` : '—'} sub="/10" />
        <Indicador label="A reforzar" valor={debiles.length ? String(debiles.length) : '0'} sub="categorías" />
      </div>

      {categorias.length > 0 && (
        <Seccion titulo="Desempeño por categoría">
          <div className="space-y-2">
            {categorias.map((c) => (
              <div key={c.cat}>
                <div className="flex items-center justify-between text-sm">
                  <span>{c.cat}</span>
                  <span className={`font-bold ${colorPuntaje(c.prom)}`}>{c.prom.toFixed(1)}/10</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                  <div className={`h-full rounded-full ${c.prom >= 8 ? 'bg-emerald-500' : c.prom >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${(c.prom / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {debiles.length > 0 && <p className="def-muted mt-3 text-sm">Enfócate en: <strong>{debiles.join(', ')}</strong>.</p>}
        </Seccion>
      )}

      {respuestas.length > 0 && (
        <Seccion titulo="Respuestas del simulacro">
          <ul className="space-y-3">
            {respuestas.map((r, i) => (
              <li key={i} className="border-l-2 border-indigo-200 pl-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{i + 1}. {r.pregunta}</p>
                  {r.puntaje === null ? (
                    <span className="def-muted flex-shrink-0 text-xs italic">sin evaluar</span>
                  ) : (
                    <span className={`flex-shrink-0 font-bold ${colorPuntaje(r.puntaje)}`}>{r.puntaje}/10</span>
                  )}
                </div>
                {r.respuesta && <p className="def-muted mt-0.5 text-xs">Tu respuesta: {r.respuesta}</p>}
                {r.feedback && <p className="mt-0.5 text-xs"><span className="font-semibold">Feedback:</span> {r.feedback}</p>}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {preguntas.length > 0 && respuestas.length === 0 && (
        <Seccion titulo={`Banco de preguntas (${preguntas.length})`}>
          <ul className="space-y-1">
            {preguntas.map((q) => (
              <li key={q.id}><span className="def-accent-text text-xs font-medium">{q.categoria}:</span> {q.pregunta}</li>
            ))}
          </ul>
          <p className="def-muted mt-2 text-sm">Aún no has hecho el simulacro. Practica para ver tu desempeño aquí.</p>
        </Seccion>
      )}

      <div className="print:hidden">
        <SiguienteModulo actual="defensa" modalidad={maestro?.modalidad} />
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="def-card mt-4 p-5">
      <h2 className="def-accent-text text-sm font-bold uppercase tracking-wider">{titulo}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function Indicador({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="def-card p-3 text-center">
      <p className="def-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className="def-accent-text text-xl font-bold">{valor}</p>
      <p className="def-muted text-[10px]">{sub}</p>
    </div>
  );
}
