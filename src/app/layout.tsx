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
        {/* Floating particles — 36 individual classes, no var() in animation shorthand */}
        <span aria-hidden="true" className="pt pt-1" /><span aria-hidden="true" className="pt pt-2" />
        <span aria-hidden="true" className="pt pt-3" /><span aria-hidden="true" className="pt pt-4" />
        <span aria-hidden="true" className="pt pt-5" /><span aria-hidden="true" className="pt pt-6" />
        <span aria-hidden="true" className="pt pt-7" /><span aria-hidden="true" className="pt pt-8" />
        <span aria-hidden="true" className="pt pt-9" /><span aria-hidden="true" className="pt pt-10" />
        <span aria-hidden="true" className="pt pt-11" /><span aria-hidden="true" className="pt pt-12" />
        <span aria-hidden="true" className="pt pt-13" /><span aria-hidden="true" className="pt pt-14" />
        <span aria-hidden="true" className="pt pt-15" /><span aria-hidden="true" className="pt pt-16" />
        <span aria-hidden="true" className="pt pt-17" /><span aria-hidden="true" className="pt pt-18" />
        <span aria-hidden="true" className="pt pt-19" /><span aria-hidden="true" className="pt pt-20" />
        <span aria-hidden="true" className="pt pt-21" /><span aria-hidden="true" className="pt pt-22" />
        <span aria-hidden="true" className="pt pt-23" /><span aria-hidden="true" className="pt pt-24" />
        <span aria-hidden="true" className="pt pt-25" /><span aria-hidden="true" className="pt pt-26" />
        <span aria-hidden="true" className="pt pt-27" /><span aria-hidden="true" className="pt pt-28" />
        <span aria-hidden="true" className="pt pt-29" /><span aria-hidden="true" className="pt pt-30" />
        <span aria-hidden="true" className="pt pt-31" /><span aria-hidden="true" className="pt pt-32" />
        <span aria-hidden="true" className="pt pt-33" /><span aria-hidden="true" className="pt pt-34" />
        <span aria-hidden="true" className="pt pt-35" /><span aria-hidden="true" className="pt pt-36" />
        <div className="app-content flex-1">
          {children}
        </div>
        <NucleoFooter />
      </body>
    </html>
  );
}
