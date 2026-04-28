"use client";

import { useState } from "react";

export default function LaboratorioAcademico() {
  const [programa, setPrograma] = useState("");
  const [modulos, setModulos] = useState("");
  const [interes, setInteres] = useState("");
  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(false);

  // Modificamos la función para aceptar un modo "sorpresa"
  const generarTitulos = async (esSorpresa = false) => {
    // Ahora el interés NO es obligatorio si eligen "Sorpréndeme"
    if (!programa || !modulos) return alert("Por favor, llena al menos el Programa y los Módulos.");
    
    setCargando(true);
    setResultado("");
    
    // Si es sorpresa, le mandamos una palabra clave secreta a la IA
    const temaFinal = esSorpresa ? "SORPRENDEME" : interes;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programa, modulos, interes: temaFinal }),
      });

      const data = await res.json().catch(() => ({}));

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
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Generador de Perfiles de Investigación</h1>
          <p className="text-slate-400 italic">Paso 1: Delimitación y Propuesta de Título</p>
        </header>

        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl mb-8 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-cyan-500 mb-2 tracking-widest uppercase">Programa Académico</label>
            <input 
              type="text" 
              className="w-full bg-black border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Ej: Diplomado en Gestión Financiera..."
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-500 mb-2 tracking-widest uppercase">Módulos o Materias Cursadas</label>
            <textarea 
              className="w-full bg-black border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Ej: Econometría Aplicada, Análisis Financiero..."
              rows={2}
              value={modulos}
              onChange={(e) => setModulos(e.target.value)}
            />
          </div>

          {/* AQUÍ CAMBIAMOS EL TONO DE LA PREGUNTA */}
          <div>
            <label className="block text-sm font-semibold text-cyan-500 mb-2 tracking-widest uppercase">
              ¿Qué te apasiona, en qué trabajas o qué problema ves a tu alrededor? (Opcional)
            </label>
            <input 
              type="text" 
              className="w-full bg-black border border-slate-700 p-3 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Ej: Me gustan los autos, trabajo en un banco, o simplemente 'no sé'"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => generarTitulos(false)}
              disabled={cargando}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:bg-slate-700"
            >
              {cargando ? "Generando..." : "Generar con mi idea"}
            </button>
            
            {/* NUEVO BOTÓN SORPRÉNDEME */}
            <button 
              onClick={() => generarTitulos(true)}
              disabled={cargando}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:bg-slate-700"
            >
              {cargando ? "Pensando..." : "¡Sorpréndeme, no tengo idea!"}
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