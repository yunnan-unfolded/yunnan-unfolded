import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright";
import { optimizedHeroSource } from "../app/lib/optimizedImages.ts";

const baseUrl = process.env.SEO_TEST_BASE_URL;

test("Image derivatives do not replace unrelated CMS images", () => {
  assert.equal(optimizedHeroSource("/images/journeys/罗古箐/Codex-图像-2026年9月2日-23_06_03.png"), "/images/optimized/luoguqing-hero-1086.webp");
  for (const src of ["https://assets.tina.io/example/another.webp", "/images/new-user-image.png", ""]) {
    assert.equal(optimizedHeroSource(src), src);
  }
});

for (const width of [1440, 390, 430]) {
  test(`Rendered SEO and responsive image requests at ${width}px`, { skip: !baseUrl }, async () => {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: width < 500 ? 2 : 1 });
    await context.route("**/*", route => route.request().method() === "POST" ? route.abort() : route.continue());
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    page.on("request", request => requests.push(request.url()));
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(baseUrl, { waitUntil: "networkidle" });
      const hero = page.locator(".hero__slide--1 img");
      assert.equal(await hero.count(), 1);
      const selectedImage = await hero.evaluate(image => image.currentSrc);
      assert.ok(selectedImage.includes(width < 500 ? "jiuzihai-aerial.jpg" : "jiuzihai-panorama.jpg"));
      if (width < 500) assert.ok(!requests.some(url => url.endsWith("/jiuzihai-panorama.jpg")));
      assert.ok(!requests.some(url => /fonts\.(googleapis|gstatic)\.com/.test(url)));
      assert.equal(await page.locator("h1").count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      for (const route of ["/walk-yunnan/", "/plan-my-trip/"]) {
        await page.goto(baseUrl + route, { waitUntil: "networkidle" });
        const title = await page.title();
        assert.equal(await page.locator('meta[name="twitter:title"]').getAttribute("content"), title);
        assert.ok((await page.locator('meta[property="og:image"]').getAttribute("content")).startsWith("https://yunnanunfolded.com/"));
        assert.equal(await page.locator("h1").count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (route === "/plan-my-trip/" && width < 500) {
          assert.ok((await page.locator("picture img").first().evaluate(image => image.currentSrc)).endsWith("/laoyao-mountain-960.webp"));
        }
      }
      await page.goto(baseUrl + "/walk-yunnan/luoguqing-rhododendron-walk/", { waitUntil: "networkidle" });
      assert.ok(await page.locator('img[src*="luoguqing-hero-1086.webp"]').count());
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
      await browser.close();
    }
  });
}
