'use client';

/**
 * <DocumentoCompleto>
 *
 * Vista principal del documento académico del alumno. Renderiza en HTML
 * bonito todo el contenido del proyecto: carátula + índice + capítulos
 * con numeración + bibliografía + botón "Copiar todo al Word".
 *
 * Patrón:
 *   1. Recibe `phaseContents` (markdown por fase) + datos del proyecto.
 *   2. Procesa cada fase con `parsearMarkdownNumerado` para resolver
 *      numeración global (capítulos, secciones, figuras, tablas).
 *   3. Renderiza la pantalla con estilos modernos (Tailwind + tipografía
 *      serif académica simulada con CSS).
 *   4. El botón "Copiar todo al Word" genera HTML paralelo con estilos
 *      inline (Times New Roman, márgenes, etc.) que Word entiende, y
 *      lo manda al portapapeles vía Clipboard API.
 *
 * NO toca el backend ni cambia /api/projects/* — solo lee datos existentes.
 */

import { useMemo, useState } from 'react';
import { Copy, Check, Download, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
import {
  parsearMarkdownNumerado,
  nuevoNumerador,
  generarIndice,
  romano,
  type BloqueNumerado,
  type NumeradorEstado,
  type EntradaIndice,
} from '@/lib/documento-web/numeracion';
import { detectarCitas, consolidarCitas, resaltarCitasEnTexto, type CitaUnica } from '@/lib/documento-web/citas';
import { copiarHTMLAlPortapapeles } from '@/lib/documento-web/copiar-html';
import { generarHTMLParaWord, type DatosCaratulaWord } from '@/lib/documento-web/exportar-word';
import { obtenerNorma } from '@/lib/documento-web/normas-universitarias';
import { limpiarParaDocumentoFinal } from '@/lib/documento-web/limpieza-final';
import { parseDiagrama } from '@/lib/diagramas/parse';
import { diagramaASvg } from '@/lib/diagramas/svg';
import { svgAPng } from '@/lib/diagramas/rasterizar';
import { tablaAGrafico } from '@/lib/diagramas/desde-tabla';

export interface FaseDoc {
  id: string;
  label: string;
  short_label?: string;
  orden: number;
}

export interface DocumentoCompletoProps {
  /** Título del proyecto (aparece en carátula y header). */
  titulo: string;
  /** Datos opcionales para la carátula (universidad, autor, tutor, etc.). */
  caratula?: Partial<DatosCaratulaWord>;
  /** Fases ordenadas a renderizar. */
  fases: FaseDoc[];
  /** Contenido markdown por id de fase. */
  phaseContents: Record<string, string | null | undefined>;
  /** Mostrar carátula en pantalla (default true). Si false, solo se incluye al exportar. */
  mostrarCaratula?: boolean;
  /**
   * ID de la universidad del proyecto (ej. "umss-001"). Determina la norma
   * que se aplica al render (tipografía, tamaño, interlineado, márgenes,
   * color de acento, estilo de citas). Si se omite, usa la norma default.
   */
  universidadId?: string | null;
}

/**
 * Rasteriza a PNG los diagramas (bloques ```diagrama) para embeberlos como
 * imagen real en la descarga/copia a Word. Se hace en el cliente con Canvas;
 * si algo falla, el builder de Word cae al SVG inline.
 */
async function rasterizarDiagramas(
  capitulos: { bloques: BloqueNumerado[] }[],
): Promise<Record<string, string>> {
  const png: Record<string, string> = {};
  for (const cap of capitulos) {
    for (const b of cap.bloques) {
      // Bloques diagrama explícitos que emitió la IA.
      if (b.tipo === 'figura' && b.lang === 'diagrama' && b.raw && b.id) {
        const spec = parseDiagrama(b.raw);
        if (!spec) continue;
        const dataUri = await svgAPng(diagramaASvg(spec, { sinTitulo: true }));
        if (dataUri) png[b.id] = dataUri;
      }
      // Tablas convertibles a gráfico (auto-derivado, sin tocar el markdown).
      // Se rasteriza con clave `${id}::graf` para no chocar con la tabla.
      if (b.tipo === 'tabla' && b.filas && b.id) {
        const grafico = tablaAGrafico(b.filas, b.texto);
        if (!grafico) continue;
        const dataUri = await svgAPng(diagramaASvg(grafico, { sinTitulo: true }));
        if (dataUri) png[`${b.id}::graf`] = dataUri;
      }
    }
  }
  return png;
}

export default function DocumentoCompleto({
  titulo,
  caratula = {},
  fases,
  phaseContents,
  mostrarCaratula = true,
  universidadId,
}: DocumentoCompletoProps) {
  const [copiado, setCopiado] = useState(false);
  const [errorCopia, setErrorCopia] = useState<string | null>(null);

  // Resuelve la norma de la universidad — controla tipografía, tamaño,
  // interlineado, márgenes, color de acento y estilo de citas.
  const norma = useMemo(() => obtenerNorma(universidadId ?? null), [universidadId]);

  // Procesa todas las fases con un numerador compartido.
  const { capitulos, indice, bibliografia, hayContenido } = useMemo(() => {
    const numerador: NumeradorEstado = nuevoNumerador();
    const capitulos: { fase: FaseDoc; bloques: BloqueNumerado[]; indice: EntradaIndice[] }[] = [];
    const todasCitas: ReturnType<typeof detectarCitas> = [];
    let hayContenido = false;

    // Fases internas que NUNCA deben aparecer como capítulos del documento
    // legible: la compilación LaTeX (su contenido es el .tex crudo con %%%%),
    // el control de calidad y la propuesta de temas (Cap.0). Mismo criterio
    // que /documento. Sin esto, "Compilar LaTeX" salía como "Capítulo III".
    const esFaseInterna = (id: string, label?: string) =>
      /latex|calidad/i.test(id) ||
      id === 'ph-cap0' ||
      id === 'ph-proy-cap0' ||
      /compilar\s*latex|control\s*de\s*calidad|propuesta\s*de\s*tema/i.test(label ?? '');

    for (const fase of fases) {
      if (esFaseInterna(fase.id, fase.label)) continue;
      // Limpiamos marcadores y secciones internas ANTES del parser:
      // "Referencias observadas", "[VERIFICAR]", separadores ───, etc.
      // Sin esto, el numerador las trata como subsecciones del cuerpo y
      // el estudiante ve notas editoriales mezcladas con su tesis.
      const md = limpiarParaDocumentoFinal((phaseContents[fase.id] ?? '').trim());
      if (!md) {
        capitulos.push({ fase, bloques: [], indice: [] });
        continue;
      }
      hayContenido = true;

      // Si el markdown no empieza con h1, lo prefijo con el label como h1
      // para que el numerador genere "Capítulo I — Label".
      const inicia = md.startsWith('#') ? '' : `# ${fase.label}\n\n`;
      const mdConTitulo = inicia + md;

      const bloques = parsearMarkdownNumerado(mdConTitulo, numerador, {
        iniciaCapitulo: true,
        prefijoId: fase.id,
      });
      const indiceFase = generarIndice(bloques, fase.id);
      capitulos.push({ fase, bloques, indice: indiceFase });

      // Detectar citas en todos los textos de párrafos y listas.
      for (const b of bloques) {
        if (b.tipo === 'parrafo' || b.tipo === 'cita_bloque') {
          todasCitas.push(...detectarCitas(b.texto));
        } else if (b.tipo === 'lista' && b.items) {
          for (const it of b.items) todasCitas.push(...detectarCitas(it));
        }
      }
    }

    const bibliografia = consolidarCitas(todasCitas);
    const indice = capitulos.flatMap((c) => c.indice);

    return { capitulos, indice, bibliografia, hayContenido };
  }, [fases, phaseContents]);

  async function copiarAlWord() {
    setErrorCopia(null);

    // Generar HTML paralelo con estilos inline para Word.
    const datosCaratula: DatosCaratulaWord = {
      titulo: caratula.titulo ?? titulo,
      universidad: caratula.universidad,
      universidadId: universidadId ?? caratula.universidadId,
      facultad: caratula.facultad,
      carrera: caratula.carrera,
      modalidad: caratula.modalidad,
      estudiante: caratula.estudiante,
      tutor: caratula.tutor,
      ciudad: caratula.ciudad,
      ano: caratula.ano ?? new Date().getFullYear(),
    };
    const pngDiagramas = await rasterizarDiagramas(capitulos);
    const html = generarHTMLParaWord({
      caratula: datosCaratula,
      capitulos: capitulos.map((c) => ({ label: c.fase.label, bloques: c.bloques })),
      bibliografia,
      pngDiagramas,
    });

    const res = await copiarHTMLAlPortapapeles(html);
    if (res.ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3500);
    } else {
      setErrorCopia(res.error || 'No se pudo copiar. Intenta de nuevo.');
    }
  }

  async function descargarWord() {
    const datosCaratula: DatosCaratulaWord = {
      titulo: caratula.titulo ?? titulo,
      universidad: caratula.universidad,
      universidadId: universidadId ?? caratula.universidadId,
      facultad: caratula.facultad,
      carrera: caratula.carrera,
      modalidad: caratula.modalidad,
      estudiante: caratula.estudiante,
      tutor: caratula.tutor,
      ciudad: caratula.ciudad,
      ano: caratula.ano ?? new Date().getFullYear(),
    };
    const pngDiagramas = await rasterizarDiagramas(capitulos);
    const html = generarHTMLParaWord({
      caratula: datosCaratula,
      capitulos: capitulos.map((c) => ({ label: c.fase.label, bloques: c.bloques })),
      bibliografia,
      pngDiagramas,
    });
    // Descarga como .doc: Word abre HTML con formato (Times, márgenes, tablas)
    // de forma nativa. El MIME application/msword hace que el SO lo asocie a Word.
    const blob = new Blob(['﻿', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = (caratula.titulo ?? titulo)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'documento';
    a.download = `${safe}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!hayContenido) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-700">Tu documento aún no tiene contenido</h2>
        <p className="mt-2 text-sm text-slate-500">
          Vuelve al workspace y genera al menos un capítulo. Cuando tengas contenido, esta vista te lo muestra
          armado bonito, con índice, numeración y formato académico listo para pegar en Word.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Barra de acciones flotante */}
      <div className="sticky top-4 z-20 mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-md backdrop-blur">
        <BookOpen className="h-5 w-5 text-slate-600" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tu documento académico</p>
          <p className="truncate text-sm font-bold text-slate-900">{titulo}</p>
        </div>
        <button
          type="button"
          onClick={descargarWord}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" /> Descargar Word
        </button>
        <button
          type="button"
          onClick={copiarAlWord}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4" /> Copiado, abre Word y pega
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copiar todo al Word
            </>
          )}
        </button>
      </div>

      {errorCopia && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorCopia}</span>
        </div>
      )}

      {/* Página simulada: fondo blanco con sombras como hoja real */}
      <article className="rounded-lg bg-white shadow-lg ring-1 ring-slate-200 doc-tipografia">
        {mostrarCaratula && <Caratula titulo={titulo} datos={caratula} />}

        <Indice indice={indice} />

        {capitulos.map((cap) => (
          <CapituloRender key={cap.fase.id} bloques={cap.bloques} />
        ))}

        {bibliografia.length > 0 && <Bibliografia citas={bibliografia} />}
      </article>

      {/* Banda visual con la norma activa — el alumno sabe que el formato
          que ve coincide con lo que pide su universidad. */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50/50 px-3 py-2 text-xs">
        <span className="text-violet-900">
          📐 Formato aplicado: <strong>{norma.nombreCorto}</strong> · {norma.fuenteWord.split(',')[0].replace(/"/g, '')} {norma.tamanoBasePt}pt, interlineado {norma.interlineado === 2.0 ? 'doble' : norma.interlineado}, márgenes {norma.margenes.izquierda}cm
        </span>
        <span className="text-violet-700">
          Citas: <strong>{norma.citas === 'apa7' ? 'APA 7' : norma.citas === 'iso690' ? 'ISO 690' : 'Vancouver'}</strong>
        </span>
      </div>

      {/* Estilos académicos — la fuente, tamaño base, interlineado y color
          de acento vienen de la norma de la universidad del proyecto. */}
      <style jsx global>{`
        .doc-tipografia {
          font-family: ${norma.fuentePantalla};
          color: #1a1a1a;
          padding: 64px 72px;
          line-height: ${norma.interlineado === 2.0 ? 1.8 : norma.interlineado === 1.5 ? 1.6 : 1.5};
          font-size: ${Math.max(13, norma.tamanoBasePt + 2)}px;
          /* Evita que un texto largo sin espacios (ej. una fila de %%% de
             LaTeX) ensanche la hoja y recorte el contenido centrado en móvil. */
          overflow-wrap: break-word;
          word-break: break-word;
        }
        @media (max-width: 640px) {
          .doc-tipografia { padding: 28px 20px; }
        }
        .doc-tipografia .h1-cap,
        .doc-tipografia .h2,
        .doc-tipografia .h3,
        .doc-tipografia .h4 {
          color: ${norma.colorAcento} !important;
        }
        .doc-tipografia p {
          text-align: ${norma.alineacion};
        }
        .doc-tipografia .h1-cap {
          font-size: 22px;
          font-weight: 700;
          color: #0c1e44;
          text-align: center;
          margin: 56px 0 24px 0;
          letter-spacing: 0.02em;
          page-break-before: always;
        }
        .doc-tipografia .h2 {
          font-size: 17px;
          font-weight: 700;
          color: #0c1e44;
          margin: 28px 0 12px 0;
        }
        .doc-tipografia .h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0c1e44;
          margin: 22px 0 8px 0;
        }
        .doc-tipografia .h4 {
          font-size: 14px;
          font-weight: 700;
          color: #2c3e63;
          margin: 16px 0 6px 0;
        }
        .doc-tipografia p {
          margin: 0 0 14px 0;
          text-align: justify;
          text-indent: 1.5em;
          font-size: 15px;
        }
        .doc-tipografia p.sin-indent {
          text-indent: 0;
        }
        .doc-tipografia ul, .doc-tipografia ol {
          margin: 8px 0 14px 1.5em;
          padding-left: 0.5em;
          font-size: 15px;
        }
        .doc-tipografia li { margin-bottom: 4px; }
        .doc-tipografia .cita-doc {
          color: #0c1e44;
          font-style: normal;
          font-weight: 500;
          background: rgba(99, 102, 241, 0.08);
          padding: 0 3px;
          border-radius: 3px;
        }
        .doc-tipografia blockquote {
          margin: 16px 0 16px 24px;
          padding: 8px 16px;
          border-left: 4px solid #0c1e44;
          font-style: italic;
          font-size: 14px;
          color: #333;
        }
        .doc-tipografia .doc-tabla {
          margin: 20px 0;
        }
        .doc-tipografia .doc-tabla-caption {
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 6px;
        }
        .doc-tipografia .doc-tabla-fuente {
          font-size: 11px;
          font-style: italic;
          text-align: center;
          color: #666;
          margin-top: 4px;
        }
        .doc-tipografia table {
          border-collapse: collapse;
          width: 100%;
          font-size: 13px;
        }
        .doc-tipografia th, .doc-tipografia td {
          border: 1px solid #333;
          padding: 6px 10px;
          text-align: left;
          vertical-align: top;
        }
        .doc-tipografia th {
          background: #e8eaf6;
          font-weight: 700;
        }
        .doc-tipografia .doc-figura {
          margin: 20px 0;
          padding: 18px;
          border: 1px dashed #999;
          text-align: center;
          background: #fafafa;
        }
        .doc-tipografia .doc-figura-caption {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .doc-tipografia .doc-figura img {
          max-width: 100%;
          height: auto;
        }
        .doc-tipografia pre {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 10px;
          margin: 12px 0;
          font-family: "Consolas", "Monaco", monospace;
          font-size: 12px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}

function Caratula({ titulo, datos }: { titulo: string; datos: Partial<DatosCaratulaWord> }) {
  return (
    <header className="flex min-h-[600px] flex-col items-center justify-center text-center" style={{ pageBreakAfter: 'always' }}>
      {datos.universidad && (
        <p className="text-xl font-bold uppercase tracking-wide" style={{ color: '#0c1e44' }}>
          {datos.universidad}
        </p>
      )}
      {datos.facultad && <p className="mt-1 text-base font-medium text-slate-700">{datos.facultad}</p>}
      {datos.carrera && <p className="mt-1 text-sm text-slate-600">{datos.carrera}</p>}

      <h1 className="mt-20 text-3xl font-bold leading-tight" style={{ color: '#0c1e44', maxWidth: '85%' }}>
        {datos.titulo ?? titulo}
      </h1>

      {datos.modalidad && (
        <p className="mt-6 text-base italic text-slate-700">{datos.modalidad}</p>
      )}

      <div className="mt-24 space-y-2 text-base text-slate-800">
        {datos.estudiante && (
          <p><strong>Por:</strong> {datos.estudiante}</p>
        )}
        {datos.tutor && (
          <p><strong>Tutor:</strong> {datos.tutor}</p>
        )}
      </div>

      <p className="mt-16 text-base">
        {datos.ciudad ?? 'Bolivia'} – {datos.ano ?? new Date().getFullYear()}
      </p>
    </header>
  );
}

function Indice({ indice }: { indice: EntradaIndice[] }) {
  if (indice.length === 0) return null;
  return (
    <section className="mb-12" style={{ pageBreakAfter: 'always' }}>
      <h1 className="h1-cap" style={{ marginTop: 0 }}>ÍNDICE</h1>
      <ul className="space-y-1.5 text-base">
        {indice.map((e, i) => (
          <li
            key={i}
            className={
              e.nivel === 1
                ? 'font-bold uppercase tracking-wide'
                : e.nivel === 2
                ? 'ml-6 text-slate-800'
                : 'ml-12 text-sm text-slate-700'
            }
          >
            <a href={`#${e.id}`} className="hover:underline">
              {e.nivel === 1 ? `Capítulo ${e.numero}. ${e.texto}` : `${e.numero}. ${e.texto}`}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CapituloRender({ bloques }: { bloques: BloqueNumerado[] }) {
  return (
    <>
      {bloques.map((b, i) => (
        <BloqueRender key={i} b={b} />
      ))}
    </>
  );
}

function BloqueRender({ b }: { b: BloqueNumerado }) {
  if (b.tipo === 'h1' && b.esCapitulo) {
    return (
      <h1 id={b.id} className="h1-cap">
        CAPÍTULO {b.numero}
        <br />
        {b.texto.toUpperCase()}
      </h1>
    );
  }
  if (b.tipo === 'h2') {
    return (
      <h2 id={b.id} className="h2">
        {b.numero && `${b.numero}. `}{b.texto}
      </h2>
    );
  }
  if (b.tipo === 'h3') {
    return (
      <h3 id={b.id} className="h3">
        {b.numero && `${b.numero}. `}{b.texto}
      </h3>
    );
  }
  if (b.tipo === 'h4') {
    return (
      <h4 id={b.id} className="h4">
        {b.numero && `${b.numero}. `}{b.texto}
      </h4>
    );
  }
  if (b.tipo === 'parrafo') {
    return (
      <p dangerouslySetInnerHTML={{ __html: renderInline(b.texto, true) }} />
    );
  }
  if (b.tipo === 'cita_bloque') {
    return (
      <blockquote dangerouslySetInnerHTML={{ __html: renderInline(b.texto, true) }} />
    );
  }
  if (b.tipo === 'lista') {
    return (
      <ul>
        {(b.items ?? []).map((it, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(it, true) }} />
        ))}
      </ul>
    );
  }
  if (b.tipo === 'tabla') {
    // Si la tabla tiene formato de frecuencias/datos numéricos claros, la
    // dibujamos TAMBIÉN como gráfico debajo (solo en el render — no toca
    // el markdown guardado). Si la tabla es de prosa, tablaAGrafico devuelve
    // null y no aparece nada extra.
    const grafico = b.filas ? tablaAGrafico(b.filas, b.texto) : null;
    return (
      <div className="doc-tabla" id={b.id}>
        <p className="doc-tabla-caption">
          {b.numero}{b.texto ? `: ${b.texto}` : ''}
        </p>
        <table>
          <thead>
            <tr>
              {(b.filas?.[0] ?? []).map((c, i) => (
                <th key={i} dangerouslySetInnerHTML={{ __html: renderInline(c, false) }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {(b.filas ?? []).slice(1).map((fila, ri) => (
              <tr key={ri}>
                {fila.map((c, ci) => (
                  <td key={ci} dangerouslySetInnerHTML={{ __html: renderInline(c, false) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="doc-tabla-fuente">Fuente: Elaboración propia con base en datos del estudio.</p>
        {grafico && (
          <figure style={{ margin: '14px 0 4px', textAlign: 'center' }}>
            <div dangerouslySetInnerHTML={{ __html: diagramaASvg(grafico, { sinTitulo: true }) }} />
          </figure>
        )}
      </div>
    );
  }
  if (b.tipo === 'figura') {
    if (b.lang === 'diagrama' && b.raw) {
      const spec = parseDiagrama(b.raw);
      if (spec) {
        return (
          <figure id={b.id} style={{ margin: '20px 0', textAlign: 'center' }}>
            <div dangerouslySetInnerHTML={{ __html: diagramaASvg(spec, { sinTitulo: true }) }} />
            <figcaption style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: '#0c1e44' }}>
              {b.numero}: {b.texto}
            </figcaption>
          </figure>
        );
      }
    }
    return (
      <div className="doc-figura" id={b.id}>
        <p className="doc-figura-caption">{b.numero}: {b.texto}</p>
        {b.lang === 'imagen' && b.raw ? (
          <img src={b.raw} alt={b.texto} />
        ) : (
          <p className="text-xs italic text-slate-500">
            [Diagrama/gráfico {b.lang?.toUpperCase()}. Al copiar al Word, reemplaza con la imagen final.]
          </p>
        )}
      </div>
    );
  }
  if (b.tipo === 'code') {
    return <pre>{b.texto}</pre>;
  }
  return null;
}

function renderInline(texto: string, conCitas: boolean): string {
  let r = texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  r = r.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
  r = r.replace(/`([^`]+?)`/g, '<code style="background:#f3f3f3;padding:0 4px;border-radius:3px;font-family:Consolas,monospace;font-size:0.9em;">$1</code>');
  if (conCitas) {
    r = resaltarCitasEnTexto(r);
  }
  return r;
}

function Bibliografia({ citas }: { citas: CitaUnica[] }) {
  return (
    <section style={{ pageBreakBefore: 'always' }}>
      <h1 className="h1-cap">REFERENCIAS BIBLIOGRÁFICAS</h1>
      <ol className="list-none pl-0 text-sm" style={{ counterReset: 'ref' }}>
        {citas.map((c, i) => (
          <li
            key={c.clave}
            className="mb-2"
            style={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              textIndent: '-1.5em',
              paddingLeft: '1.5em',
              lineHeight: 1.5,
            }}
          >
            <ChevronRight className="inline h-3 w-3 text-slate-400" style={{ marginRight: '4px' }} />
            {c.texto_display}
            {c.apariciones > 1 && (
              <span className="ml-2 text-xs text-slate-400">({c.apariciones} apariciones)</span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs italic text-amber-900">
        <strong>Nota:</strong> esta bibliografía se generó detectando las citas en el cuerpo del texto.
        Antes de entregar, completa cada referencia con la fuente formal (título completo, editorial,
        páginas) según la norma de tu universidad (APA 7, ISO 690, etc.).
      </p>
    </section>
  );
}
