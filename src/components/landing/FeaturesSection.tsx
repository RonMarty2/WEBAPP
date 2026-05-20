"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RevealSection from "@/components/ui/RevealSection";
import { Button, Card, Badge, Tabs, Heading, Text, Kicker } from "@/components/ui";

type Audiencia = "estudiante" | "docente";

const GARANTIAS = [
  "Sin alucinación — solo datos verificables",
  "Coherencia total entre capítulos",
  "Formato institucional exacto",
  "Bibliografía APA 7 automática",
  "Chat de modificaciones por etapa",
  "Generación completa en 30 minutos",
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

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10.5L8 14.5L16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductCard({
  nombre, desc, etiqueta, onStart,
}: { nombre: string; desc: string; etiqueta: string; onStart?: () => void }) {
  const available = etiqueta === "Disponible";
  return (
    <Card
      variant="default"
      padding="md"
      interactive={available}
      className={["relative h-full flex flex-col gap-3", !available ? "opacity-70" : ""].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <Heading level={5} className="!text-[15px]">{nombre}</Heading>
        <Badge variant={available ? "success" : "neutral"} size="sm" dot>
          {etiqueta}
        </Badge>
      </div>
      <Text size="sm" tone="muted" leading="relaxed" className="flex-1">{desc}</Text>
      {available && onStart && (
        <Button variant="ghost" size="sm" rightIcon={<ArrowRight />} onClick={onStart} className="mt-1 self-start !px-2">
          Empezar
        </Button>
      )}
    </Card>
  );
}

export default function FeaturesSection() {
  const router = useRouter();
  const [audiencia, setAudiencia] = useState<Audiencia>("estudiante");
  const planes = PLANES[audiencia];
  const productos = audiencia === "estudiante" ? ESTUDIANTES_PRODUCTOS : DOCENTES_PRODUCTOS;

  async function handlePlan(planId: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("plan_elegido", planId);
      localStorage.setItem("audiencia_elegida", audiencia);
    }
    try {
      const res = await fetch("/api/auth/me");
      const d = await res.json();
      if (d.user) {
        router.push(`/pago?plan=${planId}`);
        return;
      }
    } catch { /* no session */ }
    router.push("/login");
  }

  return (
    <div className="w-full px-6 md:px-8 max-w-[1200px] mx-auto">

      {/* ── Garantías ─────────────────────────────────────────── */}
      <RevealSection>
        <section className="w-full mb-24 md:mb-32 mt-4">
          <Card variant="glass" padding="lg" className="!rounded-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {GARANTIAS.map(g => (
                <div key={g} className="flex items-start gap-2.5">
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 mt-0.5">
                    <CheckIcon />
                  </span>
                  <Text size="sm" className="!text-[13.5px]">{g}</Text>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </RevealSection>

      {/* ── Productos ───────────────────────────────────────── */}
      <RevealSection delay={80}>
        <section id="productos" className="mb-24 md:mb-32">
          <div className="flex flex-col items-center text-center mb-10">
            <Kicker className="mb-3">Catálogo</Kicker>
            <Heading level={2} className="!text-[clamp(28px,4vw,40px)] mb-3">
              Construido para tu rol
            </Heading>
            <Text tone="muted" className="max-w-[520px]">
              {audiencia === "estudiante"
                ? "Genera tus trabajos académicos con IA — desde monografías hasta tesis de grado."
                : "Prepara clases, evalúa con rúbricas y crea material didáctico en minutos."}
            </Text>
          </div>

          <div className="flex justify-center mb-10">
            <Tabs
              tabs={[
                { id: "estudiante", label: "Para Estudiantes" },
                { id: "docente", label: "Para Docentes" },
              ]}
              value={audiencia}
              onChange={(id) => setAudiencia(id as Audiencia)}
              variant="segmented"
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productos.map((p) => (
              <ProductCard
                key={`${audiencia}-${p.nombre}`}
                {...p}
                onStart={p.etiqueta === "Disponible" ? () => router.push("/login") : undefined}
              />
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ── Planes ──────────────────────────────────────────── */}
      <RevealSection delay={100}>
        <section id="planes" className="mb-24 md:mb-32">
          <div className="flex flex-col items-center text-center mb-12">
            <Kicker className="mb-3">Planes y precios</Kicker>
            <Heading level={2} className="!text-[clamp(28px,4vw,40px)] mb-3">
              Simple. Sin suscripciones forzadas.
            </Heading>
            <Text tone="muted">Pago único o mensual. Cancela cuando quieras.</Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[760px] mx-auto">
            {planes.map((plan) => (
                <Card
                  key={plan.id}
                  variant={plan.popular ? "premium" : "default"}
                  padding="lg"
                  className={[
                    "relative h-full flex flex-col",
                    plan.popular ? "!border-[var(--accent)]/40 !shadow-[0_10px_40px_rgba(99,102,241,0.18)]" : "",
                  ].join(" ")}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="accent" size="md" className="!bg-gradient-to-r !from-indigo-500 !to-violet-500 !text-white !border-transparent !shadow-md">
                        Más popular
                      </Badge>
                    </div>
                  )}

                  <Heading level={5} className="!text-base mb-2">{plan.nombre}</Heading>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-extrabold tracking-tight text-[var(--fg-primary)]">
                      {plan.precio}
                    </span>
                  </div>
                  <Text size="sm" tone="muted" className="mb-6">{plan.nota}</Text>

                  <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                    {plan.items.map(item => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="shrink-0 inline-flex items-center justify-center w-4.5 h-4.5 mt-0.5 text-[var(--accent)]">
                          <CheckIcon />
                        </span>
                        <Text size="sm" tone="secondary" className="!text-[13.5px]">{item}</Text>
                      </li>
                    ))}
                  </ul>

                  <Button
                    id={`btn-plan-${plan.id}`}
                    onClick={() => handlePlan(plan.id)}
                    variant={plan.popular ? "primary" : "secondary"}
                    size="md"
                    fullWidth
                  >
                    {plan.cta}
                  </Button>

                  <div className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-subtle)] border border-dashed border-[var(--border)] text-[11.5px] text-[var(--fg-muted)]">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <rect x="3" y="6" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M3 9h14" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    Pago por QR / Libélula · Activación en 24h
                  </div>
                </Card>
            ))}
          </div>

          <Text size="sm" tone="muted" className="text-center mt-8 leading-relaxed">
            El pago se coordina por QR o transferencia bancaria.<br />
            Recibirás acceso en menos de 24 horas tras confirmar el pago.
          </Text>
        </section>
      </RevealSection>

      {/* ── CTA final premium ───────────────────────────────── */}
      <RevealSection delay={80}>
        <section className="mb-24">
          <div className="cta-premium px-6 md:px-12 py-16 md:py-20 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300/80 mb-5">
                Empieza hoy
              </span>
              <h3 className="font-crimson text-[clamp(28px,4.5vw,44px)] font-bold text-white leading-tight mb-5 tracking-tight">
                ¿Listo para empezar?
              </h3>
              <p className="text-white/60 text-base leading-relaxed mb-9 max-w-md mx-auto">
                Regístrate con tu cuenta Google y espera la activación.
                En menos de 24 horas tendrás acceso completo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/login"
                  id="cta-final-crear"
                  className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-xl font-semibold text-[15px] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(99,102,241,0.45)] transition-all duration-200"
                >
                  Crear cuenta
                  <ArrowRight />
                </a>
                <a
                  href="#planes"
                  className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-medium text-[14px] text-white/85 bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                >
                  Ver planes
                </a>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

    </div>
  );
}
