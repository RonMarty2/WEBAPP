import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Crimson_Pro, Atkinson_Hyperlegible } from "next/font/google";
import ParticleSphere from "@/components/ParticleSphere";
import "./globals.css";

const crimsonPro = Crimson_Pro({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  variable: "--font-crimson" 
});

const atkinson = Atkinson_Hyperlegible({ 
  subsets: ["latin"], 
  weight: ["400", "700"], 
  variable: "--font-atkinson" 
});

export const metadata: Metadata = {
  title: "Laboratorio Académico — Generador de Monografías con IA",
  description: "Plataforma SaaS para generar monografías y trabajos académicos con IA para Bolivia y Latinoamérica. Sin alucinaciones, APA 7 real, exportación LaTeX.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        {/*
          Anti-flash script: detecta el tema guardado y lo aplica ANTES del
          primer paint para evitar el parpadeo blanco→oscuro.
          strategy="beforeInteractive" garantiza ejecución antes de hidratación.
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${atkinson.variable} ${crimsonPro.variable} min-h-full font-atkinson`} suppressHydrationWarning>
        <ParticleSphere />
        <div className="app-content">
          {children}
        </div>
      </body>
    </html>
  );
}
