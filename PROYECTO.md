# LABORATORIO ACADÉMICO — Documento Maestro del Proyecto

> Última actualización: Abril 2026  
> Plataforma SaaS de generación de documentos académicos con IA para Bolivia y Latinoamérica.

---

## 1. VISIÓN Y PROPÓSITO

### ¿Qué es?
Laboratorio Académico es una plataforma web que usa Inteligencia Artificial para ayudar a estudiantes universitarios a generar documentos académicos completos (monografías, tesis, ensayos) de forma guiada, sin alucinaciones, con bibliografía APA 7 real y exportación a PDF/LaTeX lista para presentar.

### ¿Por qué existe?
Los estudiantes de diplomados y postgrados en Bolivia pierden semanas o meses redactando monografías. La IA (ChatGPT, etc.) inventa citas, mezcla temas, y no sigue la estructura institucional. Nosotros resolvemos eso con un proceso de 4 etapas validadas, coherencia entre capítulos, y SOLO fuentes de datos reales verificables.

### Principio central
> "La IA redacta. El estudiante aprueba. El documento es real."

---

## 2. ESTADO ACTUAL DEL PROYECTO

### ✅ HECHO (funcionando)

#### Frontend / UI
| Página | Ruta | Estado |
|--------|------|--------|
| Landing page | `/` | ✅ Lista con planes, productos, garantías |
| Login (Google + Demo) | `/login` | ✅ Google OAuth + modo demo |
| Dashboard usuario | `/dashboard` | ✅ Lista proyectos, estados, acciones |
| Generador de monografía | `/monografia` | ✅ Flujo completo 4 etapas |
| Crear nuevo proyecto | `/projects/new` | ✅ Wizard de creación |
| Workspace de proyecto | `/projects/[id]/workspace` | ✅ Editor por fases |
| Tutorial | `/tutorial` | ✅ Guía de uso |
| Términos y Privacidad | `/terminos` `/privacidad` | ✅ Páginas legales |
| Admin dashboard | `/admin` | ✅ KPIs, estadísticas, acciones |
| Admin usuarios | `/admin/usuarios` | ✅ Gestión de usuarios |
| Admin prompts | `/admin/prompts` | ✅ Editor de prompts por etapa |
| Admin modelos IA | `/admin/modelos` | ✅ Configuración de proveedores |
| Admin estadísticas | `/admin/estadisticas` | ✅ Gráficos de uso |
| Admin logs | `/admin/logs` | ✅ Registro de errores |

#### Backend / API
| Endpoint | Función | Estado |
|----------|---------|--------|
| `POST /api/monografias` | Crear monografía | ✅ |
| `GET /api/monografias/[id]` | Obtener monografía completa | ✅ |
| `POST /api/etapas/[0-3]/generar` | Generar etapa con IA | ✅ |
| `POST /api/etapas/[n]/revisar` | Revisar con feedback | ✅ |
| `POST /api/etapas/[n]/chat` | Chat de modificaciones | ✅ |
| `POST /api/etapas/0/tema-directo` | Saltar propuestas, tema propio | ✅ |
| `GET/POST /api/citas` | Gestión de citas APA 7 | ✅ |
| `GET/POST /api/documentos` | Documentos del usuario | ✅ |
| `POST /api/compilar/[id]` | Compilar LaTeX final | ✅ |
| `POST /api/export/latex` | Exportar .tex | ✅ |
| `GET/POST /api/projects` | Gestión de proyectos | ✅ |
| `POST /api/auth/google` | Google OAuth | ✅ |
| `POST /api/auth/demo` | Login demo | ✅ |
| `GET /api/auth/me` | Sesión actual | ✅ |
| `GET /api/admin/estadisticas` | Stats del sistema | ✅ |
| `GET /api/admin/usuarios` | Gestión de usuarios | ✅ |
| `GET /api/admin/logs` | Logs de errores | ✅ |

#### Librerías internas
| Archivo | Función | Estado |
|---------|---------|--------|
| `lib/aiProvider.ts` | Groq → Anthropic → OpenAI (cascada) | ✅ |
| `lib/memoryStore.ts` | Store in-memory (fallback sin Supabase) | ✅ |
| `lib/latexMonografia.ts` | Generador LaTeX completo (markdown → LaTeX) | ✅ |
| `lib/validaciones.ts` | Coherencia, anti-alucinación, APA 7 | ✅ |
| `lib/pdfUtils.ts` | Extracción de texto de PDFs | ✅ |
| `lib/auth.ts` | JWT, Google OAuth, roles | ✅ |
| `lib/ai/guardian.ts` | Guardián anti-alucinación | ✅ |
| `lib/ai/rag-processor.ts` | RAG para documentos del usuario | ✅ |
| `lib/prompts/index.ts` | 4 system prompts maestros | ✅ |

