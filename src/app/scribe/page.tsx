import Link from "next/link";

export default function ScribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-gray-200/20 dark:border-white/10 p-12 rounded-[2rem] shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600/20 text-indigo-500 mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            SCRIBE
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-300 mb-10">
            Generador avanzado de proyectos de grado, tesis y monografías con estructuración lógica e integración LaTeX.
          </p>
          <Link href="/monografia" className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-500 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            Ir a Monografías
          </Link>
        </div>
      </div>
    </div>
  );
}
