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

const ROT_Y = 0.00075;
const ROT_X = 0.0004;

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
  const gcRef     = useRef({ x: 0, y: 0, vx: 0, vy: 0, ghostX: 0, ghostY: 0, ready: false });
  const condenseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!gcRef.current.ready) {
        gcRef.current.x = window.innerWidth / 2;
        gcRef.current.y = window.innerHeight / 2;
        gcRef.current.ghostX = gcRef.current.x;
        gcRef.current.ghostY = gcRef.current.y;
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
      // We clamp the delta and multiply by a fraction so it doesn't teleport violently on fast mobile swipes.
      if (gcRef.current.ready) {
        const clampedDelta = Math.max(-100, Math.min(100, delta));
        gcRef.current.y -= clampedDelta * 0.35;
        // Also displace the ghost target slightly so it follows the parallax gracefully
        gcRef.current.ghostY -= clampedDelta * 0.35;
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
      let rawTargetX: number, rawTargetY: number;
      if (m.active) {
        rawTargetX = m.x;
        rawTargetY = m.y;
      } else {
        // Elegant wandering (halved speed)
        rawTargetX = W * 0.5 + Math.sin(t * 0.0025) * (W * 0.35);
        rawTargetY = H * 0.5 + Math.cos(t * 0.0015 + 1.2) * (H * 0.30);
      }

      // The "Ghost Target" smoothly glides towards the raw target.
      // This absorbs any abrupt mathematical jumps (e.g. mouse entering from far away)
      gc.ghostX += (rawTargetX - gc.ghostX) * 0.025; 
      gc.ghostY += (rawTargetY - gc.ghostY) * 0.025;

      // ── Orbital Steering Behavior (Boids / Seeking) ───────────────────────
      const dx = gc.ghostX - gc.x;
      const dy = gc.ghostY - gc.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // 1. Velocidad de Crucero
      // La esfera no se detiene ni acelera como loca, mantiene una velocidad majestuosa.
      const MAX_SPEED = 4.0; 
      const desiredVx = (dx / dist) * MAX_SPEED;
      const desiredVy = (dy / dist) * MAX_SPEED;

      // 2. Fuerza de Giro (Steering)
      // La diferencia entre a dónde va y a dónde quiere ir.
      const steerX = desiredVx - gc.vx;
      const steerY = desiredVy - gc.vy;
      
      // Limitamos qué tan rápido puede "girar el volante". 
      // Un número muy bajo (0.05) crea curvas extremadamente amplias y rebases orbitales.
      const MAX_STEER = 0.05; 
      const steerDist = Math.sqrt(steerX * steerX + steerY * steerY) || 1;
      
      let appliedSteerX = steerX;
      let appliedSteerY = steerY;
      if (steerDist > MAX_STEER) {
        appliedSteerX = (steerX / steerDist) * MAX_STEER;
        appliedSteerY = (steerY / steerDist) * MAX_STEER;
      }

      // 3. Aplicar física
      gc.vx += appliedSteerX;
      gc.vy += appliedSteerY;

      // Asegurar que siempre viaje a su velocidad de crucero constante (no hay fricción de frenado)
      const currentSpeed = Math.sqrt(gc.vx * gc.vx + gc.vy * gc.vy) || 1;
      if (currentSpeed > MAX_SPEED) {
        gc.vx = (gc.vx / currentSpeed) * MAX_SPEED;
        gc.vy = (gc.vy / currentSpeed) * MAX_SPEED;
      }

      gc.x += gc.vx;
      gc.y += gc.vy;

      // ── Condensation ──────────────────────────────────────────────────────
      // Shrink the sphere elegantly when the mouse interacts
      const targetCondense = m.active ? 1.0 : 0.0;
      // Much slower transition (0.015 instead of 0.05) so the change is harmonious
      condenseRef.current += (targetCondense - condenseRef.current) * 0.015;
      const condense = condenseRef.current;

      // Gentle organic breathing (halved speed)
      const globalBreathe = 1 + 0.08 * Math.sin(t * 0.0075);
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

        // 2. Organic Amorphism (Subtle 3D Noise)
        // Normalized coordinates for consistent math
        const nrx = rx / baseR;
        const nry = ry / baseR;
        const nrz = rz / baseR;
        
        // Create an elegant, non-chaotic blob surface using low-frequency waves.
        // It bulges out by up to ~15% in different areas at different times (halved speed).
        const deform = 1.0 
          + 0.06 * Math.sin(nrx * 3.5 + t * 0.0075) 
          + 0.06 * Math.cos(nry * 2.8 - t * 0.006) 
          + 0.05 * Math.sin(nrz * 4.2 + t * 0.009);

        const finalRx = rx * deform;
        const finalRy = ry * deform;
        const finalRz = rz * deform;

        // 3. Premium Light Scanner (La Ola) - Halved speed
        const wavePhase = (finalRy + finalRz) * 0.01 - t * 0.01 + p.ph1 * 0.1;
        const wave = (Math.sin(wavePhase) + 1) * 0.5; // Normalized 0 to 1

        // 4. Perspective
        const depth = finalRz + FOV;
        const sc    = FOV / depth;

        // Perfectly rigid geometric alignment, but surface is gently bumpy
        const hx = gc.x + finalRx * sc;
        const hy = gc.y + finalRy * sc;

        // 5. Visual Size (Swells beautifully when light hits them)
        // Scaled down to a third of the previous maximum size
        const sizeK = p.baseSize * sc * (1 + wave * 1.5) * 0.33;
        
        // Transform into delicate, small dashed lines
        const w = Math.max(0.6, sizeK * 1.5);
        const h = Math.max(1.5, sizeK * 6.0);

        // 6. Symmetric Orientation (Radial)
        // Point perfectly towards the center of gravity.
        // "si vienen de arriba entonces miran hacia abajo"
        const angle = Math.atan2(hy - gc.y, hx - gc.x) + Math.PI / 2;

        // 7. Stunning 3D Gradient & Depth Opacity
        const zNormFront = 1 - (finalRz + baseR) / (baseR * 2); // 1 = front, 0 = back
        const alpha = Math.max(0, Math.min(0.95, 0.05 + zNormFront * 0.85 + wave * 0.15));

        const globalHue = (t * HUE_SPEED * (180 / Math.PI)) % 360;
        // Gradient from cyan/blue to deep purple mapping natively to 3D position
        const hue = (220 + globalHue + (p.nx + p.ny) * 35) % 360;
        
        // Base saturation and lightness
        let sat = 55 + wave * 15; 
        let lit = 45 + zNormFront * 10 + wave * 10; 

        // Perceptual color correction:
        // Yellows and Greens (hues ~40 to ~160) inherently look much brighter and more 
        // "neon" to the human eye. We specifically dim them so they match the elegance of the blues.
        if (hue > 40 && hue < 160) {
          sat *= 0.70; // 30% less saturated
          lit *= 0.85; // 15% darker
        }

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
