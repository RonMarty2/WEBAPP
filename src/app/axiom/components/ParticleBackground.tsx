"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  startX: number;
  startY: number;
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

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 5 : 12;
    const colors = [
      "rgba(139, 92, 246, 0.8)",
      "rgba(168, 85, 247, 0.7)",
      "rgba(147, 112, 219, 0.7)",
      "rgba(186, 85, 211, 0.6)",
      "rgba(123, 104, 238, 0.7)",
    ];

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const size = isMobile ? 120 + Math.random() * 100 : 250 + Math.random() * 200;
      const padding = size / 2;

      return {
        id: i,
        startX: padding + Math.random() * (vw - 2 * padding),
        startY: padding + Math.random() * (vh - 2 * padding),
        duration: 20 + Math.random() * 15,
        delay: Math.random() * 3,
        size: size,
        opacity: 0.65 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        moveX: (Math.random() - 0.5) * 80,
        moveY: (Math.random() - 0.5) * 120,
      };
    });

    setParticles(newParticles);
    console.log("✨ Particles rendered:", newParticles.length);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            x: particle.startX - particle.size / 2,
            y: particle.startY - particle.size / 2,
            background: particle.color,
            opacity: particle.opacity,
            filter: "blur(20px)",
          }}
          animate={{
            x: [particle.startX - particle.size / 2, particle.startX - particle.size / 2 + particle.moveX, particle.startX - particle.size / 2],
            y: [particle.startY - particle.size / 2, particle.startY - particle.size / 2 + particle.moveY, particle.startY - particle.size / 2],
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
