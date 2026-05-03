import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Crimson_Pro, Atkinson_Hyperlegible } from "next/font/google";
import ParticleSphere from "@/components/ParticleSphere";
import NucleoFooter from "@/components/ui/NucleoFooter";
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
        {/* Anti-flash theme script removed temporarily to prevent React 19 script tag errors */}
      </head>
      <body className={`${atkinson.variable} ${crimsonPro.variable} min-h-full font-atkinson flex flex-col`} suppressHydrationWarning>
        <ParticleSphere />
        <div className="app-content flex-1">
          {children}
        </div>
        <NucleoFooter />
      </body>
    </html>
  );
}
