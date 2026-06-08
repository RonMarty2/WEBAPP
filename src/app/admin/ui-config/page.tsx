"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ParticleSphere from "@/components/ParticleSphere";

type ParticleConfig = {
  shape: string;
  palette: string;
  wave: string;
  speed: number;
  particleSize: number;
  particleLength: number;
  swarmSize: number;
  density: number;
};

const DEFAULT_CONFIGS: Record<string, ParticleConfig> = {
  scribe: { shape: "sphere", palette: "antigravity", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
  axiom: { shape: "cube", palette: "synthwave", wave: "magnetic", speed: 1.0, particleSize: 1.0, particleLength: 1.0, swarmSize: 1.0, density: 1000 },
  admin: { shape: "blackhole", palette: "plasma", wave: "magnetic", speed: 0.8, particleSize: 1.2, particleLength: 1.5, swarmSize: 1.1, density: 1800 }
};

const MODULES = [
  { id: "admin",  name: "⚡ ADMIN (Panel de Administrador)" },
  { id: "scribe", name: "📝 SCRIBE (Proyectos y Lógica)" },
  { id: "axiom",  name: "📊 AXIOM (Simulador de Exámenes)" },
];

const SHAPES = [
  { id: "sphere", name: "Esfera Neuronal" },
  { id: "torus", name: "Toroide Cuántico (Anillo)" },
  { id: "rings", name: "Anillos de Saturno" },
  { id: "dna", name: "Doble Hélice Celular" },
  { id: "cube", name: "Tesseract (Cubo)" },
  { id: "blackhole", name: "Agujero Negro" },
  { id: "neural", name: "Red Neuronal (Clusters)" }
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
      } catch {}
    }

    setConfig(loadedConfig);
    setHasChanges(false);

    // Ya no emitimos evento global para previsualizar.
    // El background global no se altera.
  }, [targetModule]);

  const handleChange = <K extends keyof ParticleConfig>(key: K, value: ParticleConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setHasChanges(true);
    setSaved(false);
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
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 120px)" }}>
      {/* Viewfinder Centrado Globalmente (fondo libre) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <div style={{ width: "min(90vw, 500px)", height: "min(90vw, 500px)", border: "1px dashed rgba(0,0,0,0.3)", borderRadius: "50%", position: "relative", overflow: "hidden" }}>
          {/* Esfera Aislada Local */}
          <ParticleSphere isPreview={true} previewConfig={config} />
          
          {/* Adornos del Visor */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black z-10" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black z-10" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black z-10" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black z-10" />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 adm-label">
            {"// visor_de_esfera (live)"}
          </div>
        </div>
      </div>

      <AdminShell 
        title="Centro de Comando UI" 
        code="UI_CFG — motor de partículas" 
        subtitle="Esculpe en vivo la apariencia de la inteligencia artificial."
      >
        {/* Panel de Configuración (Estrecho a la izquierda) */}
        <div className="adm-card flex flex-col gap-5 relative z-10 p-5 mt-4" style={{ background: "rgba(255,255,255,0.95)", width: "100%", maxWidth: "340px", backdropFilter: "blur(10px)" }}>
          
          {/* Selector Madre */}
          <div>
            <label className="adm-label mb-1 block">{"// módulo_objetivo"}</label>
            <select
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value)}
              className="adm-select w-full"
              style={{ fontWeight: 700 }}
              aria-label="Módulo objetivo"
            >
              {MODULES.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: "1px dashed #e5e7eb" }} />

          <div className="flex flex-col gap-4">
            <div>
              <label className="adm-label mb-1 block">{"// patrón_geométrico"}</label>
              <select value={config.shape} onChange={(e) => handleChange("shape", e.target.value)} className="adm-select w-full" aria-label="Patrón geométrico">
                {SHAPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="adm-label mb-1 block">{"// paleta_color"}</label>
              <select value={config.palette} onChange={(e) => handleChange("palette", e.target.value)} className="adm-select w-full" aria-label="Paleta de color">
                {PALETTES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="adm-label mb-1 block">{"// comportamiento_físico"}</label>
              <select value={config.wave} onChange={(e) => handleChange("wave", e.target.value)} className="adm-select w-full" aria-label="Comportamiento físico">
                {WAVES.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #e5e7eb" }} />

          {/* Deslizadores Físicos */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="adm-label">{"// velocidad"}</label>
                <span className="adm-muted">[{config.speed.toFixed(1)}x]</span>
              </div>
              <input type="range" min="0.1" max="3.0" step="0.1" value={config.speed} onChange={(e) => handleChange("speed", parseFloat(e.target.value))} className="w-full accent-black" aria-label="Velocidad" />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="adm-label">{"// escala"}</label>
                <span className="adm-muted">[{config.swarmSize.toFixed(1)}x]</span>
              </div>
              <input type="range" min="0.3" max="2.0" step="0.1" value={config.swarmSize} onChange={(e) => handleChange("swarmSize", parseFloat(e.target.value))} className="w-full accent-black" aria-label="Escala" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label block mb-1">{"// grosor"}</label>
                <input type="range" min="0.2" max="3.0" step="0.1" value={config.particleSize} onChange={(e) => handleChange("particleSize", parseFloat(e.target.value))} className="w-full accent-black" aria-label="Grosor" />
              </div>
              <div>
                <label className="adm-label block mb-1">{"// estela"}</label>
                <input type="range" min="0.2" max="4.0" step="0.1" value={config.particleLength} onChange={(e) => handleChange("particleLength", parseFloat(e.target.value))} className="w-full accent-black" aria-label="Estela" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="adm-label">{"// densidad"}</label>
                <span className="adm-muted">[{config.density} uds]</span>
              </div>
              <input type="range" min="100" max="2500" step="50" value={config.density} onChange={(e) => handleChange("density", parseInt(e.target.value))} className="w-full accent-black" aria-label="Densidad" />
            </div>
          </div>
          
          {/* ACTION BAR */}
          <div className="mt-2 pt-3 flex flex-col gap-3" style={{ borderTop: "1px solid #e5e7eb" }}>
            <div className="text-xs font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {saved ? (
                <span style={{ color: "#000" }}>[OK] Guardado</span>
              ) : hasChanges ? (
                <span style={{ color: "#f59e0b" }}>[MOD] Cambios pendientes</span>
              ) : (
                <span className="adm-muted">[SYNC] Actualizado</span>
              )}
            </div>
            
            <button 
              onClick={handleSave}
              disabled={!hasChanges && !saved}
              className="adm-btn adm-btn-primary w-full"
            >
              {saved ? "GUARDADO" : "[+] GUARDAR_CFG"}
            </button>
          </div>
        </div>
      </AdminShell>
    </div>
  );
}
