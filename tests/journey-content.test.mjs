import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { journeyContentToViewModel, normalizeJourneyImageSrc } from "../app/lib/journeyAdapter.ts";
import { validateJourneyContent } from "../app/lib/journeyValidation.ts";
import { formatJourneyLogistics } from "../shared/journeyDefaults.ts";

const contentPath = new URL("../content/journeys/yunnan-slowly.json", import.meta.url);
const content = JSON.parse(readFileSync(contentPath, "utf8"));
const draftPath = new URL("../content/journeys/yunnan-rhododendron-hiking.json", import.meta.url);
const draft = JSON.parse(readFileSync(draftPath, "utf8"));

test("published Journey content is complete and uses stable generated enquiry links", () => {
  assert.deepEqual(validateJourneyContent(content, "yunnan-slowly.json"), []);
  const journey = journeyContentToViewModel(content);
  assert.equal(journey.status, "published");
  assert.equal(journey.days.length, 9);
  assert.equal(journey.primaryHref, "/plan-my-trip/?journey=Yunnan%2C%20Slowly&source=journey-detail&intent=plan");
  assert.equal(journey.questionHref, "/plan-my-trip/?journey=Yunnan%2C%20Slowly&source=journey-detail&intent=question");
  assert.equal(journey.days[3].options.length, 2);
  assert.equal(journey.days[8].options.length, 2);
  assert.ok(content.basic.searchKeywords.includes("沙溪"));
  assert.ok(content.basic.searchKeywords.includes("Laoyao Mountain"));
  assert.equal("searchKeywords" in journey, false);
  assert.equal(JSON.stringify(journey).includes("云南私人定制"), false);
  assert.equal(
    createHash("sha256").update(JSON.stringify(journey)).digest("hex"),
    "57eb6e543174b3f02a334836e0255fbb2668cf4946fa496f83961e8fa6470f03",
    "the approved Yunnan, Slowly public view model must remain byte-for-byte stable",
  );
  assert.equal(1 + content.gallery.images.length + content.itinerary.days.flatMap((day) => day.images ?? []).length, 12);
});

test("the user-created rhododendron route keeps its content and remains a correctly named draft", () => {
  assert.equal(draft.title, "When the Mountains Bloom");
  assert.equal(draft.summary, "Five days on the rhododendron trails of Northwest Yunnan");
  assert.equal(draft.basic.slug, "yunnan-rhododendron-hiking");
  assert.equal(draft.publication.status, "draft");
  assert.ok(draft.highlights.items.length >= 1);
  assert.ok(draft.gallery.images.length >= 1);
  assert.ok(draft.itinerary.days.length >= 1);
  assert.equal(draft.advanced.inquiry.enabled, false);
  assert.equal(JSON.stringify(draft).includes("Walk through Yunnan’s wild rhododendron season"), true);
  const journey = journeyContentToViewModel(draft);
  assert.deepEqual(journey.heroFacts, ["5 DAYS · 4 NIGHTS", "MAY TO JULY", "EASY TO MODERATE", "PRIVATE JOURNEY"]);
  assert.equal(draft.advanced.hero.enabled, false);
  assert.equal(draft.highlights.items.at(-2).title, "Let the journey slow down in Shaxi");
  assert.equal(draft.highlights.items.at(-1).title, "Travel privately and leave room for the unexpected");
  assert.equal(draft.itinerary.days.length, 5);
  assert.equal(1 + draft.gallery.images.length + draft.itinerary.days.flatMap((day) => day.images ?? []).length, 14);
  assert.equal(draft.itinerary.days[3].logistics.includes("Approx. 3 hours / 110 km"), true);
  assert.equal(draft.itinerary.days[3].paragraphs.some((paragraph) => paragraph.includes("valley. Staying overnight")), true);
  assert.equal(draft.basic.endLocation, "Lijiang or Dali");
  assert.equal(journey.suitable.length, 5);
  assert.equal(journey.included.length, 5);
  assert.equal(journey.excluded.length, 5);
  assert.equal(journey.seasonNote?.title, "A Note about the Flowering Season");
  assert.deepEqual(journey.considerations, []);
  assert.deepEqual(journey.conditions, []);
  assert.deepEqual(
    journey.days.slice(0, 3).map((day) => formatJourneyLogistics(day.logistics)),
    [
      "Arrive in Lijiang · Overnight in Lijiang",
      "Lijiang → Maxiang Road → Luoguqing · Overnight in Luoguqing or Tongdian",
      "Hiking in Luoguqing · Overnight in Luoguqing or Tongdian",
    ],
  );
});

