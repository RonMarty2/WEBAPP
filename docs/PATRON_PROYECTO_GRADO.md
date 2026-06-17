# PATRÓN DEL SERVICIO — PROYECTO DE GRADO (UCATEC)

> **Estado**: 🟢 **IMPLEMENTADO al 100%** — 22 de 22 fases con prompt real.
>              Pendiente: testing E2E real con IA + conexión de Gemini Imagen 4.
> **Rama de trabajo**: `PRUEBAS-RON` (sin push a GitHub todavía).
> **Producto destino**: nuevo servicio del SaaS Laboratorio Académico PRO.
> **Última actualización**: 2026-05-12 (Semana 9 cerrada).

Este documento es la **fuente de verdad** para implementar el flujo de "Proyecto
de Grado" dentro del SaaS. Recopila el análisis de 6 proyectos reales de UCATEC,
las decisiones tomadas con el fundador y las reglas del sistema que se aplicarán
desde el primer commit.

**Antes de codear cualquier prompt, endpoint o componente para este servicio,
este documento debe estar aprobado.** Si algo cambia en el código, también
cambia acá.

---

## 1. Decisiones tomadas (consolidado)

| # | Tema | Decisión |
|---:|---|---|
| 1 | Modalidad de titulación | Proyecto de Grado (factibilidad / pre-factibilidad de creación de empresa) |
| 2 | Universidad inicial | UCATEC — Cochabamba |
| 3 | Carreras | Licenciatura en Ingeniería Comercial + Administración de Empresas |
| 4 | Subtipos | **Producción** + **Servicios** (sin comercialización pura) |
| 5 | Asignación de subtipo | El estudiante elige al inicio (wizard pregunta directo) |
| 6 | Encuestas | Híbrido: sistema genera modelo + estudiante aplica + sistema analiza |
| 7 | Logos | Gemini Imagen 4 + Ideogram → 6 variantes por proyecto |
| 8 | Cálculos financieros | Motor `simuladorPRO` consumido por WEBAPP (sin Python pago) |
| 9 | Búsqueda real (PESTEL) | Gemini Grounding with Google Search (incluido, gratis) |
| 10 | Análisis estadístico | `simple-statistics` (npm), gratis |
| 11 | Gráficos | Chart.js, gratis |
| 12 | Tono académico | Profesional propio del sistema (NO copiar UCATEC) |
| 13 | Cantidad de fases | 22 fases (más granular que monografía) |
| 14 | Servicio nuevo | `servicio_id: "proy-grado-001"` |
| 15 | Carátula | NO se genera (mismo criterio que monografía después del cambio) |

---

## 2. Corpus analizado

Seis proyectos reales de UCATEC, todos completados y aprobados:

| ID | Autor/a | Tema | Páginas | Subtipo | Calidad declarada |
|---|---|---|---:|---|---|
| 105814 | Anai Peña Escalera | Taller chapería y pintura | ~175 | Producción/Servicio mixto | Concluido y corregido |
| 1011 | Jose Gabriel Lema López | Mantequilla de almendra | ~140 | Producción | Final |
| 1010 | Surimana Ledezma Bacarreza | Panadería línea andina | ~155 | Producción | Concluido y editado |
| 1004 | Nelcy Kenia Durán Morales | Frutilla hidropónica | ~150 | Producción | Aprobado empastado |
| 1002 | Jhoselin Argote Gutiérrez | Accesorios moda femenina | ~145 | Comercialización (se clasifica como servicio) | Final defendido |
| 1162 | Adriana Martínez Bilbao | Cafetería artística | ~310 | **Servicios** (ejemplo de oro) | Calificado por el fundador como "muy bueno" |

**Cobertura**:
- 5 proyectos de producción/comercialización física.
- 1 proyecto de servicios puros (Cafetería Artística — Adriana Martínez).
- **Pendiente conseguir**: 1-2 proyectos adicionales de servicios para enriquecer el subtipo "servicios"; 1 proyecto problemático (reprobado o muy corregido) para sacar antifeatures.

**Limitación reconocida**: los proyectos son guía, no template. El sistema produce documentos *que UCATEC debería recibir*, no *que UCATEC suele recibir*. Los vicios de redacción detectados en algunos proyectos **no se replican**.

---

## 3. Modalidad y carrera

**Modalidad**: Proyecto de Grado.

Subforma: Proyecto de Factibilidad / Pre-factibilidad para la creación de una empresa.

**Carreras objetivo (fase 1)**:
- Licenciatura en Ingeniería Comercial.
- Licenciatura en Administración de Empresas.

**Carreras fuera de scope (por ahora)**: Ingeniería de Sistemas, Derecho, Civil, Arquitectura. Se evaluarán cuando llegue demanda real.

**Otras universidades**: el sistema se diseña *modular* desde el inicio para
poder agregar universidades distintas (UMSS, UMSA, UCB, UAGRM, Unifranz, etc.)
sin reescribir el flujo central. La universidad solo cambia: márgenes,
tipografía, numeración de páginas, carátula institucional (cuando aplique) y
formato de bibliografía.

