/**
 * Generador de MOCKUPS visuales SIN IA.
 *
 * Cada función arma un SVG con el logo del alumno + paleta aplicada.
 * Cero costo en tokens. Resultado profesional y reproducible.
 *
 * Tipos de mockup soportados (más se pueden agregar):
 *   - tarjeta de presentación (frente)
 *   - post de Instagram (1:1)
 *   - empaque genérico (etiqueta cuadrada)
 *   - polo (silueta)
 *   - taza (silueta)
 *   - banner horizontal web
 *
 * Cada uno acepta { logoUrl, paleta, brief } y devuelve un data URI SVG
 * listo para guardar.
 */

import type { Mockup, TipoMockup, BriefMarca } from "@/types/identidad";

interface ContextoMockup {
  logoUrl: string;          // data URI o URL del logo
  paleta: {
    primario: string;
    secundario: string;
    acento: string;
    neutroClaro: string;
    neutroOscuro: string;
  };
  brief: Partial<BriefMarca>;
}

function envolverSvgComoDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ─── Mockup: Tarjeta de presentación ─────────────────────────────────────

function mockupTarjeta(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" width="900" height="540">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${paleta.neutroClaro}" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="900" height="540" fill="${paleta.neutroClaro}"/>
  <rect width="900" height="540" fill="url(#grid)"/>
  <!-- Tarjeta -->
  <rect x="100" y="100" width="700" height="380" rx="12" fill="white" stroke="${paleta.neutroOscuro}" stroke-width="1" stroke-opacity="0.1"/>
  <!-- Barra superior con primario -->
  <rect x="100" y="100" width="700" height="60" rx="12" fill="${paleta.primario}"/>
  <rect x="100" y="148" width="700" height="12" fill="${paleta.primario}"/>
  <!-- Nombre del negocio -->
  <text x="140" y="240" font-family="Inter, sans-serif" font-size="42" font-weight="800" fill="${paleta.neutroOscuro}">${escapar(nombre)}</text>
  <!-- Línea acento -->
  <rect x="140" y="270" width="80" height="4" fill="${paleta.acento}"/>
  <!-- Cargo / sector -->
  <text x="140" y="320" font-family="Inter, sans-serif" font-size="18" fill="${paleta.neutroOscuro}" opacity="0.7">${escapar(brief.sector || "Sector")}</text>
  <!-- Contacto placeholder -->
  <text x="140" y="400" font-family="Inter, sans-serif" font-size="14" fill="${paleta.neutroOscuro}" opacity="0.6">contacto@${slug(nombre)}.bo · +591 7XX XXX XX</text>
  <text x="140" y="425" font-family="Inter, sans-serif" font-size="14" fill="${paleta.neutroOscuro}" opacity="0.6">www.${slug(nombre)}.bo</text>
  <!-- Etiqueta de mockup -->
  <text x="450" y="525" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="${paleta.neutroOscuro}" opacity="0.4">MOCKUP · TARJETA DE PRESENTACIÓN</text>
</svg>`;
}

// ─── Mockup: Post de Instagram (1:1) ─────────────────────────────────────

function mockupRedes(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  const esencia = brief.esencia || "Tu propuesta de valor";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="540" height="540">
  <!-- Fondo principal -->
  <rect width="1080" height="1080" fill="${paleta.primario}"/>
  <!-- Forma decorativa con secundario -->
  <circle cx="900" cy="180" r="280" fill="${paleta.secundario}" opacity="0.35"/>
  <circle cx="180" cy="900" r="240" fill="${paleta.acento}" opacity="0.25"/>
  <!-- Nombre del negocio -->
  <text x="540" y="500" text-anchor="middle" font-family="Inter, sans-serif" font-size="92" font-weight="900" fill="white">${escapar(nombre)}</text>
  <!-- Subtítulo -->
  <text x="540" y="600" text-anchor="middle" font-family="Inter, sans-serif" font-size="32" fill="white" opacity="0.85">${escapar(truncar(esencia, 60))}</text>
  <!-- CTA -->
  <rect x="380" y="720" width="320" height="80" rx="40" fill="white"/>
  <text x="540" y="772" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="${paleta.primario}">Saber más →</text>
  <!-- Etiqueta de mockup -->
  <text x="540" y="1050" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="white" opacity="0.4">@${slug(nombre)} · MOCKUP IG</text>
</svg>`;
}

