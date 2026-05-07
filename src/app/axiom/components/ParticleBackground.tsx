"use client";

import { useEffect, useRef } from "react";
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
}

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const isMobileRef = useRef(false);

  useEffect(() => {
    // Detectar mobile
    isMobileRef.current = window.innerWidth < 768;

    // Generar partículas
    const particleCount = isMobileRef.current ? 5 : 12;
    const colors = [
      "rgba(139, 92, 246, 0.6)",   // Violeta principal
      "rgba(168, 85, 247, 0.5)",   // Violeta más oscuro
      "rgba(147, 112, 219, 0.5)",  // Violeta medio
      "rgba(186, 85, 211, 0.4)",   // Orchid
      "rgba(123, 104, 238, 0.5)",  // Medium Slate Blue
    ];

    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 20 + Math.random() * 20,
      delay: Math.random() * 5,
      size: isMobileRef.current ? 80 + Math.random() * 120 : 150 + Math.random() * 250,
      opacity: 0.5 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    particlesRef.current = particles;
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-3xl"
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
            x: [0, 50 - Math.random() * 100, 0],
            y: [0, 100 - Math.random() * 200, 0],
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
