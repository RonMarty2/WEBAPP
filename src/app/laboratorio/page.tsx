"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SECTION_STEPS } from "@/lib/data";

interface DocumentSections {
  [key: string]: string;
}

function LaboratorioContent() {
  const router = useRouter();
  const params = useSearchParams();

  const plan = params.get("plan") || "demo";
  const universityId = params.get("university") || "";
  const universityName = params.get("universityName") || "Universidad";
  const modality = params.get("modality") || "Tesis de Grado";
  const programa = params.get("programa") || "";
  const modulos = params.get("modulos") || "";
  const interes = params.get("interes") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [sections, setSections] = useState<DocumentSections>({});
  const [editingText, setEditingText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(plan === "demo" ? 10 : plan === "standard" ? 100 : 999);
  const [error, setError] = useState("");
  const [isSurprise, setIsSurprise] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedStep, setSavedStep] = useState(-1);

  const userId = `user-${Date.now().toString(36)}`;
  const currentSection = SECTION_STEPS[currentStep];
  const isStepSaved = savedStep >= currentStep;
  const canAdvance = sections[currentSection?.key] && sections[currentSection?.key].length > 0;

  // Load saved sections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lab_current_doc");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSections(parsed.sections || {});
        setCurrentStep(parsed.currentStep || 0);
        setSavedStep(parsed.savedStep ?? -1);
      } catch {}
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem("lab_current_doc", JSON.stringify({ sections, currentStep, savedStep }));
  }, [sections, currentStep, savedStep]);

  // Load current section text when step changes
  useEffect(() => {
    setEditingText(sections[currentSection?.key] || "");
    setError("");
  }, [currentStep]);

  const getContextPayload = () => ({
    section_key: currentSection.key,
    plan,
    userId,
    programa,
    modulos,
    interes: isSurprise ? "SORPRENDEME" : interes,
    universidad: universityName,
    modalidad: modality,
    titulo: sections.titulo || "",
    introduccion: sections.introduccion || "",
    justificacion: sections.justificacion || "",
    planteamiento: sections.planteamiento || "",
    objetivos: sections.objetivos || "",
    marco_teorico: sections.marco_teorico || "",
    metodologia: sections.metodologia || "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setEditingText("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getContextPayload()),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar. Intenta de nuevo.");
        return;
      }

      setEditingText(data.text || "");
      if (data.credits_remaining !== undefined) {
        setCredits(data.credits_remaining);
      }
    } catch {
      setError("Error de conexión. Verifica tu internet.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    setSections((prev) => ({ ...prev, [currentSection.key]: editingText }));
    setSavedStep(currentStep);
  };

  const handleNextStep = () => {
    handleSave();
    if (currentStep < SECTION_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setSavedStep(currentStep);
    }
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "cm", format: "a4" });

    doc.setFont("helvetica");
    doc.setFontSize(12);

    let yPos = 3;
    const pageWidth = 21;
    const leftMargin = 3;
    const rightMargin = 2.5;
    const lineHeight = 0.7;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    // Title page
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PERFIL DE INVESTIGACIÓN", pageWidth / 2, 5, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(universityName, pageWidth / 2, 6.5, { align: "center" });
    doc.text(modality, pageWidth / 2, 7.5, { align: "center" });

    if (sections.titulo) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(sections.titulo, maxWidth);
      doc.text(titleLines, pageWidth / 2, 10, { align: "center" });
    }

    // Sections
    SECTION_STEPS.forEach((step) => {
      if (!sections[step.key]) return;
      doc.addPage();
      yPos = 3;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(step.label.toUpperCase(), leftMargin, yPos);
      yPos += 1;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(sections[step.key], maxWidth);
      lines.forEach((line: string) => {
        if (yPos > 27) {
          doc.addPage();
          yPos = 3;
        }
        doc.text(line, leftMargin, yPos);
        yPos += lineHeight;
      });
    });

    doc.save(`perfil-investigacion-${Date.now()}.pdf`);
  };

  const totalCompleted = SECTION_STEPS.filter((s) => sections[s.key]).length;
  const progressPercent = Math.round((totalCompleted / SECTION_STEPS.length) * 100);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ padding: "24px 16px", gap: 8 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingLeft: 8 }}>
          <span style={{ fontSize: 20 }}>🧪</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#e2e8f0" }}>Laboratorio <span style={{ color: "#06b6d4" }}>Académico</span></span>
        </div>

        {/* Info */}
        <div style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#94a3b8" }}>
          <div style={{ color: "#06b6d4", fontWeight: 600, marginBottom: 4 }}>{universityName.split("(")[0]}</div>
          <div>{modality}</div>
          <div style={{ marginTop: 6, color: "#475569" }}>{programa.substring(0, 40)}{programa.length > 40 ? "..." : ""}</div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16, paddingLeft: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            <span>Progreso</span>
            <span style={{ color: "#06b6d4", fontWeight: 700 }}>{progressPercent}%</span>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 999, height: 4 }}>
            <div style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #0891b2, #06b6d4)", height: "100%", borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {SECTION_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = !!sections[step.key];
            const isLocked = index > 0 && !sections[SECTION_STEPS[index - 1].key] && !isCompleted;

            return (
              <div
                key={step.key}
                className={`step-item ${isActive ? "active" : isCompleted ? "completed" : isLocked ? "locked" : ""}`}
                onClick={() => !isLocked && setCurrentStep(index)}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0,
                  background: isCompleted ? "rgba(34,197,94,0.2)" : isActive ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
                  border: isCompleted ? "1px solid rgba(34,197,94,0.4)" : isActive ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color: isCompleted ? "#4ade80" : isActive ? "#06b6d4" : "#94a3b8",
                }}>
                  {isCompleted ? "✓" : isActive ? <span className="pulse-dot">●</span> : index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isCompleted ? "#4ade80" : isActive ? "#e2e8f0" : "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {step.icon} {step.label}
                  </div>
                  {isLocked && <div style={{ fontSize: 10, color: "#475569" }}>🔒 Completa el paso anterior</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Credits */}
        <div style={{ marginTop: 16, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "10px 12px", fontSize: 12 }}>
          <div style={{ color: "#94a3b8", marginBottom: 4 }}>Créditos disponibles</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: plan === "pro" ? "#a78bfa" : credits > 3 ? "#06b6d4" : "#f97316" }}>
            {plan === "pro" ? "∞" : credits}
          </div>
          <div className={`badge ${plan === "demo" ? "badge-amber" : plan === "pro" ? "badge-purple" : "badge-cyan"}`} style={{ marginTop: 6, fontSize: 10 }}>
            Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </div>
        </div>

        <button className="btn-ghost" onClick={() => router.push("/")} style={{ marginTop: 12, width: "100%", fontSize: 12 }}>
          ← Volver al inicio
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>
              {currentSection?.icon} {currentSection?.label}
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>
              Paso {currentStep + 1} de {SECTION_STEPS.length}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={() => setShowPreview(!showPreview)}
              style={{ fontSize: 13 }}
            >
              {showPreview ? "✏️ Editor" : "👁 Vista Previa"}
            </button>
            {totalCompleted > 0 && (
              <button className="btn-cyan" onClick={handleExportPDF} style={{ fontSize: 13 }}>
                📄 Exportar PDF
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr", overflow: "hidden" }}>
          {/* Editor panel */}
          <div className="content-area">
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 16, marginBottom: 20, color: "#fca5a5", fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Generate controls */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>
                La IA generará la sección <strong style={{ color: "#e2e8f0" }}>{currentSection?.label}</strong> basándose en tu programa, materias {currentStep > 0 ? "y las secciones anteriores que ya completaste" : "e intereses"}.
              </div>

              {currentStep === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: "rgba(139,92,246,0.08)", borderRadius: 8, border: "1px solid rgba(139,92,246,0.2)" }}>
                  <input
                    type="checkbox"
                    id="surprise"
                    checked={isSurprise}
                    onChange={(e) => setIsSurprise(e.target.checked)}
                    style={{ accentColor: "#8b5cf6", width: 16, height: 16 }}
                  />
                  <label htmlFor="surprise" style={{ fontSize: 14, color: "#a78bfa", cursor: "pointer", fontWeight: 500 }}>
                    ✨ ¡Sorpréndeme! — La IA elige el tema más creativo e innovador
                  </label>
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn-cyan"
                  onClick={handleGenerate}
                  disabled={isGenerating || (plan !== "pro" && credits < (currentSection?.credits || 1))}
                  style={{ flex: 1, justifyContent: "center", padding: "12px 20px" }}
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner" /> Generando...
                    </>
                  ) : (
                    `⚡ Generar ${currentSection?.label}`
                  )}
                </button>
                {editingText && (
                  <button
                    className="btn-ghost"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{ fontSize: 13 }}
                  >
                    🔄 Regenerar
                  </button>
                )}
              </div>

              {plan !== "pro" && credits < (currentSection?.credits || 1) && (
                <p style={{ fontSize: 12, color: "#f97316", marginTop: 10 }}>
                  ⚠️ Créditos insuficientes para esta sección. Actualiza tu plan.
                </p>
              )}
            </div>

            {/* Text editor */}
            <div className="card" style={{ marginBottom: 24 }}>
              <label className="label">Texto generado — Edita libremente</label>
              {isGenerating ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="shimmer" style={{ height: 18, width: `${70 + (i % 3) * 10}%` }} />
                  ))}
                </div>
              ) : (
                <textarea
                  className="input-dark"
                  rows={16}
                  placeholder={`Haz clic en "Generar ${currentSection?.label}" para que la IA redacte esta sección, o escribe directamente aquí...`}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
                />
              )}
            </div>

            {/* Actions */}
            {editingText && !isGenerating && (
              <div className="fade-in" style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn-ghost"
                  onClick={handleSave}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  💾 Guardar borrador
                </button>
                {currentStep < SECTION_STEPS.length - 1 ? (
                  <button
                    className="btn-cyan"
                    onClick={handleNextStep}
                    disabled={!editingText.trim()}
                    style={{ flex: 2, justifyContent: "center", padding: "12px 20px" }}
                  >
                    Guardar y continuar → {SECTION_STEPS[currentStep + 1]?.label}
                  </button>
                ) : (
                  <button
                    className="btn-cyan"
                    onClick={() => { handleSave(); handleExportPDF(); }}
                    style={{ flex: 2, justifyContent: "center", padding: "12px 20px" }}
                  >
                    🎉 ¡Finalizar y Exportar PDF!
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Preview panel */}
          {showPreview && (
            <div style={{ borderLeft: "1px solid #1e293b", padding: 32, overflowY: "auto", background: "#080f1d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>📄 Vista Previa del Documento</h3>
                <span className="badge badge-green">{totalCompleted}/{SECTION_STEPS.length} secciones</span>
              </div>

              {/* Document preview */}
              <div style={{ background: "white", color: "#111", borderRadius: 8, padding: "40px 32px", maxWidth: 640, fontSize: 12, lineHeight: 1.8, fontFamily: "Times New Roman, serif" }}>
                <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "1px solid #ccc", paddingBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 2 }}>{universityName}</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: "#444" }}>{modality}</div>
                  {sections.titulo && (
                    <div style={{ fontSize: 14, fontWeight: "bold", marginTop: 12, lineHeight: 1.4 }}>
                      {sections.titulo.replace(/\*\*/g, "").split("\n")[0]}
                    </div>
                  )}
                </div>

                {SECTION_STEPS.map((step) =>
                  sections[step.key] ? (
                    <div key={step.key} style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: "bold", fontSize: 12, textTransform: "uppercase", marginBottom: 8, borderBottom: "1px solid #eee", paddingBottom: 4 }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, whiteSpace: "pre-wrap", textAlign: "justify", color: "#333" }}>
                        {sections[step.key].substring(0, 600)}
                        {sections[step.key].length > 600 ? "..." : ""}
                      </div>
                    </div>
                  ) : null
                )}

                {totalCompleted === 0 && (
                  <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
                    El documento aparecerá aquí conforme completes las secciones
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LaboratorioPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8" }}>Cargando laboratorio...</p>
        </div>
      </div>
    }>
      <LaboratorioContent />
    </Suspense>
  );
}
