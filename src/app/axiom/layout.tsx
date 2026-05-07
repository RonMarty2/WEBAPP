import { ReactNode } from "react";

export default function AxiomLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#fafaf9",
          color: "#1f2937",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
