import type {
  FocalPoint,
  Journey,
  JourneyContent,
  JourneyContentImage,
  JourneyImage,
} from "../types/journey";
import {
  DEFAULT_JOURNEY_FINAL_CTA,
  DEFAULT_JOURNEY_INQUIRY_EYEBROW,
  DEFAULT_JOURNEY_INQUIRY_PROMISE,
  DEFAULT_JOURNEY_PROMISES,
  defaultJourneyHeroEyebrow,
  defaultJourneyHeroFacts,
  defaultJourneyInquiryFacts,
  journeyDurationLabel,
} from "../../shared/journeyDefaults.ts";

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
  if (image.displayRatio === "landscape-16-9") return { width: 1600, height: 900 };
  if (image.displayRatio === "landscape-4-3") return { width: 1200, height: 900 };
  if (image.displayRatio === "portrait-3-4") return { width: 900, height: 1200 };
  if (image.displayRatio === "portrait-9-16") return { width: 900, height: 1600 };
  if (image.displayRatio === "portrait") return { width: 900, height: 1200 };
  if (image.displayRatio === "square") return { width: 1000, height: 1000 };
  return { width: 1200, height: 800 };
}

export function toJourneyImage(image: JourneyContentImage, fallbackAlt = ""): JourneyImage {
  const dimensions = imageDimensions(image);
  return {
    src: normalizeJourneyImageSrc(image.src),
    alt: image.alt?.trim() || fallbackAlt,
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
  const hasSimplifiedTitle = Boolean(content.title?.trim());
  const routeTitle = content.title?.trim()
    || content.basic.collection?.trim()
    || content.basic.title?.trim()
    || "Yunnan Journey";
  const summary = content.summary?.trim()
    || content.basic.listingDescription?.trim()
    || content.basic.subtitle?.trim()
    || "A private journey through Yunnan.";
  const copyOverrides = content.advanced?.copy?.enabled ? content.advanced.copy : undefined;
  const heroOverrides = content.advanced?.hero?.enabled ? content.advanced.hero : undefined;
  const inquiryOverrides = content.advanced?.inquiry?.enabled ? content.advanced.inquiry : undefined;
  const pageTitle = copyOverrides?.pageTitle?.trim()
    || (!hasSimplifiedTitle ? content.basic.title?.trim() : undefined)
    || routeTitle;
  const pageSubtitle = copyOverrides?.pageSubtitle?.trim()
    || (!hasSimplifiedTitle ? content.basic.subtitle?.trim() : undefined)
    || summary;
  const durationLabel = journeyDurationLabel(content.basic.durationDays, content.basic.durationNights);
  const defaultInput = {
    activityLevel: content.basic.activityLevel,
    bestSeasons: content.basic.bestSeasons,
    durationDays: content.basic.durationDays,
    durationNights: content.basic.durationNights,
    endLocation: content.basic.endLocation,
    priceNote: content.basic.priceNote,
    startLocation: content.basic.startLocation,
    title: routeTitle,
    travelStyle: content.basic.travelStyle,
  };
  const days = content.itinerary.days.map((day) => ({
    ...day,
    subtitle: day.subtitle ?? "",
    paragraphs: day.paragraphs ?? [],
    experiences: day.experiences ?? [],
    mediaLayout: day.mediaLayout ?? (day.images?.length ? "image-right" : "text-only"),
    imageSize: day.imageSize ?? "standard",
    options: day.options?.map((option) => ({
      title: `${option.label} · ${option.title}`,
      description: option.description,
      points: option.points,
    })),
    images: day.images?.map((image) => toJourneyImage(image, `${day.title} on ${routeTitle}`)),
  }));
  const seoTitle = content.seo.title?.trim() || `${content.basic.durationDays}-Day ${routeTitle} | Yunnan Unfolded`;
  const seoDescription = content.seo.description?.trim() || summary;
  const legacyInquiry = !hasSimplifiedTitle;
  const finalCtaSource = inquiryOverrides?.finalCta
    || (legacyInquiry ? content.overview.finalCta : undefined)
    || DEFAULT_JOURNEY_FINAL_CTA;
  const finalCta = {
    eyebrow: finalCtaSource.eyebrow?.trim() || DEFAULT_JOURNEY_FINAL_CTA.eyebrow,
    title: finalCtaSource.title?.trim() || DEFAULT_JOURNEY_FINAL_CTA.title,
    body: finalCtaSource.body?.trim() || DEFAULT_JOURNEY_FINAL_CTA.body,
    primaryLabel: finalCtaSource.primaryLabel?.trim() || DEFAULT_JOURNEY_FINAL_CTA.primaryLabel,
    secondaryLabel: finalCtaSource.secondaryLabel?.trim() || DEFAULT_JOURNEY_FINAL_CTA.secondaryLabel,
  };
  const heroAlt = heroOverrides?.imageAlt?.trim()
    || content.hero.alt?.trim()
    || `${routeTitle} in Yunnan`;
  const seasonNoteTitle = content.overview.seasonNote?.title?.trim();
  const seasonNoteBody = content.overview.seasonNote?.body?.trim();

  return {
    slug: content.basic.slug,
    status: content.publication.status,
    collection: routeTitle,
    listingDescription: summary,
    homepageDescription: copyOverrides?.homepageDescription?.trim()
      || (!hasSimplifiedTitle ? content.basic.homepageDescription?.trim() : undefined)
      || summary,
    homepageImageAlt: copyOverrides?.homepageImageAlt?.trim()
      || (!hasSimplifiedTitle ? content.basic.homepageImageAlt?.trim() : undefined)
      || heroAlt,
    title: pageTitle,
    subtitle: pageSubtitle,
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
    hero: toJourneyImage(content.hero, heroAlt),
    heroEyebrow: heroOverrides?.eyebrow?.trim()
      || (!hasSimplifiedTitle ? content.basic.heroEyebrow?.trim() : undefined)
      || defaultJourneyHeroEyebrow(defaultInput),
    primaryHref: enquiryHref(routeTitle, "plan"),
    questionHref: enquiryHref(routeTitle, "question"),
    heroFacts: heroOverrides?.facts?.filter(Boolean)
      || (!hasSimplifiedTitle && content.basic.heroFacts?.length ? content.basic.heroFacts : undefined)
      || defaultJourneyHeroFacts(defaultInput),
    promises: inquiryOverrides?.promises?.filter(Boolean)
      || (!hasSimplifiedTitle && content.basic.promises?.length ? content.basic.promises : undefined)
      || DEFAULT_JOURNEY_PROMISES,
    overview: content.overview.paragraphs ?? [],
    seasonNote: seasonNoteTitle && seasonNoteBody
      ? { title: seasonNoteTitle, body: seasonNoteBody }
      : undefined,
    facts: (content.overview.facts ?? []).map(({ label, value }) => [label, value]),
    highlights: (content.highlights.items ?? []).map(({ title, description }) => [title, description]),
    highlightImages: (content.gallery?.images ?? content.highlights.images ?? []).map((image) => toJourneyImage(image, routeTitle)),
    routeStops: (content.route.stops ?? []).map(({ place, days: stopDays }) => [place, stopDays]),
    days,
    suitable: content.audience.suitable ?? [],
    considerations: content.audience.considerations ?? [],
    included: content.inclusions.included ?? [],
    excluded: content.inclusions.excluded ?? [],
    conditions: content.booking.conditions ?? [],
    inquiryEyebrow: inquiryOverrides?.eyebrow?.trim()
      || (!hasSimplifiedTitle ? content.basic.inquiryEyebrow?.trim() : undefined)
      || DEFAULT_JOURNEY_INQUIRY_EYEBROW,
    inquiryFacts: inquiryOverrides?.facts?.filter((fact) => fact.label && fact.value)
      || (!hasSimplifiedTitle && content.basic.inquiryFacts?.length ? content.basic.inquiryFacts : undefined)
      || defaultJourneyInquiryFacts(defaultInput),
    inquiryPromise: inquiryOverrides?.promise?.trim()
      || (!hasSimplifiedTitle ? content.basic.inquiryPromise?.trim() : undefined)
      || DEFAULT_JOURNEY_INQUIRY_PROMISE,
    finalCta,
    seo: {
      title: seoTitle,
      description: seoDescription,
      ogImage: content.seo.ogImage ? toJourneyImage(content.seo.ogImage) : undefined,
    },
  };
}
