"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "inicio"
  | "generando0" | "propuestas"
  | "form1" | "generando1" | "cap1"
  | "generando2" | "cap2"
  | "generando3" | "cap3"
  | "caratula"
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

interface ChatMsg { role: "user" | "assistant"; text: string; }

const STORAGE_KEY = "mono_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MonografiaPage() {
  const [monografiaId, setMonografiaId] = useState("");
  const [phase, setPhase] = useState<Phase>("inicio");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Salidas por etapa
  const [texto0, setTexto0] = useState("");
  const [texto1, setTexto1] = useState("");
  const [texto2, setTexto2] = useState("");
  const [texto3, setTexto3] = useState("");
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [propuestaElegida, setPropuestaElegida] = useState<Propuesta | null>(null);

  // ── Setup base ──
  const [diplomado, setDiplomado] = useState("");
  const [temas, setTemas] = useState("");
  const [interes, setInteres] = useState("");
  const [contexto, setContexto] = useState("Bolivia");
  const [trabajasEn, setTrabajasEn] = useState("");

  // ── Tiene tema propio ──
  const [hasTema, setHasTema] = useState<boolean | null>(null);
  const [temaPropio, setTemaPropio] = useState("");
  const [objPropio, setObjPropio] = useState("");
  const [preguntaPropia, setPreguntaPropia] = useState("");

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
  const [alcanceInstitucional, setAlcanceInstitucional] = useState("");
  const [limitaciones, setLimitaciones] = useState("");
  const [tipoInvestigacion, setTipoInvestigacion] = useState("cuantitativa");
  const [tieneHipotesis, setTieneHipotesis] = useState(false);
  // Subpreguntas (opcionales)
  const [subDiagnostica, setSubDiagnostica] = useState("");
  const [subTeorica, setSubTeorica] = useState("");
  const [subComparativa, setSubComparativa] = useState("");
  const [subPropositiva, setSubPropositiva] = useState("");
  const [showSubpreguntas, setShowSubpreguntas] = useState(false);
  // Hipótesis (opcionales, solo si cuantitativa + tieneHipotesis)
  const [hipotesisPrincipal, setHipotesisPrincipal] = useState("");

  // ── Etapa 2 inputs ──
  const [documentoPegado, setDocumentoPegado] = useState("");
  const [cantEstudios, setCantEstudios] = useState("5");
  const [contextoActual, setContextoActual] = useState("");

  // ── Etapa 3 inputs ──
  const [fuentesDatos, setFuentesDatos] = useState("");
  const [observaciones3, setObservaciones3] = useState("");

  // ── Carátula ──
  const [caratulaUrl, setCaratulaUrl] = useState("");
  const caratulaInputRef = useRef<HTMLInputElement>(null);

  // ── Restaurar sesión ──
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
      if (s.caratulaUrl) setCaratulaUrl(s.caratulaUrl);
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

  // ── API: Crear monografía ─────────────────────────────────────────────────

  async function crearMonografia(data: Record<string, unknown>): Promise<string> {
    const res = await fetch("/api/monografias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.monografia.id;
  }

  // ── Flujo SIN tema → etapa 0 ─────────────────────────────────────────────

  async function iniciarSinTema() {
    if (!diplomado || !interes || !contexto) {
      setError("Completa: Diplomado, Área de interés y País/Región.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const id = await crearMonografia({
        user_id: `user_${Date.now()}`,
        diplomado,
        temas_abordados: splitLines(temas),
        area_interes: interes,
        contexto_geografico: contexto,
        trabajas_en: trabajasEn || undefined,
      });
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

  // ── Flujo CON tema propio → skip etapa 0 ────────────────────────────────

  async function iniciarConTemaPropio() {
    if (!diplomado || !temaPropio.trim()) {
      setError("Completa: Diplomado y el título de tu tema.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const id = await crearMonografia({
        user_id: `user_${Date.now()}`,
        diplomado,
        temas_abordados: splitLines(temas),
        area_interes: temaPropio,
        contexto_geografico: contexto || "Bolivia",
        trabajas_en: trabajasEn || undefined,
      });
      setMonografiaId(id);

      // Guardar tema propio como cap0 sin IA
      const res = await fetch("/api/etapas/0/tema-directo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monografia_id: id,
          titulo: temaPropio,
          objetivo_general: objPropio || undefined,
          pregunta_investigacion: preguntaPropia || undefined,
          metodologia: "cuantitativa",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }

      const propuesta: Propuesta = {
        numero: 0,
        titulo: temaPropio,
        problema_central: "",
        pregunta_investigacion: preguntaPropia,
        objetivo_general: objPropio,
        fuentes_datos: [],
        requiere_entrevistas: false,
        viabilidad: "ALTA",
      };
      setPropuestaElegida(propuesta);
      setAlcanceGeo(contexto || "Bolivia");

      saveSession({
        monografiaId: id,
        phase: "form1",
        propuestaElegida: propuesta,
        setupData: { diplomado, temas, interes: temaPropio, contexto, trabajasEn },
      });
      setPhase("form1");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Generar etapa ─────────────────────────────────────────────────────────

  async function generarEtapa(etapa: number, idOverride?: string) {
    const mid = idOverride ?? monografiaId;
    setIsLoading(true);
    setError("");

    let body: Record<string, unknown> = { monografia_id: mid };

    if (etapa === 1) {
      const subpreguntasPayload = (subDiagnostica || subTeorica || subComparativa || subPropositiva)
        ? { diagnostica: subDiagnostica || undefined, teorica: subTeorica || undefined, comparativa: subComparativa || undefined, propositiva: subPropositiva || undefined }
        : undefined;

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
        alcance_institucional: alcanceInstitucional || undefined,
        limitaciones: splitLines(limitaciones),
        tipo_investigacion: tipoInvestigacion,
        tiene_hipotesis: tieneHipotesis,
        subpreguntas: subpreguntasPayload,
        hipotesis_principal: tieneHipotesis && hipotesisPrincipal ? hipotesisPrincipal : undefined,
      };
    } else if (etapa === 2) {
      const extras: Record<string, unknown> = {
        estudios_relacionados_cantidad: parseInt(cantEstudios, 10),
        contexto_actual: contextoActual.trim() || undefined,
      };
      if (documentoPegado.trim()) {
        extras.documentos_usuario = [{
          nombre: "documento_usuario.txt",
          contenido_extraido: documentoPegado,
          tipo: "txt",
          seccion_aplicable: "2.1",
        }];
      }
      body.inputs = extras;
    } else if (etapa === 3) {
      const subpregObj: Record<string, string> = {};
      if (subDiagnostica.trim()) subpregObj.diagnostica = subDiagnostica.trim();
      if (subTeorica.trim()) subpregObj.teorica = subTeorica.trim();
      if (subComparativa.trim()) subpregObj.comparativa = subComparativa.trim();
      if (subPropositiva.trim()) subpregObj.propositiva = subPropositiva.trim();

      body.inputs = {
        fuentes_datos: splitLines(fuentesDatos),
        observaciones_adicionales: observaciones3 || undefined,
        objetivo_general: propuestaElegida?.objetivo_general || undefined,
        objetivos_especificos: splitLines(objetivosEsp).length > 0 ? splitLines(objetivosEsp) : undefined,
        preguntas_investigacion: {
          central: propuestaElegida?.pregunta_investigacion || undefined,
          subpreguntas: Object.keys(subpregObj).length > 0 ? subpregObj : undefined,
        },
        hipotesis: tieneHipotesis && hipotesisPrincipal ? {
          principal: hipotesisPrincipal,
        } : undefined,
        tipo_investigacion: tipoInvestigacion || undefined,
        periodo_temporal: propuestaElegida?.periodo_temporal || alcanceTemporal || undefined,
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
    setAlcanceTemporal(p.periodo_temporal ?? "2020-2024");
    setAlcanceGeo(contexto);
    setFuentesDatos((p.fuentes_datos ?? []).join("\n"));
  }

  // ── Carátula ─────────────────────────────────────────────────────────────

  function handleCaratulaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setCaratulaUrl(url);
      saveSession({ caratulaUrl: url });
    };
    reader.readAsDataURL(file);
  }

  // ── Exportar vista previa HTML (impresión navegador) ─────────────────────

  async function exportarPDF() {
    function mdAHtml(text: string) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h2>$1</h2>")
        .replace(/^\|(.+)\|$/gm, (_, row) => {
          const cells = row.split("|").map((c: string) =>
            `<td style="border:1px solid #000;padding:4px 8px">${c.trim()}</td>`
          );
          return `<tr>${cells.join("")}</tr>`;
        })
        .replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table style="border-collapse:collapse;width:100%;margin:1em 0">$1</table>')
        .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>");
    }

    const tituloDoc = propuestaElegida?.titulo || "Monografía";

    const caratulaHtml = caratulaUrl
      ? `<div class="caratula-page"><img src="${caratulaUrl}" alt="Carátula" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>`
      : `<div class="caratula-page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;">
          <p style="font-size:11pt;color:#555;text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Monografía de Diplomado</p>
          <h1 style="font-size:18pt;font-weight:bold;line-height:1.4;margin-bottom:40px;">${tituloDoc}</h1>
          <p style="font-size:11pt;color:#888;">${new Date().toLocaleDateString("es-BO")}</p>
        </div>`;

    const caps = [
      { titulo: "CAPÍTULO I: PLANTEAMIENTO DEL PROBLEMA", texto: texto1 },
      { titulo: "CAPÍTULO II: MARCO TEÓRICO Y REFERENCIAL", texto: texto2 },
      { titulo: "CAPÍTULOS III, IV, V: METODOLOGÍA, RESULTADOS Y CONCLUSIONES", texto: texto3 },
    ];

    const capsHtml = caps
      .filter(c => c.texto)
      .map(c => `<div class="capitulo">
        <div class="cap-titulo">${c.titulo}</div>
        <div class="cap-body"><p>${mdAHtml(c.texto)}</p></div>
      </div>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${tituloDoc}</title>
<style>
  @page { size: Letter; margin: 2.54cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
  .caratula-page { page-break-after: always; height: 24cm; padding: 2cm; }
  .capitulo { page-break-before: always; padding-top: 0.5cm; }
  .cap-titulo { font-size: 13pt; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 20px; }
  .cap-body { text-align: justify; }
  p { margin-bottom: 0.8em; }
  h2, h3, h4 { font-size: 12pt; font-weight: bold; margin: 1em 0 0.4em; }
  ul { margin: 0.5em 0 0.5em 1.5em; }
  li { margin-bottom: 0.3em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 11pt; }
  td { border: 1px solid #000; padding: 4px 8px; }
</style>
</head>
<body>
  ${caratulaHtml}
  ${capsHtml}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "width=900,height=1000");
    if (w) {
      w.addEventListener("load", () => { setTimeout(() => w.print(), 400); });
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  // ── Compilar LaTeX (descarga .tex) ────────────────────────────────────────

  async function compilarLatex() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/compilar/${monografiaId}?formato=latex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caratula_pdf: caratulaUrl ? "caratula.pdf" : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] ?? "monografia.tex";
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Obtener metadata de compilación ──────────────────────────────────────

  const [compileMeta, setCompileMeta] = useState<{
    lista_para_compilar: boolean;
    checklist: Record<string, boolean>;
    total_citas: number;
    etapas_faltantes: number[];
  } | null>(null);

  useEffect(() => {
    if (phase === "final" && monografiaId) {
      fetch(`/api/compilar/${monografiaId}`)
        .then(r => r.json())
        .then(d => setCompileMeta(d))
        .catch(() => null);
    }
  }, [phase, monografiaId]);

  function reiniciar() {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("inicio");
    setMonografiaId("");
    setTexto0(""); setTexto1(""); setTexto2(""); setTexto3("");
    setPropuestas([]); setPropuestaElegida(null);
    setHasTema(null); setTemaPropio(""); setObjPropio(""); setPreguntaPropia("");
    setCaratulaUrl("");
    setError("");
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  const PASOS = [
    { label: "Inicio", phases: ["inicio", "generando0", "propuestas"] },
    { label: "Capítulo I", phases: ["form1", "generando1", "cap1"] },
    { label: "Capítulo II", phases: ["generando2", "cap2"] },
    { label: "Caps. III-V", phases: ["generando3", "cap3"] },
    { label: "Carátula", phases: ["caratula"] },
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
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#94a3b8" }}>Anti-alucinación · APA 7 · LaTeX · Chat por etapa</p>
        </div>
        {monografiaId && (
          <button onClick={reiniciar} style={btnSecondaryStyle}>
            ↩ Nueva monografía
          </button>
        )}
      </div>

      {/* Progress */}
      {phase !== "inicio" && (
        <div style={{ padding: "12px 24px", background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <div style={{ display: "flex", gap: 0, maxWidth: "760px" }}>
            {PASOS.map((p, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < pasoActual ? "#22c55e" : i === pasoActual ? "#6366f1" : "#334155",
                  color: "#fff", fontSize: "12px", fontWeight: 700,
                }}>
                  {i < pasoActual ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "10px", color: i === pasoActual ? "#a5b4fc" : "#64748b", marginTop: "4px", textAlign: "center" }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #dc2626", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {isLoading && (
          <div style={{ background: "#1e293b", border: "1px solid #4f46e5", borderRadius: "8px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🤖</div>
            <p style={{ color: "#a5b4fc", fontWeight: 600, margin: "0 0 8px" }}>Generando con IA...</p>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Esto puede tardar 30-90 segundos. No cierres la página.</p>
          </div>
        )}

        {/* ── INICIO ─────────────────────────────────────────────────────── */}
        {phase === "inicio" && !isLoading && (
          <div>
            <h2 style={{ fontSize: "24px", color: "#f1f5f9", marginBottom: "6px" }}>¡Hola! Comencemos tu monografía</h2>
            <p style={{ color: "#94a3b8", marginBottom: "28px" }}>Primero dinos: ¿ya tienes un tema definido?</p>

            {/* Elección: tiene tema o no */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
              <div
                onClick={() => setHasTema(true)}
                style={{
                  padding: "16px", borderRadius: "10px", cursor: "pointer", textAlign: "center",
                  background: hasTema === true ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                  border: hasTema === true ? "2px solid rgba(34,197,94,0.5)" : "2px solid #1e293b",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>Sí, tengo mi tema</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Ingreso el título y voy directo al Capítulo I</div>
              </div>
              <div
                onClick={() => setHasTema(false)}
                style={{
                  padding: "16px", borderRadius: "10px", cursor: "pointer", textAlign: "center",
                  background: hasTema === false ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                  border: hasTema === false ? "2px solid rgba(99,102,241,0.5)" : "2px solid #1e293b",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🤖</div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>No, necesito ayuda</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>La IA me propone 3 temas viables para elegir</div>
              </div>
            </div>

            {/* Formulario condicional */}
            {hasTema !== null && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <div>
                  <label style={labelStyle}>Diplomado o carrera *</label>
                  <input value={diplomado} onChange={e => setDiplomado(e.target.value)}
                    placeholder="Ej: Diplomado en Gestión Empresarial y Finanzas" style={inputStyle} />
                </div>

                {hasTema ? (
                  <>
                    <div>
                      <label style={labelStyle}>Título de tu tema *</label>
                      <input value={temaPropio} onChange={e => setTemaPropio(e.target.value)}
                        placeholder="Ej: Análisis del impacto del microcrédito en el sector rural boliviano 2018-2023" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Objetivo general <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span></label>
                      <input value={objPropio} onChange={e => setObjPropio(e.target.value)}
                        placeholder="Ej: Analizar el impacto del microcrédito en la reducción de la pobreza rural..." style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Pregunta de investigación <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span></label>
                      <input value={preguntaPropia} onChange={e => setPreguntaPropia(e.target.value)}
                        placeholder="Ej: ¿Cuál es el impacto del microcrédito en el ingreso familiar rural de Bolivia 2018-2023?" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Temas del programa <span style={{ color: "#475569", fontWeight: 400 }}>(opcional — mejora la generación)</span></label>
                      <textarea value={temas} onChange={e => setTemas(e.target.value)} rows={3}
                        placeholder={"Finanzas corporativas\nMicroeconomía\nGestión de proyectos"} style={textareaStyle} />
                    </div>
                    <button onClick={iniciarConTemaPropio} disabled={isLoading || !diplomado || !temaPropio.trim()} style={btnSuccessStyle}>
                      🚀 Comenzar con mi tema → Generar Capítulo I
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={labelStyle}>Temas abordados en el programa (uno por línea) *</label>
                      <textarea value={temas} onChange={e => setTemas(e.target.value)} rows={4}
                        placeholder={"Finanzas corporativas\nMarketing digital\nGestión de proyectos"} style={textareaStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Área o sector de interés *</label>
                      <textarea value={interes} onChange={e => setInteres(e.target.value)} rows={3}
                        placeholder="Ej: El sector bancario boliviano, específicamente microcréditos para emprendedores rurales" style={textareaStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>País o región *</label>
                      <input value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Bolivia" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>¿Trabajas en alguna empresa o institución? <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span></label>
                      <input value={trabajasEn} onChange={e => setTrabajasEn(e.target.value)}
                        placeholder="Ej: Banco BISA, empresa minera, institución pública..." style={inputStyle} />
                    </div>
                    <button onClick={iniciarSinTema} disabled={isLoading || !diplomado || !temas || !interes} style={btnPrimaryStyle}>
                      🤖 Generar 3 propuestas de tema con IA
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PROPUESTAS ──────────────────────────────────────────────────── */}
        {(phase === "propuestas" || phase === "generando0") && !isLoading && (
          <div>
            <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "4px" }}>Etapa 0 — Propuestas de Tema</h2>
            <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px" }}>La IA generó 3 opciones viables. Elige la que más te interese.</p>

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
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px" }}>
                      <strong style={{ color: "#cbd5e1" }}>Pregunta:</strong> {p.pregunta_investigacion}
                    </p>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "10px" }}>
                      <strong style={{ color: "#cbd5e1" }}>Objetivo:</strong> {p.objetivo_general}
                    </p>
                    {p.fuentes_datos?.length > 0 && (
                      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                        📊 Fuentes: {p.fuentes_datos.join(" · ")}
                      </p>
                    )}
                    <button onClick={() => elegirPropuesta(p)} style={btnSuccessStyle}>
                      ✓ Elegir este tema → Continuar al Capítulo I
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#1e293b", borderRadius: "8px", padding: "20px" }}>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>Lee las propuestas y elige una:</p>
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
              <div style={{ background: "#1e3a1e", border: "1px solid #166534", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#86efac" }}>✓ Tema: <strong>{propuestaElegida.titulo}</strong></p>
              </div>
            )}
            <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
              La IA usará exactamente estos datos para el Capítulo I sin inventar nada adicional.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <Field label="Antecedentes del problema (2-3 párrafos de contexto histórico)"
                value={antecedentes} onChange={setAntecedentes} rows={5}
                placeholder="Ej: El sector microfinanciero boliviano experimentó un crecimiento significativo desde 2010. Según el Banco Central de Bolivia (2022)..." />

              <Field label="Referencias bibliográficas — MÍNIMO 5 (una por línea: Autor (Año). Título. Fuente.)"
                value={literatura} onChange={setLiteratura} rows={7}
                placeholder={"García, Juan (2022). Microfinanzas en Bolivia. BCB. Las tasas de morosidad aumentaron post-COVID.\nLópez, María (2021). Crédito informal rural. UDAPE. El acceso al crédito formal es del 35% en zonas rurales."} />

              <Field label="Causas raíz del problema (una por línea)"
                value={causas} onChange={setCausas} rows={4}
                placeholder={"Alta tasa de interés en créditos formales\nFalta de educación financiera\nEscasa presencia bancaria en zonas rurales"} />

              <Field label="Efectos proyectados (uno por línea)"
                value={efectos} onChange={setEfectos} rows={3}
                placeholder={"Exclusión financiera de sectores vulnerables\nAumento de informalidad en el mercado crediticio"} />

              <Field label="Situación controlada — ¿cómo debería ser la situación ideal?"
                value={situacion} onChange={setSituacion} rows={2}
                placeholder="Acceso equitativo al crédito con tasas reguladas y educación financiera para todos los sectores." />

              <Field label="Objetivos específicos (3-4, uno por línea — empezar con verbo: Analizar, Determinar, Proponer...)"
                value={objetivosEsp} onChange={setObjetivosEsp} rows={4}
                placeholder={"Analizar la evolución de la morosidad 2019-2023\nDeterminar los factores que inciden en el acceso al crédito\nProponer lineamientos de mejora para la inclusión financiera"} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Field label="Justificación TEÓRICA" value={justTeorica} onChange={setJustTeorica} rows={3}
                  placeholder="No existen estudios post-pandemia que analicen..." />
                <Field label="Justificación PRÁCTICA" value={justPractica} onChange={setJustPractica} rows={3}
                  placeholder="Los resultados permitirán a las entidades financieras..." />
              </div>

              <Field label="Justificación SOCIAL" value={justSocial} onChange={setJustSocial} rows={2}
                placeholder="Mejorará el acceso al crédito para más de 500,000 familias..." />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Período temporal</label>
                  <input value={alcanceTemporal} onChange={e => setAlcanceTemporal(e.target.value)} placeholder="Ej: 2019-2023" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Alcance geográfico</label>
                  <input value={alcanceGeo} onChange={e => setAlcanceGeo(e.target.value)} placeholder="Ej: Bolivia — área urbana" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Alcance institucional <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span></label>
                <input value={alcanceInstitucional} onChange={e => setAlcanceInstitucional(e.target.value)}
                  placeholder="Ej: Sector microfinanciero boliviano / Empresa XYZ / Subsector agroindustrial" style={inputStyle} />
              </div>

              <Field label="Limitaciones del estudio (una por línea)" value={limitaciones} onChange={setLimitaciones} rows={3}
                placeholder={"Disponibilidad limitada de datos desagregados por región\nAcceso restringido a información confidencial"} />

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

              {/* Hipótesis principal (opcional, solo si cuantitativa + tieneHipotesis) */}
              {tieneHipotesis && tipoInvestigacion !== "cualitativa" && (
                <div style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: "8px", padding: "14px" }}>
                  <label style={{ ...labelStyle, color: "#a5b4fc" }}>Hipótesis principal <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span></label>
                  <input value={hipotesisPrincipal} onChange={e => setHipotesisPrincipal(e.target.value)}
                    placeholder='Ej: "Si X aumenta, entonces Y disminuye porque Z..."' style={inputStyle} />
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>Si la dejas vacía, la IA la derivará del tema y causas.</p>
                </div>
              )}

              {/* Subpreguntas (sección colapsable opcional) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSubpreguntas(!showSubpreguntas)}
                  style={{ background: "transparent", border: "1px solid #334155", borderRadius: "6px", color: "#94a3b8", padding: "8px 14px", fontSize: "13px", cursor: "pointer", width: "100%", textAlign: "left" }}
                >
                  {showSubpreguntas ? "▲" : "▼"} Subpreguntas de investigación <span style={{ color: "#475569" }}>(opcionales — la IA las genera si las dejas vacías)</span>
                </button>
                {showSubpreguntas && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px", padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid #1e293b" }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "12px" }}>Diagnóstica — ¿Cuáles son las fortalezas/debilidades de...?</label>
                      <input value={subDiagnostica} onChange={e => setSubDiagnostica(e.target.value)} style={inputStyle}
                        placeholder="¿Cuál es la situación actual del sector X en Bolivia?" />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "12px" }}>Teórica — ¿Cuál es el aporte de [teoría] para...?</label>
                      <input value={subTeorica} onChange={e => setSubTeorica(e.target.value)} style={inputStyle}
                        placeholder="¿Qué teorías explican el comportamiento de X en Y?" />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "12px" }}>Comparativa — ¿Cuál de [opciones] es más efectivo en...?</label>
                      <input value={subComparativa} onChange={e => setSubComparativa(e.target.value)} style={inputStyle}
                        placeholder="¿Cómo se compara X con Y en el período 2019-2023?" />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "12px" }}>Propositiva — ¿Cuáles deberían ser las acciones/políticas para...?</label>
                      <input value={subPropositiva} onChange={e => setSubPropositiva(e.target.value)} style={inputStyle}
                        placeholder="¿Qué estrategias deberían implementarse para mejorar X?" />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setPhase("generando1"); generarEtapa(1); }}
                disabled={!antecedentes || !literatura || !causas || !objetivosEsp}
                style={btnPrimaryStyle}
              >
                🤖 Generar Capítulo I completo
              </button>
              {(!antecedentes || !literatura || !causas || !objetivosEsp) && (
                <p style={{ fontSize: "12px", color: "#f59e0b", textAlign: "center", marginTop: "-8px" }}>
                  * Completa: Antecedentes, Referencias, Causas y Objetivos específicos.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTADOS CON CHAT ──────────────────────────────────────────── */}
        {phase === "cap1" && !isLoading && (
          <ResultadoEtapaConChat
            titulo="Capítulo I — Planteamiento del Problema"
            texto={texto1}
            onTextoChange={(t) => { setTexto1(t); saveSession({ texto1: t }); }}
            etapaNum={1}
            monografiaId={monografiaId}
            onAprobar={() => { setPhase("generando2"); generarEtapa(2); }}
            onVolver={() => setPhase("form1")}
            btnLabel="✅ Aprobar y generar Capítulo II →"
            extraContent={
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: "13px" }}>
                    Contexto actual del tema <span style={{ color: "#475569", fontWeight: 400 }}>(opcional — coyuntura, situación reciente)</span>
                  </label>
                  <textarea value={contextoActual} onChange={e => setContextoActual(e.target.value)} rows={3}
                    placeholder="Ej: A 2024, el sector microfinanciero boliviano registra un crecimiento del 8% anual según el BCB. La Ley 393 de Servicios Financieros estableció..."
                    style={textareaStyle} />
                  <p style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>Se integrará como sección de contexto actual en el Capítulo II.</p>
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: "13px" }}>
                    Documentos del docente o propios <span style={{ color: "#475569", fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <textarea value={documentoPegado} onChange={e => setDocumentoPegado(e.target.value)} rows={4}
                    placeholder="Pega aquí texto de artículos, informes, apuntes o notas del curso que quieras incluir en el marco teórico..." style={textareaStyle} />
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{ ...labelStyle, margin: 0, fontSize: "12px" }}>Estudios relacionados a incluir:</label>
                  <select value={cantEstudios} onChange={e => setCantEstudios(e.target.value)} style={{ ...inputStyle, width: "80px" }}>
                    {[5, 6, 7, 8, 9, 10].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            }
          />
        )}

        {phase === "cap2" && !isLoading && (
          <ResultadoEtapaConChat
            titulo="Capítulo II — Marco Teórico"
            texto={texto2}
            onTextoChange={(t) => { setTexto2(t); saveSession({ texto2: t }); }}
            etapaNum={2}
            monografiaId={monografiaId}
            onAprobar={() => { setPhase("generando3"); generarEtapa(3); }}
            onVolver={() => setPhase("cap1")}
            btnLabel="✅ Aprobar y generar Capítulos III-V →"
            extraContent={
              <div style={{ marginTop: "16px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 8px" }}>Fuentes de datos para el análisis (opcionales, una por línea):</p>
                <textarea value={fuentesDatos} onChange={e => setFuentesDatos(e.target.value)} rows={3}
                  placeholder={"INE — Instituto Nacional de Estadística 2019-2023\nBCB — Banco Central de Bolivia 2020-2023"} style={textareaStyle} />
                <Field label="Observaciones adicionales para los capítulos finales (opcional)" value={observaciones3} onChange={setObservaciones3} rows={2}
                  placeholder="Ej: Enfocarse en microfinanzas rurales, incluir análisis de la Ley 393..." />
              </div>
            }
          />
        )}

        {phase === "cap3" && !isLoading && (
          <ResultadoEtapaConChat
            titulo="Capítulos III, IV, V + Bibliografía"
            texto={texto3}
            onTextoChange={(t) => { setTexto3(t); saveSession({ texto3: t }); }}
            etapaNum={3}
            monografiaId={monografiaId}
            onAprobar={() => { setPhase("caratula"); saveSession({ phase: "caratula" }); }}
            onVolver={() => setPhase("cap2")}
            btnLabel="✅ Aprobar y subir carátula →"
          />
        )}

        {/* ── CARÁTULA ─────────────────────────────────────────────────────── */}
        {phase === "caratula" && !isLoading && (
          <div>
            <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "6px" }}>Carátula del documento</h2>
            <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
              Sube la carátula que te entregó la institución o que ya tienes diseñada. Se incluirá como primera página del PDF.
            </p>

            {caratulaUrl ? (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ background: "#1e293b", borderRadius: "8px", padding: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: "#4ade80", fontSize: "20px" }}>✓</span>
                  <span style={{ color: "#e2e8f0", fontSize: "14px" }}>Carátula cargada correctamente</span>
                  <button onClick={() => setCaratulaUrl("")} style={{ ...btnSecondaryStyle, marginLeft: "auto", padding: "4px 12px", fontSize: "12px" }}>
                    Cambiar
                  </button>
                </div>
                <img src={caratulaUrl} alt="Vista previa carátula" style={{ maxWidth: "300px", maxHeight: "400px", borderRadius: "6px", border: "1px solid #334155", objectFit: "contain" }} />
              </div>
            ) : (
              <div
                onClick={() => caratulaInputRef.current?.click()}
                style={{
                  border: "2px dashed #334155", borderRadius: "10px", padding: "40px 24px",
                  textAlign: "center", cursor: "pointer", marginBottom: "20px", transition: "all 0.2s",
                  background: "rgba(255,255,255,0.02)",
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onMouseOut={e => (e.currentTarget.style.borderColor = "#334155")}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📎</div>
                <p style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "6px" }}>Subir carátula</p>
                <p style={{ color: "#64748b", fontSize: "13px" }}>PNG o JPG · Máx. 5 MB</p>
                <input ref={caratulaInputRef} type="file" accept="image/*" onChange={handleCaratulaChange} style={{ display: "none" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => { setPhase("final"); saveSession({ phase: "final" }); }}
                style={{ ...btnSuccessStyle, flex: 2, padding: "12px 24px", fontSize: "15px" }}
              >
                {caratulaUrl ? "📥 Continuar a descarga →" : "⏭ Saltar — sin carátula →"}
              </button>
              <button onClick={() => setPhase("cap3")} style={btnSecondaryStyle}>
                ← Volver
              </button>
            </div>
          </div>
        )}

        {/* ── FINAL ───────────────────────────────────────────────────────── */}
        {phase === "final" && !isLoading && (
          <div>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎓</div>
              <h2 style={{ fontSize: "22px", color: "#f1f5f9", marginBottom: "6px" }}>¡Monografía completada!</h2>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Todos los capítulos generados. Descarga tu documento final.</p>
            </div>

            {/* Checklist de validación */}
            <div className="card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                Validación del documento
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: "Capítulo I generado", ok: Boolean(texto1) },
                  { label: "Capítulo II generado", ok: Boolean(texto2) },
                  { label: "Capítulos III-V generados", ok: Boolean(texto3) },
                  { label: "Carátula incluida", ok: Boolean(caratulaUrl) },
                  { label: "Citas registradas", ok: (compileMeta?.total_citas ?? 0) > 0 },
                  { label: "Listo para compilar", ok: compileMeta?.lista_para_compilar ?? Boolean(texto1 && texto2 && texto3) },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ color: ok ? "#4ade80" : "#f87171", fontSize: "16px" }}>{ok ? "✓" : "✗"}</span>
                    <span style={{ color: ok ? "#cbd5e1" : "#94a3b8" }}>{label}</span>
                  </div>
                ))}
              </div>
              {compileMeta?.total_citas !== undefined && (
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#475569", borderTop: "1px solid #1e293b", paddingTop: "10px" }}>
                  📚 {compileMeta.total_citas} citas registradas en bibliografía
                  {!caratulaUrl && <span style={{ marginLeft: "16px", color: "#f59e0b" }}>⚠ Sin carátula — se generará portada automática</span>}
                </div>
              )}
            </div>

            {/* Opciones de descarga */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              {/* Vista previa imprimible */}
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>🖨️</div>
                <h3 style={{ color: "#e2e8f0", marginBottom: "6px", fontSize: "14px", fontWeight: 700 }}>Vista previa / Imprimir</h3>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "14px", lineHeight: 1.5 }}>
                  Abre el documento formateado en el navegador. Usa <strong style={{ color: "#94a3b8" }}>Ctrl+P → Guardar como PDF</strong> para obtener el archivo.
                  {caratulaUrl ? " Incluye tu carátula." : ""}
                </p>
                <button onClick={exportarPDF} style={{ ...btnPrimaryStyle, fontSize: "13px", width: "100%", justifyContent: "center" }}>
                  Vista previa PDF →
                </button>
              </div>

              {/* LaTeX / Overleaf */}
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>📄</div>
                <h3 style={{ color: "#e2e8f0", marginBottom: "6px", fontSize: "14px", fontWeight: 700 }}>LaTeX profesional (.tex)</h3>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "14px", lineHeight: 1.5 }}>
                  Descarga el fuente LaTeX con márgenes 2.54 cm, Times 12pt e interlineado 1.5.
                  Compila en <strong style={{ color: "#06b6d4" }}>Overleaf</strong> para obtener el PDF final.
                </p>
                <button onClick={compilarLatex} disabled={isLoading} style={{ ...btnSecondaryStyle, fontSize: "13px", width: "100%", justifyContent: "center" }}>
                  Descargar .tex →
                </button>
              </div>
            </div>

            {/* Instrucciones Overleaf */}
            <details className="card" style={{ padding: "14px 18px", marginBottom: "20px" }}>
              <summary style={{ color: "#06b6d4", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                📋 Cómo compilar el PDF profesional en Overleaf (gratis)
              </summary>
              <ol style={{ marginTop: "12px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
                <li>Descarga el archivo <strong style={{ color: "#e2e8f0" }}>.tex</strong> con el botón de arriba.</li>
                <li>Ve a <strong style={{ color: "#e2e8f0" }}>overleaf.com</strong> y crea un proyecto en blanco.</li>
                <li>Sube el archivo <code style={{ background: "#1e293b", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>.tex</code> reemplazando el <code style={{ background: "#1e293b", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>main.tex</code> predeterminado.</li>
                {caratulaUrl && <li>Sube también la carátula con el nombre exacto <code style={{ background: "#1e293b", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>caratula.pdf</code>.</li>}
                <li>Haz clic en <strong style={{ color: "#e2e8f0" }}>Recompile</strong> dos veces (la segunda genera el índice correctamente).</li>
                <li>Descarga el PDF desde el botón <strong style={{ color: "#e2e8f0" }}>Download PDF</strong> en Overleaf.</li>
              </ol>
              <div style={{ marginTop: "10px", padding: "8px 12px", background: "rgba(6,182,212,0.08)", borderRadius: "6px", fontSize: "12px", color: "#67e8f9" }}>
                Alternativa local: <code>pdflatex monografia.tex</code> (ejecutar dos veces) con TeX Live o MiKTeX instalado.
              </div>
            </details>

            {/* Vistas previas de capítulos */}
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
              Vista previa de capítulos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {[
                { label: "Capítulo I — Planteamiento del Problema", texto: texto1 },
                { label: "Capítulo II — Marco Teórico y Referencial", texto: texto2 },
                { label: "Capítulos III, IV, V + Bibliografía", texto: texto3 },
              ].map(({ label, texto }) =>
                texto ? (
                  <details key={label} className="card" style={{ padding: "12px 16px" }}>
                    <summary style={{ color: "#a5b4fc", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>{label}</summary>
                    <div style={{ marginTop: "10px", whiteSpace: "pre-wrap", fontSize: "12px", color: "#64748b", maxHeight: "280px", overflowY: "auto", lineHeight: 1.7 }}>
                      {texto}
                    </div>
                  </details>
                ) : null
              )}
            </div>

            <button onClick={reiniciar} style={{ ...btnSecondaryStyle, width: "100%", justifyContent: "center" }}>
              ↩ Comenzar nueva monografía
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Resultado con Chat ───────────────────────────────────────────────────────

function ResultadoEtapaConChat({ titulo, texto, onTextoChange, etapaNum, monografiaId, onAprobar, onVolver, btnLabel, extraContent }: {
  titulo: string;
  texto: string;
  onTextoChange: (t: string) => void;
  etapaNum: number;
  monografiaId: string;
  onAprobar: () => void;
  onVolver: () => void;
  btnLabel: string;
  extraContent?: React.ReactNode;
}) {
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  async function enviarChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMsgs(prev => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/etapas/${etapaNum}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monografia_id: monografiaId, mensaje: msg, contenido_actual: texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onTextoChange(data.texto);
      setChatMsgs(prev => [...prev, { role: "assistant", text: "✅ Capítulo actualizado con tus observaciones. Revisa el contenido arriba." }]);
    } catch (e) {
      setChatMsgs(prev => [...prev, { role: "assistant", text: `⚠️ Error: ${(e as Error).message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "20px", color: "#f1f5f9", marginBottom: "4px" }}>{titulo}</h2>
      <p style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "13px" }}>
        Revisa el contenido. Puedes usar el chat para pedir modificaciones antes de aprobar.
      </p>

      {/* Contenido generado */}
      <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "20px", whiteSpace: "pre-wrap", fontSize: "13px", color: "#cbd5e1", maxHeight: "480px", overflowY: "auto", lineHeight: 1.8, marginBottom: "16px" }}>
        {texto || "Sin contenido generado."}
      </div>

      {extraContent}

      {/* Botones de acción */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        <button onClick={onAprobar} style={btnSuccessStyle}>{btnLabel}</button>
        <button onClick={onVolver} style={btnSecondaryStyle}>← Volver y modificar datos</button>
      </div>

      {/* Chat panel */}
      <div style={{ marginTop: "24px", border: "1px solid #1e293b", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>💬</span>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>Solicitar modificaciones a la IA</span>
          {chatLoading && <span style={{ fontSize: "12px", color: "#a5b4fc", marginLeft: "auto" }}>Procesando...</span>}
        </div>

        {chatMsgs.length > 0 && (
          <div style={{ padding: "12px 16px", maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {chatMsgs.map((msg, i) => (
              <div key={i} style={{
                padding: "8px 12px", borderRadius: "6px", fontSize: "13px",
                background: msg.role === "user" ? "rgba(79,70,229,0.15)" : "rgba(6,182,212,0.08)",
                border: msg.role === "user" ? "1px solid rgba(79,70,229,0.2)" : "1px solid rgba(6,182,212,0.1)",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
              }}>
                <span style={{ fontWeight: 700, color: msg.role === "user" ? "#a5b4fc" : "#67e8f9" }}>
                  {msg.role === "user" ? "Tú" : "IA"}:
                </span>{" "}
                <span style={{ color: "#cbd5e1" }}>{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        <div style={{ padding: "12px 16px", display: "flex", gap: "8px", background: "#080f1d" }}>
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) enviarChat(); }}
            placeholder="Ej: Agrega más contexto sobre el sector boliviano... / Hazlo más conciso... / Agrega una sección sobre..."
            rows={2}
            disabled={chatLoading}
            style={{ ...textareaStyle, flex: 1, resize: "none" }}
          />
          <button
            onClick={enviarChat}
            disabled={chatLoading || !chatInput.trim()}
            style={{
              background: chatLoading || !chatInput.trim() ? "#1e293b" : "#4f46e5",
              color: "#fff", border: "none", borderRadius: "8px",
              padding: "0 16px", cursor: chatLoading ? "wait" : "pointer",
              fontWeight: 700, fontSize: "18px", flexShrink: 0,
            }}
          >
            {chatLoading ? "⏳" : "↑"}
          </button>
        </div>
        <p style={{ padding: "0 16px 10px", fontSize: "11px", color: "#334155" }}>
          Ctrl+Enter para enviar · El capítulo se actualiza sin perder las citas ni la estructura
        </p>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#0f172a", border: "1px solid #334155",
  borderRadius: "6px", color: "#e2e8f0", fontSize: "14px", boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "system-ui, sans-serif",
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px",
  padding: "12px 24px", fontSize: "15px", fontWeight: 600, cursor: "pointer", width: "100%",
};

const btnSuccessStyle: React.CSSProperties = {
  background: "#15803d", color: "#fff", border: "none", borderRadius: "8px",
  padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
};

const btnSecondaryStyle: React.CSSProperties = {
  background: "transparent", color: "#94a3b8", border: "1px solid #475569",
  borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer",
};
