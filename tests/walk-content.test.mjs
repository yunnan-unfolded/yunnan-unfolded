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
  walkContents,
} from "../app/lib/walkContent.ts";

const slug = "luoguqing-rhododendron-walk";
const entry = getWalkContentBySlug(slug);

test("the first Walk is an isolated local draft with a matching filename", () => {
  assert.ok(entry);
  assert.equal(entry.filename, `${slug}.json`);
  assert.equal(entry.content.title, "Luoguqing Rhododendron Walk");
  assert.equal(entry.content.publication.status, "draft");
  assert.equal(walkContents.length, 1);
  assert.equal(publishedWalks.length, 0);
  assert.equal(getWalks().length, 0);
  assert.equal(getWalks(true).length, 1);
  assert.equal(getWalkBySlug(slug), undefined);
  assert.equal(getWalkBySlug(slug, true)?.title, "Luoguqing Rhododendron Walk");
  assert.notStrictEqual(getWalkContentBySlug(slug, true), entry);
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

test("the draft uses only existing Luoguqing assets and valid independent image presets", () => {
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

test("the public sitemap excludes the draft Walk", () => {
  const source = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(source, /publishedWalks\.map/);
  assert.equal(publishedWalks.some((walk) => walk.slug === slug), false);
  assert.equal(source.includes("Luoguqing Rhododendron Walk"), false);
});

test("the Walk route keeps draft SEO private and published SEO standards ready", () => {
  const source = readFileSync(new URL("../app/walk-yunnan/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /process\.env\.NODE_ENV === "development"/);
  assert.match(source, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(source, /__no-published-walks__/);
  assert.match(source, /alternates:\s*\{ canonical: null \}/);
  assert.match(source, /robots:\s*\{ index: false, follow: false \}/);
  assert.match(source, /const structuredData = isPublished \?/);
  assert.match(source, /"@type": "BreadcrumbList"/);
  assert.match(source, /"@type": "Article"/);
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
