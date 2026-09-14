import type {
  WALK_DIFFICULTIES,
  WALK_IMAGE_ALIGNMENTS,
  WALK_IMAGE_FOCAL_POINTS,
  WALK_IMAGE_RATIOS,
  WALK_IMAGE_WIDTHS,
  WALK_RISK_LEVELS,
  WALK_ROUTE_TYPES,
} from "../../shared/walkDefaults";

export type WalkDifficulty = (typeof WALK_DIFFICULTIES)[number];
export type WalkImageWidth = (typeof WALK_IMAGE_WIDTHS)[number];
export type WalkImageRatio = (typeof WALK_IMAGE_RATIOS)[number];
export type WalkImageAlignment = (typeof WALK_IMAGE_ALIGNMENTS)[number];
export type WalkImageFocalPoint = (typeof WALK_IMAGE_FOCAL_POINTS)[number];
export type WalkRouteType = (typeof WALK_ROUTE_TYPES)[number];
export type WalkRiskLevel = (typeof WALK_RISK_LEVELS)[number];

export type WalkImage = {
  src: string;
  alt: string;
  displayWidth: WalkImageWidth;
  displayRatio: WalkImageRatio;
  alignment: WalkImageAlignment;
  focalPoint: WalkImageFocalPoint;
  width?: number;
  height?: number;
};

export type WalkStage = {
  title: string;
  body: string;
  images: WalkImage[];
};

export type WalkRouteOption = {
  title: string;
  summary?: string;
  distanceKm?: number;
  duration?: string;
  routeType: WalkRouteType;
  startElevationM?: number;
  highestElevationM?: number;
  elevationGainM?: number;
  riskLevel: WalkRiskLevel;
  terrain?: string;
  suitability?: string;
  riskNotes: string[];
};

export type WalkContent = {
  title: string;
  basic: {
    slug: string;
    region: string;
    summary: string;
    difficulty: WalkDifficulty;
    approximateDuration: string;
    recommendedSeasons: string;
    searchKeywords: string[];
  };
  hero: { src: string; alt: string; width?: number; height?: number };
  route: { introduction: string; options?: WalkRouteOption[]; stages: WalkStage[] };
  gallery: { images: WalkImage[] };
  practical: {
    seasonNote?: string;
    location?: string;
    accessNote?: string;
    signalNote?: string;
    preparationNotes: string[];
    relatedJourney?: string;
  };
  seo: { title?: string; description?: string };
  publication: { status: "draft" | "published" };
};
