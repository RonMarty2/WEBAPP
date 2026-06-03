"use client";

/**
 * useIsMobileDevice — detección reutilizable de móvil para hacer páginas responsive.
 *
 * Estrategia:
 * 1. Lazy initializer: lee la clase `.is-mobile-ua` que el script inline en
 *    layout.tsx ya puso en <html> ANTES de cualquier render de React. Sin race
 *    conditions de hidratación.
 * 2. Fallback: User Agent + matchMedia(max-width:1023) + pointer:coarse.
 * 3. Listener de resize/orientación para mantener el state actualizado.
 *
 * Uso:
 *   const isMobile = useIsMobileDevice();
 *   <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
 */

import { useState, useEffect } from "react";

export function useIsMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("is-mobile-ua")) return true;
    const ua = window.navigator.userAgent;
    if (/Mobi|Mobile|Android|iPhone|iPad|iPod/i.test(ua)) return true;
    return window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const ua = window.navigator.userAgent;
      const isUA = /Mobi|Mobile|Android|iPhone|iPad|iPod/i.test(ua);
      const isNarrow = window.matchMedia("(max-width: 1023px)").matches;
      const isCoarse = window.matchMedia("(pointer:coarse)").matches;
      setIsMobile(isUA || isNarrow || isCoarse);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return isMobile;
}
