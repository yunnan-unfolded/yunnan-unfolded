import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import test from "node:test";
import { chromium } from "playwright";

const baseUrl = process.env.HOME_CMS_TEST_BASE_URL ?? "http://127.0.0.1:3004";

test("Tina saves desktop/mobile Home images, preview follows CMS values, and originals are restored", { timeout: 180000 }, async () => {
  const original = JSON.parse(readFileSync("content/home/home.json", "utf8"));
  const desktopTest = "/images/journeys/yunnan-slowly/laoyao-mountain-yunnan-2560.webp";
  const mobileTest = "/images/journeys/yunnan-slowly/erhai-fishing-boats.webp";
  const evidence = { checks: [], saves: [] };
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  // Only the local Tina save endpoint may receive POST; never send enquiries.
  await context.route("**/*", route => {
    const request = route.request();
    const url = new URL(request.url());
    return request.method() === "POST" && !(url.pathname === "/graphql" && ["localhost", "127.0.0.1"].includes(url.hostname))
      ? route.abort() : route.continue();
  });
  const admin = await context.newPage();
  const preview = await context.newPage();
  const desktopInput = admin.locator('[id="first.desktopSrc-path"]');
  const mobileInput = admin.locator('[id="first.mobileSrc-path"]');
  let editorReady = false;
  async function save() {
    await admin.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent === "Save" && !button.disabled));
    const result = admin.waitForResponse(response => response.request().method() === "POST"
      && new URL(response.url()).pathname === "/graphql"
      && response.request().postData()?.includes("mutation"));
    assert.equal(await admin.getByRole("button", { name: "Save", exact: true }).isDisabled(), false);
    await admin.getByRole("button", { name: "Save", exact: true }).click();
    const response = await result;
    const body = await response.json();
    assert.equal(response.status(), 200);
    assert.ok(!body.errors, "Tina mutation must succeed");
    await admin.getByRole("button", { name: "Save", exact: true }).waitFor();
    await admin.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent === "Save" && button.disabled));
    evidence.saves.push({ status: response.status(), errors: false });
  }
  async function check(width, expected) {
    await preview.setViewportSize({ width, height: 960 });
    await preview.goto(baseUrl + "/", { waitUntil: "networkidle" });
    const image = preview.locator(".hero__slide--1 img");
    assert.equal(await image.count(), 1);
    await image.evaluate(image => image.decode());
    const selected = await image.evaluate(image => image.currentSrc);
    assert.equal(new URL(selected).pathname, expected);
    assert.ok(await preview.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    evidence.checks.push({ width, selectedPath: expected, loaded: true });
    await preview.screenshot({ path: `artifacts/home-cms/${evidence.checks.length}-${width}.png` });
  }
  mkdirSync("artifacts/home-cms", { recursive: true });
  try {
    await admin.goto(baseUrl + "/admin/index.html#/collections/edit/home/home");
    await admin.getByRole("button", { name: "Enter Edit Mode", exact: true }).click();
    await admin.getByRole("button", { name: "1. 首屏图片", exact: true }).click();
    await desktopInput.waitFor();
    editorReady = true;
    assert.equal(await desktopInput.inputValue(), original.first.desktopSrc);
    assert.equal(await mobileInput.inputValue(), original.first.mobileSrc);

    await admin.locator('img[src$="jiuzihai-panorama.jpg"]').click();
    await admin.getByRole("button", { name: "/yunnan-slowly", exact: true }).click();
    await admin.getByText("laoyao-mountain-yunnan-2560.webp", { exact: true }).click();
    await admin.getByRole("button", { name: "Insert", exact: true }).click();
    assert.equal(await desktopInput.inputValue(), desktopTest);
    await save();
    await check(1440, desktopTest);
    await check(390, "/images/hero/jiuzihai-aerial.jpg");

    await mobileInput.fill(mobileTest);
    await mobileInput.blur();
    await save();
    await check(390, mobileTest);
    await check(430, mobileTest);
    await check(1440, desktopTest);

    await mobileInput.fill("");
    await mobileInput.blur();
    await save();
    await check(390, desktopTest);
    await check(430, desktopTest);

    await admin.reload();
    await admin.getByRole("button", { name: "1. 首屏图片", exact: true }).click();
    assert.equal(await desktopInput.inputValue(), desktopTest);
    assert.equal(await mobileInput.inputValue(), "");
  } catch (error) {
    await admin.screenshot({ path: "artifacts/home-cms/failure.png" });
    evidence.failure = await admin.locator("body").innerText();
    throw error;
  } finally {
    try {
      if (editorReady) {
        await desktopInput.fill(original.first.desktopSrc);
        await mobileInput.fill(original.first.mobileSrc ?? "");
        await mobileInput.blur();
        if (!await admin.getByRole("button", { name: "Save", exact: true }).isDisabled()) await save();
        assert.deepEqual(JSON.parse(readFileSync("content/home/home.json", "utf8")), original);
        await check(1440, original.first.desktopSrc);
        await check(390, "/images/hero/jiuzihai-aerial.jpg");
        await check(430, "/images/hero/jiuzihai-aerial.jpg");
        evidence.restored = true;
      }
    } finally {
      writeFileSync("artifacts/home-cms/evidence.json", JSON.stringify(evidence, null, 2));
      await context.close();
      await browser.close();
    }
  }
});
