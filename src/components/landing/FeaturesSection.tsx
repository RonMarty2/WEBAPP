"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Audiencia = "estudiante" | "docente";

const GARANTIAS = [
  { icono: "✓", texto: "Sin alucinación — solo datos verificables" },
  { icono: "✓", texto: "Coherencia total entre capítulos" },
  { icono: "✓", texto: "Formato institucional exacto" },
  { icono: "✓", texto: "Bibliografía APA 7 automática" },
  { icono: "✓", texto: "Chat de modificaciones por etapa" },
  { icono: "✓", texto: "Generación completa en 30 minutos" },
];

const ESTUDIANTES_PRODUCTOS = [
  { nombre: "Monografías", desc: "5 capítulos completos, bibliografía APA 7 y exportación LaTeX lista para presentar.", etiqueta: "Disponible" },
  { nombre: "Tesis de grado", desc: "Estructura y redacción asistida para tesis de licenciatura con rigor metodológico.", etiqueta: "Próximamente" },
  { nombre: "Ensayos académicos", desc: "Ensayos argumentativos y analíticos con fuentes verificadas y formato institucional.", etiqueta: "Próximamente" },
  { nombre: "Trabajos finales", desc: "Proyectos de grado e informes de práctica con estructura personalizada.", etiqueta: "Próximamente" },
];

const DOCENTES_PRODUCTOS = [
  { nombre: "Planificaciones de clase", desc: "Planes de sesión, unidades didácticas y programaciones curriculares en minutos.", etiqueta: "Próximamente" },
  { nombre: "Rúbricas de evaluación", desc: "Rúbricas analíticas y holísticas alineadas a los objetivos de aprendizaje.", etiqueta: "Próximamente" },
  { nombre: "Material didáctico", desc: "Guías de estudio, resúmenes y fichas de trabajo para tus estudiantes.", etiqueta: "Próximamente" },
  { nombre: "Guías de investigación", desc: "Protocolos de investigación, marcos teóricos y diseños metodológicos.", etiqueta: "Próximamente" },
];

const PLANES = {
  estudiante: [
    {
      id: "estandar", nombre: "Estándar", precio: "Bs. 150", nota: "pago único", popular: true,
      items: ["1 monografía o trabajo académico", "IA avanzada (mejor calidad)", "Chat de modificaciones ilimitado", "Descarga PDF + LaTeX profesional", "Bibliografía APA 7 automática", "Soporte prioritario"],
      cta: "Empezar con Estándar",
    },
    {
      id: "pro", nombre: "Pro", precio: "Bs. 300", nota: "3 documentos / mes", popular: false,
      items: ["Hasta 3 documentos al mes", "Mejor modelo de IA disponible", "Chat ilimitado + regeneración", "PDF + LaTeX + historial de versiones", "Acceso anticipado a nuevos productos", "Soporte prioritario 24/7"],
      cta: "Empezar con Pro",
    },
  ],
  docente: [
    {
      id: "estandar", nombre: "Estándar", precio: "Bs. 150", nota: "pago único", popular: true,
      items: ["1 planificación o rúbrica de evaluación", "IA avanzada (mejor calidad)", "Ajustes ilimitados por chat", "Descarga PDF + LaTeX profesional", "Alineación curricular automática", "Soporte prioritario"],
      cta: "Empezar con Estándar",
    },
    {
      id: "pro", nombre: "Pro", precio: "Bs. 300", nota: "3 documentos / mes", popular: false,
      items: ["Hasta 3 planificaciones o rúbricas al mes", "Mejor modelo de IA disponible", "Generación de material completo", "PDF + LaTeX + historial de versiones", "Acceso anticipado a módulos docentes", "Soporte prioritario 24/7"],
      cta: "Empezar con Pro",
    },
  ],
};

function ProductCard({ nombre, desc, etiqueta, onStart }: { nombre: string; desc: string; etiqueta: string; onStart?: () => void }) {
  const available = etiqueta === "Disponible";
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10, opacity: available ? 1 : 0.6, position: "relative" }}>
      <div style={{
        position: "absolute", top: 14, right: 14,
        fontSize: 11, fontWeight: 600,
        background: available ? "#f0fdf4" : "#f8fafc",
        border: `1px solid ${available ? "#bbf7d0" : "#e2e8f0"}`,
        color: available ? "#16a34a" : "#94a3b8",
        borderRadius: 6, padding: "2px 8px",
      }}>{etiqueta}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{nombre}</div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, flex: 1 }}>{desc}</div>
      {available && onStart && (
        <button
          onClick={onStart}
          className="btn-secondary"
          style={{ marginTop: 6, fontSize: 13, padding: "8px 16px", borderRadius: 8 }}
        >
          Empezar →
        </button>
      )}
    </div>
  );
}