---

## 4. Los dos subtipos

### 4.1 Subtipo PRODUCCIÓN (`proy-prod-001`)

**Definición**: el estudiante propone crear una empresa que produce un bien
físico y lo comercializa.

**Ejemplos del corpus**: mantequilla de almendra, hamburguesas de quinua,
panes andinos, frutilla hidropónica, accesorios femeninos.

**Características que activa el sistema**:
- Marketing Mix clásico **4P**: Producto, Precio, Plaza, Promoción.
- Estudio técnico **denso**: proceso productivo, layout, maquinaria, insumos, materia prima.
- Estudio financiero con peso en **costo variable de producción** y **inversión en maquinaria**.
- Glosario Cap. II con conceptos de producción y logística.
- Tablas obligatorias: receta/composición, capacidad productiva mensual,
  punto de equilibrio en unidades.

### 4.2 Subtipo SERVICIOS (`proy-serv-001`)

**Definición**: el estudiante propone crear una empresa que brinda un servicio
(no produce un bien tangible o lo produce de forma incidental al servicio).

**Ejemplos del corpus**: cafetería artística, taller de chapería (mixto pero predomina el servicio).

**Características que activa el sistema**:
- Marketing Mix ampliado **7P**: 4P + Personas, Procesos, Evidencia Física.
- Estudio técnico **ambientado**: layout del local, experiencia, equipamiento
  (no maquinaria productiva), capacidad de atención por hora.
- Estudio financiero con peso en **costo fijo (personal)** y **inversión en habilitación del local**.
- Glosario Cap. II con conceptos de marketing de servicios, branding,
  experiencia del cliente, gestión de calidad de servicio.
- Tablas obligatorias: ficha de cada servicio ofrecido, protocolo de atención,
  capacidad de atención mensual.

### 4.3 Cómo se elige el subtipo

En la fase 0 (`ph-proy-cap0`) el wizard pregunta directo:

> **¿Qué tipo de proyecto vas a desarrollar?**
>
> ☐ **Producción y comercialización de un bien**
> *(Ej: vas a producir alimentos, ropa, productos químicos, tecnología tangible.)*
>
> ☐ **Brindar un servicio**
> *(Ej: cafetería, taller, agencia, consultoría, salón, escuela.)*

El estudiante elige una opción y el sistema activa el subtipo correspondiente. El resto del flujo está predeterminado por esa elección — no hay forma de "cambiar de subtipo a mitad de proyecto" sin empezar de cero.

---

## 5. Las 22 fases del flujo

Distribución:
- **3** fundamentos (cap0, cap1, cap2)
- **6** análisis situacional (cap3a → cap3f)
- **8** marco propositivo (cap4a, cap4a-bis, cap4b → cap4g)
- **3** cierre académico (resumen, conclusiones, referencias)
- **2** compilación y defensa (latex, defensa)

Cada fase tiene `phase_id`, `label`, `max_tokens`, herramientas externas y reglas de validación. Las marcadas con 🟦 son comunes a ambos subtipos; las marcadas con 🟧 cambian según subtipo.

### Fase 0 — Idea de negocio (`ph-proy-cap0`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | El estudiante define la idea, segmento inicial, ubicación, subtipo |
| Input del estudiante | Descripción libre (200-500 palabras) |
| Output | Idea estructurada + subtipo confirmado + tema sugerido |
| Max tokens | 3000 |
| Herramientas | Solo IA texto (cascada Groq → Anthropic → Gemini) |
| Validaciones | Subtipo elegido; idea no vacía; sin marcadores [COMPLETAR] |

### Fase 1 — Marco Referencial (`ph-proy-cap1`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Antecedentes, problema, objetivos, justificación, alcance, metodología |
| Secciones obligatorias | 1.1 a 1.9 según índice canónico UCATEC |
| Max tokens | 12000 |
| Herramientas | IA texto + **Gemini Grounding** (datos de mercado actuales de Bolivia) |
| Validaciones | Cada subsección presente; objetivos SMART; árbol de problemas presente |

**Subsecciones obligatorias**:
- 1.1 Antecedentes del trabajo académico
- 1.2 Objeto de estudio
- 1.3 Problema (identificación + árbol + formulación)
- 1.4 Objetivos (general + específicos)
- 1.5 Justificación (técnica + económica + social)
- 1.6 Alcance (temático + geográfico + temporal)
- 1.7 Metodología (enfoque + tipo + método)
- 1.8 Muestreo (universo + tipo + tamaño con fórmula)

### Fase 2 — Marco Teórico (`ph-proy-cap2`) 🟧

| Campo | Valor |
|---|---|
| Objetivo | Glosario de 25-35 conceptos clave |
| Max tokens | 9000 |
| Herramientas | IA texto + verificación de fuentes APA |

**Diferencia por subtipo**:

