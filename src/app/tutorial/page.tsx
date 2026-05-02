"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PASOS = [
  {
    n: "01",
    titulo: "¿Tienes tema de monografía?",
    icon: "🤔",
    color: "var(--accent)",
    contenido: [
      { subtitulo: "Si NO tienes tema", texto: "Ingresa tu diplomado, los módulos que cursaste, tu área de interés y dónde trabajas. La IA genera 3 propuestas de temas viables para Bolivia/Latinoamérica, con fuentes verificables (INE, IBCE, BCB, etc.). Elige la que más te interese." },
      { subtitulo: "Si SÍ tienes tema", texto: "Ingresa directamente el título de tu tema, el objetivo general y la pregunta de investigación. El sistema lo guarda como aprobado y pasa al formulario del Capítulo I." },
    ],
    tip: "Tip: Los temas con datos secundarios públicos (estadísticas nacionales, reportes de organismos internacionales) son los más viables y generan mejores resultados.",
  },
  {
    n: "02",
    titulo: "Completar datos para Capítulo I",
    icon: "📝",
    color: "#8b5cf6",
    contenido: [
      { subtitulo: "Campos obligatorios", texto: "Antecedentes del problema, literatura relevante (5-7 referencias en formato: Autor (Año). \"Título\". Fuente), causas raíz, efectos proyectados, situación controlada, objetivos específicos, justificación teórica, práctica y social, alcances y limitaciones." },
      { subtitulo: "Campos opcionales", texto: "Subpreguntas de investigación (diagnóstica, teórica, comparativa, propositiva), hipótesis principal si es investigación cuantitativa, alcance institucional específico." },
    ],
    tip: "Tip: No necesitas redactar perfectamente. Escribe tus ideas en borrador; la IA las estructura con lenguaje académico formal.",
  },
  {
    n: "03",
    titulo: "Capítulo II — Marco Teórico",
    icon: "📚",
    color: "#f59e0b",
    contenido: [
      { subtitulo: "¿Tienes documentos del docente?", texto: "Puedes pegar el contenido de materiales que te entregó el docente en el campo de texto. La IA los integra al marco teórico con la cita correspondiente." },
      { subtitulo: "Estudios relacionados", texto: "Indica cuántos estudios relacionados quieres incluir (recomendado: 5). También puedes agregar contexto actual del tema para la sección de antecedentes recientes." },
    ],
    tip: "Tip: Si el docente te entregó un artículo o libro, copia el texto relevante (no más de 2000 palabras) en el campo de documentos. El sistema lo parafrasea y cita correctamente.",
  },
  {
    n: "04",
    titulo: "Capítulos III, IV y V",
    icon: "🔬",
    color: "#f97316",
    contenido: [
      { subtitulo: "Metodología (Cap. III)", texto: "El sistema diseña el enfoque metodológico, tipo de investigación, técnicas e instrumentos, y fuentes de datos coherentes con tus objetivos del Cap. I." },
      { subtitulo: "Análisis (Cap. IV)", texto: "Se genera UNA sección por cada objetivo específico. Si no tienes datos reales, el sistema deja marcadores [DATO: qué buscar, en qué fuente] para que los completes luego." },
      { subtitulo: "Conclusiones (Cap. V)", texto: "4 párrafos por conclusión (hallazgo, significado, teoría, aporte) + síntesis que responde la pregunta central + hasta 5 recomendaciones con indicadores." },
    ],
    tip: "Tip: Puedes agregar fuentes de datos en el campo de texto (ej: 'INE — datos de comercio exterior 2019-2023') para que la metodología las mencione explícitamente.",
  },
  {
    n: "05",
    titulo: "Chat de modificaciones",
    icon: "💬",
    color: "#22c55e",
    contenido: [
      { subtitulo: "Cómo funciona", texto: "Después de cada generación, aparece un chat donde puedes pedir cambios al capítulo antes de aprobarlo. Ejemplos: 'Amplía la sección 1.3', 'El objetivo 2 no es claro, reformúlalo', 'Agrega más teoría sobre X en el Cap. II'." },
      { subtitulo: "Límites del chat", texto: "El chat no inventa citas nuevas ni estadísticas. Solo reformula, amplía o reduce usando el contenido ya presente. Para agregar fuentes nuevas, debes regenerar la etapa completa." },
    ],
    tip: "Tip: Sé específico en tus pedidos. 'Hazlo más largo' es menos efectivo que 'Amplía la justificación social con 2 párrafos más sobre el impacto en comunidades rurales'.",
  },
  {
    n: "06",
    titulo: "Carátula y descarga final",
    icon: "🎓",
    color: "#a78bfa",
    contenido: [
      { subtitulo: "Subir carátula", texto: "Sube la carátula oficial de tu institución en formato PNG o JPG. Se incluirá como primera página del documento. Si no tienes, puedes omitirla y se genera una portada básica automática." },
      { subtitulo: "Opciones de descarga", texto: "Vista previa PDF: abre el documento en el navegador, usa Ctrl+P para guardar como PDF.\n\nArchivo LaTeX (.tex): descarga el fuente para compilar en Overleaf (overleaf.com) con formato profesional: márgenes 2.54 cm, Times 12pt, interlineado 1.5, tabla de contenidos automática." },
    ],
    tip: "Tip para LaTeX en Overleaf: Crea proyecto en blanco → sube el .tex → si tienes carátula nómbrala 'caratula.pdf' y súbela → haz clic en Recompile dos veces.",
  },
];