export default function FeaturesSection() {
  const router = useRouter();
  const [audiencia, setAudiencia] = useState<Audiencia>("estudiante");
  const planes = PLANES[audiencia];
  const productos = audiencia === "estudiante" ? ESTUDIANTES_PRODUCTOS : DOCENTES_PRODUCTOS;

  function handlePlan(planId: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("plan_elegido", planId);
      localStorage.setItem("audiencia_elegida", audiencia);
    }
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

      {/* ── Garantías strip ──────────────────────────────────────────── */}
      <section style={{ marginBottom: 88 }}>
        <div style={{
          background: "white", border: "1px solid #e2e8f0",
          borderRadius: 16, padding: "18px 28px",
          display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}>
          {GARANTIAS.map(g => (
            <div key={g.texto} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", padding: "4px 10px" }}>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>{g.icono}</span>
              <span>{g.texto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Audiencia selector + Productos ──────────────────────────── */}
      <section id="productos" style={{ marginBottom: 96 }}>
        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: 12, padding: 4, gap: 4,
          }}>
            {(["estudiante", "docente"] as Audiencia[]).map(a => (
              <button
                key={a}
                id={`tab-${a}`}
                onClick={() => setAudiencia(a)}
                style={{
                  padding: "10px 28px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  transition: "all 0.18s ease",
                  background: audiencia === a ? "#0f172a" : "transparent",
                  color: audiencia === a ? "white" : "#64748b",
                }}
              >
                {a === "estudiante" ? "Para Estudiantes" : "Para Docentes"}
              </button>
            ))}
          </div>
        </div>

        {/* Section title */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
            {audiencia === "estudiante" ? "Para Estudiantes" : "Para Docentes"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            {audiencia === "estudiante"
              ? "Genera tus trabajos académicos con IA — desde monografías hasta tesis de grado."
              : "Prepara clases, evalúa con rúbricas y crea material didáctico en minutos."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          {productos.map(p => (
            <ProductCard
              key={p.nombre}
              {...p}
              onStart={p.etiqueta === "Disponible" ? () => router.push("/login") : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── Planes ──────────────────────────────────────────────────── */}
      <section id="planes" style={{ marginBottom: 88 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Planes y precios
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>Sin suscripción obligatoria · Pago único o mensual</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 680, margin: "0 auto" }}>
          {planes.map(plan => (
            <div
              key={plan.id}
              className="card"
              style={{
                position: "relative",
                border: plan.popular ? "2px solid #0f172a" : undefined,
                paddingTop: plan.popular ? 32 : undefined,
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: "#0f172a", color: "white",
                  borderRadius: 999, padding: "3px 16px",
                  fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                }}>
                  Más popular
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{plan.nombre}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", lineHeight: 1, marginBottom: 4 }}>{plan.precio}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>{plan.nota}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
                {plan.items.map(item => (
                  <li key={item} style={{ display: "flex", gap: 9, fontSize: 14, color: "#475569", alignItems: "flex-start" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                id={`btn-plan-${plan.id}`}
                onClick={() => handlePlan(plan.id)}
                className={plan.popular ? "btn-primary" : "btn-secondary"}
                style={{ width: "100%", justifyContent: "center", borderRadius: 9, marginBottom: 8 }}
              >
                {plan.cta}
              </button>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "7px 10px", borderRadius: 7,
                background: "#f8fafc", border: "1px dashed #e2e8f0",
                fontSize: 11, color: "#94a3b8",
              }}>
                Pago por QR / Libélula · Activación en 24h
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
          El pago se coordina por QR o transferencia bancaria.<br />
          Recibirás acceso en menos de 24 horas tras confirmar el pago.
        </p>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", marginBottom: 80 }}>
        <div style={{
          background: "#0f172a", borderRadius: 24, padding: "56px 32px",
        }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.02em" }}>
            ¿Listo para empezar?
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
            Regístrate con tu cuenta Google y espera la activación. En menos de 24 horas tendrás acceso completo.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/login" id="cta-final-crear" className="btn-accent" style={{ padding: "14px 36px", fontSize: 15 }}>
              Crear cuenta →
            </a>
            <a href="#planes" className="btn-secondary" style={{ padding: "14px 28px", fontSize: 14, color: "white", borderColor: "#334155" }}>
              Ver planes
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
