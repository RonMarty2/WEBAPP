"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────
type Particle = {
  nx: number; ny: number; nz: number;  // 3D position inside the unit sphere
  tnx: number; tny: number; tnz: number; // Target 3D position for morphing
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
    } else if (shape === "neural") {
      // Red Neuronal - Clusters densos (nodos neuronales)
      // En lugar de calcular los centros por cada partícula, usamos una pseudo-semilla 
      // basada en el índice para crear consistencia en los clusters.
      const numCores = 8;
      const coreIndex = i % numCores;
      
      // Distribución pseudo-aleatoria consistente para los núcleos
      const phiCore = (coreIndex * 1.618) * Math.PI * 2;
      const thetaCore = Math.acos(2 * ((coreIndex + 0.5) / numCores) - 1);
      const rCore = 0.3 + 0.4 * ((coreIndex % 3) / 3);
      
      const cx = rCore * Math.sin(thetaCore) * Math.cos(phiCore);
      const cy = rCore * Math.sin(thetaCore) * Math.sin(phiCore);
      const cz = rCore * Math.cos(thetaCore);
      
      // 85% de las partículas forman los cúmulos, 15% simulan sinapsis vagando libremente
      if (Math.random() > 0.85) {
        const r = 0.9 * Math.cbrt(Math.random());
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        nx = r * Math.sin(ph) * Math.cos(th);
        ny = r * Math.sin(ph) * Math.sin(th);
        nz = r * Math.cos(ph);
      } else {
        const dist = 0.35 * Math.pow(Math.random(), 2); // Exponencial para centro denso
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        nx = cx + dist * Math.sin(ph) * Math.cos(th);
        ny = cy + dist * Math.sin(ph) * Math.sin(th);
        nz = cz + dist * Math.cos(ph);
      }
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
      tnx: nx, tny: ny, tnz: nz,
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
export default function ParticleSphere({ isPreview = false, previewConfig }: { isPreview?: boolean, previewConfig?: any }) {
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
    if (!isPreview) {
      window.dispatchEvent(new CustomEvent("ui_particle_route_change", { detail: pathname }));
    }
  }, [pathname, isPreview]);

  // Sync previewConfig prop → uiConfigRef so the canvas loop picks up live changes
  useEffect(() => {
    if (!isPreview || !previewConfig) return;
    const oldShape = uiConfigRef.current.shape;
    const oldDensity = uiConfigRef.current.density;
    uiConfigRef.current = {
      shape: previewConfig.shape ?? "sphere",
      palette: previewConfig.palette ?? "antigravity",
      wave: previewConfig.wave ?? "none",
      speed: typeof previewConfig.speed === "number" ? previewConfig.speed : 1.0,
      particleSize: typeof previewConfig.particleSize === "number" ? previewConfig.particleSize : 1.0,
      particleLength: typeof previewConfig.particleLength === "number" ? previewConfig.particleLength : 1.0,
      swarmSize: typeof previewConfig.swarmSize === "number" ? previewConfig.swarmSize : 1.0,
      density: typeof previewConfig.density === "number" ? previewConfig.density : 1000,
    };
    if (oldShape !== uiConfigRef.current.shape || oldDensity !== uiConfigRef.current.density) {
      const newTargets = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
      parts.current = newTargets.map((t, i) =>
        parts.current[i]
          ? { ...parts.current[i], tnx: t.nx, tny: t.ny, tnz: t.nz }
          : { ...t, nx: 0, ny: 0, nz: 0, tnx: t.nx, tny: t.ny, tnz: t.nz }
      );
    }
  }, [isPreview, previewConfig]);

  // ── Nucleus Morphing Cycle ────────────────────────────────────────────────
  useEffect(() => {
    let interval: number;
    if (pathname === "/nucleo") {
      const children = ["scribe", "axiom", "lumen", "mentor"];
      let currentIndex = -1;
      
      interval = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % children.length;
        const targetModule = children[currentIndex];
        
        const DEFAULTS: Record<string, any> = {
          scribe: { shape: "sphere", palette: "antigravity", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
          axiom: { shape: "cube", palette: "synthwave", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
          lumen: { shape: "dna", palette: "gold", wave: "ocean", speed: 0.8, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1200 },
          mentor: { shape: "torus", palette: "matrix", wave: "ocean", speed: 1.2, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 800 }
        };

        const storageKey = `ui_particle_config_${targetModule}`;
        const stored = localStorage.getItem(storageKey);
        let parsed = DEFAULTS[targetModule];
        if (stored) {
          try { parsed = { ...parsed, ...JSON.parse(stored) }; } catch(e){}
        }

        const oldShape = uiConfigRef.current.shape;
        const oldDensity = uiConfigRef.current.density;
        
        uiConfigRef.current = {
          shape: parsed.shape,
          palette: parsed.palette,
          wave: parsed.wave,
          speed: typeof parsed.speed === "number" ? parsed.speed : 1.0,
          particleSize: typeof parsed.particleSize === "number" ? parsed.particleSize : 1.0,
          particleLength: typeof parsed.particleLength === "number" ? parsed.particleLength : 1.0,
          swarmSize: typeof parsed.swarmSize === "number" ? parsed.swarmSize : 1.0,
          density: typeof parsed.density === "number" ? parsed.density : 1000
        };

        if (oldShape !== uiConfigRef.current.shape || oldDensity !== uiConfigRef.current.density) {
          const newTargets = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
          parts.current = newTargets.map((t, i) => {
            if (parts.current[i]) return { ...parts.current[i], tnx: t.nx, tny: t.ny, tnz: t.nz };
            return { ...t, nx: 0, ny: 0, nz: 0, tnx: t.nx, tny: t.ny, tnz: t.nz }; // New particles grow from center
          });
        }
      }, 8000); // Morph every 8 seconds
    }
    return () => { if (interval) window.clearInterval(interval); };
  }, [pathname, isPreview]);

  useEffect(() => {
    const loadConfig = (overridePathname?: string) => {
      try {
        const currentPath = typeof overridePathname === "string" ? overridePathname : pathname;
        let targetModule = "scribe";
        if (currentPath.startsWith("/admin")) targetModule = "admin";
        else if (currentPath.startsWith("/axiom")) targetModule = "axiom";
        else if (currentPath.startsWith("/lumen")) targetModule = "lumen";
        else if (currentPath.startsWith("/mentor")) targetModule = "mentor";
        else if (currentPath.startsWith("/nucleo")) targetModule = "nucleo";

        const DEFAULTS: Record<string, any> = {
          scribe: { shape: "sphere", palette: "antigravity", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
          axiom: { shape: "cube", palette: "synthwave", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
          lumen: { shape: "dna", palette: "gold", wave: "ocean", speed: 0.8, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1200 },
          mentor: { shape: "torus", palette: "matrix", wave: "ocean", speed: 1.2, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 800 },
          nucleo: { shape: "blackhole", palette: "antigravity", wave: "none", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1500 },
          admin: { shape: "blackhole", palette: "plasma", wave: "magnetic", speed: 0.8, particleSize: 1.2, particleLength: 1.5, swarmSize: 1.1, density: 1800 }
        };

        const storageKey = `ui_particle_config_${targetModule}`;
        const stored = localStorage.getItem(storageKey);
        
        let parsed = DEFAULTS[targetModule] || DEFAULTS["scribe"];
        if (stored) {
          try {
            const userConfig = JSON.parse(stored);
            parsed = { ...parsed, ...userConfig };
          } catch(e){}
        }

        const oldShape = uiConfigRef.current.shape;
        const oldDensity = uiConfigRef.current.density;
        
        uiConfigRef.current = {
          shape: parsed.shape,
          palette: parsed.palette,
          wave: parsed.wave,
          speed: typeof parsed.speed === "number" ? parsed.speed : 1.0,
          particleSize: typeof parsed.particleSize === "number" ? parsed.particleSize : (typeof parsed.size === "number" ? parsed.size : 1.0),
          particleLength: typeof parsed.particleLength === "number" ? parsed.particleLength : 1.0,
          swarmSize: typeof parsed.swarmSize === "number" ? parsed.swarmSize : 1.0,
          density: typeof parsed.density === "number" ? parsed.density : 1000
        };
        
        if (oldShape !== uiConfigRef.current.shape || oldDensity !== uiConfigRef.current.density) {
          const newTargets = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
          parts.current = newTargets.map((t, i) => {
            if (parts.current[i]) return { ...parts.current[i], tnx: t.nx, tny: t.ny, tnz: t.nz };
            return { ...t, nx: 0, ny: 0, nz: 0, tnx: t.nx, tny: t.ny, tnz: t.nz };
          });
        }
      } catch (e) {}
    };
    if (!isPreview) loadConfig();

    const handleRouteChange = (e: Event) => loadConfig((e as CustomEvent).detail);
    
    const handlePreview = (e: Event) => {
      try {
        const previewConfig = (e as CustomEvent).detail;
        if (!previewConfig) return;

        const oldShape = uiConfigRef.current.shape;
        const oldDensity = uiConfigRef.current.density;
        
        uiConfigRef.current = {
          shape: previewConfig.shape || "sphere",
          palette: previewConfig.palette || "antigravity",
          wave: previewConfig.wave || "none",
          speed: typeof previewConfig.speed === "number" ? previewConfig.speed : 1.0,
          particleSize: typeof previewConfig.particleSize === "number" ? previewConfig.particleSize : 1.0,
          particleLength: typeof previewConfig.particleLength === "number" ? previewConfig.particleLength : 1.0,
          swarmSize: typeof previewConfig.swarmSize === "number" ? previewConfig.swarmSize : 1.0,
          density: typeof previewConfig.density === "number" ? previewConfig.density : 1000
        };

        if (oldShape !== uiConfigRef.current.shape || oldDensity !== uiConfigRef.current.density) {
          const newTargets = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
          parts.current = newTargets.map((t, i) => {
            if (parts.current[i]) return { ...parts.current[i], tnx: t.nx, tny: t.ny, tnz: t.nz };
            return { ...t, nx: 0, ny: 0, nz: 0, tnx: t.nx, tny: t.ny, tnz: t.nz };
          });
        }
      } catch (e) {}
    };

    if (!isPreview) {
      window.addEventListener("ui_particle_update", loadConfig as unknown as EventListener);
      window.addEventListener("ui_particle_route_change", handleRouteChange);
      window.addEventListener("ui_particle_preview", handlePreview);
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      let w = window.innerWidth;
      let h = window.innerHeight;
      
      if (isPreview && canvas.parentElement) {
        w = canvas.parentElement.clientWidth;
        h = canvas.parentElement.clientHeight;
      }
      
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!gcRef.current.ready) {
        gcRef.current.x = w / 2;
        gcRef.current.y = h / 2;
        gcRef.current.ghostX = gcRef.current.x;
        gcRef.current.ghostY = gcRef.current.y;
        gcRef.current.ready = true;
      } else if (isPreview) {
        gcRef.current.x = w / 2;
        gcRef.current.y = h / 2;
        gcRef.current.ghostX = gcRef.current.x;
        gcRef.current.ghostY = gcRef.current.y;
      }
    }

    // ── Mouse ─────────────────────────────────────────────────────────────────
    let idleTimeout = 0;
    function onMove(e: PointerEvent) {
      if (isPreview) return; // Deshabilitar seguimiento de mouse en preview
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
      const W  = isPreview && canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      const H  = isPreview && canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      const m  = mouseRef.current;
      const gc = gcRef.current;
      const ro = rotRef.current;

      ro.y += ROT_Y;
      ro.x += ROT_X;

      // ── Gravity Center (Fluid Mass Target) ────────────────────────────────
      let rawTargetX: number, rawTargetY: number;
      if (m.active && !isPreview) {
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
      let baseR = Math.min(450, Math.max(240, scaleFactor)) * globalBreathe * mouseScale * uiConfigRef.current.swarmSize;
      
      if (isPreview) {
        // En preview, no forzamos mínimo de 240px, simplemente ocupamos un % del cuadrito
        baseR = Math.min(W, H) * 0.35 * globalBreathe * mouseScale * uiConfigRef.current.swarmSize;
      }

      ctx.clearRect(0, 0, W, H);
      
      // Full color everywhere
      const canvasAlpha = 1.0;

      // ── Build draw commands ──────────────────────────────────────────────
      const cmds = parts.current.map(p => {
        // 0. Liquid Morphing (Interpolation)
        if (p.tnx !== undefined) {
          p.nx += (p.tnx - p.nx) * 0.018 * uiConfigRef.current.speed;
          p.ny += (p.tny - p.ny) * 0.018 * uiConfigRef.current.speed;
          p.nz += (p.tnz - p.nz) * 0.018 * uiConfigRef.current.speed;
        }

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
      if (!isPreview) {
        window.removeEventListener("ui_particle_update", loadConfig as unknown as EventListener);
        window.removeEventListener("ui_particle_route_change", handleRouteChange);
        window.removeEventListener("ui_particle_preview", handlePreview);
      }
      window.clearTimeout(idleTimeout);
    };
  }, [isPreview]);

  useEffect(() => {
    if (isPreview && previewConfig) {
      const oldShape = uiConfigRef.current.shape;
      const oldDensity = uiConfigRef.current.density;
      
      uiConfigRef.current = {
        shape: previewConfig.shape || "sphere",
        palette: previewConfig.palette || "antigravity",
        wave: previewConfig.wave || "magnetic",
        speed: typeof previewConfig.speed === "number" ? previewConfig.speed : 1.0,
        particleSize: typeof previewConfig.particleSize === "number" ? previewConfig.particleSize : 1.0,
        particleLength: typeof previewConfig.particleLength === "number" ? previewConfig.particleLength : 1.0,
        swarmSize: typeof previewConfig.swarmSize === "number" ? previewConfig.swarmSize : 1.0,
        density: typeof previewConfig.density === "number" ? previewConfig.density : 1000
      };

      if (oldShape !== uiConfigRef.current.shape || oldDensity !== uiConfigRef.current.density) {
        const newTargets = buildParticles(uiConfigRef.current.shape, uiConfigRef.current.density);
        parts.current = newTargets.map((t, i) => {
          if (parts.current[i]) return { ...parts.current[i], tnx: t.nx, tny: t.ny, tnz: t.nz };
          return { ...t, nx: 0, ny: 0, nz: 0, tnx: t.nx, tny: t.ny, tnz: t.nz };
        });
      }
    }
  }, [isPreview, previewConfig]);

  return (
    <canvas
      className="antigravity-particles"
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: isPreview ? "absolute" : "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
