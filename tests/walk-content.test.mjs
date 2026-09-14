import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { walkContentToDetail } from "../app/lib/walkAdapter.ts";
import {
  getWalkBySlug,
  getWalkContentBySlug,
  getWalks,
  publishedWalks,
  walkEntriesToDetails,
  walkContents,
} from "../app/lib/walkContent.ts";
import { buildWalkMetadata, buildWalkStructuredData } from "../app/lib/walkSeo.ts";

const slug = "luoguqing-rhododendron-walk";
const entry = getWalkContentBySlug(slug);

test("the first Walk is a published release candidate with a matching filename", () => {
  assert.ok(entry);
  assert.equal(entry.filename, `${slug}.json`);
  assert.equal(entry.content.title, "Luoguqing Rhododendron Walk");
  assert.equal(entry.content.publication.status, "published");
  assert.equal(walkContents.length, 1);
  assert.equal(publishedWalks.length, 1);
  assert.equal(getWalks().length, 1);
  assert.equal(getWalks(true).length, 1);
  assert.equal(getWalkBySlug(slug)?.title, "Luoguqing Rhododendron Walk");
  assert.equal(getWalkBySlug(slug, true)?.title, "Luoguqing Rhododendron Walk");
  assert.notStrictEqual(getWalkContentBySlug(slug, true), entry);
});

test("draft fixtures remain excluded from public data and keep private metadata", () => {
  const draftContent = structuredClone(entry.content);
  draftContent.title = "Private Draft Walk";
  draftContent.basic.slug = "private-draft-walk";
  draftContent.publication.status = "draft";
  const draftEntry = { filename: "private-draft-walk.json", content: draftContent };
  const draftWalk = walkContentToDetail(draftContent);

  assert.equal(walkEntriesToDetails([draftEntry]).length, 0);
  assert.equal(walkEntriesToDetails([draftEntry], true).length, 1);
  assert.deepEqual(buildWalkMetadata(draftWalk).alternates, { canonical: null });
  assert.deepEqual(buildWalkMetadata(draftWalk).robots, { index: false, follow: false });
  assert.deepEqual(buildWalkStructuredData(draftWalk), []);
});

test("the Walk adapter exposes route-guide data and generates stable enquiry parameters", () => {
  const walk = walkContentToDetail(entry.content);
  assert.equal(walk.approximateDuration, "Varies by route");
  assert.equal(walk.routeOptions.length, 3);
  assert.deepEqual(walk.routeOptions.map((option) => option.distanceKm), [5, 14, 24]);
  assert.deepEqual(walk.routeOptions.map((option) => option.riskLevel), ["lower", "moderate", "high"]);
  assert.equal(walk.routeOptions[2].highestElevationM, 3600);
  assert.equal(walk.routeOptions[2].elevationGainM, 1200);
  assert.match(walk.location, /Tongdian Town/);
  assert.equal(walk.primaryHref, "/plan-my-trip/?source=walk&walk=luoguqing-rhododendron-walk&intent=plan");
  assert.equal(walk.questionHref, "/plan-my-trip/?source=walk&walk=luoguqing-rhododendron-walk&intent=question");
  assert.equal("searchKeywords" in walk, false);
  assert.equal(JSON.stringify(walk).includes("杜鹃徒步"), false);
});

test("shared placeholder headers stay at the top in normal document flow", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.placeholder \{ min-height:100vh; background:var\(--ivory\); \}/);
  assert.match(css, /\.placeholder \.header \{ position:relative;/);
  assert.match(css, /\.placeholder \.header \{[^}]*color:white;/);
  assert.doesNotMatch(css, /\.placeholder \.header \{ position:fixed;/);
});

