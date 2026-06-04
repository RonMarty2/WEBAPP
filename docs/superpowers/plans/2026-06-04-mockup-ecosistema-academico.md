# Mockup Navegable — Ecosistema Laboratorio Académico PRO

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un mockup navegable end-to-end del ecosistema "Laboratorio Académico PRO" — 4 plataformas educativas (Finanzas, Investigación de Mercados, Estrategia, Marketing) + Generador de proyectos UMSS/UNIFRANZ, con Hub Central SSO — para validar UX, pedagogía y modelo de negocio ANTES de construir lógica real.

**Architecture:** "Dos Mundos" — Universidad (plataformas educativas) ⇄ Generador (tesis/proyectos). El estudiante aprende en las plataformas, luego decide si lleva su trabajo al Generador para consolidarlo en un documento académico con IA. Todo el mockup vive en `src/app/ecosistema/*` aislado del generador actual; usa datos hardcoded en `src/lib/ecosistema/mock-data.ts` y estado simulado vía Context Provider + localStorage. NINGUNA API route real se modifica.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript estricto · Tailwind CSS 4 · Framer Motion 12 · zero dependencias nuevas

**Copy:** Español neutro con tuteo. NUNCA voseo argentino ("sabés", "podés", "tenés", "querés"). Verificar cada string contra esta regla — el usuario lo considera bloqueante.

**Restricciones inviolables:**
- ❌ No tocar `src/lib/prompts/*`, `src/lib/db/*`, `src/lib/aiProvider.ts`, `src/app/api/*`
- ❌ No tocar rutas existentes (`/projects`, `/admin`, `/axiom`, `/scribe`, etc.)
- ❌ No agregar dependencias nuevas a `package.json`
- ✅ Reusar `tailwind.config`, fonts, helpers existentes (`src/lib/utils.ts` si existe)
- ✅ Todo el mockup borrable eliminando `src/app/ecosistema/` y `src/lib/ecosistema/` + `src/components/ecosistema/`

---

## Decisiones Macro Confirmadas con el Usuario

| Decisión | Elección |
|---|---|
| **Plataformas v1** | Finanzas (existe como `simuladorPRO`) + Investigación de Mercados + Estrategia Empresarial + Marketing Digital |
| **Identidad** | Hub Central SSO (una cuenta para todo el ecosistema) — en el mockup, simulado con localStorage |
| **Arquitectura** | "Dos Mundos" — Universidad y Generador como mundos paralelos, conexión opcional pero potente |
| **Punto de partida** | Mockup navegable completo (sin lógica real) — este plan |

---

## File Structure

### Rutas del mockup (todo nuevo, todo aislado)

```
src/app/ecosistema/
├── layout.tsx                                ← Layout root del ecosistema (provider, fonts, fondo)
├── page.tsx                                  ← Landing pública del ecosistema
├── login/
│   └── page.tsx                              ← Hub Central SSO mockup
├── universidad/
│   ├── page.tsx                              ← Hub de las 4 plataformas
│   ├── finanzas/
│   │   └── page.tsx                          ← Preview de simuladorPRO + CTA
│   ├── mercados/
│   │   ├── layout.tsx                        ← Sidebar específico de la plataforma
│   │   ├── page.tsx                          ← Dashboard de la plataforma
│   │   ├── clases/page.tsx                   ← Clases interactivas
│   │   ├── muestreo/page.tsx                 ← Calculadora de muestreo
│   │   ├── encuesta/page.tsx                 ← Diseñador de encuesta
│   │   └── resultados/page.tsx               ← Tabulación + gráficos pgfplots-style
│   ├── estrategia/
│   │   └── page.tsx                          ← Wizard PESTEL → Porter → MEFE/MEFI → FODA
│   └── marketing/
│       └── page.tsx                          ← Wizard 4Ps/7Ps + plan digital
└── generador/
    ├── page.tsx                              ← Landing del Generador (Mundo 2)
    ├── wizard/page.tsx                       ← Wizard: ¿importas o empiezas de cero?
    ├── workspace/page.tsx                    ← Workspace por fases (preview UNIFRANZ)
    └── consolidar/page.tsx                   ← Consolidación con IA simulada
```

### Librerías de soporte del mockup

```
src/lib/ecosistema/
├── mock-data.ts                              ← Datos seed centralizados (estudiante, encuesta, finanzas, etc.)
├── mock-auth.ts                              ← Funciones SSO simulado (login/logout/getUser)
├── mock-state.tsx                            ← React Context + localStorage provider
└── platforms.ts                              ← Catálogo de plataformas (metadata, rutas, iconos)
```

### Componentes compartidos

```
src/components/ecosistema/
├── EcosystemNav.tsx                          ← Top nav del ecosistema (logo + perfil + cambio de plataforma)
├── PlatformCard.tsx                          ← Card visual de cada plataforma
├── PlatformShell.tsx                         ← Layout interno de plataforma (sidebar + main)
├── ProgressTracker.tsx                       ← Barra de progreso del aprendizaje
├── PricingCard.tsx                           ← Card de pricing reutilizable
├── ClaseInteractiva.tsx                      ← Componente de clase con quiz
├── ResultadoBlock.tsx                        ← Bloque que muestra "lo que el estudiante construyó"
└── IAConsolidacionPreview.tsx                ← Animación simulando IA consolidando documento
```

### Tipos compartidos (al final de `src/lib/ecosistema/mock-data.ts`)

```typescript
export type PlatformId = 'finanzas' | 'mercados' | 'estrategia' | 'marketing';

export interface MockUser {
  id: string;
  nombre: string;
  email: string;
  avatar: string;
  universidad?: 'UMSS' | 'UNIFRANZ' | null;
  carrera?: string;
  rol: 'estudiante' | 'emprendedor' | 'docente';
}

export interface MockProgreso {
  platformId: PlatformId;
  porcentaje: number;
  ultimaClase: string;
  artefactos: MockArtefacto[];
}

export interface MockArtefacto {
  id: string;
  tipo: 'simulacion-financiera' | 'estudio-mercado' | 'pestel' | 'porter' | 'foda' | 'plan-marketing';
  titulo: string;
  preview: string;
  fechaCreacion: string;
  contenido: Record<string, unknown>;
}

export interface MockProyecto {
  id: string;
  titulo: string;
  modalidad: 'monografia' | 'tesis' | 'proy-grado';
  universidad: 'UMSS' | 'UNIFRANZ';
  fases: MockFase[];
  artefactosImportados: string[];
}

export interface MockFase {
  id: string;
  numero: string;
  titulo: string;
  estado: 'pendiente' | 'en-progreso' | 'completada';
  fuenteArtefacto?: string;
  contenidoPreview?: string;
}
```

---

## Tarea 1: Bootstrap — estructura base + provider + datos mock

**Files:**
- Create: `src/lib/ecosistema/mock-data.ts`
- Create: `src/lib/ecosistema/mock-auth.ts`
- Create: `src/lib/ecosistema/mock-state.tsx`
- Create: `src/lib/ecosistema/platforms.ts`
- Create: `src/app/ecosistema/layout.tsx`
- Create: `src/components/ecosistema/EcosystemNav.tsx`

### Paso 1.1 — Crear catálogo de plataformas

- [ ] Crear `src/lib/ecosistema/platforms.ts` con metadata de las 4 plataformas + el Generador.

```typescript
import type { PlatformId } from './mock-data';

export interface PlatformMeta {
  id: PlatformId | 'generador';
  nombre: string;
  tagline: string;
  descripcionCorta: string;
  color: string;
  colorAccent: string;
  icono: string;
  ruta: string;
  mundo: 'universidad' | 'generador';
  precioStandalone: number;
  precioBundle: number;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: 'finanzas',
    nombre: 'Finanzas para Emprendedores',
    tagline: 'Aprende a leer un proyecto antes de invertir',
    descripcionCorta: 'VAN, TIR, B/C, sensibilidad y flujo de caja como los hacen las consultoras.',
    color: 'emerald',
    colorAccent: '#10b981',
    icono: 'TrendingUp',
    ruta: '/ecosistema/universidad/finanzas',
    mundo: 'universidad',
    precioStandalone: 49,
    precioBundle: 0,
  },
  {
    id: 'mercados',
    nombre: 'Investigación de Mercados',
    tagline: 'Datos reales. Decisiones reales.',
    descripcionCorta: 'Muestreo, encuestas, tabulación y análisis con APIs de Google Trends, Meta y TikTok.',
    color: 'sky',
    colorAccent: '#0ea5e9',
    icono: 'Compass',
    ruta: '/ecosistema/universidad/mercados',
    mundo: 'universidad',
    precioStandalone: 79,
    precioBundle: 0,
  },
  {
    id: 'estrategia',
    nombre: 'Estrategia Empresarial',
    tagline: 'Del análisis a la acción',
    descripcionCorta: 'PESTEL, Porter, MEFE/MEFI y FODA cruzada con scoring guiado.',
    color: 'violet',
    colorAccent: '#8b5cf6',
    icono: 'Target',
    ruta: '/ecosistema/universidad/estrategia',
    mundo: 'universidad',
    precioStandalone: 49,
    precioBundle: 0,
  },
  {
    id: 'marketing',
    nombre: 'Marketing Digital',
    tagline: 'Tu plan, con números reales',
    descripcionCorta: '4Ps/7Ps, segmentación con datos Meta Ads, presupuesto y calendario editorial.',
    color: 'rose',
    colorAccent: '#f43f5e',
    icono: 'Megaphone',
    ruta: '/ecosistema/universidad/marketing',
    mundo: 'universidad',
    precioStandalone: 49,
    precioBundle: 0,
  },
  {
    id: 'generador',
    nombre: 'Generador de Proyectos',
    tagline: 'Tu tesis con tus datos, no con datos inventados',
    descripcionCorta: 'Importa lo que aprendiste y trabajaste. La IA solo consolida.',
    color: 'amber',
    colorAccent: '#f59e0b',
    icono: 'FileText',
    ruta: '/ecosistema/generador',
    mundo: 'generador',
    precioStandalone: 149,
    precioBundle: 0,
  },
];

export const BUNDLE_PRECIO_MENSUAL = 99;

export function getPlatform(id: string): PlatformMeta | undefined {
  return PLATFORMS.find(p => p.id === id);
}

export function getUniversidadPlatforms(): PlatformMeta[] {
  return PLATFORMS.filter(p => p.mundo === 'universidad');
}
```

### Paso 1.2 — Crear datos mock centralizados

- [ ] Crear `src/lib/ecosistema/mock-data.ts` con tipos + seed completo del estudiante demo "Ana".

