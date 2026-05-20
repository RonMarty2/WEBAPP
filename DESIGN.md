# Design

Sistema de diseño del Laboratorio Académico PRO. Producto académico sobrio,
serio y legible. Sin glassmorphism decorativo, sin emojis decorativos,
sin gradientes en texto.

## Register
product

## Foundation

### Color (Light, default)

```css
--bg-base:        #f2f2f0   /* fondo página */
--bg-subtle:      #e8e8e6   /* fondos secundarios */
--bg-card:        #fafafa   /* tarjetas */
--fg-primary:     #1E1B4B   /* texto principal */
--fg-secondary:   #312E81   /* texto secundario */
--fg-muted:       #4F46E5   /* texto desaturado */
--border:         #9e9e9a   /* bordes base */
--border-hover:   #7a7a76   /* bordes en hover */
--accent:         #6366F1   /* índigo — color de marca */
--accent-hover:   #4F46E5
--green:          #10B981   /* éxito */
```

### Color (Dark)

```css
--bg-base:        #0B0F19
--bg-subtle:      #111827
--bg-card:        #1E293B
--fg-primary:     #ffffff
--fg-secondary:   #cbd5e1
--fg-muted:       #94a3b8
--border:         #334155
--accent:         #6366f1
```

Reglas:
- Nunca usar `#000` o `#fff` literal en estilos inline. Tintar siempre hacia
  el índigo de marca usando los tokens.
- Estados de error: `#b91c1c` sobre `rgba(239,68,68,0.08)` con borde
  `rgba(239,68,68,0.25)`.
- Estados de éxito: `#10b981` sobre `rgba(16,185,129,0.12)` con borde
  `rgba(16,185,129,0.30)`.

### Typography

Fuente principal: `Atkinson Hyperlegible` (loaded via `--font-atkinson`),
fallback Inter, system-ui.
Serif para títulos largos / hero: clase `.font-crimson` (Crimson Pro / Iowan).

Escala (variable + sólida):
```
hero       clamp(46px, 7vw, 86px)   font-weight 700  line-height 1.05
section    clamp(32px, 4vw, 52px)   font-weight 700  line-height 1.10
h2         32px–38px                font-weight 700–800
h3         19px–22px                font-weight 700–800
body       14px–16px                font-weight 400  line-height 1.55–1.7
caption    11px–13px                font-weight 600 uppercase letter-spacing 0.06em
```

Reglas:
- Body: line-height ≥ 1.55, max-width 65–75ch.
- Títulos largos: usar `.font-crimson` para peso editorial / académico.
- Eyebrows / etiquetas: 11–12px, uppercase, letter-spacing 0.06–0.12em,
  color `var(--accent)` o `var(--fg-muted)`.

### Spacing

Sistema 4/8. Padding habitual:
- Cards: 20–24px
- Card-premium (hero): 32–48px
- Section vertical: 70–96px
- Gap entre elementos relacionados: 8–14px
- Gap entre grupos: 24–36px

### Radius

```
6  → inputs pequeños, badges
8  → inputs, buttons compactos
10 → buttons primarios, dropdowns
12 → cards
14 → cards destacadas
16 → contenedores grandes
999 → píldoras (badges, navigation links, CTAs redondos)
```

### Shadow

```css
--shadow-sm: 0 1px 3px rgba(20,20,20,.07), 0 6px 18px rgba(20,20,20,.07);
--shadow-md: 0 10px 32px rgba(20,20,20,.11);
--shadow-lg: 0 18px 60px rgba(20,20,20,.14);
```

Solo aplicar `shadow-md` y `shadow-lg` a elementos elevados (modales, popovers).
Cards en grid: máximo `shadow-sm`.

## Components

### Buttons

- `.btn-primary` — fondo `--accent`, texto blanco, padding 12–14px, radius 999.
- `.btn-secondary` — fondo `--bg-card`, texto `--fg-primary`, borde 1.5px.
- `.btn-purple` / `.btn-cyan` — variantes para zonas de admin / módulos.

