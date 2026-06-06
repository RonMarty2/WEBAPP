/**
 * Plantillas/sugerencias PESTEL con contexto boliviano real (modo B).
 * Son un PUNTO DE PARTIDA editable; el estudiante adapta o borra.
 * Cada dimensión trae factores típicos del entorno boliviano 2024-2026.
 */

export interface DimensionPestel {
  key: 'politico' | 'economico' | 'social' | 'tecnologico' | 'ecologico' | 'legal';
  label: string;
  descripcion: string;
  sugerencias: string[];
}

export const DIMENSIONES_PESTEL: DimensionPestel[] = [
  {
    key: 'politico',
    label: 'Político',
    descripcion: 'Estabilidad de gobierno, políticas públicas, regulación sectorial.',
    sugerencias: [
      'Cambios de gobierno y su efecto en políticas económicas',
      'Estabilidad política a nivel municipal y departamental',
      'Políticas de apoyo (o trabas) a emprendimientos y MIPYMES',
      'Subvenciones y bonos sociales (Juancito Pinto, Juana Azurduy, Renta Dignidad)',
    ],
  },
  {
    key: 'economico',
    label: 'Económico',
    descripcion: 'Inflación, tipo de cambio, poder adquisitivo, acceso a crédito.',
    sugerencias: [
      'Inflación de alimentos y su impacto en costos de insumos',
      'Escasez de dólares y tipo de cambio paralelo',
      'Acceso a crédito (Banco Sol, Banco FIE, microfinancieras)',
      'Poder adquisitivo del segmento objetivo',
      'Crecimiento económico del departamento (PIB regional)',
    ],
  },
  {
    key: 'social',
    label: 'Social',
    descripcion: 'Cultura, demografía, hábitos de consumo, tendencias sociales.',
    sugerencias: [
      'Crecimiento de la clase media urbana en ejes (La Paz, Cochabamba, Santa Cruz)',
      'Tendencia de consumo en "tercer espacio" (cafeterías, coworking)',
      'Migración campo-ciudad y urbanización',
      'Mayor conciencia por productos locales y de origen',
      'Hábitos de consumo de la población joven (18-30)',
    ],
  },
  {
    key: 'tecnologico',
    label: 'Tecnológico',
    descripcion: 'Adopción digital, pagos, plataformas, infraestructura.',
    sugerencias: [
      'Pago por QR universal (interoperabilidad bancaria) ya consolidado',
      'Penetración de smartphones e internet móvil',
      'Apps de delivery (PedidosYa, Yango) consolidadas en ciudades',
      'Uso de redes sociales (TikTok, Instagram) para marketing',
      'Acceso a herramientas digitales de gestión para pymes',
    ],
  },
  {
    key: 'ecologico',
    label: 'Ecológico',
    descripcion: 'Medio ambiente, sostenibilidad, recursos naturales, clima.',
    sugerencias: [
      'Consumo consciente y demanda de productos sostenibles',
      'Gestión de residuos y normativa municipal ambiental',
      'Eventos climáticos (sequías, inundaciones) que afectan insumos',
      'Disponibilidad y costo del agua en la zona',
    ],
  },
  {
    key: 'legal',
    label: 'Legal',
    descripcion: 'Marco normativo, tributación, requisitos formales.',
    sugerencias: [
      'Régimen tributario aplicable (Régimen General, RAU, Régimen Simplificado)',
      'Requisitos de constitución (NIT en Impuestos, registro en Fundempresa)',
      'Obligaciones laborales y aportes patronales (CNS, AFP, 30.37%)',
      'Licencia de funcionamiento municipal y registro sanitario (SENASAG si aplica)',
      'Normativa específica del sector',
    ],
  },
];

/** Escala de impacto de un factor PESTEL. */
export const ESCALA_IMPACTO = [
  { valor: -2, label: 'Amenaza fuerte', color: 'rose' },
  { valor: -1, label: 'Amenaza', color: 'rose' },
  { valor: 0, label: 'Neutro', color: 'slate' },
  { valor: 1, label: 'Oportunidad', color: 'emerald' },
  { valor: 2, label: 'Oportunidad fuerte', color: 'emerald' },
];