test("the Walk directory replaces the placeholder and keeps drafts local", () => {
  const source = readFileSync(new URL("../app/walk-yunnan/page.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/walk-yunnan/walk-directory.module.css", import.meta.url), "utf8");
  const placeholderSource = readFileSync(new URL("../app/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /getWalks\(localDraftPreviewEnabled\)/);
  assert.match(source, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(source, /Route choices/);
  assert.match(source, /Highest point/);
  assert.match(source, /Elevation gain/);
  assert.match(source, /walk\.status === "draft"/);
  assert.match(source, /const publicWalks = getWalks\(false\)/);
  assert.match(source, /"@type": "CollectionPage"/);
  assert.match(source, /"@type": "ItemList"/);
  assert.match(source, /numberOfItems: publicWalks\.length/);
  assert.match(css, /\.page :global\(\.header\) \{[^}]*color: #fff;/);
  assert.match(css, /\.page :global\(\.header\) \{[^}]*width: 100%;/);
  assert.match(css, /\.page :global\(\.header\) \{[^}]*max-width: none;/);
  assert.match(css, /\.page :global\(\.header\)::before \{[^}]*width: 100%;[^}]*transform: none;/);
  assert.match(css, /\.page :global\(\.mobile-menu\) \{[^}]*safe-area-inset-right[^}]*safe-area-inset-left/);
  assert.match(css, /\.page :global\(\.menu-button\) \{[^}]*margin-left: auto;/);
  assert.match(css, /\.page :global\(\.brand\) \{[^}]*z-index: 2;/);
  assert.doesNotMatch(placeholderSource, /"walk-yunnan":/);
});

test("the homepage reads Walk collection data without leaking drafts to production", () => {
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const brandCss = readFileSync(new URL("../app/brand-overrides.css", import.meta.url), "utf8");
  assert.match(source, /getWalks\(localDraftPreviewEnabled\)\.slice\(0, 1\)/);
  assert.match(source, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(source, /walk\.status === "draft" \? <span>Local Draft<\/span>/);
  assert.match(source, /`\/walk-yunnan\/\$\{walk\.slug\}\/`/);
  assert.match(source, /walk\.routeOptions/);
  assert.match(source, /walk\.difficulty/);
  assert.match(source, /walk\.recommendedSeasons/);
  assert.match(source, /assetPath\(walk\.hero\.src\)/);
  assert.match(source, /--walk-card-aspect-ratio/);
  assert.match(source, /Routes in preparation/);
  assert.doesNotMatch(source, /walkingRoutes/);
  assert.doesNotMatch(source, /from "\.\/data\/siteContent";[^\n]*walkingRoutes/);
  assert.match(css, /aspect-ratio:var\(--walk-card-aspect-ratio,3\/2\)/);
  assert.match(brandCss, /\.walk \{\s*background: var\(--paper\);\s*\}/);
  assert.equal(getWalks(false).length, 1);
  assert.equal(getWalks(true)[0]?.slug, "luoguqing-rhododendron-walk");
});

test("the published Walk uses existing Luoguqing assets with accessible descriptions", () => {
  const images = [
    entry.content.hero,
    ...entry.content.route.stages.flatMap((stage) => stage.images),
    ...entry.content.gallery.images,
  ];
  assert.ok(images.length >= 1);

  for (const image of images) {
    assert.match(image.src, /^\/images\/journeys\/罗古箐\//);
    assert.equal(existsSync(join(process.cwd(), "public", image.src.replace(/^\//, ""))), true, image.src);
    assert.equal(typeof image.alt, "string");
    assert.notEqual(image.alt.trim(), "", `${image.src} needs an English image description`);
  }

  const stageImages = entry.content.route.stages.flatMap((stage) => stage.images);
  const allowedWidths = new Set(["standard", "large", "full-bleed", "half"]);
  const allowedRatios = new Set(["original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"]);
  const allowedAlignments = new Set(["center", "left", "right"]);
  const allowedFocalPoints = new Set(["center", "top", "bottom", "left", "right"]);
  for (const image of stageImages) {
    assert.equal(allowedWidths.has(image.displayWidth), true, image.displayWidth);
    assert.equal(allowedRatios.has(image.displayRatio), true, image.displayRatio);
    assert.equal(allowedAlignments.has(image.alignment), true, image.alignment);
    assert.equal(allowedFocalPoints.has(image.focalPoint), true, image.focalPoint);
  }
});

test("the related draft Journey resolves without changing Journey content", () => {
  const relatedReference = entry.content.practical.relatedJourney;
  const related = JSON.parse(readFileSync(new URL(`../${relatedReference}`, import.meta.url), "utf8"));
  assert.equal(related.title, "When the Mountains Bloom");
  assert.equal(related.basic.slug, "yunnan-rhododendron-hiking");
  assert.equal(related.publication.status, "draft");
});

test("the public sitemap includes the published Walk", () => {
  const source = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(source, /publishedWalks\.map/);
  assert.equal(publishedWalks.some((walk) => walk.slug === slug), true);
  assert.match(source, /const walkRoutes = publishedWalks\.map\(\(walk\) => `\/walk-yunnan\/\$\{walk\.slug\}`\)/);
  assert.equal(source.includes("Luoguqing Rhododendron Walk"), false);
});

test("published Walk metadata and structured data use stable public URLs", () => {
  const walk = walkContentToDetail(entry.content);
  const metadata = buildWalkMetadata(walk);
  const structuredData = buildWalkStructuredData(walk);
  const pageUrl = "https://yunnanunfolded.com/walk-yunnan/luoguqing-rhododendron-walk/";
  const heroUrl = "https://yunnanunfolded.com/images/journeys/罗古箐/Codex-图像-2026年9月2日-23_06_03.png";

  assert.deepEqual(metadata.alternates, { canonical: pageUrl });
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.openGraph?.url, pageUrl);
  assert.deepEqual(metadata.openGraph?.images, [{
    url: heroUrl,
    width: 1086,
    height: 1448,
    alt: entry.content.hero.alt,
  }]);
  assert.equal(metadata.twitter?.card, "summary_large_image");
  assert.deepEqual(metadata.twitter?.images, [{ url: heroUrl, alt: entry.content.hero.alt }]);
  assert.deepEqual(structuredData.map((item) => item["@type"]), ["BreadcrumbList", "Article"]);
  assert.deepEqual(
    structuredData[0].itemListElement.map((item) => item.item),
    ["https://yunnanunfolded.com/", "https://yunnanunfolded.com/walk-yunnan/", pageUrl],
  );
  assert.equal(structuredData[1].url, pageUrl);
  assert.equal(structuredData[1].image, heroUrl);
  assert.equal("author" in structuredData[1], false);
});

test("the Walk route uses isolated SEO helpers and hides related drafts in production", () => {
  const source = readFileSync(new URL("../app/walk-yunnan/[slug]/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../app/components/walks/WalkDetailPage.tsx", import.meta.url), "utf8");
  assert.match(source, /process\.env\.NODE_ENV === "development"/);
  assert.match(source, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(source, /__no-published-walks__/);
  assert.match(source, /return buildWalkMetadata\(walk\)/);
  assert.match(source, /buildWalkStructuredData\(walk\)/);
  assert.match(source, /relatedEntry\.content\.publication\.status === "published" \|\| localDraftPreviewEnabled/);
  assert.match(component, /routePath\("\/walk-yunnan"\)/);
  assert.doesNotMatch(source, /HikingTrail/);
});

test("the Walk page renders all supported image controls without visible image descriptions", () => {
  const source = readFileSync(new URL("../app/components/walks/WalkDetailPage.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/components/walks/walk-detail.module.css", import.meta.url), "utf8");
  for (const value of ["standard", "large", "full-bleed", "half", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"]) {
    assert.ok(source.includes(value), `missing renderer preset: ${value}`);
  }
  assert.match(source, /objectPosition: focalPoints\[image\.focalPoint\]/);
  assert.match(source, /image\.displayRatio === "original"/);
  assert.match(source, /image\.displayWidth === "half" && nextImage\?\.displayWidth === "half"/);
  assert.doesNotMatch(source, /<figcaption/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.halfPair \{[\s\S]*grid-template-columns: 1fr/);
});
