"use client";

import { useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Particle = {
  baseNx: number; baseNy: number; baseNz: number;  // 3D position inside the unit sphere
  rDist: number;                       // Distance from center (0 to 1)
  ph1: number;                         // Random phase for organic variety
  baseSize: number;                    // Base size multiplier
};

// ─── Tuning ──────────────────────────────────────────────────────────────────
const COUNT = 600;
const FOV   = 550;

const ROT_Y = 0.0010;
const ROT_X = 0.0005;

const HUE_SPEED = 0.002; 

// ─── Volumetric Sphere ───────────────────────────────────────────────────────
function buildParticles(): Particle[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: COUNT }, (_, i) => {
    // 1. Surface Fibonacci distribution (Perfectly ordered and symmetric)
    const ny = 1 - (i / (COUNT - 1)) * 2;
    const surfaceR = Math.sqrt(Math.max(0, 1 - ny * ny));
    const th = golden * i;
    
    // 2. Volume distribution
    // Pulls them closer to the center, creating a dense core symmetrically
    const rDist = Math.pow(Math.random(), 0.8);
    
    return {
      baseNx: Math.cos(th) * surfaceR * rDist,
      baseNy: ny * rDist,
      baseNz: Math.sin(th) * surfaceR * rDist,
      rDist,
      ph1: Math.random() * Math.PI * 2,
      baseSize: 0.8 + Math.random() * 1.5,
    };
  });
}

