'use client';

import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';

type Step = 'wizard' | 'analyzing' | 'result' | 'creating' | 'created' | 'error';

type EntradaGuia =
  | { tipo: 'archivo'; file: File; nombre: string; sizeKB: number }
  | { tipo: 'texto'; texto: string };

interface RespuestaAnalisis {
  ok: true;
  guia_analizada: GuiaAnalizada;
  matching: ResultadoMatching;
  plan: PlanAdaptativo;
  metadata: {
    fuente: 'archivo' | 'texto';
    nombre_archivo?: string;
    palabras_originales: number;
    truncado: boolean;
    proveedor_ia: string;
    modelo_ia: string;
    duracion_ms: number;
  };
}

interface GuiaAnalizada {
  secciones: { titulo: string; descripcion: string; requisitos: string[]; orden: number }[];
  pide_imagenes: boolean;
  pide_tablas: boolean;
  pide_encuesta: boolean;
  pide_bibliografia: boolean;
  pide_hipotesis: boolean;
  pide_marco_teorico: boolean;
  pide_analisis_cuantitativo: boolean;
  pide_conclusiones: boolean;
  paginas_estimadas: { min: number; max: number };
  formato_citas: string;
  tono: string;
  resumen: string;
  advertencias: string[];
}

interface ResultadoMatching {
  plantilla_elegida: string;
  score: number;
  razonamiento: string;
  ranking: { plantilla: string; nombre: string; score: number }[];
}

interface FaseAdaptativa {
  phase_id: string;
  titulo: string;
  origen: 'base' | 'adaptativo' | 'componente';
  descripcion: string;
  requisitos: string[];
  paginas_estimadas?: string;
  orden: number;
}

interface PlanAdaptativo {
  nombre_trabajo: string;
  guia_analizada: GuiaAnalizada;
  matching: ResultadoMatching;
  fases: FaseAdaptativa[];
  creado_en: string;
}