test("daily media presets remain safe while image collections are unlimited", () => {
  const allowedLayouts = new Set(["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"]);
  const allowedSizes = new Set(["compact", "standard", "wide"]);
  const allowedRatios = new Set(["landscape", "portrait", "square", "original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"]);
  const allowedFocalPoints = new Set(["top", "center", "bottom", "left", "right"]);

  for (const day of content.itinerary.days) {
    assert.ok(allowedLayouts.has(day.mediaLayout));
    assert.ok(allowedSizes.has(day.imageSize));
    for (const image of day.images ?? []) {
      assert.ok(allowedRatios.has(image.displayRatio));
      assert.ok(allowedFocalPoints.has(image.focalPoint));
    }
  }

  assert.deepEqual(
    content.itinerary.days.map((day) => day.mediaLayout),
    ["image-right", "image-left", "image-right", "image-left", "image-right", "image-left", "image-right", "image-left", "text-only"],
  );
});

test("Tina staging media URLs resolve back to the exported local Journey assets", () => {
  assert.equal(
    normalizeJourneyImageSrc("https://assets.tina.io/project/__staging/main/__file/yunnan-slowly/laoyao-mountain-yunnan-2560.webp"),
    "/images/journeys/yunnan-slowly/laoyao-mountain-yunnan-2560.webp",
  );
  assert.equal(
    normalizeJourneyImageSrc("/images/journeys/yunnan-slowly/laoyao-mountain-yunnan-2560.webp"),
    "/images/journeys/yunnan-slowly/laoyao-mountain-yunnan-2560.webp",
  );
  assert.equal(normalizeJourneyImageSrc("https://example.com/photo.webp"), "https://example.com/photo.webp");
});

test("an incomplete draft is allowed but the same content cannot be published", () => {
  const draft = {
    basic: { slug: "draft-layout-test", durationDays: 0 },
    hero: {}, overview: {}, highlights: {}, route: {}, itinerary: { days: [] },
    audience: {}, inclusions: {}, booking: {}, seo: {}, publication: { status: "draft" },
  };
  assert.deepEqual(validateJourneyContent(draft, "draft-layout-test.json"), []);
  draft.publication.status = "published";
  assert.ok(validateJourneyContent(draft, "draft-layout-test.json").length > 0);
});

