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

export const MOCK_BANNER = `> ⚠️ **MODO DEMOSTRACIÓN — Contenido de validación técnica**
>
> Este texto fue generado por el sistema en *modo mock* porque aún no hay
> ninguna API key configurada (Groq, Anthropic u OpenAI). El flujo técnico
> ha funcionado correctamente: la solicitud salió del frontend, llegó al
> backend, fue procesada por el motor y este contenido se persistió en la
> base de datos. **Cuando se configuren las API keys reales, este texto
> será reemplazado por contenido académico generado por el modelo.**

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
const MOCK_RESPONSES: MockSpec[] = [
  {
    matcher: /CAP0|cap0|idea.*negocio.*fase\s*0/i,
    faseLabel: "Cap. 0 — Idea de Negocio",
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

  {
    matcher: /CAP1|cap1|marco.*referencial|cap[íi]tulo\s*i\b/i,
    faseLabel: "Cap. I — Marco Referencial",
    body: `# Capítulo I — Marco Referencial

## 1.1 Antecedentes del trabajo académico

El presente proyecto surge en un contexto de oportunidad sectorial
identificable en el departamento de Cochabamba.

## 1.2 Objeto de estudio

El objeto de estudio del proyecto es la factibilidad de creación y
operación de la empresa propuesta.

## 1.3 Problema

### 1.3.1 Identificación del problema

Se identifica un problema central que afecta al segmento objetivo del
proyecto en condiciones documentables.

### 1.3.2 Árbol de problemas

