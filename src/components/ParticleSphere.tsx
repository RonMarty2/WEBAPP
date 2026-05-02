"use client";

import { useEffect, useRef } from "react";

type Particle = {
  nx: number;
  ny: number;
  nz: number;
  phase: number;
};

const COUNT = 190;
const ROT_Y = 0.00065;
const ROT_X = 0.00018;
const FOV = 520;

function buildParticles(): Particle[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: COUNT }, (_, i) => {
    const ny = 1 - (i / (COUNT - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - ny * ny));
    const theta = goldenAngle * i;

    return {
      nx: Math.cos(theta) * radius,
      ny,
      nz: Math.sin(theta) * radius,
      phase: i * 0.37,
    };
  });
}

function rotate3d(
  x: number,
  y: number,
  z: number,
  ry: number,
  rx: number,
): [number, number, number] {
  const x1 = x * Math.cos(ry) - z * Math.sin(ry);
  const z1 = x * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);

  return [x1, y2, z2];
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(buildParticles());
  const rafRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !ctx) return;

      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function tick() {
      if (!canvas || !ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cx = width / 2;
      const cy = height * 0.48;
      const radius = Math.min(Math.min(width, height) * 0.36, 360);
      const rotation = rotationRef.current;

      rotation.y += ROT_Y;
      rotation.x += ROT_X;
      rotation.t += 0.012;

      ctx.clearRect(0, 0, width, height);

      const commands = particlesRef.current.map((particle) => {
        const [rx, ry, rz] = rotate3d(
          particle.nx * radius,
          particle.ny * radius,
          particle.nz * radius,
          rotation.y,
          rotation.x,
        );
        const depth = rz + FOV;
        const scale = FOV / depth;
        const pulse = 0.82 + Math.sin(rotation.t + particle.phase) * 0.18;
        const zAlpha = Math.max(0.12, Math.min(1, (rz + radius) / (radius * 2)));

        return {
          x: cx + rx * scale,
          y: cy + ry * scale,
          r: Math.max(0.7, 1.25 * scale * pulse),
          alpha: Math.min(0.28, (0.08 + zAlpha * 0.2) * pulse),
          scale,
        };
      });

      commands.sort((a, b) => a.scale - b.scale);

      for (const dot of commands) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.alpha})`;
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