// ─── Mockup: Empaque (etiqueta cuadrada genérica) ────────────────────────

function mockupEmpaque(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="600" height="600">
  <!-- Fondo crema simulando producto -->
  <rect width="800" height="800" fill="#fafafa"/>
  <!-- "Empaque" -->
  <rect x="120" y="100" width="560" height="620" rx="8" fill="${paleta.neutroClaro}" stroke="${paleta.neutroOscuro}" stroke-opacity="0.15" stroke-width="2"/>
  <!-- Banda superior con primario -->
  <rect x="120" y="100" width="560" height="140" rx="8" fill="${paleta.primario}"/>
  <rect x="120" y="220" width="560" height="20" fill="${paleta.primario}"/>
  <!-- Nombre vertical centrado -->
  <text x="400" y="190" text-anchor="middle" font-family="Inter, sans-serif" font-size="52" font-weight="800" fill="white">${escapar(nombre)}</text>
  <!-- Área de producto -->
  <rect x="180" y="290" width="440" height="320" fill="white" stroke="${paleta.acento}" stroke-width="3"/>
  <text x="400" y="450" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" fill="${paleta.neutroOscuro}" opacity="0.55">${escapar(brief.sector || "Producto / Servicio")}</text>
  <text x="400" y="490" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="${paleta.neutroOscuro}" opacity="0.4">[contenido / descripción aquí]</text>
  <!-- Pie -->
  <rect x="120" y="650" width="560" height="70" rx="8" fill="${paleta.acento}"/>
  <text x="400" y="695" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" fill="white" font-weight="600">Hecho en Bolivia · www.${slug(nombre)}.bo</text>
  <!-- Etiqueta de mockup -->
  <text x="400" y="780" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="${paleta.neutroOscuro}" opacity="0.4">MOCKUP · EMPAQUE</text>
</svg>`;
}

// ─── Mockup: Polo (silueta) ──────────────────────────────────────────────

function mockupPolo(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="600" height="600">
  <rect width="800" height="800" fill="${paleta.neutroClaro}"/>
  <!-- Silueta de polo -->
  <path d="M 200 200
           L 280 160
           L 320 200
           Q 400 240, 480 200
           L 520 160
           L 600 200
           L 640 320
           L 580 340
           L 580 680
           L 220 680
           L 220 340
           L 160 320 Z"
        fill="${paleta.primario}" stroke="${paleta.neutroOscuro}" stroke-opacity="0.2" stroke-width="2"/>
  <!-- Cuello -->
  <path d="M 320 200 Q 400 260, 480 200" fill="none" stroke="${paleta.neutroOscuro}" stroke-opacity="0.3" stroke-width="3"/>
  <!-- Logo simulado en el pecho -->
  <circle cx="400" cy="420" r="65" fill="white" opacity="0.95"/>
  <text x="400" y="445" text-anchor="middle" font-family="Inter, sans-serif" font-size="38" font-weight="800" fill="${paleta.primario}">${escapar(nombre.charAt(0).toUpperCase())}</text>
  <!-- Etiqueta de mockup -->
  <text x="400" y="770" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="${paleta.neutroOscuro}" opacity="0.4">MOCKUP · POLO MERCH</text>
</svg>`;
}

// ─── Mockup: Taza (silueta) ──────────────────────────────────────────────

