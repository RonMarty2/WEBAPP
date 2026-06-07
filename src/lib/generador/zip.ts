/**
 * Construye un ZIP listo para Overleaf del documento del Generador conectado.
 *
 * Detecta la universidad del Proyecto Maestro (UMSS/UCB/UCATEC/UNIFRANZ) y, si
 * coincide, usa su preámbulo + carátula oficial reutilizando los builders ya
 * existentes en `src/lib/latex/preamble-*.ts`. Si no hay match, cae al
 * documento genérico (article) de `generador/latex.ts`.
 *
 * Los campos que el documento académico exige (carrera, facultad, programa,
 * tutor…) y no están en el maestro, se llenan con placeholders editables tipo
 * `[Tu carrera]`. El estudiante completa el `.tex` antes de compilar en Overleaf.
 */
import JSZip from 'jszip';
import { mdALatex, escaparLatex } from '@/lib/latexMonografia';
import { documentoALatex, nombreTex } from '@/lib/generador/latex';
import {
  buildPreambleUMSS, buildCaratulaUMSS,
} from '@/lib/latex/preamble-umss';
import {
  buildPreambleUCB, buildCaratulaUCB,
} from '@/lib/latex/preamble-ucb';
import {
  buildPreambleUCATEC, buildCaratulaUCATEC,
} from '@/lib/latex/preamble-ucatec';
import {
  buildPreambleUNIFRANZ, buildCaratulaUNIFRANZ,
} from '@/lib/latex/preamble-unifranz';
import type { ProyectoMaestro, SeccionDocumento } from '@/types/maestro';

export type UniversidadDetectada = 'umss' | 'ucb' | 'ucatec' | 'unifranz' | null;

/**
 * Mapea texto libre del campo `universidad` a una de las 4 plantillas.
 * Tolerante a variantes: U.M.S.S., UMSS, Univ. Mayor de San Simón, etc.
 */
