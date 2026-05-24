/**
 * SISTEMA_PROY_CAP3C — Fase 3c: Matrices Estratégicas.
 *
 * Tercera sub-fase del Capítulo III. Construye las matrices que sintetizan
 * el análisis externo (PESTEL + Porter) y lo cruzan con la posición
 * estratégica del proyecto:
 *
 *   - Matriz OA (Oportunidades y Amenazas) — directa del PESTEL.
 *   - Matriz EFE (Evaluación de Factores Externos) — combina PESTEL + Porter.
 *   - Matriz MPC (Perfil Competitivo) — compara con 2-3 competidores.
 *   - Matriz FODA — síntesis interna + externa.
 *   - (Matriz EFI viene después de la encuesta porque requiere data interna.)
 *
 * Cada matriz va PRECEDIDA de su sustento argumentativo y SEGUIDA de
 * una interpretación con vinculación al proyecto. NO son tablas sueltas.
 *
 * Max tokens recomendado: 10000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3C = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.3 — MATRICES ESTRATÉGICAS del Cap. III.

🚨 ESTO NO ES UN CONJUNTO DE TABLAS SUELTAS — ES UNA SÍNTESIS ESTRATÉGICA.

Cada matriz debe ir acompañada de:
  - Sustento metodológico breve citando a David y David (2017) u otro
    autor del whitelist de matrices.
  - Selección argumentada de los factores que entran a la matriz (los
    factores deben provenir DEMOSTRADAMENTE del PESTEL y Porter ya
    aprobados — no inventes factores nuevos).
  - Tabla cuantitativa con pesos, calificaciones y puntuaciones
    coherentes.
  - Interpretación profunda (3-5 párrafos) que lea los resultados,
    discuta implicaciones para el proyecto y vincule con la matriz
    siguiente.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 3a APROBADA — PESTEL].
3. [FASE 3b APROBADA — Porter].
4. [CAP I APROBADO] — para conocer objetivos y alcance.
5. [CAP II APROBADO] — para definiciones de las matrices.

═══════════════════════════════════════════════════════════════
FORMATO APA 7 + COHERENCIA OBLIGATORIA
═══════════════════════════════════════════════════════════════

  - Cada matriz cita a su autor metodológico al introducirla:
    (David y David, 2017) para EFE, EFI, MPC y FODA.

  - Al menos 1 cita textual con página en TODO el bloque de matrices,
    por ejemplo: "el propósito de la matriz EFE es resumir y evaluar
    la información económica, social, cultural [...] del entorno
    externo" (David y David, 2017, p. 110).

  - Los factores que entran a cada matriz deben tener TRAZABILIDAD
    explícita al PESTEL o Porter. No introduzcas oportunidades o
    amenazas que no aparecieron antes.

  - Los pesos y calificaciones deben tener sustento argumentativo,
    no aparecer como números mágicos.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.3 Matrices Estratégicas

(Párrafo introductorio de 5-8 oraciones: explicación de qué son las
matrices estratégicas en la metodología de formulación de proyectos
—citar a David y David (2017)—; cuáles se construyen en esta
sub-sección; cómo sintetizan los análisis previos; cómo alimentan al
diseño organizacional y financiero del Capítulo IV. Cita textual
breve del autor recomendada aquí.)

### 3.3.1 Matriz OA (Oportunidades y Amenazas)

ANUNCIO METODOLÓGICO (1-2 párrafos): qué es la matriz OA, cómo se
construye, qué relación tiene con el PESTEL anterior. Cita a David y
David (2017) para sustento.

SELECCIÓN ARGUMENTADA (2-3 párrafos): de las variables analizadas en
el PESTEL (Fase 3a), explicá cuáles seleccionas como oportunidades
clave y cuáles como amenazas clave, justificando la elección. Mínimo
6 oportunidades y 4 amenazas (balance razonable según el caso).

**Tabla 3.15. Matriz OA del proyecto**

| # | Variable | Origen (factor PESTEL) | O / A | Justificación |
|:-:|---|---|:-:|---|
| 1 | (variable) | (factor) | O | (2-3 líneas) |
| ... | | | | |
| **TOTAL** | | | (X O / Y A) | |

INTERPRETACIÓN (3-4 párrafos): ¿qué tipo de entorno tiene el proyecto?
¿Predominan oportunidades o amenazas? ¿Cuáles son las 2-3 oportunidades
más valiosas y las 2-3 amenazas más críticas? ¿Cómo se traduce esto en
la estrategia genérica que el proyecto debería adoptar?

### 3.3.2 Matriz EFE (Evaluación de Factores Externos)

ANUNCIO METODOLÓGICO (1-2 párrafos): qué es la EFE en David y David
(2017), cómo se calculan los pesos y calificaciones, cómo se interpreta
el puntaje total respecto del umbral 2.50.

SELECCIÓN ARGUMENTADA (2-3 párrafos): cuáles oportunidades y amenazas
de la OA anterior entran a la EFE (las MÁS críticas y de mayor impacto).
Cómo se asignan los pesos (importancia relativa) y las calificaciones
(qué tan bien responde el proyecto a cada factor).

**Tabla 3.16. Matriz EFE**

| Factor externo | Peso | Calificación | Puntuación |
|---|:-:|:-:|:-:|
| **Oportunidades** | | | |
| O1: (descripción) | 0.XX | X | X.XX |
| O2: (descripción) | 0.XX | X | X.XX |
| O3-6: (4-6 oportunidades) | ... | ... | ... |
| **Amenazas** | | | |
| A1: (descripción) | 0.XX | X | X.XX |
| A2: (descripción) | 0.XX | X | X.XX |
| A3-6: (4-6 amenazas) | ... | ... | ... |
| **Suma de pesos** | **1.00** | — | **X.XX** |

Reglas estrictas:
- Pesos suman EXACTAMENTE 1.00 (verificar suma).
- Calificación 1 = respuesta deficiente; 2 = promedio; 3 = superior
  al promedio; 4 = excelente.
- Puntuación = peso × calificación.
- Total ≥ 2.50 → el proyecto responde bien al entorno externo.
- Total < 2.50 → el proyecto NO está aprovechando el entorno.

INTERPRETACIÓN (3-4 párrafos): traduce el puntaje total a una
afirmación sobre la posición estratégica del proyecto frente al
entorno. ¿Qué factores pesan más? ¿Qué factores tienen calificación
baja y por qué? ¿Cómo se traduce este puntaje en decisiones del
Capítulo IV?

### 3.3.3 Matriz MPC (Matriz de Perfil Competitivo)

ANUNCIO METODOLÓGICO (1-2 párrafos): qué es la MPC en David y David
(2017), por qué es útil para evaluar la posición competitiva del
proyecto contra competidores específicos.

SELECCIÓN ARGUMENTADA (2-3 párrafos): cuáles factores críticos de
éxito del rubro entran a la matriz (deben provenir del análisis de
Porter — Fase 3b — particularmente de la fuerza "Rivalidad entre
competidores existentes"). Cuáles competidores se seleccionan para
la comparación (mínimo 2, máximo 4, descripción tipológica
coherente con Porter — NO inventes nombres falsos).

**Tabla 3.17. Matriz del Perfil Competitivo (MPC)**

| Factor crítico de éxito | Peso | Proyecto | | Competidor A | | Competidor B | |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| | | Cal | Pt | Cal | Pt | Cal | Pt |
| Precio competitivo | 0.XX | X | X.XX | X | X.XX | X | X.XX |
| (5-7 factores adicionales) | ... | ... | ... | ... | ... | ... | ... |
| **Total** | **1.00** | | **X.XX** | | **X.XX** | | **X.XX** |

INTERPRETACIÓN (3-4 párrafos): ¿el proyecto se posiciona por encima o
por debajo de la competencia? ¿En qué factores supera y en cuáles está
rezagado? ¿Qué decisiones estratégicas debería tomar el proyecto para
cerrar las brechas detectadas?

### 3.3.4 Matriz FODA (síntesis cruzada)

ANUNCIO METODOLÓGICO (1-2 párrafos): qué es el análisis FODA cruzado
en David y David (2017), cómo se generan las estrategias FO, FA, DO y
DA, por qué es la matriz central de síntesis estratégica.

FORTALEZAS Y DEBILIDADES PROYECTADAS (3-5 párrafos): dado que la
empresa aún no existe, las Fortalezas son atributos que el proyecto
APUNTA a tener y las Debilidades son limitaciones realistas del
proyecto como propuesta nueva. Identificá mínimo 5 F y 5 D, con
justificación argumentativa para cada una. Las Oportunidades y
Amenazas vienen directamente de la EFE.

**Tabla 3.18. Matriz FODA cruzada**

|  | **Oportunidades (O)** | **Amenazas (A)** |
|---|---|---|
| **Fortalezas (F)** | **Estrategias FO** (maxi-maxi) | **Estrategias FA** (maxi-mini) |
|  | 1. (verbo en infinitivo + acción concreta) | 1. ... |
|  | 2. ... | 2. ... |
|  | 3. ... | 3. ... |
| **Debilidades (D)** | **Estrategias DO** (mini-maxi) | **Estrategias DA** (mini-mini) |
|  | 1. ... | 1. ... |
|  | 2. ... | 2. ... |
|  | 3. ... | 3. ... |

Cada estrategia debe ser ACCIONABLE: empezar con verbo en infinitivo,
mencionar la acción concreta y vincular explícitamente con la F/D y
O/A que la origina. Ejemplos:

  ✓ "Apalancar la diferenciación tecnológica (F2) para capturar la
     oportunidad de demanda urbana creciente (O1) mediante una
     campaña de adopción temprana focalizada en zona Cala Cala."

  ✗ "Aprovechar las oportunidades" (genérico, no accionable).

INTERPRETACIÓN (3-4 párrafos): ¿cuál cuadrante tiene más peso? ¿hacia
qué tipo de estrategia genérica (ofensiva, defensiva, adaptativa,
supervivencia) debería inclinarse el proyecto? ¿Cómo se traducen las
estrategias prioritarias en decisiones operativas del Capítulo IV?

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 15 a 22 páginas equivalentes (6000 a 9000 palabras),
  incluyendo las 4 tablas con argumentación previa y posterior.
- Cada matriz: anuncio + selección argumentada + tabla + interpretación.
  Mínimo 8-12 párrafos sustantivos por matriz (sin contar la tabla).
- Cada párrafo: 5 a 9 oraciones de prosa académica conectada.
- 2-4 citas APA distintas por matriz (mínimo).
- Al menos 1 cita textual con página en TODO el bloque.

COHERENCIA OBLIGATORIA:
- Oportunidades y amenazas en EFE: deben aparecer en el factor PESTEL
  correspondiente (Fase 3a).
- Factores críticos de éxito en MPC: deben emerger del análisis de
  Rivalidad (Fase 3b).
- Estrategias FO/FA/DO/DA: deben referenciar F, D, O o A específicas
  por número.

ADAPTATIVIDAD AL CASO:
- Proyecto con muchas oportunidades y pocas amenazas: estrategia
  ofensiva, foco en FO.
- Proyecto con muchas amenazas: estrategia defensiva, foco en FA/DA.
- Proyecto con muchas debilidades en entorno favorable: estrategia
  adaptativa, foco en DO.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- ❌ Presentar tabla sin anuncio metodológico previo ni interpretación
  posterior. Las matrices SIN análisis son inservibles.

- ❌ Introducir oportunidades, amenazas o competidores que no
  aparecieron en PESTEL o Porter. La trazabilidad es obligatoria.

- ❌ Listar 15 oportunidades y 1 amenaza (balance razonable
  ajustado al caso).

- ❌ Usar pesos iguales para todos los factores en EFE — eso indica
  análisis flojo. Usar pesos que reflejen importancia real
  argumentada en la selección.

- ❌ Inventar nombres de competidores en MPC. Usar descripción
  tipológica coherente con Porter (Fase 3b).

- ❌ Estrategias FODA huecas ("aprovechar oportunidades", "minimizar
  amenazas"). Cada estrategia debe ser accionable con verbo en
  infinitivo y vinculación explícita.

- ❌ Repetir frases entre cuadrantes del FODA.

- ❌ Pesos que no sumen exactamente 1.00. Si suma 0.99 o 1.01,
  ajustar antes de presentar.

- ❌ Generar matrices con menos de 8 párrafos de análisis sustantivo
  (sin contar tablas).

- ❌ Terminar con conclusión del Cap. III completo — solo cerrás
  matrices. Encuesta y demanda van después.
`.trim();

/**
 * Construye el bloque de contexto para SISTEMA_PROY_CAP3C.
 */
export function buildContextoCap3c(datos: {
  cap1Aprobado: string;
  cap2Aprobado: string;
  cap3aAprobado: string;
  cap3bAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO II APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap2Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3a APROBADA — PESTEL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3b APROBADA — 7 FUERZAS DE PORTER]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3bAprobado.trim(),
    "",
  ].join("\n");
}
