"use client";

import { useState, useEffect } from "react";

export default function UIConfigPage() {
  const [config, setConfig] = useState({
    shape: "sphere",
    palette: "antigravity",
    wave: "magnetic",
    speed: 1.0,
    particleSize: 1.0,
    particleLength: 1.0,
    swarmSize: 1.0,
    density: 1000
  });

  useEffect(() => {
    const stored = localStorage.getItem("ui_particle_config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(prev => ({
          ...prev,
          ...parsed,
          // Handle migration from 'size' to 'particleSize' if needed
          particleSize: parsed.particleSize ?? parsed.size ?? prev.particleSize,
          particleLength: parsed.particleLength ?? prev.particleLength,
          swarmSize: parsed.swarmSize ?? prev.swarmSize,
          density: parsed.density ?? prev.density
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem("ui_particle_config", JSON.stringify(newConfig));
    window.dispatchEvent(new Event("ui_particle_update"));
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Apariencia UI (Antigravity)</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Ajusta los parámetros visuales y físicos de la Esfera de Partículas en tiempo real.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
        
        {/* Arquitectura Geométrica */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Arquitectura Geométrica (Forma)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "sphere", label: "Esfera Nebular", desc: "La clásica masa de agua redondeada." },
              { id: "torus", label: "Toroide Cuántico", desc: "Anillo magnético giratorio." },
              { id: "rings", label: "Anillos de Saturno", desc: "Un disco estelar estirado." },
              { id: "dna", label: "Doble Hélice Celular", desc: "Estructura genética biológica." },
              { id: "cube", label: "Tesseract (Cubo)", desc: "Cubo de datos hiperdimensional." },
              { id: "blackhole", label: "Agujero Negro", desc: "Núcleo denso y disco de acreción." }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => handleChange("shape", opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  config.shape === opt.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${config.shape === opt.id ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Esquema de Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Esquema de Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "antigravity", label: "Antigravity", color: "from-cyan-400 to-indigo-600" },
              { id: "plasma", label: "Plasma", color: "from-orange-500 to-rose-600" },
              { id: "matrix", label: "Matrix", color: "from-emerald-400 to-teal-600" },
              { id: "monochrome", label: "Platino", color: "from-gray-300 to-gray-500" },
              { id: "gold", label: "Oro Cyber", color: "from-yellow-400 to-amber-600" },
              { id: "synthwave", label: "Synthwave", color: "from-fuchsia-500 to-cyan-500" },
              { id: "blood", label: "Crimson", color: "from-red-600 to-rose-900" },
              { id: "toxic", label: "Tóxico", color: "from-lime-400 to-green-600" }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => handleChange("palette", opt.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${
                  config.palette === opt.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${opt.color} shadow-sm`} />
                <div className={`text-xs font-bold text-center ${config.palette === opt.id ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                  {opt.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efecto de Ola */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Efecto de Física y Ola
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "magnetic", label: "Desintegración", desc: "Suelta partículas al moverse." },
              { id: "ocean", label: "Océano Constante", desc: "Crestas de agua continuas." },
              { id: "none", label: "Masa Pesada", desc: "Sin ola adicional." }
            ].map(opt => (
              <div 
                key={opt.id}
                onClick={() => handleChange("wave", opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  config.wave === opt.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <div className={`text-sm font-bold mb-1 ${config.wave === opt.id ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Velocidad de Respiración */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Velocidad de Respiración y Vida
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              {config.speed.toFixed(1)}x
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" max="3.0" step="0.1" 
            value={config.speed}
            onChange={(e) => handleChange("speed", parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Tamaño del Enjambre */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Tamaño del Enjambre (Radio Geométrico)
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              {config.swarmSize.toFixed(1)}x
            </span>
          </div>
          <input 
            type="range" 
            min="0.3" max="2.0" step="0.1" 
            value={config.swarmSize}
            onChange={(e) => handleChange("swarmSize", parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Tamaño de Partículas */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Grosor de Partículas (Ancho)
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              {config.particleSize.toFixed(1)}x
            </span>
          </div>
          <input 
            type="range" 
            min="0.2" max="3.0" step="0.1" 
            value={config.particleSize}
            onChange={(e) => handleChange("particleSize", parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Largo de Partículas */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Longitud de Partículas (Largo/Estela)
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              {config.particleLength.toFixed(1)}x
            </span>
          </div>
          <input 
            type="range" 
            min="0.2" max="4.0" step="0.1" 
            value={config.particleLength}
            onChange={(e) => handleChange("particleLength", parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Densidad de Partículas */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Cantidad de Partículas (Densidad)
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              {config.density} uds.
            </span>
          </div>
          <input 
            type="range" 
            min="100" max="2500" step="50" 
            value={config.density}
            onChange={(e) => handleChange("density", parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

      </div>
    </div>
  );
}