| Subtipo | Conceptos base obligatorios |
|---|---|
| Producción | Factibilidad, VAN, TIR, WACC, PESTEL, 5 Fuerzas Porter, FODA, EFI, EFE, MPC, Mix 4P, Cadena de Valor, Proceso productivo, Capacidad instalada, Punto de equilibrio |
| Servicios | Mismos básicos + Mix 7P, Marketing de servicios, Calidad de servicio, Experiencia del cliente, Branding, Evidencia física, Servicescape |

### Fase 3a — Macroentorno PESTEL (`ph-proy-cap3a`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Análisis Político, Económico, Social, Tecnológico, Ecológico, Legal con cifras REALES de Bolivia |
| Max tokens | 8000 |
| Herramientas | IA texto + **Gemini Grounding obligatorio** (INE, BCB, prensa, leyes Bolivia) |
| Validaciones | Cada uno de los 6 factores presente; al menos 2 cifras citadas por factor; URLs reales |

### Fase 3b — Microentorno 5 Fuerzas Porter (`ph-proy-cap3b`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Las 5 fuerzas con competidores reales del rubro local |
| Max tokens | 6000 |
| Herramientas | IA texto + **Gemini Grounding** (competidores locales) |
| Validaciones | Las 5 fuerzas con análisis individual; competidores citados con nombre real |

### Fase 3c — Matrices estratégicas (`ph-proy-cap3c`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Matriz OA / EFE / EFI / MPC / FODA |
| Max tokens | 5000 |
| Herramientas | IA texto + cálculos JavaScript para puntuaciones |
| Validaciones | Pesos suman 1.00 en EFE/EFI; calificaciones 1-4 válidas |

### Fase 3d — Diseño de encuesta (`ph-proy-cap3d`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Construir el instrumento de encuesta + calcular tamaño de muestra |
| Max tokens | 5000 |
| Herramientas | IA texto + fórmula de muestra en JavaScript |
| Output | Cuestionario armado + instructivo de cómo aplicarlo + n calculado |
| Validaciones | 10-20 preguntas; mezcla cerradas/abiertas; muestra ≥ 100 |

### Fase 3e — Análisis de encuesta REAL (`ph-proy-cap3e`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Tabular respuestas reales que sube el estudiante |
| Input del estudiante | CSV/Excel con sus respuestas reales |
| Max tokens | 6000 |
| Herramientas | **JavaScript con `simple-statistics`** (frecuencias, %, chi-cuadrado) + **Chart.js** para gráficos + IA para interpretación |
| Output | Tabla por pregunta + gráfico + interpretación + análisis bivariado |
| Validaciones | n real ≥ 80% del n calculado; cero "datos inventados" |

**Si el estudiante todavía no aplicó la encuesta**: el sistema pausa esta fase y le muestra un checklist de "qué tenés que hacer antes de continuar". No genera datos sintéticos bajo ningún concepto.

### Fase 3f — Demanda y cuota (`ph-proy-cap3f`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Demanda potencial, depuración, proyección 5 años, cuota de mercado |
| Max tokens | 4000 |
| Herramientas | IA + JavaScript para cálculos de proyección |
| Validaciones | Demanda > 0; cuota razonable (1-15% típico); proyección no exponencial irreal |

### Fase 4a — Estudio Organizacional (`ph-proy-cap4a`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Lineamientos estratégicos + estructura + funciones de cada cargo |
| Contenido | Misión, visión, valores corporativos, descripción de la empresa, nombre y razón social, organigrama, manual de funciones por cargo |
| Max tokens | 7000 |
| Herramientas | IA texto + **generación de organigrama** como SVG/Mermaid |
| Validaciones | Misión y visión presentes; organigrama con ≥3 cargos; manual por cada cargo del organigrama |

### Fase 4a-bis — Propuesta Administrativa de RRHH (`ph-proy-cap4abis`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Proceso de gestión del recurso humano para arrancar y operar la empresa |
| Contenido | Proceso de gestión de RRHH (mapa), búsqueda y convocatoria, selección, evaluación, contratación, inducción, capacitación, evaluación de desempeño, política salarial básica |
| Max tokens | 6000 |
| Herramientas | IA texto + verificación legal RRHH Bolivia (AFP, Caja, finiquito) |
| Validaciones | Las 5 etapas del proceso RRHH presentes; pasos numerados; sueldos en Bs.; cumplimiento normativa laboral boliviana citada |

**Nota**: esta fase es independiente de la 4a porque cubre un dominio distinto
(la gestión del talento humano vs la estructura de la organización). En los
proyectos UCATEC aparece como sección 4.4 separada del estudio organizacional.

### Fase 4b — Estudio legal (`ph-proy-cap4b`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Constitución de empresa según Bolivia (FUNDEMPRESA, SIN, AFP, alcaldía) |
| Max tokens | 6000 |
| Herramientas | IA + **Gemini Grounding** (verificar trámites vigentes Bolivia) |
| Validaciones | Pasos numerados; costos en Bs.; entidades reales citadas |

### Fase 4c — Estudio técnico (`ph-proy-cap4c`) 🟧

| Campo | Valor |
|---|---|
| Objetivo | Localización (método ponderado), tamaño, layout, equipamiento |
| Max tokens | 9000 |
| Herramientas | IA texto + cálculo de ponderación en JavaScript |

