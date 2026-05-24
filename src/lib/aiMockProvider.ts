/**
 * aiMockProvider — modo de validación SIN tokens reales.
 *
 * Se activa AUTOMÁTICAMENTE cuando NO hay ninguna API key real configurada
 * (env vars vacías). Devuelve contenido stub representativo por fase, lo
 * que permite validar el flujo end-to-end (frontend → backend → provider →
 * persistencia → UI) sin gastar un solo token.
 *
 * Cuando el usuario agrega al menos una API key real en Vercel, el modo
 * mock se desactiva solo y el sistema usa el proveedor real. NO HAY RIESGO
 * de que el mock se active accidentalmente con keys configuradas.
 *
 * Cada respuesta mock incluye un banner CLARO que indica al estudiante que
 * está viendo contenido de validación, no contenido real.
 */

import {
  HUB_CAP0,
  HUB_CAP1,
  HUB_CAP2,
  HUB_CAP3A_PESTEL,
  HUB_CAP3_FULL,
  HUB_CAP4_FULL,
  HUB_RESUMEN,
  HUB_CONCLUSIONES,
  HUB_REFERENCIAS,
  HUB_DEFENSA,
  HUB_LATEX_NOTE,
} from "./aiMockHubAgricola";

export const MOCK_BANNER = `> ⚠️ **MODO DEMOSTRACIÓN — Contenido del proyecto piloto "Hub Agrícola"**
>
> Este es contenido de demostración generado para un proyecto piloto
> (VallEnlace S.R.L. — plataforma digital agrícola Cochabamba). Sirve
> para que veas cómo se ve el output académico completo del sistema sin
> necesidad de tener una API key configurada. **Cuando se configure una
> API key real, el sistema generará contenido específico para el proyecto
> de cada estudiante, no este texto fijo.**

`;

interface MockSpec {
  matcher: RegExp;
  faseLabel: string;
  body: string;
}

/**
 * Catálogo de respuestas mock por tipo de fase. El matcher se aplica sobre
 * el system prompt para detectar qué fase está generándose. Las respuestas
 * son cortas pero estructuralmente representativas (títulos, tablas, citas,
 * bloques tikz/latex) para que el render del workspace muestre todo lo que
 * mostrará en producción.
 */
