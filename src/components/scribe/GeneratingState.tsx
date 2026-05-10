"use client";

/**
 * GeneratingState
 *
 * Pantalla de carga animada que se muestra mientras la IA está generando una
 * fase. En lugar del placeholder estático, ofrece:
 *  - Partículas orbitando que dan sensación de "máquina trabajando"
 *  - Mensajes rotativos contextuales según la fase actual
 *  - Indicador de progreso visual (no exacto — la IA no expone progreso real)
 *  - Tiempo transcurrido para que el usuario sepa que algo está pasando
 *
 * No usa Canvas pesado ni libs de física — solo SVG + transforms + CSS keyframes.
 * Esto la hace ligera y compatible con el resto del workspace.
 */

import { useEffect, useState, useMemo } from "react";

interface Props {
  phaseId?: string;
  phaseLabel?: string;
}

/** Mensajes rotativos por fase — cambian cada 4 segundos. */
const MENSAJES_POR_FASE: Record<string, string[]> = {
  "ph-cap0": [
    "Analizando tu programa académico…",
    "Buscando fuentes públicas verificables…",
    "Evaluando viabilidad de cada propuesta…",
    "Cruzando datos con INE, IBCE y BCB…",
    "Refinando opciones de tema para tu diplomado…",
    "Casi listo — preparando las propuestas…",
  ],
  "ph-cap1": [
    "Estructurando el planteamiento del problema…",
    "Construyendo el árbol de causas y efectos…",
    "Formulando objetivos específicos viables…",
    "Buscando antecedentes empíricos relevantes…",
    "Redactando la justificación académica…",
    "Operacionalizando variables e hipótesis…",
  ],
  "ph-cap2": [
    "Construyendo el marco teórico y conceptual…",
    "Buscando autores reales de SciELO y Redalyc…",
    "Comparando estudios empíricos relacionados…",
    "Conectando teoría con tu objeto de estudio…",
    "Sintetizando antecedentes contextuales…",
    "Verificando coherencia con tu Capítulo I…",
  ],
  "ph-cap3": [
    "Definiendo enfoque metodológico…",
    "Eligiendo tipo y diseño de investigación…",
    "Mapeando técnicas e instrumentos…",
    "Identificando fuentes de información viables…",
    "Estructurando población y unidad de análisis…",
    "Preparando indicadores para el Capítulo IV…",
  ],
  "ph-cap4": [
    "Aplicando los indicadores definidos…",
    "Cruzando datos de fuentes oficiales bolivianas…",
    "Calculando ratios y variaciones del período…",
    "Interpretando hallazgos por objetivo específico…",
    "Construyendo la propuesta de solución…",
    "Contrastando hipótesis con evidencia…",
  ],
  "ph-cap5": [
    "Sintetizando hallazgos del Capítulo IV…",
    "Redactando conclusión por cada objetivo…",
    "Formulando recomendaciones concretas y viables…",
    "Cerrando hipótesis y supuestos…",
    "Integrando aporte de la investigación…",
  ],
  "ph-resumen": [
    "Sintetizando los 5 capítulos en 250-400 palabras…",
    "Extrayendo el problema, objetivo y metodología…",
    "Destacando hallazgos clave y recomendación principal…",
    "Eligiendo palabras clave representativas…",
  ],
  "ph-referencias": [
    "Recolectando referencias de cada capítulo…",
    "Detectando duplicados y normalizando…",
    "Aplicando formato APA 7…",
    "Ordenando alfabéticamente…",
    "Verificando completitud de cada referencia…",
  ],
  "ph-latex": [
    "Verificando que el documento esté completo…",
    "Convirtiendo Markdown a LaTeX…",
    "Generando carátula formal y preámbulo…",
    "Construyendo índice general y de tablas…",
    "Compilando referencias con sangría francesa…",
    "Empaquetando el archivo .tex final…",
  ],
  "ph-calidad": [
    "Revisando estructura y coherencia general…",
    "Buscando marcadores y placeholders pendientes…",
    "Verificando citas vs. referencias…",
    "Validando tablas, figuras y ecuaciones…",
    "Calificando cada error por gravedad…",
    "Preparando informe de control final…",
  ],
};

const MENSAJES_DEFAULT = [
  "Analizando tu contexto académico…",
  "Buscando información en fuentes verificables…",
  "Procesando con cuidado para evitar invenciones…",
  "Estructurando el contenido…",
  "Casi listo — puliendo el resultado…",
];

const TIPS_RANDOM = [
  "💡 La IA solo usa fuentes públicas reales (INE, BCB, IBCE, etc.)",
  "💡 Cada capítulo se construye sobre el anterior",
  "💡 Si algo no te convence, podés regenerar después",
  "💡 Los datos secundarios públicos son la base de cada análisis",
  "💡 La calidad académica está priorizada sobre la velocidad",
  "💡 Tu monografía sigue formato APA 7 y normas UMSS",
];

