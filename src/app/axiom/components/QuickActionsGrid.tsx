"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React from "react";

interface ActionItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  bgGradient: string;
  delay?: number;
}

function ActionItem({
  href,
  icon,
  title,
  description,
  accentColor,
  bgGradient,
  delay = 0,
}: ActionItemProps) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
    >
      <Link href={href}>
        <motion.div
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.98 }}
          className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-300 hover:border-neutral-300 hover:shadow-xl"
        >
          {/* Background gradient on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: bgGradient,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Icon container */}
            <motion.div
              className="mb-6 inline-flex w-fit rounded-xl p-4 transition-colors duration-300"
              style={{ backgroundColor: `${accentColor}15` }}
              whileHover={{ scale: 1.15, rotate: 6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-4xl">{icon}</span>
            </motion.div>

            {/* Title */}
            <h3 className="mb-2 text-2xl font-bold text-neutral-900 transition-colors duration-300 group-hover:text-neutral-950">
              {title}
            </h3>

            {/* Description */}
            <p className="mb-6 flex-1 text-base text-neutral-600 transition-colors duration-300 group-hover:text-neutral-700">
              {description}
            </p>

            {/* CTA Arrow */}
            <motion.div
              className="flex items-center gap-3 text-base font-semibold"
              style={{ color: accentColor }}
              whileHover={{ gap: "16px" }}
              transition={{ duration: 0.3 }}
            >
              <span>Explorar</span>
              <motion.span
                className="text-2xl"
                whileHover={{ x: 6 }}
                transition={{ duration: 0.3 }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

interface QuickActionsGridProps {
  actions?: Array<{
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    accentColor: string;
    bgGradient: string;
  }>;
}

export default function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  const defaultActions = [
    {
      href: "/axiom/examenes",
      icon: "📚",
      title: "Base de Exámenes",
      description: "Accede a exámenes resueltos de años anteriores y aprende de las mejores prácticas",
      accentColor: "rgb(59, 130, 246)",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)",
    },
    {
      href: "/axiom/simulador",
      icon: "▶️",
      title: "Simulador UMSS",
      description: "Practica con exámenes completos en tiempo real y obtén feedback inmediato",
      accentColor: "rgb(139, 92, 246)",
      bgGradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)",
    },
    {
      href: "/axiom/progreso",
      icon: "📊",
      title: "Mi Progreso",
      description: "Revisa tu historial completo y visualiza tu mejora en el tiempo",
      accentColor: "rgb(20, 184, 166)",
      bgGradient: "linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%)",
    },
    {
      href: "/axiom/progreso#plan",
      icon: "🎯",
      title: "Plan Personalizado",
      description: "Descubre tu ruta de preparación optimizada según tu desempeño con IA",
      accentColor: "rgb(251, 146, 60)",
      bgGradient: "linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, transparent 100%)",
    },
  ];

  const items = actions || defaultActions;

  return (
    <section className="relative bg-white px-6 py-24 lg:px-8">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto mb-16 max-w-5xl text-center"
      >
        <h2 className="text-4xl font-bold text-neutral-900 mb-4">
          ¿Qué quieres hacer hoy?
        </h2>
        <p className="text-lg text-neutral-600">
          Elige tu camino hacia el éxito en el examen UMSS
        </p>
      </motion.div>

      {/* Grid */}
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-8">
          {items.map((item, index) => (
            <ActionItem
              key={item.href}
              {...item}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
