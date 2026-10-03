const MAX_CONTEXT_LENGTH = 120;

function titleFromSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((word, index) => {
      const normalized = word.toLowerCase();
      return index > 0 && ["a", "an", "and", "for", "in", "of", "on", "the", "to"].includes(normalized)
        ? normalized
        : normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
}

export function getEnquiryContext(search: string) {
  const params = new URLSearchParams(search);
  const source = params.get("source");

  if (source === "journey-detail") {
    const journey = params.get("journey")?.trim().slice(0, MAX_CONTEXT_LENGTH);
    return journey ? `Journey: ${journey}` : "";
  }

  if (source === "travel-guide") {
    const guide = params.get("guide")?.trim().slice(0, MAX_CONTEXT_LENGTH);
    if (!guide) return "";

    return `Travel guide: ${titleFromSlug(guide)}`;
  }

  if (source === "walk") {
    const walk = params.get("walk")?.trim().slice(0, MAX_CONTEXT_LENGTH);
    return walk ? `Walk: ${titleFromSlug(walk)}` : "";
  }

  return "";
}

export function addEnquiryContextToNotes(notes: string, context: string) {
  const message = notes.trim();
  if (!context) return message;

  const contextLine = `I came to this enquiry from ${context}.`;
  return message ? `${contextLine}\n\n${message}` : contextLine;
}
