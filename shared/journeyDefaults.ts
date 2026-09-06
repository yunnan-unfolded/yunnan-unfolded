type JourneyDefaultInput = {
  activityLevel?: string;
  bestSeasons?: string;
  durationDays?: number;
  durationNights?: number;
  endLocation?: string;
  priceNote?: string;
  startLocation?: string;
  title?: string;
  travelStyle?: string;
};

export const DEFAULT_JOURNEY_PROMISES = [
  "Yunnan-Based Team",
  "Private Vehicle & English-Speaking Guide",
  "Reply Within 24 Hours",
  "No Compulsory Shopping",
];

export const DEFAULT_JOURNEY_FINAL_CTA = {
  eyebrow: "Private journey · shaped in Yunnan",
  title: "Make This Journey Your Own",
  body: "Tell us what interests you most, how you like to travel and when you are thinking of visiting. We’ll shape the route around your time, pace and interests.",
  primaryLabel: "Plan This Journey",
  secondaryLabel: "Ask a Question",
};

export const DEFAULT_JOURNEY_INQUIRY_EYEBROW = "Private & Tailor-Made";
export const DEFAULT_JOURNEY_INQUIRY_PROMISE = "Personal reply within 24 hours";

export function normalizeLinesList(value: unknown) {
  const entries = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return entries
    .flatMap((entry) => String(entry ?? "").split(/\r?\n/))
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatJourneyLogistics(value: string) {
  return value
    .trim()
    .replace(/\s+OVERNIGHT:\s*/i, " · Overnight in ");
}

export function normalizeJourneySlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.json$/i, "")
    .replace(/^journeys(?:\/|-)+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function journeyDurationLabel(days = 0, nights = Math.max(0, days - 1)) {
  return `${days} Days / ${nights} Nights`;
}

function inferredJourneyType(input: JourneyDefaultInput) {
  const searchable = [input.title, input.travelStyle].filter(Boolean).join(" ").toLowerCase();
  if (/hiking|walking|trek|trail/.test(searchable)) return "SEASONAL HIKING";
  return "PRIVATE JOURNEY";
}

export function defaultJourneyHeroEyebrow(input: JourneyDefaultInput) {
  const place = input.startLocation && input.endLocation && input.startLocation !== input.endLocation
    ? `${input.startLocation} TO ${input.endLocation}`
    : input.endLocation || input.startLocation || "YUNNAN";
  return `${inferredJourneyType(input)} · ${place}`.toUpperCase();
}

export function defaultJourneyHeroFacts(input: JourneyDefaultInput) {
  const travelStyle = input.travelStyle?.trim();
  return [
    `${input.durationDays ?? 0} DAYS · ${input.durationNights ?? Math.max(0, (input.durationDays ?? 0) - 1)} NIGHTS`,
    input.bestSeasons?.toUpperCase(),
    input.activityLevel?.toUpperCase(),
    travelStyle && /private/i.test(travelStyle) ? "PRIVATE JOURNEY" : travelStyle?.toUpperCase() || "PRIVATE JOURNEY",
  ].filter((value): value is string => Boolean(value?.trim()));
}

export function defaultJourneyInquiryFacts(input: JourneyDefaultInput) {
  const duration = journeyDurationLabel(input.durationDays, input.durationNights);
  const route = [input.startLocation, input.endLocation].filter(Boolean).join(" to ");
  return [
    { label: "Duration", value: duration },
    ...(route ? [{ label: "Route", value: route }] : []),
    { label: "Travel Style", value: input.travelStyle || "Private & Tailor-Made" },
    { label: "Price", value: input.priceNote || "Tailored quotation" },
  ];
}
