import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { chromium } from "playwright";

const baseUrl = process.env.PLAN_TRIP_TEST_BASE_URL ?? "http://127.0.0.1:3001";
const translated = process.env.PLAN_TRIP_TEST_TRANSLATE === "1";
const outputDir = translated ? "artifacts/plan-trip-interactions-translated" : "artifacts/plan-trip-interactions";
const targets = [
  { name: "desktop-loopback", origin: baseUrl, width: 1440, height: 1000 },
  { name: "mobile-390-loopback", origin: baseUrl, width: 390, height: 844 },
  { name: "mobile-430-loopback", origin: baseUrl, width: 430, height: 932 },
];
if (process.env.PLAN_TRIP_TEST_LAN_ORIGIN) {
  targets.push({ name: "mobile-lan", origin: process.env.PLAN_TRIP_TEST_LAN_ORIGIN, width: 390, height: 844 });
}

for (const target of targets) {
  test(`Plan My Trip really responds to clicks: ${target.name} (${translated ? "Chrome automatic zh-CN translation" : "English"})`, { timeout: 90000 }, async () => {
    await mkdir(outputDir, { recursive: true });
    const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-automation"] });
    let profile;
    const contextOptions = {
      viewport: { width: target.width, height: target.height },
      isMobile: target.width < 500,
      hasTouch: target.width < 500,
    };
    let context;
    if (translated) {
      const session = await browser.newBrowserCDPSession();
      const { arguments: args } = await session.send("Browser.getBrowserCommandLine");
      const disabledFeatures = args.find((arg) => arg.startsWith("--disable-features="));
      await browser.close();
      profile = await mkdtemp(path.join(tmpdir(), "plan-trip-translate-"));
      await mkdir(path.join(profile, "Default"));
      await writeFile(path.join(profile, "Default", "Preferences"), JSON.stringify({
        intl: { accept_languages: "zh-CN,zh", selected_languages: "zh-CN,zh" },
        translate: { enabled: true }, translate_allowlists: { en: "zh-CN" },
        translate_recent_target: "zh-CN", translate_blocked_languages: ["zh-CN", "zh"],
      }));
      context = await chromium.launchPersistentContext(profile, {
        ...contextOptions, channel: "chrome", headless: true, locale: "zh-CN",
        ignoreDefaultArgs: [disabledFeatures, "--disable-background-networking"],
        args: ["--enable-features=Translate", "--lang=zh-CN"],
      });
    } else {
      context = await browser.newContext(contextOptions);
    }
    // Observe real browser translation and React attachment; never translate or alter the page ourselves.
    await context.addInitScript(() => {
      window.__planTripTimeline = [];
      const recorded = new Set();
      const inspect = () => {
        const button = document.querySelector('form button[type="button"]');
        const key = button && Object.keys(button).find((name) => name.startsWith("__reactProps"));
        const hydrated = key && typeof button[key].onClick === "function";
        const translatedDom = document.documentElement?.classList.contains("translated-ltr") && /[\u4e00-\u9fff]/.test(document.body?.innerText ?? "");
        for (const [event, happened] of [["hydrated", hydrated], ["translated DOM", translatedDom]]) {
          if (happened && !recorded.has(event)) {
            recorded.add(event);
            window.__planTripTimeline.push({ event, time: performance.now(), hydrated: !!hydrated });
          }
        }
      };
      new MutationObserver(inspect).observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
      setInterval(inspect, 20);
    });
    const page = await context.newPage();
    const evidence = { errors: [], consoleErrors: [], scripts: [], failedRequests: [], enquiryRequests: [], checks: [] };
    page.on("pageerror", (error) => evidence.errors.push({ message: error.message, stack: error.stack }));
    page.on("console", (message) => { if (message.type() === "error") evidence.consoleErrors.push(message.text()); });
    page.on("response", (response) => {
      if (new URL(response.url()).pathname.startsWith("/_next/") && response.request().resourceType() === "script") {
        evidence.scripts.push({ url: response.url(), status: response.status() });
      }
    });
    page.on("requestfailed", (request) => evidence.failedRequests.push({ url: request.url(), error: request.failure() }));
    // The test must never deliver a real enquiry, even if a submit button is clicked accidentally.
    await context.route("**/*", (route) => {
      if (route.request().method() === "POST" && new URL(route.request().url()).pathname.endsWith("/enquiries")) {
        evidence.enquiryRequests.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    try {
      await page.goto(`${target.origin}/plan-my-trip/`, { waitUntil: "networkidle" });
      const session = await context.newCDPSession(page);
      await session.send("Network.setCacheDisabled", { cacheDisabled: true });
      await page.reload({ waitUntil: "networkidle" });
      if (translated) {
        await page.waitForFunction(() => document.documentElement.classList.contains("translated-ltr") && (document.body.innerText.match(/[\u4e00-\u9fff]/g)?.length ?? 0) > 20, undefined, { timeout: 25000 });
      }
      evidence.translation = await page.evaluate(() => ({ enabled: document.documentElement.classList.contains("translated-ltr"), timeline: window.__planTripTimeline }));
      const continueButton = page.locator('form button[type="button"]').last();
      await continueButton.scrollIntoViewIfNeeded();
      evidence.hit = await continueButton.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return { button: element.outerHTML, actualHit: hit?.outerHTML, pointerEvents: getComputedStyle(element).pointerEvents, inert: !!element.closest("[inert]"), disabled: element.disabled };
      });
      await continueButton.click();
      // HTTP 200 is insufficient: hydration must attach the handler and render errors after a real click.
      await page.locator("#name-error").waitFor({ state: "visible", timeout: 5000 });
      assert.equal(await page.locator('[name="email"]').getAttribute("aria-invalid"), "true");
      assert.ok(await page.locator("#email-error").innerText());
      if (!translated) assert.equal(await page.locator("#email-error").innerText(), "Please enter your email address.");
      evidence.checks.push("required field messages");
      await page.locator('[name="name"]').fill("Local interaction test");
      await page.locator('[name="email"]').fill("invalid-email");
      await continueButton.click();
      assert.equal(await page.locator('[name="email"]').getAttribute("aria-invalid"), "true");
      assert.ok(await page.locator("#email-error").innerText());
      if (!translated) assert.equal(await page.locator("#email-error").innerText(), "Please enter a valid email address.");
      evidence.checks.push("invalid email message");
      await page.locator('[name="email"]').fill("local-test@example.invalid");
      await continueButton.click();
      await page.locator('[name="timing"]').first().waitFor();
      await page.locator('form button[type="button"]').first().click();
      assert.equal(await page.locator('[name="name"]').inputValue(), "Local interaction test");
      assert.equal(await page.locator('[name="email"]').inputValue(), "local-test@example.invalid");
      evidence.checks.push("continue, back and retained values");
      await page.locator('main button[class*="primaryButton"]').first().click();
      await page.waitForFunction(() => document.activeElement?.getAttribute("name") === "name", undefined, { timeout: 3000 });
      evidence.checks.push("start planning focuses form");
      for (let step = 2; step <= 5; step++) {
        await page.locator('form button[type="button"]').last().click();
        await page.waitForFunction((expected) => {
          const progress = document.querySelector('form [class*="progressRow"] > span');
          const text = progress?.querySelector('[translate="no"]')?.textContent ?? progress?.textContent ?? "";
          return Number(text.match(/\d+/)?.[0]) === expected;
        }, step, { timeout: 3000 });
      }
      for (let step = 4; step >= 1; step--) {
        await page.locator('form button[type="button"]').first().click();
        await page.waitForFunction((expected) => {
          const progress = document.querySelector('form [class*="progressRow"] > span');
          const text = progress?.querySelector('[translate="no"]')?.textContent ?? progress?.textContent ?? "";
          return Number(text.match(/\d+/)?.[0]) === expected;
        }, step, { timeout: 3000 });
      }
      evidence.checks.push("all five steps forward and back");
      for (let index = 0; index < 7; index++) {
        const toggle = page.locator(`#faq-question-${index}`);
        if (await toggle.getAttribute("aria-expanded") === "true") await toggle.click();
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        assert.equal(await page.locator(`#faq-answer-${index}`).isVisible(), true);
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      }
      evidence.checks.push("every FAQ opens and closes");
      if (target.width < 500) {
        await page.locator(".menu-button").click();
        assert.equal(await page.locator("#mobile-navigation").getAttribute("aria-hidden"), "false");
        await page.locator(".menu-button").click();
        assert.equal(await page.locator("#mobile-navigation").getAttribute("aria-hidden"), "true");
        evidence.checks.push("mobile menu opens and closes");
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const sources = [
        { path: "/journeys/yunnan-slowly/", source: "journey-detail", context: "Journey:" },
        { path: "/walk-yunnan/luoguqing-rhododendron-walk/", source: "walk", context: "Walk:" },
        { path: "/travel-guides/how-to-pay-in-yunnan/", source: "travel-guide", context: "Travel guide:" },
      ];
      for (const source of sources) {
        await page.goto(`${target.origin}${source.path}`, { waitUntil: "networkidle" });
        await page.locator(`a[href*="source=${source.source}"]`).first().click();
        await page.waitForURL(/\/plan-my-trip\//);
        const note = page.locator('form [class*="contextNote"]');
        await note.waitFor({ state: "visible" });
        assert.equal(new URL(page.url()).searchParams.get("source"), source.source);
        assert.ok(await note.innerText());
        if (!translated) assert.match(await note.innerText(), new RegExp(source.context));
        evidence.checks.push(`${source.source} referral shown after actual link click`);
      }
      assert.ok(evidence.scripts.length > 0);
      assert.ok(evidence.scripts.every((script) => script.status === 200), JSON.stringify(evidence.scripts));
      assert.deepEqual(evidence.errors, []);
      assert.deepEqual(evidence.consoleErrors, []);
      assert.deepEqual(evidence.enquiryRequests, []);
    } finally {
      evidence.finalState = await page.evaluate(() => ({
        progressHtml: document.querySelector('form [class*="progressRow"] > span')?.outerHTML,
        stepLegend: document.querySelector('form [class*="step"] > legend')?.textContent,
        translated: document.documentElement.classList.contains("translated-ltr"),
      })).catch(() => null);
      await page.screenshot({ path: `${outputDir}/${target.name}.png`, fullPage: true }).catch(() => {});
      await writeFile(`${outputDir}/${target.name}.json`, JSON.stringify(evidence, null, 2));
      await context.close();
      await browser.close();
      if (profile) {
        assert.equal(path.dirname(path.resolve(profile)), path.resolve(tmpdir()));
        assert.ok(path.basename(profile).startsWith("plan-trip-translate-"));
        await rm(profile, { recursive: true, force: true });
      }
    }
  });
}
