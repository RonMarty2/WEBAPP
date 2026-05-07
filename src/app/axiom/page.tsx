"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import Section from "./components/Section";
import ActionCard from "./components/ActionCard";
import RankingPodios from "./components/RankingPodios";

const actionItems = [
  {
    href: "/axiom/examenes",
    icon: "📚",
    title: "Base de Exámenes",
    description: "Accede a exámenes resueltos de años anteriores",
    accentColor: "rgb(59, 130, 246)",
  },
  {
    href: "/axiom/simulador",
    icon: "▶️",
    title: "Simulador",
    description: "Practica un examen completo en tiempo real",
    accentColor: "rgb(139, 92, 246)",
  },
  {
    href: "/axiom/progreso",
    icon: "📊",
    title: "Mi Progreso",
    description: "Revisa tu historial y mejoras en el tiempo",
    accentColor: "rgb(16, 185, 129)",
  },
  {
    href: "/axiom/progreso#plan",
    icon: "🎯",
    title: "Plan Personalizado",
    description: "Descubre tu ruta de preparación basada en IA",
    accentColor: "rgb(251, 146, 60)",
  },
];

export default function AxiomLandingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, rankingRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/axiom/ranking"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        if (rankingRes.ok) {
          const rankingData = await rankingRes.json();
          setRanking(rankingData.ranking || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header user={user} />

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Ranking Section */}
        <Section
          title="🏆 Top Simuladores"
          subtitle="Los mejores estudiantes del mes"
          delay={0.2}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-8"
          >
            <RankingPodios
              ranking={ranking}
              currentUserId={user?.id}
              soundEnabled={true}
            />
          </motion.div>
        </Section>

        {/* Actions Section */}
        <Section
          title="¿Qué quieres hacer?"
          subtitle="Elige cómo quieres prepararte hoy"
          delay={0.4}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {actionItems.map((item, index) => (
              <ActionCard
                key={item.href}
                {...item}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>
        </Section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="mt-16 rounded-xl border border-neutral-200 bg-gradient-to-r from-violet-50 to-blue-50 px-8 py-12 text-center"
        >
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            ¿Listo para tu examen?
          </h3>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Inicia un simulador ahora y recibe feedback automático basado en IA.
            Cada práctica te acerca más a tu meta.
          </p>
          <motion.a
            href="/axiom/simulador"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block rounded-lg bg-violet-600 px-8 py-3 font-semibold text-white transition-shadow hover:shadow-lg hover:bg-violet-700"
          >
            Comenzar Simulador
          </motion.a>
        </motion.section>
      </main>
    </div>
  );
}
