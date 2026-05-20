'use client';

import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';

type Step = 'wizard' | 'analyzing' | 'result';

const EJEMPLO_GUIA = `Trabajo Final de Semestre — Comunicación Social

El trabajo debe incluir las siguientes secciones obligatorias:

1. Introducción al tema elegido (mínimo 2 páginas).
2. Análisis comparativo de 3 casos de estudio reales del sector.
3. Una entrevista a un experto del área (mínimo 5 preguntas).
4. Conclusiones personales y reflexión crítica.

Requisitos formales:
- Mínimo 15 páginas, máximo 25.
- Citas en formato APA 7.
- Incluir al menos 2 tablas comparativas.
- Incluir imágenes ilustrativas cuando sea pertinente.
- Bibliografía con mínimo 10 fuentes confiables.

Fecha de entrega: fin de semestre.`;

type PlanItem = {
  titulo: string;
  origen: 'base' | 'adaptativo' | 'componente';
  detalle: string;
  paginas?: string;
};

const MOCK_RESULTADO = {
  baseElegida: 'UMSS Reducido',
  baseId: 'umss-reducido',
  score: 0.74,
  alternativas: [
    { nombre: 'UMSS Reducido', score: 0.74, elegida: true },
    { nombre: 'UMSS Clásico', score: 0.61, elegida: false },
    { nombre: 'UCB Licenciatura', score: 0.48, elegida: false },
    { nombre: 'UNIFRANZ Tesis', score: 0.29, elegida: false },
    { nombre: 'Proyecto de Grado (PG)', score: 0.18, elegida: false },
  ],
  razonamiento:
    'La guía pide planteamiento, análisis y conclusiones, sin hipótesis ni marco teórico extenso. La extensión (15–25 pp.) y el tono encajan con UMSS Reducido. Las secciones "casos de estudio" y "entrevista a experto" no existen en esa base — se generarán como fases adaptativas.',
  plan: [
    {
      titulo: 'Introducción al tema',
      origen: 'base',
      detalle: 'Se usa el prompt de "Planteamiento" de UMSS Reducido, adaptado al tono solicitado.',
      paginas: '2–3 pp.',
    },
    {
      titulo: 'Análisis de 3 casos de estudio',
      origen: 'adaptativo',
      detalle:
        'No existe en ninguna plantilla. La IA genera esta sección con contexto de la introducción + tema. Reutiliza el componente de tablas comparativas.',
      paginas: '5–7 pp.',
    },
    {
      titulo: 'Entrevista a experto (5 preguntas)',
      origen: 'adaptativo',
      detalle:
        'Sección nueva generada con IA. Estructura: presentación del experto + 5 preguntas con respuestas plausibles + síntesis.',
      paginas: '3–4 pp.',
    },
    {
      titulo: 'Tablas comparativas',
      origen: 'componente',
      detalle: 'Reutiliza el motor de tablas existente del proyecto (mismo que usa Scribe y Proyecto de Grado).',
      paginas: 'integradas',
    },
    {
      titulo: 'Imágenes ilustrativas',
      origen: 'componente',
      detalle: 'Reutiliza el pipeline de imágenes del estudiante (figuras/ en el ZIP de Overleaf).',
      paginas: 'integradas',
    },
    {
      titulo: 'Conclusiones personales',
      origen: 'base',
      detalle: 'Se usa el prompt de "Conclusiones" de UMSS Reducido, ajustado a tono reflexivo.',
      paginas: '2–3 pp.',
    },
    {
      titulo: 'Bibliografía APA 7',
      origen: 'componente',
      detalle: 'Reutiliza el consolidador de referencias APA 7 (mismo que usan Scribe y PG).',
      paginas: '10+ fuentes',
    },
  ] as PlanItem[],
};

