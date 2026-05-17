"use client";

import { motion } from "framer-motion";
import RankingPodios from "./RankingPodios";

interface RankingItem {
  id: string;
  nombre: string;
  email: string;
  nota: number;
  racha?: number;
}

interface RankingSectionProps {
  ranking: RankingItem[];
  currentUserId?: string;
}

export default function RankingSection({
  ranking,
  currentUserId,
}: RankingSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative px-6 py-24 lg:px-8"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold text-neutral-900 mb-3">
            🏆 Top Simuladores
          </h2>
          <p className="text-lg text-neutral-600">
            Los mejores estudiantes del mes. ¿Puedes alcanzarlos?
          </p>
        </motion.div>

        {/* Ranking container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/50 via-white to-blue-50/30 p-8 sm:p-12 backdrop-blur-sm"
        >
          <RankingPodios
            ranking={ranking}
            currentUserId={currentUserId}
            soundEnabled={true}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