**Diferencia por subtipo**:

| Subtipo | Contenido específico |
|---|---|
| Producción | Proceso productivo (diagrama de flujo), maquinaria con costos, capacidad mensual, materia prima |
| Servicios | Ambientación del local, capacidad de atención por hora, equipamiento (no maquinaria), protocolos de atención |

### Fase 4d — Branding y diseño comercial (`ph-proy-cap4d`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Nombre, logo (6 variantes), colores, tipografía, identidad visual |
| Max tokens | 4000 |
| Herramientas | IA texto + **Gemini Imagen 4** (3 logos) + **Ideogram** (3 logos) |
| Output | 6 propuestas de logo descargables + paleta de colores + tipografía sugerida |
| Validaciones | 6 logos generados; paleta con 3-5 colores; tipografía coherente con segmento |

### Fase 4e — Mix de Marketing (`ph-proy-cap4e`) 🟧

| Campo | Valor |
|---|---|
| Objetivo | Mix de marketing aplicado al proyecto |
| Max tokens | 8000 |

**Diferencia por subtipo**:

| Subtipo | Modelo aplicado |
|---|---|
| Producción | **4P clásico**: Producto, Precio, Plaza, Promoción |
| Servicios | **7P ampliado**: 4P + Personas, Procesos, Evidencia Física |

### Fase 4f — Estudio financiero (`ph-proy-cap4f`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Inversión inicial, costos fijos/variables, ingresos, financiamiento, amortización |
| Max tokens | 8000 |
| Herramientas | **simuladorPRO** para todos los cálculos; WEBAPP/IA solo presentan e interpretan |
| Output | Tablas financieras precisas + amortización detallada |
| Validaciones | Cero inconsistencias entre tablas; montos en Bs.; financiamiento (deuda + capital) = inversión total |

### Fase 4g — Evaluación del proyecto (`ph-proy-cap4g`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Flujo de caja 5 años, VAN, TIR, WACC, punto de equilibrio |
| Max tokens | 6000 |
| Herramientas | **simuladorPRO** para cálculos exactos; WEBAPP/IA solo presentan e interpretan |
| Validaciones | VAN, TIR, WACC consistentes entre sí; flujo de caja sin errores aritméticos |

**Fórmulas implementadas en `simuladorPRO`** (no las inventa la IA ni WEBAPP):
- VAN: `Σ(FCt / (1+k)^t) - I₀`
- TIR: método de Newton-Raphson o bisección
- WACC: `(E/V × Re) + (D/V × Rd × (1-T))`
- Punto de equilibrio: `CF / (P - CVu)`
- IVA/IT/IUE Bolivia: IVA 13% por debito/credito fiscal, IT 3% sobre
  ingresos brutos e IUE 25% sobre utilidad positiva.

### Fase 5 — Resumen Ejecutivo (`ph-proy-resumen`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Síntesis 300-450 palabras |
| Max tokens | 1500 |
| Herramientas | IA texto |
| Validaciones | Largo respetado; menciona VAN/TIR del estudio financiero; sin contenido nuevo |

### Fase 6 — Conclusiones y Recomendaciones (`ph-proy-conclusiones`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Conclusiones generales y específicas + recomendaciones |
| Max tokens | 4000 |
| Herramientas | IA texto |
| Validaciones | 1 conclusión general + N específicas (1 por objetivo); 5-10 recomendaciones accionables |

### Fase 7 — Bibliografía (`ph-proy-referencias`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Consolidar todas las citas en APA 7 |
| Max tokens | 4000 |
| Herramientas | IA + verificador APA |
| Validaciones | Todas las citas del documento aparecen; orden alfabético; formato APA estricto |

### Fase 8 — Compilar LaTeX (`ph-proy-latex`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Generar `.tex` completo compilable en Overleaf |
| Max tokens | 50000 |
| Herramientas | IA + sanitizador de figuras + auto-continue |
| Validaciones | Misma artillería que en monografía (sanitize, parche chapter, numeración romana) |

### Fase 9 — Banco de preguntas defensa (`ph-proy-defensa`) 🟦

| Campo | Valor |
|---|---|
| Objetivo | Preguntas para tribunal — bloque conocimiento + bloque autoría |
| Max tokens | 2500 por fase fuente |
| Herramientas | IA texto (fire-and-forget al aprobar cada cap) |
| Validaciones | Iguales que monografía; JSON estricto parseado |

---

## 6. Estándar de tono profesional

Reglas del sistema. No negociables. Cada prompt las incluye al inicio.

### 6.1 Estilo y voz

- **Tercera persona impersonal**. ❌ "Yo realicé encuestas". ✅ "Se realizaron encuestas".
- **Tono académico formal**. Sin coloquialismos, sin emojis, sin marcas de oralidad.
- **Lenguaje técnico** cuando corresponde (concepto definido → se usa luego).
- **Claridad sobre adorno**. Las oraciones no son ladrillos, no son telegramas.

### 6.2 Estructura de cada sección

