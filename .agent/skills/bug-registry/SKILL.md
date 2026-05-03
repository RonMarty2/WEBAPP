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
