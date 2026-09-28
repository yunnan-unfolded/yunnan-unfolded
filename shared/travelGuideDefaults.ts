export const TRAVEL_GUIDE_IMAGE_WIDTHS = ["standard", "large", "full-bleed", "half"] as const;
export const TRAVEL_GUIDE_IMAGE_RATIOS = [
  "original",
  "landscape-16-9",
  "landscape-4-3",
  "portrait-3-4",
  "portrait-9-16",
] as const;
export const TRAVEL_GUIDE_IMAGE_ALIGNMENTS = ["center", "left", "right"] as const;
export const TRAVEL_GUIDE_IMAGE_FOCAL_POINTS = ["center", "top", "bottom", "left", "right"] as const;
export const TRAVEL_GUIDE_EDITOR_DRAFT_LABEL = "Untitled Travel Guide Draft";

export const TRAVEL_GUIDE_DEFAULT_ITEM = {
  editorLabel: TRAVEL_GUIDE_EDITOR_DRAFT_LABEL,
  title: "",
  basic: { slug: "", category: "", region: "", summary: "" },
  hero: {
    src: "",
    alt: "",
    displayWidth: "standard",
    displayRatio: "original",
    alignment: "center",
    focalPoint: "center",
  },
  content: { introduction: "", sections: [] },
  seo: { title: "", description: "" },
  publication: { status: "draft" },
} as const;

export function normalizeTravelGuideTitleValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function resolveTravelGuideEditorLabel(title: unknown, currentLabel: unknown) {
  const publicTitle = normalizeTravelGuideTitleValue(title).trim();
  if (publicTitle) return publicTitle;
  return normalizeTravelGuideTitleValue(currentLabel).trim() || TRAVEL_GUIDE_EDITOR_DRAFT_LABEL;
}

export function normalizeTravelGuideSlug(value: string) {
  let normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^content\/travel-guides\//, "")
    .replace(/\.json$/i, "")
    .replace(/^(?:travel-guides|guides)(?:\/|-)+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  while (/^(?:travel-guides|guides)-/.test(normalized)) {
    normalized = normalized.replace(/^(?:travel-guides|guides)-/, "");
  }

  return normalized;
}

export function normalizeTravelGuideParagraphs(value: unknown) {
  const entries = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return entries
    .flatMap((entry) => String(entry ?? "").split(/\r?\n\s*\r?\n/))
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
