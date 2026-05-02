import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laboratorio Académico — Generador de Monografías con IA",
  description: "Plataforma SaaS para generar monografías y trabajos académicos con IA para Bolivia y Latinoamérica. Sin alucinaciones, APA 7 real, exportación LaTeX.",
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
          Anti-flash script: lee el tema guardado y lo aplica ANTES del primer
          paint. suppressHydrationWarning en <html> evita que React haga un
          re-mount completo cuando detecta la diferencia de className.
          NOTA: Este script corre síncronamente en el parser — nunca bloquea
          la hidratación de los componentes hijos.
        */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
