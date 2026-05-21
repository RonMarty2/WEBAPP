"use client";

import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "59100000000";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola! Vengo de Laboratorio Académico y quiero más información sobre cómo generar mi monografía."
);

export default function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowLabel(true), 1800);
    const t2 = setTimeout(() => setShowLabel(false), 6500);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  if (!mounted) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversa por WhatsApp con Laboratorio Académico"
      style={{
        position: "fixed",
        right: 20,
        bottom: 24,
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: showLabel ? "12px 18px 12px 14px" : "12px",
        background: "#25D366",
        color: "white",
        borderRadius: 999,
        boxShadow: "0 10px 28px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0,0,0,0.12)",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 14,
        transition: "padding 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.06)";
        setShowLabel(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="white"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.71.244-1.06 0-.402-2.092-1.633-2.51-1.633zm-2.74 7.79c-1.39 0-2.78-.345-4.012-1.018l-2.812.93.93-2.79a8.36 8.36 0 0 1-1.13-4.198c0-4.59 3.73-8.32 8.32-8.32a8.21 8.21 0 0 1 5.876 2.43 8.31 8.31 0 0 1 2.43 5.89c0 4.59-3.74 8.32-8.32 8.32zm0-18.32c-5.51 0-9.99 4.48-9.99 9.99 0 1.79.46 3.55 1.36 5.1l-1.45 4.32 4.55-1.42c1.5.83 3.18 1.28 4.88 1.28h.02c5.51 0 9.99-4.48 9.99-9.99 0-5.51-4.48-9.99-9.99-9.99z" />
      </svg>
      {showLabel && (
        <span style={{ whiteSpace: "nowrap" }}>Chatea con nosotros</span>
      )}
    </a>
  );
}
