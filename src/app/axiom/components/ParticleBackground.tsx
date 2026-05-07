"use client";

export default function ParticleBackground() {
  console.log("🔴 ParticleBackground component rendering");

  // Array de 12 partículas con posiciones random
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 150 + Math.random() * 200,
  }));

  return (
    <>
      {/* Debug label */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "red",
          color: "white",
          padding: "10px 15px",
          zIndex: 99999,
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        🔴 PARTICLES: {particles.length}
      </div>

      {/* Particles background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "rgba(139, 92, 246, 0.6)",
              borderRadius: "50%",
              filter: "blur(20px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </>
  );
}
