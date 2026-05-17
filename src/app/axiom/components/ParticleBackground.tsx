"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "rgba(139, 92, 246, 0.8)",
  "rgba(168, 85, 247, 0.75)",
  "rgba(147, 112, 219, 0.75)",
  "rgba(186, 85, 211, 0.7)",
  "rgba(123, 104, 238, 0.75)",
];

function generarParticulas() {
  return Array.from({ length: 16 }, (_, i) => {
    const cols = 4;
    const rows = 4;
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Distribuir en grid 4x4 con variación random (solo una vez por mount).
    const baseX = (col / cols) * 100 + 12.5;
    const baseY = (row / rows) * 100 + 12.5;
    const x = baseX + (Math.random() - 0.5) * 20;
    const y = baseY + (Math.random() - 0.5) * 20;

    return {
      id: i,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      size: 150 + Math.random() * 200,
      color: COLORS[i % COLORS.length],
      duration: 18 + Math.random() * 14,
      delay: (i % 4) * 0.5,
    };
  });
}

export default function ParticleBackground() {
  // Lazy init: las partículas se generan UNA vez por mount, no en cada render.
  // Evita la regla react-hooks/purity (Math.random durante render).
  const [particles] = useState(generarParticulas);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            scale: 0.8,
          }}
          animate={{
            scale: [0.8, 1.1, 0.8],
            y: [0, -40, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(ellipse, ${p.color} 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(18px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
