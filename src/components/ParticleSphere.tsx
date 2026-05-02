"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────
type Particle = {
  nx: number; ny: number; nz: number;  // 3D position inside the unit sphere
  ph1: number;                         // Random phase for organic variety
  baseSize: number;                    // Base size multiplier
};

// ─── Tuning ──────────────────────────────────────────────────────────────────
const COUNT = 800; // Increased count for a lush point-cloud
const FOV   = 600;

const ROT_Y = 0.0015;
const ROT_X = 0.0008;

const HUE_SPEED = 0.002; 

// ─── Volumetric Sphere ───────────────────────────────────────────────────────
function buildParticles(): Particle[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: COUNT }, (_, i) => {
    // 1. Surface Fibonacci distribution
    const ny = 1 - (i / (COUNT - 1)) * 2;
    const surfaceR = Math.sqrt(Math.max(0, 1 - ny * ny));
    const th = golden * i;
    
    // 2. Thick shell distribution for a premium "nebula" feel
    // Not perfectly hollow, but not a solid dense core either.
    const shellDepth = 0.85 + Math.random() * 0.15;
    
    return {
      nx: Math.cos(th) * surfaceR * shellDepth,
      ny: ny * shellDepth,
      nz: Math.sin(th) * surfaceR * shellDepth,
      ph1: Math.random() * Math.PI * 2,
      baseSize: 0.8 + Math.random() * 1.2,
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
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parts     = useRef<Particle[]>(buildParticles());
  const raf       = useRef<number>(0);
  const rotRef    = useRef({ y: 0, x: 0 });
  const tRef      = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0, active: false });
  
  // Physics body for the entire point-cloud mass
  const gcRef     = useRef({ x: 0, y: 0, vx: 0, vy: 0, ready: false });
  const condenseRef = useRef(0);

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
      idleTimeout = window.setTimeout(() => {
        mouseRef.current.active = false;
      }, 2000);
    }
    function onLeave() { 
      mouseRef.current.active = false; 
      window.clearTimeout(idleTimeout);
    }

    // ── Scroll Parallax ───────────────────────────────────────────────────
    let lastScrollY = window.scrollY;
    function onScroll() {
      const s = window.scrollY;
      const delta = s - lastScrollY;
      lastScrollY = s;

      // Elastic Scroll Parallax: 
      // Instantly displace the sphere in the opposite direction of the scroll.
      // The physics engine will then smoothly glide it back to the viewport target.
      if (gcRef.current.ready) {
        gcRef.current.y -= delta;
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
        // Elegant wandering
        targetX = W * 0.5 + Math.sin(t * 0.005) * (W * 0.35);
        targetY = H * 0.5 + Math.cos(t * 0.003 + 1.2) * (H * 0.30);
      }

      // Smooth transition logic to prevent abrupt "snapping" when mouse enters
      const dx = targetX - gc.x;
      const dy = targetY - gc.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // We cap the pulling force. At large distances, it won't violently accelerate.
      const pullForce = Math.min(dist * 0.004, 1.5); 

      // Extremely smooth, high-inertia physics
      gc.vx += (dx / dist) * pullForce;
      gc.vy += (dy / dist) * pullForce;
      gc.vx *= 0.93; // Glossy friction (smooth gliding)
      gc.vy *= 0.93;
      gc.x += gc.vx;
      gc.y += gc.vy;

      // ── Condensation ──────────────────────────────────────────────────────
      // Shrink the sphere elegantly when the mouse interacts
      const targetCondense = m.active ? 1.0 : 0.0;
      // Much slower transition (0.015 instead of 0.05) so the change is harmonious
      condenseRef.current += (targetCondense - condenseRef.current) * 0.015;
      const condense = condenseRef.current;

      // Gentle organic breathing
      const globalBreathe = 1 + 0.08 * Math.sin(t * 0.015);
      // Condense by only 12% (instead of 25%) so it's a subtle, premium reaction
      const mouseScale = 1.0 - (condense * 0.12); 
      const baseR = Math.max(200, Math.min(W, H) * 0.40) * globalBreathe * mouseScale;

      ctx.clearRect(0, 0, W, H);
      
      // Full color on home page, subtle 25% opacity on all other pages
      const isHome = pathname === "/";
      const canvasAlpha = isHome ? 1.0 : 0.25;

      // ── Build draw commands ──────────────────────────────────────────────
      const cmds = parts.current.map(p => {
        // 1. Rotation
        const [rx, ry, rz] = rot3(
          p.nx * baseR, p.ny * baseR, p.nz * baseR,
          ro.y, ro.x,
        );

        // 2. Premium Light Scanner (La Ola)
        // Travels through the sphere acting purely as a light/size modifier, 
        // keeping the geometry perfectly spherical and flawless.
        const wavePhase = (ry + rz) * 0.01 - t * 0.02 + p.ph1 * 0.1;
        const wave = (Math.sin(wavePhase) + 1) * 0.5; // Normalized 0 to 1

        // 3. Perspective
        const depth = rz + FOV;
        const sc    = FOV / depth;

        // Perfectly rigid geometric alignment
        const hx = gc.x + rx * sc;
        const hy = gc.y + ry * sc;

        // 4. Visual Size (Swells beautifully when light hits them)
        // Scaled down to a third of the previous maximum size
        const sizeK = p.baseSize * sc * (1 + wave * 1.5) * 0.33;
        
        // Transform into delicate, small dashed lines
        const w = Math.max(0.6, sizeK * 1.5);
        const h = Math.max(1.5, sizeK * 6.0);

        // 5. Symmetric Orientation (Radial)
        // Point perfectly towards the center of gravity.
        // "si vienen de arriba entonces miran hacia abajo"
        const angle = Math.atan2(hy - gc.y, hx - gc.x) + Math.PI / 2;

        // 6. Stunning 3D Gradient & Depth Opacity
        const zNormFront = 1 - (rz + baseR) / (baseR * 2); // 1 = front, 0 = back
        const alpha = Math.min(0.95, 0.05 + zNormFront * 0.85 + wave * 0.15);

        const globalHue = (t * HUE_SPEED * (180 / Math.PI)) % 360;
        // Gradient from cyan/blue to deep purple mapping natively to 3D position
        const hue = (220 + globalHue + (p.nx + p.ny) * 35) % 360;
        
        // Softened saturation to avoid the "exaggerated neon" look (yellow/pink)
        const sat = 65 + wave * 15; 
        
        // Reduced lightness so it NEVER reaches white (which makes it disappear on light backgrounds)
        // Max lightness is now 65% instead of 90%
        const lit = 45 + zNormFront * 10 + wave * 10; 

        return {
          x: hx, y: hy, w, h, angle, alpha, sc,
          color: `hsla(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lit.toFixed(1)}%, ${alpha.toFixed(2)})`,
        };
      });

      // Depth sort (draw back to front for proper alpha blending)
      cmds.sort((a, b) => a.sc - b.sc);

      ctx.save();
      ctx.globalAlpha = canvasAlpha;

      // Draw flawlessly soft dashed lines (perfectly rounded pills)
      for (const d of cmds) {
        ctx.fillStyle = d.color;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);
        ctx.beginPath();
        if (ctx.roundRect) {
          // Use d.w / 2 for perfectly rounded pill-shaped caps
          ctx.roundRect(-d.w / 2, -d.h / 2, d.w, d.h, d.w / 2);
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
    document.addEventListener("pointermove",  onMove);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll",       onScroll, { passive: true });
    
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
