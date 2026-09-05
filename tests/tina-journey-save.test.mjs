import assert from "node:assert/strict";
import test from "node:test";
import { getJourneySlugValidationError, prepareJourneyForSave } from "../tina/journeySave.ts";

function completePublishedJourney(slug = "yunnan-slowly") {
  return {
    title: "Yunnan, Slowly",
    summary: "A private Yunnan journey.",
    basic: {
      slug,
      collection: "Yunnan, Slowly",
      title: "Yunnan, Slowly",
      listingDescription: "A private Yunnan journey.",
      durationNights: 8,
    },
    hero: { src: "/hero.webp", alt: "Mountain landscape in Yunnan" },
    itinerary: {
      days: [{
        day: 1,
        title: "Kunming to Weishan",
        route: "Kunming → Weishan",
        overnight: "Weishan",
        subtitle: "A Quieter Beginning",
        mediaLayout: "image-right",
        imageSize: "wide",
        images: [{ src: "/day-1.webp", alt: "Historic gate tower in Weishan" }],
      }],
    },
    publication: { status: "published" },
  };
}

function cmsWithNodes(nodes, requestError) {
  const errors = [];
  const calls = [];
  return {
    errors,
    calls,
    cms: {
      alerts: { error: (message) => errors.push(message) },
      api: { tina: { request: async (query, options) => {
        calls.push({ query, options });
        if (requestError) throw requestError;
        return { journeyConnection: { edges: nodes.map((node) => ({ node })) } };
      } } },
    },
  };
}

test("an existing published Journey excludes its own document path and preserves edited fields", async () => {
  const values = completePublishedJourney();
  const harness = cmsWithNodes([{
    basic: { slug: "yunnan-slowly" },
    _sys: { path: "content/journeys/yunnan-slowly.json", relativePath: "yunnan-slowly.json", filename: "yunnan-slowly" },
  }]);
  const result = await prepareJourneyForSave({
    values,
    cms: harness.cms,
    form: {
      crudType: "update",
      id: "content\\journeys\\yunnan-slowly.json",
      path: "content/journeys/yunnan-slowly.json",
      getState: () => ({ initialValues: completePublishedJourney() }),
    },
  });

  assert.equal(result.itinerary.days[0].subtitle, "A Quieter Beginning");
  assert.equal(result.itinerary.days[0].mediaLayout, "image-right");
  assert.equal(result.itinerary.days[0].imageSize, "wide");
  assert.equal(result.itinerary.days[0].images[0].alt, "Historic gate tower in Weishan");
  assert.deepEqual(harness.calls[0].options, { variables: {} });
  assert.deepEqual(harness.errors, []);
});

test("an update form with no usable path only excludes one unchanged current slug", async () => {
  const values = completePublishedJourney();
  const harness = cmsWithNodes([{ basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } }]);

  await assert.doesNotReject(() => prepareJourneyForSave({
    values,
    cms: harness.cms,
    form: {
      crudType: "update",
      id: "",
      getState: () => ({ initialValues: completePublishedJourney() }),
    },
  }));
});

test("a new Journey with a duplicate slug is blocked with a clear Chinese error", async () => {
  const values = completePublishedJourney();
  const harness = cmsWithNodes([{ basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } }]);

  await assert.rejects(
    prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create", id: "content/journeys/new-post.json" } }),
    /保存失败：页面网址“yunnan-slowly”已被其他路线使用/,
  );
  assert.match(harness.errors[0], /内容尚未保存/);
});

test("the editor-level async validator blocks Tina filename collisions in Chinese", async () => {
  const harness = cmsWithNodes([{ basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } }]);
  const error = await getJourneySlugValidationError({
    cms: harness.cms,
    form: { crudType: "create", getState: () => ({ initialValues: {} }) },
    title: "Yunnan Slowly",
  });

  assert.match(error, /页面网址“yunnan-slowly”已被其他路线使用/);
});

test("the editor-level validator excludes the document currently being edited", async () => {
  const node = { basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } };
  const harness = cmsWithNodes([node]);
  const error = await getJourneySlugValidationError({
    cms: harness.cms,
    form: {
      crudType: "update",
      getState: () => ({ initialValues: { basic: { slug: "yunnan-slowly" }, _sys: node._sys } }),
    },
    rawSlug: "yunnan-slowly",
    title: "Yunnan, Slowly",
  });

  assert.equal(error, undefined);
});

