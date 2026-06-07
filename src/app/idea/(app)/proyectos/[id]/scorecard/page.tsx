'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Gauge, Check, X, Info } from 'lucide-react';
import { SugerirIA } from '@/components/compartido/SugerirIA';
import { AutoTextarea } from '@/components/compartido/AutoTextarea';
import { RUBRICA, getDescriptor, aplicaComoSeccion } from '@/lib/idea/rubrica-viabilidad';
import type { Scorecard, LeanCanvas, PropuestaValor, Validacion } from '@/types/idea';

const VACIO: Scorecard = {
  deseabilidad: 3, factibilidad: 3, viabilidad: 3,
  evidencia_deseabilidad: '', evidencia_factibilidad: '', evidencia_viabilidad: '',
  notas: '',
};

function veredicto(prom: number): { txt: string; clase: string; consejo: string } {
  if (prom >= 4) return { txt: 'Idea sólida', clase: 'text-emerald-600', consejo: 'Buen punto de partida. Avanza a un prototipo o piloto pequeño.' };
  if (prom >= 3) return { txt: 'Prometedora con riesgos', clase: 'text-amber-600', consejo: 'Hay potencial pero también dudas. Valida las hipótesis más débiles antes de invertir.' };
  return { txt: 'Necesita más trabajo', clase: 'text-rose-600', consejo: 'Una o más dimensiones están flojas. Repensar el problema, la solución o el modelo.' };
}

