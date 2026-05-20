"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon: ReactNode;
  color: "violet" | "teal" | "amber";
  delay?: number;
}

function StatCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.3 });
  const [animated, setAnimated] = useState(false);

  const colorClasses = {
    violet: "text-violet-600 bg-violet-50",
    teal: "text-teal-600 bg-teal-50",
    amber: "text-amber-600 bg-amber-50",
  };

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={`rounded-2xl p-8 ${colorClasses[color]} border border-neutral-200 relative overflow-hidden group`}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, var(--color-${color}) 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="mb-4 flex items-center justify-center"
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <p className="text-sm font-medium text-neutral-600 mb-2">{title}</p>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-neutral-900">
            {animated && typeof value === "number" ? displayValue : value}
          </span>
          {unit && <span className="text-lg text-neutral-600">{unit}</span>}
        </div>

        {/* Trend */}
        {trend && trendValue && (
          <motion.div
            className="mt-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: (delay || 0) + 0.3 }}
          >
            <motion.span
              animate={{ rotate: trend === "up" ? 0 : 180 }}
              className={`text-lg ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              ↑
            </motion.span>
            <span className="text-sm text-neutral-600">{trendValue}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface StatsSectionProps {
  userStats?: {
    simulaciones: number;
    notaPromedio: number;
    mejora: string;
    tiempoEstudiado: string;
  };
}

export default function StatsSection({ userStats }: StatsSectionProps) {
  const defaultStats = {
    simulaciones: 14,
    notaPromedio: 9.2,
    mejora: "↑ 1.5 puntos esta semana",
    tiempoEstudiado: "12h 45m",
  };

  const stats = userStats || defaultStats;

  return (
    <section className="relative bg-gradient-to-b from-neutral-50 to-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Tu Progreso en Números
          </h2>
          <p className="text-lg text-neutral-600">
            Visualiza cómo estás avanzando hacia tu meta
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <StatCard
            title="Simuladores Completados"
            value={stats.simulaciones}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-violet-600">
                <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            }
            color="violet"
            trend="up"
            trendValue={stats.mejora}
            delay={0}
          />
          <StatCard
            title="Nota Promedio"
            value={stats.notaPromedio}
            unit="/100"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-teal-600">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            }
            color="teal"
            delay={0.1}
          />
          <StatCard
            title="Tiempo Estudiado"
            value={stats.tiempoEstudiado}
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-amber-600">
                <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 9v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 2.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 2.5V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            }
            color="amber"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}
