/**
 * SISTEMA_PROY_CAP4C — Fase 4c: Estudio Técnico.
 *
 * Cuarta sub-fase del Capítulo IV. Define los aspectos físicos y
 * operativos del proyecto:
 *
 *   - Localización (con método de puntaje ponderado).
 *   - Tamaño / capacidad operativa.
 *   - Para PRODUCCIÓN: proceso productivo, maquinaria, materia prima,
 *     diagrama de flujo, layout de planta.
 *   - Para SERVICIOS: ambientación del local, equipamiento, capacidad
 *     de atención, protocolos, layout del espacio.
 *
 * Este capítulo tiene VARIANTE POR SUBTIPO porque la naturaleza
 * técnica de un proyecto de producción es muy distinta a la de un
 * proyecto de servicios.
 *
 * Max tokens recomendado: 9000.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

// ─────────────────────────────────────────────────────────────────────────────
// Bloque común a los dos subtipos
// ─────────────────────────────────────────────────────────────────────────────

const COMUN_LOCALIZACION_Y_TAMANO = `
### 4.4.1 Localización

#### Macro-localización

Departamento y ciudad. Para proyectos UCATEC, casi siempre Cochabamba.
Justifica brevemente: cercanía al mercado objetivo, infraestructura,
acceso a mano de obra calificada, proveedores.

#### Micro-localización (método de puntaje ponderado)

Comparación de 3 alternativas concretas (zonas o avenidas específicas
de Cochabamba).

**Tabla N. Selección de localización por método de puntaje ponderado**

| Factor | Peso | Alt. A | Alt. B | Alt. C |
|---|:-:|:-:|:-:|:-:|
| Cercanía al mercado | 0.30 | Cal | Pt | Cal | Pt | Cal | Pt |
| Costo del alquiler/terreno | 0.20 | | | | | | |
| Accesibilidad / transporte | 0.15 | | | | | | |
| Servicios básicos (agua, luz, internet) | 0.10 | | | | | | |
| Visibilidad / tránsito | 0.10 | | | | | | |
| Seguridad de la zona | 0.10 | | | | | | |
| Cercanía a proveedores | 0.05 | | | | | | |
| **Total** | **1.00** | | **X.XX** | | **X.XX** | | **X.XX** |

Calificación 1 (muy malo) a 5 (excelente). Puntuación = peso × calif.
Ganadora = mayor puntuación total.

Cierra con párrafo: ¿dónde se ubicará el proyecto y por qué?

### 4.4.2 Tamaño del proyecto

#### Capacidad operativa

Definir cuánto puede atender/producir el proyecto en términos
mensuales y anuales. Coherencia OBLIGATORIA con la demanda
proyectada en Fase 3f.

#### Distribución del espacio (layout)

Describe cómo se distribuye el espacio físico:
- Área operativa (lo que se hace).
- Área administrativa (oficinas, gerencia).
- Área de atención al cliente (si aplica).
- Áreas auxiliares (almacén, baños, descanso).

Estimación de metros cuadrados totales del local.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Variante PRODUCCIÓN
// ─────────────────────────────────────────────────────────────────────────────

const BLOQUE_PRODUCCION = `
### 4.4.3 Proceso productivo

Descripción del proceso completo desde la materia prima hasta el producto
terminado. Mínimo 6 etapas:

1. Recepción de insumos.
2. Almacenamiento.
3. (Etapa específica del rubro).
4. (Etapa específica del rubro).
5. Control de calidad.
6. Empaque y almacenamiento del producto terminado.
7. Distribución / venta.

#### Diagrama de flujo de producción

Genera el flujograma con DOS REPRESENTACIONES, en este orden:

**(A) Bloque TikZ embebido** — para el PDF final renderizado.

Envuelve el flujograma en un bloque LaTeX que el sistema preserva tal
cual. Estructura típica de cadena lineal (adaptá según el rubro):

\`\`\`tikz
\\begin{center}
\\begin{tikzpicture}[
  node distance=10mm,
  every node/.style={font=\\small, align=center},
  inicio/.style={draw, ellipse, fill=green!15, minimum width=22mm, minimum height=9mm},
  proceso/.style={draw, rectangle, rounded corners=2pt, fill=blue!10, minimum width=32mm, minimum height=10mm, inner sep=2pt},
  control/.style={draw, diamond, aspect=2, fill=orange!15, minimum width=28mm, inner sep=1pt},
  fin/.style={draw, ellipse, fill=red!15, minimum width=22mm, minimum height=9mm},
  flecha/.style={-{Stealth[length=2mm]}, thick}
]
\\node[inicio] (a) {Materia prima\\\\recibida};
\\node[proceso, right=of a] (b) {Lavado /\\\\selección};
\\node[proceso, right=of b] (c) {Procesamiento\\\\(etapa rubro)};
\\node[control, below=of c] (d) {Control de\\\\calidad};
\\node[proceso, left=of d] (e) {Empaque};
\\node[fin, left=of e] (f) {Distribución};
\\draw[flecha] (a) -- (b);
\\draw[flecha] (b) -- (c);
\\draw[flecha] (c) -- (d);
\\draw[flecha] (d) -- (e);
\\draw[flecha] (e) -- (f);
\\end{tikzpicture}
\\end{center}
\`\`\`

Reglas obligatorias:
- Inicio (verde) → procesos (azul) → control de calidad (rombo naranja) →
  empaque (azul) → fin (rojo). Adapta los nombres al rubro real.
- Cada nodo con texto corto (3-5 palabras, salto de línea \\\\\\\\ si hace falta).
- Nada de \\\\usepackage — los paquetes ya están en el preamble.
- Si el flujo es de SERVICIOS (no producción), usa nodos: solicitud →
  validación → atención → entrega del servicio → seguimiento.

**(B) Tabla de entradas y salidas** — lista cada etapa con su entrada
y su salida, para complementar el diagrama:

| Etapa | Entrada | Salida | Tiempo estimado |
|---|---|---|:-:|
| (una fila por etapa) | | | XX min |

### 4.4.4 Maquinaria y equipos

**Tabla N. Maquinaria y equipo de producción**

| Equipo | Cantidad | Costo unitario (Bs) | Subtotal | Vida útil | Capacidad |
|---|:-:|:-:|:-:|:-:|---|
| (5-10 filas con equipos reales del rubro) | | | | | |
| **Total inversión en maquinaria** | | | **XX.XXX** | | |

Cifras realistas para el mercado boliviano. NO uses equipos importados
de gama alta para proyectos de licenciatura — equilibrá costo y función.

### 4.4.5 Materia prima e insumos

**Tabla N. Materia prima principal**

| Insumo | Proveedor potencial | Costo (Bs/unidad) | Consumo mensual estimado |
|---|---|:-:|:-:|
| (3-6 insumos clave) | | | |

Proveedores genéricos por tipo si no recuerdas nombres comerciales
exactos (ej: "distribuidoras de quinua en mercados zonales", "empresas
importadoras del Eje Troncal").

### 4.4.6 Capacidad productiva

**Tabla N. Capacidad productiva proyectada**

| Período | Capacidad máxima | Capacidad utilizada |
|---|:-:|:-:|
| Mensual | XX.XXX unidades | X.XXX unidades (X%) |
| Anual | XXX.XXX unidades | XX.XXX unidades (X%) |

La capacidad utilizada se alinea con la demanda proyectada en Fase 3f.
Año 1 típico: 40-60% de la capacidad instalada. Año 5: 70-85%.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Variante SERVICIOS
// ─────────────────────────────────────────────────────────────────────────────

const BLOQUE_SERVICIOS = `
### 4.4.3 Ambientación del local

Describe el entorno físico que el cliente experimentará. Para servicios,
la "evidencia física" (uno de los 7P del marketing de servicios) es
parte CRÍTICA del posicionamiento.

Contenido:
- Estilo decorativo coherente con el branding de la empresa.
- Mobiliario propuesto.
- Iluminación, música, aromas (si aplica al rubro).
- Señalética y elementos visuales de marca.
- Tecnología visible al cliente (caja, sistemas de pedido).

### 4.4.4 Equipamiento

NO maquinaria productiva — equipamiento para brindar el servicio.

**Tabla N. Equipamiento del local**

| Equipo | Cantidad | Costo unitario (Bs) | Subtotal | Área |
|---|:-:|:-:|:-:|---|
| (6-12 filas: mobiliario, equipos electrónicos, vajilla/herramientas,
   sistemas de cobro/atención) | | | | |
| **Total equipamiento** | | | **XX.XXX** | |

Cifras realistas para el mercado boliviano. NO equipamiento high-end
para emprendimiento de licenciatura.

### 4.4.5 Capacidad de atención

**Tabla N. Capacidad de atención proyectada**

| Período | Capacidad máxima | Capacidad utilizada |
|---|:-:|:-:|
| Por hora | XX clientes | X clientes (X%) |
| Diaria | XXX clientes | XX clientes (X%) |
| Mensual | X.XXX clientes | X.XXX clientes (X%) |

La capacidad utilizada se alinea con la demanda proyectada en Fase 3f.
Año 1 típico: 35-55% de capacidad. Año 5: 65-80%.

### 4.4.6 Protocolo de atención

Describe paso a paso cómo se atenderá al cliente desde que entra hasta
que se va:

1. Recepción y bienvenida.
2. Toma de pedido / identificación de necesidad.
3. Entrega del servicio.
4. Cierre / cobro.
5. Despedida y seguimiento post-venta.

Cada paso con tiempo estimado y persona responsable según el organigrama
de Fase 4a.

### 4.4.7 Ciclo del servicio

Diagrama textual del "service blueprint": qué ve el cliente, qué hace
el personal de contacto, qué pasa en el back-office. Importante para
servicios porque expone los momentos de la verdad (service encounters).
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Builder común
// ─────────────────────────────────────────────────────────────────────────────

function buildPromptCap4c(subtipo: "produccion" | "servicios"): string {
  const bloqueSubtipo = subtipo === "produccion" ? BLOQUE_PRODUCCION : BLOQUE_SERVICIOS;
  const subtipoLegible = subtipo === "produccion"
    ? "PRODUCCIÓN Y COMERCIALIZACIÓN DE UN BIEN"
    : "BRINDAR UN SERVICIO";

  return `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.4 — ESTUDIO TÉCNICO del Cap. IV
para un proyecto del subtipo ${subtipoLegible}.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [CAP III COMPLETO] — para la demanda proyectada y la cuota de mercado.
3. [FASE 4a] — para el organigrama y el dimensionamiento del equipo.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.4 Estudio Técnico

(Párrafo introductorio: alcance del estudio técnico para este subtipo
de proyecto.)

${COMUN_LOCALIZACION_Y_TAMANO}

${bloqueSubtipo}

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 12 a 18 páginas (4500 a 7000 palabras).
- Pesos en localización suman exactamente 1.00.
- Costos en Bs realistas para Cochabamba 2024-2025.
- Coherencia OBLIGATORIA con Fase 3f (demanda proyectada) y Fase 4a
  (cantidad de personal).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO mezcles bloques de producción y servicios (estás en el subtipo
  ${subtipoLegible}; el otro no aplica aquí).
- NO uses pesos iguales para todos los factores en el cálculo de
  localización (eso es análisis flojo).
- NO inventes nombres comerciales de proveedores específicos —
  usa descriptores genéricos coherentes.
- NO uses precios irreales de maquinaria/equipamiento.
- NO dimensiones capacidad mayor a la demanda + 20% (sobredimensión
  destruye el VAN del proyecto).
- NO incluyas costos de personal en este capítulo — eso se calcula
  en Fase 4f (Estudio Financiero) usando los salarios definidos
  en Fase 4a-bis.
`.trim();
}

export const SISTEMA_PROY_CAP4C_PRODUCCION = buildPromptCap4c("produccion");
export const SISTEMA_PROY_CAP4C_SERVICIOS = buildPromptCap4c("servicios");

/** Helper para elegir el prompt según subtipo. */
export function getPromptCap4c(subtipo: "produccion" | "servicios"): string {
  return subtipo === "produccion"
    ? SISTEMA_PROY_CAP4C_PRODUCCION
    : SISTEMA_PROY_CAP4C_SERVICIOS;
}

export function buildContextoCap4c(datos: {
  cap3fAprobado: string;
  cap4aAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
  ubicacionGeografica?: string;
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
  if (datos.ubicacionGeografica) parts.push(`- Ubicación: ${datos.ubicacionGeografica}`);

  parts.push(
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3f APROBADA — DEMANDA Y CUOTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a APROBADA — ESTUDIO ORGANIZACIONAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
  );

  return parts.join("\n");
}
