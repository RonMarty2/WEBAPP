"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 px-6 py-32 lg:px-8"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white/10"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -left-40 -bottom-40 h-80 w-80 rounded-full bg-white/5"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white sm:text-5xl"
        >
          ¿Listo para tu examen?
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mx-auto mt-6 max-w-2xl text-xl text-white/90"
        >
          Tu siguiente simulador te espera. Practica ahora y obtén feedback inmediato de IA.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <Link href="/axiom/simulador">
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-block rounded-xl bg-white px-10 py-4 text-lg font-semibold text-violet-600 transition-all duration-300 hover:bg-gray-50 hover:text-violet-700 shadow-xl"
            >
              Iniciar Ahora
            </motion.button>
          </Link>
        </motion.div>

        {/* Secondary text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-sm text-white/80"
        >
          O continúa tu progreso anterior. No hay límite de intentos.
        </motion.p>
      </div>
    </motion.section>
  );
}
