"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTANew() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 px-6 py-32 lg:px-8"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-white/5 blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-5xl sm:text-6xl font-bold text-white mb-6"
        >
          ¿Listo para tu examen?
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-xl text-white/90 mb-10"
        >
          Tu siguiente simulador te espera. Practica ahora y obtén feedback instantáneo de IA que te ayudará a mejorar.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/axiom/simulador">
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 sm:px-14 py-5 rounded-xl bg-white text-violet-600 font-bold text-lg transition-all duration-300 hover:bg-gray-50 shadow-2xl hover:shadow-3xl"
            >
              Iniciar Simulador
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Secondary text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-white/80 text-sm"
        >
          O continúa tu progreso anterior. No hay límite de intentos.
        </motion.p>
      </div>
    </motion.section>
  );
}
