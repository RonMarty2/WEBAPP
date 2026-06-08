/**
 * Tipos del módulo Identidad Visual.
 *
 * Sub-módulo dentro de Marketing. Un plan de marketing tiene 0 o 1
 * identidades (relación 1:1 cuando existe).
 *
 * Estructura modular: cada sub-herramienta (brief, paleta, tipografía,
 * logo, mockups, manual) tiene su tipo separado para que se pueda
 * iterar/extender sin romper las demás.
 */

// ─── Brief de marca ──────────────────────────────────────────────────────

export interface BriefMarca {
  /** Nombre comercial de la marca (ej. "Café La Orquídea"). */
  nombre: string;
  /** Sector industrial (ej. "Gastronomía / cafetería de especialidad"). */
  sector: string;
  /** En una frase: ¿qué es la marca en su esencia? */
  esencia: string;
  /** 3-5 valores fundamentales (ej. "calidez", "calidad", "comunidad"). */
  valores: string[];
  /** En 1-2 palabras: ¿cómo se siente la marca? (ej. "joven y profesional"). */
  personalidad: string;
  /** Quién es el cliente ideal (snapshot del buyer persona si existe). */
  publico_objetivo: string;
  /** Atributos visuales/emocionales (ej. "artesanal", "minimalista"). */
  atributos: string[];
  /** Referencias de marcas inspiradoras (URLs o nombres). */
  inspiracion: string[];
  /** Estilos o estéticas a EVITAR (ej. "kitsch", "demasiado infantil"). */
  prohibidos: string[];
}

// ─── Paleta de colores ───────────────────────────────────────────────────

export type EsquemaPaleta =
  | 'monocromatica'    // un solo color con variaciones
  | 'analoga'          // colores vecinos en la rueda (suave, armoniosa)
  | 'complementaria'   // opuestos en la rueda (alto contraste)
  | 'triada'           // 3 colores equidistantes (vibrante)
  | 'tetrada'          // 4 colores en rectángulo (rica, requiere balance)
  | 'libre';           // el alumno elige a mano sin algoritmo

export interface Paleta {
  primario: string;       // hex, ej. "#7c3aed"
  secundario: string;
  acento: string;
  neutroClaro: string;
  neutroOscuro: string;
  esquema: EsquemaPaleta;
  justificacion: string;  // por qué estos colores para esta marca
}

// ─── Tipografía ──────────────────────────────────────────────────────────

export type PesoTipografia = '300' | '400' | '500' | '600' | '700' | '800' | '900';

export interface Tipografia {
  /** Fuente principal (titulares). */
  principal: { familia: string; peso: PesoTipografia };
  /** Fuente secundaria (cuerpo, descripciones). */
  secundaria: { familia: string; peso: PesoTipografia };
  justificacion: string;
}

// ─── Logo ────────────────────────────────────────────────────────────────

export type ModeloLogoIA = 'openai-dalle-3' | 'gemini-imagen-3' | 'flux-pro' | 'manual' | 'placeholder';

export interface LogoAlternativa {
  url: string;              // data URI o URL pública
  prompt: string;
  modelo: ModeloLogoIA;
  generado_en: string;      // ISO 8601
}

export interface LogoMarca {
  /** Descripción del concepto del logo (texto). */
  concepto: string;
  /** URL del logo PRINCIPAL elegido. */
  principal_url: string | null;
  /** Prompt enviado a la IA para generar el principal. */
  prompt_usado: string | null;
  /** Alternativas generadas (incluye el principal). */
  alternativas: LogoAlternativa[];
}

// ─── Mockups (aplicaciones visuales) ─────────────────────────────────────

export type TipoMockup =
  | 'tarjeta'      // tarjeta de presentación
  | 'redes'        // post de Instagram/Facebook
  | 'empaque'      // empaque de producto
  | 'merch_polo'   // polo/camiseta
  | 'merch_taza'   // taza
  | 'merch_gorra'  // gorra
  | 'banner'       // banner web/print
  | 'libre';       // otro

export interface Mockup {
  tipo: TipoMockup;
  url: string;              // data URI, URL pública o SVG inline
  descripcion: string;
  generado_en: string;
}

// ─── Estado completo del módulo ──────────────────────────────────────────

export type EstadoIdentidad = 'brief' | 'paleta' | 'tipografia' | 'logo' | 'mockups' | 'completo';

export interface IdentidadVisual {
  id: string;
  plan_id: string;
  estudiante_id: string;
  brief: Partial<BriefMarca>;
  paleta_primario: string | null;
  paleta_secundario: string | null;
  paleta_acento: string | null;
  paleta_neutro_claro: string | null;
  paleta_neutro_oscuro: string | null;
  paleta_esquema: EsquemaPaleta | null;
  paleta_justificacion: string | null;
  tipo_principal_familia: string | null;
  tipo_principal_peso: PesoTipografia | null;
  tipo_secundaria_familia: string | null;
  tipo_secundaria_peso: PesoTipografia | null;
  tipo_justificacion: string | null;
  logo_concepto: string | null;
  logo_principal_url: string | null;
  logo_prompt_usado: string | null;
  logo_alternativas: LogoAlternativa[];
  mockups: Mockup[];
  estado: EstadoIdentidad;
  creado_en: string;
  actualizado_en: string;
}
