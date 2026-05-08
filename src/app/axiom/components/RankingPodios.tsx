"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RankingUser {
  id: string;
  nombre: string;
  email: string;
  nota: number;
  racha?: number;
}

interface RankingPodiosProps {
  ranking: RankingUser[];
  currentUserId?: string;
  soundEnabled?: boolean;
}

export default function RankingPodios({
  ranking,
  currentUserId,
  soundEnabled = true,
}: RankingPodiosProps) {
  const top3 = ranking.slice(0, 3);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }
    };
    window.addEventListener("click", initAudio, { once: true });
    return () => window.removeEventListener("click", initAudio);
  }, [audioContext]);

  const playSound = () => {
    if (!soundEnabled || !audioContext) return;

    const ctx = audioContext;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    // Whoosh + impact: frequency sweep
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      ctx.currentTime + 0.1
    );

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  };

  const handlePodiumClick = (userId: string) => {
    setAnimatingId(userId);
    playSound();
    setTimeout(() => setAnimatingId(null), 500);
  };

  const getPodiumHeight = (position: 0 | 1 | 2): number => {
    const heights = [350, 280, 200];
    return heights[position];
  };

  const getPodiumColor = (position: 0 | 1 | 2): string => {
    const colors = [
      "rgba(139, 92, 246, 1)", // Primary violeta
      "rgba(139, 92, 246, 0.7)",
      "rgba(139, 92, 246, 0.5)",
    ];
    return colors[position];
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;
  const getInitials = (nombre: string) =>
    nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (top3.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "#6b7280",
        }}
      >
        <p style={{ fontSize: "16px", margin: 0 }}>
          Sé el primero en publicar tu nota. Practica ahora.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        perspective: "1000px",
      }}
    >
      {/* Podios Container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "40px",
          minHeight: "400px",
          position: "relative",
        }}
      >
        {/* Posición 2 (Izquierda) */}
        {top3[1] && (
          <motion.div
            key={top3[1].id}
            onClick={() => handlePodiumClick(top3[1].id)}
            style={{
              cursor: "pointer",
              order: 1,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Podium
              position={1}
              user={top3[1]}
              isCurrentUser={isCurrentUser(top3[1].id)}
              isAnimating={animatingId === top3[1].id}
              height={getPodiumHeight(1)}
              color={getPodiumColor(1)}
              getInitials={getInitials}
            />
          </motion.div>
        )}

        {/* Posición 1 (Centro) */}
        {top3[0] && (
          <motion.div
            key={top3[0].id}
            onClick={() => handlePodiumClick(top3[0].id)}
            style={{
              cursor: "pointer",
              order: 2,
              zIndex: 10,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Podium
              position={0}
              user={top3[0]}
              isCurrentUser={isCurrentUser(top3[0].id)}
              isAnimating={animatingId === top3[0].id}
              height={getPodiumHeight(0)}
              color={getPodiumColor(0)}
              getInitials={getInitials}
            />
          </motion.div>
        )}

        {/* Posición 3 (Derecha) */}
        {top3[2] && (
          <motion.div
            key={top3[2].id}
            onClick={() => handlePodiumClick(top3[2].id)}
            style={{
              cursor: "pointer",
              order: 3,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Podium
              position={2}
              user={top3[2]}
              isCurrentUser={isCurrentUser(top3[2].id)}
              isAnimating={animatingId === top3[2].id}
              height={getPodiumHeight(2)}
              color={getPodiumColor(2)}
              getInitials={getInitials}
            />
          </motion.div>
        )}
      </div>

      {/* Escudos numerados flotantes (4+) */}
      <div
        style={{
          borderTop: "2px solid rgba(139, 92, 246, 0.1)",
          paddingTop: "32px",
          marginTop: "32px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "20px",
          }}
        >
          — PARTICIPANTES APROBADOS —
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {ranking.slice(3).map((student, idx) => (
            <div
              key={student.id}
              style={{
                background: "white",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                borderRadius: "8px",
                padding: "16px",
                transition: "all 200ms ease-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(139, 92, 246, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.15)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "rgb(139, 92, 246)",
                    fontSize: "14px",
                  }}
                >
                  {idx + 4}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {student.nombre}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {student.nota}/100
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Podium({
  position,
  user,
  isCurrentUser,
  isAnimating,
  height,
  color,
  getInitials,
}: {
  position: 0 | 1 | 2;
  user: RankingUser;
  isCurrentUser: boolean;
  isAnimating: boolean;
  height: number;
  color: string;
  getInitials: (name: string) => string;
}) {
  const podiumNumbers = ["1", "2", "3"];
  const badgeColors = [
    "rgba(249, 115, 22, 0.2)", // Orange
    "rgba(139, 92, 246, 0.2)", // Violet
    "rgba(10, 177, 129, 0.2)", // Green
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Shield Animation */}
      {isAnimating && (
        <motion.div
          initial={{ y: 0, scale: 0.8, opacity: 0, rotateY: 0 }}
          animate={{
            y: -30,
            scale: 1,
            opacity: 1,
            rotateY: 360,
          }}
          exit={{ y: 30, scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "80px",
            height: "80px",
            background: "radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: 800,
            color: "white",
            boxShadow: "0 0 30px rgba(249, 115, 22, 0.6)",
            zIndex: 20,
          }}
        >
          #{podiumNumbers[position]}
        </motion.div>
      )}

      {/* Podium Base */}
      <motion.div
        style={{
          width: "140px",
          height: height,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: "12px 12px 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "20px",
          position: "relative",
          border: `2px solid ${color}`,
          boxShadow: `0 8px 24px rgba(139, 92, 246, 0.2)`,
          cursor: "pointer",
        }}
        whileHover={{
          boxShadow: `0 12px 32px rgba(139, 92, 246, 0.3)`,
        }}
      >
        {/* Number Badge */}
        <div
          style={{
            position: "absolute",
            top: "-15px",
            width: "50px",
            height: "50px",
            background:
              position === 0
                ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                : position === 1
                  ? "linear-gradient(135deg, #e0e7ff, #c7d2fe)"
                  : "linear-gradient(135deg, #fecaca, #fca5a5)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 800,
            color: position === 0 ? "white" : position === 1 ? "#4c1d95" : "#7f1d1d",
            boxShadow: `0 4px 16px ${position === 0 ? "rgba(249, 115, 22, 0.4)" : position === 1 ? "rgba(139, 92, 246, 0.3)" : "rgba(220, 38, 38, 0.2)"}`,
          }}
        >
          {podiumNumbers[position]}
        </div>

        {/* User Info */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          {/* Initials Circle */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: isCurrentUser
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.15)",
              border: isCurrentUser
                ? "3px solid rgba(255, 215, 0, 0.8)"
                : "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 700,
              color: "white",
              margin: "0 auto 12px",
              boxShadow: isCurrentUser
                ? "0 0 16px rgba(255, 215, 0, 0.5)"
                : "none",
            }}
          >
            {getInitials(user.nombre)}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: isCurrentUser ? 700 : 600,
              color: "white",
              marginBottom: "6px",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.nombre}
            {isCurrentUser && " ✓"}
          </div>

          {/* Score */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "rgba(255, 255, 255, 1)",
            }}
          >
            {user.nota}/100
          </div>

          {/* Racha Badge */}
          {user.racha && user.racha > 1 && (
            <div
              style={{
                marginTop: "8px",
                display: "inline-block",
                background: badgeColors[position],
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 600,
                color: "white",
              }}
            >
              🔥 Racha x{user.racha}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
