export const WALK_DIFFICULTIES = ["gentle", "easy-moderate", "high-country"] as const;
export const WALK_IMAGE_WIDTHS = ["standard", "large", "full-bleed", "half"] as const;
export const WALK_IMAGE_RATIOS = ["original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"] as const;
export const WALK_IMAGE_ALIGNMENTS = ["center", "left", "right"] as const;
export const WALK_IMAGE_FOCAL_POINTS = ["center", "top", "bottom", "left", "right"] as const;

export function normalizeWalkSlug(value: string) {
  let normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^content\/walks\//, "")
    .replace(/\.json$/i, "")
    .replace(/^(?:walk-yunnan|walks)(?:\/|-)+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  while (/^(?:walks|journeys)-/.test(normalized)) {
    normalized = normalized.replace(/^(?:walks|journeys)-/, "");
  }

  return normalized;
}

export function normalizeWalkLines(value: unknown) {
  const entries = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return entries
    .flatMap((entry) => String(entry ?? "").split(/\r?\n/))
    .map((line) => line.trim())
    .filter(Boolean);
}
