import type { Metadata } from "next";
import type { WalkDetail } from "./walkAdapter";
import { absoluteAssetUrl, absolutePageUrl } from "./sitePaths.ts";

export type WalkStructuredData = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList" | "Article";
  [key: string]: unknown;
};

export function buildWalkMetadata(walk: WalkDetail): Metadata {
  if (walk.status !== "published") {
    return {
      title: { absolute: `${walk.title} — Local Draft Preview` },
      alternates: { canonical: null },
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = absolutePageUrl(`/walk-yunnan/${walk.slug}`);
  const imageUrl = absoluteAssetUrl(walk.hero.src);

  return {
    title: { absolute: walk.seo.title },
    description: walk.seo.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: walk.seo.title,
      description: walk.seo.description,
      url: pageUrl,
      siteName: "Yunnan Unfolded",
      type: "article",
      images: [{
        url: imageUrl,
        width: walk.hero.width,
        height: walk.hero.height,
        alt: walk.hero.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: walk.seo.title,
      description: walk.seo.description,
      images: [{ url: imageUrl, alt: walk.hero.alt }],
    },
  };
}

export function buildWalkStructuredData(walk: WalkDetail): WalkStructuredData[] {
  if (walk.status !== "published") return [];

  const pageUrl = absolutePageUrl(`/walk-yunnan/${walk.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absolutePageUrl("/") },
        { "@type": "ListItem", position: 2, name: "Walk Yunnan", item: absolutePageUrl("/walk-yunnan") },
        { "@type": "ListItem", position: 3, name: walk.title, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: walk.title,
      description: walk.seo.description,
      url: pageUrl,
      image: absoluteAssetUrl(walk.hero.src),
      publisher: { "@type": "Organization", name: "Yunnan Unfolded", url: absolutePageUrl("/") },
    },
  ];
}