// 🎯 ORDEN CRÍTICO: los matchers se evalúan en orden, el primero que
// matche gana. Por eso los matchers MÁS ESPECÍFICOS van PRIMERO.
//
// Cada matcher usa una frase ÚNICA del system prompt de esa fase que
// NO aparece en los system prompts de otras fases. Hardcoded de los
// prompts en src/lib/prompts/proyectoGrado/cap*.ts. Si los prompts
// cambian, hay que actualizar también los matchers.
//
// Ej: "8 secciones obligatorias" solo aparece en cap1-marco-referencial.ts,
// "25 a 35 conceptos" solo en cap2-marco-teorico.ts, etc.
const MOCK_RESPONSES: MockSpec[] = [
  // 🎯 NOTA: matchers usan frases que SOLO aparecen en el prompt
  // específico de cada fase, NO en reglas-comunes.ts (que las importan
  // todos los prompts). Frases como 'AUTORES AUTORIZADOS' o 'whitelist'
  // están prohibidas en matchers porque ahora aparecen en reglas-comunes
  // y matchearían cualquier fase.

  // ── Cap. IV — Marco Propositivo (sub-fases muy específicas)
  {
    matcher: /Estudio\s+Organizacional|organigrama.*funcional|misi[óo]n.*visi[óo]n.*valores|estructura\s+organizacional/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Estudio\s+T[ée]cnico|Diagrama\s+de\s+flujo\s+de\s+producci[óo]n|capacidad\s+instalada|layout\s+de\s+planta/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Estudio\s+Financiero|Proyecci[óo]n\s+de\s+ingresos.*5\s+a[ñn]os|Inversi[óo]n\s+en\s+activos\s+fijos|amortizaci[óo]n.*pr[ée]stamo/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Evaluaci[óo]n\s+del\s+Proyecto|VAN.*TIR.*WACC.*payback|an[áa]lisis\s+de\s+sensibilidad|punto\s+de\s+equilibrio/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Marco\s+Legal.*PROY|tipo\s+societario|tr[áa]mites\s+de\s+constituci[óo]n|r[ée]gimen\s+tributario/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Pol[íi]tica\s+de\s+Recursos\s+Humanos|RRHH.*proyectada|estructura\s+salarial|procesos\s+de\s+selecci[óo]n/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Branding.*PROY|manual\s+de\s+marca|briefs?\s+(?:de|para)\s+(?:logos?|logotipo)|paleta\s+crom[áa]tica/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },
  {
    matcher: /Plan\s+de\s+Marketing|Mix\s+de\s+marketing.*7P|presupuesto\s+promocional|estrategia\s+de\s+precio/i,
    faseLabel: "Cap. IV — Marco Propositivo (Hub Agrícola)",
    body: HUB_CAP4_FULL,
  },

  // ── Cap. III — Marco Situacional (sub-fases muy específicas)
  {
    matcher: /An[áa]lisis\s+del\s+Macroentorno.*PESTEL|6\s+factores.*Pol[íi]tico|impacto.*probabilidad.*puntuaci[óo]n/i,
    faseLabel: "Cap. III §3.1 — PESTEL (Hub Agrícola)",
    body: HUB_CAP3A_PESTEL,
  },
  {
    matcher: /5\s+Fuerzas\s+de\s+Porter|cinco\s+fuerzas\s+competitivas|amenaza\s+de\s+nuevos\s+entrantes|rivalidad\s+entre\s+competidores/i,
    faseLabel: "Cap. III — Marco Situacional (Hub Agrícola)",
    body: HUB_CAP3_FULL,
  },
  {
    matcher: /matrices\s+estrat[ée]gicas|matriz\s+FODA|matriz\s+EFE|matriz\s+EFI|matriz\s+MPC|perfil\s+competitivo/i,
    faseLabel: "Cap. III — Marco Situacional (Hub Agrícola)",
    body: HUB_CAP3_FULL,
  },
  {
    matcher: /Dise[ñn]o\s+(?:del|de\s+la)\s+(?:Instrumento|encuesta)|cuestionario\s+(?:formal|estructurado)|escala\s+Likert/i,
    faseLabel: "Cap. III — Marco Situacional (Hub Agrícola)",
    body: HUB_CAP3_FULL,
  },
  {
    matcher: /An[áa]lisis\s+de\s+Resultados.*Encuesta|tabulaci[óo]n\s+univariada|chi.cuadrado|CON_DATA_REAL|modo.*PROYECCION/i,
    faseLabel: "Cap. III — Marco Situacional (Hub Agrícola)",
    body: HUB_CAP3_FULL,
  },
  {
    matcher: /Determinaci[óo]n\s+(?:de\s+la\s+)?(?:Demanda|Cuota)|demanda\s+potencial\s+insatisfecha|cuota\s+de\s+mercado\s+proyectada/i,
    faseLabel: "Cap. III — Marco Situacional (Hub Agrícola)",
    body: HUB_CAP3_FULL,
  },

  // ── Cap. II — fingerprint único: glosario de 25-35 conceptos
  {
    matcher: /Marco\s+Te[óo]rico\s+Conceptual|25\s*a\s*35\s+conceptos|glosario\s+de\s+(?:los?\s+)?conceptos\s+clave|Conceptos\s+OBLIGATORIOS/i,
    faseLabel: "Cap. II — Marco Teórico (Hub Agrícola)",
    body: HUB_CAP2,
  },

  // ── Cap. I — fingerprint único: 8 secciones, antecedentes, muestreo
  {
    matcher: /8\s+secciones\s+obligatorias|MARCO\s+REFERENCIAL.*Cap[íi]tulo\s+I\b|Antecedentes\s+del\s+trabajo\s+acad[ée]mico|[Áá]rbol\s+de\s+problemas|formulaci[óo]n\s+del\s+problema/i,
    faseLabel: "Cap. I — Marco Referencial (Hub Agrícola)",
    body: HUB_CAP1,
  },

  // ── Cap. 0 — fingerprint único: tutor académico + 3 títulos
  {
    matcher: /FASE\s*0.*IDEA\s+DE\s+NEGOCIO|tutor\s+acad[ée]mico\s+experimentado|Tres\s+propuestas\s+de\s+t[íi]tulo|REPORTE\s+DE\s+BLOQUEO\s+EDITORIAL/i,
    faseLabel: "Cap. 0 — Idea de Negocio (Hub Agrícola)",
    body: HUB_CAP0,
  },

  // ── Cierre del documento (van DESPUÉS de Cap. 0 porque sus frases
  //    distintivas no aparecen en los prompts de los capítulos)
  {
    matcher: /BIBLIOGRAF[ÍI]A\s+FINAL\s+APA\s*7|consolida\s+todas\s+las\s+citas|ordenar\s+alfab[ée]ticamente\s+por\s+apellido/i,
    faseLabel: "Referencias Bibliográficas (Hub Agrícola)",
    body: HUB_REFERENCIAS,
  },
  {
    matcher: /conclusiones\s+por\s+objetivo\s+espec[íi]fico|conclusi[óo]n\s+general\s+del\s+proyecto|recomendaciones\s+al\s+inversionista/i,
    faseLabel: "Conclusiones (Hub Agrícola)",
    body: HUB_CONCLUSIONES,
  },
  {
    matcher: /Resumen\s+Ejecutivo.*350\s+palabras|abstract\s+ejecutivo|Resumen\s+Ejecutivo.*450\s+palabras|Resumen\s+Ejecutivo.*500\s+palabras/i,
    faseLabel: "Resumen Ejecutivo (Hub Agrícola)",
    body: HUB_RESUMEN,
  },
  {
    matcher: /banco\s+de\s+preguntas\s+para\s+defensa|tribunal\s+examinador|preguntas\s+de\s+defensa/i,
    faseLabel: "Banco de Preguntas Defensa (Hub Agrícola)",
    body: HUB_DEFENSA,
  },
  {
    matcher: /SISTEMA_SCRIBE_LATEX|compilar.*\.tex\s+final|carátula\s+autom[áa]tica.*LaTeX/i,
    faseLabel: "Compilación LaTeX (Hub Agrícola)",
    body: HUB_LATEX_NOTE,
  },

  // ── Fallback: nunca matchea, solo para compatibilidad con el array
  {
    matcher: /__nunca_coincide__xyz999__/i,
    faseLabel: "Fase del proyecto",
    body: `## Síntesis de la idea de negocio

El estudiante propone una iniciativa empresarial con potencial de impacto
local. La presente síntesis valida la viabilidad académica de la propuesta
antes de avanzar a la formulación formal del Capítulo I.

## Segmento objetivo inicial

- **Geográfico**: ciudad de Cochabamba — área metropolitana.
- **Demográfico**: hogares de nivel socioeconómico medio.
- **Psicográfico**: perfil dispuesto a probar propuestas innovadoras.
- **Conductual**: frecuencia de uso semanal estimada.

## Tres propuestas de título académico

1. **⭐ RECOMENDADO** — *Proyecto de factibilidad para la creación de [empresa] en Cochabamba — 2026*
2. *Proyecto de factibilidad para la creación de [variante alcance] en el área metropolitana — 2026*
3. *Proyecto de factibilidad para la creación de [variante enfoque] del Valle Central — 2026*

## Validación de viabilidad académica

| # | Criterio | Estado |
|---|---|:---:|
| 1 | Datos secundarios PESTEL | ✅ |
| 2 | Competidores identificables | ✅ |
| 3 | Factibilidad de encuesta | ✅ |
| 4 | Costos razonables | ✅ |

## Próximos pasos sugeridos

1. Realizar observación de campo en el segmento objetivo.
2. Conversar con tres a cinco usuarios potenciales reales.
3. Definir el alcance del MVP a evaluar.
4. Validar el tema con el tutor académico UCATEC.`,
  },

];

