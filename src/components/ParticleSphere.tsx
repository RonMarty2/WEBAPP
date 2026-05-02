"use client";

import { useEffect, useRef } from "react";

type Particle = {
  nx: number;
  ny: number;
  nz: number;
  phase: number;
  width: number;
  height: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ready: boolean;
};

const COUNT = 560;
const ROT_Y = 0.00165;
const ROT_X = 0.00042;
const FOV = 540;
const SPRING = 0.055;
const DAMPING = 0.82;
const MOUSE_PULL = 0.58;
const MOUSE_REACH = 720;
const WAVE_SPEED = 0.030;

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
      phase: i * 0.23,
      width: 1.2 + Math.random() * 1.4,
      height: 5.5 + Math.random() * 5.5,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ready: false,
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
  const mouseRef = useRef({ x: -10000, y: -10000, active: false });

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
      particlesRef.current.forEach((particle) => {
        particle.ready = false;
      });
    }

    function onPointerMove(event: PointerEvent) {
      mouseRef.current = { x: event.clientX, y: event.clientY, active: true };
    }

    function onPointerLeave() {
      mouseRef.current.active = false;
    }

    function tick() {
      if (!canvas || !ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cx = width / 2;
      const cy = height * 0.48;
      const radius = Math.max(320, Math.min(Math.min(width, height) * 0.62, 620));
      const rotation = rotationRef.current;
      const mouse = mouseRef.current;

      rotation.y += ROT_Y;
      rotation.x += ROT_X;
      rotation.t += WAVE_SPEED;

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
        const homeX = cx + rx * scale;
        const homeY = cy + ry * scale;

        if (!particle.ready) {
          particle.x = homeX;
          particle.y = homeY;
          particle.ready = true;
        }

        let targetX = homeX;
        let targetY = homeY;
        let mouseInfluence = 0;
        let mouseDistance = 0;

        if (mouse.active) {
          const dx = mouse.x - homeX;
          const dy = mouse.y - homeY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          mouseDistance = dist;

          if (dist < MOUSE_REACH) {
            mouseInfluence = Math.pow(1 - dist / MOUSE_REACH, 2);
            const pull = mouseInfluence * MOUSE_PULL;
            targetX += dx * pull;
            targetY += dy * pull;
          }
        }

        particle.vx += (targetX - particle.x) * SPRING;
        particle.vy += (targetY - particle.y) * SPRING;
        particle.vx *= DAMPING;
        particle.vy *= DAMPING;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const wave = Math.sin(particle.ny * 6.2 + (rz / radius) * 1.4 - rotation.t * 3.25);
        const cursorWave = mouseInfluence
          ? Math.sin(mouseDistance * 0.055 - rotation.t * 7.5 + particle.phase * 0.08) * mouseInfluence
          : 0;
        const pulse = 0.62 + Math.max(0, wave) * 0.92 + Math.max(0, cursorWave) * 0.54;
        const zAlpha = Math.max(0, Math.min(1, (rz + radius) / (radius * 2)));
        const screenTopness = Math.max(0, Math.min(1, 1 - homeY / height));
        const hue = (222 + screenTopness * 166 + Math.sin(rotation.t * 0.72) * 18 + wave * 4) % 360;
        const saturation = 88 + Math.max(0, wave) * 10;
        const lightness = 48 + screenTopness * 5 + Math.max(0, wave) * 8;
        const [tx, ty] = rotate3d(
          -particle.nz * radius,
          0,
          particle.nx * radius,
          rotation.y,
          rotation.x,
        );

        return {
          x: particle.x,
          y: particle.y,
          width: Math.min(2.6, Math.max(0.75, particle.width * scale * pulse * (1 + mouseInfluence * 0.22))),
          height: Math.min(12.5, Math.max(3.1, particle.height * scale * pulse * (1 + mouseInfluence * 0.28))),
          angle: Math.atan2(ty, tx),
          alpha: Math.min(0.92, (0.12 + zAlpha * 0.58) * pulse + mouseInfluence * 0.18),
          color: `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%)`,
          scale,
        };
      });

      commands.sort((a, b) => a.scale - b.scale);

      for (const dash of commands) {
        ctx.save();
        ctx.globalAlpha = dash.alpha;
        ctx.fillStyle = dash.color;
        ctx.translate(dash.x, dash.y);
        ctx.rotate(dash.angle);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(
            -dash.width / 2,
            -dash.height / 2,
            dash.width,
            dash.height,
            Math.min(dash.width / 2, 2),
          );
        } else {
          ctx.rect(-dash.width / 2, -dash.height / 2, dash.width, dash.height);
        }
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      className="antigravity-particles"
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
