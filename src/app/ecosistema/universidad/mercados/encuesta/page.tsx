'use client';

import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';
import { TutorIA } from '@/components/tutor-ia/TutorIA';

const PREGUNTAS_DEMO = [
  { tipo: 'Cerrada · Likert 5', texto: '¿Qué tan importante es para ti la calidad del café que consumes?', opciones: ['Nada', 'Poco', 'Neutro', 'Importante', 'Muy importante'] },
  { tipo: 'Cerrada · única', texto: '¿Con qué frecuencia visitas cafeterías?', opciones: ['Nunca', '1 vez al mes', '2-3 veces al mes', '1-2 veces por semana', 'Casi todos los días'] },
  { tipo: 'Cerrada · múltiple', texto: '¿Qué buscas en una cafetería? (puedes marcar varias)', opciones: ['Calidad del café', 'Espacio para trabajar', 'Comida saludable', 'Precio bajo', 'Ambiente para conversar'] },
  { tipo: 'Cerrada · rango', texto: '¿Cuánto pagarías por un café de especialidad?', opciones: ['Menos de Bs. 12', 'Bs. 12-18', 'Bs. 18-25', 'Bs. 25-35', 'Más de Bs. 35'] },
  { tipo: 'Abierta', texto: '¿Qué cafetería de Cochabamba norte recomendarías y por qué?', opciones: undefined as string[] | undefined },
];

export default function EncuestaDesigner() {
  const datos = ARTEFACTO_MERCADOS.contenido as Record<string, number>;
  const resumenPreguntas = PREGUNTAS_DEMO
    .map((p, i) => `${i + 1}. [${p.tipo}] ${p.texto}${p.opciones ? ` Opciones: ${p.opciones.join(' / ')}` : ''}`)
    .join('\n');
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Diseñador de encuesta</h1>
        <p className="mt-2 text-slate-600">
          {datos.preguntas} preguntas validadas · {datos.respuestas} respuestas recolectadas
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Vista previa de tu encuesta</h2>
          <button className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700">
            Publicar enlace
          </button>
        </div>
        <ol className="space-y-5">
          {PREGUNTAS_DEMO.map((p, i) => (
            <li key={i} className="border-l-2 border-sky-200 pl-4">
              <p className="text-xs font-medium uppercase tracking-wider text-sky-600">{p.tipo}</p>
              <p className="mt-1 font-medium text-slate-900">{i + 1}. {p.texto}</p>
              {p.opciones && (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {p.opciones.map((op, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-xs">○</span>
                      {op}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700">¿Quieres entender el porqué?</p>
            <p className="mt-1 text-sm text-slate-600">
              El tutor te propone 3 caminos para ordenar la encuesta y elegir el tipo de pregunta adecuado en cada caso.
            </p>
          </div>
          <TutorIA
            modulo="mercados"
            herramienta="encuesta:diseno-preguntas"
            campo="diseño y tipo de preguntas de la encuesta"
            etiqueta="Tutor: tipos de pregunta y orden"
            variante="amplio"
            contexto={`Diseño de encuesta para investigación de mercado (sector cafetería en Cochabamba). Total de preguntas en borrador: ${PREGUNTAS_DEMO.length}. Respuestas esperadas: ${datos.respuestas}.`}
            contenidoActual={resumenPreguntas}
          />
        </div>
      </div>
    </div>
  );
}
