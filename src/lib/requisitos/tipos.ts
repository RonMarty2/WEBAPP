/**
 * Tipos compartidos por las listas de requisitos de cada universidad.
 *
 * Cada universidad tiene su archivo (`unifranz-2017.ts`, `ucb-2020.ts`, ...)
 * con la misma forma, para que el inspector funcione igual con todas.
 * Solo datos: no contiene prompts.
 */

export type CategoriaRequisito =
  | "formato"
  | "titulos"
  | "caratula"
  | "preliminares"
  | "redaccion"
  | "citas"
  | "bibliografia"
  | "estructura";

export interface Requisito {
  /** ID estable (no renombrar: lo usarán los informes del inspector). */
  id: string;
  categoria: CategoriaRequisito;
  /** Qué exige la guía, en una frase comprobable. */
  regla: string;
  /** Quién lo comprueba: código (exacto) o IA (depende del contenido). */
  verificador: "codigo" | "ia";
  /** Página impresa de la guía que lo respalda (si es del cuerpo de la guía). */
  pagina?: number;
  /** Cuando no hay página: dónde está (ej. "Anexo 1, art. 68"). */
  referencia?: string;
  /** Valor numérico o textual exacto cuando aplica. */
  valor?: Record<string, string | number | boolean>;
  /** Si solo aplica a algunas modalidades. Vacío = todas. */
  modalidades?: string[];
  /** Ambigüedad de la guía que debe confirmar una persona antes de exigirlo. */
  pendiente?: string;
}

export interface GuiaOficial {
  universidad: string;
  nombre: string;
  anio: number;
  /** Páginas leídas para armar la lista. */
  paginas_leidas: string;
  url_pdf: string;
}
