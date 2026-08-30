import type { MetadataRoute } from "next";
import { publishedJourneys } from "./lib/journeyContent";
import { absolutePageUrl } from "./lib/sitePaths";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/journeys", "/walk-yunnan", "/travel-guides", "/about", "/plan-my-trip"];
  const journeyRoutes = publishedJourneys.map((journey) => `/journeys/${journey.slug}`);

  return [...routes, ...journeyRoutes].map((route) => ({
    url: absolutePageUrl(route),
    changeFrequency: route ? "monthly" : "weekly" as const,
    priority: route.startsWith("/journeys/") ? 0.8 : route ? 0.7 : 1,
  }));
}
