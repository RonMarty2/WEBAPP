"use client";

import { useRouter } from "next/navigation";

const GARANTIAS = [
  { icono: "🔒", texto: "Sin alucinación — solo datos verificables" },
  { icono: "🔗", texto: "Coherencia total entre capítulos" },
  { icono: "📐", texto: "Formato institucional exacto" },
  { icono: "📚", texto: "Bibliografía APA 7 automática" },
  { icono: "💬", texto: "Chat de modificaciones por etapa" },
  { icono: "⚡", texto: "Generación completa en 30 minutos" },
];

const ESTUDIANTES_PRODUCTOS = [
  {
    icono: "📄",
    nombre: "Monografías",
    desc: "5 capítulos completos, bibliografía APA 7 y exportación LaTeX lista para presentar.",
    etiqueta: "Disponible",
    color: "#06b6d4",
  },
  {
    icono: "🎓",
    nombre: "Tesis de grado",
    desc: "Estructura y redacción asistida para tesis de licenciatura con rigor metodológico.",
    etiqueta: "Próximamente",
    color: "#8b5cf6",
  },
  {
    icono: "📝",
    nombre: "Ensayos académicos",
    desc: "Ensayos argumentativos y analíticos con fuentes verificadas y formato institucional.",
    etiqueta: "Próximamente",
    color: "#f59e0b",
  },
  {
    icono: "📊",
    nombre: "Trabajos finales",
    desc: "Proyectos de grado e informes de práctica con estructura personalizada.",
    etiqueta: "Próximamente",
    color: "#22c55e",
  },
];

const DOCENTES_PRODUCTOS = [
  {
    icono: "📋",
    nombre: "Planificaciones de clase",
    desc: "Planes de sesión, unidades didácticas y programaciones curriculares en minutos.",
    etiqueta: "Próximamente",
    color: "#8b5cf6",
  },
  {
    icono: "✅",
    nombre: "Rúbricas de evaluación",
    desc: "Rúbricas analíticas y holísticas alineadas a los objetivos de aprendizaje.",
    etiqueta: "Próximamente",
    color: "#06b6d4",
  },
  {
    icono: "📖",
    nombre: "Material didáctico",
    desc: "Guías de estudio, resúmenes y fichas de trabajo para tus estudiantes.",
    etiqueta: "Próximamente",
    color: "#f59e0b",
  },
  {
    icono: "🔬",
    nombre: "Guías de investigación",
    desc: "Protocolos de investigación, marcos teóricos y diseños metodológicos.",
    etiqueta: "Próximamente",
    color: "#22c55e",
  },
];

const PLANES = [
  {
    id: "estandar",
    nombre: "Estándar",
    precio: "Bs. 150",
    nota: "pago único",
    color: "#06b6d4",
    popular: true,
    items: [
      "1 documento académico",
      "IA avanzada (mejor calidad)",
      "Chat de modificaciones ilimitado",
      "Descarga PDF + LaTeX profesional",
      "Bibliografía APA 7 automática",
      "Soporte prioritario",
    ],
    cta: "Elegir Estándar",
  },
  {
    id: "pro",
    nombre: "Pro",
    precio: "Bs. 300",
    nota: "3 documentos / mes",
    color: "#8b5cf6",
    popular: false,
    items: [
      "Hasta 3 documentos al mes",
      "Mejor modelo de IA disponible",
      "Chat ilimitado + regeneración",
      "PDF + LaTeX + historial de versiones",
      "Acceso anticipado a nuevos productos",
      "Soporte prioritario 24/7",
    ],
    cta: "Elegir Pro",
  },
];

