"use client";

/**
 * Cap0TituloSelector — extrae las 3 propuestas de título del output de Cap. 0
 * y las muestra como cards seleccionables. Cuando el estudiante elige una,
 * el título se persiste en el proyecto (campo tema_aprobado + titulo_provisional)
 * y queda como el título oficial que usarán todas las fases siguientes
 * (carátula LaTeX, contenido del Cap. I, etc.).
 *
 * Si el contenido no incluye la sección "## Tres propuestas de título académico",
 * el componente no renderiza nada y deja que el contenedor padre muestre el
 * markdown normal.
 *
 * Exporta también `removerSeccionPropuestas()` para que el contenedor padre
 * pueda renderizar el resto del markdown SIN la sección de propuestas (evita
 * duplicación visual: las propuestas se muestran solo como cards interactivas).
 */

/**
 * Devuelve el markdown del Cap. 0 sin la sección "## Tres propuestas...".
 * Útil para renderizar el contenido principal sin duplicar las opciones
 * que ya se muestran como cards interactivas en este selector.
 *
 * También elimina el párrafo que típicamente sigue ("El título RECOMENDADO
 * es:...") porque esa explicación queda integrada en el badge de la card.
 */
export function removerSeccionPropuestas(markdown: string): string {
  // Eliminar la sección completa "## Tres propuestas..." hasta el siguiente ## o #
  let limpio = markdown.replace(
    /##\s*Tres propuestas de t[íi]tulo[\s\S]*?(?=\n##\s|\n#\s|$)/i,
    ""
  );
  // Eliminar también líneas sueltas tipo "El título RECOMENDADO es: ..."
  // que algunos modelos generan FUERA de la sección, como párrafo aparte.
  limpio = limpio.replace(
    /^.*el\s+t[íi]tulo\s+\*?\*?RECOMENDADO\*?\*?\s+es:?[\s\S]*?(?=\n##\s|\n#\s|$)/gim,
    ""
  );
  // Colapsar saltos de línea múltiples que quedaron por la remoción
  return limpio.replace(/\n{3,}/g, "\n\n").trim();
}

import { useMemo, useState } from "react";

interface Cap0TituloSelectorProps {
  contenidoCap0: string;
  proyectoId: string;
  tituloActual?: string | null;
  onTituloSelected?: (titulo: string) => void;
}

interface Propuesta {
  numero: number;
  titulo: string;
  descripcion: string;
  recomendado: boolean;
}

/**
 * Parser robusto que extrae 3 propuestas del markdown del Cap. 0.
 * Soporta variantes de formato (con/sin asteriscos, con/sin estrella).
 */
function parsearPropuestas(markdown: string): Propuesta[] {
  // Buscar la sección de propuestas
  const seccionMatch = markdown.match(/##\s*Tres propuestas de t[íi]tulo[\s\S]*?(?=\n##\s|\n#\s|$)/i);
  if (!seccionMatch) return [];
  const seccion = seccionMatch[0];

  // Patrón flexible: cada propuesta empieza con número y tiene un título entre
  // asteriscos o comillas, seguido de descripción.
  const propuestas: Propuesta[] = [];
  const lineas = seccion.split("\n").map((l) => l.trim()).filter(Boolean);

  let currentNum = 0;
  let currentTitulo = "";
  let currentDesc: string[] = [];
  let currentReco = false;

  function pushCurrent() {
    if (currentNum > 0 && currentTitulo) {
      propuestas.push({
        numero: currentNum,
        titulo: currentTitulo.trim(),
        descripcion: currentDesc.join(" ").trim(),
        recomendado: currentReco,
      });
    }
    currentNum = 0;
    currentTitulo = "";
    currentDesc = [];
    currentReco = false;
  }

  for (const linea of lineas) {
    // Detectar inicio de propuesta numerada: "**1." / "1." / "1)" / "**1.**"
    // El número viene precedido opcionalmente por asteriscos, comillas o ⭐.
    const inicio = linea.match(/^(?:\*\*?|⭐\s*)*\s*(\d+)[.\)]\s*(.*)$/);
    if (inicio) {
      pushCurrent();
      currentNum = parseInt(inicio[1], 10);
      let resto = inicio[2];

      // Detectar marcador RECOMENDADO antes de limpiar
      currentReco = /⭐|RECOMENDADO|Recomendado/i.test(resto);

      // Limpiar marcadores de formato pero conservar el título.
      // Estrategia: el título suele estar entre comillas tipográficas, comillas
      // normales o entre asteriscos pares. Probamos en orden de preferencia.
      let titulo = "";

      // 1) Comillas tipográficas: "..."
      const compTip = resto.match(/[«"„]([^"«»„"]+)[»"""]/);
      if (compTip && compTip[1].length > 15) {
        titulo = compTip[1];
      }

      // 2) Comillas normales: "..."
      if (!titulo) {
        const compNormal = resto.match(/"([^"]{15,})"/);
        if (compNormal) titulo = compNormal[1];
      }

      // 3) Italic: *... ...* (con al menos 15 chars, evita capturar separadores)
      if (!titulo) {
        const italic = resto.match(/\*([^*]{15,})\*/);
        if (italic) titulo = italic[1];
      }

      // 4) Fallback: todo el texto después del último separador (— o :)
      if (!titulo) {
        const tras = resto.split(/[—:]/).pop();
        if (tras) titulo = tras.trim();
      }

      // 5) Último recurso: el resto entero limpio
      if (!titulo) {
        titulo = resto;
      }

      // Limpieza final: quitar marcadores y comillas
      currentTitulo = titulo
        .replace(/⭐/g, "")
        .replace(/\*+/g, "")
        .replace(/RECOMENDADO/gi, "")
        .replace(/^[\s—:,.;"«»„""]+|[\s"«»„""]+$/g, "")
        .trim();

    } else if (currentNum > 0) {
      // Línea de descripción de la propuesta actual
      const limpia = linea.replace(/^[*_]+|[*_]+$/g, "").trim();
      if (limpia && !limpia.startsWith("##")) {
        currentDesc.push(limpia);
      }
    }
  }
  pushCurrent();

  // Si ninguna propuesta quedó marcada como recomendada, buscar en el
  // markdown completo una mención tipo "El título RECOMENDADO es: ..."
  // y matchear contra los títulos extraídos para marcar la coincidente.
  const algunaReco = propuestas.some((p) => p.recomendado);
  if (!algunaReco && propuestas.length > 0) {
    const recoMatch = markdown.match(/el\s+t[íi]tulo\s+\*?\*?RECOMENDADO\*?\*?\s+es:?\s*["«"](.+?)["»"]/i)
      || markdown.match(/RECOMENDADO[^"«]*?["«"]([^"»"]+)["»"]/i);
    if (recoMatch && recoMatch[1]) {
      const recoTituloLimpio = recoMatch[1].replace(/[.,;]\s*$/, "").trim().toLowerCase();
      propuestas.forEach((p) => {
        const pLimpio = p.titulo.toLowerCase();
        // Considerar match si una contiene a la otra en un 60%+
        if (pLimpio.includes(recoTituloLimpio.slice(0, 40)) || recoTituloLimpio.includes(pLimpio.slice(0, 40))) {
          p.recomendado = true;
        }
      });
    }
    // Si SIGUE sin haber recomendada, marcamos la primera como recomendada
    // por convención (la IA suele listar primero la mejor).
    if (!propuestas.some((p) => p.recomendado) && propuestas[0]) {
      propuestas[0].recomendado = true;
    }
  }

  return propuestas;
}

export default function Cap0TituloSelector({
  contenidoCap0,
  proyectoId,
  tituloActual,
  onTituloSelected,
}: Cap0TituloSelectorProps) {
  const propuestas = useMemo(() => parsearPropuestas(contenidoCap0), [contenidoCap0]);
  const [seleccion, setSeleccion] = useState<string | null>(tituloActual ?? null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (propuestas.length === 0) return null;

  async function seleccionarTitulo(titulo: string) {
    setGuardando(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${proyectoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema_aprobado: titulo,
          titulo_provisional: titulo,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar el título");
      }
      setSeleccion(titulo);
      onTituloSelected?.(titulo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        border: "2px solid var(--accent)",
        borderRadius: 12,
        background: "rgba(37,99,235,0.04)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          📌 Decisión del estudiante
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--fg-primary)" }}>
          Elige el título oficial de tu proyecto
        </h3>
        <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginTop: 6, lineHeight: 1.5 }}>
          Este título aparecerá en la carátula de tu documento y se usará en
          todas las siguientes fases del proyecto. Puedes cambiarlo después si
          lo necesitas.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {propuestas.map((p) => {
          const esSeleccionada = seleccion === p.titulo;
          return (
            <button
              key={p.numero}
              type="button"
              onClick={() => seleccionarTitulo(p.titulo)}
              disabled={guardando}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 10,
                background: esSeleccionada ? "rgba(34,197,94,0.10)" : "var(--bg-card)",
                border: esSeleccionada ? "2px solid #22c55e" : p.recomendado ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                cursor: guardando ? "wait" : "pointer",
                transition: "all 0.15s",
                color: "var(--fg-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: esSeleccionada ? "#22c55e" : p.recomendado ? "var(--accent)" : "var(--fg-muted)",
                  color: "white",
                  letterSpacing: "0.05em",
                }}>
                  {esSeleccionada ? "✓ SELECCIONADO" : p.recomendado ? "⭐ RECOMENDADO" : `OPCIÓN ${p.numero}`}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 8, color: "var(--fg-primary)" }}>
                {p.titulo}
              </div>
              {p.descripcion && (
                <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
                  {p.descripcion}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", fontSize: 12 }}>
          {error}
        </div>
      )}

      {seleccion && !error && (
        <div style={{ marginTop: 12, padding: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#16a34a", fontSize: 12 }}>
          ✓ Título guardado. Ya puedes pasar al Capítulo I.
        </div>
      )}
    </div>
  );
}
