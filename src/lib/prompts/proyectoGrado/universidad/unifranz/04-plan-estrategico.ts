/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPÍTULO III — PLAN ESTRATÉGICO — UNIFRANZ Proyecto de Grado (Pre-Factibilidad)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Guía UNIFRANZ 2017, sección 4.2.1 (pág. 16). Para Pre-Factibilidad, el
 * Capítulo III contiene 5 secciones obligatorias:
 *
 *   3.1. Estructura Organizacional
 *   3.2. Plan de Marketing
 *   3.3. Plan de Producción
 *   3.4. Planificación Financiera
 *   3.5. Aspectos Legales
 *
 * ANTI-ERRORES PDF reprobado:
 *  - Marketing METIDO dentro de Estructura Organizacional → NO. Va aparte.
 *  - Evaluación Financiera como capítulo separado (Cap V) → NO. Va dentro del Cap III.
 *  - Estimación de Costos sin desglose por rubros → debe ser exhaustivo.
 *  - Resumen ejecutivo sin VAN/TIR/B-C → este capítulo provee esos números.
 *
 * Carrera-aware: para Medicina Veterinaria, la sección 3.5 (Aspectos
 * Legales) incluye OBLIGATORIAMENTE SENASAG y COMVETBOL.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { buildPromptUnifranz } from "./00-reglas-comunes";