function ProductoCard({ p, onStart }: { p: typeof ESTUDIANTES_PRODUCTOS[0]; onStart?: () => void }) {
  return (
    <div
      className="card"
      style={{
        position: "relative",
        opacity: p.etiqueta === "Próximamente" ? 0.6 : 1,
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{
        position: "absolute", top: 14, right: 14,
        fontSize: 11, fontWeight: 600,
        background: p.etiqueta === "Disponible" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${p.etiqueta === "Disponible" ? "rgba(34,197,94,0.3)" : "#1e293b"}`,
        color: p.etiqueta === "Disponible" ? "#4ade80" : "#475569",
        borderRadius: 6, padding: "2px 8px",
      }}>{p.etiqueta}</div>
      <div style={{ fontSize: 30 }}>{p.icono}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: p.color }}>{p.nombre}</div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, flex: 1 }}>{p.desc}</div>
      {p.etiqueta === "Disponible" && onStart && (
        <button
          onClick={onStart}
          style={{
            marginTop: 6, fontSize: 13, fontWeight: 600,
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
            color: "#06b6d4", borderRadius: 8, padding: "8px 16px", cursor: "pointer",
          }}
        >
          Empezar →
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  function handlePlan(planId: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("plan_elegido", planId);
    }
    router.push("/login");
  }

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid rgba(6,182,212,0.12)", padding: "0 32px",
        position: "sticky", top: 0,
        background: "rgba(2,6,23,0.92)", backdropFilter: "blur(14px)", zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 22 }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#e2e8f0" }}>Laboratorio</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#06b6d4" }}>Académico</span>
          </div>
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <a href="#estudiantes" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "6px 12px" }}>Para Estudiantes</a>
            <a href="#docentes" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "6px 12px" }}>Para Docentes</a>
            <a href="#planes" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "6px 12px" }}>Planes</a>
            <a href="/tutorial" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "6px 12px" }}>Tutorial</a>
            <a href="/login" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", padding: "8px 14px", borderRadius: 8, border: "1px solid #1e293b" }}>
              Iniciar sesión
            </a>
            <a href="#planes" style={{
              fontSize: 14, fontWeight: 600,
              background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.35)",
              color: "#06b6d4", padding: "8px 18px", borderRadius: 8, textDecoration: "none",
            }}>
              Ver planes
            </a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section style={{ textAlign: "center", padding: "96px 0 72px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 20, padding: "5px 16px", fontSize: 13, color: "#67e8f9", marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            Plataforma académica con inteligencia artificial
          </div>

          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 60px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 22 }}>
            Documentos académicos{" "}<br />
            <span style={{ background: "linear-gradient(135deg, #06b6d4 30%, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              de calidad, sin esfuerzo
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.65 }}>
            Para estudiantes y docentes. Genera monografías, planificaciones y material
            académico con IA — coherente, preciso y listo para presentar.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#estudiantes" style={{
              padding: "14px 32px", fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg, #06b6d4, #0284c7)",
              color: "#fff", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 0 32px rgba(6,182,212,0.3)",
            }}>
              🎓 Para Estudiantes
            </a>
            <a href="#docentes" style={{
              padding: "14px 32px", fontSize: 15, fontWeight: 700,
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "#fff", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 0 32px rgba(139,92,246,0.25)",
            }}>
              👨‍🏫 Para Docentes
            </a>
            <a href="/tutorial" style={{
              padding: "14px 22px", fontSize: 14, color: "#94a3b8",
              textDecoration: "none", border: "1px solid #1e293b", borderRadius: 10,
            }}>
              Cómo funciona
            </a>
          </div>
        </section>

        {/* ── Garantías ──────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 88 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid #1e293b",
            borderRadius: 12, padding: "18px 28px",
            display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
          }}>
            {GARANTIAS.map(g => (
              <div key={g.texto} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748b", padding: "4px 10px" }}>
                <span>{g.icono}</span><span>{g.texto}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Para Estudiantes ───────────────────────────────────────────────── */}
        <section id="estudiantes" style={{ marginBottom: 96 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ fontSize: 40 }}>🎓</div>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Para Estudiantes</h2>
              <p style={{ color: "#64748b", fontSize: 15 }}>
                Genera tus trabajos académicos con IA — desde monografías hasta tesis de grado.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {ESTUDIANTES_PRODUCTOS.map(p => (
              <ProductoCard key={p.nombre} p={p} onStart={p.etiqueta === "Disponible" ? () => router.push("/login") : undefined} />
            ))}
          </div>
        </section>

        {/* ── Para Docentes ──────────────────────────────────────────────────── */}
        <section id="docentes" style={{ marginBottom: 96 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ fontSize: 40 }}>👨‍🏫</div>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Para Docentes</h2>
              <p style={{ color: "#64748b", fontSize: 15 }}>
                Prepara clases, evalúa con rúbricas y crea material didáctico en minutos.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {DOCENTES_PRODUCTOS.map(p => (
              <ProductoCard key={p.nombre} p={p} />
            ))}
          </div>
          <div style={{
            marginTop: 24, padding: "16px 24px", borderRadius: 10,
            background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
            fontSize: 14, color: "#94a3b8",
          }}>
            <strong style={{ color: "#a78bfa" }}>Próximamente para docentes.</strong>{" "}
            Regístrate ahora para recibir acceso anticipado cuando lancemos los módulos de docentes.
          </div>
        </section>

        {/* ── Planes ─────────────────────────────────────────────────────────── */}
        <section id="planes" style={{ marginBottom: 88 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Planes y precios</h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>
              Válidos para estudiantes y docentes · Sin suscripción obligatoria
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start", maxWidth: 680, margin: "0 auto" }}>
            {PLANES.map(plan => (
              <div
                key={plan.id}
                className="card"
                style={{
                  position: "relative",
                  border: plan.popular ? `2px solid ${plan.color}` : undefined,
                  boxShadow: plan.popular ? `0 0 48px ${plan.color}22` : undefined,
                  paddingTop: plan.popular ? 32 : undefined,
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                    color: "#fff", borderRadius: 20, padding: "3px 14px",
                    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                  }}>⭐ Más popular</div>
                )}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: plan.color }}>{plan.nombre}</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#f1f5f9", lineHeight: 1, marginBottom: 4 }}>
                  {plan.precio}
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>{plan.nota}</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
                  {plan.items.map(item => (
                    <li key={item} style={{ display: "flex", gap: 9, fontSize: 14, color: "#94a3b8", alignItems: "flex-start" }}>
                      <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlan(plan.id)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 9,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    border: plan.popular ? "none" : `1px solid ${plan.color}55`,
                    background: plan.popular ? "linear-gradient(135deg,#06b6d4,#0284c7)" : `${plan.color}14`,
                    color: plan.popular ? "#fff" : plan.color,
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.8 }}>
              El pago se coordina por <strong style={{ color: "#64748b" }}>QR o transferencia bancaria</strong>.<br />
              Recibirás acceso en menos de 24 horas tras confirmar el pago.
            </p>
          </div>
        </section>

        {/* ── CTA final ──────────────────────────────────────────────────────── */}
        <section style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.07), rgba(139,92,246,0.07))",
            border: "1px solid rgba(6,182,212,0.15)", borderRadius: 16, padding: "56px 32px",
          }}>
            <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>¿Listo para empezar?</h3>
            <p style={{ color: "#64748b", fontSize: 16, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
              Regístrate con tu cuenta Google y espera la activación. En menos de 24 horas tendrás acceso completo.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/login" style={{
                padding: "14px 36px", fontSize: 15, fontWeight: 700,
                background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                color: "#fff", borderRadius: 10, textDecoration: "none",
                boxShadow: "0 0 32px rgba(6,182,212,0.25)",
              }}>
                Crear cuenta →
              </a>
              <a href="#planes" style={{
                padding: "14px 28px", fontSize: 14, color: "#94a3b8",
                textDecoration: "none", border: "1px solid #1e293b", borderRadius: 10,
              }}>
                Ver planes
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #0f172a", padding: "28px 32px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🧪</span>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>Laboratorio Académico</span>
            <span style={{ fontSize: 12, color: "#1e293b", marginLeft: 8 }}>© 2026</span>
          </div>
          <nav style={{ display: "flex", gap: 20 }}>
            <a href="#estudiantes" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Estudiantes</a>
            <a href="#docentes" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Docentes</a>
            <a href="/tutorial" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Tutorial</a>
            <a href="/terminos" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Términos</a>
            <a href="/privacidad" style={{ fontSize: 13, color: "#334155", textDecoration: "none" }}>Privacidad</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
