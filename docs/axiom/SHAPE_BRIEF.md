# Axiom — Design Shape Brief

## 1. Feature Summary
Axiom es un simulador integrado de exámenes de ingreso UMSS + base de exámenes resueltos + dashboard de progreso. Permite a estudiantes pre-universitarios bolivianos practicar, ver resultados en tiempo real, acceder a resoluciones paso a paso, y recibir planes personalizados de mejora. Objetivo: preparación académica y mental para el examen de ingreso.

## 2. Primary User Action
**Ver su nota después de simular → Entender dónde falló → Revisión de respuestas con resoluciones paso a paso.**

Secundario: Explorar base de exámenes históricos, seguir plan personalizado, verificar progreso.

## 3. Design Direction

### Color Strategy
**Committed** — Violeta 30-60% de la superficie.
- Rationale: Axiom es educación de alto stakes (nerviosismo previo). Violeta comunica energía + confianza sin perder rigor académico.
- Uso: Ranking (hero), botones primarios, badges de progreso, números de nota, cards de exámenes destacadas.
- Apoyo: Success (verde) para respuestas correctas, Error (rojo) para incorrectas, Neutrals para estructura.

### Theme Scene Sentence
**Estudiante en bibliotecaantes de examen, ansioso; otro en casa tarde, explorando resultados — ambos necesitan claridad inmediata y motivación sin fricciones.**

→ **Light mode primary** (natural para ambos contextos). Contraste alto (WCAG AA). Responsive mobile-first (muchos usan teléfono). Sin distracciones visuales (el contenido es lo importante).

### Anchor References
- **Duolingo** — Motivación visual, progress loops clara, feedback inmediato sin ser condescendiente
- **Khan Academy** — Rigor académico, resoluciones paso a paso claras, tono educativo
- **Codeforces** — Competitive ranking sin ser tóxico, leaderboards que motivan

## 4. Scope (Task-Scoped)
- **Fidelity:** High-fi / Production-ready
- **Breadth:** 5 pantallas clave (Landing, Base exámenes, Durante simulador, Resultados, Dashboard progreso)
- **Interactivity:** Static mockups (visual reference para código). Comportamientos documentados (hover, focus, states).
- **Time Intent:** Listo para desarrollo inmediato

## 5. Layout Strategy

### Landing / Hub (`/axiom`)
- **Jerarquía:** Ranking hero (top, grandes números, violeta dominante) → Opciones secundarias (4 tarjetas: Examenes, Simulador, Progreso, Plan)
- **Rhythm:** Espaciado 32px entre secciones. No cards anidadas.
- **Mobile:** Ranking en horizontal scroll si es muy largo; opciones en stack vertical.

### Base de Exámenes (`/axiom/examenes`)
- **Jerarquía:** Título + filtros (área, dificultad) → Lista de exámenes en grid (mobile: stack)
- **Contenido:** Examen | Área | Dificultad | "Ver resolución" / "Pago"
- **States:** Empty (sin exámenes), Loading (spinner), List (normal)

### Durante Simulador (`/axiom/simulador/[id]`)
- **Jerarquía:** Contador atrás (GRANDE, violeta) → Pregunta (legible, max 75ch) → Opciones (A-D, no distractores visuales)
- **Rhythm:** Pregunta en center, opciones en 2x2 grid (desktop) o stack (mobile)
- **Meta:** Número pregunta, progreso visual (barra)

### Resultados (`/axiom/simulador/[id]/resultados`)
- **Jerarquía:** NOTA GRANDE (0-100, violeta, tamaño H1) → Desglose por área (3 números) → Botones (Revisar respuestas, Plan, Siguiente)
- **Motivación:** Si nota ≥80: "¡Excelente! Mejoraste..." (verde). Si <80: "Mejora en X" (neutro, no punitivo)
- **Card de revisión:** Pregunta | Tu respuesta | Respuesta correcta | Feedback IA | Resolución expandible

### Dashboard Progreso (`/axiom/progreso`)
- **Jerarquía:** Mis simulaciones (historial tabla) → Gráfico de mejora (línea) → Ranking (si publiqué)
- **Content:** Fecha | Nota | Desglose | Ver detalles
- **Empty state:** "Aún sin simulaciones. ¡Crea la primera!"

## 6. Key States

