const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://yunnanunfolded.com")
  .replace(/\/$/, "");

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function assetPath(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${basePath}${normalizePath(path)}`;
}

export function routePath(path = "/") {
  const normalized = normalizePath(path);
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${basePath}${withSlash}`;
}

export function absoluteAssetUrl(path: string) {
  return `${siteOrigin}${assetPath(path)}`;
}

export function absolutePageUrl(path = "/") {
  return `${siteOrigin}${routePath(path)}`;
}

export const publicSiteOrigin = siteOrigin;
