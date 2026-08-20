import type { MetadataRoute } from "next";
import { absolutePageUrl } from "./lib/sitePaths";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/journeys", "/walk-yunnan", "/travel-guides", "/about", "/plan-my-trip"];

  return routes.map((route) => ({
    url: absolutePageUrl(route),
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1,
  }));
}
