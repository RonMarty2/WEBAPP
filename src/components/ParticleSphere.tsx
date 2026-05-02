"use client";

import { useEffect, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const N         = 320;     // partículas
const FOV       = 400;     // distancia focal Google
const ROT_Y     = 0.003;   // rotación horizontal principal
const ROT_X     = 0.0008;  // inclinación vertical leve
const HUE_SPEED = 0.15;    // grados de hue por frame → ciclo ~40s

// Ola / wave — da el efecto de agrupado-desagrupado
const WAVE_SPEED = 0.00045;   // velocidad de propagación de la ola en el tiempo
const WAVE_AMP   = 0.58;      // amplitud (0.58 → partículas oscilan entre ×0.08 y ×1.58 de tamaño)
const WAVE_FREQ_Y     = 2.8;  // frecuencia de la ola en eje latitudinal (Y)
const WAVE_FREQ_THETA = 1.2;  // frecuencia en eje longitudinal (theta)

// ── Fibonacci Lattice en esfera → distribución uniforme igual que Google ──────
function buildParticles() {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.3999632
  return Array.from({ length: N }, (_, i) => {
    const y     = 1 - (i / (N - 1)) * 2;           // -1 (norte) → +1 (sur)
    const r     = Math.sqrt(Math.max(0, 1 - y * y)); // radio en plano XZ
    const theta = goldenAngle * i;

    return {
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      theta,                          // ángulo longitudinal propio
      // Tamaño base (pequeña variación aleatoria)
      bw: Math.random() * 0.8 + 0.9, // ancho base ≈ 1–1.7
      bh: Math.random() * 3.0 + 3.5, // alto  base ≈ 3.5–6.5
    };
  });
}

type P = ReturnType<typeof buildParticles>[0];

// ── Rotación 3D (Yaw luego Pitch) ─────────────────────────────────────────────
function rot3(x: number, y: number, z: number, ry: number, rx: number): [number, number, number] {
  // Yaw (eje Y)
  const x1 = x * Math.cos(ry) - z * Math.sin(ry);
  const z1 = x * Math.sin(ry) + z * Math.cos(ry);
  // Pitch (eje X)
  const y2 =  y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 =  y * Math.sin(rx) + z1 * Math.cos(rx);
  return [x1, y2, z2];
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptRef     = useRef<P[]>(buildParticles());
  const stateRef  = useRef({ rotY: 0, rotX: 0, hue: 220, waveT: 0 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Retina-ready resize ────────────────────────────────────────────────
    let dpr = window.devicePixelRatio || 1;
    function resize() {
      if (!canvas || !ctx) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Loop de animación ──────────────────────────────────────────────────
    function tick() {
      if (!canvas || !ctx) return;
      const W  = window.innerWidth;
      const H  = window.innerHeight;
      const cx = W * 0.5;
      const cy = H * 0.5;
      const R  = Math.min(W, H) * 0.46;

      ctx.clearRect(0, 0, W, H);

      // Avanzar estado
      const s = stateRef.current;
      s.rotY  += ROT_Y;
      s.rotX  += ROT_X;
      s.hue   += HUE_SPEED;
      s.waveT += WAVE_SPEED;

      // ── Proyectar todas las partículas ────────────────────────────────
      type Proj = {
        sx: number; sy: number; scale: number;
        w: number; h: number; angle: number;
        alpha: number; hue: number;
      };

      const out: Proj[] = ptRef.current.map((p) => {
        // Posición en el espacio
        const [rx, ry, rz] = rot3(p.x * R, p.y * R, p.z * R, s.rotY, s.rotX);

        // Perspectiva (FOV = 400, idéntico a Google)
        const depth  = rz + FOV;
        const scale  = FOV / depth;
        const sx     = cx + rx * scale;
        const sy     = cy + ry * scale;

        // ── Ola viajera que agrupa/desagrupa ──────────────────────────
        // La fase combina posición Y (latitud) + theta (longitud) + tiempo
        // → crea una onda que "viaja" por la superficie esférica
        // → regiones del frente se agrandan, otras se achican → efecto ola
        const wavePhase  = p.y * WAVE_FREQ_Y + p.theta * WAVE_FREQ_THETA - s.waveT * Math.PI * 2;
        const waveFactor = Math.max(0.06, 0.42 + Math.sin(wavePhase) * WAVE_AMP);
        // waveFactor oscila entre ~0.06 (casi invisible) y ~1.0 (tamaño completo)

        // Tamaño final = base × perspectiva × ola
        const w = p.bw * scale * waveFactor;
        const h = p.bh * scale * waveFactor;

        // Opacidad: perspectiva × ola (frente=opaco, fondo+ola=transparente)
        const alpha = Math.max(0.04, Math.min(0.95, scale * 0.88 * waveFactor));

        // ── Color: gradiente hue-rotante por posición Y (igual que Google) ──
        // y = -1 (norte): azul      hue ≈ 220
        // y =  0 (ecua.): morado    hue ≈ 270
        // y = +1 (sur):   naranja/rojo hue ≈ 410 % 360 = 50
        const baseHue = 220 + (p.y + 1) * 0.5 * 190; // 220 → 410
        const hue     = (baseHue + s.hue) % 360;

        // ── Ángulo tangente de la barra ──────────────────────────────
        const sinPhi = Math.sqrt(Math.max(0, 1 - p.y * p.y)) || 0.001;
        const [trx, try_] = rot3(
          -p.z * R,  // vector tangente en dirección theta
           0,
           p.x * R,
          s.rotY, s.rotX,
        );
        const angle = Math.atan2(try_, trx);

        return { sx, sy, scale, w, h, angle, alpha, hue };
      });

      // ── Painter's algorithm: fondo primero (por scale ascendente) ──────
      out.sort((a, b) => a.scale - b.scale);

      // ── Dibujar ────────────────────────────────────────────────────────
      for (const p of out) {
        if (p.w < 0.3 || p.h < 0.3) continue; // skip invisibles

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = `hsl(${p.hue.toFixed(1)}, 78%, 58%)`;
        ctx.translate(p.sx, p.sy);
        ctx.rotate(p.angle);

        const hw = p.w * 0.5;
        const hh = p.h * 0.5;

        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(-hw, -hh, p.w, p.h, Math.min(hw, 1.2));
          ctx.fill();
        } else {
          ctx.fillRect(-hw, -hh, p.w, p.h);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

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
        position:      "fixed",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
}
