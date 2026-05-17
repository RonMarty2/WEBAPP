"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import HeroSectionNew from "./components/HeroSectionNew";
import RankingSectionNew from "./components/RankingSectionNew";
import QuickActionsNew from "./components/QuickActionsNew";
import StatsNew from "./components/StatsNew";
import CTANew from "./components/CTANew";

interface RankingItem {
  id: string;
  nombre: string;
  email: string;
  nota: number;
  racha?: number;
}

interface AuthUser {
  id: string;
  name: string;
  email?: string;
}

export default function AxiomLandingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

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
    <div className="axiom-page relative z-10 min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-none flex-col items-stretch">
        <Header user={user} />

        <main className="relative mx-auto flex w-full max-w-none flex-col items-stretch">
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
