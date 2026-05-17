import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Regla nueva del plugin react-hooks (Next 16) que marca como error patrones
      // estándar de React: fetch-on-mount, sync de localStorage post-hidratación,
      // derivación de estado tras cambio de prop. Migrar a useSyncExternalStore /
      // Suspense + use() en cada caso sería un refactor mayor sin beneficio real.
      // El patrón GlassModal (animación con setState síncrono visible) sí se
      // refactorizó porque era un bug real de performance.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling/skill scripts (CJS Node scripts, third-party bundles, etc).
    // These are NOT production code and follow different conventions.
    ".claude/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