export default function GeneratingState({ phaseId, phaseLabel }: Props) {
  const [messageIdx, setMessageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const messages = useMemo(
    () => (phaseId && MENSAJES_POR_FASE[phaseId]) ?? MENSAJES_DEFAULT,
    [phaseId]
  );

  // Rotar mensajes cada 4s
  useEffect(() => {
    const t = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [messages.length]);

  // Rotar tips cada 7s
  useEffect(() => {
    const t = setInterval(() => {
      setTipIdx(prev => (prev + 1) % TIPS_RANDOM.length);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  // Contador de tiempo
  useEffect(() => {
    const t = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const minutos = Math.floor(elapsed / 60);
  const segundos = elapsed % 60;
  const tiempoStr = minutos > 0
    ? `${minutos}m ${String(segundos).padStart(2, "0")}s`
    : `${segundos}s`;

  return (
    <div style={{
      position: "relative",
      minHeight: 480,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      overflow: "hidden",
    }}>
      {/* ── Partículas orbitando ──────────────────────────────────────── */}
      <ParticleOrbit />

      {/* ── Núcleo central pulsante ───────────────────────────────────── */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(167,139,250,0.95), rgba(99,102,241,0.85) 60%, rgba(79,70,229,0.7) 100%)",
        boxShadow: "0 0 60px rgba(99,102,241,0.45), 0 0 120px rgba(167,139,250,0.25)",
        animation: "lab-core-pulse 2.6s cubic-bezier(0.4,0,0.6,1) infinite",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
      }}>
        <span style={{ animation: "lab-core-spin 6s linear infinite" }}>✨</span>
      </div>

      {/* ── Phase label ───────────────────────────────────────────────── */}
      {phaseLabel && (
        <div style={{
          position: "relative", zIndex: 2,
          fontSize: 11, color: "var(--accent)", fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: 8,
        }}>
          Generando · {phaseLabel}
        </div>
      )}

      {/* ── Mensaje rotativo ──────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        minHeight: 32,
        marginBottom: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        maxWidth: 540,
      }}>
        <p
          key={messageIdx}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--fg-primary)",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.4,
            animation: "lab-msg-fade 4s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          {messages[messageIdx]}
        </p>
      </div>

      {/* ── Barra de progreso simulada ───────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        width: 220, height: 3,
        background: "rgba(148,163,184,0.18)",
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 14,
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%",
          width: "40%",
          background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.85), rgba(99,102,241,0.85), transparent)",
          borderRadius: 999,
          animation: "lab-progress-slide 1.8s cubic-bezier(0.4,0,0.2,1) infinite",
        }} />
      </div>

      {/* ── Tiempo transcurrido ───────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        fontSize: 12, color: "var(--fg-muted)",
        marginBottom: 32,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          display: "inline-block",
          width: 6, height: 6, borderRadius: "50%",
          background: "#22c55e",
          animation: "lab-blink 1.4s ease-in-out infinite",
        }} />
        Tiempo transcurrido: {tiempoStr}
        {elapsed > 90 && <span style={{ color: "#f59e0b", marginLeft: 8 }}>· con paciencia, casi siempre vale la pena</span>}
      </div>

      {/* ── Tip rotativo ──────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "10px 18px",
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.18)",
        borderRadius: 999,
        fontSize: 12.5,
        color: "var(--fg-secondary)",
        maxWidth: 480,
        textAlign: "center",
      }}
        key={tipIdx}
      >
        <span style={{ animation: "lab-msg-fade 7s cubic-bezier(0.22,1,0.36,1) forwards" }}>
          {TIPS_RANDOM[tipIdx]}
        </span>
      </div>

      <style>{`
        @keyframes lab-core-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(99,102,241,0.45), 0 0 120px rgba(167,139,250,0.25); }
          50% { transform: scale(1.07); box-shadow: 0 0 80px rgba(99,102,241,0.6), 0 0 160px rgba(167,139,250,0.35); }
        }
        @keyframes lab-core-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lab-msg-fade {
          0% { opacity: 0; transform: translateY(6px); }
          12%, 88% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0.6; }
        }
        @keyframes lab-progress-slide {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(550%); }
        }
        @keyframes lab-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

/** Partículas SVG orbitando sobre el núcleo central. */
function ParticleOrbit() {
  // 12 partículas distribuidas en 3 órbitas concéntricas
  const particles = useMemo(() => {
    const arr: Array<{ orbit: number; angle: number; size: number; duration: number; color: string }> = [];
    const colors = ["rgba(99,102,241,0.9)", "rgba(167,139,250,0.9)", "rgba(34,211,238,0.85)", "rgba(244,114,182,0.85)"];
    for (let orbit = 0; orbit < 3; orbit++) {
      const count = orbit === 0 ? 4 : orbit === 1 ? 5 : 6;
      for (let i = 0; i < count; i++) {
        arr.push({
          orbit,
          angle: (i / count) * 360,
          size: 4 - orbit * 0.6,
          duration: 8 + orbit * 4 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
    return arr;
  }, []);

  const radii = [110, 160, 220];

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: 1,
    }}>
      <div style={{ position: "relative", width: 480, height: 480 }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 0,
              height: 0,
              animation: `lab-orbit-${p.orbit} ${p.duration}s linear infinite`,
              animationDelay: `${(p.angle / 360) * -p.duration}s`,
            }}
          >
            <div style={{
              position: "absolute",
              left: radii[p.orbit] - p.size / 2,
              top: -p.size / 2,
              width: p.size * 2,
              height: p.size * 2,
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }} />
          </div>
        ))}
        <style>{`
          @keyframes lab-orbit-0 { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
          @keyframes lab-orbit-1 { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
          @keyframes lab-orbit-2 { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
