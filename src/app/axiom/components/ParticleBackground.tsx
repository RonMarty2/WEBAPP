"use client";

import { motion } from "framer-motion";

export default function ParticleBackground() {
  // Array de 12 partículas con posiciones y colores random
  const particles = Array.from({ length: 12 }, (_, i) => {
    const colors = [
      "rgba(139, 92, 246, 0.75)",
      "rgba(168, 85, 247, 0.7)",
      "rgba(147, 112, 219, 0.7)",
      "rgba(186, 85, 211, 0.65)",
      "rgba(123, 104, 238, 0.7)",
    ];

    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 180 + Math.random() * 220,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 20 + Math.random() * 12,
      delay: Math.random() * 2,
    };
  });

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