```typescript
export type PlatformId = 'finanzas' | 'mercados' | 'estrategia' | 'marketing';

export interface MockUser {
  id: string;
  nombre: string;
  email: string;
  avatar: string;
  universidad: 'UMSS' | 'UNIFRANZ' | null;
  carrera: string;
  rol: 'estudiante' | 'emprendedor' | 'docente';
}

export interface MockArtefacto {
  id: string;
  tipo: 'simulacion-financiera' | 'estudio-mercado' | 'pestel' | 'porter' | 'foda' | 'plan-marketing';
  platformId: PlatformId;
  titulo: string;
  preview: string;
  fechaCreacion: string;
  contenido: Record<string, unknown>;
}

export interface MockProgreso {
  platformId: PlatformId;
  porcentaje: number;
  ultimaClase: string;
  artefactos: string[];
}

export interface MockFase {
  id: string;
  numero: string;
  titulo: string;
  estado: 'pendiente' | 'en-progreso' | 'completada';
  fuenteArtefacto?: string;
  contenidoPreview?: string;
}

export interface MockProyecto {
  id: string;
  titulo: string;
  modalidad: 'monografia' | 'tesis' | 'proy-grado';
  universidad: 'UMSS' | 'UNIFRANZ';
  modalidadUnifranz?: 'pre-factibilidad' | 'mejora-org' | 'artefacto' | 'trabajo-dirigido' | 'tesis';
  fases: MockFase[];
  artefactosImportados: string[];
}

export const ESTUDIANTE_DEMO: MockUser = {
  id: 'user-ana',
  nombre: 'Ana Quispe Mamani',
  email: 'ana.quispe@unifranz.edu.bo',
  avatar: '/ecosistema/avatars/ana.svg',
  universidad: 'UNIFRANZ',
  carrera: 'Ingeniería Comercial',
  rol: 'estudiante',
};

export const EMPRENDEDOR_DEMO: MockUser = {
  id: 'user-marcos',
  nombre: 'Marcos Rojas',
  email: 'marcos@cafelaorquidea.bo',
  avatar: '/ecosistema/avatars/marcos.svg',
  universidad: null,
  carrera: '',
  rol: 'emprendedor',
};

export const ARTEFACTO_FINANZAS: MockArtefacto = {
  id: 'art-fin-001',
  tipo: 'simulacion-financiera',
  platformId: 'finanzas',
  titulo: 'Cafetería La Orquídea — Análisis Financiero 5 años',
  preview: 'VAN Bs. 124,580 · TIR 28.4% · B/C 1.42 · Payback 32 meses',
  fechaCreacion: '2026-05-28',
  contenido: {
    inversionInicial: 85000,
    ingresosAnuales: [120000, 138000, 158700, 182505, 209880],
    egresosAnuales: [78000, 84240, 91780, 99940, 108936],
    tasaDescuento: 0.14,
    van: 124580,
    tir: 0.284,
    bc: 1.42,
    paybackMeses: 32,
    sensibilidad: {
      optimista: { van: 198750, tir: 0.412 },
      base: { van: 124580, tir: 0.284 },
      pesimista: { van: 32100, tir: 0.156 },
    },
  },
};

export const ARTEFACTO_MERCADOS: MockArtefacto = {
  id: 'art-merc-001',
  tipo: 'estudio-mercado',
  platformId: 'mercados',
  titulo: 'Demanda de cafetería especializada en zona norte de Cochabamba',
  preview: 'Muestra: 384 personas · Demanda potencial: 12,400 clientes/mes · Top competidores: 4',
  fechaCreacion: '2026-05-30',
  contenido: {
    tamanoMuestra: 384,
    nivelConfianza: 0.95,
    margenError: 0.05,
    tipoMuestreo: 'aleatorio-estratificado',
    preguntas: 18,
    respuestas: 384,
    demandaPotencial: 12400,
    demandaReal: 8680,
    demandaInsatisfecha: 3720,
    googleTrendsScore: 78,
    competidores: [
      { nombre: 'Café Express', share: 0.32, ubicacion: 'Centro' },
      { nombre: 'Aroma Bolivia', share: 0.21, ubicacion: 'Norte' },
      { nombre: 'Mistura', share: 0.18, ubicacion: 'Norte' },
      { nombre: 'Otros', share: 0.29, ubicacion: 'Varias' },
    ],
    segmentos: [
      { nombre: 'Universitarios', porcentaje: 38, edad: '18-24' },
      { nombre: 'Profesionales jóvenes', porcentaje: 35, edad: '25-34' },
      { nombre: 'Familias', porcentaje: 27, edad: '35+' },
    ],
  },
};

export const ARTEFACTO_PESTEL: MockArtefacto = {
  id: 'art-est-001',
  tipo: 'pestel',
  platformId: 'estrategia',
  titulo: 'Análisis PESTEL — Sector Cafeterías Cochabamba 2026',
  preview: 'Oportunidades: 7 · Amenazas: 5 · Score neto: +2.4',
  fechaCreacion: '2026-05-31',
  contenido: {
    politico: { score: 0.6, factores: ['Estabilidad municipal', 'Nuevas licencias express'] },
    economico: { score: -0.4, factores: ['Inflación alimentos 5.2%', 'Tipo de cambio paralelo'] },
    social: { score: 0.9, factores: ['Cultura del café crece', 'Tercer espacio en demanda'] },
    tecnologico: { score: 0.8, factores: ['Pago QR universal', 'Apps delivery consolidadas'] },
    ecologico: { score: 0.5, factores: ['Consumo consciente sube'] },
    legal: { score: 0.0, factores: ['Régimen tributario sin cambios'] },
  },
};

export const ARTEFACTO_FODA: MockArtefacto = {
  id: 'art-est-002',
  tipo: 'foda',
  platformId: 'estrategia',
  titulo: 'FODA Cruzada — Cafetería La Orquídea',
  preview: '4 estrategias FO · 3 estrategias DO · 3 estrategias FA · 2 estrategias DA',
  fechaCreacion: '2026-05-31',
  contenido: {
    fortalezas: ['Ubicación premium', 'Barista certificado', 'Café boliviano de origen'],
    oportunidades: ['Demanda insatisfecha 3,720', 'Tendencia tercer espacio', 'Apps delivery'],
    debilidades: ['Capital limitado', 'Sin marca conocida'],
    amenazas: ['Café Express dominante', 'Inflación insumos'],
    estrategias: {
      fo: ['Lanzamiento premium con identidad boliviana', 'Alianza con apps delivery desde día 1'],
      do: ['Financiamiento blando Banco Sol para capital'],
      fa: ['Posicionamiento "café local de altura" frente a Café Express'],
      da: ['Diferimiento de expansión hasta consolidación'],
    },
  },
};

export const ARTEFACTO_MARKETING: MockArtefacto = {
  id: 'art-mkt-001',
  tipo: 'plan-marketing',
  platformId: 'marketing',
  titulo: 'Plan Marketing Digital — Cafetería La Orquídea',
  preview: 'Presupuesto Bs. 4,800/mes · 3 canales · CPL estimado Bs. 12',
  fechaCreacion: '2026-06-01',
  contenido: {
    segmento: 'Profesionales jóvenes Cochabamba norte',
    canales: [
      { canal: 'Instagram Ads', presupuesto: 2400, alcance: 18000, cpl: 11 },
      { canal: 'TikTok Ads', presupuesto: 1800, alcance: 22000, cpl: 9 },
      { canal: 'Google Ads', presupuesto: 600, alcance: 3000, cpl: 18 },
    ],
    calendario: [
      { semana: 1, accion: 'Lanzamiento marca + invitación VIP' },
      { semana: 2, accion: 'Apertura suave con influencers locales' },
      { semana: 3, accion: 'Reels recetas + sorteo' },
      { semana: 4, accion: 'Concurso UGC' },
    ],
  },
};

export const ARTEFACTOS_DEMO: MockArtefacto[] = [
  ARTEFACTO_FINANZAS,
  ARTEFACTO_MERCADOS,
  ARTEFACTO_PESTEL,
  ARTEFACTO_FODA,
  ARTEFACTO_MARKETING,
];

export const PROGRESO_DEMO: MockProgreso[] = [
  { platformId: 'finanzas', porcentaje: 100, ultimaClase: 'Análisis de sensibilidad', artefactos: ['art-fin-001'] },
  { platformId: 'mercados', porcentaje: 85, ultimaClase: 'Tabulación cruzada', artefactos: ['art-merc-001'] },
  { platformId: 'estrategia', porcentaje: 70, ultimaClase: 'FODA cruzada', artefactos: ['art-est-001', 'art-est-002'] },
  { platformId: 'marketing', porcentaje: 60, ultimaClase: 'Presupuesto por canal', artefactos: ['art-mkt-001'] },
];

export const PROYECTO_UNIFRANZ_DEMO: MockProyecto = {
  id: 'proy-001',
  titulo: 'Cafetería La Orquídea — Plan de Negocio Pre-Factibilidad',
  modalidad: 'proy-grado',
  universidad: 'UNIFRANZ',
  modalidadUnifranz: 'pre-factibilidad',
  artefactosImportados: ['art-fin-001', 'art-merc-001', 'art-est-001', 'art-est-002', 'art-mkt-001'],
  fases: [
    { id: 'f-resumen', numero: '0', titulo: 'Resumen Ejecutivo', estado: 'pendiente' },
    { id: 'f-intro', numero: '0.1', titulo: 'Introducción', estado: 'pendiente' },
    { id: 'f-cap1', numero: 'I', titulo: 'Marco Teórico', estado: 'pendiente' },
    { id: 'f-cap2-1', numero: '2.1', titulo: 'Macroentorno (PESTEL)', estado: 'completada', fuenteArtefacto: 'art-est-001', contenidoPreview: '6 factores analizados con scoring guiado' },
    { id: 'f-cap2-2', numero: '2.2', titulo: 'Microentorno (Porter)', estado: 'pendiente' },
    { id: 'f-cap2-3', numero: '2.3', titulo: 'Análisis Matricial (MEFE/MEFI/FODA)', estado: 'completada', fuenteArtefacto: 'art-est-002', contenidoPreview: '12 estrategias cruzadas' },
    { id: 'f-cap2-4', numero: '2.4', titulo: 'Metodología de Investigación', estado: 'completada', fuenteArtefacto: 'art-merc-001', contenidoPreview: 'Muestra 384 · IC 95% · Estratificado' },
    { id: 'f-cap2-5', numero: '2.5', titulo: 'Estudio de Mercado', estado: 'completada', fuenteArtefacto: 'art-merc-001', contenidoPreview: 'Demanda insatisfecha 3,720 clientes/mes' },
    { id: 'f-cap3-1', numero: '3.1', titulo: 'Plan Organizacional', estado: 'pendiente' },
    { id: 'f-cap3-2', numero: '3.2', titulo: 'Plan de Marketing', estado: 'completada', fuenteArtefacto: 'art-mkt-001', contenidoPreview: 'Presupuesto Bs. 4,800/mes · 3 canales' },
    { id: 'f-cap3-3', numero: '3.3', titulo: 'Plan de Producción', estado: 'pendiente' },
    { id: 'f-cap3-4', numero: '3.4', titulo: 'Plan Financiero', estado: 'completada', fuenteArtefacto: 'art-fin-001', contenidoPreview: 'VAN Bs. 124,580 · TIR 28.4%' },
    { id: 'f-cap3-5', numero: '3.5', titulo: 'Plan Legal', estado: 'pendiente' },
    { id: 'f-conclu', numero: '4', titulo: 'Conclusiones y Recomendaciones', estado: 'pendiente' },
    { id: 'f-biblio', numero: '5', titulo: 'Bibliografía', estado: 'pendiente' },
  ],
};
```

### Paso 1.3 — Auth simulado

