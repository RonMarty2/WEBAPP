/**
 * SISTEMA_PROY_CAP4ABIS — Fase 4a-bis: Propuesta Administrativa de RRHH.
 *
 * Sub-fase específica del Capítulo IV agregada después de la auditoría
 * de patrón: en los proyectos UCATEC la gestión de RRHH (reclutamiento,
 * selección, contratación, inducción, capacitación, evaluación) aparece
 * como una sección separada del estudio organizacional.
 *
 * Cubre el ciclo completo del talento humano + cumplimiento normativo
 * laboral boliviano (AFP, Caja de Salud, finiquito, vacaciones).
 *
 * Max tokens recomendado: 6000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4ABIS = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.2 — PROPUESTA ADMINISTRATIVA DE
RECURSOS HUMANOS del Cap. IV. Cubrís el ciclo completo de gestión
del talento humano de la empresa propuesta, alineado con la normativa
laboral boliviana.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 4a APROBADA — ESTUDIO ORGANIZACIONAL] — el organigrama y los
   cargos están definidos ahí. Acá NO los redefinís — los usás.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.2 Propuesta Administrativa de Recursos Humanos

(Párrafo introductorio: alcance del sistema de RRHH propuesto, principios
rectores, alineación con la cultura organizacional definida en 4.1.)

### 4.2.1 Proceso de gestión de Recursos Humanos

Diagrama/flujo del ciclo completo. Describí el ciclo PROFESIONALMENTE:

  Planificación → Reclutamiento → Selección → Contratación →
  → Inducción → Capacitación → Evaluación de desempeño →
  → Plan de carrera → Desvinculación / renovación

Para cada paso, una explicación breve de cómo se hará EN ESTE PROYECTO
(no en abstracto). 1-2 párrafos por paso.

### 4.2.2 Búsqueda, reclutamiento y convocatoria

Canales que se van a usar:

- Bolsas de trabajo locales (CIDES UMSS, sitios web de Cochabamba).
- Redes profesionales (LinkedIn, Facebook grupos especializados).
- Recomendaciones internas.
- Convocatoria abierta en redes sociales propias.

Para CADA cargo crítico del organigrama (Gerencia + 1-2 áreas clave),
describí el canal preferente y el perfil mínimo que se buscará.

### 4.2.3 Proceso de selección

Etapas:

1. **Revisión de hojas de vida**: criterios de filtro inicial.
2. **Entrevistas preliminares**: lista corta de candidatos.
3. **Evaluación técnica**: pruebas específicas según el cargo
   (test de conocimientos, prueba práctica, caso de simulación).
4. **Entrevista final con Gerencia**: alineación cultural.
5. **Verificación de referencias**: validación de antecedentes.

Plazo total esperado: 2-4 semanas por cargo.

### 4.2.4 Contratación

Régimen laboral aplicable según Ley General del Trabajo de Bolivia.

**Tabla N. Régimen de contratación por tipo de cargo**

| Cargo | Tipo de contrato | Duración | Período de prueba |
|---|---|:-:|:-:|
| Gerencia | Indefinido | — | 3 meses |
| Personal operativo | Indefinido | — | 3 meses |
| Servicios profesionales (contador) | Consultoría externa | Renovable anual | No aplica |

Mencionar obligaciones del empleador desde el primer día:

- Inscripción al sistema integrado AFP (Futuro de Bolivia / BBVA Previsión).
- Inscripción a Caja Nacional de Salud o Caja Petrolera de Salud.
- Beneficios sociales: aguinaldo, segundo aguinaldo "Esfuerzo por Bolivia"
  cuando aplica, vacaciones según antigüedad, indemnización por años
  trabajados.

### 4.2.5 Inducción y capacitación

#### Inducción

Plan de inducción al nuevo empleado: primera semana de trabajo.
Contenidos mínimos:
- Misión, visión, valores de la empresa.
- Estructura organizacional y compañeros de área.
- Funciones específicas del cargo + estándares de calidad.
- Reglamento interno y políticas de la empresa.
- Inducción en seguridad laboral del puesto.

#### Capacitación continua

Programa anual con:
- Capacitaciones técnicas (específicas del rol).
- Capacitaciones transversales (atención al cliente, ventas, idiomas
  cuando aplica).
- Presupuesto anual estimado de capacitación (% de la planilla típico:
  1-3%).

### 4.2.6 Evaluación del desempeño

Sistema de evaluación. Tipos:

- **Autoevaluación**: el empleado evalúa su propio desempeño semestralmente.
- **Evaluación del superior directo**: feedback formal con métricas
  específicas del cargo.
- **Evaluación de 360°** (opcional, para cargos de jefatura): pares,
  subordinados, superior.

Frecuencia: semestral o anual.

Vinculación con incentivos: bonos por cumplimiento de metas, ajustes
salariales meritocráticos, plan de carrera.

### 4.2.7 Política salarial básica

**Tabla N. Política salarial por cargo**

| Cargo | Salario base mensual (Bs) | Bonos potenciales | Beneficios sociales |
|---|:-:|---|---|
| Gerente General | XX.XXX | Bono trimestral por metas | Completos |
| Jefe de Área | X.XXX | Bono semestral | Completos |
| Personal operativo | X.XXX | Bono mensual por productividad | Completos |

Cifras razonables y conservadoras para el mercado laboral cochabambino.
Salarios dentro del rango legal (sobre el salario mínimo nacional)
y competitivos para retención.

Beneficios sociales = aporte patronal AFP (12.71%), Caja (10%), prima
de prevención de riesgos (1.71-3%), aguinaldo (8.33%), antigüedad
desde el año 2, vacaciones según LGT, indemnización 1 sueldo por año.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 10 a 15 páginas (3500 a 5500 palabras).
- Salarios coherentes con el rubro y zona (Cochabamba 2024-2025).
- Cumplimiento normativo claro: AFP + Caja + LGT + beneficios sociales.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes nombres de AFPs ("AFP Futuro Cochabamba" no existe; sí
  existe "Futuro de Bolivia" y "BBVA Previsión").
- NO uses salarios irreales (Gerente General de emprendimiento nuevo
  en Cochabamba cobrando 50.000 Bs/mes).
- NO omitas los aportes patronales obligatorios.
- NO repitas el organigrama (eso ya está en 4.1).
- NO incluyas constitución legal ni trámites SEPREC/FUNDEMPRESA (eso
  es Fase 4b).
`.trim();

export function buildContextoCap4abis(datos: {
  cap4aAprobado: string;
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
    "[FASE 4a APROBADA — ESTUDIO ORGANIZACIONAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
  ].join("\n");
}
