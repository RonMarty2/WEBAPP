export interface UniversityLogoAsset {
  fileName: string;
  variable: string;
  url: string;
}

export function slugifyAssetPart(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "archivo";
}

export function universityLogoFolder(universityName: string): string {
  return slugifyAssetPart(universityName || "universidad");
}

export function logoVariableFromFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `logo_${slugifyAssetPart(baseName).replace(/-/g, "_")}`;
}

export function logoUrlFor(universityName: string, fileName: string): string {
  return `/logos/${universityLogoFolder(universityName)}/${fileName}`;
}
