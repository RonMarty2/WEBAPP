import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laboratorio Académico — Generador de Perfiles de Investigación",
  description: "Plataforma SaaS para generar perfiles de investigación académica paso a paso, con IA y cumplimiento de lineamientos universitarios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        {/* Fixed visual background — aurora base + floating confetti particles */}
        <div className="aurora-root" aria-hidden="true">
          {/* Subtle aurora gradient blobs */}
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
          <div className="aurora-blob aurora-blob-3" />
          {/* Antigravity-style scattered colorful particles — 36 items */}
          <div className="particles-layer">
            <span className="pt pt-1" /><span className="pt pt-2" /><span className="pt pt-3" />
            <span className="pt pt-4" /><span className="pt pt-5" /><span className="pt pt-6" />
            <span className="pt pt-7" /><span className="pt pt-8" /><span className="pt pt-9" />
            <span className="pt pt-10" /><span className="pt pt-11" /><span className="pt pt-12" />
            <span className="pt pt-13" /><span className="pt pt-14" /><span className="pt pt-15" />
            <span className="pt pt-16" /><span className="pt pt-17" /><span className="pt pt-18" />
            <span className="pt pt-19" /><span className="pt pt-20" /><span className="pt pt-21" />
            <span className="pt pt-22" /><span className="pt pt-23" /><span className="pt pt-24" />
            <span className="pt pt-25" /><span className="pt pt-26" /><span className="pt pt-27" />
            <span className="pt pt-28" /><span className="pt pt-29" /><span className="pt pt-30" />
            <span className="pt pt-31" /><span className="pt pt-32" /><span className="pt pt-33" />
            <span className="pt pt-34" /><span className="pt pt-35" /><span className="pt pt-36" />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
