"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  color: string;
  moveX: number;
  moveY: number;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Detectar mobile
    const isMobile = window.innerWidth < 768;

    // Generar partículas solo en cliente
    const particleCount = isMobile ? 5 : 12;
    const colors = [
      "rgba(139, 92, 246, 0.6)",
      "rgba(168, 85, 247, 0.5)",
      "rgba(147, 112, 219, 0.5)",
      "rgba(186, 85, 211, 0.4)",
      "rgba(123, 104, 238, 0.5)",
    ];

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 20,
      delay: Math.random() * 5,
      size: isMobile ? 80 + Math.random() * 120 : 150 + Math.random() * 250,
      opacity: 0.5 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      moveX: 50 - Math.random() * 100,
      moveY: 100 - Math.random() * 200,
    }));

    setParticles(newParticles);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: particle.color,
            opacity: particle.opacity,
            filter: "blur(25px)",
          }}
          animate={{
            x: [0, particle.moveX, 0],
            y: [0, particle.moveY, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
