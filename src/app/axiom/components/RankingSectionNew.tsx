"use client";

import { motion } from "framer-motion";
import RankingCardNew from "./RankingCardNew";

interface RankingSectionNewProps {
  ranking: any[];
  currentUserId?: string;
}

export default function RankingSectionNew({
  ranking,
  currentUserId,
}: RankingSectionNewProps) {
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3, 10);

  if (ranking.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
      className="relative bg-neutral-50 px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4">
            <span className="text-5xl">🏆</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3">
            Top Simuladores
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Los mejores estudiantes del mes. ¿Puedes alcanzarlos?
          </p>
        </motion.div>

        {/* Top 3 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {top3.map((user, idx) => (
            <RankingCardNew
              key={user.id}
              user={user}
              position={(idx + 1) as 1 | 2 | 3}
              delay={0.1 + idx * 0.1}
            />
          ))}
        </div>

        {/* Rest of participants */}
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                — Participantes Aprobados —
              </p>
            </div>

            <div className="space-y-3">
              {rest.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white hover:border-violet-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    #{idx + 4}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 text-sm">{user.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-600">{user.nota}</p>
                    <p className="text-xs text-neutral-500">/100</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
