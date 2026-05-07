"use client";

import { useEffect, useState } from "react";

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    console.log("🎯 ParticleBackground mounted");

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Crear partículas simples
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * vw,
      y: Math.random() * vh,
      size: 150 + Math.random() * 200,
    }));

    setParticles(newParticles);
    console.log("✨ Particles created:", newParticles.length, newParticles);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, background: "transparent" }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: `radial-gradient(ellipse, rgba(139, 92, 246, 0.7) 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(20px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Debug: mostrar número de partículas */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          color: "purple",
          fontSize: 12,
          background: "rgba(255,255,255,0.8)",
          padding: "5px 10px",
          borderRadius: "4px",
          zIndex: 9999,
        }}
      >
        Partículas: {particles.length}
      </div>
    </div>
  );
}
