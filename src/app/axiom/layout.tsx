"use client";

import { ReactNode } from "react";
import ParticleBackground from "./components/ParticleBackground";

export default function AxiomLayout({ children }: { children: ReactNode }) {
  const globalStyles = `
    :root {
      --primary: rgb(139, 92, 246);
      --primary-light: rgb(168, 126, 255);
      --primary-dark: rgb(109, 40, 217);
      --success: #10b981;
      --success-light: #d1fae5;
      --error: #ef4444;
      --error-light: #fee2e2;
      --warning: #f59e0b;
      --warning-light: #fef3c7;
      --neutral-50: #f9fafb;
      --neutral-100: #f3f4f6;
      --neutral-200: #e5e7eb;
      --neutral-300: #d1d5db;
      --neutral-400: #9ca3af;
      --neutral-500: #6b7280;
      --neutral-600: #4b5563;
      --neutral-700: #374151;
      --neutral-800: #1f2937;
      --neutral-900: #111827;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      background-color: var(--neutral-50);
      color: var(--neutral-900);
      line-height: 1.6;
      font-size: 16px;
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 0.5rem;
    }

    h1 {
      font-size: 2.5rem;
    }

    h2 {
      font-size: 2rem;
    }

    h3 {
      font-size: 1.5rem;
    }

    h4 {
      font-size: 1.25rem;
    }

    h5 {
      font-size: 1.125rem;
    }

    h6 {
      font-size: 1rem;
    }

    p {
      margin-bottom: 1rem;
    }

    a {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      background: none;
      transition: all 0.2s ease;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    input,
    textarea,
    select {
      font-family: inherit;
      border: 1px solid var(--neutral-300);
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    code {
      background-color: var(--neutral-100);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    pre {
      background-color: var(--neutral-900);
      color: #e5e7eb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    th,
    td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
    }

    th {
      background-color: var(--neutral-100);
      font-weight: 600;
    }

    tr:hover {
      background-color: var(--neutral-50);
    }

    ul,
    ol {
      margin-bottom: 1rem;
      margin-left: 1.5rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
      margin-left: 0;
      margin-bottom: 1rem;
      font-style: italic;
      color: var(--neutral-600);
    }

    hr {
      border: none;
      border-top: 1px solid var(--neutral-200);
      margin: 2rem 0;
    }

    .container {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: 640px) {
      .container {
        max-width: 640px;
      }
    }

    @media (min-width: 768px) {
      .container {
        max-width: 768px;
      }
    }

    @media (min-width: 1024px) {
      .container {
        max-width: 1024px;
      }
    }

    @media (min-width: 1280px) {
      .container {
        max-width: 1280px;
      }
    }

    @media (min-width: 1536px) {
      .container {
        max-width: 1536px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.875rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.25rem;
      }

      body {
        font-size: 14px;
      }
    }
  `;

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Axiom - Simulador de exámenes UMSS. Generador de exámenes universitarios con IA."
        />
        <meta name="author" content="Laboratorio Académico PRO" />
        <meta name="keywords" content="exámenes, simulador, UMSS, educación, Bolivia" />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        <ParticleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
