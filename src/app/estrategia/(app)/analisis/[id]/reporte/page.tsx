'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Copy, Printer, Check } from 'lucide-react';
import type { ProyectoEstrategia, FilaMatriz } from '@/types/estrategia';

/** Total ponderado de una matriz MEFE/MEFI. */
function totalPonderado(filas?: FilaMatriz[]): number {
  if (!filas?.length) return 0;
  return filas.reduce((s, f) => s + (f.peso || 0) * (f.calificacion || 0), 0);
}

function regionMIE(mefi: number, mefe: number): { num: string; zona: string } {
  const col = mefi >= 3 ? 0 : mefi >= 2 ? 1 : 2;
  const row = mefe >= 3 ? 0 : mefe >= 2 ? 1 : 2;
  const grid = [
    [{ num: 'I', z: 'Crecer y construir' }, { num: 'II', z: 'Crecer y construir' }, { num: 'III', z: 'Resistir y mantener' }],
    [{ num: 'IV', z: 'Crecer y construir' }, { num: 'V', z: 'Resistir y mantener' }, { num: 'VI', z: 'Cosechar o desinvertir' }],
    [{ num: 'VII', z: 'Resistir y mantener' }, { num: 'VIII', z: 'Cosechar o desinvertir' }, { num: 'IX', z: 'Cosechar o desinvertir' }],
  ];
  const cell = grid[row][col];
  return { num: cell.num, zona: cell.z };
}

function posturaPeyea(ff: number, fi: number, ee: number, vc: number): string {
  const x = fi + vc, y = ff + ee;
  if (x >= 0 && y >= 0) return 'Agresivo';
  if (x < 0 && y >= 0) return 'Conservador';
  if (x < 0 && y < 0) return 'Defensivo';
  return 'Competitivo';
}

function cuadranteBcg(crec: number, part: number): string {
  const altoCrec = crec >= 10, altaPart = part >= 1;
  if (altoCrec && altaPart) return 'Estrella';
  if (altoCrec && !altaPart) return 'Interrogante';
  if (!altoCrec && altaPart) return 'Vaca lechera';
  return 'Perro';
}

const PESTEL_LABEL: Record<string, string> = {
  politico: 'Político', economico: 'Económico', social: 'Social',
  tecnologico: 'Tecnológico', ecologico: 'Ecológico', legal: 'Legal',
};
const PORTER_LABEL: Record<string, string> = {
  rivalidad: 'Rivalidad entre competidores', nuevosEntrantes: 'Amenaza de nuevos entrantes',
  sustitutos: 'Amenaza de sustitutos', poderClientes: 'Poder de los clientes',
  poderProveedores: 'Poder de los proveedores',
};
const CV_LABEL: Record<string, string> = {
  logisticaInterna: 'Logística interna', operaciones: 'Operaciones', logisticaExterna: 'Logística externa',
  marketing: 'Marketing y ventas', servicio: 'Servicio', infraestructura: 'Infraestructura',
  rrhh: 'Recursos humanos', tecnologia: 'Tecnología', abastecimiento: 'Abastecimiento',
};

