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
