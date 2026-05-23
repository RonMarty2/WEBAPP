# Sistema Proyecto de Grado — Guía Operativa

Este documento describe cómo funciona el motor de Proyecto de Grado del
SaaS, qué genera cada fase, y cómo activarlo en producción.

---

## 1. ¿Qué genera el sistema?

Un Proyecto de Grado UCATEC completo: ~80-120 páginas LaTeX, listo para
defensa ante tribunal. El motor sigue la estructura oficial UCATEC:

```
Preparación              Idea de negocio (interna, no va al documento)
Cap. I — Marco Referencial   (8 secciones: antecedentes, problema, objetivos…)
Cap. II — Marco Teórico      (25-35 conceptos con citas APA reales)
Cap. III — Marco Situacional (6 subetapas: PESTEL, Porter, Matrices, Encuesta…)
Cap. IV — Marco Propositivo  (8 subetapas: Org, RRHH, Legal, Técnico…)
Cierre                       (Resumen, Conclusiones, Bibliografía, Defensa, LaTeX)
```

Total: **22 fases** generadas por la IA, persistidas en la base de datos,
exportables a LaTeX/PDF con formato UCATEC oficial.

---

## 2. Fases en detalle

| # | Fase | Prompt | Output esperado |
|---|------|--------|------------------|
| 0 | Idea de negocio | `cap0-idea-negocio.ts` | Síntesis + segmento + 3 títulos + validación viabilidad + próximos pasos. 800-1500 palabras. NO va al documento final. |
| 1 | Marco Referencial | `cap1-marco-referencial.ts` | 1.1 Antecedentes / 1.2 Objeto / 1.3 Problema (con árbol TikZ) / 1.4 Objetivos / 1.5 Justificación / 1.6 Alcance / 1.7 Metodología / 1.8 Muestreo (con fórmula LaTeX). 2000-3000 palabras. |
| 2 | Marco Teórico | `cap2-marco-teorico.ts` | 25-35 conceptos clave con definición + cita APA. Variante por subtipo (Producción / Servicios). 1500-2000 palabras. |
| 3a | PESTEL | `cap3a-pestel.ts` | 6 factores (Político, Económico, Social, Tecnológico, Ecológico, Legal) con tabla cualitativa cada uno. Síntesis. |
| 3b | Porter | `cap3b-porter.ts` | 5 fuerzas analizadas + síntesis de atractivo del mercado. |
| 3c | Matrices | `cap3c-matrices.ts` | FODA + EFE + EFI + MPC (con competidores). |
| 3d | Diseño Encuesta | `cap3d-diseno-encuesta.ts` | Definición segmento + cálculo muestra (fórmula LaTeX) + tipo muestreo + cuestionario completo (15-20 preguntas). |
| 3e | Análisis Encuesta | `cap3e-analisis-encuesta.ts` | 2 modos: CON_DATA_REAL (procesa CSV/Excel del estudiante) o PROYECCION (genera datos plausibles con disclaimer visible obligatorio). |
| 3f | Demanda y Cuota | `cap3f-demanda-cuota.ts` | Demanda potencial + demanda real + cuota proyectada a 5 años. |
| 4a | Organizacional | `cap4a-organizacional.ts` | Razón social + misión/visión/valores + organigrama TikZ + manual de funciones. |
| 4a-bis | RRHH | `cap4abis-rrhh.ts` | Plantilla proyectada + estructura salarial + procesos selección/capacitación/evaluación. |
| 4b | Legal | `cap4b-legal.ts` | Tipo societario + trámites constitución + régimen tributario + cumplimiento sectorial. |
| 4c | Técnico | `cap4c-tecnico.ts` | Localización + capacidad operativa + flujograma TikZ + equipamiento. |
| 4d | Branding | `cap4d-branding.ts` | Identidad de marca + manual + briefs para logotipos (3 conceptos). |
| 4e | Marketing | `cap4e-marketing.ts` | Mix 7P + presupuesto promocional 5 años. |
| 4f | Financiero | `cap4f-financiero.ts` | Inversión inicial + financiamiento + proyección ingresos/costos + flujo de caja + punto de equilibrio (fórmulas LaTeX). |
| 4g | Evaluación | `cap4g-evaluacion.ts` | WACC + VAN + TIR + Payback + **análisis de sensibilidad obligatorio** + recomendación final. |
| 5a | Resumen ejecutivo | `resumen-ejecutivo.ts` | 300-500 palabras de cierre. |
| 5b | Conclusiones | `conclusiones.ts` | Una conclusión por objetivo específico + conclusión general + recomendaciones. |
| 5c | Bibliografía | `referencias.ts` | APA 7 alfabético. Whitelist estricto de ~25 autores académicos + fuentes institucionales bolivianas. |
| 5d | Defensa | `defensa.ts` | Banco de 15-20 preguntas tipo tribunal con respuestas guía. |
| 5e | LaTeX final | `latex.ts` | Compilación del documento completo con preámbulo UCATEC (Times NR 12, interlineado 1.5, márgenes 3+2.5cm, capítulos romanos). |