export function detectarUniversidad(texto: string | null | undefined): UniversidadDetectada {
  if (!texto) return null;
  // Normaliza: minúsculas, sin acentos, sin puntos/comas/espacios extra
  const t = texto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/[^a-z]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (/\bumss\b|mayor de san simon/.test(t)) return 'umss';
  if (/\bucatec\b|catolica de ciencias y artes|catolica tecnologica/.test(t)) return 'ucatec';
  // UCB debe ir DESPUÉS de UCATEC (también es "Católica" pero más específica).
  if (/\bucb\b|catolica boliviana/.test(t)) return 'ucb';
  if (/\bunifranz\b|franz tamayo/.test(t)) return 'unifranz';
  return null;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Mes y año del documento — usa `actualizado_en` del maestro si existe, sino NOW. */
function mesAnio(maestro: { actualizado_en?: string }): { mes: string; anio: string } {
  const d = maestro.actualizado_en ? new Date(maestro.actualizado_en) : new Date();
  if (isNaN(d.getTime())) {
    const ahora = new Date();
    return { mes: MESES[ahora.getMonth()], anio: String(ahora.getFullYear()) };
  }
  return { mes: MESES[d.getMonth()], anio: String(d.getFullYear()) };
}

/** Genera el cuerpo (secciones convertidas a LaTeX) sin preámbulo ni fin. */
function cuerpoSecciones(secciones: SeccionDocumento[], usarChapter: boolean): string {
  const cmd = usarChapter ? 'chapter' : 'section';
  return secciones
    .map((s) => {
      // Escape completo: $ & % # _ \ ~^ { } y Unicode problemático. Si el
      // estudiante titula "Análisis 50% rentabilidad", el % rompía compilación.
      const titulo = escaparLatex(s.titulo || 'Sección');
      const contenido = s.contenido?.trim()
        ? mdALatex(s.contenido)
        : '\\textit{(Sección pendiente de redactar.)}';
      return `\\${cmd}{${titulo}}\n${contenido}`;
    })
    .join('\n\n');
}

/** Resultado del armado: contenido del .tex principal + nombre del paquete. */
export interface ZipArmado {
  /** Buffer del .zip listo para descargar. */
  buffer: Buffer;
  /** Nombre del archivo .zip ("mi-proyecto-overleaf.zip"). */
  filename: string;
  /** Plantilla detectada (o "generico"). */
  plantilla: UniversidadDetectada | 'generico';
}

export async function armarZipOverleaf(
  maestro: ProyectoMaestro,
  secciones: SeccionDocumento[],
  nombreEstudiante: string,
): Promise<ZipArmado> {
  const universidad = detectarUniversidad(maestro.universidad);
  const tituloProy = maestro.titulo || 'Proyecto';
  const tutor = '[Nombre del tutor]'; // editable en Overleaf
  const ciudad = maestro.municipio || '[Ciudad]';
  const pais = 'Bolivia';
  const { mes, anio } = mesAnio(maestro);

  let mainTex: string;

  if (universidad === 'umss') {
    const preamble = buildPreambleUMSS();
    const caratula = buildCaratulaUMSS({
      nombre: nombreEstudiante,
      titulo: tituloProy,
      programa: '[Programa]',
      version: '[X°]',
      modalidad: maestro.modalidad?.toUpperCase() ?? '[MODALIDAD]',
      universidad: 'UNIVERSIDAD MAYOR DE SAN SIMÓN',
      facultad: '[Facultad]',
      departamento: '[Departamento]',
      ciudad,
      pais,
      mes,
      anio,
      tutor,
    });
    mainTex = [
      preamble,
      caratula,
      '\\tableofcontents',
      '\\newpage',
      cuerpoSecciones(secciones, true),
      '\\end{document}',
      '',
    ].join('\n');
  } else if (universidad === 'ucb') {
    const preamble = buildPreambleUCB();
    const caratula = buildCaratulaUCB({
      nombre: nombreEstudiante,
      titulo: tituloProy,
      departamento: '[Departamento UCB]',
      carrera: '[Carrera]',
      tipo_trabajo: maestro.modalidad ?? '[Tipo de trabajo]',
      universidad: 'UNIVERSIDAD CATÓLICA BOLIVIANA',
      ciudad, pais, mes, anio, tutor,
    });
    mainTex = [preamble, caratula, '\\tableofcontents', '\\newpage', cuerpoSecciones(secciones, true), '\\end{document}', ''].join('\n');
  } else if (universidad === 'ucatec') {
    const preamble = buildPreambleUCATEC();
    const caratula = buildCaratulaUCATEC({
      nombre: nombreEstudiante,
      titulo: tituloProy,
      carrera: '[Carrera]',
      facultad: '[Facultad]',
      modalidad: maestro.modalidad?.toUpperCase() ?? '[MODALIDAD]',
      grado: '[GRADO]',
      universidad: 'UNIVERSIDAD CATÓLICA BOLIVIANA — UCATEC',
      ciudad, pais, mes, anio, tutor,
    });
    mainTex = [preamble, caratula, '\\tableofcontents', '\\newpage', cuerpoSecciones(secciones, true), '\\end{document}', ''].join('\n');
  } else if (universidad === 'unifranz') {
    const preamble = buildPreambleUNIFRANZ();
    const caratula = buildCaratulaUNIFRANZ({
      nombre: nombreEstudiante,
      titulo: tituloProy,
      modalidad: maestro.modalidad?.toUpperCase() ?? '[MODALIDAD]',
      carrera: '[CARRERA]',
      facultad: '[FACULTAD]',
      universidad: 'UNIVERSIDAD PRIVADA FRANZ TAMAYO',
      ciudad, pais, anio, tutor,
    });
    mainTex = [preamble, caratula, '\\tableofcontents', '\\newpage', cuerpoSecciones(secciones, true), '\\end{document}', ''].join('\n');
  } else {
    // Plantilla genérica (article) — reutiliza el builder simple existente.
    mainTex = documentoALatex(maestro, secciones);
  }

  // Empaquetar
  const zip = new JSZip();
  zip.file('main.tex', mainTex);

  // README breve y útil — checklist concreto, no narrativo.
  const placeholdersAdvertencia = universidad
    ? '\n⚠️  Hay placeholders [entre corchetes] en main.tex que DEBES reemplazar:\n     [Carrera], [Facultad], [Departamento], [Nombre del tutor], etc.\n     Búscalos con Ctrl+F en Overleaf y completa con tus datos.\n'
    : '';
  const logoNombre = universidad ? `logos/${universidad}.png` : null;
  const readme = [
    `# ${tituloProy}`,
    '',
    `Generado: ${mes} ${anio}`,
    `Plantilla: ${universidad ? universidad.toUpperCase() : 'genérica (article)'}`,
    '',
    '## Pasos',
    '1. Subir este ZIP a Overleaf (Nuevo Proyecto → Subir Proyecto).',
    logoNombre ? `2. Subir tu logo a ${logoNombre} (o dejar el placeholder).` : '2. (No requiere logo.)',
    `${placeholdersAdvertencia ? '3. ' + placeholdersAdvertencia.trim() + '\n4. ' : '3. '}Compilar con pdflatex.`,
  ].filter(Boolean).join('\n');
  zip.file('README.md', readme);

  // Carpeta para que el estudiante coloque su logo
  zip.folder('logos');

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const filenameBase = nombreTex(tituloProy).replace(/\.tex$/, '');
  return {
    buffer: buffer as Buffer,
    filename: `${filenameBase}-overleaf.zip`,
    plantilla: universidad ?? 'generico',
  };
}
