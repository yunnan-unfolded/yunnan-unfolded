import type { MetadataRoute } from "next";
import { publishedJourneys } from "./lib/journeyContent";
import { publishedTravelGuides } from "./lib/travelGuideContent";
import { publishedWalks } from "./lib/walkContent";
import { absolutePageUrl } from "./lib/sitePaths";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/journeys", "/walk-yunnan", "/travel-guides", "/about", "/plan-my-trip"];
  const journeyRoutes = publishedJourneys.map((journey) => `/journeys/${journey.slug}`);
  const travelGuideRoutes = publishedTravelGuides.map((guide) => `/travel-guides/${guide.slug}`);
  const walkRoutes = publishedWalks.map((walk) => `/walk-yunnan/${walk.slug}`);

  return [...routes, ...journeyRoutes, ...walkRoutes, ...travelGuideRoutes].map((route) => ({
    url: absolutePageUrl(route),
    changeFrequency: route ? "monthly" : "weekly" as const,
    priority: route.startsWith("/journeys/") ? 0.8 : route ? 0.7 : 1,
  }));
}
