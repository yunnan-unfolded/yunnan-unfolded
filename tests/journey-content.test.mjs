import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { journeyContentToViewModel } from "../app/lib/journeyAdapter.ts";
import { validateJourneyContent } from "../app/lib/journeyValidation.ts";

const contentPath = new URL("../content/journeys/yunnan-slowly.json", import.meta.url);
const content = JSON.parse(readFileSync(contentPath, "utf8"));

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
});

test("daily media presets are safe, responsive values and never exceed two images", () => {
  const allowedLayouts = new Set(["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"]);
  const allowedSizes = new Set(["compact", "standard", "wide"]);
  const allowedRatios = new Set(["landscape", "portrait", "square", "original"]);
  const allowedFocalPoints = new Set(["top", "center", "bottom", "left", "right"]);

  for (const day of content.itinerary.days) {
    assert.ok(allowedLayouts.has(day.mediaLayout));
    assert.ok(allowedSizes.has(day.imageSize));
    assert.ok((day.images?.length ?? 0) <= 2);
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
  const groups = ["1. 基本信息", "2. 首图", "3. 行程概览", "4. 行程亮点", "5. 路线节点", "6. 每日行程", "7. 适合人群", "8. 费用包含与不包含", "9. 预订条件", "10. 搜索展示设置", "11. 发布状态"];
  let cursor = -1;
  for (const group of groups) {
    const next = config.indexOf(group);
    assert.ok(next > cursor, `missing or out-of-order Tina group: ${group}`);
    cursor = next;
  }
  for (const value of ["text-only", "image-left", "image-right", "image-above", "image-below", "two-images", "compact", "standard", "wide", "landscape", "portrait", "square", "original"]) {
    assert.ok(config.includes(value), `missing editor preset: ${value}`);
  }
  assert.match(config, /第\$\{day\.day \|\| "\?"\}天｜\$\{day\.route/);
  assert.match(config, /component: PublicationStatusField/);
  assert.match(config, /process\.env\.TINA_SEARCH_TOKEN/);
  assert.match(config, /process\.env\.TINA_PUBLIC_SEARCH_ENABLED/);
  assert.match(config, /hasSearchToken \|\| searchUiEnabled/);
  assert.match(config, /indexerToken: tinaSearchToken \|\| ""/);
  assert.match(config, /stopwordLanguages:\s*\["eng"\]/);
  assert.match(config, /textList\("searchKeywords",\s*"后台搜索关键词"/);
  assert.match(config, /searchable:\s*false/);
  assert.match(config, /也不是图片库搜索标签/);
  const runner = readFileSync(new URL("../scripts/run-tina.mjs", import.meta.url), "utf8");
  assert.match(runner, /isCloudBuild && searchUiEnabled && !hasSearchToken/);
  assert.match(runner, /TinaCloud search build stopped/);
  assert.match(css, /data-media-layout="two-images"/);
  assert.match(css, /data-image-size="compact"/);
  assert.match(css, /width:\s*82%/);
});
