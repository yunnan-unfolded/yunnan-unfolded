import assert from "node:assert/strict";
import test from "node:test";
import { prepareJourneyForSave } from "../tina/journeySave.ts";

function completePublishedJourney(slug = "yunnan-slowly") {
  return {
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

test("an incomplete draft saves without running the published slug query", async () => {
  const harness = cmsWithNodes([]);
  const values = {
    basic: { collection: "Draft Route", slug: "draft-route" },
    itinerary: { days: [] },
    publication: { status: "draft" },
  };
  const result = await prepareJourneyForSave({ values, cms: harness.cms, form: { crudType: "create" } });

  assert.equal(result.publication.status, "draft");
  assert.equal(result.basic.durationDays, 0);
  assert.equal(harness.calls.length, 0);
});

test("a slug-check outage produces a Chinese save failure instead of silently succeeding", async () => {
  const harness = cmsWithNodes([], new Error("network unavailable"));

  await assert.rejects(
    prepareJourneyForSave({ values: completePublishedJourney(), cms: harness.cms, form: { crudType: "update" } }),
    /保存失败：暂时无法检查页面网址是否重复/,
  );
  assert.match(harness.errors[0], /内容尚未保存/);
});