- [ ] Crear `src/lib/ecosistema/mock-auth.ts`.

```typescript
import { ESTUDIANTE_DEMO, EMPRENDEDOR_DEMO, type MockUser } from './mock-data';

const STORAGE_KEY = 'ecosistema-mock-user';

export function loginMock(perfil: 'estudiante' | 'emprendedor' = 'estudiante'): MockUser {
  const user = perfil === 'estudiante' ? ESTUDIANTE_DEMO : EMPRENDEDOR_DEMO;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export function logoutMock(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function getCurrentUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}
```

### Paso 1.4 — Context Provider del ecosistema

- [ ] Crear `src/lib/ecosistema/mock-state.tsx`.

```typescript
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from './mock-auth';
import { ARTEFACTOS_DEMO, PROGRESO_DEMO, type MockUser, type MockArtefacto, type MockProgreso } from './mock-data';

interface EcosistemaState {
  user: MockUser | null;
  artefactos: MockArtefacto[];
  progreso: MockProgreso[];
  refrescarUsuario: () => void;
}

const EcosistemaContext = createContext<EcosistemaState | null>(null);

export function EcosistemaProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const refrescarUsuario = () => setUser(getCurrentUser());

  return (
    <EcosistemaContext.Provider
      value={{
        user,
        artefactos: ARTEFACTOS_DEMO,
        progreso: PROGRESO_DEMO,
        refrescarUsuario,
      }}
    >
      {children}
    </EcosistemaContext.Provider>
  );
}

export function useEcosistema(): EcosistemaState {
  const ctx = useContext(EcosistemaContext);
  if (!ctx) throw new Error('useEcosistema debe usarse dentro de EcosistemaProvider');
  return ctx;
}
```

### Paso 1.5 — Layout root del ecosistema

- [ ] Crear `src/app/ecosistema/layout.tsx`.

```typescript
import type { Metadata } from 'next';
import { EcosistemaProvider } from '@/lib/ecosistema/mock-state';

export const metadata: Metadata = {
  title: 'Laboratorio Académico PRO — Ecosistema',
  description: 'Aprende, construye y consolida tu proyecto con datos reales.',
};

export default function EcosistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <EcosistemaProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 antialiased">
        {children}
      </div>
    </EcosistemaProvider>
  );
}
```

### Paso 1.6 — Navegación común del ecosistema

- [ ] Crear `src/components/ecosistema/EcosystemNav.tsx` con logo, links a Universidad/Generador, y avatar de usuario.

```typescript
'use client';

import Link from 'next/link';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

export function EcosystemNav() {
  const { user } = useEcosistema();
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/ecosistema" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="text-xl">🧪</span>
          <span>Laboratorio Académico PRO</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/ecosistema/universidad" className="hover:text-slate-900">Universidad</Link>
          <Link href="/ecosistema/generador" className="hover:text-slate-900">Generador</Link>
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {user.nombre.charAt(0)}
              </span>
              <span className="text-slate-700">{user.nombre.split(' ')[0]}</span>
            </div>
          ) : (
            <Link
              href="/ecosistema/login"
              className="rounded-full bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### Paso 1.7 — Verificación manual

- [ ] Correr `npm run dev` y navegar a http://localhost:3000/ecosistema — debe renderizar el layout con la nav superior (todavía sin contenido). Sin errores en consola.

### Paso 1.8 — Commit

```bash
git add src/lib/ecosistema/ src/app/ecosistema/layout.tsx src/components/ecosistema/EcosystemNav.tsx
git commit -m "feat(ecosistema): bootstrap mockup con provider, mock data y nav"
```

---

## Tarea 2: Landing pública del ecosistema

**Files:**
- Create: `src/app/ecosistema/page.tsx`
- Create: `src/components/ecosistema/PlatformCard.tsx`

### Paso 2.1 — Card de plataforma reutilizable

- [ ] Crear `src/components/ecosistema/PlatformCard.tsx`.

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PlatformMeta } from '@/lib/ecosistema/platforms';

export function PlatformCard({ platform, index }: { platform: PlatformMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        href={platform.ruta}
        className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
        style={{ boxShadow: `0 1px 0 ${platform.colorAccent}10` }}
      >
        <div
          className="mb-4 grid h-12 w-12 place-items-center rounded-xl text-2xl"
          style={{ backgroundColor: `${platform.colorAccent}15`, color: platform.colorAccent }}
        >
          {platform.icono === 'TrendingUp' && '📈'}
          {platform.icono === 'Compass' && '🧭'}
          {platform.icono === 'Target' && '🎯'}
          {platform.icono === 'Megaphone' && '📣'}
          {platform.icono === 'FileText' && '📄'}
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">{platform.nombre}</h3>
        <p className="mb-3 text-sm font-medium" style={{ color: platform.colorAccent }}>
          {platform.tagline}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">{platform.descripcionCorta}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="font-semibold text-slate-900">Bs. {platform.precioStandalone}/mes</span>
          <span className="text-slate-500 group-hover:text-slate-900">Conocer plataforma →</span>
        </div>
      </Link>
    </motion.div>
  );
}
```

### Paso 2.2 — Landing del ecosistema

- [ ] Crear `src/app/ecosistema/page.tsx` con hero, cards de plataformas, propuesta de valor y CTA.

```typescript
import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { PlatformCard } from '@/components/ecosistema/PlatformCard';
import { getUniversidadPlatforms, getPlatform, BUNDLE_PRECIO_MENSUAL } from '@/lib/ecosistema/platforms';

export default function EcosistemaLanding() {
  const plataformas = getUniversidadPlatforms();
  const generador = getPlatform('generador')!;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            🇧🇴 Hecho en Cochabamba para Latinoamérica
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-slate-900">
            Aprende las materias.
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
              Tu proyecto sale como consecuencia.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Un ecosistema de plataformas educativas + un generador de tesis y proyectos de grado.
            Tú trabajas datos reales en cada materia. La IA solo consolida.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/ecosistema/login"
              className="rounded-full bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
            >
              Probar el demo
            </Link>
            <Link
              href="#plataformas"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-50"
            >
              Ver plataformas
            </Link>
          </div>
        </div>
      </section>

      <section id="plataformas" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-600">Mundo 1 · Universidad</p>
            <h2 className="text-3xl font-bold text-slate-900">4 plataformas educativas</h2>
            <p className="mt-2 text-slate-600">Cada materia es una plataforma. Aprendes haciendo, no copiando.</p>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-sm text-slate-500">Bundle completo</p>
            <p className="text-2xl font-bold text-slate-900">Bs. {BUNDLE_PRECIO_MENSUAL}/mes</p>
            <p className="text-xs text-slate-500">Las 4 plataformas + generador</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plataformas.map((p, i) => (
            <PlatformCard key={p.id} platform={p} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-10">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-amber-700">Mundo 2 · Generador</p>
          <div className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{generador.nombre}</h2>
              <p className="mt-3 text-lg text-amber-900/80">{generador.tagline}</p>
              <p className="mt-4 leading-relaxed text-slate-700">
                Importa el simulador financiero que armaste, tu estudio de mercado con datos reales,
                tu FODA cruzada, tu plan de marketing. La IA cose todo en un documento académico
                con el formato exacto de tu universidad (UMSS o UNIFRANZ).
              </p>
              <Link
                href={generador.ruta}
                className="mt-6 inline-flex rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
              >
                Ver el generador
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white p-6">
              <p className="mb-4 text-sm font-medium text-amber-700">¿Cómo funciona?</p>
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">1</span>
                  <span>Aprendes y trabajas en cada plataforma educativa</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">2</span>
                  <span>Eliges tu universidad y modalidad (UMSS / UNIFRANZ)</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">3</span>
                  <span>El Generador importa tus artefactos a las fases correspondientes</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">4</span>
                  <span>La IA consolida en un documento LaTeX listo para defensa</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

### Paso 2.3 — Verificación manual

- [ ] http://localhost:3000/ecosistema renderiza hero, 4 cards de plataformas con animación stagger, y la sección del Generador. Links funcionan (aunque destinos aún no existen).

### Paso 2.4 — Commit

```bash
git add src/app/ecosistema/page.tsx src/components/ecosistema/PlatformCard.tsx
git commit -m "feat(ecosistema): landing pública con propuesta de valor 'Dos Mundos'"
```

---

## Tarea 3: Hub Central SSO + Hub de Universidad

**Files:**
- Create: `src/app/ecosistema/login/page.tsx`
- Create: `src/app/ecosistema/universidad/page.tsx`
- Create: `src/components/ecosistema/ProgressTracker.tsx`

### Paso 3.1 — Tracker de progreso reutilizable

- [ ] Crear `src/components/ecosistema/ProgressTracker.tsx`.

```typescript
export function ProgressTracker({ porcentaje, color = '#0ea5e9' }: { porcentaje: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600">{porcentaje}%</span>
    </div>
  );
}
```

### Paso 3.2 — Login SSO mockup

- [ ] Crear `src/app/ecosistema/login/page.tsx`. El "login" no valida nada — solo elige perfil demo y redirige.

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { loginMock } from '@/lib/ecosistema/mock-auth';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

export default function LoginPage() {
  const router = useRouter();
  const { refrescarUsuario } = useEcosistema();

  const entrar = (perfil: 'estudiante' | 'emprendedor') => {
    loginMock(perfil);
    refrescarUsuario();
    router.push('/ecosistema/universidad');
  };

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-md px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900">Entra al ecosistema</h1>
          <p className="mt-2 text-sm text-slate-600">
            En el mockup elige uno de los dos perfiles demo. En producción usarás Google o tu correo institucional.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => entrar('estudiante')}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-lg">🎓</span>
              <div>
                <p className="font-semibold text-slate-900">Ana Quispe Mamani</p>
                <p className="text-xs text-slate-600">Estudiante UNIFRANZ · Ing. Comercial</p>
              </div>
            </button>

            <button
              onClick={() => entrar('emprendedor')}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-900 hover:bg-slate-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-lg">💼</span>
              <div>
                <p className="font-semibold text-slate-900">Marcos Rojas</p>
                <p className="text-xs text-slate-600">Emprendedor · Café La Orquídea</p>
              </div>
            </button>
          </div>

          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Una sola cuenta SSO te da acceso a las 4 plataformas educativas y al Generador.
            Tu progreso y artefactos viajan contigo automáticamente.
          </p>
        </div>
      </section>
    </>
  );
}
```

### Paso 3.3 — Hub de Universidad

- [ ] Crear `src/app/ecosistema/universidad/page.tsx` que muestre las 4 plataformas con el progreso del estudiante demo.

