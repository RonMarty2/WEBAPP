"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_UNIVERSITIES, SECTION_STEPS } from "@/lib/data";

const PLANS = [
  {
    id: "demo",
    name: "Demo",
    price: "Gratis",
    credits: 10,
    color: "badge-amber",
    features: ["10 generaciones", "Modelo básico", "1 documento activo"],
  },
  {
    id: "standard",
    name: "Estándar",
    price: "Bs. 150/mes",
    credits: 100,
    color: "badge-cyan",
    features: ["100 generaciones/mes", "Modelo avanzado", "5 documentos", "Exportar PDF"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Bs. 300/mes",
    credits: -1,
    color: "badge-purple",
    features: ["Ilimitado", "Mejor modelo", "Sin límites", "PDF + LaTeX"],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"plan" | "setup" | "ready">("plan");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedModality, setSelectedModality] = useState("");
  const [universities, setUniversities] = useState(DEFAULT_UNIVERSITIES);
  const [programa, setPrograma] = useState("");
  const [modulos, setModulos] = useState("");
  const [interes, setInteres] = useState("");

  useEffect(() => {
    fetch("/api/admin/universities")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUniversities(data))
      .catch(() => {});
  }, []);

  const selectedUniv = universities.find((u) => u.id === selectedUniversity);

  const handleStart = () => {
    if (!programa || !modulos) {
      alert("Por favor, completa el Programa Académico y las Materias Cursadas.");
      return;
    }
    const params = new URLSearchParams({
      plan: selectedPlan,
      university: selectedUniversity,
      universityName: selectedUniv?.name || "",
      modality: selectedModality,
      programa,
      modulos,
      interes,
    });
    router.push(`/laboratorio?${params.toString()}`);
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(6,182,212,0.15)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#e2e8f0" }}>Laboratorio</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#06b6d4" }}>Académico</span>
          </div>
          <button className="btn-ghost" onClick={() => router.push("/admin/login")} style={{ fontSize: 13 }}>
            Panel Admin →
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
        {step === "plan" && (
          <div className="fade-in">
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="badge badge-cyan" style={{ marginBottom: 16, fontSize: 12 }}>
                ✨ Plataforma Académica con IA
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
                Tu{" "}
                <span style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Perfil de Investigación
                </span>
                <br />
                en minutos, no en semanas
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 18, maxWidth: 560, margin: "0 auto 32px" }}>
                Genera tu tesis, monografía o proyecto de grado paso a paso, con IA y cumpliendo los lineamientos de tu universidad.
              </p>

              {/* Steps preview */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 48 }}>
                {SECTION_STEPS.map((s, i) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
                      borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#94a3b8",
                      display: "flex", alignItems: "center", gap: 5
                    }}>
                      <span>{s.icon}</span> {s.label}
                    </div>
                    {i < SECTION_STEPS.length - 1 && <span style={{ color: "#334155" }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Plans */}
            <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>
              Elige tu Plan
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="card card-hover"
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    border: selectedPlan === plan.id ? "2px solid #06b6d4" : undefined,
                    boxShadow: selectedPlan === plan.id ? "0 0 30px rgba(6,182,212,0.2)" : undefined,
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  {plan.id === "standard" && (
                    <div style={{ position: "absolute", top: -12, right: 20 }}>
                      <span className="badge badge-cyan">⭐ Popular</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>{plan.name}</span>
                    <span className={`badge ${plan.color}`}>{plan.id === "demo" ? "Free" : plan.id}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#06b6d4", marginBottom: 16 }}>
                    {plan.price}
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", gap: 8, color: "#94a3b8", fontSize: 14 }}>
                        <span style={{ color: "#4ade80" }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                className="btn-cyan"
                disabled={!selectedPlan}
                onClick={() => setStep("setup")}
                style={{ padding: "14px 40px", fontSize: 16 }}
              >
                Continuar con Plan {PLANS.find((p) => p.id === selectedPlan)?.name || ""} →
              </button>
            </div>
          </div>
        )}

        {step === "setup" && (
          <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
            <button className="btn-ghost" onClick={() => setStep("plan")} style={{ marginBottom: 32, fontSize: 13 }}>
              ← Cambiar Plan
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏫</div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Configura tu Investigación</h2>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Plan seleccionado: <span style={{ color: "#06b6d4" }}>{PLANS.find((p) => p.id === selectedPlan)?.name}</span></p>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* University */}
              <div>
                <label className="label">Universidad</label>
                <select
                  className="input-dark"
                  value={selectedUniversity}
                  onChange={(e) => { setSelectedUniversity(e.target.value); setSelectedModality(""); }}
                >
                  <option value="">Selecciona tu universidad...</option>
                  {universities.filter((u) => u.is_active).map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Modality */}
              {selectedUniv && (
                <div className="fade-in">
                  <label className="label">Modalidad de Graduación</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                    {selectedUniv.modalities.map((m) => (
                      <div
                        key={m}
                        onClick={() => setSelectedModality(m)}
                        className="card card-hover"
                        style={{
                          padding: "12px 16px",
                          border: selectedModality === m ? "2px solid #06b6d4" : undefined,
                          fontSize: 14, fontWeight: 500, cursor: "pointer",
                        }}
                      >
                        {selectedModality === m ? "✓ " : ""}{m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr style={{ borderColor: "#1e293b" }} />

              {/* Academic info */}
              <div>
                <label className="label">Programa Académico *</label>
                <input
                  className="input-dark"
                  placeholder="Ej: Diplomado en Gestión Financiera, Maestría en Derecho..."
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Módulos o Materias Cursadas *</label>
                <textarea
                  className="input-dark"
                  placeholder="Ej: Econometría Aplicada, Finanzas Corporativas, Análisis Estadístico..."
                  rows={3}
                  value={modulos}
                  onChange={(e) => setModulos(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">¿Qué te apasiona o en qué trabajas? <span style={{ color: "#475569", fontWeight: 400 }}>(Opcional)</span></label>
                <input
                  className="input-dark"
                  placeholder="Ej: trabajo en un banco, me interesan las startups, o simplemente deja vacío para sorprenderte"
                  value={interes}
                  onChange={(e) => setInteres(e.target.value)}
                />
              </div>

              {selectedUniv && (
                <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, padding: 16, fontSize: 13, color: "#94a3b8" }}>
                  <div style={{ color: "#06b6d4", fontWeight: 600, marginBottom: 8 }}>📋 Formato: {selectedUniv.name}</div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <span>Fuente: {selectedUniv.format.font} {selectedUniv.format.size}pt</span>
                    <span>Interlineado: {selectedUniv.format.lineHeight}</span>
                    <span>Márgenes: {selectedUniv.format.margins.top}/{selectedUniv.format.margins.left}/{selectedUniv.format.margins.bottom}/{selectedUniv.format.margins.right} cm</span>
                  </div>
                </div>
              )}

              <button
                className="btn-cyan"
                onClick={handleStart}
                disabled={!selectedUniversity || !selectedModality || !programa || !modulos}
                style={{ padding: "14px 28px", fontSize: 15, width: "100%", justifyContent: "center" }}
              >
                🚀 Iniciar Laboratorio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}