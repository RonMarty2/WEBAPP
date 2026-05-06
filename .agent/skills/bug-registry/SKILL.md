---
name: bug-registry
description: Base de datos de bugs conocidos del proyecto "Laboratorio Académico PRO". Cada bug documenta síntomas, múltiples causas posibles y sus respectivas soluciones. Consultar SIEMPRE antes de diagnosticar un error. Actualizar SIEMPRE al resolver un bug.
---

# Bug Registry — Laboratorio Académico PRO

> **Instrucción para Antigravity:**
> 1. **Al inicio del diagnóstico:** Busca el síntoma en el INDEX antes de explorar código.
> 2. **Al resolver un bug:** Agrega una entrada o expande una existente con la nueva causa/solución.
> 3. **Un bug puede tener N causas → N soluciones.** Registra todas, no sobreescribas.
> 4. Si el mismo síntoma fue causado por algo distinto esta vez, añade una nueva causa al mismo bug.

---

## INDEX — Búsqueda Rápida

| ID | Síntoma visible | Tags |
|----|-----------------|------|
| [BUG-001](#bug-001) | Página `/admin/login` carga infinitamente / spinner eterno | `admin` `auth` `hydration` `localStorage` `usePathname` |
| [BUG-002](#bug-002) | Hydration mismatch: servidor y cliente renderizan HTML diferente | `hydration` `SSR` `localStorage` `useState` `React 19` |
| [BUG-003](#bug-003) | Console error: "Encountered a script tag while rendering React component" | `script` `dangerouslySetInnerHTML` `React 19` `layout` |
| [BUG-004](#bug-004) | HMR infinito / página se recarga sola al editar archivos | `HMR` `webpack` `watcher` `.store` `data.json` |
| [BUG-005](#bug-005) | Cambios de Tailwind (ej. arbitrary values) no se reflejan | `turbopack` `hmr` `tailwind` `cache` |
| [BUG-006](#bug-006) | Proyecto/monografia borrada reaparece despues de refrescar dashboard | `projects` `delete` `dashboard` `store` `supabase` |
| [BUG-007](#bug-007) | Fase con prompt maestro genera solo referencias/anexos en vez del capitulo | `projects` `generate-phase` `prompt` `referencias` `fallback` |
| [BUG-008](#bug-008) | Observacion por chat regenera demasiado / PDF queda con titulos huerfanos, referencias repetidas o indices incompletos | `projects` `chat` `pdf` `prompts` `documento-final` |

---

## BUG-001

### Síntoma
La página `/admin/login` muestra un spinner que nunca desaparece. El usuario no puede ingresar al panel. En la terminal de Next.js se ven múltiples `GET /admin/login 200` repetidas.

### Cuándo aparece
- Al entrar a `/admin/login` sin haber iniciado sesión antes
- **Especialmente** después de editar `globals.css` u otro archivo de estilos (el HMR re-monta el layout)
- Al cambiar el "skin" o diseño del admin

### Causa 1: Comparación estricta de pathname falla con valor null
**Root cause:** `usePathname()` puede retornar `null` durante la hidratación inicial del App Router. Si el código hace `pathname === "/admin/login"`, falla cuando `pathname` es `null`. El `useEffect` no detecta la ruta de login y ejecuta `window.location.replace("/admin/login")` → loop infinito.

**Fix aplicado (May 2026):**
```tsx
// ❌ PROBLEMÁTICO
if (pathname === "/admin/login") { setAuthed(true); return; }

// ✅ CORRECTO — usar includes() y guard contra null
if (!pathname || pathname.includes("/admin/login")) return;
```

**Archivos:** `src/app/admin/layout.tsx` (línea ~133)

---

### Causa 2: Lazy initializer en useState lee localStorage en servidor
**Root cause:** El estado se inicializaba con un lazy initializer que leía `localStorage`. El servidor retorna `null` (no tiene `window`). El cliente retorna `true` (tiene la flag). React detecta la diferencia → hydration error → React re-renderiza → re-monta el layout → el efecto vuelve a correr → puede causar redirección a login nuevamente.

**Fix aplicado (May 2026):**
```tsx
// ❌ PROBLEMÁTICO — causa hydration mismatch
const [authed, setAuthed] = useState<boolean | null>(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAuthed") === "1" ? true : null;
});

// ✅ CORRECTO — siempre null en ambos lados (servidor y cliente)
const [authed, setAuthed] = useState<boolean | null>(null);
// Y leer localStorage solo en useEffect (solo corre en el cliente)
```

**Archivos:** `src/app/admin/layout.tsx` (línea ~132)

---

### Solución final canónica (usa ambas correcciones)
```tsx
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // ✅ null siempre — sin lazy initializer
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // ✅ guard contra null + includes en vez de ===
    if (!pathname || pathname.includes("/admin/login")) return;

    const flag = localStorage.getItem("adminAuthed") === "1";
    if (flag) { setAuthed(true); }
    else { window.location.replace("/admin/login"); }
  }, [pathname]);

  // ✅ guard en render también — antes del spinner check
  if (!pathname || pathname.includes("/admin/login")) return <>{children}</>;

  if (authed === null) return <Spinner />;
  // ... resto del layout
}
```

**Regla de oro:** El guard de login en el render debe ir **ANTES** del check `authed === null`. Así la página de login nunca ve el spinner.

---

### Causa 3: `localStorage.adminAuthed` queda viejo, pero la cookie `admin_session` ya expiró
**Root cause:** El login revisaba solo `localStorage.adminAuthed === "1"` y redirigía directo a `/admin`. Si la cookie HTTP `admin_session` ya no existía o expiró, el proxy devolvía a `/admin/login`; el login veía otra vez `adminAuthed=1` y volvía a mandar a `/admin`. Resultado: `/admin/login` se recarga constantemente y no deja entrar.

**Fix aplicado (May 2026):**
```tsx
useEffect(() => {
  if (localStorage.getItem("adminAuthed") !== "1") return;

  fetch("/api/admin/auth/check")
    .then((res) => {
      if (res.ok) router.replace("/admin");
      else localStorage.removeItem("adminAuthed");
    })
    .catch(() => localStorage.removeItem("adminAuthed"));
}, [router]);
```

**Archivos:** `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`

**Regla de oro:** `localStorage.adminAuthed` solo sirve como ayuda visual del cliente; la fuente real de sesión admin es la cookie `admin_session`.

---

## BUG-002

### Síntoma
En la consola del browser (panel de Next.js dev overlay): `"Hydration failed because the server rendered HTML didn't match the client"`. Aparece como "Recoverable Error". El layout se re-renderiza completo después de cargar.

### Cuándo aparece
- Cuando `useState` usa un lazy initializer que accede a `localStorage` o `window`
- Cuando hay código con `typeof window !== "undefined"` en el render path
- Cuando un componente usa `Date.now()` o `Math.random()` en el render
- Cuando extensiones del browser modifican el HTML antes de que React cargue

### Causa 1: useState lazy initializer accede a APIs del browser
**Root cause:** El servidor ejecuta el componente sin `window`/`localStorage`. Si el lazy initializer retorna un valor diferente en servidor vs cliente, React detecta mismatch en el primer render.

**Ejemplo del bug:**
```tsx
// ❌ Servidor retorna null, cliente retorna true → MISMATCH
const [authed, setAuthed] = useState(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminAuthed") === "1" ? true : null;
});
```

**Fix:**
```tsx
// ✅ Siempre el mismo valor inicial en ambos lados
const [authed, setAuthed] = useState<boolean | null>(null);

// Leer localStorage solo en useEffect (exclusivo del cliente)
useEffect(() => {
  setAuthed(localStorage.getItem("adminAuthed") === "1");
}, []);
```

**Archivos:** `src/app/admin/layout.tsx`

---

### Regla general anti-hydration
> **Nunca uses `localStorage`, `window`, `document`, o `Date.now()` dentro de:**
> - El cuerpo del componente (fuera de efectos)
> - Lazy initializers de `useState`
> - `useMemo` o `useCallback` que se calculan en SSR
>
> **Sí puedes usarlos en:**
> - `useEffect` / `useLayoutEffect`
> - Event handlers (`onClick`, `onChange`, etc.)
> - `typeof window !== "undefined"` guards dentro de funciones que solo corren en el cliente

---

## BUG-003

### Síntoma
Console error en el dev overlay de Next.js: `"Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client."`

### Cuándo aparece
- Cuando hay un `<script dangerouslySetInnerHTML={...} />` inline dentro del árbol JSX de un componente React
- Específicamente en `src/app/layout.tsx` con el script anti-flash de tema

### Causa 1: Tag `<script>` raw en JSX (React 19 incompatible)
**Root cause:** React 19 cambió el manejo de `<script>` dentro del árbol de componentes. Los scripts inline ya no se ejecutan en el cliente cuando están en JSX. El mensaje es una advertencia que indica que el comportamiento puede no ser el esperado.

**Fix aplicado (May 2026):**
```tsx
// ❌ PROBLEMÁTICO en React 19
import type { Metadata } from "next";
// ...
<script
  suppressHydrationWarning
  dangerouslySetInnerHTML={{ __html: `...` }}
/>

// ✅ CORRECTO — usar componente Script de Next.js
import Script from "next/script";
// ...
<Script
  id="theme-init"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{ __html: `...` }}
/>
```

**Archivos:** `src/app/layout.tsx`

**Nota:** `strategy="beforeInteractive"` garantiza que el script corre ANTES de la hidratación, igual que el comportamiento del `<script>` síncrono original.

---

## BUG-004

### Síntoma
La página se recarga sola constantemente mientras se trabaja. El HMR (Hot Module Reload) se dispara solo sin haber editado código fuente. Los componentes se re-montan perdiendo el estado.

### Cuándo aparece
- Al escribir datos al archivo `.store/data.json` (el watcher de webpack detecta el cambio)
- Específicamente cuando la app guarda datos de persistencia local en desarrollo

### Causa 1: webpack watcher incluye `.store/data.json`
**Root cause:** El watcher de webpack (que alimenta el HMR) vigilaba todos los archivos del proyecto, incluyendo `.store/data.json`. Cada vez que la app escribía datos al store local, el watcher detectaba el cambio y disparaba un HMR, re-montando todos los componentes.

**Fix aplicado:**
```typescript
// next.config.ts
webpack: (config) => {
  config.watchOptions = {
    ...config.watchOptions,
    ignored: [
      /node_modules/,
      /\.next/,
      path.resolve(process.cwd(), ".store"), // ← ignorar carpeta de datos
    ],
  };
  return config;
},
```

**Archivos:** `next.config.ts`

---

## BUG-005

### Síntoma
Se modifican las clases de Tailwind de un componente de React, pero los cambios visuales no se reflejan en el navegador en absoluto (incluso después de hacer F5). Sigue renderizando el diseño antiguo.

### Cuándo aparece
- Usando Next.js 15+ con Turbopack (`next dev --turbo`).
- Modificando archivos externamente (vía scripts de Python o herramientas CLI) mientras el servidor corre.
- Al usar valores arbitrarios de Tailwind muy específicos (ej. `bg-white/60`, `rounded-[10px]`).

### Causa 1: Desincronización del Caché de Turbopack + Tailwind
**Root cause:** Turbopack agrupa y compila agresivamente. Cuando un archivo es modificado fuera del entorno de IDE tradicional, o se inyectan clases arbitrarias complejas, el watcher a veces no invalida correctamente el módulo CSS asociado o el compilador JIT de Tailwind se queda "congelado" con la versión anterior.

**Fix (Escalada de soluciones):**
1. **Paso 1 (Normalizar Clases):** Cambiar clases arbitrarias (`bg-[#0B0F19]/60`) por clases estándar (`bg-slate-900/60`).
2. **Paso 2 (Romper Caché de Módulo):** Renombrar el archivo del componente (ej. `ConfirmModal.tsx` -> `GlassModal.tsx`) y actualizar la importación. Esto obliga a Turbopack a crear un nuevo grafo de dependencias y recompilar.
3. **Paso 3 (Opción Nuclear):** Si Tailwind sigue roto, sobrescribir los estilos críticos usando React Inline Styles (`style={{ background: 'rgba(255,255,255,0.8)' }}`) para saltarse el motor de CSS por completo.

**Archivos afectados típicamente:** Componentes UI (`src/components/ui/*.tsx`)
**Fecha:** Mayo 2026

---

## BUG-006

### Sintoma
El usuario borra una monografia/proyecto desde `/dashboard`, la tarjeta desaparece o parece borrarse, pero al refrescar la pagina vuelve a aparecer.

### Cuando aparece
- En usuario demo estudiante al borrar proyectos listados desde `/api/projects`.
- Con mezcla de datos entre Supabase y `.store/data.json`.
- Cuando una instancia del servidor mantiene en memoria una version vieja de `proyectosStore`.

### Causa 1: el listado usaba memoria cacheada y no respetaba la marca persistida de oculto
**Root cause:** El borrado del usuario guarda `oculto_por_usuario: true` en `.store/data.json`, pero `getProyecto()` y `listProyectos()` podian devolver una version vieja de `proyectosStore` sin volver a leer disco. Entonces `/api/projects` mezclaba Supabase + memoria local y traia otra vez el proyecto.

**Fix aplicado (May 2026):**
```ts
export function reloadFromDisk(): StoreData {
  latestDataCache = null;
  return loadFromDisk();
}
```

**Archivos:** `src/lib/persistence.ts`, `src/lib/memoryStore.ts`, `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`

**Regla de oro:** Si el usuario borra desde dashboard, el listado debe consultar una marca persistida de oculto por usuario antes de mostrar cualquier fila que venga de Supabase o memoria.

---

## BUG-007

### Sintoma
Una fase con prompt maestro configurado, por ejemplo Capitulo I, queda marcada como generada pero el contenido resultante contiene casi solo `REFERENCIAS BIBLIOGRAFICAS` y `ANEXOS`.

### Cuando aparece
- El prompt maestro de una fase normal incluye directivas de bibliografia, APA 7 o `REFERENCIAS_ETAPA`.
- La llamada a IA falla o cae al fallback.
- En el inspector aparece `referencias-respaldadas` como modelo/fallback aunque la fase no era de referencias.

### Causa 1: deteccion de fase de referencias revisaba el prompt completo
**Root cause:** `isReferencesPhase()` buscaba palabras como `referencias` o `bibliograf` dentro de `label`, `short_label`, `prompt` y `prompt_final`. Como casi todos los prompts maestros incluyen instrucciones finales de bibliografia APA, una fase normal como Capitulo I podia clasificarse como fase de referencias.

**Fix aplicado (May 2026):**
```js
export function isReferencesPhase(phase) {
  const label = normalizeText(`${phase?.label ?? ""} ${phase?.short_label ?? ""}`);
  return label.includes("referencias") || label.includes("bibliograf");
}
```

**Archivos:** `src/lib/phaseClassification.mjs`, `src/app/api/projects/generate-phase/route.ts`, `tests/academicProject.test.mjs`

**Regla de oro:** Solo el nombre de la fase decide si es una fase de referencias. El prompt maestro puede mencionar bibliografia sin convertir la fase completa en bibliografia/anexos.

---

## BUG-008

### Sintoma
Una observacion del tutor o del estudiante enviada por chat puede cambiar demasiado contenido de la fase. En el PDF final tambien pueden aparecer titulos solos al final de pagina, capitulos sin iniciar en hoja nueva, referencias duplicadas o indices sin tablas/figuras/graficos.

### Cuando aparece
- El estudiante ya tiene una fase generada y escribe una observacion puntual en el chat.
- El documento final se consolida en un solo bloque Markdown y luego se exporta a PDF.
- El contenido incluye bibliografia repetida, tablas, figuras, graficos o imagenes.

### Causa 1: el chat usaba el endpoint de generacion completa
**Root cause:** El chat del workspace enviaba observaciones a `/api/projects/generate-phase`. Ese flujo esta pensado para generar/regenerar fases completas, no para aplicar una correccion puntual manteniendo estable el resto del capitulo.

**Fix aplicado (May 2026):**
- Se agrego `/api/projects/edit-phase-section` para aplicar observaciones a la fase existente.
- El chat usa este endpoint solo cuando ya existe contenido final y el usuario escribe una observacion.
- El prompt de edicion queda editable en `Admin > Prompts del Workspace > Edicion por Chat`.

**Archivos:** `src/app/api/projects/edit-phase-section/route.ts`, `src/app/projects/[id]/workspace/page.tsx`, `src/app/api/admin/workspace-prompts/route.ts`, `src/app/admin/prompts/page.tsx`

### Causa 2: reglas editoriales mezcladas entre codigo y prompts
**Root cause:** Algunas reglas del entregable estaban hardcodeadas en el generador o en defaults viejos con marcadores tipo `[DATO: fuente, indicador]`. Eso hacia dificil verlas, auditarlas o cambiarlas desde el admin.

**Fix aplicado (May 2026):**
- Las reglas globales se consolidaron en `workspacePrompts.hilos`.
- Se quito la regla editorial hardcodeada de `generate-phase`.
- Se cambio el default que permitia marcadores por una instruccion de reformular con evidencia verificable sin inventar ni dejar placeholders.

**Archivos:** `.store/data.json`, `src/app/api/projects/generate-phase/route.ts`, `src/app/api/admin/workspace-prompts/route.ts`

### Causa 3: el paginador Markdown no cuidaba unidades academicas
**Root cause:** El exportador PDF cortaba por capacidad aproximada de texto. No separaba un documento final consolidado por capitulos, no evitaba que un heading quedara huerfano y no creaba indices para tablas/figuras/graficos detectados en Markdown.

**Fix aplicado (May 2026):**
- El PDF separa capitulos en hojas distintas cuando el documento final viene consolidado.
- El paginador intenta mantener titulos junto al bloque siguiente.
- Las referencias repetidas se deduplican durante render.
- Las lineas `Tabla N`, `Cuadro N`, `Figura N` y `Grafico/Grafico N` generan indices especificos cuando existen.
- Las imagenes Markdown se renderizan como figura con caption.

**Archivos:** `src/lib/pdfTemplate.ts`

**Regla de oro:** Las reglas del documento deben ser editables desde admin siempre que sea posible. El codigo solo debe ejecutar estructura, paginacion y persistencia.

---

## Plantilla para nuevos bugs

Al encontrar y resolver un bug nuevo, añadir al INDEX y crear una nueva sección:

```markdown
## BUG-XXX

### Síntoma
[Qué ve el usuario / qué aparece en consola]

### Cuándo aparece
- [Condición 1]
- [Condición 2]

### Causa N: [Descripción corta]
**Root cause:** [Explicación técnica]

**Fix:**
\`\`\`tsx
// ❌ PROBLEMÁTICO
[código con el bug]

// ✅ CORRECTO
[código corregido]
\`\`\`

**Archivos:** [lista de archivos modificados]
**Fecha:** [mes año]
```
