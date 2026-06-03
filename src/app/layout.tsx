import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Crimson_Pro, Atkinson_Hyperlegible } from "next/font/google";
import ParticleSphere from "@/components/ParticleSphere";
import NucleoFooter from "@/components/ui/NucleoFooter";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import PWAServiceWorker from "@/components/pwa/PWAServiceWorker";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import AuthRefreshGate from "@/components/AuthRefreshGate";
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
  applicationName: "Laboratorio Académico",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Lab Académico",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a14" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        {/* PWA — fuerza vista app móvil en standalone (Android Chrome + iOS Safari) */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lab Académico" />
        <meta name="application-name" content="Laboratorio Académico" />
        {/* Detección de dispositivo móvil ANTES de la hidratación de React.
            Marca <html class="is-mobile-ua"> si el UA es móvil, el viewport es
            angosto, o el puntero es táctil. Cualquier CSS global puede luego
            aplicar overrides con .is-mobile-ua sin race conditions de React. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var u=navigator.userAgent||'';var isUA=/Mobi|Mobile|Android|iPhone|iPad|iPod/i.test(u);var isNarrow=window.matchMedia&&window.matchMedia('(max-width:1023px)').matches;var isCoarse=window.matchMedia&&window.matchMedia('(pointer:coarse)').matches;if(isUA||isNarrow||isCoarse){d.classList.add('is-mobile-ua');}}catch(e){}})();`,
          }}
        />
        <meta name="msapplication-TileColor" content="#0a0a14" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Anti-flash theme script removed temporarily to prevent React 19 script tag errors */}
      </head>
      <body className={`${atkinson.variable} ${crimsonPro.variable} min-h-full font-atkinson flex flex-col`} suppressHydrationWarning>
        <div aria-hidden="true" className="aura aura-tl" />
        <div aria-hidden="true" className="aura aura-br" />
        <ParticleSphere />
        <div className="app-content flex-1">
          {children}
        </div>
        <NucleoFooter />
        <WhatsAppFloat />
        <PWAServiceWorker />
        <PWAInstallPrompt />
        <AuthRefreshGate />
      </body>
    </html>
  );
}
