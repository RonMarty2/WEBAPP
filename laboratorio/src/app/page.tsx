"use client";

import { useState } from "react";

export default function LaboratorioAcademico() {
  const [tema, setTema] = useState("");
  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(false);

  const generarMaterial = async () => {
    if (!tema) return alert("Por favor, ingresa un tema de investigación.");
    setCargando(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tema }),
      });

      const data: { text?: string; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResultado(data.error || "Error: no se pudo generar la respuesta.");
        return;
      }

      setResultado(data.text || "");
    } catch {
      setResultado("Error: no se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Laboratorio de Redacción Académica</h1>
          <p className="text-slate-400 italic">Asistente para Docentes y Tesistas</p>
        </header>

        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl mb-8">
          <label className="block text-sm font-semibold text-cyan-500 mb-2 tracking-widest uppercase">Área o Tema de Interés</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              className="flex-1 bg-black border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Ej: Análisis financiero de PYMES en Bolivia"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
            <button 
              onClick={generarMaterial}
              disabled={cargando}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:bg-slate-700"
            >
              {cargando ? "Generando..." : "Generar Ideas"}
            </button>
          </div>
        </section>

        {resultado && (
          <div className="bg-slate-900 p-8 rounded-xl border border-cyan-900/30 whitespace-pre-wrap leading-relaxed shadow-inner">
            {resultado}
          </div>
        )}
      </div>
    </main>
  );
}