/**
 * Genera una respuesta mock representativa según el system prompt.
 *
 * 🎯 IMPORTANTE: matcheamos SOLAMENTE contra el systemPrompt, NO contra
 * el userPrompt. El system prompt define la fase (es estático por fase),
 * el user prompt incluye el contexto del estudiante + fases aprobadas
 * anteriores. Si matcheamos contra ambos, al pedir Cap. I el user prompt
 * incluye el output del Cap. 0 aprobado (con frases como "tres propuestas
 * de título") y eso disparaba erróneamente el matcher de Cap. 0.
 *
 * Si ningún matcher coincide, devuelve un stub genérico que igualmente
 * permite validar el flujo (el contenido se persiste y se renderiza).
 */
/**
 * Mapa de phase_id → contenido mock. 100% confiable (sin regex).
 * Cada fase del Proyecto de Grado tiene su contenido específico.
 * Las subfases de Cap. III y Cap. IV comparten un mismo bloque que
 * incluye la fase relevante.
 */
const MOCK_BY_PHASE_ID: Record<string, string> = {
  "ph-proy-cap0":       HUB_CAP0,
  "ph-proy-cap1":       HUB_CAP1,
  "ph-proy-cap2":       HUB_CAP2,
  "ph-proy-cap3a":      HUB_CAP3A_PESTEL,
  "ph-proy-cap3b":      HUB_CAP3_FULL,
  "ph-proy-cap3c":      HUB_CAP3_FULL,
  "ph-proy-cap3d":      HUB_CAP3_FULL,
  "ph-proy-cap3e":      HUB_CAP3_FULL,
  "ph-proy-cap3f":      HUB_CAP3_FULL,
  "ph-proy-cap4a":      HUB_CAP4_FULL,
  "ph-proy-cap4abis":   HUB_CAP4_FULL,
  "ph-proy-cap4b":      HUB_CAP4_FULL,
  "ph-proy-cap4c":      HUB_CAP4_FULL,
  "ph-proy-cap4d":      HUB_CAP4_FULL,
  "ph-proy-cap4e":      HUB_CAP4_FULL,
  "ph-proy-cap4f":      HUB_CAP4_FULL,
  "ph-proy-cap4g":      HUB_CAP4_FULL,
  "ph-proy-resumen":    HUB_RESUMEN,
  "ph-proy-conclus":    HUB_CONCLUSIONES,
  "ph-proy-referencias":HUB_REFERENCIAS,
  "ph-proy-defensa":    HUB_DEFENSA,
  "ph-proy-latex":      HUB_LATEX_NOTE,
};

