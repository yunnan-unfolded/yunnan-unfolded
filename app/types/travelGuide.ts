import type { GuideBody } from "../../shared/travelGuideRichText";
import type {
  TRAVEL_GUIDE_IMAGE_ALIGNMENTS,
  TRAVEL_GUIDE_IMAGE_FOCAL_POINTS,
  TRAVEL_GUIDE_IMAGE_RATIOS,
  TRAVEL_GUIDE_IMAGE_WIDTHS,
} from "../../shared/travelGuideDefaults";

export type TravelGuideImageWidth = (typeof TRAVEL_GUIDE_IMAGE_WIDTHS)[number];
export type TravelGuideImageRatio = (typeof TRAVEL_GUIDE_IMAGE_RATIOS)[number];
export type TravelGuideImageAlignment = (typeof TRAVEL_GUIDE_IMAGE_ALIGNMENTS)[number];
export type TravelGuideImageFocalPoint = (typeof TRAVEL_GUIDE_IMAGE_FOCAL_POINTS)[number];

export type TravelGuideImage = {
  src?: string;
  alt?: string;
  displayWidth?: TravelGuideImageWidth;
  displayRatio?: TravelGuideImageRatio;
  alignment?: TravelGuideImageAlignment;
  focalPoint?: TravelGuideImageFocalPoint;
  width?: number;
  height?: number;
};

export type TravelGuideSection = {
  heading?: string;
  body?: string;
  images?: TravelGuideImage[];
};

export type TravelGuideContent = {
  editorLabel?: string;
  title: string;
  basic: {
    slug: string;
    category: string;
    region?: string;
    summary: string;
  };
  hero?: TravelGuideImage;
  body?: string | GuideBody;
  content?: {
    introduction?: string;
    sections?: TravelGuideSection[];
  };
  seo?: {
    title?: string;
    description?: string;
  };
  publication: {
    status: "draft" | "published";
  };
};
