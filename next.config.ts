import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const deploymentMode = process.env.SITE_DEPLOYMENT_MODE ?? "local";

if (!["local", "github-project", "custom-domain"].includes(deploymentMode)) {
  throw new Error(
    `Unsupported SITE_DEPLOYMENT_MODE: ${deploymentMode}. Use local, github-project or custom-domain.`,
  );
}

const isStaticExport = deploymentMode !== "local";
const isGitHubProject = deploymentMode === "github-project";
const siteBasePath = isGitHubProject ? "/yunnan-unfolded" : "";
const siteOrigin = isGitHubProject
  ? "https://yunnan-unfolded.github.io"
  : "https://yunnanunfolded.com";

const nextConfig: NextConfig = {
  // Next dev's React debug stream also uses HMR. Allow the exact local preview
  // hosts so binding to 0.0.0.0 does not leave IP-address visitors unhydrated.
  ...(process.env.NODE_ENV === "development"
    ? {
        allowedDevOrigins: [
          "127.0.0.1",
          ...Object.values(networkInterfaces()).flatMap((addresses) =>
            (addresses ?? [])
              .filter((address) => address.family === "IPv4" && !address.internal)
              .map((address) => address.address),
          ),
        ],
      }
    : {}),
  ...(isStaticExport ? { output: "export" as const } : {}),
  ...(isGitHubProject
    ? { basePath: siteBasePath, assetPrefix: siteBasePath }
    : {}),
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_SITE_BASE_PATH: siteBasePath,
    NEXT_PUBLIC_SITE_ORIGIN: siteOrigin,
  },
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
};

export default nextConfig;
