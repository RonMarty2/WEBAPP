"use client";

import { useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type Particle = {
  nx: number; ny: number; nz: number;  // unit-sphere Fibonacci position
  ph1: number;                         // random phase for organic variety
  baseSize: number;                    // base size multiplier
  spring: number;                      // per-particle spring (fluid smearing)
  damping: number;                     // per-particle damping
  x: number; y: number;                // live screen position
  vx: number; vy: number;              // velocity
  ready: boolean;
};

// ─── Tuning ──────────────────────────────────────────────────────────────────
const COUNT = 560;
const FOV   = 550;

const ROT_Y = 0.0015;
const ROT_X = 0.0008;

// Colours shift extremely slowly
const HUE_SPEED = 0.002; 

// ─── Fibonacci sphere ────────────────────────────────────────────────────────
function buildParticles(): Particle[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: COUNT }, (_, i) => {
    const ny = 1 - (i / (COUNT - 1)) * 2;
    const r  = Math.sqrt(Math.max(0, 1 - ny * ny));
    const th = golden * i;
    return {
      nx: Math.cos(th) * r,
      ny,
      nz: Math.sin(th) * r,
      ph1: Math.random() * Math.PI * 2,
      baseSize: 0.8 + Math.random() * 1.2,
      // Extremely slow spring and very high damping for dramatic fluid drag
      spring: 0.0015 + Math.random() * 0.0035, 
      damping: 0.93 + Math.random() * 0.05,
      x: 0, y: 0, vx: 0, vy: 0,
      ready: false,
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
  // 'Gravity Center' that smoothly follows mouse or wanders
  const gcRef     = useRef({ x: 0, y: 0, ready: false });
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
      parts.current.forEach(p => { p.ready = false; });
    }

    // ── Mouse ─────────────────────────────────────────────────────────────────
    let idleTimeout = 0;
    function onMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      window.clearTimeout(idleTimeout);
      // If mouse stops moving for 1.5 seconds, start wandering
      idleTimeout = window.setTimeout(() => {
        mouseRef.current.active = false;
      }, 1500);
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

      // ── Gravity Center ────────────────────────────────────────────────────
      // Where the fluid wants to converge.
      let targetX: number, targetY: number;
      if (m.active) {
        targetX = m.x;
        targetY = m.y;
      } else {
        // Slow Lissajous wandering exploring extreme edges of the viewport
        targetX = W * 0.5 + Math.sin(t * 0.0015) * (W * 0.45);
        targetY = H * 0.5 + Math.cos(t * 0.0011 + 1.2) * (H * 0.42);
      }

      // Smoothly move the gravity center itself (EXTREMELY SLOW for high latency drag)
      gc.x += (targetX - gc.x) * 0.008;
      gc.y += (targetY - gc.y) * 0.008;

      // ── Overall Breathing ─────────────────────────────────────────────────
      // The sphere grows and shrinks amorphously
      const globalBreathe = 1 + 0.25 * Math.sin(t * 0.015) + 0.15 * Math.sin(t * 0.008);
      // When mouse is active, the fluid "groups up" tighter
      const tightness = m.active ? 0.75 : 1.0; 
      const baseR = Math.max(200, Math.min(W, H) * 0.35) * globalBreathe * tightness;

      ctx.clearRect(0, 0, W, H);
      const canvasAlpha = scrollFadeRef.current;

      // ── Build draw commands ──────────────────────────────────────────────
      const cmds = parts.current.map(p => {
        // 1. Rotation
        const [rx, ry, rz] = rot3(
          p.nx * baseR, p.ny * baseR, p.nz * baseR,
          ro.y, ro.x,
        );

        // 2. Spatial Wave (La Ola)
        // Travels diagonally across the sphere, distorting shape and pulsing size
        const wavePhase = (ry + rz) * 0.015 - t * 0.04 + p.ph1 * 0.2;
        const wave = Math.sin(wavePhase);

        // Amorphous surface offset based on the wave
        const rOffset = 1 + wave * 0.25;
        const finalRx = rx * rOffset;
        const finalRy = ry * rOffset;
        const finalRz = rz * rOffset;

        // 3. Perspective
        const depth = finalRz + FOV;
        const sc    = FOV / depth;
        // Home position around the gravity center
        const hx    = gc.x + finalRx * sc;
        const hy    = gc.y + finalRy * sc;

        if (!p.ready) { p.x = hx; p.y = hy; p.ready = true; }

        // 4. Fluid Physics (Per-particle spring)
        // Because each particle has a different spring/damping, they smear
        // when `gc` moves fast, looking like a tearing fluid.
        p.vx += (hx - p.x) * p.spring;
        p.vy += (hy - p.y) * p.spring;
        p.vx *= p.damping;
        p.vy *= p.damping;
        p.x  += p.vx;
        p.y  += p.vy;

        // 5. Visual Size & Wave Pulse
        // The wave strongly affects particle size to make "la ola" visible
        const pulse = 1 + wave * 0.8; 
        const sizeK = pulse * sc * p.baseSize;

        // Stretch along velocity vector for fluid look
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const stretch = 1 + speed * 0.12; 

        const w = Math.max(0.5, Math.min(4.0, sizeK * 1.5 / stretch));
        const h = Math.max(2.0, Math.min(25.0, sizeK * 6.0 * stretch));

        // 6. Tangent / Velocity alignment
        const [tx, ty] = rot3(-p.nz, 0, p.nx, ro.y, ro.x);
        let dirX = tx;
        let dirY = ty;
        // Blend rotation towards velocity if moving fast (fluid streaks)
        if (speed > 0.5) {
          const vDirX = p.vx / speed;
          const vDirY = p.vy / speed;
          const blend = Math.min(1, (speed - 0.5) * 0.1);
          dirX = dirX * (1 - blend) + vDirX * blend;
          dirY = dirY * (1 - blend) + vDirY * blend;
        }
        const angle = Math.atan2(dirY, dirX);

        // 7. Depth and Color
        const zNorm   = (finalRz + baseR) / (baseR * 2);
        const alpha   = Math.min(0.95, 0.2 + zNorm * 0.7);

        const globalHue = (t * HUE_SPEED * (180 / Math.PI)) % 360;
        const hue       = (210 + globalHue + wave * 25 + p.ny * 40) % 360;
        const sat       = 70 + wave * 20;
        const lit       = 45 + zNorm * 15 + wave * 10;

        return {
          x: p.x, y: p.y, w, h, angle, alpha, sc,
          color: `hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${lit.toFixed(1)}%)`,
        };
      });

      // Depth sort
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
    // Use pointer events on document to ensure we catch movements correctly
    document.addEventListener("pointermove",  onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll",       onScroll, { passive: true });
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
