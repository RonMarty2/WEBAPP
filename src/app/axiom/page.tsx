"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import RankingSection from "./components/RankingSection";
import QuickActionsGrid from "./components/QuickActionsGrid";
import StatsSection from "./components/StatsSection";
import CTASection from "./components/CTASection";

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header user={user} />

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Ranking Section */}
        <RankingSection ranking={ranking} currentUserId={user?.id} />

        {/* Quick Actions Grid */}
        <QuickActionsGrid />

        {/* Stats Section */}
        {user && <StatsSection />}

        {/* Final CTA */}
        <CTASection />
      </main>
    </div>
  );
}
