"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import HeroSectionNew from "./components/HeroSectionNew";
import RankingSectionNew from "./components/RankingSectionNew";
import QuickActionsNew from "./components/QuickActionsNew";
import StatsNew from "./components/StatsNew";
import CTANew from "./components/CTANew";
import ParticleBackground from "./components/ParticleBackground";

export default function AxiomLandingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

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
      }
    };

    loadData();
  }, []);

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.92) 100%)"
      }}
    >
      <ParticleBackground />
      {/* Header */}
      <div className="relative z-10">
        <Header user={user} />

      {/* Main content */}
      <main>
        {/* Hero Section - Premium */}
        <HeroSectionNew />

        {/* Ranking Section - Visual cards with real data */}
        <RankingSectionNew ranking={ranking} currentUserId={user?.id} />

        {/* Quick Actions - 2x2 grid with better styling */}
        <QuickActionsNew />

        {/* Stats Section - Large numbers */}
        <StatsNew />

        {/* Final CTA */}
        <CTANew />
      </main>
      </div>
    </div>
  );
}
