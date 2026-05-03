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
const FOV   = 600;

const ROT_Y = 0.0003;
const ROT_X = 0.00015;

const HUE_SPEED = 0.001; 

// ─── Volumetric Sphere ───────────────────────────────────────────────────────
function buildParticles(shape: string = "sphere", count: number = 1000): Particle[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    let nx = 0, ny = 0, nz = 0;
    
    if (shape === "torus") {
      const th = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const R = 0.7; 
      const r = 0.3 * Math.random(); 
      nx = (R + r * Math.cos(phi)) * Math.cos(th);
      nz = (R + r * Math.cos(phi)) * Math.sin(th);
      ny = r * Math.sin(phi);
    } else if (shape === "rings") {
      const th = Math.random() * Math.PI * 2;
      const r = 0.2 + 0.8 * Math.random(); 
      nx = Math.cos(th) * r;
      nz = Math.sin(th) * r;
      ny = (Math.random() - 0.5) * 0.05; 
    } else if (shape === "dna") {
      const t = i / count;
      const th = t * Math.PI * 8; 
      const r = 0.4;
      const strand = i % 2 === 0 ? 1 : -1;
      nx = Math.cos(th + (strand === 1 ? 0 : Math.PI)) * r;
      nz = Math.sin(th + (strand === 1 ? 0 : Math.PI)) * r;
      ny = (t - 0.5) * 2.0; 
      nx += (Math.random() - 0.5) * 0.15;
      nz += (Math.random() - 0.5) * 0.15;
      ny += (Math.random() - 0.5) * 0.15;
    } else if (shape === "cube") {
      // Cubo de Datos (Tesseract) - Las partículas se distribuyen en la superficie de un cubo
      nx = (Math.random() - 0.5) * 2;
      ny = (Math.random() - 0.5) * 2;
      nz = (Math.random() - 0.5) * 2;
      const max = Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz));
      // Proyectamos a los bordes del cubo y escalamos
      nx = (nx / max) * 0.7;
      ny = (ny / max) * 0.7;
      nz = (nz / max) * 0.7;
    } else if (shape === "blackhole") {
      // Agujero Negro - Centro muy denso y disco de acreción amplio
      const isDisk = Math.random() > 0.2; // 80% disco, 20% núcleo
      if (isDisk) {
        const th = Math.random() * Math.PI * 2;
        const r = 0.2 + 1.2 * (1 - Math.pow(Math.random(), 4)); // Expansión logarítmica
        nx = Math.cos(th) * r;
        nz = Math.sin(th) * r;
        ny = (Math.random() - 0.5) * 0.05 * r;
      } else {
        const nY = 1 - Math.random() * 2;
        const surfaceR = Math.sqrt(Math.max(0, 1 - nY * nY));
        const th = Math.random() * Math.PI * 2;
        const r = 0.18 * Math.pow(Math.random(), 0.5); // Núcleo denso
        nx = Math.cos(th) * surfaceR * r;
        ny = nY * r;
        nz = Math.sin(th) * surfaceR * r;
      }
    } else {
      const nY = 1 - (i / (count - 1)) * 2;
      const surfaceR = Math.sqrt(Math.max(0, 1 - nY * nY));
      const th = golden * i;
      const shellDepth = 0.85 + Math.random() * 0.15;
      nx = Math.cos(th) * surfaceR * shellDepth;
      ny = nY * shellDepth;
      nz = Math.sin(th) * surfaceR * shellDepth;
    }
    
    return {
      nx, ny, nz,
      ph1: Math.random() * Math.PI * 2,
      baseSize: 0.7 + Math.random() * 0.9,
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
  const parts     = useRef<Particle[]>(buildParticles("sphere"));
  const raf       = useRef<number>(0);
  const rotRef    = useRef({ y: 0, x: 0 });
  const tRef      = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0, active: false });
  
  // Physics body for the entire point-cloud mass
  const gcRef     = useRef({ x: 0, y: 0, vx: 0, vy: 0, ghostX: 0, ghostY: 0, ready: false });
  const condenseRef = useRef(0);
  const uiConfigRef = useRef({ shape: "sphere", palette: "antigravity", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 });

  useEffect(() => {
    const loadConfig = () => {
      try {
        const stored = localStorage.getItem("ui_particle_config");
        if (stored) {
          const parsed = JSON.parse(stored);
          const oldShape = uiConfigRef.current.shape;
          const oldDensity = uiConfigRef.current.density;
          
          uiConfigRef.current = {
            shape: parsed.shape || "sphere",
            palette: parsed.palette || "antigravity",
            wave: parsed.wave || "magnetic",
            speed: typeof parsed.speed === "number" ? parsed.speed : 1.0,
            particleSize: typeof parsed.particleSize === "number" ? parsed.particleSize : (typeof parsed.size === "number" ? parsed.size : 1.0),
            particleLength: typeof parsed.particleLength === "number" ? parsed.particleLength : 1.0,
            swarmSize: typeof parsed.swarmSize === "number" ? parsed.swarmSize : 1.0,
            density: typeof parsed.density === "number" ? parsed.density : 1000
          };
          
          if ((oldShape && oldShape !== uiConfigRef.current.shape) || (oldDensity && oldDensity !== uiConfigRef.current.density)) {
            parts.current = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
          }
        }
      } catch (e) {}
    };
    loadConfig();
    window.addEventListener("ui_particle_update", loadConfig);
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
        rawTargetX = W * 0.5 + Math.sin(t * 0.001) * (W * 0.35);
        rawTargetY = H * 0.5 + Math.cos(t * 0.0006 + 1.2) * (H * 0.30);
      }

      // ── Física de Fluido / Globo de Agua ──────────────────────────────────
      // Un "globo de agua" se siente pesado, se arrastra y nunca se detiene de golpe.
      // Usamos inercia pura en lugar de límites de velocidad estrictos que causan tirones.
      
      const dx = rawTargetX - gc.x;
      const dy = rawTargetY - gc.y;
      
      // Aceleración muy suave (simula el peso/masa del agua al arrastrarla)
      const waterMass = 0.0008; 
      // Fricción muy baja (hace que fluya y se deslice suavemente al frenar)
      const waterFriction = 0.94; 
      
      gc.vx += dx * waterMass;
      gc.vy += dy * waterMass;
      
      gc.vx *= waterFriction;
      gc.vy *= waterFriction;
      
      gc.x += gc.vx;
      gc.y += gc.vy;

      // ── Condensation ──────────────────────────────────────────────────────
      // Shrink the sphere elegantly when the mouse interacts
      const targetCondense = m.active ? 1.0 : 0.0;
      // Much slower transition (0.015 instead of 0.05) so the change is harmonious
      condenseRef.current += (targetCondense - condenseRef.current) * 0.008;
      const condense = condenseRef.current;

      // Gentle organic breathing (speed modified by UI config)
      const globalBreathe = 1 + 0.08 * Math.sin(t * 0.003 * uiConfigRef.current.speed);
      // Condense by only 12% (instead of 25%) so it's a subtle, premium reaction
      const mouseScale = 1.0 - (condense * 0.12); 
      // Limitamos el radio máximo para que en pantallas grandes (1080p+) no se desborde y mantenga forma de esfera
      const scaleFactor = Math.min(W, H) * 0.48;
      // Apply swarmSize from UI Config
      const baseR = Math.min(450, Math.max(240, scaleFactor)) * globalBreathe * mouseScale * uiConfigRef.current.swarmSize;

      ctx.clearRect(0, 0, W, H);
      
      // Full color everywhere
      const canvasAlpha = 1.0;

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
        
        // Deformación inercial (Globo de Agua)
        // Estira la esfera en la dirección del movimiento (squash & stretch)
        const stretchX = gc.vx * 0.06;
        const stretchY = gc.vy * 0.06;
        
        // Multiplicador direccional: Positivo en la dirección del movimiento (se alarga),
        // negativo en la dirección opuesta (se aplasta).
        const inertiaDeform = (nrx * stretchX) + (nry * stretchY);

        // Tambaleo de gelatina (Wobble) proporcional a la velocidad
        const speed = Math.sqrt(gc.vx * gc.vx + gc.vy * gc.vy);
        const wobble = Math.sin(t * 0.015) * speed * 0.015 * (nrz + nrx); 

        const deform = 1.0 
          + 0.06 * Math.sin(nrx * 3.5 + t * 0.003 * uiConfigRef.current.speed) 
          + 0.06 * Math.cos(nry * 2.8 - t * 0.002 * uiConfigRef.current.speed) 
          + 0.05 * Math.sin(nrz * 4.2 + t * 0.004 * uiConfigRef.current.speed)
          + inertiaDeform
          + wobble;

        const finalRx = rx * deform;
        const finalRy = ry * deform;
        const finalRz = rz * deform;

        // 3. Premium Light Scanner (La Ola) - Halved speed
        const wavePhase = (finalRy + finalRz) * 0.01 - t * 0.004 * uiConfigRef.current.speed + p.ph1 * 0.1;
        const wave = (Math.sin(wavePhase) + 1) * 0.5; // Normalized 0 to 1

        // 4. Perspective
        const depth = finalRz + FOV;
        const sc    = FOV / depth;

        let trailX = 0;
        let trailY = 0;
        
        if (uiConfigRef.current.wave === "magnetic") {
          // Efecto Ola Magnética (Desintegración y Agrupación)
          const dispersionFactor = Math.max(0, speed - 1.5) * 6.0; 
          if (dispersionFactor > 0) {
             const isLoose = Math.sin(p.ph1 * 12.5) > 0.4; 
             if (isLoose) {
               const lag = Math.abs(Math.cos(p.ph1 * 8.3)) * dispersionFactor; 
               trailX = -gc.vx * lag;
               trailY = -gc.vy * lag;
             }
          }
        } else if (uiConfigRef.current.wave === "ocean") {
          // Efecto Ola Continua (Océano)
          // Se aplica al finalRx y finalRy temporalmente para simular el desplazamiento
          const oceanWavePhase = (nrx + nry) * 4.0 - t * 0.025 * uiConfigRef.current.speed;
          const oceanWaveDeform = Math.pow(Math.sin(oceanWavePhase), 2) * 0.20; 
          trailX = finalRx * oceanWaveDeform * sc;
          trailY = finalRy * oceanWaveDeform * sc;
        }

        // Perfectly rigid geometric alignment, but surface is gently bumpy
        // And now particles can physically detach from the mesh (trailX, trailY)
        const hx = gc.x + finalRx * sc + trailX;
        const hy = gc.y + finalRy * sc + trailY;

        // 5. Visual Size (Swells beautifully when light hits them)
        // Scaled by UI config
        const sizeK = p.baseSize * sc * (1 + wave * 1.5) * 0.33 * uiConfigRef.current.particleSize;
        
        // Transform into delicate, small dashed lines
        const w = Math.max(0.6, sizeK * 1.5);
        const h = Math.max(1.5, sizeK * 6.0 * uiConfigRef.current.particleLength);

        // 6. Symmetric Orientation (Radial)
        // Point perfectly towards the center of gravity.
        // "si vienen de arriba entonces miran hacia abajo"
        const angle = Math.atan2(hy - gc.y, hx - gc.x) + Math.PI / 2;

        // 7. Stunning 3D Gradient & Depth Opacity
        const zNormFront = 1 - (finalRz + baseR) / (baseR * 2); // 1 = front, 0 = back
        const alpha = Math.max(0, Math.min(0.95, 0.05 + zNormFront * 0.85 + wave * 0.15));

        const globalHue = (t * HUE_SPEED * (180 / Math.PI)) % 360;
        let baseHue = 220; // antigravity default
        if (uiConfigRef.current.palette === "plasma") baseHue = 5; // Reds/Oranges
        else if (uiConfigRef.current.palette === "matrix") baseHue = 150; // Emerald/Teal
        else if (uiConfigRef.current.palette === "gold") baseHue = 35; // Yellow/Amber
        else if (uiConfigRef.current.palette === "synthwave") baseHue = 280; // Fuchsia/Cyan
        else if (uiConfigRef.current.palette === "blood") baseHue = 350; // Deep Red
        else if (uiConfigRef.current.palette === "toxic") baseHue = 90; // Lime Green
        
        const hue = (baseHue + globalHue + (p.nx + p.ny) * 35) % 360;
        
        // Base saturation and lightness
        let sat = 55 + wave * 15; 
        let lit = 45 + zNormFront * 10 + wave * 10; 

        if (uiConfigRef.current.palette === "monochrome") {
          sat = 0;
          lit = 50 + zNormFront * 30 + wave * 20;
        } else if (hue > 40 && hue < 160 && uiConfigRef.current.palette === "antigravity") {
          sat *= 0.70; 
          lit *= 0.85; 
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
        const r = d.w / 2;
        const h2 = Math.max(0, d.h / 2 - r); 
        ctx.arc(0, -h2, r, Math.PI, 0); // Top cap
        ctx.arc(0, h2, r, 0, Math.PI);  // Bottom cap
        ctx.closePath();
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
      window.removeEventListener("ui_particle_update", loadConfig);
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