test("an existing document is excluded by Tina form identity even when initial values have no _sys", async () => {
  const node = { basic: { slug: "yunnan-rhododendron-hiking" }, _sys: { path: "content/journeys/yunnan-rhododendron-hiking.json" } };
  const harness = cmsWithNodes([node]);
  const error = await getJourneySlugValidationError({
    cms: harness.cms,
    form: {
      crudType: "update",
      id: "content/journeys/yunnan-rhododendron-hiking.json",
      path: "content/journeys/yunnan-rhododendron-hiking.json",
      relativePath: "content/journeys/yunnan-rhododendron-hiking.json",
      getState: () => ({ initialValues: { basic: { slug: "yunnan-rhododendron-hiking" } } }),
    },
    rawSlug: "yunnan-rhododendron-hiking",
    title: "When the Mountains Bloom",
  });

  assert.equal(error, undefined);
});

test("a create form proposed path never excludes a genuinely existing document", async () => {
  const node = { basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } };
  const harness = cmsWithNodes([node]);
  const error = await getJourneySlugValidationError({
    cms: harness.cms,
    form: {
      crudType: "create",
      id: "content/journeys/new-post.json",
      path: "content/journeys/yunnan-slowly.json",
      relativePath: "content/journeys/new-post.json",
    },
    rawSlug: "yunnan-slowly",
    title: "Yunnan Slowly",
  });

  assert.match(error, /页面网址“yunnan-slowly”已被其他路线使用/);
});

test("the editor-level validator reports a search outage in Chinese", async () => {
  const harness = cmsWithNodes([], new Error("offline"));
  const error = await getJourneySlugValidationError({
    cms: harness.cms,
    form: { crudType: "create" },
    title: "New Route",
  });

  assert.equal(error, "暂时无法检查页面网址是否重复，请稍后重试。");
});

test("two documents with the same published slug are never hidden by the current-document fallback", async () => {
  const values = completePublishedJourney();
  const harness = cmsWithNodes([
    { basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/yunnan-slowly.json" } },
    { basic: { slug: "yunnan-slowly" }, _sys: { path: "content/journeys/duplicate.json" } },
  ]);

  await assert.rejects(
    prepareJourneyForSave({
      values,
      cms: harness.cms,
      form: { crudType: "update", id: "", getState: () => ({ initialValues: completePublishedJourney() }) },
    }),
    /已被其他路线使用/,
  );
});

test("an incomplete draft saves and still checks for duplicate slugs", async () => {
  const harness = cmsWithNodes([]);
  const values = {
    title: "Draft Route",
    summary: "A draft route.",
    basic: { slug: "draft-route" },
    itinerary: { days: [] },
    publication: { status: "draft" },
  };
  const result = await prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } });

  assert.equal(result.publication.status, "draft");
  assert.equal(result.basic.durationDays, 0);
  assert.equal(harness.calls.length, 1);
});

test("a new draft with a duplicate slug is blocked before Tina writes a file", async () => {
  const harness = cmsWithNodes([{ basic: { slug: "draft-route" }, _sys: { path: "content/journeys/draft-route.json" } }]);
  const values = { title: "Draft Route", summary: "Draft.", basic: { slug: "/journeys/Draft Route/" }, itinerary: { days: [] }, publication: { status: "draft" } };
  await assert.rejects(
    prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } }),
    /页面网址“draft-route”已被其他路线使用/,
  );
});

test("save normalization trims bulk highlights, removes empty media and renumbers days", async () => {
  const harness = cmsWithNodes([]);
  const values = {
    title: "  New Yunnan Route  ",
    summary: " A concise route summary. ",
    basic: { slug: "journeys/New Yunnan Route.json" },
    highlights: { items: [{ title: " First highlight ", description: " Detail " }, { title: "   ", description: "ignored" }] },
    gallery: { images: [{ src: " /one.webp ", alt: " One " }, { src: "", alt: "placeholder" }] },
    itinerary: { days: [{ day: 7, title: " Day title ", logistics: " Route · Overnight ", paragraphs: [" Paragraph ", ""], experiences: [" Experience ", ""], images: [{ src: " /day.webp ", alt: " Day image " }, { src: "", alt: "placeholder" }] }] },
    publication: { status: "draft" },
  };
  const result = await prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } });
  assert.equal(result.title, "New Yunnan Route");
  assert.equal(result.summary, "A concise route summary.");
  assert.equal(result.basic.slug, "new-yunnan-route");
  assert.equal(result.basic.durationDays, 1);
  assert.deepEqual(result.highlights.items, [{ title: "First highlight", description: "Detail" }]);
  assert.deepEqual(result.gallery.images, [{ src: "/one.webp", alt: "One" }]);
  assert.equal(result.itinerary.days[0].day, 1);
  assert.deepEqual(result.itinerary.days[0].paragraphs, ["Paragraph"]);
  assert.deepEqual(result.itinerary.days[0].images, [{ src: "/day.webp", alt: "Day image" }]);
});