// ─── Rotation helpers ─────────────────────────────────────────────────────────
function rot3(
  x: number, y: number, z: number,
  ry: number, rx: number,
): [number, number, number] {
  const x1 =  x * Math.cos(ry) - z * Math.sin(ry);
  const z1 =  x * Math.sin(ry) + z * Math.cos(ry);
  const y2 =  y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 =  y * Math.sin(rx) + z1 * Math.cos(rx);
  return [x1, y2, z2];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parts     = useRef<Particle[]>(buildParticles());
  const raf       = useRef<number>(0);
  const rotRef    = useRef({ y: 0, x: 0 });
  const tRef      = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0, active: false });
  
  // Physics body for the entire fluid mass
  const gcRef     = useRef({ x: 0, y: 0, vx: 0, vy: 0, ready: false });
  const condenseRef = useRef(0);
  const scrollFadeRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = window.devicePixelRatio || 1;

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas || !ctx) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!gcRef.current.ready) {
        gcRef.current.x = window.innerWidth / 2;
        gcRef.current.y = window.innerHeight / 2;
        gcRef.current.ready = true;
      }
    }

    // ── Mouse ─────────────────────────────────────────────────────────────────
    let idleTimeout = 0;
    function onMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      window.clearTimeout(idleTimeout);
      // Start wandering if mouse is inactive for 2 seconds
      idleTimeout = window.setTimeout(() => {
        mouseRef.current.active = false;
      }, 2000);
    }
    function onLeave() { 
      mouseRef.current.active = false; 
      window.clearTimeout(idleTimeout);
    }

    // ── Scroll → fade canvas outside hero ─────────────────────────────────
    function onScroll() {
      const heroH = window.innerHeight;
      const s = window.scrollY;
      const fadeStart = heroH * 0.35;
      const fadeEnd   = heroH * 1.1;
      if (s <= fadeStart) {
        scrollFadeRef.current = 1;
      } else if (s >= fadeEnd) {
        scrollFadeRef.current = 0.08;
      } else {
        const t = (s - fadeStart) / (fadeEnd - fadeStart);
        scrollFadeRef.current = 1 - t * 0.92;
      }
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function tick() {
      if (!canvas || !ctx) return;

      const t  = ++tRef.current;
      const W  = window.innerWidth;
      const H  = window.innerHeight;
      const m  = mouseRef.current;
      const gc = gcRef.current;
      const ro = rotRef.current;

      ro.y += ROT_Y;
      ro.x += ROT_X;

      // ── Gravity Center (Fluid Mass Target) ────────────────────────────────
      let targetX: number, targetY: number;
      if (m.active) {
        targetX = m.x;
        targetY = m.y;
      } else {
        // Prominent Lissajous wandering exploring a large part of the screen
        targetX = W * 0.5 + Math.sin(t * 0.008) * (W * 0.35);
        targetY = H * 0.5 + Math.cos(t * 0.005 + 1.2) * (H * 0.30);
      }

      // Smooth physics for the entire mass - perfectly tracking the center
      gc.vx += (targetX - gc.x) * 0.015;
      gc.vy += (targetY - gc.y) * 0.015;
      gc.vx *= 0.88; // Friction
      gc.vy *= 0.88;
      gc.x += gc.vx;
      gc.y += gc.vy;

      // ── Dough Convergence ─────────────────────────────────────────────────
      // When mouse is active, symmetrically condense the sphere
      const targetCondense = m.active ? 1.0 : 0.0;
      condenseRef.current += (targetCondense - condenseRef.current) * 0.05;
      const condense = condenseRef.current;

      // Overall Breathing (perfectly symmetric scaling)
      const globalBreathe = 1 + 0.10 * Math.sin(t * 0.015);
      const baseR = Math.max(200, Math.min(W, H) * 0.40) * globalBreathe;

      ctx.clearRect(0, 0, W, H);
      const canvasAlpha = scrollFadeRef.current;

      // ── Build draw commands ──────────────────────────────────────────────
      const cmds = parts.current.map(p => {
        // Compress dough perfectly symmetrically towards center
        const pullFactor = 1.0 - (condense * 0.3);
        const nx = p.baseNx * pullFactor;
        const ny = p.baseNy * pullFactor;
        const nz = p.baseNz * pullFactor;

        // 1. Rotation
        const [rx, ry, rz] = rot3(
          nx * baseR, ny * baseR, nz * baseR,
          ro.y, ro.x,
        );

        // 2. Spatial Wave (La Ola)
        // Now it ONLY affects size and color, NOT the physical position.
        // This ensures the shape remains perfectly spherical and non-deformed.
        const wavePhase = (ry + rz) * 0.01 - t * 0.01 + p.ph1 * 0.1;
        const wave = Math.sin(wavePhase);

        // 3. Perspective
        const depth = rz + FOV;
        const sc    = FOV / depth;

        // Perfectly ordered positions around the center
        const hx = gc.x + rx * sc;
        const hy = gc.y + ry * sc;

        // 4. Visual Size
        const pulse = 1 + wave * 0.4; 
        const sizeK = pulse * sc * p.baseSize;

        const w = Math.max(0.6, Math.min(4.0, sizeK * 1.5));
        const h = Math.max(3.0, Math.min(22.0, sizeK * 6.0));

        // 5. Symmetric Orientation (Radial)
        // Point perfectly towards the center of gravity.
        // "si vienen de arriba entonces miran hacia abajo"
        const angle = Math.atan2(hy - gc.y, hx - gc.x) + Math.PI / 2;

        // 6. Depth and Color
        const zNorm   = (rz + baseR) / (baseR * 2);
        const alpha   = Math.min(0.92, 0.25 + zNorm * 0.75);

        const globalHue = (t * HUE_SPEED * (180 / Math.PI)) % 360;
        const hue       = (210 + globalHue + wave * 20 + p.baseNy * 30) % 360;
        const sat       = 75 + wave * 15;
        const lit       = 46 + zNorm * 18 + wave * 10;

        return {
          x: hx, y: hy, w, h, angle, alpha, sc,
          color: `hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${lit.toFixed(1)}%)`,
        };
      });

      // Depth sort (draw back to front)
      cmds.sort((a, b) => a.sc - b.sc);

      ctx.save();
      ctx.globalAlpha = canvasAlpha;

      for (const d of cmds) {
        ctx.save();
        ctx.globalAlpha = canvasAlpha * d.alpha;
        ctx.fillStyle   = d.color;
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-d.w / 2, -d.h / 2, d.w, d.h, Math.min(d.w / 2, 2));
        } else {
          ctx.rect(-d.w / 2, -d.h / 2, d.w, d.h);
        }
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      raf.current = requestAnimationFrame(tick);
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    resize();
    onScroll();
    window.addEventListener("resize",       resize);
    // Use pointer events on document to ensure we catch movements
    document.addEventListener("pointermove",  onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll",       onScroll, { passive: true });
    
    // Initial start to idle mode so it wanders immediately on load/mobile
    mouseRef.current.active = false;
    
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize",       resize);
      document.removeEventListener("pointermove",  onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll",       onScroll);
      window.clearTimeout(idleTimeout);
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