export default function AdaptativoDemoPage() {
  const [step, setStep] = useState<Step>('wizard');
  const [nombre, setNombre] = useState('');
  const [guia, setGuia] = useState('');

  const cargarEjemplo = () => {
    setNombre('Trabajo Final de Semestre');
    setGuia(EJEMPLO_GUIA);
  };

  const limpiar = () => {
    setNombre('');
    setGuia('');
  };

  const analizar = () => {
    setStep('analyzing');
    setTimeout(() => setStep('result'), 2600);
  };

  const reiniciar = () => {
    setStep('wizard');
    setNombre('');
    setGuia('');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 60% at 10% 0%, rgba(139,92,246,0.08) 0%, transparent 60%), var(--bg-base, #f2f2f0)',
        padding: '48px 20px 80px',
        fontFamily: 'var(--font-atkinson), Inter, system-ui, sans-serif',
        color: 'var(--fg-primary, #1E1B4B)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <DemoHeader />

        {step === 'wizard' && (
          <WizardLibre
            nombre={nombre}
            guia={guia}
            onNombreChange={setNombre}
            onGuiaChange={setGuia}
            onCargarEjemplo={cargarEjemplo}
            onLimpiar={limpiar}
            onAnalizar={analizar}
          />
        )}

        {step === 'analyzing' && <AnalizandoGuia nombre={nombre} />}

        {step === 'result' && (
          <ResultadoMatching
            nombre={nombre}
            onReiniciar={reiniciar}
          />
        )}

        <FooterDemo />
      </div>
    </main>
  );
}

function DemoHeader() {
  return (
    <header style={{ marginBottom: 32, textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 999,
          border: '1px solid var(--border, #9e9e9a)',
          background: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent, #6366F1)',
          marginBottom: 18,
        }}
      >
        Demo · Servicio Adaptativo
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 'clamp(34px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          margin: 0,
          marginBottom: 14,
        }}
      >
        Tu documento, <span style={{ color: 'var(--accent, #6366F1)' }}>tu formato</span>
      </h1>
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: 'var(--fg-muted, #4F46E5)',
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        Escribe qué trabajo necesitas, sube la guía que te dieron, y la plataforma combina
        lo mejor de UMSS, UCB y UNIFRANZ — más lo que la IA improvise según contexto.
      </p>
    </header>
  );
}

type WizardProps = {
  nombre: string;
  guia: string;
  onNombreChange: (v: string) => void;
  onGuiaChange: (v: string) => void;
  onCargarEjemplo: () => void;
  onLimpiar: () => void;
  onAnalizar: () => void;
};

