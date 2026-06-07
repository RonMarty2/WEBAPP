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

/** Mapea texto libre del campo `universidad` a una de las 4 plantillas. */
export function detectarUniversidad(texto: string | null | undefined): UniversidadDetectada {
  if (!texto) return null;
  const t = texto.toLowerCase().replace(/[^a-z]/g, ' ');
  if (/\bumss\b|mayor\s*de\s*san\s*sim/.test(t)) return 'umss';
  if (/\bucb\b|cat[oó]lica\s*boliviana/.test(t)) return 'ucb';
  if (/\bucatec\b|catolica\s*tecnologica|cat[oó]lica\s*ciencia\s*y\s*tecnolog/.test(t)) return 'ucatec';
  if (/\bunifranz\b|franz\s*tamayo/.test(t)) return 'unifranz';
  return null;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function mesActual(): string { return MESES[new Date().getMonth()]; }
function anioActual(): string { return String(new Date().getFullYear()); }

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
  const mes = mesActual();
  const anio = anioActual();

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

  const readme = [
    'Paquete Overleaf generado por Laboratorio Académico PRO',
    '',
    `Proyecto: ${tituloProy}`,
    `Estudiante: ${nombreEstudiante}`,
    `Plantilla: ${universidad ? universidad.toUpperCase() : 'Genérica (article)'}`,
    `Fecha: ${mes} ${anio}`,
    '',
    'Cómo usar:',
    '  1) Sube este ZIP a Overleaf (Nuevo Proyecto → Subir).',
    '  2) Si la plantilla usa logo de tu universidad, ponlo en `logos/` con',
    '     el nombre que el preámbulo espera (ej. `logos/umss.png`).',
    '  3) Reemplaza los placeholders `[Tu...]` por tus datos reales en main.tex.',
    '  4) Compila con pdflatex.',
  ].join('\n');
  zip.file('README.txt', readme);

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
