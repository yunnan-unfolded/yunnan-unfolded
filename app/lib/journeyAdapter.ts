import type {
  FocalPoint,
  Journey,
  JourneyContent,
  JourneyContentImage,
  JourneyImage,
} from "../types/journey";

const focalPointPositions: Record<FocalPoint, string> = {
  top: "center top",
  center: "center",
  bottom: "center bottom",
  left: "left center",
  right: "right center",
};

const tinaFileMarker = "/__file/";

export function normalizeJourneyImageSrc(src: string) {
  if (!src.startsWith("https://assets.tina.io/")) return src;

  try {
    const pathname = new URL(src).pathname;
    const markerIndex = pathname.indexOf(tinaFileMarker);
    if (markerIndex < 0) return src;

    const relativePath = pathname.slice(markerIndex + tinaFileMarker.length);
    const segments = relativePath.split("/").filter(Boolean);
    if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) return src;

    return `/images/journeys/${segments.join("/")}`;
  } catch {
    return src;
  }
}

function imageDimensions(image: JourneyContentImage) {
  if (image.width && image.height) return { width: image.width, height: image.height };
  if (image.displayRatio === "portrait") return { width: 900, height: 1200 };
  if (image.displayRatio === "square") return { width: 1000, height: 1000 };
  return { width: 1200, height: 800 };
}

export function toJourneyImage(image: JourneyContentImage): JourneyImage {
  const dimensions = imageDimensions(image);
  return {
    src: normalizeJourneyImageSrc(image.src),
    alt: image.alt,
    ...dimensions,
    position: image.position ?? (image.focalPoint && image.focalPoint !== "center" ? focalPointPositions[image.focalPoint] : undefined),
    directoryPosition: image.directoryPosition,
    directoryMobilePosition: image.directoryMobilePosition,
    displayRatio: image.displayRatio ?? "landscape",
    focalPoint: image.focalPoint ?? "center",
    legacyAspect: image.legacyAspect,
  };
}

function enquiryHref(collection: string, intent: "plan" | "question") {
  return `/plan-my-trip/?journey=${encodeURIComponent(collection)}&source=journey-detail&intent=${intent}`;
}

export function journeyContentToViewModel(content: JourneyContent): Journey {
  const days = content.itinerary.days.map((day) => ({
    ...day,
    options: day.options?.map((option) => ({
      title: `${option.label} · ${option.title}`,
      description: option.description,
      points: option.points,
    })),
    images: day.images?.map(toJourneyImage),
  }));
  const durationLabel = `${content.basic.durationDays} Days / ${content.basic.durationNights} Nights`;
  const seoTitle = content.seo.title?.trim() || `${content.basic.title} | Yunnan Unfolded`;
  const seoDescription = content.seo.description?.trim() || content.basic.listingDescription;

  return {
    slug: content.basic.slug,
    status: content.publication.status,
    collection: content.basic.collection,
    listingDescription: content.basic.listingDescription,
    homepageDescription: content.basic.homepageDescription ?? content.basic.listingDescription,
    homepageImageAlt: content.basic.homepageImageAlt ?? content.hero.alt,
    title: content.basic.title,
    subtitle: content.basic.subtitle,
    route: content.route.display,
    duration: {
      days: content.basic.durationDays,
      nights: content.basic.durationNights,
      label: durationLabel,
    },
    startLocation: content.basic.startLocation,
    endLocation: content.basic.endLocation,
    travelStyle: content.basic.travelStyle,
    activityLevel: content.basic.activityLevel,
    priceNote: content.basic.priceNote,
    hero: toJourneyImage(content.hero),
    heroEyebrow: content.basic.heroEyebrow,
    primaryHref: enquiryHref(content.basic.collection, "plan"),
    questionHref: enquiryHref(content.basic.collection, "question"),
    heroFacts: content.basic.heroFacts.length > 0
      ? content.basic.heroFacts
      : [durationLabel, `${content.basic.startLocation} → ${content.basic.endLocation}`, content.basic.travelStyle, content.basic.activityLevel],
    promises: content.basic.promises,
    overview: content.overview.paragraphs,
    facts: content.overview.facts.map(({ label, value }) => [label, value]),
    highlights: content.highlights.items.map(({ title, description }) => [title, description]),
    highlightImages: content.highlights.images.map(toJourneyImage),
    routeStops: content.route.stops.map(({ place, days: stopDays }) => [place, stopDays]),
    days,
    suitable: content.audience.suitable,
    considerations: content.audience.considerations ?? [],
    included: content.inclusions.included,
    excluded: content.inclusions.excluded,
    conditions: content.booking.conditions,
    inquiryEyebrow: content.basic.inquiryEyebrow,
    inquiryFacts: content.basic.inquiryFacts,
    inquiryPromise: content.basic.inquiryPromise,
    finalCta: content.overview.finalCta,
    seo: {
      title: seoTitle,
      description: seoDescription,
      ogImage: content.seo.ogImage ? toJourneyImage(content.seo.ogImage) : undefined,
    },
  };
}
