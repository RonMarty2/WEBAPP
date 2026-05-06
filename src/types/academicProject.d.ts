declare module "@/lib/academicProject.mjs" {
  export interface AcademicRouteOption {
    id: string;
    titulo: string;
    idea_central: string;
    problema: string;
    objetivo_general: string;
    alcance: string;
    materiales_prioritarios: string[];
    justificacion: string;
  }

  export interface FinalDocumentValidation {
    ok: boolean;
    errors: string[];
    warnings: string[];
    wordCount: number;
  }

  export function stripInternalDocumentMarkers(text: string): string;
  export function buildDisplayFinalDocument(
    phaseContents?: Array<string | { label?: string; content?: string | null }>
  ): string;
  export function validateFinalDocument(text: string): FinalDocumentValidation;
  export function normalizeRouteOptions(raw: unknown): AcademicRouteOption[];
  export function parseJsonFromAi(text: string): unknown;
  export function summarizePhaseForMemory(phaseLabel: string, content: string): Record<string, unknown>;
  export function buildAcademicContextBlock(input?: {
    contract?: Record<string, unknown> | null;
    studentContext?: Record<string, unknown>;
    documents?: Record<string, unknown>[];
    phaseMemory?: Record<string, unknown>[];
  }): string;
  export function buildFinalConsolidationPrompt(input?: {
    contract?: Record<string, unknown> | null;
    studentContext?: Record<string, unknown>;
    documents?: Record<string, unknown>[];
    phaseMemory?: Record<string, unknown>[];
    phaseContents?: { label?: string; content?: string | null }[];
    formatRules?: string;
  }): { system: string; user: string };
}
