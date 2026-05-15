/**
 * SISTEMA_PROY_CAP4B — Fase 4b: Estudio Legal.
 *
 * Tercera sub-fase del Capítulo IV. Define los pasos legales para
 * constituir formalmente la empresa según la normativa boliviana
 * vigente:
 *
 *   - Forma jurídica elegida (S.R.L., Unipersonal, S.A., etc.).
 *   - Pasos del registro: SEPREC/FUNDEMPRESA, NIT en el SIN, alcaldía
 *     municipal, AFP, Caja de Salud.
 *   - Licencias y permisos especiales según el rubro.
 *   - Marco normativo aplicable (Código de Comercio, Ley General del
 *     Trabajo, leyes tributarias).
 *
 * Max tokens recomendado: 6000.
 * Subtipo: común a producción y servicios (los pasos legales son los
 *          mismos; las licencias específicas varían pero el sistema
 *          las cubre genéricamente).
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4B = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.3 — ESTUDIO LEGAL del Cap. IV.

Diseñas el camino legal para constituir formalmente la empresa
propuesta, conforme a la normativa boliviana vigente. Citas
instituciones REALES que existen en Bolivia.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 4a APROBADA] — para conocer nombre comercial y razón social.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.3 Estudio Legal

(Párrafo introductorio: alcance del estudio legal, importancia del
cumplimiento normativo para la operación.)

### 4.3.1 Forma jurídica elegida

Justifica la elección del tipo de sociedad. Opciones disponibles en
Bolivia:

- **Empresa Unipersonal**: dueño único, responsabilidad ilimitada,
  trámite simple. Recomendable para emprendimientos pequeños iniciales.
- **Sociedad de Responsabilidad Limitada (S.R.L.)**: 2 a 25 socios,
  responsabilidad limitada al aporte. **La más común en proyectos
  de licenciatura.**
- **Sociedad Anónima (S.A.)**: para proyectos grandes con múltiples
  inversionistas. Trámite más complejo.

Para un proyecto de licenciatura, lo típico es S.R.L. con 2 socios
(emprendedor + inversionista o cónyuge). Justifica la elección.

### 4.3.2 Constitución legal de la empresa

Pasos del registro formal, en orden cronológico:

#### 4.3.2.1 Reserva del nombre comercial

Entidad: SEPREC (Servicio Plurinacional de Registro de Comercio) —
sucesor de FUNDEMPRESA. Sitio web: www.seprec.gob.bo (raíz verificable).

Costo aproximado: 20 a 30 Bs (vigente al momento del estudio).
Tiempo: 1 a 3 días hábiles.

Procedimiento: solicitud en línea o presencial en oficinas SEPREC.

#### 4.3.2.2 Elaboración de minuta de constitución

Documento legal redactado por abogado o notario. Contenido mínimo:
- Identificación de los socios.
- Denominación social y domicilio.
- Objeto social (qué hará la empresa).
- Capital social y aportes de cada socio.
- Régimen de administración y representación.

Costo del servicio profesional: 800 a 2.000 Bs (variable según abogado).

#### 4.3.2.3 Protocolización ante notario

La minuta se protocoliza ante Notario de Fe Pública. La notarización
da carácter público al documento.

Costo aproximado: 500 a 1.500 Bs según valor del capital social.

#### 4.3.2.4 Registro en SEPREC

Inscripción formal de la empresa con el documento notarizado.
Resultado: número de matrícula y certificado de inscripción.

Costo aproximado: 250 a 600 Bs según capital y tipo societario.
Tiempo: 7 a 15 días hábiles.

#### 4.3.2.5 NIT en el Servicio de Impuestos Nacionales

Entidad: SIN (Servicio de Impuestos Nacionales). Sitio web:
www.impuestos.gob.bo. Régimen tributario aplicable: General
(IVA 13%, IT 3%, IUE 25% sobre utilidades).

Trámite gratuito. Tiempo: 3 a 5 días.

#### 4.3.2.6 Licencia de funcionamiento municipal

Gobierno Autónomo Municipal de Cochabamba. Trámite presencial o en
línea. Costo según uso de suelo y metraje del local.

Para emprendimientos en Cercado: 500 a 1.500 Bs aproximadamente.

#### 4.3.2.7 Inscripción al sistema de pensiones (AFP)

Inscripción del empleador. Inicio en cuanto se contrate al primer
trabajador. Aportes patronales mensuales: 12.71% del salario.

AFPs operativas en Bolivia: Futuro de Bolivia, BBVA Previsión.

#### 4.3.2.8 Inscripción a Caja Nacional de Salud

O Caja Petrolera de Salud según el rubro. Aporte patronal: 10%
del salario.

### 4.3.3 Resumen de costos legales iniciales

**Tabla N. Costos legales de constitución**

| Paso | Costo (Bs) |
|---|:-:|
| Reserva de nombre SEPREC | ~25 |
| Servicio de abogado para minuta | ~1.200 |
| Notarización | ~800 |
| Registro SEPREC | ~450 |
| Trámite NIT | gratuito |
| Licencia municipal | ~900 |
| Inscripciones AFP y Caja | gratuitas |
| **Total estimado** | **~3.400** |

Tiempo total estimado del proceso: 4 a 6 semanas.

### 4.3.4 Marco normativo aplicable

Cita las normas reales (sin inventar números de leyes desconocidos):

- **Código de Comercio de Bolivia** (Decreto Ley N° 14379 de 1977 y
  sus actualizaciones).
- **Ley General del Trabajo** y su Reglamento (DS 224 de 1943).
- **Ley N° 843** de Reforma Tributaria (impuestos al consumo, a las
  utilidades, a las transacciones).
- **Código Tributario Boliviano** (Ley N° 2492).
- **Normativa específica del rubro**: si aplica (Ley General de
  Higiene, Seguridad Ocupacional y Bienestar; reglamentos
  sanitarios para alimentos en SENASAG si aplica; reglamentos
  ambientales en MMAyA para proyectos productivos).

### 4.3.5 Permisos especiales según el rubro

Identifica los permisos adicionales que necesita el proyecto
específico, según corresponda:

- **Si manipula alimentos**: registro sanitario en SENASAG.
- **Si genera residuos**: licencia ambiental categoría correspondiente.
- **Si opera con público (atención al cliente)**: certificado de
  seguridad e higiene laboral.
- **Si vende bebidas alcohólicas**: patente municipal de expendio.
- **Si es servicio profesional regulado**: registro en colegio o
  asociación profesional pertinente.

Si el proyecto no requiere permisos especiales, indicalo brevemente.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 8 a 12 páginas (3000 a 4500 palabras).
- Cita URLs raíz reales de instituciones (sin inventar páginas
  internas que pueden cambiar).
- Cifras de costos coherentes con el mercado boliviano actual.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes nombres de leyes (no escribas "Ley N° 8.547 de
  Promoción Empresarial" si no existe).
- NO inventes nombres de instituciones — usa las reales: SEPREC, SIN,
  AFP Futuro de Bolivia, BBVA Previsión, Caja Nacional de Salud,
  SENASAG, MMAyA, etc.
- NO uses costos absurdos (constituir una S.R.L. en Bolivia NO cuesta
  50.000 Bs ni 50 Bs — el rango realista es 3.000 a 5.000 Bs).
- NO cita URLs específicas con paths internos (www.seprec.gob.bo/
  tramites/page-N-345); usa solo URLs raíz verificables.
- NO incluyas redacción de la minuta entera — solo describe su
  contenido. La minuta real la redacta un abogado.
`.trim();

export function buildContextoCap4b(datos: {
  cap4aAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
  rubro?: string;
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  const parts: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
  ];
  if (datos.rubro) parts.push(`- Rubro: ${datos.rubro}`);

  parts.push(
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a APROBADA — ESTUDIO ORGANIZACIONAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
  );
  return parts.join("\n");
}
