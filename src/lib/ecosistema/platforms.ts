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
  /** Emoji visible en cards/encabezados (opcional, complementa `icono`). */
  emoji?: string;
  /** Bloques o capacidades destacadas del módulo (3-6 ítems). */
  bloques?: string[];
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
    id: 'organizacion',
    nombre: 'Organización & RRHH',
    tagline: 'Organigrama, costos y estructura legal',
    descripcionCorta: 'Arma la estructura interna de tu empresa con planilla boliviana real y trámites legales paso a paso.',
    color: 'amber',
    colorAccent: '#f59e0b',
    icono: 'Building2',
    ruta: '/ecosistema/universidad/organizacion',
    mundo: 'universidad',
    precioStandalone: 49,
    precioBundle: 0,
    emoji: '🧩',
    bloques: [
      'Organigrama jerárquico editable',
      'Planilla RRHH con salarios bolivianos',
      'Estructura legal (FUNDEMPRESA, NIT, AFP)',
      'Plan técnico y operativo',
      'Branding interno (misión, visión, valores)',
    ],
  },
  {
    id: 'defensa',
    nombre: 'Defensa de Tesis y Proyectos',
    tagline: 'Prepara tu defensa con preguntas reales',
    descripcionCorta: 'Banco de preguntas tribunal con respuestas modelo y estrategias para puntos débiles.',
    color: 'indigo',
    colorAccent: '#6366f1',
    icono: 'GraduationCap',
    ruta: '/ecosistema/universidad/defensa',
    mundo: 'universidad',
    precioStandalone: 49,
    precioBundle: 0,
    emoji: '🎓',
    bloques: [
      'Banco de preguntas tribunal por categoría',
      'Respuestas modelo memorizable',
      'Puntos débiles y cómo manejarlos',
      'Frases clave para situaciones difíciles',
    ],
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