export default function AdaptativoPage() {
  const [step, setStep] = useState<Step>('wizard');
  const [nombre, setNombre] = useState('');
  const [entrada, setEntrada] = useState<EntradaGuia | null>(null);
  const [analisis, setAnalisis] = useState<RespuestaAnalisis | null>(null);
  const [proyectoCreado, setProyectoCreado] = useState<{ id: string; total_fases: number; plantilla_base: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analizar = async () => {
    if (!entrada) return;
    setStep('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('nombre_trabajo', nombre);
      if (entrada.tipo === 'archivo') {
        formData.append('archivo', entrada.file);
      } else {
        formData.append('texto', entrada.texto);
      }

      const res = await fetch('/api/adaptativo/analyze-guide', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Error desconocido' }));
        if (res.status === 401) {
          setError('Necesitas iniciar sesión para usar este servicio. Ve a /login y entra con tu cuenta o como demo.');
        } else {
          setError(errBody.error ?? `Error ${res.status}`);
        }
        setStep('error');
        return;
      }

      const data = (await res.json()) as RespuestaAnalisis;
      setAnalisis(data);
      setStep('result');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      setError(`No se pudo conectar con el servidor: ${msg}`);
      setStep('error');
    }
  };

  const crearProyecto = async () => {
    if (!analisis) return;
    setStep('creating');
    setError(null);

    try {
      const res = await fetch('/api/adaptativo/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: analisis.plan }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(errBody.error ?? `Error ${res.status}`);
        setStep('error');
        return;
      }

      const data = await res.json();
      setProyectoCreado({
        id: data.proyecto_id,
        total_fases: data.total_fases,
        plantilla_base: data.plantilla_base,
      });
      setStep('created');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      setError(`No se pudo crear el proyecto: ${msg}`);
      setStep('error');
    }
  };

  const reiniciar = () => {
    setStep('wizard');
    setNombre('');
    setEntrada(null);
    setAnalisis(null);
    setProyectoCreado(null);
    setError(null);
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
        <Header />

        {step === 'wizard' && (
          <WizardLibre
            nombre={nombre}
            entrada={entrada}
            onNombreChange={setNombre}
            onEntradaChange={setEntrada}
            onAnalizar={analizar}
          />
        )}

        {step === 'analyzing' && <Analizando nombre={nombre} />}

        {step === 'result' && analisis && (
          <ResultadoMatching analisis={analisis} onCrear={crearProyecto} onReiniciar={reiniciar} />
        )}

        {step === 'creating' && <CreandoProyecto />}

        {step === 'created' && proyectoCreado && (
          <ProyectoCreado info={proyectoCreado} onReiniciar={reiniciar} />
        )}

        {step === 'error' && <PanelError mensaje={error ?? 'Error desconocido'} onReintentar={reiniciar} />}

        <Footer />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────

function Header() {
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
        Documento Adaptativo
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
        Escribe qué trabajo necesitas y sube la guía que te dieron. La plataforma combina UMSS,
        UCB, UNIFRANZ y Plan de Negocio según lo que pida tu guía.
      </p>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Wizard libre
// ─────────────────────────────────────────────────────────────────────

function WizardLibre({
  nombre,
  entrada,
  onNombreChange,
  onEntradaChange,
  onAnalizar,
}: {
  nombre: string;
  entrada: EntradaGuia | null;
  onNombreChange: (v: string) => void;
  onEntradaChange: (e: EntradaGuia | null) => void;
  onAnalizar: () => void;
}) {
  const [modo, setModo] = useState<'archivo' | 'texto'>('archivo');
  const [arrastrando, setArrastrando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const procesarArchivo = (file: File) => {
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    onEntradaChange({ tipo: 'archivo', file, nombre: file.name, sizeKB });
  };

  const onSeleccionar = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) procesarArchivo(f);
  };

  const onSoltar = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) procesarArchivo(f);
  };

  const quitar = () => {
    onEntradaChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setTexto = (texto: string) => {
    if (texto.trim().length === 0) {
      onEntradaChange(null);
    } else {
      onEntradaChange({ tipo: 'texto', texto });
    }
  };

  const cambiarModo = (nuevo: 'archivo' | 'texto') => {
    setModo(nuevo);
    onEntradaChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const archivoActual = entrada?.tipo === 'archivo' ? entrada : null;
  const textoActual = entrada?.tipo === 'texto' ? entrada.texto : '';

  const puedeAnalizar =
    nombre.trim().length > 3 &&
    ((modo === 'archivo' && archivoActual !== null) ||
      (modo === 'texto' && textoActual.trim().length > 80));

  return (
    <section style={panelStyle}>
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
        Sube el archivo (PDF, DOCX o TXT) o pega el texto. Mientras más detalle, mejor elige la
        plataforma su base.
      </p>

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
        <TabButton activo={modo === 'archivo'} onClick={() => cambiarModo('archivo')} icono="📎" label="Subir archivo" />
        <TabButton activo={modo === 'texto'} onClick={() => cambiarModo('texto')} icono="✏️" label="Pegar texto" />
      </div>

      {modo === 'archivo' &&
        (archivoActual ? (
          <ArchivoCargado archivo={archivoActual} onQuitar={quitar} />
        ) : (
          <DropZone
            arrastrando={arrastrando}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={onSoltar}
            inputRef={fileInputRef}
            onChange={onSeleccionar}
          />
        ))}

      {modo === 'texto' && (
        <textarea
          value={textoActual}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí la guía completa: secciones obligatorias, formato, extensión, citas..."
          rows={11}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}
        />
      )}

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
          {modo === 'archivo'
            ? 'Necesitamos un nombre y un archivo con la guía.'
            : 'Necesitamos un nombre y al menos un par de párrafos.'}
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

function ArchivoCargado({
  archivo,
  onQuitar,
}: {
  archivo: { nombre: string; sizeKB: number };
  onQuitar: () => void;
}) {
  return (
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
        onClick={onQuitar}
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
  );
}

function DropZone({
  arrastrando,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  inputRef,
  onChange,
}: {
  arrastrando: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        padding: '36px 20px',
        borderRadius: 12,
        border: arrastrando ? '2px dashed var(--accent, #6366F1)' : '2px dashed var(--border, #9e9e9a)',
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
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Analizando / Creando
// ─────────────────────────────────────────────────────────────────────

function Analizando({ nombre }: { nombre: string }) {
  const pasos = [
    'Leyendo la guía completa',
    'Identificando secciones y requisitos',
    'Comparando con plantillas conocidas',
    'Eligiendo la base más cercana',
  ];

  return (
    <section
      style={{
        ...panelStyle,
        textAlign: 'center',
        padding: 48,
      }}
    >
      <Spinner />
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          marginBottom: 8,
          marginTop: 24,
        }}
      >
        Analizando tu guía
      </h2>
      <p style={{ fontSize: 15, color: 'var(--fg-muted, #4F46E5)', marginBottom: 28 }}>
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
              animation: `adapt-fadein 0.6s ease forwards ${i * 0.6}s`,
            }}
          >
            <span style={dotStyle}>✓</span>
            {p}
          </li>
        ))}
      </ul>
      <style jsx>{`
        @keyframes adapt-fadein {
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

function CreandoProyecto() {
  return (
    <section style={{ ...panelStyle, textAlign: 'center', padding: 48 }}>
      <Spinner />
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          marginTop: 24,
        }}
      >
        Creando tu proyecto…
      </h2>
    </section>
  );
}

function Spinner() {
  return (
    <>
      <div
        style={{
          width: 72,
          height: 72,
          margin: '0 auto',
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.18)',
          borderTopColor: 'var(--accent, #6366F1)',
          animation: 'adapt-spin 0.9s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes adapt-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Resultado del matching
// ─────────────────────────────────────────────────────────────────────

function ResultadoMatching({
  analisis,
  onCrear,
  onReiniciar,
}: {
  analisis: RespuestaAnalisis;
  onCrear: () => void;
  onReiniciar: () => void;
}) {
  const { plan, matching, metadata } = analisis;
  const plantillaNombre = matching.ranking.find((r) => r.plantilla === matching.plantilla_elegida)?.nombre ?? matching.plantilla_elegida;

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
              {plan.nombre_trabajo}
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
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent, #6366F1)' }}>
            {plantillaNombre}
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
            similitud {Math.round(matching.score * 100)}%
          </span>
        </div>
        <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.6, color: 'var(--fg-primary, #1E1B4B)' }}>
          {matching.razonamiento || 'La plantilla se eligió por coincidencia de estructura y extensión.'}
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
            {matching.ranking.map((alt) => {
              const elegida = alt.plantilla === matching.plantilla_elegida;
              return (
                <li
                  key={alt.plantilla}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    background: elegida ? 'rgba(99,102,241,0.08)' : 'transparent',
                    borderRadius: 6,
                    fontWeight: elegida ? 700 : 400,
                  }}
                >
                  <span>{alt.nombre}</span>
                  <span style={{ color: 'var(--fg-muted, #4F46E5)' }}>
                    {Math.round(alt.score * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </details>

        {plan.guia_analizada.advertencias.length > 0 && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              fontSize: 13,
            }}
          >
            <strong>Atención:</strong>{' '}
            {plan.guia_analizada.advertencias.join('. ')}
          </div>
        )}
      </section>

      <section style={panelStyle}>
        <div style={miniLabelStyle}>Plan adaptativo · {plan.fases.length} secciones</div>
        <p style={{ fontSize: 13, color: 'var(--fg-muted, #4F46E5)', marginTop: 6, marginBottom: 18 }}>
          Cada sección viene de la base, o la genera la IA según contexto, o reutiliza componentes que
          ya funcionan en otros productos.
        </p>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plan.fases.map((fase) => (
            <PlanRow key={fase.phase_id} fase={fase} />
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
        <div style={miniLabelStyle}>Crear el proyecto</div>
        <p style={{ fontSize: 14, marginTop: 8, marginBottom: 18 }}>
          Al confirmar, guardamos tu proyecto con este plan. Después podrás generar cada sección
          una por una, revisarlas, y exportar a PDF + LaTeX.
        </p>
        <button onClick={onCrear} style={primaryButtonStyle} type="button">
          ✓ Crear este proyecto
        </button>
        <p
          style={{
            fontSize: 11,
            color: 'var(--fg-muted, #4F46E5)',
            marginTop: 12,
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          IA usada: {metadata.proveedor_ia} · {metadata.modelo_ia} · {Math.round(metadata.duracion_ms / 100) / 10}s
        </p>
      </section>
    </div>
  );
}

function PlanRow({ fase }: { fase: FaseAdaptativa }) {
  const meta = origenMeta(fase.origen);
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
        {fase.orden}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{fase.titulo}</span>
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
          {fase.paginas_estimadas && (
            <span style={{ fontSize: 12, color: 'var(--fg-muted, #4F46E5)' }}>
              {fase.paginas_estimadas}
            </span>
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
          {fase.descripcion}
        </p>
      </div>
    </li>
  );
}

function origenMeta(origen: FaseAdaptativa['origen']) {
  if (origen === 'base') return { label: 'De la base', bg: 'rgba(13,148,136,0.12)', color: '#0d9488' };
  if (origen === 'adaptativo') return { label: 'IA improvisa', bg: 'rgba(124,58,237,0.12)', color: '#7c3aed' };
  return { label: 'Reutiliza', bg: 'rgba(37,99,235,0.12)', color: '#2563eb' };
}

// ─────────────────────────────────────────────────────────────────────
// Proyecto creado
// ─────────────────────────────────────────────────────────────────────

function ProyectoCreado({
  info,
  onReiniciar,
}: {
  info: { id: string; total_fases: number; plantilla_base: string };
  onReiniciar: () => void;
}) {
  return (
    <section style={{ ...panelStyle, textAlign: 'center', padding: 40 }}>
      <div
        style={{
          width: 80,
          height: 80,
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'rgba(13,148,136,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
        }}
      >
        ✓
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
          marginBottom: 12,
        }}
      >
        Proyecto creado
      </h2>
      <p style={{ fontSize: 15, color: 'var(--fg-muted, #4F46E5)', marginBottom: 6 }}>
        Base usada: <strong>{info.plantilla_base}</strong>
      </p>
      <p style={{ fontSize: 15, color: 'var(--fg-muted, #4F46E5)', marginBottom: 6 }}>
        Total de fases: <strong>{info.total_fases}</strong>
      </p>
      <p style={{ fontSize: 12, color: 'var(--fg-muted, #4F46E5)', opacity: 0.7, marginBottom: 24 }}>
        ID: <code>{info.id}</code>
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`/projects/${info.id}/workspace`}
          style={{
            ...primaryButtonStyle,
            display: 'inline-block',
            width: 'auto',
            textDecoration: 'none',
            padding: '14px 24px',
          }}
        >
          Ir al workspace →
        </a>
        <button onClick={onReiniciar} style={secondaryButtonStyle} type="button">
          Crear otro
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--fg-muted, #4F46E5)', marginTop: 20, opacity: 0.7 }}>
        Nota: la integración del workspace con fases adaptativas está en construcción. Por ahora
        puedes ver tu proyecto en la lista pero la generación fase-a-fase será gradual.
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Error
// ─────────────────────────────────────────────────────────────────────

function PanelError({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  const esAuth = mensaje.toLowerCase().includes('sesión') || mensaje.toLowerCase().includes('sesion');
  return (
    <section style={{ ...panelStyle, textAlign: 'center', padding: 40 }}>
      <div
        style={{
          width: 80,
          height: 80,
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
        }}
      >
        ⚠
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-crimson), Georgia, serif',
          fontSize: 24,
          fontWeight: 700,
          margin: 0,
          marginBottom: 12,
        }}
      >
        Algo salió mal
      </h2>
      <p style={{ fontSize: 14.5, color: 'var(--fg-primary, #1E1B4B)', maxWidth: 480, margin: '0 auto 24px' }}>
        {mensaje}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {esAuth && (
          <a
            href="/login"
            style={{
              ...primaryButtonStyle,
              display: 'inline-block',
              width: 'auto',
              textDecoration: 'none',
              padding: '12px 22px',
            }}
          >
            Ir a iniciar sesión
          </a>
        )}
        <button onClick={onReintentar} style={secondaryButtonStyle} type="button">
          Volver a empezar
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Footer + Helpers
// ─────────────────────────────────────────────────────────────────────

function Footer() {
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
      ¿Solo quieres ver cómo se siente sin subir nada? Visita{' '}
      <a href="/adaptativo/demo" style={{ color: 'var(--accent, #6366F1)', fontWeight: 700 }}>
        /adaptativo/demo
      </a>{' '}
      (precargado).
    </p>
  );
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

// ─────────────────────────────────────────────────────────────────────
// Estilos compartidos
// ─────────────────────────────────────────────────────────────────────

const panelStyle: CSSProperties = {
  background: 'var(--bg-card, #fafafa)',
  border: '1px solid var(--border, #9e9e9a)',
  borderRadius: 14,
  padding: 24,
  boxShadow: '0 1px 3px rgba(20,20,20,0.06), 0 6px 18px rgba(20,20,20,0.05)',
};

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

const secondaryButtonStyle: CSSProperties = {
  padding: '12px 22px',
  fontSize: 14,
  fontWeight: 700,
  borderRadius: 10,
  border: '1px solid var(--border, #9e9e9a)',
  background: 'transparent',
  color: 'var(--fg-primary, #1E1B4B)',
  cursor: 'pointer',
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

const miniLabelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--accent, #6366F1)',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const dotStyle: CSSProperties = {
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
};
