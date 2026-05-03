---
name: laboratorio-academico-pro
description: Skill personalizada para el desarrollo del SaaS "Laboratorio Académico PRO". Contiene reglas específicas del proyecto, errores conocidos, patrones aprobados y estado actual del desarrollo. Se actualiza automáticamente con cada sprint.
---

# Laboratorio Académico PRO — Skill de Desarrollo

## Cuándo usar esta skill
Siempre que trabajes en este proyecto. Contiene el conocimiento acumulado de decisiones técnicas, errores resueltos y patrones establecidos.

---

## Reglas de Seguridad — NUNCA ROMPER

### Protección de Prompts Maestros
```typescript
// ✅ CORRECTO — solo en API routes (servidor)
import { SISTEMA_ETAPA_0, buildUserEtapa0 } from '@/lib/prompts'

// ❌ INCORRECTO — nunca en componentes cliente
'use client'
import { SISTEMA_ETAPA_0 } from '@/lib/prompts' // ← PROHIBIDO
```

### API Routes — Validación obligatoria
```typescript
// ✅ Siempre validar antes de llamar a Groq
export async function POST(req: Request) {
  const body = await req.json()
  if (!body.campo_requerido) {
    return Response.json({ error: 'Campo requerido' }, { status: 400 })
  }
  // recién aquí llamar a Groq
}
```

### Variables de entorno
- `GROQ_API_KEY` — nunca exponer al cliente
- `SUPABASE_SERVICE_ROLE_KEY` — nunca usar con `NEXT_PUBLIC_` prefix
- Solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` van al cliente

---

## Patrones Aprobados en Este Proyecto

### Llamada a IA (cascada de fallback)
```typescript
// Usar siempre lib/aiProvider.ts — ya tiene la cascada Groq → Anthropic → OpenAI
import { callAI } from '@/lib/aiProvider'

const respuesta = await callAI({
  system: SISTEMA_ETAPA_0,
  user: buildUserEtapa0(datos),
  maxTokens: 4000
})
```

### Manejo de datos sin Supabase (desarrollo)
```typescript
// lib/memoryStore.ts existe como fallback
// En producción, migrar a Supabase directo
import { getStore } from '@/lib/memoryStore'
```

### Estructura de respuesta de API
```typescript
// Éxito
return Response.json({ data: resultado }, { status: 200 })

// Error del cliente
return Response.json({ error: 'Descripción clara' }, { status: 400 })

// Error del servidor
return Response.json({ error: 'Error interno' }, { status: 500 })
```

### Generación de LaTeX
```typescript
// lib/latexMonografia.ts maneja la conversión markdown → LaTeX
import { generarLatex } from '@/lib/latexMonografia'
// Genera el .tex completo con todos los capítulos
```

---

## Estado Actual del Desarrollo

### ✅ Completado y funcionando
- Landing page con planes de precios
- Login (Google OAuth demo + modo demo)
- Dashboard de usuario con proyectos
- Flujo de 6+ fases dinámicas (configurables desde admin)
- Export a LaTeX + compilación
- Panel de administración completo (KPIs, usuarios, prompts, modelos, logs)
- Sistema de citas APA 7
- RAG para documentos del usuario
- Guardián anti-alucinación

### 🔄 En progreso / Próximo sprint
- **PRIORIDAD 1:** Conectar Supabase real (credenciales + schema + RLS)
- **PRIORIDAD 2:** Sistema de pagos (Tigo Money / QR Bolivia / Stripe)
- **PRIORIDAD 3:** Google OAuth con dominio de producción
- **PRIORIDAD 4:** Deploy en Vercel

### 📋 Backlog
- Vista previa del documento en tiempo real
- Regenerar sección específica sin perder capítulo
- Historial de versiones por capítulo
- Export a Word (.docx)
- Módulo Docentes (planificaciones, rúbricas)
- Módulo Tesis de Grado
- Sistema de afiliados/referidos

---

## Errores Conocidos y Soluciones

*(Esta sección se actualiza con cada bug resuelto)*

| Error | Causa | Solución |
|-------|-------|---------|
| — | — | Se irán documentando aquí |

---

## Decisiones de Arquitectura Tomadas

| Decisión | Razón | Fecha |
|----------|-------|-------|
| Cascada Groq → Anthropic → OpenAI | Groq es más rápido/barato, fallbacks para disponibilidad | Apr 2026 |
| LaTeX en vez de PDF directo | Overleaf gratis es más confiable que pdflatex en servidor | Apr 2026 |
| In-memory store como fallback | Permite desarrollar sin Supabase configurado | Apr 2026 |
| Fases dinámicas (actualmente 6: 0-5) configurables por servicio | Evita context overflow, mantiene coherencia entre capítulos | Apr 2026 |
| APA 7 obligatorio con validación | Principal queja de usuarios con ChatGPT es citas inventadas | Apr 2026 |

---

## Cómo Actualizar Esta Skill

Antigravity actualiza este archivo automáticamente cuando:
- Se agrega una nueva etapa o funcionalidad
- Se resuelve un bug relevante
- Se toma una decisión de arquitectura
- Se conecta un nuevo servicio externo
- Cambia algún patrón de código aprobado

El desarrollador no necesita editar este archivo manualmente.

---

## Contexto de Negocio para Decisiones Técnicas

- **Usuarios:** Estudiantes bolivianos de diplomados/postgrados, poco técnicos
- **Precio:** Bs. 150 pago único — el sistema debe ser simple y confiable
- **Diferenciador:** Sin alucinaciones, APA 7 real, coherencia entre capítulos
- **Restricción de datos:** Solo fuentes públicas Bolivia (INE, IBCE, BCB, UDAPE, ministerios)
- **Idioma:** Todo en español, formato académico boliviano
