"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * /admin/test-prompt-unifranz
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Banco de pruebas del motor UNIFRANZ Proyecto de Grado.
 *
 * Permite al dueño del SaaS lanzar cualquiera de las 7 fases con un
 * contexto inventado (tema, ciudad, sector, carrera) y ver el output real
 * de la cascada IA. Sirve para validar que los megaprompts producen
 * documentos UNIFRANZ-conformes antes de enchufarlos al flujo del estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";

type Fase =
  | "resumen-trabajo"
  | "introduccion"
  | "marco-teorico"
  | "investigacion"
  | "plan-estrategico"
  | "conclusiones-recomendaciones"
  | "bibliografia";

interface ResultadoTest {
  ok: boolean;
  fase: Fase;
  modalidad: string;
  prompt_enviado: {
    system_caracteres: number;
    user_caracteres: number;
    max_tokens: number;
  };
  output: {
    texto: string;
    caracteres: number;
    palabras_aprox: number;
  };
  proveedor_ia: {
    provider: string;
    model: string;
  };
  tiempo_ms: number;
  error?: string;
}

const FASES: { id: Fase; nombre: string; descripcion: string }[] = [
  {
    id: "resumen-trabajo",
    nombre: "Resumen del Trabajo",
    descripcion: "250 palabras con VAN/TIR/B-C obligatorios",
  },
  {
    id: "introduccion",
    nombre: "Introducción",
    descripcion: "5 secciones: planteamiento, 5 justificaciones, objetivos, alcances, hipótesis",
  },
  {
    id: "marco-teorico",
    nombre: "CAPÍTULO I — Marco Teórico",
    descripcion: "Mínimo 15 fuentes, balance 30/30/40",
  },
  {
    id: "investigacion",
    nombre: "CAPÍTULO II — Investigación",
    descripcion: "PESTEL → PORTER → MEFE → MEFI → FODA → Mercado",
  },
  {
    id: "plan-estrategico",
    nombre: "CAPÍTULO III — Plan Estratégico",
    descripcion: "Org + Marketing separado + Producción + Financiero + Legal",
  },
  {
    id: "conclusiones-recomendaciones",
    nombre: "Conclusiones y Recomendaciones",
    descripcion: "Una conclusión por objetivo + cierre numérico de viabilidad",
  },
  {
    id: "bibliografia",
    nombre: "Bibliografía APA UNIFRANZ",
    descripcion: "Apellidos en minúscula, orden alfabético",
  },
];

export default function TestPromptUnifranzPage() {
  const [fase, setFase] = useState<Fase>("introduccion");
  const [tema, setTema] = useState(
    "Plan de Negocios para la creación de una Cafetería de Especialidad en la zona norte de Cochabamba"
  );
  const [carrera, setCarrera] = useState("Administración de Empresas");
  const [facultad, setFacultad] = useState(
    "Facultad de Ciencias Económicas y Empresariales"
  );
  const [ciudad, setCiudad] = useState("Cochabamba, Bolivia");
  const [sector, setSector] = useState("Gastronómico — cafetería especialidad");
  const [horizonte, setHorizonte] = useState(5);
  const [notas, setNotas] = useState("");

  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lanzar = async () => {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/admin/test-prompt-unifranz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fase,
          contexto: {
            tema,
            carrera,
            facultad,
            ciudad,
            sector,
            horizonte_anios: horizonte,
            notas_adicionales: notas || undefined,
            modalidad: "pre-factibilidad",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Error desconocido");
      } else {
        setResultado(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        🧪 Banco de pruebas — Motor UNIFRANZ
      </h1>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>
        Prueba cada fase del Proyecto de Grado UNIFRANZ Pre-Factibilidad sin
        tocar el flujo del estudiante. Llena el contexto, elige la fase y
        revisa el output antes de enchufar el motor a producción.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: 24,
        }}
      >
        {/* PANEL IZQUIERDO — Configuración */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            1. Elige la fase a probar
          </h2>

          <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
            {FASES.map((f) => (
              <label
                key={f.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: 10,
                  borderRadius: 8,
                  border:
                    fase === f.id
                      ? "1px solid #6366f1"
                      : "1px solid #e5e7eb",
                  background: fase === f.id ? "#eef2ff" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="fase"
                  value={f.id}
                  checked={fase === f.id}
                  onChange={() => setFase(f.id)}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{f.nombre}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {f.descripcion}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            2. Contexto del proyecto
          </h2>

          <div style={{ display: "grid", gap: 12 }}>
            <Campo label="Tema del trabajo">
              <textarea
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                rows={2}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Carrera">
              <input
                value={carrera}
                onChange={(e) => setCarrera(e.target.value)}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Facultad">
              <input
                value={facultad}
                onChange={(e) => setFacultad(e.target.value)}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Ciudad / Región">
              <input
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Sector / Industria">
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Horizonte (años)">
              <input
                type="number"
                value={horizonte}
                onChange={(e) => setHorizonte(Number(e.target.value))}
                min={1}
                max={10}
                style={inputStyle}
              />
            </Campo>

            <Campo label="Notas adicionales (opcional)">
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Datos extra: tamaño de mercado, monto de inversión estimado, etc."
                style={inputStyle}
              />
            </Campo>
          </div>

          <button
            onClick={lanzar}
            disabled={cargando}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px 16px",
              background: cargando
                ? "#9ca3af"
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando
              ? "⏳ La IA está generando... (30-90s)"
              : "🚀 Generar y probar"}
          </button>
        </div>

        {/* PANEL DERECHO — Resultado */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            minHeight: 600,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            3. Output de la IA
          </h2>

          {!resultado && !error && !cargando && (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              Llena el formulario de la izquierda y dale al botón.
              <br />
              El resultado aparecerá aquí.
            </div>
          )}

          {cargando && (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              Generando... esto puede tomar entre 30 y 90 segundos según la fase.
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 16,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: "#991b1b",
                fontSize: 14,
              }}
            >
              ⚠️ Error: {error}
            </div>
          )}

          {resultado && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  marginBottom: 16,
                  fontSize: 12,
                }}
              >
                <Stat label="Proveedor" valor={resultado.proveedor_ia.provider} />
                <Stat label="Modelo" valor={resultado.proveedor_ia.model} />
                <Stat
                  label="Tiempo"
                  valor={`${(resultado.tiempo_ms / 1000).toFixed(1)}s`}
                />
                <Stat
                  label="Palabras"
                  valor={resultado.output.palabras_aprox.toLocaleString()}
                />
                <Stat
                  label="Caracteres"
                  valor={resultado.output.caracteres.toLocaleString()}
                />
                <Stat
                  label="Prompt size"
                  valor={`${(resultado.prompt_enviado.system_caracteres / 1000).toFixed(1)}K`}
                />
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  maxHeight: 700,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  lineHeight: 1.65,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              >
                {resultado.output.texto}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(resultado.output.texto);
                  alert("Copiado al portapapeles");
                }}
                style={{
                  marginTop: 12,
                  padding: "8px 16px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📋 Copiar output al portapapeles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
};

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "#374151",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: "6px 10px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#6b7280",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
        {valor}
      </div>
    </div>
  );
}
