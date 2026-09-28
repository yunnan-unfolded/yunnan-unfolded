import { readGuideBody } from "./travelGuideRichText.ts";
import type { GuideBody } from "../../shared/travelGuideRichText.ts";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { normalizeTravelGuideParagraphs } from "../../shared/travelGuideDefaults.ts";
import type { TravelGuideContent, TravelGuideImage, TravelGuideSection } from "../types/travelGuide.ts";
import { absolutePageUrl } from "./sitePaths.ts";

const travelGuideDirectory = join(process.cwd(), "content", "travel-guides");

export type TravelGuideContentEntry = { filename: string; content: TravelGuideContent };

export type TravelGuideCard = {
  slug: string;
  status: "draft" | "published";
  title: string;
  category: string;
  region?: string;
  summary: string;
  hero?: TravelGuideImage;
  href: string;
};

export type TravelGuideDetail = TravelGuideCard & {
  body: GuideBody;
  introduction: string[];
  sections: Array<Omit<TravelGuideSection, "body" | "images"> & { body: string[]; images: TravelGuideImage[] }>;
  seo: { title: string; description: string };
};

function cleanOptionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

function cleanImage(image?: TravelGuideImage) {
  const src = cleanOptionalText(image?.src);
  if (!src) return undefined;
  return {
    ...image,
    src,
    alt: cleanOptionalText(image?.alt) ?? "",
  };
}

export function travelGuideContentToCard(content: TravelGuideContent): TravelGuideCard {
  const slug = content.basic.slug.trim();
  return {
    slug,
    status: content.publication.status,
    title: content.title.trim(),
    category: content.basic.category.trim(),
    region: cleanOptionalText(content.basic.region),
    summary: content.basic.summary.trim(),
    hero: cleanImage(content.hero),
    href: `/travel-guides/${slug}/`,
  };
}

export function travelGuideContentToDetail(content: TravelGuideContent): TravelGuideDetail {
  const card = travelGuideContentToCard(content);
  return {
    ...card,
    body: readGuideBody(content),
    introduction: normalizeTravelGuideParagraphs(content.content?.introduction),
    sections: (content.content?.sections ?? []).map((section) => ({
      ...section,
      heading: cleanOptionalText(section.heading),
      body: normalizeTravelGuideParagraphs(section.body),
      images: (section.images ?? []).map((image) => cleanImage(image)).filter(Boolean) as TravelGuideImage[],
    })),
    seo: {
      title: cleanOptionalText(content.seo?.title) ?? `${card.title} | Yunnan Unfolded`,
      description: cleanOptionalText(content.seo?.description) ?? card.summary,
    },
  };
}

export function travelGuideEntriesToCards(entries: TravelGuideContentEntry[], includeDraft = false) {
  return entries
    .filter(({ content }) => includeDraft || content.publication.status === "published")
    .map(({ content }) => travelGuideContentToCard(content))
    .filter((guide) => Boolean(guide.slug && guide.title))
    .sort((a, b) => a.title.localeCompare(b.title, "en"));
}

function readTravelGuideContents(): TravelGuideContentEntry[] {
  const entries = readdirSync(travelGuideDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      filename: entry.name,
      content: JSON.parse(readFileSync(join(travelGuideDirectory, entry.name), "utf8")) as TravelGuideContent,
    }));

  const seenSlugs = new Set<string>();
  for (const entry of entries) {
    const slug = entry.content.basic.slug;
    if (!slug || entry.filename !== `${slug}.json`) {
      throw new Error(`Travel Guide filename and slug must match: ${entry.filename}`);
    }
    if (seenSlugs.has(slug)) throw new Error(`Duplicate Travel Guide slug: ${slug}`);
    seenSlugs.add(slug);
  }
  return entries;
}

export const travelGuideContents = readTravelGuideContents();
export const publishedTravelGuides = travelGuideEntriesToCards(travelGuideContents);

export function getTravelGuides(includeDraft = false) {
  if (!includeDraft) return publishedTravelGuides;
  return travelGuideEntriesToCards(readTravelGuideContents(), true);
}

export function getTravelGuideContentBySlug(slug: string, includeDraft = false) {
  const entry = readTravelGuideContents().find(({ content }) => content.basic.slug === slug);
  if (!entry) return undefined;
  if (!includeDraft && entry.content.publication.status !== "published") return undefined;
  return entry;
}

export function getTravelGuideBySlug(slug: string, includeDraft = false) {
  const entry = getTravelGuideContentBySlug(slug, includeDraft);
  return entry ? travelGuideContentToDetail(entry.content) : undefined;
}

export function buildTravelGuideDirectoryStructuredData(guides: TravelGuideCard[], directoryUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Travel Guides",
    description: "Practical guidance for planning a thoughtful journey through Yunnan.",
    url: directoryUrl,
    ...(guides.length > 0 ? {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: guides.length,
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: guide.title,
          url: absolutePageUrl(guide.href),
        })),
      },
    } : {}),
  };
}
