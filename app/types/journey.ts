export type JourneyStatus = "draft" | "published";

export type MediaLayout =
  | "text-only"
  | "image-left"
  | "image-right"
  | "image-above"
  | "image-below"
  | "two-images";

export type ImageSize = "compact" | "standard" | "wide";
export type DisplayRatio = "landscape" | "portrait" | "square" | "original";
export type FocalPoint = "top" | "center" | "bottom" | "left" | "right";

export type JourneyContentImage = {
  src: string;
  alt: string;
  displayRatio?: DisplayRatio;
  focalPoint?: FocalPoint;
  width?: number;
  height?: number;
  position?: string;
  directoryPosition?: string;
  directoryMobilePosition?: string;
  legacyAspect?: "single" | "pair";
};

export type JourneyContent = {
  basic: {
    slug: string;
    collection: string;
    listingDescription: string;
    searchKeywords?: string[];
    homepageDescription?: string;
    homepageImageAlt?: string;
    title: string;
    subtitle: string;
    durationDays: number;
    durationNights: number;
    startLocation: string;
    endLocation: string;
    travelStyle: string;
    activityLevel: string;
    bestSeasons: string;
    priceNote: string;
    heroEyebrow: string;
    heroFacts: string[];
    promises: string[];
    inquiryEyebrow: string;
    inquiryFacts: Array<{ label: string; value: string }>;
    inquiryPromise: string;
  };
  hero: JourneyContentImage;
  overview: {
    paragraphs: string[];
    facts: Array<{ label: string; value: string }>;
    finalCta: {
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel: string;
    };
  };
  highlights: {
    items: Array<{ title: string; description: string }>;
    images: JourneyContentImage[];
  };
  route: {
    display: string;
    stops: Array<{ place: string; days: string }>;
  };
  itinerary: {
    days: Array<{
      day: number;
      title: string;
      subtitle: string;
      route: string;
      drive?: string;
      paragraphs: string[];
      experiences: string[];
      overnight: string;
      note?: string;
      options?: Array<{
        label: string;
        title: string;
        description: string;
        points: string[];
      }>;
      mediaLayout: MediaLayout;
      imageSize: ImageSize;
      images?: JourneyContentImage[];
    }>;
  };
  audience: { suitable: string[]; considerations?: string[] };
  inclusions: { included: string[]; excluded: string[] };
  booking: { conditions: string[] };
  seo: {
    title?: string;
    description?: string;
    ogImage?: JourneyContentImage;
  };
  publication: { status: JourneyStatus };
};

export type JourneyImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position?: string;
  directoryPosition?: string;
  directoryMobilePosition?: string;
  displayRatio?: DisplayRatio;
  focalPoint?: FocalPoint;
  legacyAspect?: "single" | "pair";
};

export type JourneyDayOption = {
  title: string;
  description: string;
  points: string[];
};

export type JourneyDay = {
  day: number;
  title: string;
  subtitle: string;
  route: string;
  drive?: string;
  paragraphs: string[];
  experiences: string[];
  overnight: string;
  note?: string;
  options?: JourneyDayOption[];
  images?: JourneyImage[];
  mediaLayout: MediaLayout;
  imageSize: ImageSize;
};

export type Journey = {
  slug: string;
  status: JourneyStatus;
  collection: string;
  listingDescription: string;
  homepageDescription: string;
  homepageImageAlt: string;
  title: string;
  subtitle: string;
  route: string;
  duration: { days: number; nights: number; label: string };
  startLocation: string;
  endLocation: string;
  travelStyle: string;
  activityLevel: string;
  priceNote: string;
  hero: JourneyImage;
  heroEyebrow: string;
  primaryHref: string;
  questionHref: string;
  heroFacts: string[];
  promises: string[];
  overview: string[];
  facts: [label: string, value: string][];
  highlights: [title: string, description: string][];
  highlightImages: JourneyImage[];
  routeStops: [place: string, days: string][];
  days: JourneyDay[];
  suitable: string[];
  considerations: string[];
  included: string[];
  excluded: string[];
  conditions: string[];
  inquiryEyebrow: string;
  inquiryFacts: { label: string; value: string }[];
  inquiryPromise: string;
  finalCta: {
    eyebrow: string;
    title: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  seo: { title: string; description: string; ogImage?: JourneyImage };
};
