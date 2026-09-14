import { routePath } from "./sitePaths.ts";
import type { WalkContent, WalkImage, WalkRouteOption, WalkStage } from "../types/walk.ts";

const difficultyLabels = {
  gentle: "Gentle Walk",
  "easy-moderate": "Easy to Moderate",
  "high-country": "High-Country Walking",
} as const;

export type WalkDetail = {
  slug: string;
  status: "draft" | "published";
  title: string;
  region: string;
  summary: string;
  difficulty: string;
  approximateDuration?: string;
  recommendedSeasons: string;
  hero: WalkContent["hero"];
  introduction: string[];
  routeOptions: WalkRouteOption[];
  stages: WalkStage[];
  gallery: WalkImage[];
  seasonNote?: string;
  location?: string;
  accessNote?: string;
  signalNote?: string;
  preparationNotes: string[];
  relatedJourneyReference?: string;
  primaryHref: string;
  questionHref: string;
  seo: {
    title: string;
    description: string;
  };
};

export function splitWalkParagraphs(value: string) {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function enquiryHref(slug: string, intent: "plan" | "question") {
  const query = new URLSearchParams({ source: "walk", walk: slug, intent });
  return `${routePath("/plan-my-trip")}?${query.toString()}`;
}

export function walkContentToDetail(content: WalkContent): WalkDetail {
  const slug = content.basic.slug;

  return {
    slug,
    status: content.publication.status,
    title: content.title,
    region: content.basic.region,
    summary: content.basic.summary,
    difficulty: difficultyLabels[content.basic.difficulty],
    approximateDuration: content.basic.approximateDuration.trim() || undefined,
    recommendedSeasons: content.basic.recommendedSeasons,
    hero: content.hero,
    introduction: splitWalkParagraphs(content.route.introduction),
    routeOptions: content.route.options ?? [],
    stages: content.route.stages,
    gallery: content.gallery.images,
    seasonNote: content.practical.seasonNote?.trim() || undefined,
    location: content.practical.location?.trim() || undefined,
    accessNote: content.practical.accessNote?.trim() || undefined,
    signalNote: content.practical.signalNote?.trim() || undefined,
    preparationNotes: content.practical.preparationNotes,
    relatedJourneyReference: content.practical.relatedJourney?.trim() || undefined,
    primaryHref: enquiryHref(slug, "plan"),
    questionHref: enquiryHref(slug, "question"),
    seo: {
      title: content.seo.title?.trim() || `${content.title} | Yunnan Unfolded`,
      description: content.seo.description?.trim() || content.basic.summary,
    },
  };
}

export function relatedJourneyFilename(reference?: string) {
  if (!reference) return undefined;
  return reference.replaceAll("\\", "/").split("/").at(-1);
}
