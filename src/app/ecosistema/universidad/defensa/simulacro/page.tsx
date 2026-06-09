'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CASOS_DEFENSA } from '@/lib/casos/defensa';
import type { CategoriaPreguntaTribunal, DificultadPregunta } from '@/lib/casos/types';

const CATEGORIA_LABEL: Record<CategoriaPreguntaTribunal, string> = {
  problema: 'Problema',
  metodologia: 'Metodología',
  marco_teorico: 'Marco teórico',
  resultados: 'Resultados',
  conclusiones: 'Conclusiones',
  viabilidad: 'Viabilidad',
  personal: 'Personal',
};

const DIFICULTAD_LABEL: Record<DificultadPregunta, { label: string; cls: string }> = {
  facil: { label: 'Fácil', cls: 'bg-emerald-100 text-emerald-800' },
  media: { label: 'Media', cls: 'bg-sky-100 text-sky-800' },
  dificil: { label: 'Difícil', cls: 'bg-amber-100 text-amber-800' },
  trampa: { label: 'Trampa', cls: 'bg-rose-100 text-rose-800' },
};

interface PreguntaConCaso {
  casoSlug: string;
  casoTitulo: string;
  universidad: string;
  numero: number;
  categoria: CategoriaPreguntaTribunal;
  dificultad: DificultadPregunta;
  pregunta: string;
  respuesta_modelo: string;
  que_evalua: string;
  trampa_evitar?: string;
}

function aplanarPreguntas(): PreguntaConCaso[] {
  const result: PreguntaConCaso[] = [];
  CASOS_DEFENSA.forEach(c => {
    c.preguntas.forEach(p => {
      result.push({
        casoSlug: c.slug,
        casoTitulo: c.titulo,
        universidad: c.proyecto.universidad,
        numero: p.numero,
        categoria: p.categoria,
        dificultad: p.dificultad,
        pregunta: p.pregunta,
        respuesta_modelo: p.respuesta_modelo,
        que_evalua: p.que_evalua,
        trampa_evitar: p.trampa_evitar,
      });
    });
  });
  return result;
}

export default function SimulacroDefensa() {
  const banco = useMemo(() => aplanarPreguntas(), []);
  const [indice, setIndice] = useState(0);
  const [respuesta, setRespuesta] = useState('');
  const [revelar, setRevelar] = useState(false);

  const actual = banco[indice];

  const cambiarPregunta = () => {
    const nuevo = Math.floor(Math.random() * banco.length);
    setIndice(nuevo === indice && banco.length > 1 ? (nuevo + 1) % banco.length : nuevo);
    setRespuesta('');
    setRevelar(false);
  };

  if (!actual) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Aún no hay preguntas en el banco.</p>
      </div>
    );
  }

  const dif = DIFICULTAD_LABEL[actual.dificultad];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Simulacro de defensa</h1>
        <p className="mt-2 text-slate-600">
          Pregunta aleatoria del banco de defensas bolivianas. Escribe tu respuesta sin mirar la
          modelo, luego compara y aprende. Cuantas más preguntas practiques, más cómodo te sentirás
          ante el tribunal real.
        </p>
      </header>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800">
            {CATEGORIA_LABEL[actual.categoria]}
          </span>
          <span className={`rounded-full px-2 py-0.5 font-semibold ${dif.cls}`}>{dif.label}</span>
          <span className="text-slate-500">{actual.universidad}</span>
        </div>

        <p className="mt-3 text-xs text-slate-500">Pregunta {actual.numero} del caso "{actual.casoTitulo}"</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{actual.pregunta}</p>

        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700">Tu respuesta</label>
          <textarea
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={revelar}
            placeholder="Escribe tu respuesta como si estuvieras frente al tribunal..."
            rows={8}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-500">{respuesta.length} caracteres</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {!revelar ? (
            <button
              onClick={() => setRevelar(true)}
              disabled={respuesta.trim().length < 10}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
            >
              Ver respuesta modelo
            </button>
          ) : (
            <button
              onClick={cambiarPregunta}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Siguiente pregunta aleatoria
            </button>
          )}
          <button
            onClick={cambiarPregunta}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cambiar pregunta sin responder
          </button>
        </div>
      </section>

      {revelar && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Respuesta modelo</p>
            <p className="mt-2 leading-relaxed text-slate-800">{actual.respuesta_modelo}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Qué evalúa el tribunal</p>
              <p className="mt-2 text-sm text-slate-700">{actual.que_evalua}</p>
            </div>
            {actual.trampa_evitar && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Trampa a evitar</p>
                <p className="mt-2 text-sm text-slate-700">{actual.trampa_evitar}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Comparación honesta</p>
            <p className="mt-1 text-xs">
              Lee tu respuesta y la modelo una al lado de la otra. Pregúntate: ¿cubrí el núcleo del
              tema? ¿usé cifras o autores específicos como la modelo? ¿caí en la trampa? Lo
              importante no es copiar la modelo, sino entender la estructura para que tu propia
              respuesta tenga la misma solidez.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Estudia las defensas completas</p>
        <p className="mt-1 text-xs text-slate-600">
          Las preguntas aleatorias vienen del banco de 5 casos bolivianos resueltos. Para estudiar
          una defensa completa con sus 18 preguntas, sus puntos débiles y sus fortalezas, abre la
          galería.
        </p>
        <Link
          href="/ecosistema/universidad/defensa/casos"
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Ver casos de Bolivia →
        </Link>
      </section>
    </div>
  );
}
