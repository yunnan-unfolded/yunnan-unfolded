import type { MetadataRoute } from "next";
import { assetPath, routePath } from "./lib/sitePaths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yunnan Unfolded",
    short_name: "Yunnan Unfolded",
    description:
      "Boutique, locally rooted journeys through the mountains, cultures and hidden corners of Yunnan, China.",
    start_url: routePath("/"),
    scope: routePath("/"),
    display: "standalone",
    background_color: "#F7F3EB",
    theme_color: "#14362E",
    icons: [
      {
        src: assetPath("/brand/logo-mark.svg"),
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