Toda sección sustantiva sigue este patrón obligatorio:

1. **Anuncio** (1-2 oraciones): qué se va a tratar.
2. **Desarrollo** (varios párrafos): el contenido en sí.
3. **Cierre o conclusión parcial** (1-2 oraciones): qué se concluye / qué viene después.

### 6.3 Tablas y figuras

Toda tabla o figura cumple las 3 reglas:

1. **Anuncio antes**: "En la Tabla 3.2 se presenta…"
2. **La tabla/figura con caption APA 7**.
3. **Interpretación después**: "Como se observa, el factor económico obtuvo…"

Sin estas 3, no se incluye.

### 6.4 Citas

- Toda afirmación con dato o cifra debe estar citada.
- Formato APA 7: `(Apellido, año)` o `Apellido (año) afirma que…`
- Cada cita en el texto debe tener su entrada en bibliografía y viceversa.

### 6.5 Largo de párrafo

4-8 oraciones. Ni un párrafo de 2 oraciones (telegráfico) ni de 15 (laberinto).

---

## 7. Anti-vicios académicos (frases prohibidas)

Estas frases **NO** deben aparecer en ningún documento generado. La IA las
incorpora por entrenamiento, hay que prohibirlas explícitamente en cada prompt.

### 7.1 Muletillas huecas

- "Es importante destacar que…"
- "Cabe mencionar que…"
- "Cabe resaltar que…"
- "Es preciso señalar que…"
- "Vale la pena mencionar…"
- "Conviene apuntar que…"
- "No está de más decir que…"
- "Es menester aclarar que…"

### 7.2 Conectores de relleno

- "En conclusión, podemos afirmar que…"
- "Para finalizar este análisis…"
- "Como se mencionó anteriormente…" (repetir info ya dada)
- "Sin lugar a dudas…"
- "Indiscutiblemente…"
- "Por su parte, cabe mencionar…"

### 7.3 Frases tipo IA

- "En la actualidad, el mundo se encuentra…"
- "En el contexto actual, las empresas deben…"
- "Es indudable que la tecnología ha revolucionado…"
- "El siglo XXI nos presenta nuevos desafíos…"

### 7.4 Tipografía y puntuación

- **Em-dash (—)** en castellano cuando no corresponde. Se usan coma, punto y coma, dos puntos o paréntesis.
- Comillas tipográficas dobles `"…"` (no `"…"` mecanográficas) cuando sea posible.
- Dos espacios entre oraciones: prohibido.

### 7.5 Vicios detectados en el corpus UCATEC

(Estos NO se replican aunque aparezcan en los ejemplos.)

- Errores ortográficos: "Bolivía" en vez de "Bolivia", "vólvía" en vez de "Bolivia".
- Conjugación: "que se pudo determinar" usado como muletilla.
- Cierres autobiográficos en agradecimientos que se filtran al cuerpo.

---

## 8. Arquitectura técnica

### 8.1 Identificadores en base de datos

```
servicio_id:        "proy-grado-001"
tipo_proyecto_id:   "proy-prod-001"  o  "proy-serv-001"
```

### 8.2 Cascada IA (sin cambios respecto de monografía)

```
1. Groq (llama-3.3-70b-versatile)     — principal
2. Anthropic (claude-haiku-4-5)        — fallback 1
3. Gemini (2.5 Pro)                    — fallback 2 (con Grounding cuando aplica)
4. OpenAI (gpt-4o-mini)                — fallback final
```

Cada fase puede tener un `provider_id` preferido fijo cuando la herramienta lo
exige (ej: `ph-proy-cap3a` PESTEL exige Gemini porque solo Gemini tiene
Grounding nativo).

### 8.3 APIs externas y costo aproximado

| Servicio | Para qué | Costo aprox. por proyecto |
|---|---|---|
| Groq / Anthropic / OpenAI | Texto base | Pago por tokens (cubierto por el plan) |
| **Gemini Grounding** | Búsqueda real para PESTEL, legal, microentorno | **$0** (incluido en API Gemini) |
| **Gemini Imagen 4** | 3 logos | ~$0.12 |
| **Ideogram** | 3 logos con texto | ~$0.09 |
| Chrome headless (Overleaf flow) | PDF (futuro) | $0 |
| **Total APIs extras** | | **~$0.21 por proyecto** |

### 8.4 Cálculos financieros centralizados

Los cálculos financieros ya no viven en WEBAPP. La fuente oficial es
`simuladorPRO`, consumida desde WEBAPP mediante una capa cliente:

- VAN, TIR, WACC, payback y payback descontado.
- Amortización (método francés, alemán, americano).
- Punto de equilibrio por unidad y por monto.
- Flujo de caja proyectado.
- Sensibilidad y escenarios recalibrados.
- Tamaño de muestra y encuestas siguen siendo lógica académica no financiera.
- Chi-cuadrado con tabla de contingencia (vía `simple-statistics`).

Cero dependencia de Python o servicios pagos para esto.

### 8.5 Gráficos

Implementación con **Chart.js** en el cliente:

- Pie chart, bar chart, dougnut → encuestas.
- Line chart → proyección de demanda e ingresos.
- Stacked bar → composición de costos.

Cuando el documento se genera en LaTeX, los gráficos se exportan como SVG/PDF
embebidos. Cuando se renderiza HTML para preview, se muestran como canvas
interactivo.

### 8.6 Persistencia

Igual que monografía: `phase_contents` en BD con keys por fase.

Convención de keys:
- `ph-proy-cap1` → contenido final aprobado
- `ph-proy-cap1_borrador` → borrador pendiente de aprobación
- `ph-proy-cap1_preguntas` → JSON con preguntas defensa (fire-and-forget)
- `ph-proy-cap3e_csv` → CSV crudo de encuesta subida por el estudiante
- `ph-proy-cap3e_analisis` → resultado del análisis estadístico
- `ph-proy-cap4d_logos` → array con URLs/base64 de los 6 logos generados

---

## 9. Reglas de seguridad y producción

Estas reglas se aplican desde el primer endpoint nuevo. **No son negociables**.

### 9.1 Autenticación

- Cada endpoint nuevo bajo `/api/projects/*` usa `requireAuth()` al inicio.
- Endpoints `/api/admin/*` están protegidos por el `proxy.ts` global.
- El usuario solo accede a sus propios proyectos (chequeo `proyecto.usuario_id === user.id`).

### 9.2 Validación de input

Cada endpoint:
- Valida que el body tenga los campos requeridos.
- Valida tipos (string, number, array).
- Valida tamaños (max length, min length).
- Si algo falla → 400 con mensaje genérico (no leakea detalles internos).

### 9.3 Manejo de errores

- Nunca devolver `(e as Error).message` al cliente sin filtrar.
- Helper `safeErrorResponse(error, fallbackMessage)` para todas las respuestas 500.
- Detalle completo solo en logs del servidor (`console.error` con contexto).

### 9.4 Costos de IA controlados

- `max_tokens` calibrado por fase (ver sección 5).
- Cada llamada IA loguea su consumo en `aiTrace`.
- En el futuro: quota mensual por plan de usuario (estándar = 1 proyecto/mes; pro = 3).

### 9.5 Rate limiting

- Por usuario: máximo 20 generaciones de fase por hora.
- Por IP: máximo 100 requests por hora.
- Implementación: Upstash Redis cuando se conecte; mientras tanto, memoria del servidor.

### 9.6 Secrets

- `ADMIN_JWT_SECRET` y `AUTH_SECRET` ya están protegidos (sin fallback inseguro).
- Las API keys nuevas (`GEMINI_API_KEY`, `IDEOGRAM_API_KEY`) van en `.env.local` y Vercel.

### 9.7 Subida de archivos

- CSVs de encuesta: máx 5 MB, validar que sea CSV/Excel parseable.
- Documentos del estudiante: máx 10 MB, ya implementado.

---

## 10. Lecciones aprendidas de monografía (no repetir)

Lista exhaustiva de errores que cometimos en el flujo de monografía y cómo se
evitan desde el diseño del flujo de proyecto de grado.

### 10.1 Del lado del documento generado

| Error en monografía | Solución aplicada desde el día 1 en proyecto de grado |
|---|---|
| IA comprimía contenido a 60% de lo esperado | Regla del 90% palabras en cada prompt + max_tokens calibrado |
| Carátula con placeholders sin rellenar | **NO se genera carátula** (idem monografía después del fix) |
| `\includegraphics{archivo}` apuntando a imágenes inexistentes | Sanitizador `sanitizeOrphanIncludes` reutilizado |
| Franja blanca enorme antes de cada capítulo en PDF | Parche `\@makechapterhead` reutilizado |
| Numeración arábiga en vez de romana | `\renewcommand{\thechapter}{\Roman{chapter}}` desde el primer prompt LaTeX |
| Títulos de capítulo en `\Large` (~17pt) | `\large` (~14pt) desde el primer prompt |
| Frases huecas tipo "Es importante destacar" | Lista de prohibiciones en sección 7 de este documento |

### 10.2 Del lado del sistema

| Error en monografía | Solución aplicada desde el día 1 |
|---|---|
| Fase reciclada que llamaba al prompt viejo y gastaba 6K tokens | Cada fase tiene su prompt único; sin reciclar IDs |
| Errores de tipo TS rompiendo build en Vercel | `npx tsc --noEmit` antes de cada commit; CI a futuro |
| `(e as Error).message` filtrando paths internos | `safeErrorResponse()` desde el primer endpoint |
| Endpoints `/api/admin/*` sin auth | Ya protegidos por `proxy.ts` global |
| JWT secret con fallback en GitHub | Ya removido en commits previos |
| Sin auto-continue cuando IA cortaba | `parecieraTruncado()` + `continuarGeneracion()` reutilizado |
| Mensajes de error filtrando datos sensibles | Filtrado obligatorio |

### 10.3 Del lado del flujo del estudiante

