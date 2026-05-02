import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack (Next.js 16 default) — configuración vacía para suprimir la
  // advertencia por el bloque webpack legado (solo usado en fallback webpack).
  turbopack: {},

  // Oculta el indicador "N" de Next.js en la esquina inferior izquierda
  devIndicators: false,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse usa canvas opcionalmente; externo para evitar bundling en cliente.
      config.externals = [...(config.externals ?? []), "canvas"];
    }

    // ── CRÍTICO: Ignorar .store/data.json del file watcher ──────────────
    // Sin esto, cada escritura a .store/data.json dispara un HMR que
    // re-monta los componentes y roba el foco del input de contraseña.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        /node_modules/,
        /\.next/,
        path.resolve(process.cwd(), ".store"),
      ],
    };

    return config;
  },
};

export default nextConfig;
