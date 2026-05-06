function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isReferencesPhase(phase) {
  const label = normalizeText(`${phase?.label ?? ""} ${phase?.short_label ?? ""}`);
  return label.includes("referencias") || label.includes("bibliograf");
}