/**
 * Genera una respuesta mock representativa.
 *
 * Estrategia de selección (en orden):
 * 1. Si el system prompt contiene marker [[MOCK_PHASE_ID:xxx]] (inyectado
 *    explícitamente por el endpoint generate-phase), selecciona por
 *    phase_id directo. 100% confiable.
 * 2. Si no hay marker, hace fallback a regex sobre system prompt (menos
 *    confiable pero útil para llamadas legacy sin contexto).
 *
 * Devuelve el contenido SIN banner (el banner es solo UI, no contamina
 * el contenido persistido).
 */
export function generateMockResponse(systemPrompt: string, _userPrompt: string): string {
  // 1) Estrategia primaria: marker phase_id
  const markerMatch = systemPrompt.match(/\[\[MOCK_PHASE_ID:([^\]]+)\]\]/);
  if (markerMatch) {
    const phaseId = markerMatch[1].trim();
    const body = MOCK_BY_PHASE_ID[phaseId];
    if (body) return body;
    // Si el phase_id no está en el mapa, fallback al regex
  }

  // 2) Fallback regex (para llamadas legacy)
  const match = MOCK_RESPONSES.find((spec) => spec.matcher.test(systemPrompt));
  return match?.body ?? `Contenido de la fase. El sistema generará texto académico completo cuando se configuren las API keys reales.`;
}

/**
 * Detecta si el modo MOCK debe activarse.
 *
 * Lógica de activación (en orden):
 * 1. Si MOCK_AI=true está seteado explícitamente, mock activo SIEMPRE
 *    (incluso si hay API keys reales — útil para demo o ahorro de tokens).
 * 2. Si MOCK_AI=false está seteado explícitamente, mock NUNCA activo
 *    (aunque no haya keys — el sistema tira error si no hay keys).
 * 3. Si MOCK_AI no está definido (default), mock se activa SOLO cuando
 *    no hay NINGUNA API key real configurada. Esto permite que el sistema
 *    funcione end-to-end "out of the box" en desarrollo, y se desactive
 *    automáticamente cuando el usuario agrega una key real en Vercel.
 *
 * `lmstudio` se ignora porque su key por defecto es "lm-studio-local"
 * (placeholder, no key real).
 */
export function shouldUseMockMode(providerKeyCache: Map<string, string>): boolean {
  if (process.env.MOCK_AI === "true") return true;
  if (process.env.MOCK_AI === "false") return false;
  const realProviders = ["groq", "anthropic", "openai", "gemini", "mistral", "deepseek", "xai", "cohere", "together", "perplexity"];
  return realProviders.every((id) => !providerKeyCache.get(id));
}