Estados:
- Hover: `transform: translateY(-1px)` + shadow más fuerte.
- Focus: `outline 2px solid var(--accent)` con offset 2px (accesibilidad).
- Disabled: `opacity 0.5`, `cursor not-allowed`.

### Inputs

- Border 1px `--border-hover`, radius 8.
- Padding `10px 12px`, fontSize 14.
- Fondo `--bg-card` (no transparente, no glassmorphism).
- Label asociada con `htmlFor` / `id`. Si la label es visual fuera del input,
  añadir `aria-label` cuando sea necesario.

### Cards

- `border 1px var(--border)`, `border-radius 12`, `padding 20`.
- Sin sombras pesadas, sin nested cards.
- Hover: `borderColor → rgba(15,23,42,0.35)`, fondo opcional ligeramente tintado.

### Badges

- Píldora (radius 999), padding `2px 8px`, fontSize 10–11, fontWeight 700.
- Background tintado 8–12% del color base + border 1px del color al 30%.

### Icons

- SVG inline con `stroke="currentColor"`, `strokeWidth 1.5–1.8`, `fill="none"`.
- Tamaños habituales: 14, 16, 18, 20, 22 px.
- `aria-hidden="true"` salvo que el icono sea la única descripción del control,
  en cuyo caso usar `aria-label` en el contenedor accionable.

## Anti-patterns (no usar)

| Patrón | Por qué | Alternativa |
|---|---|---|
| `text-gradient` en H1/H2 | Anti-ref de PRODUCT.md; absolute ban. | Color sólido (`--accent`) o sin destacado. |
| Glassmorphism (`backdrop-blur` con fondo translúcido) | Estética poco profesional. Solo en headers/overlays con propósito. | Fondo sólido `--bg-card` o `--bg-glass-heavy`. |
| Emojis decorativos (⚡ 💎 🎓 🚀 ⭐ 🧪 🔐 🛠️ 👤 ⚠️ ❌) | Entorno académico serio. | Iconos SVG con stroke / símbolos universales (✓, →). |
| Border-left de color como acento | Banderazo visual no académico. | Borde completo + fondo tintado. |
| Sombras pesadas / múltiples elevaciones | Genera ruido. | `shadow-sm` por defecto. |
| Cards anidadas | Crean profundidad innecesaria. | Aplanar con separadores o secciones. |

## Copy

Español neutro boliviano. Tuteo, nunca voseo.

- ✅ "puedes", "tienes", "elige", "descarga", "sube"
- ❌ "podés", "tenés", "elegís", "descargás", "subís"
- ✅ "sin rodeos", "sin complicaciones", "directo al punto"
- ❌ "sin vueltas", "che", "bárbaro", "macanudo"

Tono:
- Académico, confiable, sobrio.
- Pocas palabras, alta densidad de información.
- Sin em dashes (`—` solo como separador tipográfico en eyebrows, no para
  reemplazar comas en frases).
- Cifras boliviano: `Bs. 150`, fechas `15 mar 2026`.

## Accessibility

- WCAG 2.1 AA mínimo. Contraste 4.5:1 para texto, 3:1 para iconografía.
- Focus visible obligatorio en todos los controles.
- Labels asociadas con `htmlFor` / `id` o `aria-label`.
- `role="alert"` en mensajes de error.
- `aria-expanded` y `aria-controls` en disclosures (admin panel, demo panel).
- Touch targets ≥ 44×44px.

## Responsive

Breakpoints implícitos (Tailwind):
- `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

Reglas:
- Mobile-first. Stack vertical por defecto.
- Cards en grid: `repeat(auto-fit, minmax(260px, 1fr))`.
- Hero padding lateral: 24px mobile → 48px desktop.
- Body line-length ≤ 75ch en cualquier viewport.

## Motion

- Transiciones `0.15–0.25s` ease-out.
- Sin bounce ni elastic.
- No animar layout (width/height/margin); preferir `transform` y `opacity`.
- Hover translaciones máximas: 1–2px.