test("save normalization splits every line-based field into independent items", async () => {
  const harness = cmsWithNodes([]);
  const values = {
    title: "Line Lists Draft",
    summary: "A local line-list test.",
    basic: { slug: "line-lists-draft", searchKeywords: ["Shaxi\r\n  hiking  ", ""] },
    overview: { paragraphs: ["First paragraph\n\nSecond paragraph"] },
    itinerary: { days: [{ title: "Day", logistics: "A → B · Overnight in B", paragraphs: ["One\nTwo"], experiences: ["Walk\r\nTea"], options: [{ points: ["A\n B "] }] }] },
    inclusions: { included: ["Driver\r\nGuide"], excluded: ["Flights\n  Insurance  "] },
    audience: { suitable: ["Walker\nPhotographer"], considerations: ["Mountain roads\r\nSimple stays"] },
    booking: { conditions: ["Deposit\nCancellation terms"] },
    seo: { keywords: ["Yunnan\nShaxi"] },
    advanced: { hero: { facts: ["5 DAYS\nMAY TO JULY"] }, inquiry: { promises: ["Private\nFlexible"] } },
    publication: { status: "draft" },
  };

  const result = await prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } });
  assert.deepEqual(result.basic.searchKeywords, ["Shaxi", "hiking"]);
  assert.deepEqual(result.overview.paragraphs, ["First paragraph", "Second paragraph"]);
  assert.deepEqual(result.itinerary.days[0].paragraphs, ["One", "Two"]);
  assert.deepEqual(result.itinerary.days[0].experiences, ["Walk", "Tea"]);
  assert.deepEqual(result.itinerary.days[0].options[0].points, ["A", "B"]);
  assert.deepEqual(result.inclusions.included, ["Driver", "Guide"]);
  assert.deepEqual(result.inclusions.excluded, ["Flights", "Insurance"]);
  assert.deepEqual(result.audience.suitable, ["Walker", "Photographer"]);
  assert.deepEqual(result.audience.considerations, ["Mountain roads", "Simple stays"]);
  assert.deepEqual(result.booking.conditions, ["Deposit", "Cancellation terms"]);
  assert.deepEqual(result.seo.keywords, ["Yunnan", "Shaxi"]);
  assert.deepEqual(result.advanced.hero.facts, ["5 DAYS", "MAY TO JULY"]);
  assert.deepEqual(result.advanced.inquiry.promises, ["Private", "Flexible"]);
});

test("saving keeps six daily images and more than three route images", async () => {
  const harness = cmsWithNodes([]);
  const dailyImages = Array.from({ length: 6 }, (_, index) => ({ src: `/day-${index + 1}.webp`, alt: `Day image ${index + 1}` }));
  const galleryImages = Array.from({ length: 5 }, (_, index) => ({ src: `/gallery-${index + 1}.webp`, alt: `Gallery image ${index + 1}` }));
  const values = {
    title: "Unlimited Images Draft",
    summary: "A local draft used to verify image collection persistence.",
    basic: { slug: "unlimited-images-draft" },
    gallery: { images: galleryImages },
    itinerary: { days: [{ day: 1, title: "Image day", logistics: "A → B · Overnight in B", images: dailyImages }] },
    publication: { status: "draft" },
  };

  const result = await prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } });
  assert.equal(result.itinerary.days[0].images.length, 6);
  assert.equal(result.gallery.images.length, 5);
  assert.deepEqual(result.itinerary.days[0].images.map((image) => image.src), dailyImages.map((image) => image.src));
});

test("a slug-check outage produces a Chinese save failure instead of silently succeeding", async () => {
  const harness = cmsWithNodes([], new Error("network unavailable"));

  await assert.rejects(
    prepareJourneyForSave({ values: completePublishedJourney(), cms: harness.cms, form: { crudType: "update" } }),
    /保存失败：暂时无法检查页面网址是否重复/,
  );
  assert.match(harness.errors[0], /内容尚未保存/);
});
