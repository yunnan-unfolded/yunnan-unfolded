import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/journeys", "/walk-yunnan", "/travel-guides", "/about", "/plan-my-trip"];

  return routes.map((route) => ({
    url: `https://yunnanunfolded.com${route}`,
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.7 : 1,
  }));
}
