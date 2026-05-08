# Axiom — Design Tokens

## Color Palette

### Primary
- Violeta (Primary): `rgb(139, 92, 246)` / `#8B5CF6` (OKLCH: 60% 0.15 289°)
- Violeta claro: `rgb(167, 139, 250)` (OKLCH: 70% 0.12 289°)
- Violeta oscuro: `rgb(109, 40, 217)` (OKLCH: 45% 0.20 289°)

### Semantic
- Success (Verde): `#10b981` — Respuesta correcta, nota buena
- Error (Rojo): `#ef4444` — Respuesta incorrecta, alerta
- Neutral (Gris): `#6b7280` — Texto secundario, bordes
- Fondo: `#ffffff` (light mode) o `#0f172a` (dark, si lo usamos)

### Text
- Foreground primary: `#1f2937` (casi negro, no `#000`)
- Foreground muted: `#6b7280` (gris)
- Foreground secondary: `#4b5563`

### Borders
- Default: `rgba(139, 92, 246, 0.15)`
- Hover: `rgba(139, 92, 246, 0.25)`

## Typography

### Font Stack
- Heading: `Inter` (700, 800 weight) — limpio, moderno
- Body: `Inter` (400, 500) — legible, profesional
- Mono: `Fira Code` — código, ecuaciones matemáticas

### Scale
- H1: 32px / 1.4
- H2: 24px / 1.3
- H3: 18px / 1.25
- Body: 16px / 1.5 (max 65-75ch ancho)
- Small: 14px / 1.4
- Micro: 12px / 1.3

### Weights
- Bold headings: 700–800
- Regular body: 400
- Emphasis: 600

## Spacing
- Base: 8px grid
- Padding cards: 24px (3×8)
- Gap between sections: 32px (4×8)
- Mobile padding: 16px

## Components

### Buttons
- Primary (Violeta): bg=violeta, fg=white, radius=8px, padding=12px 20px
- Secondary (Outline): border=1px violeta, fg=violeta, bg=transparent
- Size: regular=12px 20px, small=8px 16px

### Cards
- Radius: 8px
- Border: 1px rgba(139,92,246,0.15)
- Padding: 24px
- Shadow: light (no dropshadow fuerte)
- No nested cards

### Input Fields
- Radius: 6px
- Border: 1px #d1d5db
- Padding: 10px 12px
- Focus: border-color violeta, ring=2px rgba(139,92,246,0.1)

### Badges/Pills
- Bg: rgba(139,92,246,0.1)
- Fg: violeta
- Radius: 20px (full rounded)
- Padding: 4px 12px

## Motion
- Transition: 200ms ease-out-quart
- No animations on layout properties
- Hover: color change, slight scale (1.02)
- No bounce / elastic

## Theme
Light mode (primary). Dark mode optional future.
- Reason: Estudiantes estudian durante el día, luz natural. Examen es en horario diurno.

## Responsive
- Mobile-first
- Breakpoints: sm=640px, md=768px, lg=1024px
- No scrolling horizontal en móvil

## Accessibility
- Contrast: 4.5:1 (WCAG AA)
- Focus visible: 2px ring
- Alt text en todas las imágenes
- Lectores de pantalla: landmarks HTML5, roles ARIA