#### Base de datos (Supabase)
| Tabla | Propósito | Estado |
|-------|-----------|--------|
| `universities` | Universidades y formatos | ✅ SQL listo |
| `master_prompts` | Prompts por sección | ✅ SQL listo |
| `monografias` | Proyectos de monografía | ✅ SQL listo |
| `capitulos` | Capítulos por etapa | ✅ SQL listo |
| `citas` | Bibliografía APA 7 | ✅ SQL listo |
| `documentos_usuario` | Archivos del estudiante | ✅ SQL listo |

---

## 3. EL PRODUCTO PRINCIPAL — GENERADOR DE MONOGRAFÍA

### Flujo completo (4 etapas + compilación final)

```
INICIO → Datos del estudiante (diplomado, intereses, contexto)
   ↓
ETAPA 0 → IA genera 3 propuestas de tema viables
            ↓ usuario elige UNA (o ingresa tema propio)
ETAPA 1 → Usuario llena datos del Cap. I
            (antecedentes, literatura, causas, objetivos, justificación)
            ↓ IA genera Capítulo I completo (secciones 1.1 → 1.5)
ETAPA 2 → IA genera Cap. II automáticamente usando Cap. I
            (marco teórico + estudios relacionados)
            ↓ opcionalmente: usuario sube documentos propios
ETAPA 3 → IA genera Caps. III, IV, V + Bibliografía final
            (metodología + resultados + conclusiones)
            ↓ validación de coherencia total
FINAL   → Usuario descarga .tex → sube a Overleaf → PDF listo
```

### Reglas críticas del sistema
1. **Sin alucinación** — Solo citas de la literatura que el usuario proporciona
2. **Datos secundarios** — Solo fuentes públicas (INE, IBCE, BCB, ministerios)
3. **Coherencia** — Cap. II desarrolla las teorías de Cap. I. Cap. IV responde objetivos de Cap. I
4. **APA 7** — Bibliografía generada y validada automáticamente
5. **Etapas separadas** — Cada una es un prompt independiente (máx. 10K tokens)
6. **Aprobación explícita** — El estudiante aprueba cada capítulo antes de continuar

### Estructura del documento generado
```
Carátula (PDF del estudiante o portada automática)
Tabla de Contenidos
Capítulo I: Planteamiento del Problema (1.1 → 1.5)
  1.1. Planteamiento y Formulación
  1.2. Objetivos (general + específicos)
  1.3. Justificación (teórica + práctica + social)
  1.4. Alcances y Delimitación
  1.5. Hipótesis (si aplica)
Capítulo II: Marco Teórico y Referencial
  2.1. Marco Teórico y Conceptual
  2.2. Marco Referencial
  2.3. Marcos adicionales (jurídico, institucional, si aplica)
Capítulo III: Diseño Metodológico
Capítulo IV: Análisis de Resultados
Capítulo V: Conclusiones y Recomendaciones
Referencias Bibliográficas (APA 7, orden alfabético)
```

---

## 4. MODELO DE NEGOCIO

### Planes actuales
| Plan | Precio | Incluye |
|------|--------|---------|
| Estándar | Bs. 150 (pago único) | 1 monografía, IA avanzada, chat ilimitado, PDF + LaTeX, APA 7, soporte |
| Pro | Bs. 300 / mes | 3 documentos/mes, mejor modelo IA, historial de versiones, soporte 24/7 |

### Audiencias
- **Estudiantes** — diplomados, postgrados, licenciaturas en Bolivia
- **Docentes** — planificaciones, rúbricas, material didáctico (pendiente)

### Mercado inicial
Bolivia (La Paz, Cochabamba, Santa Cruz). Expansión futura: Perú, Ecuador, Paraguay.

---

## 5. PENDIENTE / TODO

### Prioridad ALTA (siguiente sprint)

#### Conexión con Supabase real
- [ ] Configurar credenciales reales en `.env.local`
- [ ] Ejecutar `supabase_schema.sql` + `supabase_monografias.sql` en el dashboard
- [ ] Migrar el store in-memory a Supabase para persistencia real
- [ ] Activar RLS (Row Level Security) por usuario

#### Pagos
- [ ] Integrar pasarela de pago boliviana (Tigo Money, QR Bolivia, Stripe)
- [ ] Flujo: Landing → elegir plan → pagar → cuenta activada → generar
- [ ] Webhook de confirmación de pago → activar usuario en Supabase