test("Tina editor exposes Chinese groups and visual media presets", () => {
  const config = readFileSync(new URL("../tina/config.ts", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/components/journeys/tour-product.module.css", import.meta.url), "utf8");
  const groups = ["1. 基本信息", "2. 行程概览", "3. 行程亮点", "4. 每日行程", "5. 包含与不包含", "6. 适合人群", "7. 图片", "8. 保存与发布", "9. 高级设置"];
  let cursor = -1;
  for (const group of groups) {
    const next = config.indexOf(group);
    assert.ok(next > cursor, `missing or out-of-order Tina group: ${group}`);
    cursor = next;
  }
  for (const value of ["image-left", "image-right", "image-above", "two-images", "standard", "wide", "original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"]) {
    assert.ok(config.includes(value), `missing editor preset: ${value}`);
  }
  const dayEditor = readFileSync(new URL("../tina/fields/JourneyDaysField.tsx", import.meta.url), "utf8");
  assert.match(dayEditor, /第\{index \+ 1\}天｜/);
  assert.match(dayEditor, /交通与住宿（英文）/);
  assert.match(dayEditor, /添加可选方案 A\/B/);
  assert.match(dayEditor, /确定删除第\$\{index \+ 1\}天吗/);
  assert.match(dayEditor, /建议每一天使用 1–6 张图片/);
  const imageEditor = readFileSync(new URL("../tina/fields/JourneyImageField.tsx", import.meta.url), "utf8");
  assert.match(imageEditor, /替换上传请使用不同的唯一英文文件名/);
  assert.match(imageEditor, /tina-dimension-check=\$\{Date\.now\(\)\}/);
  const linesEditor = readFileSync(new URL("../tina/fields/LinesListField.tsx", import.meta.url), "utf8");
  assert.match(linesEditor, /normalizeLinesList/);
  assert.match(config, /component: LinesListField as never/);
  assert.match(config, /name: "seasonNote"/);
  const productTemplate = readFileSync(new URL("../app/components/journeys/TourProductPage.tsx", import.meta.url), "utf8");
  assert.match(productTemplate, /Why Travel with Yunnan Unfolded/);
  assert.match(productTemplate, /journey\.seasonNote/);
  assert.match(productTemplate, /journey\.conditions\.length > 0/);
  assert.doesNotMatch(config, /name: "images"[^\n]+max:\s*[23]/);
  assert.match(config, /component: PublicationStatusField/);
  assert.match(config, /isTitle:\s*true/);
  assert.match(config, /readonly:\s*true/);
  assert.match(config, /process\.env\.TINA_SEARCH_TOKEN/);
  assert.match(config, /process\.env\.TINA_PUBLIC_SEARCH_ENABLED/);
  assert.match(config, /hasSearchToken \|\| searchUiEnabled/);
  assert.match(config, /indexerToken: tinaSearchToken \|\| ""/);
  assert.match(config, /stopwordLanguages:\s*\["eng"\]/);
  assert.match(config, /textList\("searchKeywords",\s*"后台搜索关键词"/);
  assert.match(config, /searchable:\s*false/);
  const guide = readFileSync(new URL("../docs/tinacms-journey-guide.zh-CN.md", import.meta.url), "utf8");
  assert.match(guide, /不是图片库搜索标签/);
  const runner = readFileSync(new URL("../scripts/run-tina.mjs", import.meta.url), "utf8");
  assert.match(runner, /isCloudBuild && searchUiEnabled && !hasSearchToken/);
  assert.match(runner, /TinaCloud search build stopped/);
  assert.match(css, /data-media-layout="two-images"/);
  assert.match(css, /data-ratio="landscape-16-9"/);
  assert.match(css, /data-ratio="portrait-9-16"/);
  assert.match(css, /max-height:\s*min\(82svh,\s*620px\)/);
  assert.match(css, /data-gallery="true"/);

  const journeyPage = readFileSync(new URL("../app/journeys/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(journeyPage, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(journeyPage, /alternates:\s*\{ canonical: null \}/);
  assert.match(journeyPage, /robots:\s*\{ index: false, follow: false \}/);
  assert.match(runner, /TINA_LOCAL_DRAFT_PREVIEW: command === "dev" \? "true" : "false"/);
  assert.match(runner, /dev:\s*\["dev", "-c", "node scripts\/run-next-dev\.mjs"/);
  const devWrapper = readFileSync(new URL("../scripts/run-next-dev.mjs", import.meta.url), "utf8");
  assert.match(devWrapper, /TINA_LOCAL_DRAFT_PREVIEW:\s*"true"/);
  assert.match(devWrapper, /require\.resolve\("next\/dist\/bin\/next"\)/);
  const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  assert.match(packageJson, /"dev:site": "node scripts\/run-next-dev\.mjs"/);
});