```typescript
'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { ProgressTracker } from '@/components/ecosistema/ProgressTracker';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { getUniversidadPlatforms } from '@/lib/ecosistema/platforms';

export default function UniversidadHub() {
  const { user, progreso, artefactos } = useEcosistema();
  const plataformas = getUniversidadPlatforms();

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-600">Universidad</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Hola{user ? `, ${user.nombre.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 text-slate-600">
            Continúa donde lo dejaste. Cada plataforma guarda tu progreso y los artefactos que vas construyendo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {plataformas.map(plataforma => {
            const prog = progreso.find(p => p.platformId === plataforma.id);
            const artefactosCount = artefactos.filter(a => a.platformId === plataforma.id).length;
            return (
              <Link
                key={plataforma.id}
                href={plataforma.ruta}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{plataforma.nombre}</h2>
                    <p className="mt-1 text-sm text-slate-600">{plataforma.tagline}</p>
                  </div>
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl text-xl"
                    style={{ backgroundColor: `${plataforma.colorAccent}15`, color: plataforma.colorAccent }}
                  >
                    {plataforma.icono === 'TrendingUp' && '📈'}
                    {plataforma.icono === 'Compass' && '🧭'}
                    {plataforma.icono === 'Target' && '🎯'}
                    {plataforma.icono === 'Megaphone' && '📣'}
                  </span>
                </div>
                {prog && (
                  <>
                    <ProgressTracker porcentaje={prog.porcentaje} color={plataforma.colorAccent} />
                    <p className="mt-3 text-xs text-slate-500">
                      Última clase: <span className="font-medium text-slate-700">{prog.ultimaClase}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Artefactos creados: <span className="font-medium text-slate-700">{artefactosCount}</span>
                    </p>
                  </>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-xl">✨</span>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">¿Listo para tu proyecto académico?</p>
              <p className="mt-1 text-sm text-amber-900/80">
                Llevas {progreso.length} plataformas trabajadas. El Generador puede importar todo eso
                a las fases de tu tesis o proyecto de grado.
              </p>
            </div>
            <Link
              href="/ecosistema/generador"
              className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Ir al Generador →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

### Paso 3.4 — Verificación manual

- [ ] http://localhost:3000/ecosistema/login muestra dos perfiles. Click en "Ana" lleva a `/universidad` con su nombre en la nav.
- [ ] http://localhost:3000/ecosistema/universidad muestra las 4 plataformas con sus barras de progreso (Finanzas 100%, Mercados 85%, etc.).
- [ ] El CTA al Generador es visible y funcional.

### Paso 3.5 — Commit

```bash
git add src/app/ecosistema/login/ src/app/ecosistema/universidad/page.tsx src/components/ecosistema/ProgressTracker.tsx
git commit -m "feat(ecosistema): SSO mockup + hub de universidad con progreso"
```

---

## Tarea 4: Plataforma Finanzas — Preview (puente a simuladorPRO)

**Files:**
- Create: `src/app/ecosistema/universidad/finanzas/page.tsx`
- Create: `src/components/ecosistema/PlatformShell.tsx`

### Paso 4.1 — Shell común de plataforma

- [ ] Crear `src/components/ecosistema/PlatformShell.tsx`.

```typescript
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PlatformMeta } from '@/lib/ecosistema/platforms';
import { EcosystemNav } from './EcosystemNav';

export function PlatformShell({
  platform,
  children,
  sidebar,
}: {
  platform: PlatformMeta;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <>
      <EcosystemNav />
      <div
        className="border-b border-slate-200 px-6 py-4"
        style={{ backgroundColor: `${platform.colorAccent}08` }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href="/ecosistema/universidad" className="text-sm text-slate-500 hover:text-slate-900">
            Universidad
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900">{platform.nombre}</span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {sidebar ? (
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="lg:sticky lg:top-20 lg:h-fit">{sidebar}</aside>
            <main>{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>
    </>
  );
}
```

### Paso 4.2 — Página Finanzas (preview + CTA a simuladorPRO)

- [ ] Crear `src/app/ecosistema/universidad/finanzas/page.tsx` con preview del artefacto financiero, CTA grande "Abrir SimuladorPRO" (link externo simulado), y mini-cards de clases.

```typescript
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_FINANZAS } from '@/lib/ecosistema/mock-data';

export default function FinanzasPlatform() {
  const platform = getPlatform('finanzas')!;
  const datos = ARTEFACTO_FINANZAS.contenido as Record<string, number>;

  return (
    <PlatformShell platform={platform}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
        <p className="mt-2 text-slate-600">{platform.descripcionCorta}</p>
      </header>

      <section className="mb-10 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
            Tu último análisis
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{ARTEFACTO_FINANZAS.titulo}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="VAN" valor={`Bs. ${datos.van.toLocaleString('es-BO')}`} positivo />
          <Metric label="TIR" valor={`${(datos.tir * 100).toFixed(1)}%`} positivo />
          <Metric label="B/C" valor={datos.bc.toFixed(2)} positivo={datos.bc > 1} />
          <Metric label="Payback" valor={`${datos.paybackMeses} meses`} positivo />
        </div>
        <a
          href="https://simulador-pro.tudominio.com"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Abrir mi SimuladorPRO →
        </a>
        <p className="mt-3 text-xs text-emerald-900/70">
          SimuladorPRO se abre como herramienta independiente. Cuando guardes, tu resultado vuelve aquí
          y queda listo para importarse al Generador.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Clases del curso</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {['Conceptos básicos: VAN y TIR', 'Flujo de caja proyectado', 'Tasa de descuento adecuada', 'Análisis de sensibilidad', 'Escenarios optimista/base/pesimista', 'Punto de equilibrio'].map((titulo, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-emerald-600">Clase {i + 1}</p>
              <p className="mt-1 font-medium text-slate-900">{titulo}</p>
              <p className="mt-2 text-xs text-slate-500">{i < 5 ? 'Completada ✓' : 'En curso'}</p>
            </div>
          ))}
        </div>
      </section>
    </PlatformShell>
  );
}

function Metric({ label, valor, positivo }: { label: string; valor: string; positivo: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${positivo ? 'text-emerald-700' : 'text-rose-700'}`}>{valor}</p>
    </div>
  );
}
```

### Paso 4.3 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/finanzas muestra el bloque con VAN/TIR/B/C/Payback de Café La Orquídea, CTA a SimuladorPRO, y 6 clases listadas. Link de Universidad en breadcrumb funciona.

### Paso 4.4 — Commit

```bash
git add src/app/ecosistema/universidad/finanzas/ src/components/ecosistema/PlatformShell.tsx
git commit -m "feat(ecosistema): plataforma finanzas con preview de artefacto y CTA a simuladorPRO"
```

---

## Tarea 5: Plataforma Investigación de Mercados — Dashboard + Clases

**Files:**
- Create: `src/app/ecosistema/universidad/mercados/layout.tsx`
- Create: `src/app/ecosistema/universidad/mercados/page.tsx`
- Create: `src/app/ecosistema/universidad/mercados/clases/page.tsx`
- Create: `src/components/ecosistema/ClaseInteractiva.tsx`

### Paso 5.1 — Layout con sidebar de la plataforma Mercados

- [ ] Crear `src/app/ecosistema/universidad/mercados/layout.tsx`. Sidebar navega entre clases / muestreo / encuesta / resultados.

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';

const SECTIONS = [
  { href: '/ecosistema/universidad/mercados', label: 'Resumen', icono: '📊' },
  { href: '/ecosistema/universidad/mercados/clases', label: 'Clases', icono: '🎓' },
  { href: '/ecosistema/universidad/mercados/muestreo', label: 'Calculadora de muestreo', icono: '🔢' },
  { href: '/ecosistema/universidad/mercados/encuesta', label: 'Diseñador de encuesta', icono: '📝' },
  { href: '/ecosistema/universidad/mercados/resultados', label: 'Resultados y tablas', icono: '📈' },
];

export default function MercadosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const platform = getPlatform('mercados')!;

  const sidebar = (
    <nav className="space-y-1">
      {SECTIONS.map(s => {
        const active = pathname === s.href;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
              active ? 'bg-sky-100 font-semibold text-sky-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{s.icono}</span>
            <span>{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <PlatformShell platform={platform} sidebar={sidebar}>
      {children}
    </PlatformShell>
  );
}
```

### Paso 5.2 — Dashboard (resumen) de la plataforma

- [ ] Crear `src/app/ecosistema/universidad/mercados/page.tsx`.

```typescript
import Link from 'next/link';
import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';

export default function MercadosDashboard() {
  const datos = ARTEFACTO_MERCADOS.contenido as Record<string, number>;
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Investigación de Mercados</h1>
        <p className="mt-2 text-slate-600">
          Aprende a tomar decisiones con datos reales. Cada clase te deja un artefacto utilizable en tu proyecto.
        </p>
      </header>

      <section className="rounded-3xl border border-sky-200 bg-sky-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Tu estudio en curso</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{ARTEFACTO_MERCADOS.titulo}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Tamaño de muestra</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{datos.tamanoMuestra}</p>
            <p className="text-xs text-slate-500">IC 95% · margen 5%</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Demanda potencial</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{datos.demandaPotencial.toLocaleString('es-BO')}</p>
            <p className="text-xs text-slate-500">clientes/mes</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs text-slate-500">Demanda insatisfecha</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{datos.demandaInsatisfecha.toLocaleString('es-BO')}</p>
            <p className="text-xs text-slate-500">oportunidad de mercado</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Próximos pasos sugeridos</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/ecosistema/universidad/mercados/clases" className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-300">
            <p className="font-medium text-slate-900">Completar clase: Análisis de competencia</p>
            <p className="mt-1 text-xs text-slate-500">15 min · agrega contenido al artefacto</p>
          </Link>
          <Link href="/ecosistema/universidad/mercados/resultados" className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-300">
            <p className="font-medium text-slate-900">Ver tabulación cruzada</p>
            <p className="mt-1 text-xs text-slate-500">Gráficos listos para tu proyecto</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
```

### Paso 5.3 — Componente de clase interactiva

- [ ] Crear `src/components/ecosistema/ClaseInteractiva.tsx`.

```typescript
'use client';

import { useState } from 'react';

export interface Quiz {
  pregunta: string;
  opciones: string[];
  correctaIndex: number;
  explicacion: string;
}

export function ClaseInteractiva({
  numero,
  titulo,
  duracion,
  contenido,
  quiz,
}: {
  numero: number;
  titulo: string;
  duracion: string;
  contenido: string;
  quiz: Quiz;
}) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const correcta = seleccionada === quiz.correctaIndex;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Clase {numero} · {duracion}</p>
      <h3 className="mt-1 text-xl font-bold text-slate-900">{titulo}</h3>
      <p className="mt-3 leading-relaxed text-slate-700">{contenido}</p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Mini-quiz: {quiz.pregunta}</p>
        <div className="mt-3 space-y-2">
          {quiz.opciones.map((op, i) => {
            const esta = seleccionada === i;
            const isCorrecta = seleccionada !== null && i === quiz.correctaIndex;
            const isIncorrecta = esta && i !== quiz.correctaIndex;
            return (
              <button
                key={i}
                onClick={() => setSeleccionada(i)}
                disabled={seleccionada !== null}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isCorrecta
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : isIncorrecta
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {op}
              </button>
            );
          })}
        </div>
        {seleccionada !== null && (
          <p className={`mt-3 text-sm ${correcta ? 'text-emerald-700' : 'text-rose-700'}`}>
            {correcta ? '✓ Correcto.' : '✗ Incorrecto.'} {quiz.explicacion}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Paso 5.4 — Página de clases

- [ ] Crear `src/app/ecosistema/universidad/mercados/clases/page.tsx`.

```typescript
import { ClaseInteractiva } from '@/components/ecosistema/ClaseInteractiva';

export default function ClasesMercados() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Clases — Investigación de Mercados</h1>
        <p className="mt-2 text-slate-600">Aprende los conceptos, hazlo en la calculadora, valida con un mini-quiz.</p>
      </header>

      <ClaseInteractiva
        numero={1}
        titulo="¿Qué es el tamaño de muestra y por qué importa?"
        duracion="8 min"
        contenido="Calcular el tamaño correcto de una muestra te da resultados estadísticamente significativos. Una muestra muy pequeña genera conclusiones poco confiables; una muy grande gasta tu tiempo y dinero sin agregar precisión. Las fórmulas más usadas son Cochran (para proporciones) y Slovin (para poblaciones conocidas)."
        quiz={{
          pregunta: 'Si tu población es de 50,000 personas y quieres un IC del 95% con margen de error del 5%, ¿qué tamaño de muestra necesitas aproximadamente?',
          opciones: ['100 personas', '200 personas', '384 personas', '1,000 personas'],
          correctaIndex: 2,
          explicacion: 'Para poblaciones grandes con IC 95% y error 5%, la fórmula de Cochran da ~384 sin importar mucho el tamaño exacto de la población.',
        }}
      />

      <ClaseInteractiva
        numero={2}
        titulo="Tipos de muestreo: aleatorio, estratificado, por conveniencia"
        duracion="12 min"
        contenido="No todos los muestreos son iguales. El aleatorio simple da la misma probabilidad a cada persona. El estratificado divide la población en subgrupos (estratos) y muestrea proporcionalmente cada uno — ideal cuando hay diferencias claras (edad, género, zona). El por conveniencia es rápido pero sesgado."
        quiz={{
          pregunta: 'Para estudiar consumo de café en Cochabamba norte con segmentos universitarios, profesionales y familias, ¿qué muestreo es mejor?',
          opciones: ['Aleatorio simple', 'Estratificado proporcional', 'Por conveniencia', 'Bola de nieve'],
          correctaIndex: 1,
          explicacion: 'El estratificado proporcional asegura que los 3 segmentos estén representados en la misma proporción que en la población real.',
        }}
      />
    </div>
  );
}
```

### Paso 5.5 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/mercados muestra dashboard con métricas + sidebar con 5 secciones.
- [ ] http://localhost:3000/ecosistema/universidad/mercados/clases muestra 2 clases interactivas con quiz funcional.

### Paso 5.6 — Commit

```bash
git add src/app/ecosistema/universidad/mercados/ src/components/ecosistema/ClaseInteractiva.tsx
git commit -m "feat(ecosistema): plataforma mercados — dashboard + clases con quiz"
```

---

## Tarea 6: Plataforma Mercados — Calculadora de Muestreo

**Files:**
- Create: `src/app/ecosistema/universidad/mercados/muestreo/page.tsx`

### Paso 6.1 — Calculadora interactiva Cochran/Slovin

- [ ] Crear `src/app/ecosistema/universidad/mercados/muestreo/page.tsx`. Cálculo en cliente con math básico (no es lógica real "del producto", es para que el mockup sea creíble).

```typescript
'use client';

import { useState } from 'react';

export default function MuestreoCalculator() {
  const [poblacion, setPoblacion] = useState(50000);
  const [confianza, setConfianza] = useState(95);
  const [error, setError] = useState(5);
  const [proporcion, setProporcion] = useState(50);

  const z = confianza === 99 ? 2.576 : confianza === 95 ? 1.96 : 1.645;
  const p = proporcion / 100;
  const q = 1 - p;
  const e = error / 100;
  const numerador = z * z * p * q;
  const denominador = e * e;
  const muestraInfinita = Math.ceil(numerador / denominador);
  const muestra = Math.ceil(muestraInfinita / (1 + (muestraInfinita - 1) / poblacion));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Calculadora de tamaño de muestra</h1>
        <p className="mt-2 text-slate-600">Fórmula de Cochran ajustada por población finita. Resultado listo para tu proyecto.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Parámetros</h2>
          <div className="space-y-4">
            <Field label="Tamaño de población (N)" value={poblacion} onChange={setPoblacion} hint="Número total de personas en el universo" />
            <Field label="Nivel de confianza (%)" value={confianza} onChange={setConfianza} hint="90, 95 o 99 — usualmente 95" />
            <Field label="Margen de error (%)" value={error} onChange={setError} hint="3, 5 o 10 — usualmente 5" />
            <Field label="Proporción esperada (%)" value={proporcion} onChange={setProporcion} hint="Si no sabes, usa 50 (caso más conservador)" />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="mb-4 font-semibold text-sky-900">Resultado</h2>
          <p className="text-sm text-sky-900/80">Tamaño de muestra recomendado:</p>
          <p className="mt-2 text-6xl font-bold text-sky-700">{muestra.toLocaleString('es-BO')}</p>
          <p className="mt-2 text-sm text-sky-900/80">personas</p>

          <div className="mt-6 space-y-2 rounded-xl bg-white p-4 text-sm">
            <p className="font-semibold text-slate-900">Interpretación</p>
            <p className="text-slate-700">
              Con {muestra} encuestas representativas tendrás un nivel de confianza del {confianza}% de que
              el error de tus resultados no superará ±{error}% respecto a la población real de {poblacion.toLocaleString('es-BO')}.
            </p>
          </div>

          <button className="mt-6 w-full rounded-full bg-sky-600 py-3 font-medium text-white hover:bg-sky-700">
            Guardar en mi proyecto →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, hint }: { label: string; value: number; onChange: (n: number) => void; hint: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none"
      />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
```

### Paso 6.2 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/mercados/muestreo permite cambiar parámetros y el resultado se recalcula en tiempo real. Con valores por defecto (N=50000, conf=95, err=5, p=50), debe dar ~382 personas.

### Paso 6.3 — Commit

```bash
git add src/app/ecosistema/universidad/mercados/muestreo/
git commit -m "feat(ecosistema): calculadora interactiva de muestreo Cochran"
```

---

## Tarea 7: Plataforma Mercados — Encuesta + Resultados

**Files:**
- Create: `src/app/ecosistema/universidad/mercados/encuesta/page.tsx`
- Create: `src/app/ecosistema/universidad/mercados/resultados/page.tsx`

### Paso 7.1 — Diseñador de encuesta (preview no editable, datos mock)

- [ ] Crear `src/app/ecosistema/universidad/mercados/encuesta/page.tsx`.

```typescript
import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';

const PREGUNTAS_DEMO = [
  { tipo: 'Cerrada · Likert 5', texto: '¿Qué tan importante es para ti la calidad del café que consumes?', opciones: ['Nada', 'Poco', 'Neutro', 'Importante', 'Muy importante'] },
  { tipo: 'Cerrada · única', texto: '¿Con qué frecuencia visitas cafeterías?', opciones: ['Nunca', '1 vez al mes', '2-3 veces al mes', '1-2 veces por semana', 'Casi todos los días'] },
  { tipo: 'Cerrada · múltiple', texto: '¿Qué buscas en una cafetería? (puedes marcar varias)', opciones: ['Calidad del café', 'Espacio para trabajar', 'Comida saludable', 'Precio bajo', 'Ambiente para conversar'] },
  { tipo: 'Cerrada · rango', texto: '¿Cuánto pagarías por un café de especialidad?', opciones: ['Menos de Bs. 12', 'Bs. 12-18', 'Bs. 18-25', 'Bs. 25-35', 'Más de Bs. 35'] },
  { tipo: 'Abierta', texto: '¿Qué cafetería de Cochabamba norte recomendarías y por qué?' },
];

export default function EncuestaDesigner() {
  const datos = ARTEFACTO_MERCADOS.contenido as Record<string, number>;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Diseñador de encuesta</h1>
        <p className="mt-2 text-slate-600">
          {datos.preguntas} preguntas validadas · {datos.respuestas} respuestas recolectadas
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Vista previa de tu encuesta</h2>
          <button className="rounded-full bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700">
            Publicar enlace
          </button>
        </div>
        <ol className="space-y-5">
          {PREGUNTAS_DEMO.map((p, i) => (
            <li key={i} className="border-l-2 border-sky-200 pl-4">
              <p className="text-xs font-medium uppercase tracking-wider text-sky-600">{p.tipo}</p>
              <p className="mt-1 font-medium text-slate-900">{i + 1}. {p.texto}</p>
              {p.opciones && (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {p.opciones.map((op, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-xs">○</span>
                      {op}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
```

### Paso 7.2 — Resultados con gráficos estilo pgfplots

- [ ] Crear `src/app/ecosistema/universidad/mercados/resultados/page.tsx`. Los gráficos son SVG simples — el punto es mostrar que en producción serán pgfplots/tikz en LaTeX.

```typescript
import { ARTEFACTO_MERCADOS } from '@/lib/ecosistema/mock-data';

interface Segmento {
  nombre: string;
  porcentaje: number;
  edad: string;
}

interface Competidor {
  nombre: string;
  share: number;
  ubicacion: string;
}

export default function ResultadosMercados() {
  const datos = ARTEFACTO_MERCADOS.contenido as {
    demandaPotencial: number;
    demandaReal: number;
    demandaInsatisfecha: number;
    googleTrendsScore: number;
    segmentos: Segmento[];
    competidores: Competidor[];
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Resultados de la investigación</h1>
        <p className="mt-2 text-slate-600">
          Gráficos vectoriales listos para tu proyecto (en LaTeX se exportan como pgfplots).
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Demanda potencial" valor={datos.demandaPotencial} sufijo="clientes/mes" />
        <Stat label="Demanda real cubierta" valor={datos.demandaReal} sufijo="clientes/mes" />
        <Stat label="Demanda insatisfecha" valor={datos.demandaInsatisfecha} sufijo="oportunidad" highlight />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-slate-900">Segmentación del público objetivo</h2>
        <p className="mb-6 text-sm text-slate-600">Distribución del mercado por grupo etario (n = 384).</p>
        <div className="space-y-3">
          {datos.segmentos.map(s => (
            <div key={s.nombre}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{s.nombre} ({s.edad})</span>
                <span className="font-semibold text-slate-900">{s.porcentaje}%</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${s.porcentaje}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-slate-900">Análisis de competencia</h2>
        <p className="mb-6 text-sm text-slate-600">Participación de mercado de los principales actores.</p>
        <div className="grid gap-3">
          {datos.competidores.map(c => (
            <div key={c.nombre} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-900">{c.nombre}</p>
                <p className="text-xs text-slate-500">{c.ubicacion}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{(c.share * 100).toFixed(0)}%</p>
                <p className="text-xs text-slate-500">market share</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Datos externos integrados</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <DataChip label="Google Trends (cafetería Cochabamba)" valor={`${datos.googleTrendsScore}/100`} />
          <DataChip label="Meta Ads (interés café Bolivia)" valor="2.4M usuarios" />
          <DataChip label="TikTok Ads (#cafedealtura)" valor="18K creators" />
        </div>
        <p className="mt-4 text-xs text-sky-900/70">
          En producción, estos números vendrán en vivo de las APIs de Google, Meta y TikTok.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, valor, sufijo, highlight }: { label: string; valor: number; sufijo: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {valor.toLocaleString('es-BO')}
      </p>
      <p className="text-xs text-slate-500">{sufijo}</p>
    </div>
  );
}

function DataChip({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{valor}</p>
    </div>
  );
}
```

### Paso 7.3 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/mercados/encuesta muestra 5 preguntas con sus opciones.
- [ ] http://localhost:3000/ecosistema/universidad/mercados/resultados muestra 3 stats grandes, gráfico de segmentación (barras horizontales), tabla de competidores, y bloque de datos externos.

### Paso 7.4 — Commit

```bash
git add src/app/ecosistema/universidad/mercados/encuesta/ src/app/ecosistema/universidad/mercados/resultados/
git commit -m "feat(ecosistema): mercados — encuesta y resultados con gráficos mock"
```

---

## Tarea 8: Plataforma Estrategia — Wizard PESTEL/Porter/FODA

**Files:**
- Create: `src/app/ecosistema/universidad/estrategia/page.tsx`

### Paso 8.1 — Página con 4 secciones (PESTEL, Porter, MEFE/MEFI, FODA)

- [ ] Crear `src/app/ecosistema/universidad/estrategia/page.tsx`. Mostrar bloques separados con datos mock del artefacto.

```typescript
'use client';

import { useState } from 'react';
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_PESTEL, ARTEFACTO_FODA } from '@/lib/ecosistema/mock-data';

type Bloque = 'pestel' | 'porter' | 'mefe' | 'foda';

export default function EstrategiaPlatform() {
  const platform = getPlatform('estrategia')!;
  const [activo, setActivo] = useState<Bloque>('pestel');
  const pestel = ARTEFACTO_PESTEL.contenido as Record<string, { score: number; factores: string[] }>;
  const foda = ARTEFACTO_FODA.contenido as {
    fortalezas: string[];
    oportunidades: string[];
    debilidades: string[];
    amenazas: string[];
    estrategias: { fo: string[]; do: string[]; fa: string[]; da: string[] };
  };

  return (
    <PlatformShell platform={platform}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
        <p className="mt-2 text-slate-600">Del análisis al plan, paso a paso. Cada bloque genera un artefacto reutilizable.</p>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'pestel' as const, label: 'PESTEL' },
          { id: 'porter' as const, label: '5 Fuerzas de Porter' },
          { id: 'mefe' as const, label: 'MEFE / MEFI' },
          { id: 'foda' as const, label: 'FODA Cruzada' },
        ].map(b => (
          <button
            key={b.id}
            onClick={() => setActivo(b.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              activo === b.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {activo === 'pestel' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(pestel).map(([dim, datos]) => (
            <div key={dim} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold capitalize text-slate-900">{dim}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  datos.score > 0 ? 'bg-emerald-100 text-emerald-800' : datos.score < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {datos.score > 0 ? '+' : ''}{datos.score.toFixed(1)}
                </span>
              </div>
              <ul className="space-y-1 text-sm text-slate-700">
                {datos.factores.map(f => (
                  <li key={f} className="flex gap-2">
                    <span className="text-slate-400">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activo === 'porter' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-sm text-slate-600">Análisis cualitativo + scoring 1-5 por cada fuerza.</p>
          <div className="space-y-3">
            {[
              ['Rivalidad entre competidores', 4, 'Café Express domina pero hay nichos abiertos'],
              ['Amenaza de nuevos entrantes', 3, 'Inversión moderada; barreras de marca crecientes'],
              ['Poder de negociación de proveedores', 2, 'Múltiples productores de café locales'],
              ['Poder de negociación de clientes', 3, 'Cliente joven es exigente pero leal'],
              ['Amenaza de productos sustitutos', 3, 'Bebidas energéticas y té compiten en horario laboral'],
            ].map(([fuerza, score, nota]) => (
              <div key={fuerza as string} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{fuerza}</p>
                  <p className="text-xs text-slate-500">{nota}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                  {score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activo === 'mefe' && (
        <div className="grid gap-4 md:grid-cols-2">
          <MatrizCard
            titulo="MEFE — Factores externos"
            filas={[
              { f: 'Demanda insatisfecha 3,720 clientes', peso: 0.18, calif: 4 },
              { f: 'Tendencia tercer espacio', peso: 0.15, calif: 4 },
              { f: 'Inflación insumos 5.2%', peso: 0.12, calif: 2 },
              { f: 'Tipo de cambio paralelo', peso: 0.1, calif: 2 },
              { f: 'Apps delivery consolidadas', peso: 0.15, calif: 4 },
              { f: 'Cultura del café en crecimiento', peso: 0.2, calif: 4 },
              { f: 'Estabilidad municipal', peso: 0.1, calif: 3 },
            ]}
          />
          <MatrizCard
            titulo="MEFI — Factores internos"
            filas={[
              { f: 'Ubicación premium', peso: 0.18, calif: 4 },
              { f: 'Barista certificado SCA', peso: 0.15, calif: 4 },
              { f: 'Café boliviano de origen', peso: 0.17, calif: 4 },
              { f: 'Capital limitado', peso: 0.2, calif: 1 },
              { f: 'Sin marca conocida', peso: 0.15, calif: 2 },
              { f: 'Proveedores locales confiables', peso: 0.15, calif: 3 },
            ]}
          />
        </div>
      )}

      {activo === 'foda' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FodaCol titulo="Fortalezas" items={foda.fortalezas} color="emerald" />
            <FodaCol titulo="Oportunidades" items={foda.oportunidades} color="sky" />
            <FodaCol titulo="Debilidades" items={foda.debilidades} color="amber" />
            <FodaCol titulo="Amenazas" items={foda.amenazas} color="rose" />
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <p className="font-semibold text-violet-900">Estrategias cruzadas generadas</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <EstrategiaCard tipo="FO (Maxi-Maxi)" items={foda.estrategias.fo} />
              <EstrategiaCard tipo="DO (Mini-Maxi)" items={foda.estrategias.do} />
              <EstrategiaCard tipo="FA (Maxi-Mini)" items={foda.estrategias.fa} />
              <EstrategiaCard tipo="DA (Mini-Mini)" items={foda.estrategias.da} />
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}

function MatrizCard({ titulo, filas }: { titulo: string; filas: { f: string; peso: number; calif: number }[] }) {
  const total = filas.reduce((acc, r) => acc + r.peso * r.calif, 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 font-semibold text-slate-900">{titulo}</h3>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="pb-2 text-left">Factor</th>
            <th className="pb-2 text-right">Peso</th>
            <th className="pb-2 text-right">Calif.</th>
            <th className="pb-2 text-right">Pond.</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(r => (
            <tr key={r.f} className="border-t border-slate-100">
              <td className="py-2 text-slate-700">{r.f}</td>
              <td className="py-2 text-right">{r.peso.toFixed(2)}</td>
              <td className="py-2 text-right">{r.calif}</td>
              <td className="py-2 text-right font-medium">{(r.peso * r.calif).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 font-bold">
            <td className="pt-2" colSpan={3}>Total ponderado</td>
            <td className="pt-2 text-right text-violet-700">{total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function FodaCol({ titulo, items, color }: { titulo: string; items: string[]; color: 'emerald' | 'sky' | 'amber' | 'rose' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    sky: 'bg-sky-50 border-sky-200 text-sky-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <p className="font-semibold">{titulo}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map(i => <li key={i} className="flex gap-2"><span>•</span><span>{i}</span></li>)}
      </ul>
    </div>
  );
}

function EstrategiaCard({ tipo, items }: { tipo: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">{tipo}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {items.map(i => <li key={i}>· {i}</li>)}
      </ul>
    </div>
  );
}
```

### Paso 8.2 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/estrategia muestra tabs PESTEL/Porter/MEFE/FODA. Cada tab muestra contenido distinto. Tab FODA muestra las 4 estrategias cruzadas.

### Paso 8.3 — Commit

```bash
git add src/app/ecosistema/universidad/estrategia/
git commit -m "feat(ecosistema): plataforma estrategia con PESTEL/Porter/MEFE/FODA"
```

---

## Tarea 9: Plataforma Marketing Digital

**Files:**
- Create: `src/app/ecosistema/universidad/marketing/page.tsx`

### Paso 9.1 — Página con 4Ps + canales digitales + calendario

- [ ] Crear `src/app/ecosistema/universidad/marketing/page.tsx`.

```typescript
import { PlatformShell } from '@/components/ecosistema/PlatformShell';
import { getPlatform } from '@/lib/ecosistema/platforms';
import { ARTEFACTO_MARKETING } from '@/lib/ecosistema/mock-data';

interface CanalData {
  canal: string;
  presupuesto: number;
  alcance: number;
  cpl: number;
}

interface CalendarioItem {
  semana: number;
  accion: string;
}

export default function MarketingPlatform() {
  const platform = getPlatform('marketing')!;
  const datos = ARTEFACTO_MARKETING.contenido as {
    segmento: string;
    canales: CanalData[];
    calendario: CalendarioItem[];
  };
  const totalPresupuesto = datos.canales.reduce((acc, c) => acc + c.presupuesto, 0);
  const totalAlcance = datos.canales.reduce((acc, c) => acc + c.alcance, 0);

  return (
    <PlatformShell platform={platform}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{platform.nombre}</h1>
        <p className="mt-2 text-slate-600">{platform.tagline}</p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-medium text-rose-700">Segmento objetivo</p>
          <p className="mt-1 font-bold text-slate-900">{datos.segmento}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Presupuesto mensual</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">Bs. {totalPresupuesto.toLocaleString('es-BO')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Alcance estimado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalAlcance.toLocaleString('es-BO')} usuarios</p>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Distribución por canal</h2>
        <div className="space-y-4">
          {datos.canales.map(c => (
            <div key={c.canal} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{c.canal}</p>
                <p className="font-semibold text-slate-900">Bs. {c.presupuesto.toLocaleString('es-BO')}/mes</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Alcance</p>
                  <p className="font-medium text-slate-900">{c.alcance.toLocaleString('es-BO')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">CPL (costo por lead)</p>
                  <p className="font-medium text-slate-900">Bs. {c.cpl}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">% del presupuesto</p>
                  <p className="font-medium text-slate-900">{((c.presupuesto / totalPresupuesto) * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${(c.presupuesto / totalPresupuesto) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          Alcance y CPL provienen de Meta Ads API + TikTok Ads API + Google Ads Insights (en producción).
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Calendario editorial — Primer mes</h2>
        <ol className="space-y-3">
          {datos.calendario.map(item => (
            <li key={item.semana} className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                S{item.semana}
              </span>
              <div className="flex-1 rounded-xl border border-slate-100 p-3">
                <p className="text-sm text-slate-700">{item.accion}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </PlatformShell>
  );
}
```

### Paso 9.2 — Verificación

- [ ] http://localhost:3000/ecosistema/universidad/marketing muestra los 3 stats, los 3 canales con sus barras proporcionales, y el calendario de 4 semanas.

### Paso 9.3 — Commit

```bash
git add src/app/ecosistema/universidad/marketing/
git commit -m "feat(ecosistema): plataforma marketing digital con canales y calendario"
```

---

## Tarea 10: Generador — Landing y modelo "Dos Mundos"

**Files:**
- Create: `src/app/ecosistema/generador/page.tsx`

### Paso 10.1 — Landing del Generador (Mundo 2)

- [ ] Crear `src/app/ecosistema/generador/page.tsx` que reciba al usuario y muestre los artefactos detectados del lado Universidad.

```typescript
'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { getPlatform } from '@/lib/ecosistema/platforms';

export default function GeneradorLanding() {
  const { user, artefactos } = useEcosistema();
  const conectado = user !== null;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-700">Mundo 2 · Generador</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Tu proyecto académico, con tus datos.
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            El Generador toma lo que aprendiste y trabajaste en las plataformas educativas
            y lo consolida en un documento académico con formato UMSS o UNIFRANZ.
          </p>
        </div>

        {conectado ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">
                ✓ Detectados en tu Universidad
              </span>
            </div>
            <p className="mt-3 text-slate-700">
              Encontramos <strong>{artefactos.length} artefactos</strong> listos para importarse a tu proyecto.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {artefactos.map(a => {
                const plat = getPlatform(a.platformId);
                return (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium" style={{ color: plat?.colorAccent }}>
                      {plat?.nombre}
                    </p>
                    <p className="mt-1 font-medium text-slate-900">{a.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.preview}</p>
                  </div>
                );
              })}
            </div>
            <Link
              href="/ecosistema/generador/wizard"
              className="mt-6 inline-flex rounded-full bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
            >
              Empezar mi proyecto importando estos artefactos →
            </Link>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-slate-700">Necesitas iniciar sesión para que el Generador detecte tu trabajo en las plataformas.</p>
            <Link href="/ecosistema/login" className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-3 text-white">
              Iniciar sesión
            </Link>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">¿No vienes de la Universidad?</h2>
          <p className="text-slate-600">El Generador también funciona empezando desde cero. Te guiamos por cada fase.</p>
          <Link
            href="/ecosistema/generador/wizard"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-50"
          >
            Empezar desde cero →
          </Link>
        </section>
      </section>
    </>
  );
}
```

### Paso 10.2 — Verificación

- [ ] Con sesión iniciada, http://localhost:3000/ecosistema/generador muestra los 5 artefactos detectados.
- [ ] Sin sesión, muestra el CTA de login.

### Paso 10.3 — Commit

```bash
git add src/app/ecosistema/generador/page.tsx
git commit -m "feat(ecosistema): landing del Generador con detección de artefactos"
```

---

## Tarea 11: Generador — Wizard "Importar vs Empezar de cero"

**Files:**
- Create: `src/app/ecosistema/generador/wizard/page.tsx`

### Paso 11.1 — Wizard de 3 pasos: Universidad → Modalidad → Fuente de datos

- [ ] Crear `src/app/ecosistema/generador/wizard/page.tsx`.

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';

type Universidad = 'UMSS' | 'UNIFRANZ' | null;
type Modalidad = 'monografia' | 'tesis' | 'pre-factibilidad' | 'mejora-org' | 'artefacto' | 'trabajo-dirigido' | null;
type Fuente = 'importar' | 'cero' | null;

export default function GeneradorWizard() {
  const router = useRouter();
  const { artefactos } = useEcosistema();
  const [paso, setPaso] = useState(1);
  const [universidad, setUniversidad] = useState<Universidad>(null);
  const [modalidad, setModalidad] = useState<Modalidad>(null);
  const [fuente, setFuente] = useState<Fuente>(null);

  const irAlWorkspace = () => router.push('/ecosistema/generador/workspace');

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                paso === n ? 'bg-amber-600 text-white' : paso > n ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>{n}</span>
              {n < 3 && <span className="h-px w-8 bg-slate-300" />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <Step titulo="¿Para qué universidad?" descripcion="El formato del documento final depende de esto.">
            <OpcionGrande
              label="UMSS — Universidad Mayor de San Simón"
              descripcion="Formato oficial UMSS · 5 capítulos + bibliografía APA 7"
              seleccionado={universidad === 'UMSS'}
              onClick={() => setUniversidad('UMSS')}
            />
            <OpcionGrande
              label="UNIFRANZ Cochabamba"
              descripcion="5 modalidades distintas · formato Roxana Beltrán · bibliografía con apellidos en minúscula"
              seleccionado={universidad === 'UNIFRANZ'}
              onClick={() => setUniversidad('UNIFRANZ')}
            />
            <BotonSiguiente disabled={!universidad} onClick={() => setPaso(2)} />
          </Step>
        )}

        {paso === 2 && (
          <Step titulo="¿Qué modalidad?" descripcion="Cada modalidad tiene sus fases obligatorias específicas.">
            {universidad === 'UMSS' ? (
              <>
                <OpcionGrande label="Monografía" descripcion="5 capítulos · Cap 0 a Cap V + bibliografía" seleccionado={modalidad === 'monografia'} onClick={() => setModalidad('monografia')} />
                <OpcionGrande label="Tesis" descripcion="3 capítulos formales + marco práctico" seleccionado={modalidad === 'tesis'} onClick={() => setModalidad('tesis')} />
              </>
            ) : (
              <>
                <OpcionGrande label="Pre-Factibilidad" descripcion="Plan de negocio completo · PESTEL + Porter + Marketing + Financiero" seleccionado={modalidad === 'pre-factibilidad'} onClick={() => setModalidad('pre-factibilidad')} />
                <OpcionGrande label="Mejora Organizacional" descripcion="Microentorno + Estrategias + Plan de implementación" seleccionado={modalidad === 'mejora-org'} onClick={() => setModalidad('mejora-org')} />
                <OpcionGrande label="Artefacto / Producto IoT" descripcion="Especificaciones técnicas + prototipo + validación" seleccionado={modalidad === 'artefacto'} onClick={() => setModalidad('artefacto')} />
                <OpcionGrande label="Trabajo Dirigido" descripcion="Diagnóstico institucional + propuesta + seguimiento" seleccionado={modalidad === 'trabajo-dirigido'} onClick={() => setModalidad('trabajo-dirigido')} />
              </>
            )}
            <BotonSiguiente disabled={!modalidad} onClick={() => setPaso(3)} />
          </Step>
        )}

        {paso === 3 && (
          <Step titulo="¿De dónde sacamos el contenido?" descripcion="Define cómo arranca tu proyecto.">
            <OpcionGrande
              label={`Importar mis artefactos (${artefactos.length} detectados)`}
              descripcion="El Generador llena automáticamente las fases que ya trabajaste. Tú solo refinas."
              seleccionado={fuente === 'importar'}
              onClick={() => setFuente('importar')}
            />
            <OpcionGrande
              label="Empezar desde cero"
              descripcion="El Generador crea tareas en cada plataforma educativa para que las completes."
              seleccionado={fuente === 'cero'}
              onClick={() => setFuente('cero')}
            />
            <button
              disabled={!fuente}
              onClick={irAlWorkspace}
              className="mt-6 w-full rounded-full bg-amber-600 py-3 font-medium text-white hover:bg-amber-700 disabled:bg-slate-300"
            >
              Crear proyecto →
            </button>
          </Step>
        )}
      </section>
    </>
  );
}

function Step({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-2 text-slate-600">{descripcion}</p>
      <div className="mt-6 space-y-3">{children}</div>
    </div>
  );
}

function OpcionGrande({ label, descripcion, seleccionado, onClick }: { label: string; descripcion: string; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border-2 p-4 text-left transition ${
        seleccionado ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
    </button>
  );
}

function BotonSiguiente({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="mt-6 w-full rounded-full bg-slate-900 py-3 font-medium text-white hover:bg-slate-800 disabled:bg-slate-300"
    >
      Siguiente
    </button>
  );
}
```

### Paso 11.2 — Verificación

- [ ] El wizard navega paso 1 → 2 → 3 → workspace. Cada paso requiere selección.

### Paso 11.3 — Commit

```bash
git add src/app/ecosistema/generador/wizard/
git commit -m "feat(ecosistema): wizard de creación de proyecto con 3 pasos"
```

---

## Tarea 12: Generador — Workspace por fases

**Files:**
- Create: `src/app/ecosistema/generador/workspace/page.tsx`

### Paso 12.1 — Workspace con lista de fases y estado de importación

- [ ] Crear `src/app/ecosistema/generador/workspace/page.tsx`.

```typescript
'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { useEcosistema } from '@/lib/ecosistema/mock-state';
import { PROYECTO_UNIFRANZ_DEMO } from '@/lib/ecosistema/mock-data';

export default function GeneradorWorkspace() {
  const { artefactos } = useEcosistema();
  const proyecto = PROYECTO_UNIFRANZ_DEMO;
  const completadas = proyecto.fases.filter(f => f.estado === 'completada').length;
  const total = proyecto.fases.length;

  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-amber-700">
            UNIFRANZ · Pre-Factibilidad
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{proyecto.titulo}</h1>
          <p className="mt-2 text-slate-600">
            {completadas} de {total} fases completas — el {Math.round((completadas / total) * 100)}% importado desde tus plataformas.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${(completadas / total) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {proyecto.fases.map(f => {
            const artefacto = artefactos.find(a => a.id === f.fuenteArtefacto);
            const colorEstado = f.estado === 'completada' ? 'emerald' : f.estado === 'en-progreso' ? 'amber' : 'slate';
            return (
              <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-${colorEstado}-100 text-sm font-bold text-${colorEstado}-700`}>
                  {f.numero}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{f.titulo}</p>
                  {f.contenidoPreview && (
                    <p className="mt-1 text-xs text-slate-500">{f.contenidoPreview}</p>
                  )}
                  {artefacto && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      ✓ Importado desde {artefacto.platformId}
                    </p>
                  )}
                </div>
                <button className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  f.estado === 'completada' ? 'bg-emerald-100 text-emerald-800' :
                  f.estado === 'en-progreso' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {f.estado === 'completada' ? 'Ver / editar' : f.estado === 'en-progreso' ? 'Continuar' : 'Comenzar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">¿Listo para consolidar?</p>
          <p className="mt-1 text-sm text-amber-900/80">
            Cuando todas las fases estén completas, la IA cose tu documento final en formato UNIFRANZ.
          </p>
          <Link
            href="/ecosistema/generador/consolidar"
            className="mt-4 inline-flex rounded-full bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Pre-visualizar consolidación →
          </Link>
        </div>
      </section>
    </>
  );
}
```

### Paso 12.2 — Verificación

- [ ] http://localhost:3000/ecosistema/generador/workspace muestra 17 fases (preview UNIFRANZ Pre-Factibilidad). Las 5 importadas se ven con badge verde "Importado desde [plataforma]".

### Paso 12.3 — Commit

```bash
git add src/app/ecosistema/generador/workspace/
git commit -m "feat(ecosistema): workspace del Generador con fases UNIFRANZ pre-factibilidad"
```

---

## Tarea 13: Generador — Consolidación con IA simulada

**Files:**
- Create: `src/app/ecosistema/generador/consolidar/page.tsx`
- Create: `src/components/ecosistema/IAConsolidacionPreview.tsx`

### Paso 13.1 — Componente de animación de IA consolidando

- [ ] Crear `src/components/ecosistema/IAConsolidacionPreview.tsx`. Animación stagger de "líneas de prosa generándose".

```typescript
'use client';

import { motion } from 'framer-motion';

const LINEAS_DEMO = [
  'Cosiendo Resumen Ejecutivo con datos del Plan Financiero…',
  'Generando Introducción a partir de PESTEL y Estudio de Mercado…',
  'Redactando Marco Teórico de la modalidad Pre-Factibilidad…',
  'Importando análisis PESTEL como sección 2.1 Macroentorno…',
  'Insertando Estudio de Mercado (n=384) como sección 2.5…',
  'Vinculando Plan Financiero (VAN Bs. 124,580) a la sección 3.4…',
  'Aplicando formato Roxana Beltrán de UNIFRANZ…',
  'Generando bibliografía APA 7 con apellidos en minúscula…',
  'Renderizando gráficos pgfplots vectoriales…',
  'Validando coherencia entre fases con el guardián anti-alucinación…',
  '✓ Documento listo para defensa.',
];

export function IAConsolidacionPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-sm text-emerald-300">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="font-mono text-xs text-emerald-200">IA consolidando…</span>
      </div>
      <ol className="space-y-1.5 font-mono text-xs leading-relaxed">
        {LINEAS_DEMO.map((linea, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.45, duration: 0.3 }}
            className={linea.startsWith('✓') ? 'mt-3 font-bold text-emerald-400' : ''}
          >
            {linea.startsWith('✓') ? linea : `> ${linea}`}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
```

### Paso 13.2 — Página de consolidación

- [ ] Crear `src/app/ecosistema/generador/consolidar/page.tsx`.

```typescript
'use client';

import Link from 'next/link';
import { EcosystemNav } from '@/components/ecosistema/EcosystemNav';
import { IAConsolidacionPreview } from '@/components/ecosistema/IAConsolidacionPreview';

export default function GeneradorConsolidar() {
  return (
    <>
      <EcosystemNav />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link href="/ecosistema/generador/workspace" className="text-sm text-slate-500 hover:text-slate-900">
            ← Volver al workspace
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Consolidación con IA</h1>
          <p className="mt-2 text-slate-600">
            La IA toma todas tus fases (importadas + las que completaste) y las cose en un documento académico final.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <IAConsolidacionPreview />

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 font-semibold text-slate-900">Documento generado</h2>
            <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-700">
              <p className="font-bold">CAFETERÍA LA ORQUÍDEA</p>
              <p>Plan de Negocio · Pre-Factibilidad</p>
              <p className="mt-2 text-slate-500">UNIFRANZ Cochabamba · 2026</p>
              <hr className="my-3 border-slate-300" />
              <p className="font-semibold">Resumen Ejecutivo</p>
              <p className="mt-1">El presente plan presenta la propuesta de implementación de una cafetería especializada en la zona norte de Cochabamba. El análisis de mercado realizado con una muestra de 384 personas revela una demanda insatisfecha de 3,720 clientes/mes...</p>
              <p className="mt-3 text-slate-500">[114 páginas generadas]</p>
            </div>

            <div className="mt-5 space-y-2">
              <button className="w-full rounded-full bg-amber-600 py-3 font-medium text-white hover:bg-amber-700">
                Descargar PDF
              </button>
              <button className="w-full rounded-full border border-slate-300 bg-white py-3 font-medium text-slate-900 hover:bg-slate-50">
                Abrir en Overleaf (LaTeX)
              </button>
              <button className="w-full rounded-full border border-slate-300 bg-white py-3 font-medium text-slate-900 hover:bg-slate-50">
                Editar antes de exportar
              </button>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <p className="font-semibold text-sky-900">Trazabilidad: por qué este documento es defendible</p>
          <ul className="mt-3 space-y-1 text-sm text-sky-900/80">
            <li>· El estudio de mercado proviene de TU encuesta real con 384 respuestas (no inventada).</li>
            <li>· El análisis financiero proviene de TU simulación en SimuladorPRO (con tus parámetros).</li>
            <li>· El PESTEL y FODA los validaste en la plataforma de Estrategia con scoring guiado.</li>
            <li>· El plan de marketing se basa en datos reales de Meta Ads y TikTok Ads.</li>
            <li>· Si tu tutor pregunta "¿de dónde sacaste esto?", tienes evidencia en cada plataforma.</li>
          </ul>
        </section>
      </section>
    </>
  );
}
```

### Paso 13.3 — Verificación

- [ ] http://localhost:3000/ecosistema/generador/consolidar muestra animación de líneas de IA generándose una a una, vista previa del documento, y bloque de trazabilidad.

### Paso 13.4 — Commit

```bash
git add src/app/ecosistema/generador/consolidar/ src/components/ecosistema/IAConsolidacionPreview.tsx
git commit -m "feat(ecosistema): vista de consolidación con IA simulada y trazabilidad"
```

---

## Tarea 14: Pricing transversal y modelo de negocio

**Files:**
- Modify: `src/app/ecosistema/page.tsx` (agregar sección de pricing al final)
- Create: `src/components/ecosistema/PricingCard.tsx`

### Paso 14.1 — Componente PricingCard

- [ ] Crear `src/components/ecosistema/PricingCard.tsx`.

```typescript
interface PricingCardProps {
  nombre: string;
  precio: number;
  periodo: string;
  descripcion: string;
  features: string[];
  destacado?: boolean;
  cta: string;
}

export function PricingCard({ nombre, precio, periodo, descripcion, features, destacado, cta }: PricingCardProps) {
  return (
    <div className={`relative rounded-3xl border p-6 ${
      destacado ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-200 bg-white'
    }`}>
      {destacado && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
          Más popular
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-900">{nombre}</h3>
      <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
      <p className="mt-4">
        <span className="text-4xl font-bold text-slate-900">Bs. {precio}</span>
        <span className="text-sm text-slate-500"> /{periodo}</span>
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        {features.map(f => (
          <li key={f} className="flex gap-2">
            <span className="text-emerald-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-6 w-full rounded-full py-3 font-medium ${
        destacado ? 'bg-amber-600 text-white hover:bg-amber-700' : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
      }`}>
        {cta}
      </button>
    </div>
  );
}
```

### Paso 14.2 — Agregar sección Pricing a la landing

- [ ] Editar `src/app/ecosistema/page.tsx`: agregar bloque de pricing antes del cierre del componente, después de la sección del Generador.

Importar `PricingCard` en el head del archivo y agregar al final del JSX (antes del cierre del fragmento):

```typescript
<section className="mx-auto max-w-7xl px-6 py-16" id="pricing">
  <div className="mb-10 text-center">
    <h2 className="text-3xl font-bold text-slate-900">Tres formas de empezar</h2>
    <p className="mt-2 text-slate-600">Standalone para una plataforma · Bundle para todas · Generador para tu proyecto académico.</p>
  </div>
  <div className="grid gap-6 lg:grid-cols-3">
    <PricingCard
      nombre="Plataforma individual"
      precio={49}
      periodo="mes"
      descripcion="Acceso a una plataforma educativa específica."
      features={[
        'Una plataforma a elegir',
        'Clases ilimitadas',
        'Artefactos exportables (PDF, JSON)',
        'Soporte por correo',
      ]}
      cta="Elegir plataforma"
    />
    <PricingCard
      nombre="Bundle Universidad"
      precio={99}
      periodo="mes"
      descripcion="Las 4 plataformas educativas en una sola cuenta."
      features={[
        'Finanzas + Mercados + Estrategia + Marketing',
        'SimuladorPRO integrado',
        'APIs de mercado en vivo',
        'Soporte prioritario',
      ]}
      destacado
      cta="Empezar bundle"
    />
    <PricingCard
      nombre="Ecosistema completo"
      precio={199}
      periodo="mes"
      descripcion="Universidad + Generador. Para tesistas y consultores."
      features={[
        'Todo del Bundle Universidad',
        'Generador de proyectos UMSS/UNIFRANZ',
        'Exportación LaTeX/PDF ilimitada',
        'Consolidación con IA avanzada',
        'Asesoría 1:1 mensual',
      ]}
      cta="Hablar con ventas"
    />
  </div>
  <p className="mt-8 text-center text-sm text-slate-500">
    Plan estudiantil: 50% de descuento con correo institucional UMSS o UNIFRANZ.
  </p>
</section>
```

Asegúrate de agregar `import { PricingCard } from '@/components/ecosistema/PricingCard';` al inicio del archivo.

### Paso 14.3 — Verificación

- [ ] La landing ahora termina con 3 cards de pricing — Plataforma individual / Bundle Universidad / Ecosistema completo.

### Paso 14.4 — Commit

```bash
git add src/components/ecosistema/PricingCard.tsx src/app/ecosistema/page.tsx
git commit -m "feat(ecosistema): pricing transversal con 3 planes (individual/bundle/ecosistema)"
```

---

## Self-Review

**Spec coverage check:**

| Requisito | Cubierto en |
|---|---|
| 4 plataformas educativas (Finanzas, Mercados, Estrategia, Marketing) | Tareas 4, 5-7, 8, 9 |
| Hub Central SSO simulado | Tarea 3 |
| Mundo "Universidad" navegable | Tareas 3-9 |
| Mundo "Generador" con wizard + workspace + consolidación | Tareas 10-13 |
| Conexión opcional entre mundos (importar artefactos) | Tareas 10, 11, 12 |
| Modelo de negocio visible (pricing) | Tarea 14 |
| Stack Next.js 16 App Router + Tailwind + Framer Motion | Sí — sin dependencias nuevas |
| Aislamiento del WEBAPP actual | Sí — todo bajo `/ecosistema/*`, sin tocar API routes ni prompts |
| Copy español neutro tuteo Bolivia | Sí — auditar cada string en revisión |
| Datos mock centralizados | Sí — Tarea 1 |
| simuladorPRO enchufable después | Sí — CTA externo en Tarea 4, no se acopla |

**Placeholder scan:** Plan revisado — todos los pasos contienen código completo. No hay "TODO", "implement later", "fill in details" ni stubs vacíos.

**Type consistency:** `MockUser`, `MockArtefacto`, `MockProgreso`, `MockFase`, `MockProyecto`, `PlatformId`, `PlatformMeta` se usan consistentemente entre `mock-data.ts`, `mock-auth.ts`, `mock-state.tsx`, `platforms.ts` y todos los componentes que los consumen.

**Auditoría de copy (regla crítica):** Antes de cerrar cada tarea, hacer `grep -r "sabés\|podés\|tenés\|querés\|necesitás\|elegís\|descargás\|subís\|regenerás\|conversás\|esperás\|vos " src/app/ecosistema src/components/ecosistema src/lib/ecosistema` — debe devolver 0 resultados. El proyecto considera el voseo bloqueante.

---

## Ejecución del plan

Plan completo y guardado en `docs/superpowers/plans/2026-06-04-mockup-ecosistema-academico.md`. Dos opciones de ejecución:

**1. Subagent-Driven (recomendada)** — Despacho un subagente fresco por tarea, reviso entre tareas, iteración rápida. Tu rol: validar cada tarea visualmente cuando la termino.

**2. Inline Execution** — Ejecuto las 14 tareas en esta misma sesión con checkpoints. Más rápido pero el contexto se hace grande.

**¿Cuál prefieres?**
