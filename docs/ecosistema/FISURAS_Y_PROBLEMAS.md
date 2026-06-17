# FISURAS Y PROBLEMAS DEL PROYECTO
> Análisis honesto basado en revisión de todos los repositorios — 2026-06-17

---

## 🔴 CRÍTICOS — Bloquean el lanzamiento

### F1. Supabase no está conectado en producción
**Qué pasa:** Los datos viven en memoria y en `.store/data.json`. Al reiniciar el servidor, todo se pierde. En producción, Vercel reinicia constantemente.
**Impacto:** El producto NO puede lanzarse así. Cada usuario pierde su trabajo.
**Solución:** Ejecutar `supabase_full_setup.sql` en el proyecto `svaswbryumacbirecvjt`, poner las 3 keys en `.env.local`, correr `node scripts/setup-supabase.mjs`.
**Estimación:** 30 minutos de trabajo.

### F2. No hay deploy en producción
**Qué pasa:** La app solo corre localmente. No hay URL pública.
**Impacto:** Nadie puede usar el producto todavía.
**Solución:** Conectar el repo GitHub a Vercel, configurar variables de entorno, dominio.
**Estimación:** 1 hora.

### F3. Los pagos son 100% manuales
**Qué pasa:** El estudiante paga, pero alguien tiene que ir a `/admin/pagos` y aprobar manualmente. Sin webhook automático.
**Impacto:** No escala. Con 10 estudiantes por día ya es inmanejable.
**Solución:** Integrar webhook de Tigo Money / QR bancario o usar Stripe con conversión a USD.
**Estimación:** 1-2 semanas.

### F4. Google OAuth no tiene credenciales de producción
**Qué pasa:** El login con Google funciona en local pero con credenciales de desarrollo.
**Impacto:** En producción, los estudiantes no pueden iniciar sesión.
**Solución:** Crear proyecto en Google Cloud Console con dominio de producción real.
**Estimación:** 1 hora.

---

## 🟠 IMPORTANTES — Afectan la calidad del producto

### F5. Los cerebros externos NO están conectados
**Qué pasa:** Toda la arquitectura de C3 a C10 (los 8 cerebros especializados) está diseñada, los repositorios existen, los endpoints están definidos... pero WEBAPP los llama con mocks. En la práctica, WEBAPP hace todo el trabajo con sus propios prompts internos en `src/lib/prompts/`.
**Impacto:** La arquitectura es ilusoria hoy. Todo el esfuerzo de los cerebros independientes no aporta valor todavía al producto real.
**Problema de fondo:** Hay una brecha enorme entre la arquitectura diseñada (orquestador + cerebros desacoplados) y la realidad operativa (monolito con prompts internos).
**Pregunta crítica:** ¿Vale la pena desacoplar ahora, o es mejor solidificar el monolito primero y desacoplar después cuando haya usuarios reales?

### F6. Solo 3 universidades tienen guía oficial, el resto es improvisado
**Qué pasa:** UMSS, UCB y UNIFRANZ tienen sus PDFs cargados. Las otras 7+ universidades (UMSA, UAGRM, UTO, etc.) usan solo "conocimiento general" de la IA.
**Impacto:** Un estudiante de la UMSA recibe un documento que puede NO cumplir el formato de su universidad. Riesgo de que se rechace la monografía. Esto destruye la promesa de "documento real".
**Solución:** Conseguir las guías PDF oficiales de cada universidad antes de habilitarlas en producción. Si no hay guía, no ofrecer esa universidad.

### F7. El Proyecto de Grado solo está completo para UCATEC
**Qué pasa:** La estructura de 23 fases del Proyecto de Grado está implementada, pero las variantes específicas por universidad (UMSS, UCB, UNIFRANZ) solo tienen el Cap.1 parcialmente.
**Impacto:** Si un estudiante de la UMSS usa el Proyecto de Grado, el documento no va a seguir la estructura oficial de la UMSS.

### F8. Dos cascadas de IA con orden distinto en distintos archivos
**Qué pasa:** `PROYECTO.md` dice que el orden es `Groq → Anthropic → OpenAI`. `CLAUDE.md` dice `Anthropic → Gemini → OpenAI → Groq`. `INVENTARIO.md` tiene variaciones por plan.
**Impacto:** Confusión sobre cuál es la cascada real. Si una IA lee un documento, puede configurar mal el sistema.
**Solución:** Verificar `src/lib/aiProvider.ts:47` y tener UNA sola fuente de verdad. Los documentos históricos quedaron desactualizados.

### F9. simuladorPRO está en dos lugares a la vez
**Qué pasa:** simuladorPRO existe como repo independiente (en producción en Vercel) Y como módulo migrado dentro de WEBAPP (`/finanzas`). Son dos versiones del mismo producto.
**Impacto:** Mantenimiento duplicado. Una actualización en simuladorPRO no se refleja en WEBAPP automáticamente. El iframe fue bloqueado por `host_not_allowed` de Vercel.
**Pregunta crítica:** ¿Cuál es la fuente de verdad? ¿Se va a mantener el repo externo o solo el integrado en WEBAPP?

### F10. MIE (market-intelligence-engine) tiene datos reales pero WEBAPP no los usa
**Qué pasa:** MIE ya tiene datos del Censo 2024, cálculos TAM/SAM/SOM, análisis de encuestas, etc. Todo funciona. Pero WEBAPP lo genera todo con la IA (inventado), no con los datos reales de MIE.
**Impacto:** Los documentos académicos usan cifras que la IA "estima", no datos reales del INE. Esto contradice la promesa anti-alucinación para la parte de datos de mercado.

---