export default function HerramientaScorecard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [s, setS] = useState<Scorecard>(VACIO);
  const [titulo, setTitulo] = useState('');
  const [idea, setIdea] = useState('');
  const [sector, setSector] = useState('');
  const [tipoTrabajo, setTipoTrabajo] = useState<string | null>(null);
  const [leanCanvas, setLeanCanvas] = useState<Partial<LeanCanvas>>({});
  const [propVal, setPropVal] = useState<Partial<PropuestaValor>>({});
  const [validac, setValidac] = useState<Partial<Validacion>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch(`/api/idea/proyectos/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.proyecto) {
          setTitulo(d.proyecto.titulo ?? '');
          setIdea(d.proyecto.idea ?? '');
          setSector(d.proyecto.sector ?? '');
          setTipoTrabajo(d.proyecto.tipo_trabajo ?? null);
          setLeanCanvas(d.proyecto.lean_canvas ?? {});
          setPropVal(d.proyecto.propuesta_valor ?? {});
          setValidac(d.proyecto.validacion ?? {});
          const x = d.proyecto.scorecard;
          if (x && typeof x.deseabilidad === 'number') setS({ ...VACIO, ...x });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [params.id]);

  const prom = (s.deseabilidad + s.factibilidad + s.viabilidad) / 3;
  const v = veredicto(prom);
  const seraSeccion = aplicaComoSeccion(tipoTrabajo);

  const setPuntaje = (key: 'deseabilidad' | 'factibilidad' | 'viabilidad', val: number) =>
    setS((p) => ({ ...p, [key]: val }));
  const setEvidencia = (key: 'deseabilidad' | 'factibilidad' | 'viabilidad', val: string) =>
    setS((p) => ({ ...p, [`evidencia_${key}` as const]: val }));
  const setNotas = (val: string) => setS((p) => ({ ...p, notas: val }));

  /**
   * Sugerencia IA: propone puntaje + ejemplo de evidencia POR cada dimensión.
   * Aplica los puntajes, agrega su razonamiento a las notas (sin borrar lo tuyo)
   * y agrega ejemplos de evidencia (entre paréntesis) a los campos vacíos.
   */
  const aplicarIA = (texto: string) => {
    const getNum = (etq: string): number | null => {
      const m = texto.match(new RegExp(`${etq}\\s*:\\s*(\\d)`, 'i'));
      const n = m ? parseInt(m[1], 10) : null;
      return n !== null && n >= 1 && n <= 5 ? n : null;
    };
    const getTxt = (etq: string): string | null => {
      const m = texto.match(new RegExp(`${etq}\\s*:\\s*(.+)`, 'i'));
      return m?.[1]?.trim() ?? null;
    };
    const d = getNum('Deseabilidad'); const f = getNum('Factibilidad'); const vi = getNum('Viabilidad');
    const ed = getTxt('EvidenciaDeseabilidad');
    const ef = getTxt('EvidenciaFactibilidad');
    const ev = getTxt('EvidenciaViabilidad');
    const notasIA = getTxt('Notas');
    setS((prev) => ({
      ...prev,
      deseabilidad: d ?? prev.deseabilidad,
      factibilidad: f ?? prev.factibilidad,
      viabilidad: vi ?? prev.viabilidad,
      evidencia_deseabilidad: prev.evidencia_deseabilidad?.trim() ? prev.evidencia_deseabilidad : (ed ?? prev.evidencia_deseabilidad),
      evidencia_factibilidad: prev.evidencia_factibilidad?.trim() ? prev.evidencia_factibilidad : (ef ?? prev.evidencia_factibilidad),
      evidencia_viabilidad: prev.evidencia_viabilidad?.trim() ? prev.evidencia_viabilidad : (ev ?? prev.evidencia_viabilidad),
      notas: prev.notas?.trim()
        ? `${prev.notas}\n\n— Sugerencia IA —\n${notasIA ?? ''}`.trim()
        : (notasIA ?? prev.notas ?? ''),
    }));
  };

  const guardar = async (volver: boolean) => {
    setGuardando(true); setGuardado(false);
    try {
      const res = await fetch(`/api/idea/proyectos/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ scorecard: s, estado: 'scorecard' }),
      });
      if (res.ok) { setGuardado(true); if (volver) router.push(`/idea/proyectos/${params.id}`); }
    } finally { setGuardando(false); }
  };

  if (cargando) return <div className="idea-muted py-10 text-center text-sm">Cargando…</div>;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <Link href={`/idea/proyectos/${params.id}`} className="idea-muted inline-flex items-center gap-1 text-sm hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Volver a la idea
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="idea-accent-soft flex h-10 w-10 items-center justify-center rounded-xl">
          <Gauge className="idea-accent-text h-5 w-5" />
        </div>
        <div>
          <p className="idea-accent-text text-xs font-semibold uppercase tracking-wider">Veredicto con evidencia</p>
          <h1 className="text-2xl font-bold tracking-tight">Análisis de viabilidad</h1>
        </div>
      </header>

      <p className="idea-muted mt-2 text-sm">
        Cada dimensión tiene una <strong>rúbrica</strong>: elige el nivel que mejor describa tu
        situación HOY y respáldalo con evidencia concreta. No es un slider mudo: tienes que poder
        defender cada puntaje ante el tribunal.
      </p>

      {/* Aviso de relevancia académica según modalidad */}
      <div className={`mt-3 rounded-lg border p-3 text-xs ${seraSeccion ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <div>
            {seraSeccion ? (
              <>
                Como tu trabajo es <strong>{tipoTrabajo}</strong>, este análisis se exporta como{' '}
                <strong>sección formal</strong> del documento (con tu evidencia citada).
              </>
            ) : (
              <>
                {tipoTrabajo ? (
                  <>Tu trabajo es <strong>{tipoTrabajo}</strong>. Este análisis es una herramienta de pre-validación{' '}
                  <strong>interna</strong>, no aparece como capítulo en el documento final.</>
                ) : (
                  <>Sin tipo de trabajo definido. Define la modalidad en la lista de ideas para saber si este análisis se exporta como sección del documento.</>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rúbricas por dimensión */}
      {RUBRICA.map((dim) => {
        const valorActual = s[dim.key];
        const descActual = getDescriptor(dim.key, valorActual);
        const evidencia = (s as unknown as Record<string, unknown>)[`evidencia_${dim.key}`] as string | undefined;
        return (
          <section key={dim.key} className="idea-card mt-4 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">{dim.nombre}</h2>
                <p className="idea-muted text-xs">{dim.pregunta}</p>
              </div>
              <span className="idea-accent-text text-2xl font-bold">{valorActual}/5</span>
            </div>

            {/* Sub-criterios de chequeo */}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-amber-700 hover:text-amber-800">
                Sub-criterios a considerar ({dim.subcriterios.length})
              </summary>
              <ul className="idea-muted mt-2 space-y-0.5 pl-4 text-xs">
                {dim.subcriterios.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </details>

            {/* Niveles 1-5 como botones-cards */}
            <p className="mt-4 text-xs font-medium">Elige el nivel que describe tu situación HOY:</p>
            <div className="mt-2 grid gap-1.5">
              {dim.niveles.map((nivel) => {
                const sel = nivel.valor === valorActual;
                return (
                  <button
                    key={nivel.valor}
                    type="button"
                    onClick={() => setPuntaje(dim.key, nivel.valor)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition ${
                      sel
                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-300'
                        : 'idea-border bg-white hover:bg-amber-50/40'
                    }`}
                  >
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${sel ? 'idea-accent-bg text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {nivel.valor}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs font-semibold text-slate-800">{nivel.etiqueta}</span>
                      <span className="idea-muted block text-xs leading-relaxed">{nivel.descripcion}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Evidencia (obligatoria para defender el puntaje) */}
            <div className="mt-4">
              <label className="block text-xs font-semibold">
                Evidencia que respalda tu puntaje {valorActual}/5
                {!evidencia?.trim() && <span className="ml-1 text-rose-600">*</span>}
              </label>
              <p className="idea-muted mt-0.5 text-[11px]">{dim.guia_evidencia}</p>
              <AutoTextarea
                value={evidencia ?? ''}
                onChange={(e) => setEvidencia(dim.key, e.target.value)}
                rowsMin={2}
                placeholder={
                  descActual
                    ? `Para nivel "${descActual.etiqueta}": cita aquí los datos, entrevistas, cálculos o fuentes que lo respaldan…`
                    : 'Cita aquí los datos, entrevistas, cálculos o fuentes que respaldan tu puntaje…'
                }
                className="idea-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </section>
        );
      })}

      {/* Veredicto */}
      <div className="idea-card mt-4 p-5 text-center">
        <p className="idea-muted text-[11px] uppercase tracking-wider">Promedio ponderado</p>
        <p className={`text-4xl font-bold ${v.clase}`}>{prom.toFixed(1)}<span className="idea-muted text-lg">/5</span></p>
        <p className={`mt-1 text-lg font-semibold ${v.clase}`}>{v.txt}</p>
        <p className="idea-muted mx-auto mt-2 max-w-md text-sm">{v.consejo}</p>
      </div>

      {/* Decisión final */}
      <div className="idea-card mt-4 p-4">
        <p className="text-sm font-semibold">Decisión final</p>
        <p className="idea-muted text-xs">¿Avanzas con un piloto, pivoteas algo o paras? ¿Qué falta validar primero?</p>
        <AutoTextarea
          value={s.notas}
          onChange={(e) => setNotas(e.target.value)}
          rowsMin={4}
          placeholder="Ej: Avanzamos con piloto en Cochabamba, zona Recoleta, 50 clientes en 2 meses. Antes hay que cerrar la hipótesis de precio (HX)."
          className="idea-border mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* Sugerencia IA — propone puntaje + evidencia ejemplo + decisión */}
      <div className="mt-4">
        <SugerirIA
          modulo="idea"
          tarea={
            'Eres asesor académico boliviano. Considerando todo el trabajo previo del estudiante, propón puntajes 1-5 con evidencia ejemplo. ' +
            'Devuelve EXACTAMENTE estas líneas con este formato literal:\n' +
            'Deseabilidad: <1-5>\n' +
            'EvidenciaDeseabilidad: <ejemplo concreto de qué evidencia respaldaría ese puntaje en este caso>\n' +
            'Factibilidad: <1-5>\n' +
            'EvidenciaFactibilidad: <ejemplo concreto>\n' +
            'Viabilidad: <1-5>\n' +
            'EvidenciaViabilidad: <ejemplo concreto>\n' +
            'Notas: <2-3 frases con decisión: avanzar, pivotear o parar, justificada>'
          }
          formato="texto"
          acentoClase="idea-accent-bg text-white"
          contexto={
            `MI IDEA: ${idea || titulo}\nSECTOR: ${sector || 'no especificado'}\nTIPO DE TRABAJO: ${tipoTrabajo ?? 'no especificado'}` +
            (leanCanvas.problema ? `\nPROBLEMA: ${leanCanvas.problema}` : '') +
            (leanCanvas.segmentos ? `\nSEGMENTO: ${leanCanvas.segmentos}` : '') +
            (propVal.dolores?.length ? `\nDolores: ${propVal.dolores.join(', ')}` : '') +
            (propVal.aliviadores?.length ? `\nAliviadores: ${propVal.aliviadores.join(', ')}` : '') +
            (validac.hipotesis?.length ? `\nHipótesis (con estado): ${validac.hipotesis.map((h) => `${h.supuesto} [${h.estado}]`).join('; ')}` : '') +
            '\n\nIMPORTANTE: puntajes específicos a ESTA idea. La "EvidenciaX" debe ser un EJEMPLO de qué tipo de dato/fuente respaldaría el puntaje en este caso concreto (no genérico).'
          }
          placeholder="Detalle opcional para afinar la sugerencia…"
          onAplicar={aplicarIA}
        />
        <p className="idea-muted mt-2 text-xs">
          La IA propone puntajes y un EJEMPLO de evidencia. Tú reemplazas el ejemplo con tu
          evidencia real. Si una evidencia ya está escrita, no la sobrescribe <X className="inline h-3 w-3" />.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => guardar(false)} disabled={guardando} className="idea-btn-ghost px-5 py-2.5 text-sm font-medium disabled:opacity-50">{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={() => guardar(true)} disabled={guardando} className="idea-btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-50">Guardar y volver →</button>
        {guardado && <span className="inline-flex items-center gap-1 text-sm text-emerald-600"><Check className="h-4 w-4" /> Guardado</span>}
      </div>
    </div>
  );
}
