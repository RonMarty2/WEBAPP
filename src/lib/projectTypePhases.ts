import { loadFromDisk, type FaseTipoProyecto, type PhaseDefinition } from "@/lib/persistence";
import { resolvePhases } from "@/lib/scribePhases";
import {
  UNIFRANZ_UNIVERSITY_ID,
  getModalidadUnifranz,
  type ModalidadUnifranz,
} from "@/lib/proyectoGrado/unifranz/modalidades";
import { getUnifranzPhases } from "@/lib/proyectoGrado/unifranz/fases";

const SERVICE_TO_PROJECT_TYPE: Record<string, string> = {
  "mono-001": "tipo-monografia",
  "tesis-001": "tipo-tesis",
  // 🎓 Proyecto de Grado tiene 2 subtipos (producción/servicios) que se
  // resuelven en runtime según la elección del estudiante. El default
  // (cuando solo conocemos el servicio) es producción.
  "proy-grado-001": "proy-prod-001",
};

export function projectTypeIdForService(servicioId?: string | null): string {
  return SERVICE_TO_PROJECT_TYPE[servicioId ?? ""] ?? "tipo-monografia";
}

export function serviceIdForProjectType(tipoProyectoId?: string | null): string {
  if (tipoProyectoId === "tipo-tesis") return "tesis-001";
  // 🎓 Incluimos "proy-grado-001" (PG sin subtipo definido aún) además de
  // los dos subtipos. Antes caía al fallback "mono-001" que persistía mal
  // el servicio y rompía el workspace (mostraba vista de Monografía).
  if (
    tipoProyectoId === "proy-grado-001"
    || tipoProyectoId === "proy-prod-001"
    || tipoProyectoId === "proy-serv-001"
  ) {
    return "proy-grado-001";
  }
  return "mono-001";
}

function shortLabelFromName(name: string): string {
  return name
    .replace(/^fase\s*\d+[a-z]?\s*[—-]\s*/i, "")
    .replace(/^cap[íi]tulo\s+/i, "Cap. ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 28) || "Fase";
}

function promptForPhase(phase: FaseTipoProyecto): string {
  return phase.prompt_final?.trim()
    || phase.prompt_borrador?.trim()
    || phase.descripcion?.trim()
    || phase.nombre;
}

export function phaseDefinitionsFromProjectType(
  tipoProyectoId: string,
  servicioId = serviceIdForProjectType(tipoProyectoId)
): PhaseDefinition[] {
  // 1) PRIORIDAD: las fases SCRIBE editables desde /admin/fases
  //    (incluye los 10 megaprompts maestros si no fueron editados).
  const { phases: scribePhases } = resolvePhases(servicioId);
  if (scribePhases.length > 0) {
    return scribePhases.map((p) => ({
      ...p,
      tipo_proyecto_id: tipoProyectoId,
    }));
  }

  // 2) FALLBACK: tabla legacy `fasesTipoProyecto` (configurada manualmente
  //    desde el panel admin de tipos de proyecto, si el admin la usó).
  const disk = loadFromDisk();
  const phases = (disk.fasesTipoProyecto ?? [])
    .filter(phase => phase.tipo_proyecto_id === tipoProyectoId)
    .sort((a, b) => a.orden - b.orden);

  return phases.map((phase, index) => ({
    id: phase.id,
    servicio_id: servicioId,
    tipo_proyecto_id: tipoProyectoId,
    orden: index * 10,
    label: phase.nombre,
    short_label: shortLabelFromName(phase.nombre),
    prompt: promptForPhase(phase),
    prompt_borrador: phase.prompt_borrador ?? "",
    prompt_final: phase.prompt_final ?? "",
  }));
}

export function phaseDefinitionsForProject({
  servicioId,
  tipoProyectoId,
  universidadId,
  modalidadTitulacion,
}: {
  servicioId?: string | null;
  tipoProyectoId?: string | null;
  /** ID de la universidad. Si es UNIFRANZ y hay modalidad válida → fases UNIFRANZ. */
  universidadId?: string | null;
  /** ID de la modalidad UNIFRANZ. Ignorado si la universidad no es UNIFRANZ. */
  modalidadTitulacion?: string | null;
}): PhaseDefinition[] {
  // ── ENRUTAMIENTO UNIFRANZ ───────────────────────────────────────────────
  // Si el proyecto es UNIFRANZ Cochabamba + Proyecto de Grado + tiene una
  // modalidad de titulación válida, usamos las fases UNIFRANZ por modalidad.
  // Esto coexiste con el motor de PG genérico (plan de negocio) que sigue
  // funcionando para UCATEC y otras universidades sin modalidades específicas.
  if (
    universidadId === UNIFRANZ_UNIVERSITY_ID
    && servicioId === "proy-grado-001"
    && getModalidadUnifranz(modalidadTitulacion) !== null
  ) {
    return getUnifranzPhases(modalidadTitulacion as ModalidadUnifranz);
  }

  // ── FALLBACK: resolver clásico (Scribe / PG genérico) ───────────────────
  const resolvedType = tipoProyectoId || projectTypeIdForService(servicioId);
  return phaseDefinitionsFromProjectType(resolvedType, servicioId || serviceIdForProjectType(resolvedType));
}

export function completedPhaseIndexForProject(project: {
  servicio_id?: string | null;
  tipo_proyecto_id?: string | null;
  universidad_id?: string | null;
  modalidad_titulacion?: string | null;
  phase_contents?: Record<string, string | null | undefined>;
  estado_fase?: number;
}) {
  const phaseContents = project.phase_contents ?? {};
  const phaseDefs = phaseDefinitionsForProject({
    servicioId: project.servicio_id,
    tipoProyectoId: project.tipo_proyecto_id,
    universidadId: project.universidad_id,
    modalidadTitulacion: project.modalidad_titulacion,
  });

  if (phaseDefs.length === 0) {
    return Math.max(0, project.estado_fase ?? 0);
  }

  const completed = [...phaseDefs]
    .sort((a, b) => a.orden - b.orden)
    .reduce((lastCompleted, phase, index) => {
      const value = phaseContents[phase.id];
      return typeof value === "string" && value.trim() ? index : lastCompleted;
    }, -1);

  return Math.max(project.estado_fase ?? 0, completed);
}
