import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const settings = {
  "github-project": {
    basePath: "/yunnan-unfolded",
    siteOrigin: "https://yunnan-unfolded.github.io",
  },
  "custom-domain": {
    basePath: "",
    siteOrigin: "https://yunnanunfolded.com",
  },
};

const mode = process.argv[2];
const config = settings[mode];

if (!config) {
  console.error("Usage: node scripts/verify-static-export.mjs <github-project|custom-domain>");
  process.exit(1);
}

const outputDir = resolve(process.cwd(), process.argv[3] ?? "out");
const failures = [];
const requiredPages = ["", "journeys", "walk-yunnan", "travel-guides", "about", "plan-my-trip"];
const requiredAssets = [
  "brand/logo-horizontal-light.svg",
  "brand/logo-wordmark-light.svg",
  "brand/logo-mark.svg",
  "images/hero/jiuzihai-aerial.jpg",
  "images/hero/jiuzihai-panorama.jpg",
  "images/hero/laoyao-mountain.jpg",
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readOutput(path) {
  const fullPath = join(outputDir, path);
  assert(existsSync(fullPath), `Missing output file: ${path}`);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

function pageUrl(route = "") {
  const suffix = route ? `/${route}/` : "/";
  return `${config.siteOrigin}${config.basePath}${suffix}`;
}

function collectFiles(directory, extension, files = []) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) collectFiles(fullPath, extension, files);
    else if (entry.endsWith(extension)) files.push(fullPath);
  }
  return files;
}

function collectAllFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) collectAllFiles(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

assert(existsSync(outputDir), "Static export directory does not exist");

if (existsSync(outputDir)) {
  for (const route of requiredPages) {
    const path = route ? `${route}/index.html` : "index.html";
    const html = readOutput(path);
    assert(html.includes(`rel="canonical" href="${pageUrl(route)}"`), `Incorrect canonical URL in ${path}`);
  }

  for (const asset of requiredAssets) {
    assert(existsSync(join(outputDir, asset)), `Missing exported asset: ${asset}`);
  }

  for (const publicFile of collectAllFiles(join(process.cwd(), "public"))) {
    const publicPath = relative(join(process.cwd(), "public"), publicFile);
    assert(existsSync(join(outputDir, publicPath)), `Public asset was not exported: ${publicPath}`);
  }

  const indexHtml = readOutput("index.html");
  const nextPrefix = `${config.basePath}/_next/`;
  assert(indexHtml.includes(`href="${nextPrefix}`), "CSS path does not use the selected build base path");
  assert(indexHtml.includes(`src="${nextPrefix}`), "JavaScript path does not use the selected build base path");

  const allHtml = collectFiles(outputDir, ".html")
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  for (const asset of requiredAssets) {
    assert(allHtml.includes(`${config.basePath}/${asset}`), `Exported HTML does not reference ${asset} with the selected base path`);
  }

  assert(
    allHtml.includes(`${config.siteOrigin}${config.basePath}/images/hero/jiuzihai-panorama.jpg`),
    "Open Graph image is not the exported static hero asset",
  );
  assert(!allHtml.includes("opengraph-image"), "Dynamic Open Graph route is still referenced");

  const sitemap = readOutput("sitemap.xml");
  for (const route of requiredPages) {
    assert(sitemap.includes(`<loc>${pageUrl(route)}</loc>`), `Sitemap is missing ${pageUrl(route)}`);
  }

  const robots = readOutput("robots.txt");
  assert(
    robots.includes(`Sitemap: ${config.siteOrigin}${config.basePath}/sitemap.xml`),
    "robots.txt references the wrong sitemap URL",
  );

  const manifest = readOutput("manifest.webmanifest");
  assert(manifest.includes(`"start_url":"${config.basePath}/"`), "Manifest start_url is incorrect");
  assert(manifest.includes(`${config.basePath}/brand/logo-mark.svg`), "Manifest icon path is incorrect");

  const unexpectedBase = mode === "custom-domain" ? "/yunnan-unfolded" : null;
  if (unexpectedBase) {
    for (const file of collectFiles(outputDir, ".html")) {
      const contents = readFileSync(file, "utf8");
      assert(!contents.includes(unexpectedBase), `Root build contains project base path in ${relative(outputDir, file)}`);
    }
  }
}

if (failures.length) {
  console.error(`Static export verification failed for ${mode}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static export verification passed for ${mode}.`);