---

## 3. Cómo se ve un output real (ejemplo Cap. 0)

Para una idea de "hub digital agrícola que conecta productores con
consumidores en Cochabamba", el sistema genera:

> ## Síntesis de la idea de negocio
>
> El estudiante propone el desarrollo de una **plataforma digital de
> comercialización agroalimentaria directa** que conecte a productores
> agrícolas del Valle de Cochabamba con consumidores finales del área
> metropolitana, reduciendo o eliminando la dependencia del intermediario
> tradicional —comúnmente denominado *rescatista* en el contexto
> boliviano—…
>
> ## Segmento objetivo inicial
>
> El proyecto opera con un **modelo de plataforma bilateral**…
>
> ## Tres propuestas de título académico
>
> 1. ⭐ RECOMENDADO — *Proyecto de factibilidad para la creación de…*
>
> ## Validación de viabilidad académica
>
> | # | Criterio | Estado |
> |---|---|:---:|
> | 1 | Datos secundarios PESTEL | ✅ |
> | 2 | Competidores identificables | ⚠️ |
> | 3 | Factibilidad encuesta | ✅ |
> | 4 | Costos razonables | ⚠️ |
> | 5 | Marco teórico | ✅ |
> | 6 | Limitaciones legales | ✅ |
>
> ## Próximos pasos sugeridos
>
> 1. Visitar mercados mayoristas durante 2 jornadas matutinas…
> 2. Conversar con 3-5 productores reales…
> 3. Definir el MVP a evaluar financieramente…

Cada fase tiene su estructura propia, todas con el mismo nivel de detalle.

---

## 4. Activación del motor real en producción

El sistema funciona en 2 modos según las variables de entorno de Vercel:

### Modo NORMAL (con API key configurada)

Cuando **al menos una** de estas variables está configurada en Vercel:

```
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

El sistema usa la cascada: **Groq → Anthropic → OpenAI**. Si Groq cae,
prueba Anthropic. Si Anthropic cae, prueba OpenAI. El estudiante nunca
ve el error.

**Configuración recomendada para arrancar barato:**
- Solo `GROQ_API_KEY` (más rápido y barato).
- Agregar `ANTHROPIC_API_KEY` como respaldo cuando crezca el volumen.

### Modo MOCK (solo para pruebas de flujo)

Solo se activa si **explícitamente** se setea:

```
MOCK_AI=true
```

Devuelve respuestas predefinidas representativas por fase con un banner
"MODO DEMOSTRACIÓN" visible al estudiante. Útil para probar el flujo
técnico sin gastar tokens. **NO se activa automáticamente** — hay que
ponerlo a propósito.

---

## 5. Cómo configurar las API keys en Vercel

1. Entrar a **vercel.com** → tu proyecto WEBAPP
2. **Settings** → **Environment Variables**
3. Agregar variable:
   - Name: `GROQ_API_KEY`
   - Value: la key que generaste en https://console.groq.com/keys
   - Environment: Production + Preview + Development
4. **Save**
5. Ir a **Deployments** → el último deploy → menú `⋯` → **Redeploy**
6. Esperar ~2 min y probar el botón "Generar" en el workspace

---

## 6. Universidades soportadas

El sistema tiene preámbulos LaTeX para 4 universidades:

| Universidad | Preámbulo | Formato |
|---|---|---|
| UMSS — Cochabamba | `preamble-umss.ts` | Times NR 12, doble espacio, márgenes 2.54cm, números top-right |
| UCB — San Pablo | `preamble-ucb.ts` | Times NR 12, 1.5, márgenes 3.5/3cm, tribunal + abstract |
| UNIFRANZ — Cochabamba | `preamble-unifranz.ts` | Verdana 11, 1.5, márgenes 3.5/2.5cm, tapa plomo+dorado |
| **UCATEC — Cochabamba** | `preamble-ucatec.ts` | Times NR 12, 1.5, márgenes 3/2.5cm, capítulos romanos I-IV |

El sistema detecta la universidad del proyecto en `universidad_id` y
elige el preámbulo correcto automáticamente.

---

## 7. Garantías de calidad académica integradas

| Garantía | Implementación |
|---|---|
| **Sin alucinación de autores** | `referencias.ts` con whitelist explícito de ~25 autores académicos verificados. La IA NO puede inventar autores fuera de esa lista. |
| **Tono académico boliviano** | `reglas-comunes.ts` prohíbe voseo, muletillas IA, frases tipo "es importante destacar que…". |
| **Citas APA 7 estrictas** | Cada cifra debe estar citada. Fuentes institucionales reales (INE, BCB, SEPREC, FUNDEMPRESA). |
| **Diagramas reales en PDF** | Árbol de problemas, organigrama y flujograma se emiten como bloques TikZ que se renderizan vectorialmente en el LaTeX final. |
| **Fórmulas tipográficas** | Muestreo, VAN, TIR, punto de equilibrio se emiten con `\begin{equation}` en bloques LaTeX. |
| **Análisis de sensibilidad obligatorio** | Si el VAN del escenario base es negativo, `cap4g-evaluacion.ts` exige proponer al menos 3 escenarios alternativos + 1 combinación recalibrada. |
| **Honestidad metodológica** | Si `cap3e` opera en modo PROYECCIÓN (sin CSV real del estudiante), inserta un disclaimer visible obligatorio para no confundir datos sintéticos con encuesta primaria. |

---

## 8. Flujo del estudiante en el workspace

```
1. Dashboard → Click en tarjeta "Proyecto de Grado"
2. Wizard:
   - Paso 1 — Universidad (UCATEC, UMSS, UCB, etc.)
   - Paso 2 — Datos (nivel, carrera, módulos opcional, intereses, docs)
   - Paso 3 — Producción o Servicios (al final, ya con la idea clara)
3. Workspace dedicado /projects/[id]/workspace-pg
   - Sidebar con 4 capítulos UCATEC + preparación + cierre
   - Panel central: fase actual + botón "Generar"
4. Para cada fase:
   - Click "Generar"
   - IA produce el contenido en 5-30 segundos
   - Estudiante revisa, edita inline si quiere
   - Click "Aprobar y pasar a siguiente"
5. Al terminar las 22 fases:
   - Click "Exportar LaTeX" → ZIP listo para Overleaf
   - O "Exportar PDF" → documento compilado
```

---

## 9. Estado actual del proyecto (resumen)

- ✅ Wizard de creación funcionando
- ✅ Workspace dedicado PG separado de Monografía
- ✅ Sidebar con nomenclatura UCATEC oficial
- ✅ 22 prompts del motor afinados y validados
- ✅ Preámbulo LaTeX UCATEC creado
- ✅ Modo MOCK opcional para validar flujo sin tokens
- ✅ Cascada IA Groq → Anthropic → OpenAI
- ⏳ Pendiente: configurar API keys en Vercel
- ⏳ Pendiente (épica): generador de visuales Cap. IV (logos, mockups, gráficos financieros vectoriales)
- ⏳ Pendiente: endpoint upload CSV/Excel encuesta primaria
- ⏳ Pendiente: cablear Gemini Grounding para datos PESTEL en tiempo real

---

## 10. Próximos pasos recomendados

1. **Configurar GROQ_API_KEY en Vercel** (~5 min, gratis hasta cierto
   volumen). El motor empezará a generar contenido real.
2. **Probar generación end-to-end con un proyecto piloto real** (no
   demo). Ajustar prompts si aparecen huecos en la práctica.
3. **Implementar épica de visuales Cap. IV** (organigrama SVG,
   gráficos financieros, mockups marketing). Esto diferencia el producto
   frente a generadores de texto puro.
4. **Cablear pasarela de pagos** (Tigo Money / QR Bolivia) para
   monetización real del SaaS.