export default function ReporteEstrategia() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<ProyectoEstrategia | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`/api/estrategia/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setP(d.proyecto); setEstado('ok'); })
      .catch(() => setEstado('error'));
  }, [params.id]);

  if (estado === 'cargando') return <div className="es-muted py-10 text-center text-sm">Generando reporte…</div>;
  if (estado === 'error' || !p) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="es-card p-6 text-center">
          <p className="font-semibold">No encontramos este análisis</p>
          <Link href="/estrategia/analisis" className="es-accent-text mt-2 inline-block text-sm">← Mis análisis</Link>
        </div>
      </div>
    );
  }

  const totMefe = totalPonderado(p.mefe?.filas);
  const totMefi = totalPonderado(p.mefi?.filas);
  const mie = totMefe && totMefi ? regionMIE(totMefi, totMefe) : null;
  const peyea = p.peyea && typeof p.peyea.ff === 'number'
    ? posturaPeyea(p.peyea.ff, p.peyea.fi ?? 0, p.peyea.ee ?? 0, p.peyea.vc ?? 0) : null;

  // ── Texto plano (markdown) para copiar: el "artefacto" del módulo ──
  const construirTexto = (): string => {
    const l: string[] = [];
    l.push(`# Análisis Estratégico — ${p.titulo}`);
    if (p.sector) l.push(`Sector: ${p.sector}`);
    l.push('');
    l.push('## Resumen');
    if (totMefe) l.push(`- MEFE (factores externos): ${totMefe.toFixed(2)} / 4`);
    if (totMefi) l.push(`- MEFI (factores internos): ${totMefi.toFixed(2)} / 4`);
    if (mie) l.push(`- MIE: región ${mie.num} — ${mie.zona}`);
    if (peyea) l.push(`- PEYEA: perfil ${peyea}`);
    l.push('');

    const pestel = p.pestel ?? {};
    if (Object.values(pestel).some((a) => Array.isArray(a) && a.length)) {
      l.push('## PESTEL');
      for (const [k, arr] of Object.entries(pestel)) {
        if (Array.isArray(arr) && arr.length) {
          l.push(`### ${PESTEL_LABEL[k] ?? k}`);
          arr.forEach((f) => l.push(`- ${f.texto} (impacto ${f.impacto > 0 ? '+' : ''}${f.impacto})`));
        }
      }
      l.push('');
    }

    const porter = p.porter ?? {};
    if (Object.keys(porter).length) {
      l.push('## 5 Fuerzas de Porter');
      for (const [k, v] of Object.entries(porter)) {
        const f = v as { intensidad: number; notas: string };
        l.push(`- ${PORTER_LABEL[k] ?? k}: intensidad ${f.intensidad}/5${f.notas ? ` — ${f.notas}` : ''}`);
      }
      l.push('');
    }

    const cv = p.cadena_valor ?? {};
    const cvEntries = [...Object.entries(cv.primarias ?? {}), ...Object.entries(cv.apoyo ?? {})].filter(([, v]) => v);
    if (cvEntries.length) {
      l.push('## Cadena de Valor');
      cvEntries.forEach(([k, v]) => l.push(`- ${CV_LABEL[k] ?? k}: ${v}`));
      l.push('');
    }

    const foda = p.foda ?? {};
    if ([foda.fortalezas, foda.oportunidades, foda.debilidades, foda.amenazas].some((a) => a?.length)) {
      l.push('## FODA');
      if (foda.fortalezas?.length) l.push(`Fortalezas: ${foda.fortalezas.join('; ')}`);
      if (foda.oportunidades?.length) l.push(`Oportunidades: ${foda.oportunidades.join('; ')}`);
      if (foda.debilidades?.length) l.push(`Debilidades: ${foda.debilidades.join('; ')}`);
      if (foda.amenazas?.length) l.push(`Amenazas: ${foda.amenazas.join('; ')}`);
      const e = foda.estrategias;
      if (e && [e.fo, e.do_, e.fa, e.da].some((a) => a?.length)) {
        l.push('Estrategias cruzadas:');
        e.fo?.forEach((s) => l.push(`- FO: ${s}`));
        e.do_?.forEach((s) => l.push(`- DO: ${s}`));
        e.fa?.forEach((s) => l.push(`- FA: ${s}`));
        e.da?.forEach((s) => l.push(`- DA: ${s}`));
      }
      l.push('');
    }

    const bcg = p.bcg?.unidades ?? [];
    if (bcg.length) {
      l.push('## Matriz BCG');
      bcg.forEach((u) => l.push(`- ${u.nombre}: ${cuadranteBcg(u.crecimiento, u.participacion)} (crec. ${u.crecimiento}%, part. rel. ${u.participacion})`));
      l.push('');
    }

    const ansoff = p.ansoff ?? {};
    if ([ansoff.penetracion, ansoff.desarrolloProducto, ansoff.desarrolloMercado, ansoff.diversificacion].some((a) => a?.length)) {
      l.push('## Matriz de Ansoff');
      ansoff.penetracion?.forEach((s) => l.push(`- Penetración: ${s}`));
      ansoff.desarrolloProducto?.forEach((s) => l.push(`- Desarrollo de producto: ${s}`));
      ansoff.desarrolloMercado?.forEach((s) => l.push(`- Desarrollo de mercado: ${s}`));
      ansoff.diversificacion?.forEach((s) => l.push(`- Diversificación: ${s}`));
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

  const pestel = p.pestel ?? {};
  const porter = p.porter ?? {};
  const cv = p.cadena_valor ?? {};
  const cvEntries = [...Object.entries(cv.primarias ?? {}), ...Object.entries(cv.apoyo ?? {})].filter(([, v]) => v);
  const foda = p.foda ?? {};
  const bcg = p.bcg?.unidades ?? [];
  const ansoff = p.ansoff ?? {};
  const hayPestel = Object.values(pestel).some((a) => Array.isArray(a) && a.length);
  const hayFoda = [foda.fortalezas, foda.oportunidades, foda.debilidades, foda.amenazas].some((a) => a?.length);
  const hayAnsoff = [ansoff.penetracion, ansoff.desarrolloProducto, ansoff.desarrolloMercado, ansoff.diversificacion].some((a) => a?.length);

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="print:hidden">
        <Link href={`/estrategia/analisis/${params.id}`} className="es-muted inline-flex items-center gap-1 text-sm hover:text-violet-700">
          <ArrowLeft className="h-4 w-4" /> Volver al análisis
        </Link>
      </div>

      <header className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="es-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="es-accent-text h-5 w-5" />
          </div>
          <div>
            <p className="es-accent-text text-xs font-semibold uppercase tracking-wider">Documento consolidado</p>
            <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
            {p.sector && <p className="es-muted text-sm">Sector: {p.sector}</p>}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={copiar} className="es-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={() => window.print()} className="es-btn-primary inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </header>

      {/* Resumen */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Indicador label="MEFE" valor={totMefe ? totMefe.toFixed(2) : '—'} sub="externo /4" />
        <Indicador label="MEFI" valor={totMefi ? totMefi.toFixed(2) : '—'} sub="interno /4" />
        <Indicador label="MIE" valor={mie ? mie.num : '—'} sub={mie ? mie.zona : 'región'} />
        <Indicador label="PEYEA" valor={peyea ?? '—'} sub="perfil" />
      </div>

      {hayPestel && (
        <Seccion titulo="PESTEL — Macroentorno">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(pestel).map(([k, arr]) =>
              Array.isArray(arr) && arr.length ? (
                <div key={k}>
                  <p className="font-semibold text-slate-700">{PESTEL_LABEL[k] ?? k}</p>
                  <ul className="es-muted mt-1 space-y-0.5">
                    {arr.map((f, i) => (
                      <li key={i}>• {f.texto} <span className={f.impacto > 0 ? 'text-emerald-600' : f.impacto < 0 ? 'text-rose-600' : ''}>({f.impacto > 0 ? '+' : ''}{f.impacto})</span></li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>
        </Seccion>
      )}

      {Object.keys(porter).length > 0 && (
        <Seccion titulo="5 Fuerzas de Porter">
          <ul className="space-y-1.5">
            {Object.entries(porter).map(([k, v]) => {
              const f = v as { intensidad: number; notas: string };
              return (
                <li key={k} className="flex items-start justify-between gap-3">
                  <span><span className="font-medium">{PORTER_LABEL[k] ?? k}</span>{f.notas ? <span className="es-muted"> — {f.notas}</span> : null}</span>
                  <span className="es-accent-text flex-shrink-0 font-bold">{f.intensidad}/5</span>
                </li>
              );
            })}
          </ul>
        </Seccion>
      )}

      {cvEntries.length > 0 && (
        <Seccion titulo="Cadena de Valor">
          <ul className="space-y-1">
            {cvEntries.map(([k, v]) => (
              <li key={k}><span className="font-medium">{CV_LABEL[k] ?? k}:</span> <span className="es-muted">{v as string}</span></li>
            ))}
          </ul>
        </Seccion>
      )}

      {mie && (
        <Seccion titulo="Matriz Interna-Externa (MIE)">
          <p>Con MEFI <strong>{totMefi.toFixed(2)}</strong> y MEFE <strong>{totMefe.toFixed(2)}</strong>, el negocio se ubica en la <strong>región {mie.num}</strong>: {mie.zona}.</p>
        </Seccion>
      )}

      {hayFoda && (
        <Seccion titulo="FODA">
          <div className="grid gap-3 sm:grid-cols-2">
            {foda.fortalezas?.length ? <FodaList label="Fortalezas" items={foda.fortalezas} /> : null}
            {foda.oportunidades?.length ? <FodaList label="Oportunidades" items={foda.oportunidades} /> : null}
            {foda.debilidades?.length ? <FodaList label="Debilidades" items={foda.debilidades} /> : null}
            {foda.amenazas?.length ? <FodaList label="Amenazas" items={foda.amenazas} /> : null}
          </div>
          {foda.estrategias && [foda.estrategias.fo, foda.estrategias.do_, foda.estrategias.fa, foda.estrategias.da].some((a) => a?.length) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {foda.estrategias.fo?.length ? <FodaList label="Estrategias FO" items={foda.estrategias.fo} /> : null}
              {foda.estrategias.do_?.length ? <FodaList label="Estrategias DO" items={foda.estrategias.do_} /> : null}
              {foda.estrategias.fa?.length ? <FodaList label="Estrategias FA" items={foda.estrategias.fa} /> : null}
              {foda.estrategias.da?.length ? <FodaList label="Estrategias DA" items={foda.estrategias.da} /> : null}
            </div>
          )}
        </Seccion>
      )}

      {bcg.length > 0 && (
        <Seccion titulo="Matriz BCG">
          <ul className="space-y-1">
            {bcg.map((u, i) => (
              <li key={i}><span className="font-medium">{u.nombre}:</span> <span className="es-accent-text">{cuadranteBcg(u.crecimiento, u.participacion)}</span> <span className="es-muted">(crec. {u.crecimiento}%, part. rel. {u.participacion})</span></li>
            ))}
          </ul>
        </Seccion>
      )}

      {hayAnsoff && (
        <Seccion titulo="Matriz de Ansoff">
          <div className="grid gap-3 sm:grid-cols-2">
            {ansoff.penetracion?.length ? <FodaList label="Penetración de mercado" items={ansoff.penetracion} /> : null}
            {ansoff.desarrolloProducto?.length ? <FodaList label="Desarrollo de producto" items={ansoff.desarrolloProducto} /> : null}
            {ansoff.desarrolloMercado?.length ? <FodaList label="Desarrollo de mercado" items={ansoff.desarrolloMercado} /> : null}
            {ansoff.diversificacion?.length ? <FodaList label="Diversificación" items={ansoff.diversificacion} /> : null}
          </div>
        </Seccion>
      )}

      {peyea && (
        <Seccion titulo="Posición estratégica (PEYEA)">
          <p>El vector PEYEA ubica al negocio con un perfil <strong>{peyea}</strong>.</p>
        </Seccion>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="es-card mt-4 p-5">
      <h2 className="es-accent-text text-sm font-bold uppercase tracking-wider">{titulo}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </section>
  );
}

function Indicador({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="es-card p-3 text-center">
      <p className="es-muted text-[11px] uppercase tracking-wider">{label}</p>
      <p className="es-accent-text text-xl font-bold">{valor}</p>
      <p className="es-muted text-[10px]">{sub}</p>
    </div>
  );
}

function FodaList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-slate-700">{label}</p>
      <ul className="es-muted mt-1 space-y-0.5">
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}
