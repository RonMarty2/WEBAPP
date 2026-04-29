"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "inicio"
  | "generando0" | "propuestas"
  | "form1" | "generando1" | "cap1"
  | "generando2" | "cap2"
  | "generando3" | "cap3"
  | "final";

interface Propuesta {
  numero: number;
  titulo: string;
  problema_central: string;
  pregunta_investigacion: string;
  objetivo_general: string;
  fuentes_datos: string[];
  periodo_temporal?: string;
  requiere_entrevistas: boolean;
  viabilidad: string;
}

const STORAGE_KEY = "mono_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MonografiaPage() {
  // Session
  const [monografiaId, setMonografiaId] = useState("");
  const [phase, setPhase] = useState<Phase>("inicio");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Outputs per stage
  const [texto0, setTexto0] = useState("");
  const [texto1, setTexto1] = useState("");
  const [texto2, setTexto2] = useState("");
  const [texto3, setTexto3] = useState("");
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [propuestaElegida, setPropuestaElegida] = useState<Propuesta | null>(null);

  // ── Setup form ──
  const [diplomado, setDiplomado] = useState("");
  const [temas, setTemas] = useState("");
  const [interes, setInteres] = useState("");
  const [contexto, setContexto] = useState("Bolivia");
  const [trabajasEn, setTrabajasEn] = useState("");

  // ── Etapa 1 inputs ──
  const [antecedentes, setAntecedentes] = useState("");
  const [literatura, setLiteratura] = useState("");
  const [causas, setCausas] = useState("");
  const [efectos, setEfectos] = useState("");
  const [situacion, setSituacion] = useState("");
  const [objetivosEsp, setObjetivosEsp] = useState("");
  const [justTeorica, setJustTeorica] = useState("");
  const [justPractica, setJustPractica] = useState("");
  const [justSocial, setJustSocial] = useState("");
  const [alcanceTemporal, setAlcanceTemporal] = useState("");
  const [alcanceGeo, setAlcanceGeo] = useState("");
  const [limitaciones, setLimitaciones] = useState("");
  const [tipoInvestigacion, setTipoInvestigacion] = useState("cuantitativa");
  const [tieneHipotesis, setTieneHipotesis] = useState(false);

  // ── Etapa 2 inputs ──
  const [documentoPegado, setDocumentoPegado] = useState("");
  const [cantEstudios, setCantEstudios] = useState("5");

  // ── Etapa 3 inputs ──
  const [fuentesDatos, setFuentesDatos] = useState("");
  const [observaciones3, setObservaciones3] = useState("");

  // Restore session from localStorage
  useEffect(() => {
    const s = loadSession();
    if (s?.monografiaId) {
      setMonografiaId(s.monografiaId);
      setPhase(s.phase ?? "propuestas");
      if (s.texto0) setTexto0(s.texto0);
      if (s.texto1) setTexto1(s.texto1);
      if (s.texto2) setTexto2(s.texto2);
      if (s.texto3) setTexto3(s.texto3);
      if (s.propuestaElegida) setPropuestaElegida(s.propuestaElegida);
      if (s.setupData) {
        setDiplomado(s.setupData.diplomado ?? "");
        setTemas(s.setupData.temas ?? "");
        setInteres(s.setupData.interes ?? "");
        setContexto(s.setupData.contexto ?? "Bolivia");
        setTrabajasEn(s.setupData.trabajasEn ?? "");
      }
    }
  }, []);

  const saveSession = useCallback((updates: Record<string, unknown>) => {
    const prev = loadSession() ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...updates }));
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function splitLines(text: string) {
    return text.split("\n").map(l => l.trim()).filter(Boolean);
  }

  function parseLiteratura(text: string) {
    return splitLines(text).map((line, i) => {
      const m = line.match(/^(.+?)\s*\((\d{4})\)[.,]?\s*"?(.+?)"?[.,]?\s*(.+)$/);
      return {
        autor: m?.[1]?.trim() ?? `Autor ${i + 1}`,
        ano: parseInt(m?.[2] ?? "2023", 10),
        titulo: m?.[3]?.trim() ?? line.slice(0, 60),
        tipo: "libro" as const,
        metodo: "revisión documental",
        conclusion: m?.[4]?.trim() ?? "Ver referencia",
      };
    });
  }

  // ── API calls ────────────────────────────────────────────────────────────

  async function crearMonografia() {
    if (!diplomado || !interes || !contexto) {
      setError("Completa: Diplomado, Área de interés y País/Región.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/monografias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: `user_${Date.now()}`,
          diplomado,
          temas_abordados: splitLines(temas),
          area_interes: interes,
          contexto_geografico: contexto,
          trabajas_en: trabajasEn || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = data.monografia.id;
      setMonografiaId(id);
      saveSession({ monografiaId: id, phase: "generando0", setupData: { diplomado, temas, interes, contexto, trabajasEn } });
      setPhase("generando0");
      await generarEtapa(0, id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function generarEtapa(etapa: number, idOverride?: string) {
    const mid = idOverride ?? monografiaId;
    setIsLoading(true);
    setError("");

    let body: Record<string, unknown> = { monografia_id: mid };

    if (etapa === 1) {
      body.inputs = {
        antecedentes_problema: antecedentes,
        literatura_relevante: parseLiteratura(literatura),
        causas_raiz: splitLines(causas),
        efectos_proyectados: splitLines(efectos),
        situacion_controlada: situacion,
        objetivos_especificos: splitLines(objetivosEsp),
        justificacion_teorica: justTeorica,
        justificacion_practica: justPractica,
        justificacion_social: justSocial,
        alcance_temporal: alcanceTemporal,
        alcance_geografico: alcanceGeo,
        limitaciones: splitLines(limitaciones),
        tipo_investigacion: tipoInvestigacion,
        tiene_hipotesis: tieneHipotesis,
      };
    } else if (etapa === 2) {
      const extras: Record<string, unknown> = { estudios_relacionados_cantidad: parseInt(cantEstudios, 10) };
      if (documentoPegado.trim()) {
        extras.documentos_usuario = [{
          nombre: "documento_usuario.txt",
          contenido_extraido: documentoPegado,
          tipo: "txt",
        }];
      }
      body.inputs = extras;
    } else if (etapa === 3) {
      body.inputs = {
        fuentes_datos: splitLines(fuentesDatos),
        observaciones_adicionales: observaciones3 || undefined,
      };
    }

    try {
      const res = await fetch(`/api/etapas/${etapa}/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const texto: string = data.texto ?? "";

      if (etapa === 0) {
        setTexto0(texto);
        const props: Propuesta[] = data.output_json?.propuestas ?? [];
        setPropuestas(props);
        setPhase("propuestas");
        saveSession({ phase: "propuestas", texto0: texto });
      } else if (etapa === 1) {
        setTexto1(texto);
        setPhase("cap1");
        saveSession({ phase: "cap1", texto1: texto });
      } else if (etapa === 2) {
        setTexto2(texto);
        setPhase("cap2");
        saveSession({ phase: "cap2", texto2: texto });
      } else if (etapa === 3) {
        setTexto3(texto);
        setPhase("cap3");
        saveSession({ phase: "cap3", texto3: texto });
      }
    } catch (e) {
      setError((e as Error).message);
      // Revert phase to allow retry
      const revert: Record<number, Phase> = { 0: "inicio", 1: "form1", 2: "cap1", 3: "cap2" };
      setPhase(revert[etapa] ?? "inicio");
    } finally {
      setIsLoading(false);
    }
  }

  function elegirPropuesta(p: Propuesta) {
    setPropuestaElegida(p);
    saveSession({ propuestaElegida: p });
    setPhase("form1");
    saveSession({ phase: "form1" });
    // Pre-fill some fields
    setAlcanceTemporal(p.periodo_temporal ?? "2020-2024");
    setAlcanceGeo(contexto);
    setFuentesDatos((p.fuentes_datos ?? []).join("\n"));
  }

  async function compilarLatex() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/compilar/${monografiaId}?formato=latex`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "monografia.tex";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function reiniciar() {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("inicio");
    setMonografiaId("");
    setTexto0(""); setTexto1(""); setTexto2(""); setTexto3("");
    setPropuestas([]); setPropuestaElegida(null);
    setError("");
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const PASOS = [
    { label: "Inicio", phases: ["inicio", "generando0", "propuestas"] },
    { label: "Capítulo I", phases: ["form1", "generando1", "cap1"] },
    { label: "Capítulo II", phases: ["generando2", "cap2"] },
    { label: "Caps. III-V", phases: ["generando3", "cap3"] },
    { label: "Descarga", phases: ["final"] },
  ];

  const pasoActual = PASOS.findIndex(p => p.phases.includes(phase));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#f8fafc" }}>📄 Generador de Monografía</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>Sistema v2.1 — Anti-alucinación · APA 7 · LaTeX</p>
        </div>
        {monografiaId && (
          <button onClick={reiniciar} style={{ background: "transparent", border: "1px solid #475569", color: "#94a3b8", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
            ↩ Nueva monografía
          </button>
        )}
      </div>

      {/* Progress */}
      {phase !== "inicio" && (
        <div style={{ padding: "12px 24px", background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", gap: "0", maxWidth: "700px" }}>
            {PASOS.map((p, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < pasoActual ? "#22c55e" : i === pasoActual ? "#6366f1" : "#334155",
                  color: "#fff", fontSize: "12px", fontWeight: 700, zIndex: 1
                }}>
                  {i < pasoActual ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "10px", color: i === pasoActual ? "#a5b4fc" : "#64748b", marginTop: "4px", textAlign: "center" }}>{p.label}</span>
                {i < PASOS.length - 1 && (
                  <div style={{ position: "absolute", marginTop: "14px", marginLeft: "80px", height: "2px", width: "calc(100%/5 - 28px)", background: i < pasoActual ? "#22c55e" : "#334155" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Error */}
        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #dc2626", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ background: "#1e293b", border: "1px solid #4f46e5", borderRadius: "8px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤖</div>
            <p style={{ color: "#a5b4fc", fontWeight: 600, margin: "0 0 8px" }}>Generando con IA...</p>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Esto puede tardar 30-60 segundos. No cierres la página.</p>
          </div>
        )}

        {/* ── INICIO ─────────────────────────────────────────────────────── */}
        {phase === "inicio" && !isLoading && (
          <div>
            <h2 style={{ fontSize: "24px", color: "#f1f5f9", marginBottom: "8px" }}>¡Hola! Comencemos tu monografía</h2>
            <p style={{ color: "#94a3b8", marginBottom: "28px" }}>Responde 5 preguntas simples y la IA generará tu documento completo paso a paso.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>1. ¿Qué diplomado o carrera estás cursando?</label>
                <input value={diplomado} onChange={e => setDiplomado(e.target.value)} placeholder="Ej: Diplomado en Gestión Empresarial y Finanzas" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>2. ¿Qué temas abordaron en el programa? (uno por línea)</label>
                <textarea value={temas} onChange={e => setTemas(e.target.value)} rows={4} placeholder={"Finanzas corporativas\nMarketing digital\nGestión de proyectos"} style={textareaStyle} />
              </div>

              <div>
                <label style={labelStyle}>3. ¿Cuál es tu área o sector de interés?</label>
                <textarea value={interes} onChange={e => setInteres(e.target.value)} rows={3} placeholder="Ej: El sector bancario boliviano, específicamente microcréditos para emprendedores rurales" style={textareaStyle} />
              </div>

              <div>
                <label style={labelStyle}>4. ¿País o región donde realizarás el estudio?</label>
                <input value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Bolivia" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>5. ¿Trabajas actualmente en alguna empresa o institución? (opcional)</label>
                <input value={trabajasEn} onChange={e => setTrabajasEn(e.target.value)} placeholder="Ej: Banco BISA, empresa minera, institución pública, etc." style={inputStyle} />
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Si trabajas en el sector, puedes proponer temas con datos internos.</p>
              </div>

              <button onClick={crearMonografia} disabled={isLoading} style={btnPrimaryStyle}>
                🚀 Iniciar — Generar propuestas de tema
              </button>
            </div>
          </div>
        )}

        {/* ── PROPUESTAS ──────────────────────────────────────────────────── */}
        {(phase === "propuestas" || phase === "generando0") && !isLoading && (
          <div>
            <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "4px" }}>Etapa 0 — Propuestas de Tema</h2>
            <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px" }}>La IA generó 3 opciones viables con datos secundarios públicos. Elige la que más te interese.</p>

            {propuestas.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {propuestas.map((p, i) => (
                  <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{ background: "#312e81", color: "#a5b4fc", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>Opción {p.numero}</span>
                      <span style={{ color: p.viabilidad === "ALTA" ? "#22c55e" : "#f59e0b", fontSize: "13px", fontWeight: 600 }}>
                        {p.viabilidad === "ALTA" ? "✅ Alta viabilidad" : "⚠️ Viabilidad media"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "16px", color: "#e2e8f0", marginBottom: "8px" }}>{p.titulo}</h3>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
                      <strong style={{ color: "#cbd5e1" }}>Pregunta:</strong> {p.pregunta_investigacion}
                    </p>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
                      <strong style={{ color: "#cbd5e1" }}>Objetivo:</strong> {p.objetivo_general}
                    </p>
                    {p.fuentes_datos?.length > 0 && (
                      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                        📊 Fuentes: {p.fuentes_datos.join(" · ")}
                      </p>
                    )}
                    <button onClick={() => elegirPropuesta(p)} style={btnSuccessStyle}>
                      ✓ Elegir este tema → Generar Capítulo I
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#1e293b", borderRadius: "8px", padding: "20px" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>La IA devolvió el texto completo. Lee las propuestas y elige una:</p>
                <div style={{ background: "#0f172a", borderRadius: "6px", padding: "16px", whiteSpace: "pre-wrap", fontSize: "13px", color: "#cbd5e1", maxHeight: "400px", overflowY: "auto", lineHeight: 1.7 }}>
                  {texto0}
                </div>
                <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => elegirPropuesta({ numero: n, titulo: `Opción ${n}`, problema_central: "", pregunta_investigacion: "", objetivo_general: "", fuentes_datos: [], requiere_entrevistas: false, viabilidad: "ALTA" })} style={btnSuccessStyle}>
                      Elegir Opción {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FORMULARIO ETAPA 1 ──────────────────────────────────────────── */}
        {phase === "form1" && !isLoading && (
          <div>
            <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "4px" }}>Etapa 1 — Datos para el Capítulo I</h2>
            {propuestaElegida && (
              <div style={{ background: "#1e3a1e", border: "1px solid #166534", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#86efac" }}>✓ Tema elegido: <strong>{propuestaElegida.titulo}</strong></p>
              </div>
            )}
            <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>Completa los siguientes datos. La IA usará exactamente esta información para generar el Capítulo I sin inventar nada.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <Field label="Antecedentes del problema (2-3 párrafos de contexto histórico del tema)"
                value={antecedentes} onChange={setAntecedentes} rows={5}
                placeholder="Ej: El sector microfinanciero boliviano experimentó un crecimiento significativo desde 2010. Según el Banco Central de Bolivia (2022), las carteras de crédito de entidades de microfinanzas crecieron un 12% anual..." />

              <Field label="Referencias bibliográficas — MÍNIMO 5 (una por línea, formato: Autor (Año). Título. Método. Conclusión)"
                value={literatura} onChange={setLiteratura} rows={7}
                placeholder={"García, Juan (2022). Microfinanzas en Bolivia. Descriptivo. Las tasas de morosidad aumentaron post-COVID.\nLópez, María (2021). Crédito informal en áreas rurales. Revisión bibliográfica. El acceso al crédito formal es del 35% en zonas rurales.\nPérez, Carlos (2020). Regulación del sistema financiero. Análisis normativo. La Ley 393 estableció límites de tasas."} />

              <Field label="Causas raíz del problema (una por línea)"
                value={causas} onChange={setCausas} rows={4}
                placeholder={"Alta tasa de interés en créditos formales\nFalta de educación financiera en la población\nEscasa presencia bancaria en zonas rurales"} />

              <Field label="Efectos proyectados si el problema continúa (uno por línea)"
                value={efectos} onChange={setEfectos} rows={3}
                placeholder={"Exclusión financiera de sectores vulnerables\nAumento de informalidad en el mercado crediticio"} />

              <Field label="Situación controlada — ¿cómo debería ser la situación ideal?"
                value={situacion} onChange={setSituacion} rows={2}
                placeholder="Acceso equitativo al crédito formal con tasas reguladas y educación financiera para todos los sectores." />

              <Field label="Objetivos específicos (3-4, uno por línea — empezar con verbo: Analizar, Determinar, Proponer...)"
                value={objetivosEsp} onChange={setObjetivosEsp} rows={4}
                placeholder={"Analizar la evolución de la morosidad en el sistema microfinanciero 2019-2023\nDeterminar los factores que inciden en el acceso al crédito formal\nProponer lineamientos de mejora para la inclusión financiera"} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Field label="Justificación TEÓRICA (brecha de conocimiento)" value={justTeorica} onChange={setJustTeorica} rows={3}
                  placeholder="No existen estudios post-pandemia que analicen..." />
                <Field label="Justificación PRÁCTICA (beneficio concreto)" value={justPractica} onChange={setJustPractica} rows={3}
                  placeholder="Los resultados permitirán a las entidades financieras..." />
              </div>
              <Field label="Justificación SOCIAL (impacto en la sociedad)" value={justSocial} onChange={setJustSocial} rows={2}
                placeholder="Mejorará el acceso al crédito para más de 500,000 familias..." />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Período temporal del estudio</label>
                  <input value={alcanceTemporal} onChange={e => setAlcanceTemporal(e.target.value)} placeholder="Ej: 2019-2023" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Alcance geográfico</label>
                  <input value={alcanceGeo} onChange={e => setAlcanceGeo(e.target.value)} placeholder="Ej: Bolivia — área urbana" style={inputStyle} />
                </div>
              </div>

              <Field label="Limitaciones del estudio (una por línea)" value={limitaciones} onChange={setLimitaciones} rows={3}
                placeholder={"Disponibilidad limitada de datos desagregados por región\nAcceso restringido a información confidencial de entidades"} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Tipo de investigación</label>
                  <select value={tipoInvestigacion} onChange={e => setTipoInvestigacion(e.target.value)} style={inputStyle}>
                    <option value="cuantitativa">Cuantitativa</option>
                    <option value="cualitativa">Cualitativa</option>
                    <option value="mixta">Mixta</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "28px" }}>
                  <input type="checkbox" checked={tieneHipotesis} onChange={e => setTieneHipotesis(e.target.checked)} id="hip" style={{ width: "18px", height: "18px" }} />
                  <label htmlFor="hip" style={{ ...labelStyle, margin: 0 }}>¿Incluye hipótesis?</label>
                </div>
              </div>

              <button onClick={() => { setPhase("generando1"); generarEtapa(1); }} disabled={!antecedentes || !literatura || !causas || !objetivosEsp} style={btnPrimaryStyle}>
                🤖 Generar Capítulo I completo
              </button>
              {(!antecedentes || !literatura || !causas || !objetivosEsp) && (
                <p style={{ fontSize: "12px", color: "#f59e0b", textAlign: "center", margin: "-8px 0 0" }}>* Completa al menos: Antecedentes, Referencias, Causas y Objetivos específicos.</p>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTADO CAPS 1, 2, 3 ──────────────────────────────────────── */}
        {["cap1", "cap2", "cap3"].includes(phase) && !isLoading && (
          <ResultadoEtapa
            titulo={phase === "cap1" ? "Capítulo I — Planteamiento del Problema" : phase === "cap2" ? "Capítulo II — Marco Teórico" : "Capítulos III, IV, V + Bibliografía"}
            texto={phase === "cap1" ? texto1 : phase === "cap2" ? texto2 : texto3}
            onAprobar={() => {
              if (phase === "cap1") { setPhase("generando2"); generarEtapa(2); }
              else if (phase === "cap2") { setPhase("generando3"); generarEtapa(3); }
              else { setPhase("final"); saveSession({ phase: "final" }); }
            }}
            onVolver={() => {
              if (phase === "cap1") setPhase("form1");
              else if (phase === "cap2") setPhase("cap1");
              else setPhase("cap2");
            }}
            btnLabel={phase === "cap3" ? "✅ Aprobar y compilar documento final" : "✅ Aprobar y generar siguiente capítulo"}
            extraContent={
              phase === "cap1" ? (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 8px" }}>¿Deseas agregar un documento propio para el Capítulo II? (opcional)</p>
                  <textarea value={documentoPegado} onChange={e => setDocumentoPegado(e.target.value)} rows={4} placeholder="Pega aquí el texto de cualquier documento tuyo (artículo, informe, nota de clase...)..." style={textareaStyle} />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                    <label style={{ ...labelStyle, margin: 0, fontSize: "12px" }}>Estudios relacionados a incluir:</label>
                    <select value={cantEstudios} onChange={e => setCantEstudios(e.target.value)} style={{ ...inputStyle, width: "80px" }}>
                      {[5, 6, 7, 8, 9, 10].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              ) : phase === "cap2" ? (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 8px" }}>Fuentes de datos disponibles para el análisis (opcionales, una por línea):</p>
                  <textarea value={fuentesDatos} onChange={e => setFuentesDatos(e.target.value)} rows={3} placeholder={"INE — Instituto Nacional de Estadística 2019-2023\nBCB — Banco Central de Bolivia 2020-2023\nASFI — Autoridad de Supervisión del Sistema Financiero"} style={textareaStyle} />
                  <Field label="Observaciones adicionales para la IA (opcional)" value={observaciones3} onChange={setObservaciones3} rows={2}
                    placeholder="Ej: Enfocarse en microfinanzas rurales, incluir análisis de la Ley 393..." />
                </div>
              ) : null
            }
          />
        )}

        {/* ── FINAL ───────────────────────────────────────────────────────── */}
        {phase === "final" && !isLoading && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎓</div>
              <h2 style={{ fontSize: "24px", color: "#f1f5f9", marginBottom: "8px" }}>¡Monografía completa!</h2>
              <p style={{ color: "#94a3b8" }}>Todos los capítulos fueron generados y aprobados. Descarga el archivo LaTeX.</p>
            </div>

            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "24px", marginBottom: "20px" }}>
              <h3 style={{ color: "#a5b4fc", marginBottom: "16px" }}>📥 Descargar documento</h3>
              <button onClick={compilarLatex} disabled={isLoading} style={{ ...btnPrimaryStyle, fontSize: "16px", padding: "14px 28px" }}>
                ⬇️ Descargar monografia.tex
              </button>
              <div style={{ marginTop: "20px", background: "#0f172a", borderRadius: "8px", padding: "16px" }}>
                <p style={{ color: "#f59e0b", fontWeight: 600, margin: "0 0 10px", fontSize: "14px" }}>📌 ¿Cómo convertir .tex a PDF?</p>
                <ol style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.8", margin: 0, paddingLeft: "20px" }}>
                  <li>Ve a <strong style={{ color: "#e2e8f0" }}>overleaf.com</strong> (gratis, sin instalación)</li>
                  <li>Crea un proyecto nuevo → sube el archivo .tex</li>
                  <li>Haz clic en <strong style={{ color: "#e2e8f0" }}>Compilar</strong> → descarga el PDF</li>
                  <li>Si tienes carátula, sube también tu PDF de carátula</li>
                </ol>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[{ etapa: 1, label: "📖 Ver Capítulo I", texto: texto1 }, { etapa: 2, label: "📖 Ver Capítulo II", texto: texto2 }, { etapa: 3, label: "📖 Ver Capítulos III-V", texto: texto3 }].map(({ etapa, label, texto }) => (
                <details key={etapa} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", padding: "12px" }}>
                  <summary style={{ color: "#a5b4fc", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>{label}</summary>
                  <div style={{ marginTop: "12px", whiteSpace: "pre-wrap", fontSize: "12px", color: "#94a3b8", maxHeight: "300px", overflowY: "auto", lineHeight: 1.7 }}>{texto}</div>
                </details>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, rows, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows: number; placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={textareaStyle} />
    </div>
  );
}

function ResultadoEtapa({ titulo, texto, onAprobar, onVolver, btnLabel, extraContent }: {
  titulo: string; texto: string; onAprobar: () => void; onVolver: () => void; btnLabel: string; extraContent?: React.ReactNode;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "4px" }}>{titulo}</h2>
      <p style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "13px" }}>Revisa el contenido generado. Puedes aprobarlo o volver para modificar los datos.</p>
      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "20px", whiteSpace: "pre-wrap", fontSize: "13px", color: "#cbd5e1", maxHeight: "500px", overflowY: "auto", lineHeight: 1.8, marginBottom: "16px" }}>
        {texto || "Sin contenido generado."}
      </div>
      {extraContent}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        <button onClick={onAprobar} style={btnSuccessStyle}>{btnLabel}</button>
        <button onClick={onVolver} style={{ ...btnSecondaryStyle }}>← Volver y modificar</button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155",
  borderRadius: "6px", color: "#e2e8f0", fontSize: "14px", boxSizing: "border-box"
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "system-ui, sans-serif"
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px",
  padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer", width: "100%"
};

const btnSuccessStyle: React.CSSProperties = {
  background: "#15803d", color: "#fff", border: "none", borderRadius: "8px",
  padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
};

const btnSecondaryStyle: React.CSSProperties = {
  background: "transparent", color: "#94a3b8", border: "1px solid #475569",
  borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer"
};
