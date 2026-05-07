"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HeroSectionNewProps {
  stats?: {
    estudiantes: number;
    promedio: number;
    maximo: number;
    aprobados: number;
  };
}

function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
}: {
  from?: number;
  to: number;
  duration?: number;
}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const current = from + (to - from) * progress;
      setValue(to % 1 === 0 ? Math.floor(current) : parseFloat(current.toFixed(2)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span>{value}</span>;
}

export default function HeroSectionNew({ stats }: HeroSectionNewProps) {
  const data = stats || {
    estudiantes: 53,
    promedio: 5.81,
    maximo: 14.33,
    aprobados: 20,
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative bg-white px-6 py-32 sm:py-40 lg:px-8 overflow-hidden"
    >
      {/* Background gradient - subtle, not aggressive */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(20, 184, 166, 0.06) 0%, transparent 40%)",
        }}
      />

      <div className="mx-auto max-w-5xl text-center">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-neutral-900 leading-none">
            Domina tu
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-500">
              examen UMSS
            </span>
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-2xl text-xl sm:text-2xl text-neutral-600 mb-16 leading-relaxed"
        >
          Practica con simuladores reales, obtén feedback instantáneo de IA y prepárate como nunca antes.
        </motion.p>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-16"
        >
          {[
            { label: "Estudiantes", value: data.estudiantes, icon: "👥" },
            { label: "Promedio", value: data.promedio, icon: "📊" },
            { label: "Máximo", value: data.maximo, icon: "🏆" },
            { label: "Aprobados", value: data.aprobados, icon: "✅" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 + idx * 0.1 }}
              className="flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-neutral-200 bg-white hover:border-violet-200 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-3xl mb-2">{stat.icon}</span>
              <span className="text-3xl sm:text-4xl font-bold text-violet-600">
                <AnimatedCounter to={stat.value} duration={2} />
              </span>
              <span className="text-xs sm:text-sm text-neutral-600 mt-2 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <a href="/axiom/simulador">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 50px rgba(139, 92, 246, 0.25)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-violet-600 text-white font-semibold text-lg transition-all duration-300 hover:bg-violet-700 shadow-lg hover:shadow-2xl"
            >
              Comenzar Ahora
              <motion.span
                className="text-xl"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