const FAQS = [
  {
    q: "¿Qué pasa si el servidor se reinicia?",
    a: "Los datos se almacenan en memoria de sesión. Si el servidor se reinicia, se pierden los datos no guardados. Guarda el texto de cada capítulo localmente (copia en un documento Word) antes de cerrar el navegador.",
  },
  {
    q: "¿Puedo usar el sistema para una tesis o trabajo final de grado?",
    a: "El sistema está optimizado para monografías de diplomado (5 capítulos). Para tesis de maestría o doctorado, la estructura es similar pero puede requerir más profundidad. Usa el chat para solicitar ampliaciones.",
  },
  {
    q: "¿Los datos que ingreso son confidenciales?",
    a: "Sí. Los datos se usan solo para generar tu documento. No se comparten con terceros. Lee la Política de Privacidad para más detalles.",
  },
  {
    q: "¿La IA puede inventar estadísticas falsas?",
    a: "El sistema está diseñado para evitar alucinaciones. Cuando no tiene datos verificables, deja marcadores como [DATO: buscar en INE, indicador X]. Revisa siempre el contenido antes de entregarlo.",
  },
  {
    q: "¿Qué es APA 7 y por qué importa?",
    a: "APA 7 es el estilo de citación más usado en ciencias sociales y educación. El sistema formatea automáticamente todas las referencias en este estilo (Autor, Año, Título en cursiva, DOI cuando disponible).",
  },
  {
    q: "¿Puedo regenerar solo un capítulo?",
    a: "Sí. Usa el chat de modificaciones para ajustes sin regenerar completo. Si necesitas cambios mayores, aprueba el capítulo, continúa al siguiente, y el admin puede ayudarte a retroceder.",
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "var(--fg-primary)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ fontSize: 20 }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--fg-primary)" }}>Laboratorio</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--accent)" }}>Académico</span>
          </a>
          <button
            className="btn-cyan"
            onClick={() => router.push("/monografia")}
            style={{ fontSize: 13, padding: "8px 18px" }}
          >
            Generar monografía →
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 10 }}>Tutorial completo</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
            Aprende a generar una monografía completa en 30 minutos. Cada paso explicado con ejemplos.
          </p>
        </div>

        {/* Pasos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 60 }}>
          {PASOS.map(paso => (
            <div key={paso.n} style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {/* Header del paso */}
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${paso.color}22`, border: `1px solid ${paso.color}44`,
                  fontSize: 11, fontWeight: 800, color: paso.color, flexShrink: 0,
                }}>{paso.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)" }}>
                    {paso.icon} {paso.titulo}
                  </div>
                </div>
              </div>
              {/* Contenido */}
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {paso.contenido.map(c => (
                  <div key={c.subtitulo}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: paso.color, marginBottom: 6 }}>{c.subtitulo}</div>
                    <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{c.texto}</p>
                  </div>
                ))}
                <div style={{
                  background: `${paso.color}0f`, border: `1px solid ${paso.color}22`,
                  borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--fg-muted)",
                }}>
                  {paso.tip}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Preguntas frecuentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 18px", background: "none",
                    border: "none", color: "var(--fg-primary)", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  {faq.q}
                  <span style={{ color: "var(--fg-secondary)", flexShrink: 0, marginLeft: 12 }}>
                    {faqAbierta === i ? "▲" : "▼"}
                  </span>
                </button>
                {faqAbierta === i && (
                  <div style={{ padding: "0 18px 16px", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "32px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>¿Listo para empezar?</h3>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 20 }}>El flujo tarda 15-30 minutos. Puedes pausar y retomar desde el mismo navegador.</p>
          <button
            className="btn-cyan"
            onClick={() => router.push("/monografia")}
            style={{ padding: "12px 32px", fontSize: 15 }}
          >
            Generar mi monografía →
          </button>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          <a href="/terminos" style={{ color: "var(--fg-secondary)", textDecoration: "none", marginRight: 16 }}>Términos</a>
          <a href="/privacidad" style={{ color: "var(--fg-secondary)", textDecoration: "none" }}>Privacidad</a>
        </div>
      </footer>
    </div>
  );
}
