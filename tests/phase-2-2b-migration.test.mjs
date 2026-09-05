import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { migrateJourneyDirectory, migrateJourneyDocument, normalizeMigratedSlug } from "../scripts/migrate-journeys-phase-2-2b.mjs";

test("custom Journey URLs are normalized without exposing file extensions or path prefixes", () => {
  assert.equal(normalizeMigratedSlug("/journeys/Yunnan Rhododendron Hiking.json/"), "yunnan-rhododendron-hiking");
  assert.equal(normalizeMigratedSlug("journeys-yunnan-rhododendron-hiking"), "yunnan-rhododendron-hiking");
});

test("legacy documents migrate without losing user content or duplicating fixed editor fields", () => {
  const legacy = {
    basic: {
      slug: "journeys-user-route",
      collection: "User Route",
      listingDescription: "User summary",
      homepageDescription: "Distinct card summary",
      searchKeywords: ["用户关键词", "User keyword"],
      durationDays: 1,
      durationNights: 0,
      heroEyebrow: "CUSTOM HERO",
      heroFacts: ["ONE DAY"],
      promises: ["Private journey"],
    },
    hero: { src: "/hero.webp", alt: "User hero alt", width: 1200, height: 800 },
    overview: { paragraphs: ["User paragraph"], facts: [], finalCta: { title: "User CTA" } },
    highlights: { items: [{ title: "User highlight", description: "User detail" }], images: [{ src: "/highlight.webp", alt: "Highlight" }, { src: "", alt: "placeholder" }] },
    route: { display: "A → B", stops: [] },
    itinerary: { days: [{ day: 1, title: "Day one", route: "A → B", overnight: "B", subtitle: "Intro", paragraphs: ["Body"], experiences: ["Experience"], note: "Note", mediaLayout: "image-right", imageSize: "standard", images: [], options: [{ label: "Option A", title: "Choice", description: "Description", points: ["Point"] }] }] },
    audience: { suitable: [] }, inclusions: { included: [], excluded: [] }, booking: { conditions: [] }, seo: {}, publication: { status: "draft" },
    userExtension: { mustRemain: true },
  };
  const migrated = migrateJourneyDocument(legacy);
  assert.equal(migrated.title, "User Route");
  assert.equal(migrated.summary, "User summary");
  assert.equal(migrated.basic.slug, "user-route");
  assert.deepEqual(migrated.basic.searchKeywords, legacy.basic.searchKeywords);
  assert.deepEqual(migrated.itinerary, legacy.itinerary);
  assert.deepEqual(migrated.userExtension, legacy.userExtension);
  assert.equal(migrated.advanced.copy.homepageDescription, "Distinct card summary");
  assert.equal(migrated.advanced.hero.imageAlt, "User hero alt");
  assert.equal(migrated.advanced.inquiry.finalCta.title, "User CTA");
  assert.deepEqual(migrated.gallery.images, [{ src: "/highlight.webp", alt: "Highlight" }]);
  assert.equal("collection" in migrated.basic, false);
  assert.equal("images" in migrated.highlights, false);
  assert.deepEqual(migrateJourneyDocument(migrated), migrated);
});

test("directory migration renames the Tina-created draft once and is repeatable", () => {
  const directory = mkdtempSync(join(tmpdir(), "journey-migration-"));
  try {
    const oldPath = join(directory, "journeys-yunnan-rhododendron-hiking.json");
    writeFileSync(oldPath, JSON.stringify({ title: "When the Mountains Bloom", summary: "Summary", basic: { slug: "journeys-yunnan-rhododendron-hiking" }, hero: {}, overview: {}, highlights: {}, route: {}, itinerary: { days: [] }, audience: {}, inclusions: {}, booking: {}, seo: {}, publication: { status: "draft" } }), "utf8");
    const first = migrateJourneyDirectory(directory);
    assert.deepEqual(first, ["yunnan-rhododendron-hiking.json"]);
    const renamed = JSON.parse(readFileSync(join(directory, "yunnan-rhododendron-hiking.json"), "utf8"));
    assert.equal(renamed.basic.slug, "yunnan-rhododendron-hiking");
    assert.equal(renamed.publication.status, "draft");
    assert.deepEqual(migrateJourneyDirectory(directory), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