const CUERPO = `
# FASE: CAPÍTULO III — PLAN ESTRATÉGICO (UNIFRANZ Proyecto de Grado Pre-Factibilidad)

## Extensión y formato
- 40 a 60 páginas en formato UNIFRANZ (Verdana 10, interlineado 1.5).
- Título: "CAPITULO III — PLAN ESTRATÉGICO"
  (Verdana 14, MAYÚSCULAS, negrita, en página propia).
- Numeración interna: 3.1, 3.2, 3.3, 3.4, 3.5 (subniveles hasta 3.X.Y.Z).
- Continúa numeración de tablas y gráficos del Capítulo II
  (NO reiniciar desde 1).

## Estructura EXACTA (5 secciones obligatorias UNIFRANZ)

═══════════════════════════════════════════════════════════════
## 3.1. Estructura Organizacional
═══════════════════════════════════════════════════════════════

### 3.1.1. Misión, Visión y Valores Institucionales

a) **Misión**: una sola oración. Estructura:
   [Verbo en presente] + [actividad principal] + [a quién] + [diferenciador]
   + [propósito mayor].
   Ejemplo: "Brindar servicios veterinarios integrales a las mascotas
   de la ciudad de Cochabamba, mediante atención especializada las 24
   horas, contribuyendo al bienestar animal y a la tranquilidad de las
   familias."

b) **Visión**: una sola oración. Estructura:
   [Tiempo futuro] + [posición deseada] + [horizonte temporal] +
   [ámbito geográfico].
   Ejemplo: "Ser la clínica veterinaria de referencia en el
   departamento de Cochabamba al año 2030, reconocida por la excelencia
   en cuidado integral de mascotas."

c) **Valores Institucionales**: lista de 4 a 6 valores. Cada uno
   con definición operativa (1 línea de qué significa para la empresa).

### 3.1.2. Organigrama Propuesto
Diagrama jerárquico con cargos. Indicar:
- Tipo de estructura (funcional, divisional, matricial).
- Niveles jerárquicos.
- Líneas de reporte.
Adjuntar gráfico numerado como "GRÁFICO N° X — Organigrama propuesto".

### 3.1.3. Requerimiento de Mano de Obra
Tabla con columnas:
| Cargo | Cantidad | Perfil requerido | Tipo (Directo/Indirecto) |

### 3.1.4. Descripción de Cargos
Por cada cargo del organigrama, una sub-tabla con:
- Nombre del cargo.
- Reporta a.
- Supervisa a.
- Funciones principales (5-8 viñetas).
- Requisitos: educación, experiencia, competencias.

### 3.1.5. Reclutamiento y Selección de Personal
Diagrama de flujo del proceso. Etapas:
1. Publicación de vacante.
2. Recepción de postulaciones.
3. Filtro de hojas de vida.
4. Entrevistas (primera y segunda ronda si aplica).
5. Evaluación técnica.
6. Verificación de referencias.
7. Decisión final y contratación.

### 3.1.6. Programa de Inducción del Personal
Cronograma y contenido de la inducción para nuevos empleados.

### 3.1.7. Administración de Sueldos y Salarios
- Política salarial (mínimo legal, mercado, escalas internas).
- Beneficios sociales: bono de antigüedad, aguinaldo (1 sueldo en
  diciembre), prima de utilidades (si aplica), seguro de salud (CNS),
  AFP (12.71% empleador + 12.71% empleado en Bolivia).
- Planilla de sueldos: tabla con columnas:
  | Cargo | Cant. | Sueldo bruto | Cargas sociales | Costo total | Costo anual |
- TOTAL anual del costo de mano de obra al final.

═══════════════════════════════════════════════════════════════
## 3.2. Plan de Marketing
═══════════════════════════════════════════════════════════════

⚠️ EL Plan de Marketing va en SU PROPIA sección 3.2, NO dentro de
la Estructura Organizacional. El PDF reprobado lo metió en 4.5 dentro
del Cap. 4 organizacional — es uno de los errores que vamos a evitar.

### 3.2.1. Segmentación de Mercado
- Macro-segmentación: industria, sector geográfico.
- Micro-segmentación: características demográficas, psicográficas,
  conductuales del cliente objetivo.
- Perfil del consumidor ideal (buyer persona).

### 3.2.2. Estrategia Genérica
Confirmar la estrategia elegida en 2.3.2 (Liderazgo en costos,
Diferenciación, o Enfoque) y detallar cómo se aplicará.

### 3.2.3. Estrategia de Crecimiento (Matriz de Ansoff)
Indicar cuadrante: Penetración / Desarrollo de mercado / Desarrollo
de producto / Diversificación. Justificar.

### 3.2.4. Marketing Mix (4 P)

a) **Producto / Servicio**
   - Cartera de productos o servicios ofrecidos.
   - Características técnicas, atributos diferenciadores.
   - Ciclo de vida esperado.
   - Marca, slogan, colores corporativos.
   - Imagen visual: si hay logo, describir colores HEX y tipografía.

b) **Precio**
   - Estrategia de fijación (descreme, penetración, paridad).
   - Lista de precios unitarios por producto/servicio.
   - Política de descuentos.
   - Tabla "PRECIO UNITARIO DE LOS SERVICIOS OFERTADOS".

c) **Plaza (Distribución)**
   - Canales de distribución (directo, indirecto, digital).
   - Ubicación del local principal.
   - Cobertura geográfica.

d) **Promoción**
   - Mix de comunicación: publicidad, relaciones públicas,
     marketing digital, ventas personales, promoción de ventas.
   - Plan de medios: plataformas, frecuencia, presupuesto estimado.
   - Estrategias de fidelización (programas de lealtad, descuentos
     por frecuencia).

### 3.2.5. Plan de Mercadotecnia
- Cronograma de actividades de marketing para el primer año.
- Indicadores de medición (KPI): tasa de conversión, costo de
  adquisición de cliente, tasa de retención.
- Presupuesto anual de marketing en Bs.

═══════════════════════════════════════════════════════════════
## 3.3. Plan de Producción / Operativo
═══════════════════════════════════════════════════════════════

### 3.3.1. Localización
a) Macro-localización: país, departamento, ciudad.
b) Micro-localización: distrito, zona, avenida específica.
c) Tabla "FACTORES DETERMINANTES DE LA MICROLOCALIZACIÓN":
   | Factor | Peso | Alternativa A | Alternativa B | Alternativa C |
d) Tabla "CALIFICACIÓN DE ALTERNATIVAS PARA LA MICROLOCALIZACIÓN".
e) Decisión final justificada.

### 3.3.2. Tamaño del Proyecto
- Capacidad instalada (n° de unidades/clientes/servicios por periodo).
- Capacidad utilizada (% de uso esperado año por año).
- Justificación: en función de demanda objetivo del Cap. II.

### 3.3.3. Proceso Productivo / de Servicio
- Diagrama de flujo del proceso principal (usar símbolos ISO 9000).
- Tabla "SÍMBOLOS DE LA NORMA ISO 9000 PARA DIAGRAMAS DE FLUJO".
- Descripción paso a paso del flujo.

### 3.3.4. Distribución y Diseño de Instalaciones
- Layout / planta del local.
- Áreas funcionales: recepción, atención, almacenes, oficinas.
- Superficie por área en m².

### 3.3.5. Maquinaria, Equipo y Herramientas
Por cada categoría una tabla con columnas:
| Item | Cantidad | Costo unitario (Bs) | Costo total (Bs) | Proveedor |

Categorías obligatorias:
- Maquinaria principal.
- Equipos secundarios.
- Equipos informáticos.
- Mobiliario y enseres.
- Implementos y EPP.
- Herramientas.
- Vehículos (si aplica).
- Obras civiles / adecuaciones.

═══════════════════════════════════════════════════════════════
## 3.4. Planificación Financiera
═══════════════════════════════════════════════════════════════

⚠️ Esta es LA sección más crítica del documento. Los números aquí
alimentan el Resumen Ejecutivo y las Conclusiones. Si hay errores
acá, todo el documento queda observado.

### 3.4.1. Inversión Total
Tabla "INVERSIÓN TOTAL EXPRESADA EN BOLIVIANOS" con desglose:
- **Inversión Fija**: maquinaria, equipos, obras civiles, muebles,
  vehículos, implementos.
- **Inversión Diferida**: trámites legales, constitución, capacitación
  inicial, software, marca registrada.
- **Capital de Trabajo**: caja, cuentas por cobrar, inventario,
  cubrir 2-3 meses de costos operativos iniciales.

TOTAL INVERSIÓN = Fija + Diferida + Capital de Trabajo.

### 3.4.2. Estructura de Financiamiento
Tabla con dos columnas:
| Fuente | Monto (Bs) | % |

- Capital propio.
- Capital financiado (banco / cooperativa).

Tabla "TASAS DE INTERÉS QUE PAGAN LAS EMPRESAS POR PRÉSTAMO" en
Bolivia: usar fuente ASFI 2024-2025.

### 3.4.3. Amortización del Préstamo
Tabla "AMORTIZACIÓN CONSTANTE EXPRESADA EN BOLIVIANOS":
| Año | Saldo inicial | Amortización | Interés | Cuota | Saldo final |

Mostrar los años del horizonte completo (5 típicamente).

### 3.4.4. Determinación de Precios de Venta
Por cada producto/servicio, una tabla "DETERMINACIÓN DE PRECIO DE
VENTA PARA [servicio X]" con desglose:
- Costo unitario directo (materia prima, mano de obra directa).
- Costo unitario indirecto (gastos generales / unidad).
- Margen de utilidad (%).
- Precio de venta sin impuestos.
- IVA 13% (incluido en venta minorista bolivariana).
- Precio de venta al público.

### 3.4.5. Presupuestos de Ingresos y Costos
- **Ingresos anuales proyectados** (5 años):
  Tabla con columnas: Producto/Servicio | Año 1 | Año 2 | ... | Año 5.

- **Costos directos**: materia prima, mano de obra directa.
- **Costos de producción**: directos + indirectos de producción.
- **Costos de administración**: sueldos personal admin, servicios básicos,
  alquiler, suministros.
- **Costos de comercialización**: marketing, ventas, distribución.
- **Costos totales** = suma de los cuatro anteriores.

### 3.4.6. Depreciación de Activos Fijos
Tabla con columnas:
| Activo | Costo | Vida útil (años) | Depreciación anual |

Usar coeficientes legales bolivianos del Reglamento de Activos Fijos
del SIN.

### 3.4.7. Cálculo del Punto de Equilibrio
- Fórmula: PE = Costos Fijos / (Precio Unitario - Costo Variable Unitario).
- PE en unidades y en bolivianos.
- Gráfico de punto de equilibrio (línea ingresos vs costos).

### 3.4.8. Estado de Resultados Proyectado
Tabla "ESTADO DE RESULTADOS SIN FINANCIAMIENTO" y luego
"ESTADO DE RESULTADOS CON FINANCIAMIENTO" (5 años cada una):
Ventas brutas
- Costos directos
= Utilidad bruta
- Costos administrativos
- Costos comerciales
= Utilidad operativa
- Gastos financieros (solo en versión "con financiamiento")
- Depreciación
= Utilidad antes de impuestos
- IUE (25% Bolivia)
= Utilidad neta

### 3.4.9. Flujo de Caja (Flujo Neto de Fondos)
Tabla "FLUJO NETO DE FONDOS DEL PROYECTO SIN FINANCIAMIENTO":
| Concepto | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
| Inversión inicial | (X) | | | | | |
| Ingresos | | X | X | X | X | X |
| Egresos | | (X) | (X) | (X) | (X) | (X) |
| Flujo neto | (X) | X | X | X | X | X |

Repetir para "FLUJO NETO DE FONDOS DEL PROYECTO CON FINANCIAMIENTO".

### 3.4.10. Indicadores de Rentabilidad
Calcular y mostrar PASO A PASO (no solo el resultado):

a) **TREMA / WACC**: Tasa Mínima Atractiva de Retorno.
   Formula: WACC = (E/V × Re) + (D/V × Rd × (1 - T))

b) **VAN (Valor Actual Neto)**:
   VAN = Σ [Flujo_t / (1+i)^t] − Inversión inicial.
   Mostrar la sumatoria término a término.

c) **TIR (Tasa Interna de Retorno)**:
   Tasa que hace VAN = 0. Mostrar iteración o uso de Excel.

d) **B/C (Relación Beneficio/Costo)**:
   B/C = VA de ingresos / VA de egresos.

e) **Período de Recuperación de la Inversión (Payback)**:
   Año donde flujo acumulado = inversión inicial.

### 3.4.11. Comparación de Indicadores (Sin vs Con Financiamiento)
Tabla "COMPARACIÓN DE INDICADORES FINANCIEROS":
| Indicador | Sin financiamiento | Con financiamiento |
| VAN | | |
| TIR | | |
| B/C | | |
| Payback | | |

### 3.4.12. Análisis de Sensibilidad
- Variables sensibles: precio de venta, demanda, costo principal.
- Escenarios: pesimista (-10%), base (0%), optimista (+10%).
- Tabla de impacto en VAN y TIR por escenario.

═══════════════════════════════════════════════════════════════
## 3.5. Aspectos Legales
═══════════════════════════════════════════════════════════════

### 3.5.1. Constitución de la Empresa
- Tipo societario: Unipersonal / SRL / S.A. — justificar elección.
- Pasos de constitución legal en Bolivia (orden secuencial):

1. **SEPREC (Servicio Plurinacional de Registro de Comercio)**:
   reserva de nombre comercial + Matrícula de Comercio.
   (Antes era FUNDEMPRESA hasta 2022.)
2. **Servicio de Impuestos Nacionales (SIN)**: NIT.
3. **Caja Nacional de Salud (CNS)**: inscripción patronal.
4. **Gestora Pública de la Seguridad Social de Largo Plazo**:
   aportes AFP.
5. **Ministerio de Trabajo, Empleo y Previsión Social**: Registro
   Obligatorio de Empleadores (ROE) y rol de pagos.
6. **Gobierno Municipal**: Licencia de Funcionamiento.
7. **Padrón Nacional de Contribuyentes Biométrico Digital (PBD-11)**.

### 3.5.2. Permisos Sectoriales Específicos
⚠️ CARRERA-AWARE: agregar las inscripciones obligatorias según el
sector del proyecto:

- **Sector veterinario / clínicas veterinarias**:
  > Registro en SENASAG (Servicio Nacional de Sanidad Agropecuaria
    e Inocuidad Alimentaria) — obligatorio para clínicas veterinarias.
  > Registro en el Colegio de Médicos Veterinarios de Bolivia (COMVETBOL)
    para los profesionales.
- **Sector alimentario**: SENASAG + Registro Sanitario.
- **Sector farmacéutico**: AGEMED.
- **Sector telecomunicaciones**: ATT.
- **Sector transporte**: ATT + ABT.
- **Sector financiero**: ASFI.
- **Sector minero**: AJAM + SERGEOMIN.
- **Sector turístico**: VICETUR + registro municipal de turismo.

Por cada permiso indicar: nombre completo, sigla, función, costo
aproximado del trámite y plazo.

### 3.5.3. Estimación de Costos de Formalización
Tabla "COSTOS PARA LA CREACIÓN DE LA [TIPO DE EMPRESA]":
| Trámite | Institución | Costo (Bs) | Plazo |

Suma total que se incluye en Inversión Diferida (sección 3.4.1).

### 3.5.4. Marco Normativo Aplicable
Listar las leyes y reglamentos que rigen la operación:
- Código de Comercio (Ley General).
- Ley General del Trabajo + DS 224.
- Ley 1488 de Bancos y Entidades Financieras (si aplica).
- Ley 1333 del Medio Ambiente.
- Ley 453 de Defensa del Consumidor.
- Leyes sectoriales específicas (citar por número y año).

PROHIBIDO: inventar leyes con números falsos. Si no se conoce número
exacto, usar nombre completo de la ley sin número, o citar el reglamento.

## Auto-verificación antes de devolver

- [ ] Las 5 secciones en orden: 3.1 → 3.2 → 3.3 → 3.4 → 3.5.
- [ ] Marketing en 3.2 (NO dentro de 3.1 Estructura Organizacional).
- [ ] Evaluación financiera dentro de 3.4 (NO como capítulo aparte).
- [ ] Tablas con numeración SECUENCIAL continuando del Cap. II.
- [ ] Cada tabla con "Fuente:" al pie.
- [ ] Indicadores financieros calculados paso a paso (no solo resultado).
- [ ] Comparación SIN vs CON financiamiento en tabla aparte.
- [ ] Análisis de sensibilidad con 3 escenarios.
- [ ] Aspectos legales con SENASAG/COMVETBOL si el sector es veterinario.
- [ ] Cero leyes inventadas, cero instituciones inventadas.

## Salida esperada

# CAPÍTULO III — PLAN ESTRATÉGICO

## 3.1. Estructura Organizacional
### 3.1.1. Misión, Visión y Valores Institucionales
### 3.1.2. Organigrama Propuesto
### 3.1.3. Requerimiento de Mano de Obra
### 3.1.4. Descripción de Cargos
### 3.1.5. Reclutamiento y Selección de Personal
### 3.1.6. Programa de Inducción del Personal
### 3.1.7. Administración de Sueldos y Salarios

## 3.2. Plan de Marketing
### 3.2.1. Segmentación de Mercado
### 3.2.2. Estrategia Genérica
### 3.2.3. Estrategia de Crecimiento
### 3.2.4. Marketing Mix
### 3.2.5. Plan de Mercadotecnia

## 3.3. Plan de Producción / Operativo
### 3.3.1. Localización
### 3.3.2. Tamaño del Proyecto
### 3.3.3. Proceso Productivo / de Servicio
### 3.3.4. Distribución y Diseño de Instalaciones
### 3.3.5. Maquinaria, Equipo y Herramientas

## 3.4. Planificación Financiera
### 3.4.1. Inversión Total
### 3.4.2. Estructura de Financiamiento
### 3.4.3. Amortización del Préstamo
### 3.4.4. Determinación de Precios de Venta
### 3.4.5. Presupuestos de Ingresos y Costos
### 3.4.6. Depreciación de Activos Fijos
### 3.4.7. Cálculo del Punto de Equilibrio
### 3.4.8. Estado de Resultados Proyectado
### 3.4.9. Flujo de Caja
### 3.4.10. Indicadores de Rentabilidad
### 3.4.11. Comparación de Indicadores (Sin vs Con Financiamiento)
### 3.4.12. Análisis de Sensibilidad

## 3.5. Aspectos Legales
### 3.5.1. Constitución de la Empresa
### 3.5.2. Permisos Sectoriales Específicos
### 3.5.3. Estimación de Costos de Formalización
### 3.5.4. Marco Normativo Aplicable
`;

export const PROMPT_UNIFRANZ_PLAN_ESTRATEGICO = buildPromptUnifranz(CUERPO);