| Feature | State | Visual Need |
|---------|-------|-------------|
| Ranking | Default (users con notas) | Tabla/Cards con nombre, nota, posición. Highlight color. |
| Ranking | Empty (nadie publicicó aún) | Placeholder: "Sé el primero en publicar tu nota" |
| Simulador | Activo (preguntas siendo respondidas) | Contador atrás visible, pregunta clara, opciones clickeables |
| Simulador | Último (al final del examen) | "Revisar respuestas" botón prominente |
| Resultados | Buena nota (≥80) | Fondo verde suave, copy motivador |
| Resultados | Nota media (60-79) | Neutral, feedback "Mejora en X areas" |
| Resultados | Nota baja (<60) | Neutral (no punitivo), copy: "Siguiente intento mejor preparado" |
| Base exámenes | Sin acceso (gratis, cuota agotada) | Botón "Comprar acceso" visible sobre contenido |
| Base exámenes | Con acceso | Resolución visible, descargable con watermark |
| Dashboard | Sin datos | Empty state motivador |
| Dashboard | Con datos | Gráfico visible, tabla de historial, ranking badge |

## 7. Interaction Model

### Navigation Flow
1. **Estudiante llega a `/axiom`** → Ve ranking + 4 opciones
2. **Presiona "Simulador"** → Va a `/axiom/simulador` (crear nueva o reanudar)
3. **Inicia simulador** → Entra a `/axiom/simulador/[id]` (pantalla de examen)
4. **Resuelve + envía** → Va a `/axiom/simulador/[id]/resultados` (nota + desglose)
5. **Presiona "Revisar"** → Muestra modal/inline cada pregunta con feedback
6. **Presiona "Plan"** → Descarga PDF con watermark Axiom
7. **Dashboard**: Historial de simulaciones, gráfico, ranking

### Interactive Details
- **Onclick opciones respuesta:** Highlight inmediato, visual feedback
- **Contador atrás:** Se pone rojo en últimos 5 min (sin alarma sonora)
- **Hover botones:** Cambio color + scale 1.02 (suave, no agresivo)
- **Revisión pregunta:** Expand/collapse (no modal, inline)
- **Descarga plan:** PDF con logo, link, QR WhatsApp

## 8. Content Requirements

### Microcopy Clave
- Landing: "Prepárate como si ya estuvieras" (subtitle)
- Ranking: "Top Simuladores" (no "Best", motivador)
- Resultados buena nota: "¡Excelente! Mejoraste en..." (nunca "ganaste")
- Resultados nota baja: "Siguiente intento mejor preparado. Plan personalizado listo."
- Plan PDF: "Hecho en Axiom — Acceder a más planes en axiom.edu.bo" (watermark)

### Dynamic Content Ranges
- Nombre usuario: 2-30 caracteres (posibles truncación en mobile)
- Nota: 0-100 (siempre 2 dígitos: "05", "82", "100")
- Desglose: 3 áreas, cada una 0-100%
- Ranking: 0-1000+ (scroll horizontal si es grande)
- Historial simulaciones: 0-50+ (paginated o virtualized)

### Empty States
- Sin simulaciones: "Crea tu primer simulador. Practica ahora."
- Sin ranking (nadie publicó): "Sé el primero. Publica tu nota después de tu próxima simulación."
- Sin base exámenes (gratis sin acceso): "Compra acceso para ver todas las resoluciones."

## 9. Recommended References
- **layout.md** — Spacing rhythm, grid, responsive breakpoints
- **motion.md** — Contador atrás (ease-out-quart), transiciones hover
- **clarify.md** — Microcopy, error messages, motivational tone
- **adapt.md** — Mobile-first responsive (contador grande, opciones stack)
- **harden.md** — Error states, loading, edge cases (QR generation, PDF download fallback)

## 10. Open Questions
1. ¿Plan personalizado se descarga como PDF o se muestra en pantalla con opción de print?
   → **Respuesta esperada:** PDF con watermark Axiom
2. ¿El ranking incluye foto de usuario o solo nombre?
   → **TBD con usuario**
3. ¿Cuántas simulaciones puede hacer un estudiante en un día (si hay límite)?
   → **TBD**
4. ¿Dark mode es future, o no aplica?
   → **Respuesta esperada:** Future (solo light mode ahora)

---

## Confirmation Needed
**¿Este brief alinea con tu visión de Axiom? ¿Cambios antes de pasar a código?**
