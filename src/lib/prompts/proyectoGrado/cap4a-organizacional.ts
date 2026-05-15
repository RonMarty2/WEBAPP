/**
 * SISTEMA_PROY_CAP4A — Fase 4a: Estudio Organizacional.
 *
 * Primera sub-fase del Capítulo IV (Marco Propositivo). Define la
 * estructura organizacional de la empresa que se va a crear:
 *
 *   - Identidad corporativa: misión, visión, valores.
 *   - Descripción y nombre de la empresa.
 *   - Organigrama propuesto.
 *   - Manual de funciones de cada cargo.
 *
 * Max tokens recomendado: 7000.
 * Subtipo: común a producción y servicios (la estructura cambia poco
 *          según rubro; la propuesta de RRHH viene en Fase 4a-bis).
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4A = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.1 — ESTUDIO ORGANIZACIONAL del Cap. IV.

Diseñas la estructura organizacional de la empresa que el proyecto va a
crear. Aquí NO se diseña RRHH (eso es Fase 4a-bis), solo:
- Identidad corporativa.
- Estructura jerárquica (organigrama).
- Funciones de cada cargo.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [CAP I APROBADO] — para la formulación del problema y objetivos.
3. [CAP III COMPLETO] — para el segmento, demanda y posicionamiento.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

# Capítulo IV — Marco Propositivo

(Párrafo introductorio del Cap. IV: qué se va a desarrollar y cómo
se conecta con los hallazgos del Cap. III.)

## 4.1 Estudio Organizacional

(Párrafo introductorio breve de la sección.)

### 4.1.1 Descripción de la empresa

#### Nombre y razón social

Propuesta concreta de nombre comercial + razón social formal según
el régimen empresarial elegido (típicamente S.R.L. para emprendimientos
de licenciatura en Bolivia). Justifica brevemente la elección del nombre
y del régimen.

#### Descripción de la actividad

Párrafo de 4-6 oraciones que sintetiza qué hace la empresa, a quién
atiende y dónde opera. Es el "elevator pitch" formal.

### 4.1.2 Lineamientos estratégicos

#### Misión

Una oración (máximo dos) con la fórmula clásica:

  "Somos una empresa [tipo] dedicada a [qué hace] para [a quién],
   ofreciendo [diferenciador] mediante [cómo] con el fin de [propósito]."

NO frases huecas, no clichés tipo "ofrecer el mejor servicio".

#### Visión

Una oración con horizonte temporal claro (5 años típico):

  "Para [año], ser reconocidos como [referente de] en [zona/sector]
   por [diferenciador específico]."

NO "ser líderes globales" — visión realista y verificable.

#### Valores corporativos

5 a 7 valores. Cada uno con UNA oración explicativa concreta. NO listado
de palabras sueltas (calidad, honestidad, etc.) — cada valor tiene
una definición operativa.

#### Objetivos organizacionales

Diferentes de los objetivos de investigación del Cap. I. Aquí son:
- Objetivo comercial (mensual o anual).
- Objetivo operacional.
- Objetivo financiero (vinculado al WACC esperado).
- Objetivo de crecimiento (3-5 años).

### 4.1.3 Estructura organizacional

#### Organigrama propuesto

Presentá la estructura jerárquica. Para un emprendimiento de licenciatura
es típico empezar con 4 a 8 cargos. Estructura típica:

\`\`\`
                  [Gerencia General]
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   [Área Producción /  [Área           [Área
    Operaciones]       Comercial]      Administrativa]
        │                │                │
   (Personal             (Personal       (Asesor
    operativo)            comercial)      contable
                                          externo)
\`\`\`

Adaptá la estructura al rubro y tamaño. NO presentes 25 cargos para un
emprendimiento que va a operar con 4-8 personas.

#### Tabla de cargos

**Tabla N. Cargos y dependencia jerárquica**

| Cargo | Depende de | Cantidad | Tipo de relación laboral |
|---|---|:-:|---|
| Gerente General | Junta de socios | 1 | Dedicación completa |
| ... | | | |

### 4.1.4 Manual de funciones

Para CADA cargo del organigrama, un sub-apartado:

#### 4.1.4.X Cargo: [Nombre]

**Perfil del puesto:**
- Formación requerida.
- Experiencia mínima.
- Competencias clave (3-5).

**Funciones principales:**
- 5 a 8 funciones, redactadas con verbo en infinitivo.
- Cada función concreta y medible.

**Relaciones:**
- Reporta a: [cargo].
- Supervisa a: [cargos].
- Coordina con: [áreas].

NO copies el mismo perfil para todos los cargos. Cada uno tiene
exigencias específicas según su rol.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 10 a 15 páginas (3500 a 5500 palabras).
- Organigrama con mínimo 3 niveles (Gerencia + áreas + operativos).
- Manual de funciones para CADA cargo del organigrama.
- Coherencia con la demanda proyectada en Cap. III: si la demanda es
  baja, no propongas un equipo de 20 personas.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO listado de valores como palabras sueltas (sin definición).
- NO misiones genéricas tipo "ofrecer calidad y satisfacer al cliente".
- NO visiones megalomaníacas tipo "líder mundial" o "presencia
  internacional" para un emprendimiento local.
- NO mismas funciones copiadas a cargos distintos.
- NO organigramas de 20 cargos para un proyecto de 50.000 Bs de
  inversión inicial — coherencia.
- NO incluyas proceso de selección / capacitación / RRHH — eso es
  Fase 4a-bis.
- NO incluyas estudio legal de la constitución — eso es Fase 4b.
`.trim();

export function buildContextoCap4a(datos: {
  cap1Aprobado: string;
  cap3aAprobado: string;
  cap3eAprobado: string;
  cap3fAprobado: string;
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
    "[FASE 3a — PESTEL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3e — RESULTADOS DE ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3eAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3f — DEMANDA Y CUOTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
  ].join("\n");
}