function WizardLibre({
  nombre,
  guia,
  onNombreChange,
  onGuiaChange,
  onCargarEjemplo,
  onLimpiar,
  onAnalizar,
}: WizardProps) {
  const [modoEntrada, setModoEntrada] = useState<'archivo' | 'texto'>('archivo');
  const [archivo, setArchivo] = useState<{ nombre: string; sizeKB: number } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const procesarArchivo = (file: File) => {
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    setArchivo({ nombre: file.name, sizeKB });
    onGuiaChange(`[ARCHIVO SUBIDO: ${file.name} · ${sizeKB} KB]`);
  };

  const onSeleccionarArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) procesarArchivo(f);
  };

  const onSoltarArchivo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) procesarArchivo(f);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    onGuiaChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cargarEjemploLocal = () => {
    if (modoEntrada === 'archivo') {
      setArchivo({ nombre: 'guia-trabajo-final-semestre.pdf', sizeKB: 142 });
      onNombreChange('Trabajo Final de Semestre');
      onGuiaChange('[ARCHIVO SUBIDO: guia-trabajo-final-semestre.pdf · 142 KB]');
    } else {
      setArchivo(null);
      onCargarEjemplo();
    }
  };

  const limpiarTodo = () => {
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onLimpiar();
  };

  const puedeAnalizar =
    nombre.trim().length > 3 &&
    ((modoEntrada === 'archivo' && archivo !== null) ||
      (modoEntrada === 'texto' && guia.trim().length > 80));

  const mensajeInvalido =
    modoEntrada === 'archivo'
      ? 'Necesitamos un nombre y un archivo con la guía.'
      : 'Necesitamos un nombre y una guía con al menos un par de párrafos.';

  return (
    <section
      style={{
        background: 'var(--bg-card, #fafafa)',
        border: '1px solid var(--border, #9e9e9a)',
        borderRadius: 14,
        padding: 32,
        boxShadow: '0 1px 3px rgba(20,20,20,0.06), 0 6px 18px rgba(20,20,20,0.05)',
      }}
    >
      <StepHeader paso="Paso 1 de 3" titulo="Cuéntanos qué trabajo necesitas" />

      <label style={labelStyle}>Nombre de tu trabajo</label>
      <p style={hintStyle}>
        Como tú quieras llamarlo. Ejemplos: <em>Trabajo Final de Semestre</em>,{' '}
        <em>Tesina corta</em>, <em>Ensayo extenso</em>, <em>Proyecto de aula</em>.
      </p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => onNombreChange(e.target.value)}
        placeholder="Ej: Trabajo Final de Semestre"
        style={inputStyle}
      />

      <label style={{ ...labelStyle, marginTop: 22 }}>Guía que te entregaron</label>
      <p style={hintStyle}>
        Sube el archivo que te entregaron o pega el texto. Mientras más detalle, mejor elige
        la plataforma su base.
      </p>

      {/* Tabs: archivo vs texto */}
      <div
        style={{
          display: 'inline-flex',
          padding: 4,
          borderRadius: 10,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid var(--border, #9e9e9a)',
          gap: 4,
          marginBottom: 12,
        }}
      >
        <TabButton
          activo={modoEntrada === 'archivo'}
          onClick={() => setModoEntrada('archivo')}
          icono="📎"
          label="Subir archivo"
        />
        <TabButton
          activo={modoEntrada === 'texto'}
          onClick={() => setModoEntrada('texto')}
          icono="✏️"
          label="Pegar texto"
        />
      </div>

      {/* MODO ARCHIVO */}
      {modoEntrada === 'archivo' && (
        <>
          {archivo ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 12,
                background: 'rgba(13,148,136,0.08)',
                border: '1.5px solid rgba(13,148,136,0.35)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {archivo.nombre}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted, #4F46E5)', marginTop: 2 }}>
                  {archivo.sizeKB} KB · Listo para analizar
                </div>
              </div>
              <button
                onClick={quitarArchivo}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border, #9e9e9a)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--fg-primary, #1E1B4B)',
                }}
                type="button"
              >
                Quitar
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={onSoltarArchivo}
              style={{
                padding: '36px 20px',
                borderRadius: 12,
                border: arrastrando
                  ? '2px dashed var(--accent, #6366F1)'
                  : '2px dashed var(--border, #9e9e9a)',
                background: arrastrando ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              <div style={{ fontSize: 38, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                {arrastrando ? 'Suelta aquí tu archivo' : 'Arrastra tu guía o haz clic para elegir'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted, #4F46E5)' }}>
                PDF, DOCX o TXT · máximo 10 MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={onSeleccionarArchivo}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </>
      )}

      {/* MODO TEXTO */}
      {modoEntrada === 'texto' && (
        <textarea
          value={guia.startsWith('[ARCHIVO SUBIDO:') ? '' : guia}
          onChange={(e) => onGuiaChange(e.target.value)}
          placeholder="Pega aquí la guía completa: secciones obligatorias, formato, extensión, citas..."
          rows={11}
          style={{
            ...inputStyle,
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 12,
          fontSize: 13,
          color: 'var(--fg-muted, #4F46E5)',
        }}
      >
        <button onClick={cargarEjemploLocal} style={linkButtonStyle} type="button">
          Cargar ejemplo de María
        </button>
        {(nombre || guia || archivo) && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <button onClick={limpiarTodo} style={linkButtonStyle} type="button">
              Limpiar
            </button>
          </>
        )}
      </div>

      <button
        onClick={onAnalizar}
        disabled={!puedeAnalizar}
        style={{
          ...primaryButtonStyle,
          marginTop: 28,
          opacity: puedeAnalizar ? 1 : 0.45,
          cursor: puedeAnalizar ? 'pointer' : 'not-allowed',
        }}
        type="button"
      >
        Analizar mi guía →
      </button>

      {!puedeAnalizar && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--fg-muted, #4F46E5)',
            marginTop: 10,
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          {mensajeInvalido}
        </p>
      )}
    </section>
  );
}

function TabButton({
  activo,
  onClick,
  icono,
  label,
}: {
  activo: boolean;
  onClick: () => void;
  icono: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        background: activo ? '#fff' : 'transparent',
        border: 'none',
        borderRadius: 7,
        padding: '8px 16px',
        fontSize: 13.5,
        fontWeight: 700,
        cursor: 'pointer',
        color: activo ? 'var(--accent, #6366F1)' : 'var(--fg-muted, #4F46E5)',
        boxShadow: activo ? '0 1px 3px rgba(20,20,20,0.08)' : 'none',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span>{icono}</span>
      {label}
    </button>
  );
}

function AnalizandoGuia({ nombre }: { nombre: string }) {
  const pasos = [
    'Leyendo la guía completa',
    'Identificando secciones y requisitos',
    'Comparando con plantillas conocidas',
    'Eligiendo la base más cercana',
  ];

  return (
    <section
      style={{
        background: 'var(--bg-card, #fafafa)',
        border: '1px solid var(--border, #9e9e9a)',
        borderRadius: 14,
        padding: 48,
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(20,20,20,0.06), 0 6px 18px rgba(20,20,20,0.05)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          margin: '0 auto 24px',
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.18)',
          borderTopColor: 'var(--accent, #6366F1)',
          animation: 'demo-spin 0.9s linear infinite',
        }}
      />
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          marginBottom: 8,
        }}
      >
        Analizando tu guía
      </h2>
      <p
        style={{
          fontSize: 15,
          color: 'var(--fg-muted, #4F46E5)',
          marginBottom: 28,
        }}
      >
        Procesando: <strong>{nombre}</strong>
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 auto',
          maxWidth: 360,
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {pasos.map((p, i) => (
          <li
            key={p}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              opacity: 0,
              animation: `demo-fadein 0.6s ease forwards ${i * 0.55}s`,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--accent, #6366F1)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            {p}
          </li>
        ))}
      </ul>

      <style jsx>{`
        @keyframes demo-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes demo-fadein {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}

function ResultadoMatching({
  nombre,
  onReiniciar,
}: {
  nombre: string;
  onReiniciar: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepHeader paso="Paso 3 de 3" titulo="Esto es lo que la plataforma propone" />

      <section style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={miniLabelStyle}>Tu trabajo</div>
            <h2
              style={{
                fontFamily: 'var(--font-crimson), Georgia, serif',
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                marginTop: 4,
              }}
            >
              {nombre}
            </h2>
          </div>
          <button onClick={onReiniciar} style={linkButtonStyle} type="button">
            ← Empezar otra vez
          </button>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={miniLabelStyle}>Base elegida automáticamente</div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--accent, #6366F1)',
            }}
          >
            {MOCK_RESULTADO.baseElegida}
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(99,102,241,0.1)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--accent, #6366F1)',
            }}
          >
            similitud {Math.round(MOCK_RESULTADO.score * 100)}%
          </span>
        </div>
        <p
          style={{
            marginTop: 14,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'var(--fg-primary, #1E1B4B)',
          }}
        >
          {MOCK_RESULTADO.razonamiento}
        </p>

        <details style={{ marginTop: 14, fontSize: 13 }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 700,
              color: 'var(--fg-muted, #4F46E5)',
              letterSpacing: '0.04em',
            }}
          >
            Ver las otras opciones consideradas
          </summary>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {MOCK_RESULTADO.alternativas.map((alt) => (
              <li
                key={alt.nombre}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  background: alt.elegida ? 'rgba(99,102,241,0.08)' : 'transparent',
                  borderRadius: 6,
                  fontWeight: alt.elegida ? 700 : 400,
                }}
              >
                <span>{alt.nombre}</span>
                <span style={{ color: 'var(--fg-muted, #4F46E5)' }}>
                  {Math.round(alt.score * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section style={panelStyle}>
        <div style={miniLabelStyle}>Plan adaptativo · {MOCK_RESULTADO.plan.length} secciones</div>
        <p style={{ fontSize: 13, color: 'var(--fg-muted, #4F46E5)', marginTop: 6, marginBottom: 18 }}>
          Cada sección viene de la base, o la genera la IA según contexto, o reutiliza componentes que ya
          funcionan en otros productos.
        </p>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_RESULTADO.plan.map((item, i) => (
            <PlanRow key={item.titulo} item={item} index={i + 1} />
          ))}
        </ol>
      </section>

      <section
        style={{
          ...panelStyle,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
          borderColor: 'rgba(99,102,241,0.25)',
        }}
      >
        <div style={miniLabelStyle}>Lo que pasa después (en el producto real)</div>
        <ul style={{ paddingLeft: 18, marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
          <li>Generamos cada sección en orden, respetando el hilo conductor.</li>
          <li>El guardián anti-alucinación valida cada entrega antes de pasar a la siguiente.</li>
          <li>Compilamos LaTeX y entregamos PDF + ZIP de Overleaf, igual que en Scribe.</li>
        </ul>
        <button
          onClick={onReiniciar}
          style={{ ...primaryButtonStyle, marginTop: 22 }}
          type="button"
        >
          Probar con otra guía
        </button>
      </section>
    </div>
  );
}

function PlanRow({ item, index }: { item: PlanItem; index: number }) {
  const meta = origenMeta(item.origen);

  return (
    <li
      style={{
        display: 'flex',
        gap: 14,
        padding: 14,
        borderRadius: 10,
        background: '#fff',
        border: '1px solid var(--border, #9e9e9a)',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--bg-base, #f2f2f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {index}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{item.titulo}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 999,
              background: meta.bg,
              color: meta.color,
            }}
          >
            {meta.label}
          </span>
          {item.paginas && (
            <span style={{ fontSize: 12, color: 'var(--fg-muted, #4F46E5)' }}>{item.paginas}</span>
          )}
        </div>
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            margin: '6px 0 0',
            color: 'var(--fg-primary, #1E1B4B)',
            opacity: 0.85,
          }}
        >
          {item.detalle}
        </p>
      </div>
    </li>
  );
}

function origenMeta(origen: PlanItem['origen']) {
  if (origen === 'base') {
    return {
      label: 'De la base',
      bg: 'rgba(13,148,136,0.12)',
      color: '#0d9488',
    };
  }
  if (origen === 'adaptativo') {
    return {
      label: 'IA improvisa',
      bg: 'rgba(124,58,237,0.12)',
      color: '#7c3aed',
    };
  }
  return {
    label: 'Reutiliza',
    bg: 'rgba(37,99,235,0.12)',
    color: '#2563eb',
  };
}

function StepHeader({ paso, titulo }: { paso: string; titulo: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--accent, #6366F1)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {paso}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {titulo}
      </h2>
    </div>
  );
}

function FooterDemo() {
  return (
    <p
      style={{
        marginTop: 36,
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--fg-muted, #4F46E5)',
        opacity: 0.7,
      }}
    >
      Esto es un demo navegable. El matching y el plan están precargados para que veas el flujo.
      <br />
      Ruta: <code style={{ fontSize: 11 }}>/adaptativo/demo</code>
    </p>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--fg-primary, #1E1B4B)',
  marginBottom: 4,
};

const hintStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--fg-muted, #4F46E5)',
  marginTop: 0,
  marginBottom: 10,
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  borderRadius: 10,
  border: '1px solid var(--border, #9e9e9a)',
  background: 'rgba(255,255,255,0.84)',
  color: 'var(--fg-primary, #1E1B4B)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const primaryButtonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  fontSize: 15,
  fontWeight: 700,
  borderRadius: 10,
  border: 'none',
  background: 'var(--fg-primary, #1E1B4B)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

const linkButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--accent, #6366F1)',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  fontFamily: 'inherit',
};

const panelStyle: CSSProperties = {
  background: 'var(--bg-card, #fafafa)',
  border: '1px solid var(--border, #9e9e9a)',
  borderRadius: 14,
  padding: 24,
  boxShadow: '0 1px 3px rgba(20,20,20,0.06), 0 6px 18px rgba(20,20,20,0.05)',
};

const miniLabelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--accent, #6366F1)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

