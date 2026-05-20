"use client";

import { useState } from "react";
import RevealSection from "@/components/ui/RevealSection";

interface FAQ {
  pregunta: string;
  respuesta: string;
}

const FAQS: FAQ[] = [
  {
    pregunta: "¿Es plagio usar IA para mi monografía?",
    respuesta:
      "No. La IA genera contenido original a partir de tu programa, materias, contexto laboral y documentos. Todo el contenido se basa en fuentes reales citadas en APA 7, no se copia de monografías existentes. Tú apruebas cada etapa antes de avanzar — el documento es completamente tuyo.",
  },
  {
    pregunta: "¿Mi universidad va a aceptarlo?",
    respuesta:
      "Sí, si cumple con su formato. Soportamos el formato oficial de las 8 universidades principales bolivianas (UMSS, UMSA, UAGRM, UTO, USFX, UPB, EMI y formato genérico). Si tu universidad no está en la lista, usa el formato genérico configurable o escríbenos.",
  },
  {
    pregunta: "¿Cuánto tiempo toma generar una monografía completa?",
    respuesta:
      "Para una Monografía, el primer borrador completo está listo en menos de 3 horas. Para un Proyecto de Grado (más extenso), en menos de 6 horas. Las correcciones del tutor se aplican en minutos. Es un proceso guiado: tú apruebas en cada paso.",
  },
  {
    pregunta: "¿Qué pasa si la IA falla durante la generación?",
    respuesta:
      "Tenemos cascada automática con triple respaldo: si Groq falla, sigue Claude (Anthropic). Si Claude falla, sigue GPT (OpenAI). Tu generación nunca se interrumpe por un problema de un solo proveedor.",
  },
  {
    pregunta: "¿Puedo modificar el documento después de generarlo?",
    respuesta:
      "Sí. Bajas el archivo .tex y lo abres en Overleaf para editar manualmente. También puedes pedirle a la IA cambios puntuales dentro de la plataforma mediante el chat de modificaciones — sin reiniciar el documento.",
  },
  {
    pregunta: "¿Es legal usar IA para mi monografía?",
    respuesta:
      "La mayoría de universidades ya aceptan el uso de IA como herramienta de redacción, siempre que el estudiante valide y aporte criterio. Nuestro enfoque es exactamente ese: la IA redacta, tú apruebas. Si tu programa lo prohíbe explícitamente, no recomendamos usar la plataforma.",
  },
  {
    pregunta: "¿Mis datos están seguros?",
    respuesta:
      "Sí. Todo está cifrado en tránsito y en reposo. No compartimos tu material con terceros, no entrenamos modelos con tu información y no vendemos datos a nadie. Tu material privado se mantiene privado.",
  },
  {
    pregunta: "¿Funciona si todavía no tengo claro mi tema?",
    respuesta:
      "Sí, ese es el escenario más común. La IA propone 3 temas viables basados en tu programa, tus materias y tu contexto laboral. Tú eliges uno y avanzas. Además detectamos temas trillados y los descartamos automáticamente.",
  },
  {
    pregunta: "¿Qué incluye exactamente el documento final?",
    respuesta:
      "Capítulos I al V (Introducción, Marco Teórico, Metodología, Análisis de Resultados y Conclusiones) + Bibliografía APA 7 consolidada. Entre 40 y 80 páginas con coherencia validada entre capítulos. Más banco de preguntas para tu defensa y PDF de preparación.",
  },
  {
    pregunta: "¿Cómo es el pago?",
    respuesta:
      "Por QR boliviano (Tigo Money, BCP, BNB) o transferencia bancaria. Recibirás acceso completo en menos de 24 horas tras confirmar el pago. Todos los planes son de pago único (no hay suscripciones mensuales obligatorias).",
  },
  {
    pregunta: "¿Cuál plan me conviene?",
    respuesta:
      "Si solo necesitas el documento entregado y vas a defender sin tutor exigente, te alcanza con Básico. Si esperas observaciones del tutor y quieres corregirlas sin rehacer todo, elige Plus (es el más elegido). Si esta defensa decide tu titulación y quieres todo el respaldo hasta el día del tribunal (banco de preguntas, materiales impresos, soporte 24/7), ve con Premium.",
  },
  {
    pregunta: "¿Puedo cambiar de plan después?",
    respuesta:
      "Sí. Si empezaste con Básico y te das cuenta de que necesitas correcciones, puedes pasar a Plus pagando solo la diferencia. Lo mismo para subir a Premium. No pierdes el trabajo ya generado.",
  },
];

function FAQItem({ faq, isOpen, onClick }: { faq: FAQ; isOpen: boolean; onClick: () => void }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: isOpen ? "var(--shadow-sm)" : "none",
        transition: "all 0.2s",
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          padding: "18px 22px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-primary)" }}>
          {faq.pregunta}
        </span>
        <span
          style={{
            width: 26, height: 26, borderRadius: 8,
            background: isOpen ? "var(--accent)" : "var(--bg-subtle)",
            color: isOpen ? "white" : "var(--fg-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            fontSize: 16, fontWeight: 700,
            transition: "all 0.2s",
          }}
          aria-hidden="true"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 22px 20px 22px",
            fontSize: 14,
            color: "var(--fg-secondary)",
            lineHeight: 1.7,
          }}
        >
          {faq.respuesta}
        </div>
      )}
    </div>
  );
}

export default function FAQsSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="w-full px-4 md:px-8"
      style={{ maxWidth: "min(820px, 92vw)", margin: "0 auto", paddingTop: 96, paddingBottom: 96 }}
    >
      <RevealSection>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--accent)",
            marginBottom: 12,
          }}>
            Preguntas frecuentes
          </p>
          <h2
            className="font-crimson"
            style={{ fontSize: 38, fontWeight: 700, color: "var(--fg-primary)", marginBottom: 12, letterSpacing: "-0.01em" }}
          >
            Lo que todo el mundo pregunta
          </h2>
          <p style={{ color: "var(--fg-muted)", fontSize: 16, lineHeight: 1.6 }}>
            Si no encuentras lo que buscas, escríbenos por WhatsApp.
          </p>
        </div>
      </RevealSection>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAQS.map((faq, i) => (
          <RevealSection key={faq.pregunta} delay={i * 30}>
            <FAQItem
              faq={faq}
              isOpen={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          </RevealSection>
        ))}
      </div>
    </section>
  );
}
