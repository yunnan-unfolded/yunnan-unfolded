import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import test from "node:test";
import { chromium } from "playwright";

const baseUrl = process.env.HOME_CMS_TEST_BASE_URL;
const apiUrl = process.env.HOME_CMS_TEST_API_URL;
const groups = { introduction: "4. Another side of Yunnan 区域图片", chloe: "12. Meet Chloe 人物图片" };

test("Home section images save through Tina, retain single-owner card covers, and restore formal images", { timeout: 180000, skip: !baseUrl || !apiUrl }, async () => {
  const original = JSON.parse(readFileSync("content/home/home.json", "utf8"));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await context.route("**/*", route => {
    const request = route.request();
    const url = new URL(request.url());
    return request.method() === "POST" && !(url.href === new URL(apiUrl).href) ? route.abort() : route.continue();
  });
  const admin = await context.newPage();
  const preview = await context.newPage();
  const evidence = { saves: [], checks: [], errors: [] };
  preview.on("pageerror", error => evidence.errors.push(error.message));
  mkdirSync("artifacts/home-section-images", { recursive: true });
  let current;
  async function openGroup(key) {
    if (current) await admin.getByRole("button", { name: "home", exact: true }).click();
    await admin.getByRole("button", { name: groups[key], exact: true }).click();
    await admin.locator(`[id="${key}.src-path"]`).waitFor();
    current = key;
  }
  async function save() {
    await admin.waitForFunction(() => [...document.querySelectorAll("button")].some(b => b.textContent === "Save" && !b.disabled));
    const result = admin.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/graphql" && response.request().postData()?.includes("mutation"));
    await admin.getByRole("button", { name: "Save", exact: true }).click();
    const response = await result;
    const body = await response.json();
    assert.equal(response.status(), 200);
    assert.ok(!body.errors);
    await admin.waitForFunction(() => [...document.querySelectorAll("button")].some(b => b.textContent === "Save" && b.disabled));
    evidence.saves.push({ field: current, status: 200, errors: false });
  }
  async function check(intro, chloe, label, focus) {
    for (const width of [1440, 390, 430]) {
      await preview.setViewportSize({ width, height: 960 });
      await preview.goto(baseUrl, { waitUntil: "networkidle" });
      for (const [selector, expected] of [[".intro__image", intro], [".local__portrait img", chloe]]) {
        const image = preview.locator(selector);
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(i => i.decode());
        assert.equal(await image.evaluate(i => i.currentSrc), new URL(expected, baseUrl).href);
        assert.equal(await image.evaluate(i => getComputedStyle(i).objectFit), "cover");
      }
      if (focus) assert.equal(await preview.locator(".intro__image").evaluate(i => getComputedStyle(i).objectPosition), focus);
      assert.ok(await preview.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const selectedGuides = ["how-to-pay-in-yunnan", "best-time-to-visit-yunnan", "how-to-get-around-yunnan"];
      for (const [index, slug] of selectedGuides.entries()) {
        const guide = JSON.parse(readFileSync(`content/travel-guides/${slug}.json`, "utf8"));
        const cover = preview.locator(".home-travel-guide-card img").nth(index);
        await cover.scrollIntoViewIfNeeded();
        await cover.evaluate(i => i.decode());
        assert.equal(await cover.evaluate(i => i.currentSrc), new URL(guide.hero.src, baseUrl).href);
      }
      const walk = JSON.parse(readFileSync("content/walks/luoguqing-rhododendron-walk.json", "utf8"));
      assert.equal(await preview.locator(".walk-route img").getAttribute("src"), walk.hero.src);
      const journey = JSON.parse(readFileSync("content/journeys/yunnan-slowly.json", "utf8"));
      assert.equal(await preview.locator(".journey-card img").first().getAttribute("src"), journey.hero.src);
      assert.deepEqual(await preview.locator(".journey-card h3").allTextContents(), ["Yunnan, Slowly", "The Old Roads of Yunnan", "South into the Green"]);
      await preview.locator(".intro__image").scrollIntoViewIfNeeded();
      await preview.screenshot({ path: `artifacts/home-section-images/${label}-intro-${width}.png` });
      await preview.locator(".local__portrait img").scrollIntoViewIfNeeded();
      await preview.screenshot({ path: `artifacts/home-section-images/${label}-chloe-${width}.png` });
      evidence.checks.push({ label, width, intro, chloe, coversFromCollections: true, overflow: false });
    }
  }
  try {
    await admin.goto(baseUrl + "/admin/index.html#/collections/edit/home/home");
    await admin.getByRole("button", { name: "Enter Edit Mode", exact: true }).click();
    await admin.getByRole("link", { name: "打开「精品行程」集合" }).waitFor();
    assert.equal(await admin.getByRole("link", { name: "打开「旅行攻略」集合" }).getAttribute("href"), "#/collections/travelGuide");
    await admin.screenshot({ path: "artifacts/home-section-images/editor-sections.png", fullPage: true });
    await openGroup("introduction");
    const introTest = "/images/journeys/yunnan-slowly/laoyao-mountain-rhododendron-hiker-1600.webp";
    await admin.locator('[id="introduction.src-path"]').fill(introTest);
    await admin.locator('[name="introduction.focalPoint"]').selectOption("top");
    await save();
    await check(introTest, original.chloe.src, "intro-test", "50% 0%");

    await openGroup("chloe");
    const chloeTest = "/images/about/chloe-rhododendrons.webp";
    await admin.locator('[id="chloe.src-path"]').fill(chloeTest);
    await admin.locator('[id="chloe.src-path"]').blur();
    await save();
    await check(introTest, chloeTest, "chloe-test", "50% 0%");
  } finally {
    try {
      if (current) {
        for (const key of ["introduction", "chloe"]) {
          await openGroup(key);
          await admin.locator(`[id="${key}.src-path"]`).fill(original[key].src);
          await admin.locator(`[name="${key}.focalPoint"]`).selectOption(original[key].focalPoint ?? "");
          await admin.locator(`[id="${key}.src-path"]`).blur();
          if (!await admin.getByRole("button", { name: "Save", exact: true }).isDisabled()) await save();
        }
        assert.deepEqual(JSON.parse(readFileSync("content/home/home.json", "utf8")), original);
        await check(original.introduction.src, original.chloe.src, "restored");
        evidence.restored = true;
      }
      assert.deepEqual(evidence.errors, []);
    } finally {
      writeFileSync("artifacts/home-section-images/evidence.json", JSON.stringify(evidence, null, 2));
      await context.close();
      await browser.close();
    }
  }
});
