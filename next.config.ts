import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (Next.js 16 default) — configuración vacía para suprimir la
  // advertencia por el bloque webpack legado (solo usado en fallback webpack).
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse usa canvas opcionalmente; externo para evitar bundling en cliente.
      config.externals = [...(config.externals ?? []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;