\`\`\`tikz
\\begin{center}
\\begin{tikzpicture}[node distance=12mm]
\\node[draw, rectangle, fill=yellow!20] (p) {Problema central};
\\node[draw, rectangle, fill=blue!10, below left=of p] (c1) {Causa 1};
\\node[draw, rectangle, fill=blue!10, below right=of p] (c2) {Causa 2};
\\node[draw, rectangle, fill=red!10, above left=of p] (e1) {Efecto 1};
\\node[draw, rectangle, fill=red!10, above right=of p] (e2) {Efecto 2};
\\draw[->] (c1) -- (p); \\draw[->] (c2) -- (p);
\\draw[->] (p) -- (e1); \\draw[->] (p) -- (e2);
\\end{tikzpicture}
\\end{center}
\`\`\`

### 1.3.3 Formulación del problema

¿Es factible la creación de la empresa propuesta en Cochabamba durante el
horizonte 2026 a 2030?

## 1.4 Objetivos

**General.** Determinar la factibilidad académica, comercial, técnica,
organizacional, legal y financiera del proyecto.

**Específicos.** (1) Analizar entorno general y competitivo. (2)
Caracterizar el segmento objetivo. (3) Diseñar la propuesta de servicio.
(4) Estructurar el diseño técnico-legal-organizacional. (5) Evaluar la
viabilidad financiera.

## 1.5 Justificación
Técnica, económica y social — desarrolladas en el documento final.

## 1.6 Alcance
Temático, geográfico y temporal — definidos en el documento final.

## 1.7 Metodología
Enfoque mixto, descriptivo-propositivo, deductivo (Hernández Sampieri et
al., 2014).

## 1.8 Muestreo

\`\`\`latex
\\begin{equation}
n = \\frac{Z^{2} \\cdot p \\cdot q \\cdot N}{e^{2}\\,(N - 1) + Z^{2} \\cdot p \\cdot q}
\\end{equation}
\`\`\``,
  },

  {
    matcher: /CAP2|cap2|marco.*te[óo]rico|cap[íi]tulo\s*ii\b/i,
    faseLabel: "Cap. II — Marco Teórico",
    body: `# Capítulo II — Marco Teórico

Se desarrollan a continuación los conceptos clave que sostienen el
análisis del proyecto.

**Proyecto de inversión.** Conjunto coherente de actividades orientadas a
la creación de una unidad productiva nueva (Sapag Chain et al., 2014).

**Estudio de factibilidad.** Etapa de formulación que examina la
viabilidad integral de una propuesta de inversión (Baca Urbina, 2016).

**Análisis PESTEL.** Herramienta de análisis del macroentorno en seis
dimensiones (David y David, 2017).

**Cinco fuerzas de Porter.** Modelo de análisis del entorno competitivo
de una industria (Porter, 2008).

**Marketing de servicios.** Rama del marketing especializada en
prestaciones intangibles (Lovelock y Wirtz, 2015).

**Mix de marketing 7P.** Producto, Precio, Plaza, Promoción, Personas,
Procesos, Evidencia Física (Zeithaml et al., 2018).

**Valor Actual Neto (VAN).** Indicador de rentabilidad que descuenta los
flujos futuros a una tasa de costo de capital (Brealey et al., 2020).

[Marco teórico completo con 25-35 conceptos en el documento final.]`,
  },

  {
    matcher: /CAP3A|cap3a|pestel|macroentorno/i,
    faseLabel: "Cap. III.1 — PESTEL",
    body: `## 3.1 Análisis del Macroentorno (PESTEL)

### 3.1.1 Factor Político
Análisis del entorno político boliviano relevante para el proyecto.

**Tabla 3.1. Variables del factor Político**

| Variable | Impacto | Probabilidad | Puntuación |
|---|:-:|:-:|:-:|
| Estabilidad institucional | 3 | 3 | 1.8 |
| Programas de fomento | 4 | 4 | 3.2 |
| **Promedio Político** | | | **2.50** |

### 3.1.2 a 3.1.6 — Factores Económico, Social, Tecnológico, Ecológico, Legal
(Misma estructura: análisis + tabla + interpretación)

**Síntesis PESTEL.** Entorno moderadamente favorable para el proyecto.`,
  },

  {
    matcher: /CAP3B|cap3b|porter|fuerzas/i,
    faseLabel: "Cap. III.2 — Porter",
    body: `## 3.2 Análisis del Microentorno (Cinco Fuerzas de Porter)

| Fuerza | Intensidad | Implicación estratégica |
|---|:-:|---|
| Rivalidad existente | 2.5/5 | Ventana de oportunidad |
| Poder proveedores | 2/5 | Fidelización temprana |
| Poder compradores | 4/5 | Diferenciación clara |
| Sustitutos | 3/5 | Énfasis en propuesta única |
| Nuevos entrantes | 3.5/5 | Barreras operativas en 18 meses |
| **Atractivo agregado** | **3.0/5** | **Mercado moderadamente atractivo** |`,
  },

  {
    matcher: /CAP3C|cap3c|matrices|foda|efe|efi|mpc/i,
    faseLabel: "Cap. III.3 — Matrices Estratégicas",
    body: `## 3.3 Matrices Estratégicas

### 3.3.1 Matriz FODA
Fortalezas, oportunidades, debilidades y amenazas identificadas.

### 3.3.2 Matriz EFE: **2.86** (posición ligeramente superior al promedio)
### 3.3.3 Matriz EFI: **3.00** (posición interna sólida)
### 3.3.4 Matriz MPC: proyecto **3.87**, mejor competidor 3.88 (empate técnico)`,
  },

  {
    matcher: /CAP3D|cap3d|dise[ñn]o.*encuesta|instrumento/i,
    faseLabel: "Cap. III.4 — Diseño de Encuesta",
    body: `## 3.4 Diseño del Instrumento de Investigación

### 3.4.1 Segmento objetivo
Definido en el apartado 3.4.1 del documento final.

### 3.4.2 Cálculo del tamaño de muestra

\`\`\`latex
\\begin{equation}
n = \\frac{Z^{2} \\cdot p \\cdot q \\cdot N}{e^{2}\\,(N - 1) + Z^{2} \\cdot p \\cdot q} \\approx 383
\\end{equation}
\`\`\`

### 3.4.3 Tipo de muestreo
No probabilístico por conveniencia con cuotas.

### 3.4.4 Cuestionario
Cuatro bloques: demográficos, hábitos de consumo, percepción oferta
actual, intención hacia la propuesta.`,
  },

  {
    matcher: /CAP3E|cap3e|an[áa]lisis.*encuesta|resultados.*encuesta/i,
    faseLabel: "Cap. III.5 — Análisis de Resultados",
    body: `## 3.5 Análisis de Resultados de la Encuesta

> **⚠️ NOTA METODOLÓGICA — Proyección basada en investigación secundaria**
>
> Los resultados presentados constituyen una proyección académica
> construida a partir de las características del segmento. Las cifras
> sirven para dimensionar el orden de magnitud esperado.

### 3.5.1 Tabulación univariada — Bloque clave

| Categoría | Frecuencia | Porcentaje |
|---|:-:|:-:|
| Muy interesado | 58 | 29.0% |
| Interesado | 86 | 43.0% |
| Indiferente | 36 | 18.0% |
| Poco interesado | 16 | 8.0% |
| Nada interesado | 4 | 2.0% |
| **Total** | **200** | **100%** |

El **72%** del segmento expresa interés positivo en la propuesta.`,
  },

  {
    matcher: /CAP3F|cap3f|demanda|cuota/i,
    faseLabel: "Cap. III.6 — Demanda y Cuota",
    body: `## 3.6 Determinación de la Demanda y Cuota de Mercado

### 3.6.1 Demanda potencial
57.600 hogares del área metropolitana.

### 3.6.2 Demanda real esperada
20.160 hogares activos con frecuencia de 2.5 pedidos mensuales.

### 3.6.3 Proyección de cuota a 5 años

| Año | Cuota | Hogares activos | Pedidos anuales |
|:-:|:-:|:-:|:-:|
| 1 | 0.8% | 161 | 4.836 |
| 3 | 5.0% | 1.008 | 30.240 |
| 5 | 12.0% | 2.419 | 72.576 |`,
  },

  {
    matcher: /CAP4A|cap4a|organizacional|organigrama/i,
    faseLabel: "Cap. IV.1 — Diseño Organizacional",
    body: `## 4.1 Diseño Organizacional

### 4.1.1 Razón social
Empresa propuesta como Sociedad de Responsabilidad Limitada (S.R.L.).

### 4.1.2 Misión, visión y valores
Definidos en el documento final.

### 4.1.3 Organigrama

\`\`\`tikz
\\begin{center}
\\begin{tikzpicture}[node distance=8mm]
\\node[draw, fill=blue!20] (g) {Gerencia General};
\\node[draw, fill=blue!10, below left=of g] (com) {Comercial};
\\node[draw, fill=blue!10, below=of g] (ope) {Operaciones};
\\node[draw, fill=blue!10, below right=of g] (tec) {Tecnología};
\\draw (g) -- (com); \\draw (g) -- (ope); \\draw (g) -- (tec);
\\end{tikzpicture}
\\end{center}
\`\`\`

### 4.1.4 Manual de funciones
Una sección por cargo del organigrama.`,
  },

  {
    matcher: /CAP4ABIS|cap4abis|cap4a-bis|rrhh|recursos humanos/i,
    faseLabel: "Cap. IV.2 — RRHH",
    body: `## 4.2 Política de Recursos Humanos

### 4.2.1 Plantilla proyectada: 6.5 → 21 FTE (años 1-5)
### 4.2.2 Estructura salarial alineada con mercado Cochabamba
### 4.2.3 Procesos de selección, capacitación y evaluación semestral`,
  },

  {
    matcher: /CAP4B|cap4b|legal|jur[íi]dico/i,
    faseLabel: "Cap. IV.3 — Marco Legal",
    body: `## 4.3 Marco Legal

### 4.3.1 Tipo societario: S.R.L. (Código de Comercio de Bolivia)
### 4.3.2 Trámites de constitución: ~60-75 días calendario
### 4.3.3 Régimen tributario: Régimen General IVA-IT-IUE
### 4.3.4 Cumplimiento SENASAG, SEPREC, SIN`,
  },

  {
    matcher: /CAP4C|cap4c|t[ée]cnico|flujograma/i,
    faseLabel: "Cap. IV.4 — Estudio Técnico",
    body: `## 4.4 Estudio Técnico

### 4.4.1 Localización: Cochabamba — Cercado
### 4.4.2 Capacidad operativa proyectada a 5 años
### 4.4.3 Flujograma de procesos

\`\`\`tikz
\\begin{center}
\\begin{tikzpicture}[node distance=10mm]
\\node[draw, ellipse, fill=green!15] (a) {Inicio};
\\node[draw, fill=blue!10, right=of a] (b) {Procesar};
\\node[draw, diamond, aspect=2, fill=orange!15, right=of b] (c) {QC};
\\node[draw, ellipse, fill=red!15, right=of c] (d) {Fin};
\\draw[->] (a) -- (b); \\draw[->] (b) -- (c); \\draw[->] (c) -- (d);
\\end{tikzpicture}
\\end{center}
\`\`\`

### 4.4.4 Inversión técnica: ~Bs. 96.800`,
  },

  {
    matcher: /CAP4D|cap4d|branding|marca|logo/i,
    faseLabel: "Cap. IV.5 — Branding",
    body: `## 4.5 Branding

### 4.5.1 Identidad de marca
Nombre, propuesta de valor y personalidad definidos.

### 4.5.2 Manual de marca
Tipografía, paleta cromática (verde, tierra, crema, carbón), aplicaciones.

### 4.5.3 Briefs de logotipo
Tres conceptos para generación con IA de imágenes (Gemini Imagen,
Ideogram). **NOTA:** la generación efectiva requiere integración del
endpoint correspondiente (pendiente en el backlog #13).`,
  },

  {
    matcher: /CAP4E|cap4e|marketing|promoci[óo]n/i,
    faseLabel: "Cap. IV.6 — Marketing",
    body: `## 4.6 Plan de Marketing

### 4.6.1 Mix de marketing 7P
Producto, Precio, Plaza, Promoción, Personas, Procesos, Evidencia Física.

### 4.6.2 Presupuesto promocional
Entre 7% y 9% de los ingresos proyectados. Total 5 años: Bs. 796.000.`,
  },

  {
    matcher: /CAP4F|cap4f|financiero|inversi[óo]n inicial/i,
    faseLabel: "Cap. IV.7 — Estudio Financiero",
    body: `## 4.7 Estudio Financiero

### 4.7.1 Inversión inicial: **Bs. 230.000**
(60% capital propio + 40% préstamo bancario BDP 6% TEA)

### 4.7.2 Proyección de ingresos por comisión a 5 años

| Concepto | Año 1 | Año 3 | Año 5 |
|---|:-:|:-:|:-:|
| Comisión empresa (12%) | 43.524 | 293.933 | 757.693 |

### 4.7.3 Punto de equilibrio

\`\`\`latex
\\begin{equation}
\\text{PE}_{\\text{mensual}} = \\frac{\\text{Costos fijos}}{\\text{Margen unitario}}
\\end{equation}
\`\`\``,
  },

  {
    matcher: /CAP4G|cap4g|evaluaci[óo]n|VAN|TIR/i,
    faseLabel: "Cap. IV.8 — Evaluación del Proyecto",
    body: `## 4.8 Evaluación del Proyecto

### 4.8.1 VAN (escenario base): **-2.290.000 Bs.** ❌
### 4.8.2 TIR: indefinida (flujos negativos)
### 4.8.3 Análisis de sensibilidad

| Variable | Cambio | VAN |
|---|---|:-:|
| Comisión efectiva 12% → 22% | +servicios B2B | -180.000 |
| **Combinación recalibrada** | 22% + planta -30% | **+340.000** ✅ |

**Conclusión:** proyecto NO viable en escenario base; **viable bajo
configuración recalibrada** (comisión 22% + contención de planta).`,
  },

  {
    matcher: /RESUMEN|resumen.*ejecutivo/i,
    faseLabel: "Resumen Ejecutivo",
    body: `# Resumen Ejecutivo

El proyecto evalúa la factibilidad de creación de la empresa propuesta en
el área metropolitana de Cochabamba para el horizonte 2026-2030. El
análisis PESTEL identifica un escenario moderadamente favorable; el
análisis Porter revela un mercado moderadamente atractivo. El estudio de
mercado proyectado muestra interés positivo del 72% del segmento. La
evaluación financiera bajo la configuración recalibrada arroja VAN
positivo de +340.000 Bs., confirmando la viabilidad del proyecto.`,
  },

  {
    matcher: /CONCLUSIONES/i,
    faseLabel: "Conclusiones",
    body: `# Conclusiones

Una conclusión por cada objetivo específico (5) + conclusión general.

**Conclusión general.** El proyecto **es factible bajo la configuración
recalibrada** propuesta en el análisis de sensibilidad. Se recomienda
adoptar dicha configuración como propuesta final.`,
  },

  {
    matcher: /REFERENCIAS|bibliograf[íi]a/i,
    faseLabel: "Referencias Bibliográficas",
    body: `# Referencias Bibliográficas

Baca Urbina, G. (2016). *Evaluación de proyectos* (8.ª ed.). McGraw-Hill.

Brealey, R. A., Myers, S. C., & Allen, F. (2020). *Principios de finanzas corporativas* (13.ª ed.). McGraw-Hill.

David, F. R., & David, F. R. (2017). *Conceptos de administración estratégica* (15.ª ed.). Pearson.

Hernández Sampieri, R., Fernández Collado, C., & Baptista Lucio, P. (2014). *Metodología de la investigación* (6.ª ed.). McGraw-Hill.

Instituto Nacional de Estadística. (s.f.). *Datos demográficos y económicos de Bolivia*. https://www.ine.gob.bo

Kotler, P., & Armstrong, G. (2017). *Fundamentos de marketing* (13.ª ed.). Pearson.

Lovelock, C., & Wirtz, J. (2015). *Marketing de servicios* (7.ª ed.). Pearson.

Porter, M. E. (2008). *Estrategia competitiva* (2.ª ed.). Pirámide.

Sapag Chain, N., Sapag Chain, R., & Sapag Puelma, J. M. (2014). *Preparación y evaluación de proyectos* (6.ª ed.). McGraw-Hill.

Zeithaml, V. A., Bitner, M. J., & Gremler, D. D. (2018). *Servicios: marketing integrado en el cliente* (6.ª ed.). McGraw-Hill.

[Bibliografía completa en el documento final.]`,
  },

  {
    matcher: /DEFENSA|preguntas/i,
    faseLabel: "Banco de Preguntas — Defensa",
    body: `# Banco de Preguntas para Defensa

1. ¿Qué evidencia primaria sostiene el problema central?
2. ¿Por qué el factor tecnológico obtiene la puntuación más alta del PESTEL?
3. ¿Cómo se justifica académicamente el muestreo no probabilístico?
4. ¿Por qué el VAN base es negativo y qué patrón estructural lo explica?
5. ¿Qué hace que la configuración recalibrada sea la recomendada?

[Banco completo de 20 preguntas en el documento final.]`,
  },

  {
    matcher: /LATEX|latex|compilar/i,
    faseLabel: "Compilación LaTeX",
    body: `\\documentclass[12pt,letterpaper]{report}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{geometry}
\\geometry{letterpaper, left=3cm, right=2.5cm, top=2.5cm, bottom=2.5cm}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\begin{document}
% Carátula UCATEC generada por buildCaratulaUCATEC()
% Capítulos I a IV insertados automáticamente
% Referencias APA 7 al final
\\end{document}`,
  },
];

