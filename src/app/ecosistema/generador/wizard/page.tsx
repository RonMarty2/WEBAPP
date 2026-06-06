'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

type Universidad = 'UMSS' | 'UNIFRANZ' | null;
type Modalidad = 'monografia' | 'tesis' | 'pre-factibilidad' | 'mejora-org' | 'artefacto' | 'trabajo-dirigido' | null;
type Fuente = 'importar' | 'cero' | null;

export default function GeneradorWizard() {
  const router = useRouter();
  const { artefactos } = useEcosistema();
  const [paso, setPaso] = useState(1);
  const [universidad, setUniversidad] = useState<Universidad>(null);
  const [modalidad, setModalidad] = useState<Modalidad>(null);
  const [fuente, setFuente] = useState<Fuente>(null);

  const irAlWorkspace = () => router.push('/ecosistema/generador/workspace');

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                paso === n ? 'bg-amber-600 text-white' : paso > n ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>{n}</span>
              {n < 3 && <span className="h-px w-8 bg-slate-300" />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <Step titulo="¿Para qué universidad?" descripcion="El formato del documento final depende de esto.">
            <OpcionGrande
              label="UMSS — Universidad Mayor de San Simón"
              descripcion="Formato oficial UMSS · 5 capítulos + bibliografía APA 7"
              seleccionado={universidad === 'UMSS'}
              onClick={() => setUniversidad('UMSS')}
            />
            <OpcionGrande
              label="UNIFRANZ Cochabamba"
              descripcion="5 modalidades distintas · formato Roxana Beltrán · bibliografía con apellidos en minúscula"
              seleccionado={universidad === 'UNIFRANZ'}
              onClick={() => setUniversidad('UNIFRANZ')}
            />
            <BotonSiguiente disabled={!universidad} onClick={() => setPaso(2)} />
          </Step>
        )}

        {paso === 2 && (
          <Step titulo="¿Qué modalidad?" descripcion="Cada modalidad tiene sus fases obligatorias específicas.">
            {universidad === 'UMSS' ? (
              <>
                <OpcionGrande label="Monografía" descripcion="5 capítulos · Cap 0 a Cap V + bibliografía" seleccionado={modalidad === 'monografia'} onClick={() => setModalidad('monografia')} />
                <OpcionGrande label="Tesis" descripcion="3 capítulos formales + marco práctico" seleccionado={modalidad === 'tesis'} onClick={() => setModalidad('tesis')} />
              </>
            ) : (
              <>
                <OpcionGrande label="Pre-Factibilidad" descripcion="Plan de negocio completo · PESTEL + Porter + Marketing + Financiero" seleccionado={modalidad === 'pre-factibilidad'} onClick={() => setModalidad('pre-factibilidad')} />
                <OpcionGrande label="Mejora Organizacional" descripcion="Microentorno + Estrategias + Plan de implementación" seleccionado={modalidad === 'mejora-org'} onClick={() => setModalidad('mejora-org')} />
                <OpcionGrande label="Artefacto / Producto IoT" descripcion="Especificaciones técnicas + prototipo + validación" seleccionado={modalidad === 'artefacto'} onClick={() => setModalidad('artefacto')} />
                <OpcionGrande label="Trabajo Dirigido" descripcion="Diagnóstico institucional + propuesta + seguimiento" seleccionado={modalidad === 'trabajo-dirigido'} onClick={() => setModalidad('trabajo-dirigido')} />
              </>
            )}
            <BotonSiguiente disabled={!modalidad} onClick={() => setPaso(3)} />
          </Step>
        )}

        {paso === 3 && (
          <Step titulo="¿De dónde sacamos el contenido?" descripcion="Define cómo arranca tu proyecto.">
            <OpcionGrande
              label={`Importar mis artefactos (${artefactos.length} detectados)`}
              descripcion="El Generador llena automáticamente las fases que ya trabajaste. Tú solo refinas."
              seleccionado={fuente === 'importar'}
              onClick={() => setFuente('importar')}
            />
            <OpcionGrande
              label="Empezar desde cero"
              descripcion="El Generador crea tareas en cada plataforma educativa para que las completes."
              seleccionado={fuente === 'cero'}
              onClick={() => setFuente('cero')}
            />
            <button
              disabled={!fuente}
              onClick={irAlWorkspace}
              className="mt-6 w-full rounded-full bg-amber-600 py-3 font-medium text-white hover:bg-amber-700 disabled:bg-slate-300"
            >
              Crear proyecto →
            </button>
          </Step>
        )}
      </section>
    </>
  );
}

function Step({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-2 text-slate-600">{descripcion}</p>
      <div className="mt-6 space-y-3">{children}</div>
    </div>
  );
}

function OpcionGrande({ label, descripcion, seleccionado, onClick }: { label: string; descripcion: string; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-4 text-left transition ${
        seleccionado ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
    </button>
  );
}

function BotonSiguiente({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-6 w-full rounded-full bg-slate-900 py-3 font-medium text-white hover:bg-slate-800 disabled:bg-slate-300"
    >
      Siguiente
    </button>
  );
}
