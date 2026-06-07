'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Copy, Printer, Check } from 'lucide-react';
import { aplicaComoSeccion, getDescriptor } from '@/lib/idea/rubrica-viabilidad';
import type { ProyectoIdea, LeanCanvas } from '@/types/idea';

const CANVAS_LABEL: Record<keyof LeanCanvas, string> = {
  problema: 'Problema', segmentos: 'Segmentos', propuestaValor: 'Propuesta única de valor',
  solucion: 'Solución', canales: 'Canales', ingresos: 'Ingresos', costos: 'Costos',
  metricas: 'Métricas', ventaja: 'Ventaja injusta',
};

function veredicto(prom: number): string {
  if (prom >= 4) return 'Idea sólida';
  if (prom >= 3) return 'Prometedora con riesgos';
  return 'Necesita más trabajo';
}

export default function ReporteIdea() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<ProyectoIdea | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setP(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="idea-muted py-10 text-center text-sm">Generando reporte…</div>;
  if (estado === 'error' || !p) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="idea-card p-6 text-center">
          <p className="font-semibold">No encontramos esta idea</p>
          <Link href="/idea/proyectos" className="idea-accent-text mt-2 inline-block text-sm">← Mis ideas</Link>
        </div>
      </div>
    );
  }

  const lc = (p.lean_canvas ?? {}) as Partial<LeanCanvas>;
  const pv = p.propuesta_valor ?? {};
  const hip = p.validacion?.hipotesis ?? [];
  const sc = p.scorecard;
  const prom = sc && typeof sc.deseabilidad === 'number'
    ? ((sc.deseabilidad + (sc.factibilidad ?? 0) + (sc.viabilidad ?? 0)) / 3) : null;

  const construirTexto = (): string => {
    const l: string[] = [];
    l.push(`# Pre-validación — ${p.titulo}`);
    if (p.idea) l.push(`Idea: ${p.idea}`);
    if (p.sector) l.push(`Sector: ${p.sector}`);
    l.push('');

    if (Object.values(lc).some(Boolean)) {
      l.push('## Lean Canvas');
      (Object.keys(CANVAS_LABEL) as Array<keyof LeanCanvas>).forEach((k) => {
        if (lc[k]) l.push(`- ${CANVAS_LABEL[k]}: ${lc[k]}`);
      });
      l.push('');
    }

    if ([pv.trabajos, pv.dolores, pv.alegrias, pv.productos, pv.aliviadores, pv.creadores].some((a) => a?.length)) {
      l.push('## Propuesta de valor');
      if (pv.trabajos?.length) l.push(`Trabajos: ${pv.trabajos.join('; ')}`);
      if (pv.dolores?.length) l.push(`Dolores: ${pv.dolores.join('; ')}`);
      if (pv.alegrias?.length) l.push(`Alegrías: ${pv.alegrias.join('; ')}`);
      if (pv.productos?.length) l.push(`Productos: ${pv.productos.join('; ')}`);
      if (pv.aliviadores?.length) l.push(`Aliviadores: ${pv.aliviadores.join('; ')}`);
      if (pv.creadores?.length) l.push(`Creadores: ${pv.creadores.join('; ')}`);
      l.push('');
    }

    if (hip.length) {
      l.push('## Validación (hipótesis)');
      hip.forEach((h) => l.push(`- [${h.estado}] ${h.supuesto} → ${h.comoProbar} (éxito: ${h.criterio})${h.resultado ? ` → ${h.resultado}` : ''}`));
      l.push('');
    }

    if (prom !== null && sc) {
      // Si la modalidad lo amerita, esto va como SECCIÓN ACADÉMICA formal
      // con evidencia citada. Si no, como nota interna del estudiante.
      const seccionFormal = aplicaComoSeccion(p.tipo_trabajo);
      l.push(seccionFormal ? '## Análisis de Viabilidad' : '## Scorecard de viabilidad (interno)');
      l.push(`Deseabilidad ${sc.deseabilidad}/5 · Factibilidad ${sc.factibilidad}/5 · Viabilidad ${sc.viabilidad}/5`);
      l.push(`Promedio: ${prom.toFixed(1)}/5 — ${veredicto(prom)}`);
      l.push('');
      // Detalle por dimensión con descriptor + evidencia citada
      for (const dim of (['deseabilidad', 'factibilidad', 'viabilidad'] as const)) {
        const valor = sc[dim] as number;
        const desc = getDescriptor(dim, valor);
        const ev = (sc as unknown as Record<string, unknown>)[`evidencia_${dim}`] as string | undefined;
        if (!desc) continue;
        l.push(`### ${dim.charAt(0).toUpperCase() + dim.slice(1)}: ${valor}/5 — ${desc.etiqueta}`);
        l.push(desc.descripcion);
        if (ev?.trim()) l.push(`Evidencia: ${ev.trim()}`);
        else l.push(`Evidencia: _(pendiente de documentar)_`);
        l.push('');
      }
      if (sc.notas) { l.push('### Decisión'); l.push(sc.notas); l.push(''); }
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
        <Link href={`/idea/proyectos/${params.id}`} className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
          <ArrowLeft className="h-4 w-4" /> Volver a la idea
        </Link>
      </div>

      <header className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="idea-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="idea-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Documento consolidado</p>
            <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
            {(p.idea || p.sector) && <p className="idea-muted text-sm">{[p.idea, p.sector].filter(Boolean).join(' · ')}</p>}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={copiar} className="idea-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={() => window.print()} className="idea-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </header>

      {prom !== null && sc && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Indicador label="Deseabilidad" valor={`${sc.deseabilidad}/5`} />
          <Indicador label="Factibilidad" valor={`${sc.factibilidad}/5`} />
          <Indicador label="Viabilidad" valor={`${sc.viabilidad}/5`} />
          <Indicador label="Veredicto" valor={`${prom.toFixed(1)}/5`} sub={veredicto(prom)} />
        </div>
      )}

      {Object.values(lc).some(Boolean) && (
        <Seccion titulo="Lean Canvas">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(CANVAS_LABEL) as Array<keyof LeanCanvas>).map((k) =>
              lc[k] ? (
                <div key={k}>
                  <p className="font-semibold text-slate-700">{CANVAS_LABEL[k]}</p>
                  <p className="idea-muted">{lc[k]}</p>
                </div>
              ) : null,
            )}
          </div>
        </Seccion>
      )}

      {[pv.trabajos, pv.dolores, pv.alegrias, pv.productos, pv.aliviadores, pv.creadores].some((a) => a?.length) && (
        <Seccion titulo="Propuesta de valor">
          <div className="grid gap-3 sm:grid-cols-2">
            {pv.trabajos?.length ? <Bullets label="Trabajos" items={pv.trabajos} /> : null}
            {pv.dolores?.length ? <Bullets label="Dolores" items={pv.dolores} /> : null}
            {pv.alegrias?.length ? <Bullets label="Alegrías" items={pv.alegrias} /> : null}
            {pv.productos?.length ? <Bullets label="Productos" items={pv.productos} /> : null}
            {pv.aliviadores?.length ? <Bullets label="Aliviadores" items={pv.aliviadores} /> : null}
            {pv.creadores?.length ? <Bullets label="Creadores" items={pv.creadores} /> : null}
          </div>
        </Seccion>
      )}

      {hip.length > 0 && (
        <Seccion titulo="Validación">
          <ul className="space-y-2">
            {hip.map((h, i) => (
              <li key={i} className="border-l-2 border-amber-200 pl-3">
                <p className="font-medium">{h.supuesto}</p>
                <p className="idea-muted text-xs">Prueba: {h.comoProbar} · Éxito: {h.criterio}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${h.estado === 'validada' ? 'bg-emerald-100 text-emerald-800' : h.estado === 'refutada' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>
                    {h.estado === 'validada' ? 'Validada' : h.estado === 'refutada' ? 'Refutada' : 'Sin probar'}
                  </span>
                </p>
                {h.resultado && <p className="idea-muted text-xs">Resultado: {h.resultado}</p>}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {prom !== null && sc?.notas && (
        <Seccion titulo="Decisión">
          <p className="idea-muted">{sc.notas}</p>
        </Seccion>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="idea-card mt-4 p-5">
      <h2 className="idea-accent-text text-sm font-bold uppercase tracking-wider">{titulo}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function Indicador({ label, valor, sub }: { label: string; valor: string; sub?: string }) {
  return (
    <div className="idea-card p-3 text-center">
      <p className="idea-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className="idea-accent-text text-xl font-bold">{valor}</p>
      {sub && <p className="idea-muted text-[10px]">{sub}</p>}
    </div>
  );
}

function Bullets({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-slate-700">{label}</p>
      <ul className="idea-muted mt-1 space-y-0.5">
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}