| Error en monografía | Solución |
|---|---|
| Botón "Generar Borrador" en pantallas donde no aplicaba | Patrón `isBancoFase` aplicado proactivamente a las fases especiales |
| PDF directo se rompe en Vercel (sin Chrome) | **El flujo principal es siempre Overleaf**. PDF directo solo si conectamos `@sparticuz/chromium` |
| Estudiante perdido sin guía clara | Cada fase tiene un copy explicativo claro al inicio |

### 10.4 Del lado de la IA

| Error en monografía | Solución |
|---|---|
| IA inventaba autores y citas | Prohibición explícita + Gemini Grounding para datos reales |
| IA respondía con marcadores `[COMPLETAR]` | Lista negra de patrones que invalidan el output |
| IA cambiaba a inglés a mitad de la respuesta | Lock de idioma español Bolivia en cada prompt |

---

## 11. Plan de implementación

Cuando este documento esté aprobado, el orden de trabajo es:

### Semana 1 — Cimientos
- Crear `servicio_id: "proy-grado-001"` y los 2 `tipo_proyecto_id`.
- Wizard de creación de proyecto con la pregunta producción/servicios.
- Conectar la capa cliente de WEBAPP con el motor financiero de `simuladorPRO`.
- Implementar `src/lib/proyectoGrado/encuestas.ts` (frecuencias, chi-cuadrado) + tests.

### Semana 2 — Fases textuales (fases 0, 1, 2)
- Prompts `ph-proy-cap0`, `ph-proy-cap1`, `ph-proy-cap2`.
- Endpoints de generación reutilizando `generate-phase`.
- Variantes por subtipo en Cap II.

### Semana 3 — Análisis externo (fases 3a, 3b, 3c)
- Conectar Gemini Grounding.
- Prompts PESTEL, Porter, Matrices.
- Validador de cifras citadas con URL.

### Semana 4 — Encuestas e investigación (fases 3d, 3e, 3f)
- Diseño de encuesta + cálculo de muestra.
- Subida de CSV crudo + análisis con `simple-statistics`.
- Gráficos con Chart.js.
- Cálculo de demanda y cuota.

### Semana 5 — Propositivo I (fases 4a, 4a-bis, 4b, 4c)
- Estudio organizacional (estructura, organigrama, manuales).
- Propuesta administrativa de RRHH (proceso de gestión del talento).
- Estudio legal.
- Estudio técnico.
- Generación de organigrama (Mermaid SVG).
- Variantes por subtipo en estudio técnico.

### Semana 6 — Branding y comercial (fases 4d, 4e)
- Conectar Gemini Imagen 4 + Ideogram para logos.
- Mix marketing 4P/7P según subtipo.

### Semana 7 — Financiero (fases 4f, 4g)
- Inversión, costos, ingresos, financiamiento, amortización.
- Evaluación: flujo de caja, VAN, TIR, WACC, punto de equilibrio.
- Tablas dinámicas en el output.

### Semana 8 — Cierre (fases 5, 6, 7, 8, 9)
- Resumen ejecutivo, conclusiones, bibliografía.
- Compilar LaTeX (reutilizar artillería de monografía).
- Banco de preguntas para defensa (reutilizar prompt de monografía adaptado).

### Semana 9 — Testing y polish
- Generar 3 proyectos completos de prueba (uno por subtipo y un caso límite).
- Validar contra los proyectos del corpus.
- Ajustes finales en prompts.

---

## 12. Pendientes y decisiones futuras

### 12.1 Por confirmar antes de Semana 1

- [ ] Proveedores reales para Imagen 4 (¿usamos Vertex AI o Gemini API directa?).
- [ ] Cuenta de Ideogram (gratis tiene 25 imágenes/día → puede ser suficiente para empezar).
- [ ] Costo total estimado por proyecto en producción (suma de tokens IA + Imagen 4 + Ideogram).
- [ ] Plan de pricing del SaaS para Proyecto de Grado (¿más caro que monografía?).

### 12.2 Por evaluar más adelante

- Otras universidades (UMSS, UMSA, UCB, UAGRM, Unifranz).
- Otras carreras (Sistemas, Derecho, Civil, Arquitectura).
- Otras modalidades de titulación (Tesis pura, Trabajo Dirigido, Examen de Grado).
- PDF directo con `@sparticuz/chromium` cuando justifique el costo.
- Conexión Supabase real (pendiente macro del proyecto).
- Quota mensual por plan en producción.

### 12.3 Decisiones congeladas (no se discuten salvo cambio explícito del fundador)

- 2 subtipos: producción + servicios.
- 22 fases (organizacional y RRHH están separadas, no fusionadas).
- Estudiante elige el subtipo al inicio (no se deduce).
- Cálculos financieros en `simuladorPRO`, no dentro de WEBAPP ni Python.
- Búsqueda real con Gemini Grounding, no Tavily/Perplexity.
- Logos con 2 APIs combinadas (6 variantes).
- Tono profesional propio del sistema, no copia de UCATEC.

---

## 13. Checklist de aprobación

Antes de tocar código, el fundador debe revisar y confirmar:

- [ ] La lista de decisiones de la sección 1 está completa y correcta.
- [ ] Los 2 subtipos cubren los casos reales de UCATEC.
- [ ] Las 22 fases tienen sentido y no falta ninguna importante.
- [ ] El estándar de tono y los anti-vicios están alineados con la calidad esperada.
- [ ] Las APIs externas y su costo aproximado son aceptables.
- [ ] Las reglas de seguridad cubren lo aprendido de monografía.
- [ ] El plan de 9 semanas es realista para el ritmo de trabajo deseado.

Cuando todas las casillas estén tildadas, **arrancamos código**.

---

*Documento generado a partir del análisis del corpus UCATEC (6 proyectos) y las decisiones tomadas con el fundador entre 2026-05-10 y 2026-05-12. Vive en `docs/PATRON_PROYECTO_GRADO.md` de la rama `PRUEBAS-RON`. Cualquier cambio importante debe reflejarse acá antes de cerrar la tarea.*

---

## 14. ESTADO FINAL DE IMPLEMENTACIÓN (cerrado al 2026-05-12)

### 14.1 Mapa de archivos creados

```
src/lib/proyectoGrado/
├── encuestas.ts           ← Frecuencias, chi-cuadrado, descriptivos
├── encuestas.test.ts      ← 18/18 tests pasan
├── fases.ts               ← Definición de las 22 fases con prompts reales
├── flujo.test.ts          ← 20/20 tests E2E lógicos pasan
└── runtime-helpers.ts     ← Orquestación; delega finanzas a simuladorPRO

src/lib/prompts/proyectoGrado/
├── reglas-comunes.ts      ← Reglas base prepended a cada prompt
├── cap0-idea-negocio.ts
├── cap1-marco-referencial.ts
├── cap2-marco-teorico.ts        ← Variante por subtipo
├── cap3a-pestel.ts
├── cap3b-porter.ts
├── cap3c-matrices.ts
├── cap3d-diseno-encuesta.ts
├── cap3e-analisis-encuesta.ts   ← 2 modos: con data real / proyección
├── cap3f-demanda-cuota.ts
├── cap4a-organizacional.ts
├── cap4abis-rrhh.ts
├── cap4b-legal.ts
├── cap4c-tecnico.ts             ← Variante por subtipo
├── cap4d-branding.ts
├── cap4e-marketing.ts           ← Variante por subtipo
├── cap4f-financiero.ts
├── cap4g-evaluacion.ts
├── resumen-ejecutivo.ts
├── conclusiones.ts
├── referencias.ts
├── latex.ts                     ← Reutiliza prompt de monografía
└── defensa.ts                   ← Reutiliza banco-preguntas de monografía
```

### 14.2 Integración con el sistema existente

- `src/lib/scribePhases.ts`: `resolvePhases("proy-grado-001")` devuelve las 22 fases.
- `src/lib/projectTypePhases.ts`: mapeo del servicio nuevo + sus 2 subtipos.
- `src/app/api/projects/generate-phase/route.ts`: `TOKENS_POR_FASE` calibrado para las 22 fases.
- `src/app/projects/new/page.tsx`: wizard con step de elección de subtipo.
- `src/app/dashboard/page.tsx`: card "Proyecto de Grado" en servicios disponibles.

### 14.3 Tests funcionales pasados

| Test | Pasa | Total | Cobertura |
|---|:-:|:-:|---|
| `encuestas.test.ts` | 18 | 18 | Frecuencias, descriptivos, tabla contingencia, chi-cuadrado |
| `flujo.test.ts` | 20 | 20 | Orden de fases, prompts reales, variantes, coherencia IDs |
| `npm run build` | ✓ | — | 82 rutas, sin warnings |

### 14.4 Lo que queda para producción real

- 🟡 **Testing E2E con IA real**: generar 3 proyectos completos (uno por subtipo + 1 caso límite) para validar outputs reales. Requiere API keys y consumo de tokens.
- 🟡 **Conexión Gemini Imagen 4 + Ideogram** en endpoint de Fase 4d (los briefs ya están listos en el prompt).
- 🟡 **Conexión Gemini Grounding** para PESTEL/Porter/Legal con datos reales actualizados.
- 🟡 **Conexión real con simuladorPRO** para inyectar indicadores financieros calculados en Fases 4f y 4g.
- 🔴 **Supabase real** (pendiente macro del proyecto).
- 🔴 **Pricing y quota** mensual por plan.

### 14.5 Decisión registrada: filosofía "sistema completo"

Después de revisión del fundador, los prompts NUNCA piden nada al estudiante.
NO hay placeholders `[COMPLETAR]`. NO hay frases tipo "el estudiante deberá
verificar". El sistema entrega documento ENTREGABLE en todos los casos, con:

- Cifras conservadoras y razonables cuando falta dato puntual.
- Notas metodológicas formales cuando aplica (ej: Fase 3e sin CSV real).
- Citas a fuentes institucionales reales (INE, BCB, SEPREC, SIN, etc.).
- Autores académicos autorizados en una lista cerrada (no se inventan).
