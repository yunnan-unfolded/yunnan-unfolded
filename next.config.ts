import type { NextConfig } from "next";

const isPagesBuild = process.env.PAGES_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isPagesBuild
    ? {
        output: "export" as const,
        basePath: "/yunnan-unfolded",
        assetPrefix: "/yunnan-unfolded",
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isPagesBuild,
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
};

export default nextConfig;
