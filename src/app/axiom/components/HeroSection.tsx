"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  stats?: {
    estudiantes: number;
    promedio: number;
    maximo: number;
    aprobados: number;
  };
}

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const defaultStats = {
    estudiantes: 53,
    promedio: 5.81,
    maximo: 14.33,
    aprobados: 20,
  };

  const data = stats || defaultStats;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8 lg:py-40"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-4xl text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl"
        >
          Domina tu examen
          <span className="block text-violet-600">UMSS</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-xl text-neutral-600"
        >
          Practica como si ya estuvieras aquí. Obtén feedback en tiempo real basado en IA y descubre qué necesitas mejorar.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {[
            { label: "Estudiantes", value: data.estudiantes },
            { label: "Promedio", value: data.promedio },
            { label: "Máximo", value: data.maximo },
            { label: "Aprobados", value: data.aprobados },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-3xl font-bold text-violet-600 sm:text-4xl">
                {stat.value % 1 !== 0 ? (
                  <AnimatedNumber value={stat.value} duration={2} />
                ) : (
                  <AnimatedNumber value={stat.value} duration={2} />
                )}
              </span>
              <span className="mt-2 text-sm text-neutral-600">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12"
        >
          <Link href="/axiom/simulador">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-block rounded-xl bg-violet-600 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-violet-700"
            >
              Comenzar Simulador
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
