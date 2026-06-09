export type PlatformId = 'finanzas' | 'mercados' | 'estrategia' | 'marketing' | 'organizacion' | 'defensa';

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