## 🟡 RIESGOS — No bloquean hoy pero van a escalar

### F11. No hay gestión de versiones de documentos del estudiante
**Qué pasa:** El estudiante puede regenerar un capítulo y perder la versión anterior. El CLAUDE.md menciona que hay una bitácora de cambios (`/api/projects/[id]/bitacora`), pero no está claro si está activa.
**Impacto:** Un estudiante que regenera accidentalmente pierde trabajo previo.

### F12. No hay precio diferenciado por tipo de documento
**Qué pasa:** El INVENTARIO.md tiene 3 planes con precios diferenciados (mono vs proyecto de grado). El PROYECTO.md solo menciona 2 planes sin esa diferencia. Inconsistencia.
**Impacto:** Cuando se implemente la pasarela de pago, ¿cuál precio se cobra?

### F13. La deuda técnica de lint va a explotar al escalar
**Qué pasa:** `npm run lint` falla. Hay 10 errores de React 19, BUGs documentados no resueltos (001, 006, 007, 008). Esto no es bloqueante hoy pero cada feature nueva toca código con deuda.

### F14. Falta monitoreo de la cascada de IA en producción
**Qué pasa:** El sistema de fallback funciona en código, pero no hay alertas reales cuando un proveedor falla. El admin tiene que ir a revisar manualmente.
**Impacto:** Si Anthropic cae y Gemini también, la app falla silenciosamente para el usuario sin que nadie sea alertado.

### F15. No hay definición clara de "qué hace el modo guiado vs automático" para el usuario
**Qué pasa:** Los documentos internos tienen claridad sobre los dos caminos. Pero en la UI del producto, ¿cómo se le explica al estudiante boliviano (poco técnico) la diferencia? ¿Cuándo conviene uno vs el otro?
**Impacto:** Si el estudiante no entiende qué modo elegir, puede usar el automático (datos inventados) cuando debería usar el conectado (datos reales) para su defensa.

---

## 🔵 ESTRUCTURALES — Preguntas sobre la visión

### F16. ¿Los cerebros son la estrategia correcta ahora?
**Situación:** 10 repos de cerebros independientes (Python + FastAPI) existen, están bien diseñados, tienen tests y documentación. Pero ninguno está conectado a WEBAPP en producción.
**El problema:** Mantener 10 repos separados tiene un costo operativo enorme (10 servidores, 10 deploys, 10 actualizaciones, 10 puntos de falla). Para un equipo de 1 persona, esto es insostenible en producción.
**Pregunta:** ¿No sería más inteligente consolidar la lógica crítica en WEBAPP (que ya lo hace internamente con prompts) y tratar los cerebros como una etapa futura post-tracción?

### F17. ¿El contrato (C0) es prematuro?
**Situación:** C0 define un contrato sofisticado (BrainRequest, BrainResponse, ProjectEnvelope con traza, evidencia, suposiciones, handoff). Es excelente ingeniería para una empresa con múltiples equipos.
**El problema:** Hoy WEBAPP no llama a ningún cerebro con ese contrato. El contrato existe en el papel pero no en la práctica.
**Riesgo:** Invertir tiempo en hacer que los cerebros cumplan el contrato antes de tener usuarios reales es un caso clásico de over-engineering prematuro.

### F18. La promesa anti-alucinación tiene una grieta grande
**Situación:** El sistema es muy bueno en no inventar citas bibliográficas. Pero los datos cuantitativos del documento (tamaño de mercado, estadísticas, tendencias) los genera la IA sin fuente real, a menos que el estudiante suba sus propios documentos.
**El problema:** La promesa es "documento real". Pero un porcentaje alto de los datos numéricos son generados por la IA, no provenientes del INE, BCB, o fuentes oficiales.
**Solución a mediano plazo:** Conectar MIE para que los datos de mercado vengan del Censo 2024, no de la IA.

---

## ✅ LO QUE SÍ FUNCIONA BIEN

Para equilibrar el análisis:

- El flujo de generación de monografías es sólido y completo (6 fases, guardrails, APA 7).
- Los 7 módulos educativos están completos (academia + laboratorio + herramientas).
- La cascada de IA con fallback automático es robusta.
- El sistema de prompts está bien organizado y protegido.
- El admin panel es completo y funcional.
- simuladorPRO (finanzas) es el componente más maduro: en producción, con tests, con datos reales de eventos económicos bolivianos.
- La arquitectura de Proyecto Maestro + Generador Conectado es una idea diferenciadora real.
- La regla de español neutro boliviano (no voseo) está bien documentada y blindada.
- El diseño de los contratos de los cerebros es de buena ingeniería y va a ser valioso cuando haya tracción.

---

## 📋 ORDEN DE PRIORIDADES RECOMENDADO

**Para lanzar (hacer esto primero):**
1. Conectar Supabase real (F1) — 30 min
2. Google OAuth en producción (F4) — 1 hora
3. Deploy en Vercel (F2) — 1 hora
4. Deshabilitar universidades sin guía PDF (F6) — 1 hora de configuración

**Para que el negocio funcione:**
5. Webhook de pago automático (F3) — prioridad alta
6. Resolver inconsistencia de cascada de IA en documentos (F8) — 30 min de verificación
7. Decidir qué pasa con simuladorPRO (F9) — decisión de producto

**Para cumplir la promesa del producto:**
8. Conectar MIE para datos reales de mercado (F10)
9. Completar Proyecto de Grado para UMSS, UCB, UNIFRANZ (F7)

**Para después de tener usuarios:**
10. Desacoplar cerebros reales (F5, F16, F17) — cuando haya escala suficiente para justificarlo
