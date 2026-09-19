import type { Metadata } from "next";
import type { TravelGuideDetail } from "./travelGuideContent";
import { absoluteAssetUrl, absolutePageUrl } from "./sitePaths.ts";

export function buildTravelGuideMetadata(guide: TravelGuideDetail): Metadata {
  const isPublished = guide.status === "published";
  const pageUrl = absolutePageUrl(guide.href);
  const image = guide.hero?.src ? absoluteAssetUrl(guide.hero.src) : undefined;

  return {
    title: { absolute: guide.seo.title },
    description: guide.seo.description,
    robots: { index: isPublished, follow: isPublished },
    ...(isPublished ? { alternates: { canonical: pageUrl } } : {}),
    openGraph: {
      title: guide.seo.title,
      description: guide.seo.description,
      ...(isPublished ? { url: pageUrl } : {}),
      siteName: "Yunnan Unfolded",
      type: "article",
      ...(image ? { images: [{ url: image, alt: guide.hero?.alt ?? guide.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: guide.seo.title,
      description: guide.seo.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function buildTravelGuideStructuredData(guide: TravelGuideDetail) {
  if (guide.status !== "published") return [];
  const pageUrl = absolutePageUrl(guide.href);
  const image = guide.hero?.src ? absoluteAssetUrl(guide.hero.src) : undefined;

  return [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absolutePageUrl("/") },
      { "@type": "ListItem", position: 2, name: "Travel Guides", item: absolutePageUrl("/travel-guides/") },
      { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
    ],
  }, {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.seo.description,
    url: pageUrl,
    ...(image ? { image } : {}),
    author: { "@type": "Organization", name: "Yunnan Unfolded" },
    publisher: { "@type": "Organization", name: "Yunnan Unfolded" },
    about: guide.region || "Yunnan travel",
  }];
}