#### Google OAuth en producción
- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` reales
- [ ] Agregar dominios autorizados en Google (dominio de producción)

#### Despliegue en Vercel
- [ ] Crear cuenta en vercel.com
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno en Vercel (todas las del `.env.local`)
- [ ] Configurar dominio personalizado (ej: laboratorioacademico.bo)

### Prioridad MEDIA

#### Mejoras al generador
- [ ] Vista previa del documento en tiempo real mientras se genera
- [ ] Regenerar sección específica sin perder el resto del capítulo
- [ ] Historial de versiones por capítulo (ver versión anterior)
- [ ] Contador de palabras y páginas estimadas
- [ ] Indicador de progreso dentro de cada capítulo

#### Chat de modificaciones por etapa
- [ ] El estudiante escribe "cambia el objetivo específico 2" y la IA edita solo esa parte
- [ ] Sin perder el resto del capítulo aprobado
- [ ] Historial de conversación por etapa guardado en DB

#### Carátula
- [ ] El estudiante sube su PDF de carátula institucional
- [ ] Se integra automáticamente en el .tex final (ya hay esqueleto en código)

#### Exportación
- [ ] Generar PDF directamente en el servidor (pdflatex o servicio externo)
- [ ] Vista previa HTML del documento antes de exportar
- [ ] Word (.docx) como alternativa al LaTeX para usuarios no técnicos

### Prioridad BAJA (futuro)

#### Módulo Docentes
- [ ] Generador de planificaciones de clase
- [ ] Generador de rúbricas de evaluación
- [ ] Material didáctico
- [ ] Guías de investigación

#### Módulo Tesis de Grado
- [ ] Estructura más extensa que la monografía
- [ ] Hipótesis obligatoria + operacionalización de variables
- [ ] Matriz de consistencia automática
- [ ] Análisis estadístico asistido

#### Módulo Ensayos
- [ ] Argumentativos, analíticos, críticos
- [ ] Más cortos (5-10 páginas)
- [ ] Precio menor

#### Multi-universidad
- [ ] Cada universidad con su formato exacto (márgenes, fuente, portada)
- [ ] Biblioteca de guías de estilo universitarias bolivianas

#### Afiliados / Referidos
- [ ] Código de descuento por referidos
- [ ] Panel de afiliados para tutores y profesores

---

## 6. ARQUITECTURA TÉCNICA

### Stack
| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Google OAuth + JWT (jose) |
| IA principal | Groq (llama-3.3-70b-versatile) |
| IA fallback 1 | Anthropic Claude (claude-haiku-4-5) |
| IA fallback 2 | OpenAI (gpt-4o-mini) |
| Export | LaTeX → Overleaf → PDF |
| Deploy | Vercel (pendiente) |

### Variables de entorno necesarias
```env
# IA (al menos GROQ_API_KEY)
GROQ_API_KEY=...
ANTHROPIC_API_KEY=...        # opcional
OPENAI_API_KEY=...           # opcional

# Base de datos
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_JWT_SECRET=...
ADMIN_PASSWORD=...
```

### Proveedores de IA (orden de prioridad)
```
1. Groq     → rápido, barato, modelo: llama-3.3-70b-versatile
2. Anthropic → mejor calidad, modelo: claude-haiku-4-5
3. OpenAI   → fallback final, modelo: gpt-4o-mini
```

---

## 7. PARA DEPLOYAR EN PRODUCCIÓN (lista de pasos)

### Paso 1: Supabase
1. Ir a supabase.com → crear proyecto
2. Copiar las 3 keys (URL, anon, service role) al `.env.local`
3. Ir a SQL Editor → pegar y ejecutar `supabase_schema.sql`
4. Ir a SQL Editor → pegar y ejecutar `supabase_monografias.sql`

### Paso 2: Google OAuth
1. Ir a console.cloud.google.com → nuevo proyecto
2. APIs y Servicios → Credenciales → OAuth 2.0
3. URI autorizado de redirección: `https://tudominio.com/api/auth/callback/google`
4. Copiar Client ID y Client Secret al `.env.local`

### Paso 3: Vercel
1. Ir a vercel.com → Import Git Repository
2. Conectar repositorio
3. En Settings → Environment Variables → agregar todas las del `.env.local`
4. Deploy → esperar compilación
5. Configurar dominio personalizado

### Paso 4: Pagos (pendiente)
- Integrar pasarela según Bolivia (Stripe o local)

---

## 8. PREGUNTAS FRECUENTES DEL PROYECTO

**¿Cuánto tarda en generar una monografía completa?**
Aproximadamente 10-15 minutos de generación de IA + el tiempo del estudiante llenando formularios (30-60 min en total).

**¿Funciona sin Supabase configurado?**
Sí, en modo desarrollo usa un store in-memory. Los datos se pierden al reiniciar el servidor. Para producción se necesita Supabase.

**¿Qué pasa si la IA falla?**
El sistema intenta Groq → Anthropic → OpenAI en ese orden. Si los tres fallan, muestra error claro al usuario.

**¿Genera PDFs?**
Genera el código LaTeX (.tex). El PDF se obtiene subiéndolo a Overleaf (gratis). En el futuro se compilará directamente en el servidor.

**¿Es para cualquier tema?**
Sí, para cualquier área académica (negocios, derecho, medicina, ingeniería, etc.) siempre que los datos estén disponibles públicamente en Bolivia/Latinoamérica.

---

## 9. CONTACTO Y ACCESOS

| Recurso | URL / Dato |
|---------|-----------|
| App local | http://localhost:3000 |
| Monografía | http://localhost:3000/monografia |
| Admin | http://localhost:3000/admin |
| Admin password | Ver `.env.local → ADMIN_PASSWORD` |
| Demo login | /login → botón "Entrar como estudiante demo" |

---

*Este documento se actualiza cada vez que se agrega una funcionalidad importante al proyecto.*
