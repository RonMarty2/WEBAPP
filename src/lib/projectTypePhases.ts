import { loadFromDisk, type FaseTipoProyecto, type PhaseDefinition } from "@/lib/persistence";

const SERVICE_TO_PROJECT_TYPE: Record<string, string> = {
  "mono-001": "tipo-monografia",
  "tesis-001": "tipo-tesis",
};

export function projectTypeIdForService(servicioId?: string | null): string {
  return SERVICE_TO_PROJECT_TYPE[servicioId ?? ""] ?? "tipo-monografia";
}

export function serviceIdForProjectType(tipoProyectoId?: string | null): string {
  return tipoProyectoId === "tipo-tesis" ? "tesis-001" : "mono-001";
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
}: {
  servicioId?: string | null;
  tipoProyectoId?: string | null;
}): PhaseDefinition[] {
  const resolvedType = tipoProyectoId || projectTypeIdForService(servicioId);
  return phaseDefinitionsFromProjectType(resolvedType, servicioId || serviceIdForProjectType(resolvedType));
}

export function completedPhaseIndexForProject(project: {
  servicio_id?: string | null;
  tipo_proyecto_id?: string | null;
  phase_contents?: Record<string, string | null | undefined>;
  estado_fase?: number;
}) {
  const phaseContents = project.phase_contents ?? {};
  const phaseDefs = phaseDefinitionsForProject({
    servicioId: project.servicio_id,
    tipoProyectoId: project.tipo_proyecto_id,
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
