"use client";

import { useRouter } from "next/navigation";
import { Button, Heading, Text } from "@/components/ui";

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative px-6 md:px-8 min-h-[calc(100vh-62px)] flex flex-col items-center justify-center text-center overflow-hidden py-24">
      {/* Halo central sutil para legibilidad sobre los blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(820px,92vw)] h-[480px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(250,250,252,0.82) 18%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-9 rounded-full bg-white/80 border border-[var(--border)] backdrop-blur-sm shadow-[0_0_0_4px_rgba(99,102,241,0.05),0_1px_3px_rgba(20,20,20,0.05)] dark:bg-white/5">
          <span className="relative inline-flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
            <span className="relative inline-block w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12.5px] font-medium text-[var(--fg-secondary)]">
            Plataforma académica con inteligencia artificial
          </span>
        </div>

        {/* H1 */}
        <Heading
          level={1}
          family="serif"
          className="!text-[clamp(44px,7vw,82px)] !font-bold !leading-[1.02] !tracking-[-0.025em] mb-7"
        >
          Documentos académicos{" "}
          <span className="text-gradient inline-block">de calidad, sin esfuerzo</span>
        </Heading>

        {/* Subheadline */}
        <Text
          size="lg"
          tone="muted"
          leading="relaxed"
          className="max-w-[560px] mb-10 !text-[17px]"
        >
          Para estudiantes y docentes. Genera monografías, planificaciones y material académico
          con IA — coherente, preciso y listo para presentar.
        </Text>

        {/* CTAs — 2 primarios bien jerarquizados */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            id="cta-estudiantes"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight />}
            onClick={() => router.push("/login")}
          >
            Empezar gratis
          </Button>
          <Button
            id="cta-tutorial"
            variant="secondary"
            size="lg"
            onClick={() => router.push("/tutorial")}
          >
            Cómo funciona
          </Button>
        </div>

        {/* Social proof footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-[var(--fg-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]" />
            Bs. 150 pago único
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]" />
            Sin suscripción
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]" />
            APA 7 automático
          </span>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[var(--fg-muted)] opacity-70">
        <span className="text-[10.5px] uppercase tracking-[0.18em] font-semibold">
          Descubre
        </span>
        <span className="w-[1px] h-8 bg-current opacity-50" />
      </div>
    </section>
  );
}
