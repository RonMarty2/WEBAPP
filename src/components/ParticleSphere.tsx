"use client";

import { useEffect, useRef } from "react";

// ─── TUNE THESE ──────────────────────────────────────────────────────────────
const N            = 380;    // particle count — more = denser field
const ROT_Y        = 0.0020; // base sphere rotation speed
const ROT_X        = 0.0005;
const SPHERE_R     = 0.52;   // larger → particles spread further across screen
const FOV          = 420;    // perspective focal length

// Wave effect — particles pulse in size as a traveling wave
const WAVE_SPD     = 0.00040;
const WAVE_AMP     = 0.58;
const WAVE_FY      = 2.7;
const WAVE_FT      = 1.15;

// 2-D physics — particles live in screen space, attracted to sphere + mouse
const K_SPRING     = 0.040;  // spring back to home position
const K_MOUSE      = 8.5;    // mouse gravity strength — higher = more pull
const MOUSE_REACH  = 450;    // how far mouse gravity reaches (px)
const DAMPING      = 0.87;   // velocity damping per frame

// Visual — tuned for dark background
const HUE_SPD      = 0.06;   // slower hue cycle — keeps colors in right range
const LIGHTNESS    = 70;     // % — bright enough for dark bg
const SATURATION   = 85;     // % saturation
const GLOW_BLUR    = 3;      // subtle glow, not too heavy
// ─────────────────────────────────────────────────────────────────────────────

interface Particle {
  // unit-sphere position
  nx: number; ny: number; nz: number; theta: number;
  // base size
  bw: number; bh: number;
  // 2D screen position (with physics)
  x: number; y: number;
  // 2D velocity
  vx: number; vy: number;
  // whether positioned yet
  ready: boolean;
}

function buildParticles(): Particle[] {
  const φ = Math.PI * (3 - Math.sqrt(5)); // golden angle
  return Array.from({ length: N }, (_, i) => {
    const ny    = 1 - (i / (N - 1)) * 2;
    const r     = Math.sqrt(Math.max(0, 1 - ny * ny));
    const theta = φ * i;
    return {
      nx: Math.cos(theta) * r,
      ny,
      nz: Math.sin(theta) * r,
      theta,
      bw: Math.random() * 1.1 + 1.0,   // bar width  ≈ 1.0–2.1
      bh: Math.random() * 5.0 + 6.0,   // bar height ≈ 6–11 (bigger for dark bg)
      x: 0, y: 0,
      vx: 0, vy: 0,
      ready: false,
    };
  });
}

function rot3(
  x: number, y: number, z: number, ry: number, rx: number,
): [number, number, number] {
  const x1 = x * Math.cos(ry) - z * Math.sin(ry);
  const z1 = x * Math.sin(ry) + z * Math.cos(ry);
  const y2 =  y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 =  y * Math.sin(rx) + z1 * Math.cos(rx);
  return [x1, y2, z2];
}

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef    = useRef<Particle[]>(buildParticles());
  const rotRef    = useRef({ ry: 0, rx: 0, hue: 220, wt: 0 });
  const mouseRef  = useRef({ x: -9999, y: -9999, on: false });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Force repositioning after resize
      ptsRef.current.forEach(p => { p.ready = false; });
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, on: true };
    }
    function onLeave() { mouseRef.current.on = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    // ─── Draw loop ────────────────────────────────────────────────────────
    function tick() {
      if (!canvas || !ctx) return;

      const W   = window.innerWidth;
      const H   = window.innerHeight;
      const cx  = W / 2;
      const cy  = H / 2;
      const R   = Math.min(W, H) * SPHERE_R;
      const rot = rotRef.current;
      const m   = mouseRef.current;

      ctx.clearRect(0, 0, W, H);

      rot.ry  += ROT_Y;
      rot.rx  += ROT_X;
      rot.hue += HUE_SPD;
      rot.wt  += WAVE_SPD;

      // ── Per-particle: compute sphere home → apply physics → render ──────
      type DrawCmd = {
        x: number; y: number; scale: number;
        w: number; h: number; angle: number;
        alpha: number; hue: number;
      };
      const cmds: DrawCmd[] = [];

      for (const p of ptsRef.current) {
        // ── 1. Sphere home position (3-D → 2-D) ──────────────────────────
        const [rx, ry, rz] = rot3(p.nx * R, p.ny * R, p.nz * R, rot.ry, rot.rx);
        const depth  = rz + FOV;
        const scale  = FOV / depth;
        const hx     = cx + rx * scale; // home x
        const hy     = cy + ry * scale; // home y

        // On first frame (or after resize) snap to home
        if (!p.ready) { p.x = hx; p.y = hy; p.ready = true; }

        // ── 2. Spring force → home ────────────────────────────────────────
        p.vx += (hx - p.x) * K_SPRING;
        p.vy += (hy - p.y) * K_SPRING;

        // ── 3. Mouse gravity ──────────────────────────────────────────────
        if (m.on) {
          const dx   = m.x - p.x;
          const dy   = m.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < MOUSE_REACH) {
            // Gravity falls off with distance²; strongest near cursor
            const f = K_MOUSE / (dist * dist) * (1 - dist / MOUSE_REACH);
            p.vx += dx * f;
            p.vy += dy * f;
          }
        }

        // ── 4. Integrate + damp ───────────────────────────────────────────
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        // ── 5. Wave effect — size pulse traveling across the sphere ────────
        const wavePhase  = p.ny * WAVE_FY + p.theta * WAVE_FT - rot.wt * Math.PI * 2;
        const wf         = Math.max(0.06, 0.42 + Math.sin(wavePhase) * WAVE_AMP);

        const w  = p.bw * scale * wf;
        const h  = p.bh * scale * wf;

        // ── 6. Opacity: perspective × wave — boosted for dark bg ──────────
        const alpha = Math.max(0.10, Math.min(0.98, scale * 1.1 * wf));

        // ── 7. Color: hue gradient by latitude (blue→violet→orange) ───────
        const baseHue = 220 + (p.ny + 1) * 0.5 * 190;
        const hue     = (baseHue + rot.hue) % 360;

        // ── 8. Bar angle: tangent to sphere surface ────────────────────────
        const [trx, try_] = rot3(-p.nz * R, 0, p.nx * R, rot.ry, rot.rx);
        const angle = Math.atan2(try_, trx);

        cmds.push({ x: p.x, y: p.y, scale, w, h, angle, alpha, hue });
      }

      // Painter's algorithm: back-to-front (smallest scale = furthest away)
      cmds.sort((a, b) => a.scale - b.scale);

      for (const c of cmds) {
        if (c.w < 0.3 || c.h < 0.3) continue;

        const fill = `hsl(${c.hue.toFixed(1)},${SATURATION}%,${LIGHTNESS}%)`;

        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle   = fill;
        ctx.shadowBlur  = GLOW_BLUR;
        ctx.shadowColor = fill;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);

        const hw = c.w / 2, hh = c.h / 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-hw, -hh, c.w, c.h, Math.min(hw, 1.5));
        } else {
          ctx.rect(-hw, -hh, c.w, c.h);
        }
        ctx.fill();
        // Reset shadow to avoid bleed across particles
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
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
