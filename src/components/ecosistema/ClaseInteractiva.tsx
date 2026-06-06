'use client';

import { useState } from 'react';

export interface Quiz {
  pregunta: string;
  opciones: string[];
  correctaIndex: number;
  explicacion: string;
}

export function ClaseInteractiva({
  numero,
  titulo,
  duracion,
  contenido,
  quiz,
}: {
  numero: number;
  titulo: string;
  duracion: string;
  contenido: string;
  quiz: Quiz;
}) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const correcta = seleccionada === quiz.correctaIndex;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Clase {numero} · {duracion}</p>
      <h3 className="mt-1 text-xl font-bold text-slate-900">{titulo}</h3>
      <p className="mt-3 leading-relaxed text-slate-700">{contenido}</p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Mini-quiz: {quiz.pregunta}</p>
        <div className="mt-3 space-y-2">
          {quiz.opciones.map((op, i) => {
            const esta = seleccionada === i;
            const isCorrecta = seleccionada !== null && i === quiz.correctaIndex;
            const isIncorrecta = esta && i !== quiz.correctaIndex;
            return (
              <button
                key={i}
                onClick={() => setSeleccionada(i)}
                disabled={seleccionada !== null}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isCorrecta
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : isIncorrecta
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {op}
              </button>
            );
          })}
        </div>
        {seleccionada !== null && (
          <p className={`mt-3 text-sm ${correcta ? 'text-emerald-700' : 'text-rose-700'}`}>
            {correcta ? '✓ Correcto.' : '✗ Incorrecto.'} {quiz.explicacion}
          </p>
        )}
      </div>
    </div>
  );
}