/**
 * Genera una respuesta mock representativa según el system prompt.
 *
 * Si ningún matcher coincide, devuelve un stub genérico que igualmente
 * permite validar el flujo (el contenido se persiste y se renderiza).
 */
export function generateMockResponse(systemPrompt: string, userPrompt: string): string {
  const blob = `${systemPrompt}\n${userPrompt}`;
  const match = MOCK_RESPONSES.find((spec) => spec.matcher.test(blob));
  const faseLabel = match?.faseLabel ?? "Fase del proyecto";
  const body = match?.body ?? `Contenido de la fase ${faseLabel}. El sistema generará texto académico completo cuando se configuren las API keys reales.`;
  return `${MOCK_BANNER}**Fase detectada por el mock:** ${faseLabel}\n\n${body}`;
}

/**
 * Detecta si NO hay ninguna API key real configurada en el entorno.
 * Se ignora `lmstudio` porque su key por defecto es siempre "lm-studio-local"
 * (no es una key real, es un placeholder que LM Studio ignora).
 */
export function shouldUseMockMode(providerKeyCache: Map<string, string>): boolean {
  const realProviders = ["groq", "anthropic", "openai", "gemini", "mistral", "deepseek", "xai", "cohere", "together", "perplexity"];
  return realProviders.every((id) => !providerKeyCache.get(id));
}
