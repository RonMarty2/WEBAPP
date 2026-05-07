"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React from "react";

interface ActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
  borderColor: string;
  delay?: number;
}

function ActionCardNew({
  href,
  icon,
  title,
  description,
  colorClass,
  borderColor,
  delay = 0,
}: ActionProps) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.98 }}
          className={`group relative h-full overflow-hidden rounded-2xl border ${borderColor} ${colorClass} p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl`}
        >
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-violet-400"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "left" }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col">
            {/* Icon */}
            <motion.div
              className="mb-6 inline-flex w-fit rounded-xl p-3"
              whileHover={{ scale: 1.2, rotate: 6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-4xl">{icon}</span>
            </motion.div>

            {/* Title */}
            <h3 className="mb-3 text-2xl font-bold text-neutral-900 group-hover:text-violet-600 transition-colors duration-300">
              {title}
            </h3>

            {/* Description */}
            <p className="mb-6 flex-1 text-neutral-600 leading-relaxed text-base">
              {description}
            </p>

            {/* CTA */}
            <motion.div
              className="flex items-center gap-2 font-semibold text-violet-600"
              whileHover={{ gap: "12px" }}
              transition={{ duration: 0.2 }}
            >
              <span>Explorar</span>
              <motion.span
                className="text-2xl"
                whileHover={{ x: 6 }}
                transition={{ duration: 0.2 }}
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

const actions = [
  {
    href: "/axiom/examenes",
    icon: "📚",
    title: "Base de Exámenes",
    description: "Accede a exámenes resueltos de años anteriores y aprende de las mejores estrategias",
    colorClass: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    href: "/axiom/simulador",
    icon: "▶️",
    title: "Simulador UMSS",
    description: "Practica exámenes completos en tiempo real con feedback automático de IA",
    colorClass: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    href: "/axiom/progreso",
    icon: "📊",
    title: "Mi Progreso",
    description: "Visualiza tu evolución en el tiempo con gráficos y estadísticas detalladas",
    colorClass: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    href: "/axiom/progreso#plan",
    icon: "🎯",
    title: "Plan Personalizado",
    description: "Descubre tu ruta optimizada de preparación basada en IA y tu desempeño",
    colorClass: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];

export default function QuickActionsNew() {
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
        <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
          ¿Qué quieres hacer hoy?
        </h2>
        <p className="text-lg text-neutral-600">
          Elige tu camino hacia el éxito en el examen UMSS
        </p>
      </motion.div>

      {/* Grid 2x2 */}
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {actions.map((action, idx) => (
            <ActionCardNew
              key={action.href}
              {...action}
              delay={0.1 + idx * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
