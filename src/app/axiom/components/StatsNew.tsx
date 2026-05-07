"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

interface StatItemProps {
  icon: string;
  label: string;
  value: number | string;
  unit?: string;
  delay?: number;
}

function StatItem({ icon, label, value, unit, delay = 0 }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!inView || animated) return;

    let startTime: number;
    let animationFrame: number;
    const numValue = typeof value === "number" ? value : 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / 2000, 1);
      setDisplayValue(Math.floor(numValue * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, animated, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/82 p-6 text-center shadow-[0_18px_44px_rgba(24,24,70,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
    >
      <motion.span
        className="text-5xl mb-4"
        whileHover={{ scale: 1.2, rotate: 8 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.span>

      <motion.div
        className="mb-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: (delay || 0) + 0.2 }}
        viewport={{ once: true }}
      >
        <span className="text-5xl sm:text-6xl font-bold text-violet-600">
          {animated && typeof value === "number" ? displayValue : value}
        </span>
        {unit && <span className="text-2xl text-neutral-600 ml-1">{unit}</span>}
      </motion.div>

      <p className="text-neutral-600 font-medium text-sm">{label}</p>
    </motion.div>
  );
}

interface StatsNewProps {
  stats?: {
    simulaciones?: number;
    promedio?: number;
    tiempoEstudiado?: string;
  };
}

export default function StatsNew({ stats }: StatsNewProps) {
  const data = stats || {
    simulaciones: 14,
    promedio: 9.2,
    tiempoEstudiado: "12h 45m",
  };

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="axiom-section-title mb-10"
      >
        <h2 className="mb-3 text-4xl font-black text-[#171545] sm:text-5xl">
          Tu Progreso en Números
        </h2>
        <p className="text-lg text-neutral-600">
          Visualiza cómo estás avanzando hacia tu meta
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="axiom-container">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
          <StatItem
            icon="📊"
            label="Simuladores Completados"
            value={data.simulaciones || 0}
            delay={0}
          />
          <StatItem
            icon="🎯"
            label="Nota Promedio"
            value={data.promedio || 0}
            unit="/100"
            delay={0.1}
          />
          <StatItem
            icon="⏱️"
            label="Tiempo Estudiado"
            value={data.tiempoEstudiado || "0h"}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}
