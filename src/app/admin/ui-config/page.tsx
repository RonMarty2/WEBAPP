"use client";

import { useState, useEffect } from "react";

const DEFAULT_CONFIGS: Record<string, any> = {
  scribe: { shape: "sphere", palette: "antigravity", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
  axiom: { shape: "cube", palette: "synthwave", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
  lumen: { shape: "dna", palette: "gold", wave: "ocean", speed: 0.8, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1200 },
  mentor: { shape: "torus", palette: "matrix", wave: "ocean", speed: 1.2, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 800 },
  nucleo: { shape: "blackhole", palette: "antigravity", wave: "none", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1500 }
};

const MODULES = [
  { id: "scribe", name: "SCRIBE (Proyectos y Lógica)" },
  { id: "axiom", name: "AXIOM (Simulador de Exámenes)" },
  { id: "lumen", name: "LUMEN (Generador Docente)" },
  { id: "mentor", name: "MENTOR (Tutoría y Feedback)" },
  { id: "nucleo", name: "NŪCLEO (Hub Padre)" },
];

const SHAPES = [
  { id: "sphere", name: "Esfera Neuronal" },
  { id: "torus", name: "Toroide Cuántico (Anillo)" },
  { id: "rings", name: "Anillos de Saturno" },
  { id: "dna", name: "Doble Hélice Celular" },
  { id: "cube", name: "Tesseract (Cubo)" },
  { id: "blackhole", name: "Agujero Negro" }
];

const PALETTES = [
  { id: "antigravity", name: "Antigravity (Cyan/Azul)" },
  { id: "plasma", name: "Plasma (Naranja/Rojo)" },
  { id: "matrix", name: "Matrix (Esmeralda)" },
  { id: "monochrome", name: "Platino (Gris)" },
  { id: "gold", name: "Oro Cyber (Ámbar)" },
  { id: "synthwave", name: "Synthwave (Violeta/Fucsia)" },
  { id: "blood", name: "Crimson (Rojo Profundo)" },
  { id: "toxic", name: "Tóxico (Lima)" }
];

const WAVES = [
  { id: "magnetic", name: "Desintegración Magnética" },
  { id: "ocean", name: "Océano Constante" },
  { id: "none", name: "Masa Pesada (Inercia)" }
];

export default function UIConfigPage() {
  const [targetModule, setTargetModule] = useState("scribe");
  const [config, setConfig] = useState(DEFAULT_CONFIGS["scribe"]);
  
  // Estados para UX
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar configuración cuando cambia el módulo
  useEffect(() => {
    const storageKey = `ui_particle_config_${targetModule}`;
    const stored = localStorage.getItem(storageKey);
    let loadedConfig = DEFAULT_CONFIGS[targetModule];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        loadedConfig = { ...loadedConfig, ...parsed };
      } catch (e) {}
    }
    
    setConfig(loadedConfig);
    setHasChanges(false);
    
    // Al cambiar de módulo, previsualizamos inmediatamente su configuración guardada
    window.dispatchEvent(new CustomEvent("ui_particle_preview", { detail: loadedConfig }));
  }, [targetModule]);

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setHasChanges(true);
    setSaved(false);
    
    // LIVE PREVIEW: Emitimos el borrador a la Esfera sin guardarlo en disco
    window.dispatchEvent(new CustomEvent("ui_particle_preview", { detail: newConfig }));
  };

  const handleSave = () => {
    const storageKey = `ui_particle_config_${targetModule}`;
    localStorage.setItem(storageKey, JSON.stringify(config));
    
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    // Confirmamos la actualización permanente
    window.dispatchEvent(new Event("ui_particle_update"));
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Centro de Comando UI</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Esculpe en vivo la apariencia de la inteligencia artificial. Los cambios se previsualizan instantáneamente en el fondo.
        </p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-8 relative z-10">
        
        {/* Selector Madre */}
        <div>
          <label className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider">
            Módulo a Configurar
          </label>
          <select 
            value={targetModule}
            onChange={(e) => setTargetModule(e.target.value)}
            className="w-full bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-gray-900 dark:text-white rounded-xl p-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {MODULES.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-200 dark:border-slate-800/50" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Arquitectura Geométrica */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Patrón Geométrico
            </label>
            <select 
              value={config.shape}
              onChange={(e) => handleChange("shape", e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all"
            >
              {SHAPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Esquema de Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Esquema de Color
            </label>
            <select 
              value={config.palette}
              onChange={(e) => handleChange("palette", e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all"
            >
              {PALETTES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Efecto de Ola */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Comportamiento Físico
            </label>
            <select 
              value={config.wave}
              onChange={(e) => handleChange("wave", e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-all"
            >
              {WAVES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800/50" />

        {/* Deslizadores Físicos */}
        <div className="flex flex-col gap-6">
          {/* Velocidad de Mutación */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Velocidad de Mutación</label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">{config.speed.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.1" max="3.0" step="0.1" value={config.speed} onChange={(e) => handleChange("speed", parseFloat(e.target.value))} className="w-full accent-indigo-500" />
          </div>

          {/* Tamaño del Enjambre */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Radio del Patrón (Escala)</label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">{config.swarmSize.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.3" max="2.0" step="0.1" value={config.swarmSize} onChange={(e) => handleChange("swarmSize", parseFloat(e.target.value))} className="w-full accent-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Grosor de Partículas */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-semibold text-gray-900 dark:text-white">Grosor (Ancho)</label>
              </div>
              <input type="range" min="0.2" max="3.0" step="0.1" value={config.particleSize} onChange={(e) => handleChange("particleSize", parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            {/* Largo de Partículas */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-semibold text-gray-900 dark:text-white">Estela (Largo)</label>
              </div>
              <input type="range" min="0.2" max="4.0" step="0.1" value={config.particleLength} onChange={(e) => handleChange("particleLength", parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          {/* Densidad de Partículas */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Volumen de Nodos (Densidad)</label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">{config.density} uds.</span>
            </div>
            <input type="range" min="100" max="2500" step="50" value={config.density} onChange={(e) => handleChange("density", parseInt(e.target.value))} className="w-full accent-indigo-500" />
          </div>
        </div>
        
        {/* ACTION BAR (Guardar Cambios) */}
        <div className="mt-4 pt-6 border-t border-gray-200 dark:border-slate-800/50 flex items-center justify-between">
          <div className="text-sm">
            {saved ? (
              <span className="text-emerald-500 font-bold flex items-center gap-2">
                ✓ Guardado con éxito
              </span>
            ) : hasChanges ? (
              <span className="text-amber-500 font-medium">
                Tienes cambios sin guardar...
              </span>
            ) : (
              <span className="text-gray-400 dark:text-slate-500">
                Todo está actualizado
              </span>
            )}
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!hasChanges && !saved}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${
              hasChanges 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5" 
                : saved 
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            💾 {saved ? "Guardado" : "Guardar Configuración"}
          </button>
        </div>

      </div>
    </div>
  );
}