function mockupTaza(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="600" height="600">
  <rect width="800" height="800" fill="${paleta.neutroClaro}"/>
  <!-- Cuerpo de taza -->
  <rect x="230" y="220" width="340" height="380" rx="20" fill="white" stroke="${paleta.neutroOscuro}" stroke-opacity="0.25" stroke-width="3"/>
  <!-- Banda inferior con acento -->
  <rect x="230" y="540" width="340" height="60" fill="${paleta.acento}"/>
  <!-- Asa -->
  <path d="M 570 280 Q 680 280, 680 410 Q 680 540, 570 540" fill="none" stroke="${paleta.neutroOscuro}" stroke-opacity="0.25" stroke-width="6"/>
  <!-- Logo en el frente -->
  <circle cx="400" cy="400" r="80" fill="${paleta.primario}"/>
  <text x="400" y="430" text-anchor="middle" font-family="Inter, sans-serif" font-size="48" font-weight="800" fill="white">${escapar(nombre.charAt(0).toUpperCase())}</text>
  <!-- Sombra elíptica debajo -->
  <ellipse cx="430" cy="640" rx="200" ry="14" fill="${paleta.neutroOscuro}" opacity="0.1"/>
  <!-- Etiqueta de mockup -->
  <text x="400" y="780" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="${paleta.neutroOscuro}" opacity="0.4">MOCKUP · TAZA MERCH</text>
</svg>`;
}

// ─── Mockup: Banner web horizontal ───────────────────────────────────────

function mockupBanner(ctx: ContextoMockup): string {
  const { paleta, brief } = ctx;
  const nombre = brief.nombre || "Marca";
  const esencia = brief.esencia || "Tu propuesta de valor en una frase";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" width="800" height="300">
  <!-- Gradiente de fondo -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${paleta.primario}"/>
      <stop offset="100%" stop-color="${paleta.secundario}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="600" fill="url(#bgGrad)"/>
  <!-- Decoración -->
  <circle cx="1400" cy="120" r="180" fill="${paleta.acento}" opacity="0.5"/>
  <circle cx="1500" cy="450" r="120" fill="white" opacity="0.18"/>
  <!-- Contenido -->
  <text x="100" y="240" font-family="Inter, sans-serif" font-size="78" font-weight="900" fill="white">${escapar(nombre)}</text>
  <text x="100" y="320" font-family="Inter, sans-serif" font-size="32" fill="white" opacity="0.9">${escapar(truncar(esencia, 80))}</text>
  <rect x="100" y="380" width="240" height="72" rx="36" fill="white"/>
  <text x="220" y="426" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="${paleta.primario}">Saber más →</text>
  <!-- Etiqueta -->
  <text x="800" y="580" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" fill="white" opacity="0.55">MOCKUP · BANNER WEB 16:6</text>
</svg>`;
}

// ─── API pública ─────────────────────────────────────────────────────────

const GENERADORES: Record<TipoMockup, (ctx: ContextoMockup) => string> = {
  tarjeta:     mockupTarjeta,
  redes:       mockupRedes,
  empaque:     mockupEmpaque,
  merch_polo:  mockupPolo,
  merch_taza:  mockupTaza,
  merch_gorra: mockupTaza,  // placeholder; gorra usaría su propia silueta
  banner:      mockupBanner,
  libre:       mockupBanner, // fallback
};

/**
 * Genera un mockup del tipo solicitado y devuelve la entrada Mockup
 * lista para guardar en BD.
 */
export function generarMockup(tipo: TipoMockup, ctx: ContextoMockup): Mockup {
  const fn = GENERADORES[tipo];
  const svg = fn(ctx);
  return {
    tipo,
    url: envolverSvgComoDataUri(svg),
    descripcion: descripcionPorTipo(tipo, ctx.brief.nombre || "tu marca"),
    generado_en: new Date().toISOString(),
  };
}

/**
 * Genera el set completo de mockups (6 tipos). Útil para "Generar todos".
 */
export function generarMockupsCompletos(ctx: ContextoMockup): Mockup[] {
  const tipos: TipoMockup[] = ["tarjeta", "redes", "empaque", "merch_polo", "merch_taza", "banner"];
  return tipos.map((t) => generarMockup(t, ctx));
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncar(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max - 1).trim() + "…" : texto;
}

function slug(texto: string): string {
  return texto
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "marca";
}

function descripcionPorTipo(tipo: TipoMockup, nombre: string): string {
  switch (tipo) {
    case "tarjeta":     return `Tarjeta de presentación para ${nombre}`;
    case "redes":       return `Post de Instagram (1:1) para ${nombre}`;
    case "empaque":     return `Empaque de producto para ${nombre}`;
    case "merch_polo":  return `Polo de merchandising para ${nombre}`;
    case "merch_taza":  return `Taza de merchandising para ${nombre}`;
    case "merch_gorra": return `Gorra de merchandising para ${nombre}`;
    case "banner":      return `Banner web horizontal para ${nombre}`;
    case "libre":       return `Aplicación libre para ${nombre}`;
  }
}
