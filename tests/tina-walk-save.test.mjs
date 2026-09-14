import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeWalkSlug } from "../shared/walkDefaults.ts";
import { getWalkSlugValidationError, prepareWalkForSave } from "../tina/walkSave.ts";

function cmsWithNodes(nodes = [], requestError) {
  const errors = [];
  const calls = [];
  return {
    calls,
    errors,
    cms: {
      alerts: { error: (message) => errors.push(message) },
      api: { tina: { request: async (query, options) => {
        calls.push({ query, options });
        if (requestError) throw requestError;
        return { walkConnection: { edges: nodes.map((node) => ({ node })) } };
      } } },
    },
  };
}

function completeWalk(slug = "highland-meadow-walk") {
  return {
    title: "Highland Meadow Walk",
    basic: {
      slug,
      region: "North-west Yunnan",
      summary: "A private walk through forest and open meadow.",
      difficulty: "easy-moderate",
      approximateDuration: "Full day",
      recommendedSeasons: "May to October",
      searchKeywords: ["云南徒步", "highland walk"],
    },
    hero: { src: "/images/walks/hero.webp", alt: "Highland meadow in Yunnan" },
    route: {
      introduction: "The route changes gradually from forest to open high country.",
      options: [{
        title: " Forest Route ",
        distanceKm: 14,
        duration: " Half day ",
        routeType: "out-and-back",
        startElevationM: 2400,
        highestElevationM: 2800,
        elevationGainM: 400,
        riskLevel: "moderate",
        terrain: " Stone steps ",
        suitability: " Active beginners ",
        riskNotes: [" Slippery after rain\nBring poles "],
      }],
      stages: [{
        title: "Into the Forest",
        body: "Follow a quiet path beneath the trees.",
        images: [{
          src: "/images/walks/forest.webp",
          alt: "Forest path",
          displayWidth: "half",
          displayRatio: "portrait-3-4",
          alignment: "left",
          focalPoint: "top",
        }],
      }],
    },
    gallery: { images: [] },
    practical: { seasonNote: "Conditions change with the season.", preparationNotes: ["Bring layers"], relatedJourney: "content/journeys/yunnan-slowly.json" },
    seo: {},
    publication: { status: "published" },
  };
}

test("Walk slugs remove collection prefixes without producing repeated prefixes", () => {
  assert.equal(normalizeWalkSlug("content/walks/Walks-Walks-Highland Meadow.json"), "highland-meadow");
  assert.equal(normalizeWalkSlug("/walk-yunnan/Journeys-Forest Path/"), "forest-path");
});

test("a new Walk defaults to draft and may save without publication-required content", async () => {
  const harness = cmsWithNodes();
  const result = await prepareWalkForSave({
    values: { title: "", basic: {}, publication: {} },
    cms: harness.cms,
    form: { crudType: "create", path: "content/walks/new-walk.json" },
  });

  assert.equal(result.publication.status, "draft");
  assert.equal(result.basic.slug, "new-walk");
  assert.equal(result.basic.difficulty, "gentle");
  assert.deepEqual(harness.errors, []);
});

test("publishing checks only at publish time and reports missing fields in Chinese", async () => {
  const harness = cmsWithNodes();
  await assert.rejects(
    prepareWalkForSave({
      values: { title: "Draft Walk", basic: { slug: "draft-walk" }, publication: { status: "published" } },
      cms: harness.cms,
      form: { crudType: "create" },
    }),
    /发布前请完成：所在地区、列表简短介绍、大约时长、推荐季节、首图、首图英文说明、路线整体介绍/,
  );
  assert.match(harness.errors[0], /内容尚未保存/);
});

test("drafts may keep selected images without English descriptions", async () => {
  const harness = cmsWithNodes();
  const values = completeWalk("unfinished-image-descriptions");
  values.publication.status = "draft";
  values.route.stages[0].images[0].alt = "";
  values.gallery.images = [{ src: "/images/walks/gallery.webp", alt: "" }];

  await assert.doesNotReject(() => prepareWalkForSave({ values, cms: harness.cms, form: { crudType: "create" } }));
  assert.deepEqual(harness.errors, []);
});

test("publishing identifies missing image descriptions in stages and the route gallery", async () => {
  const harness = cmsWithNodes();
  const values = completeWalk("missing-image-descriptions");
  values.route.stages[0].images[0].alt = "";
  values.gallery.images = [{ src: "/images/walks/gallery.webp", alt: "" }];

  await assert.rejects(
    prepareWalkForSave({ values, cms: harness.cms, form: { crudType: "create" } }),
    /路线阶段“In the Forest”第 1 张图片英文说明|路线阶段“Into the Forest”第 1 张图片英文说明/,
  );
  assert.match(harness.errors[0], /路线图集第 1 张图片英文说明/);
  assert.match(harness.errors[0], /内容尚未保存/);
});

test("a genuinely duplicate Walk slug is blocked", async () => {
  const harness = cmsWithNodes([{
    basic: { slug: "highland-meadow-walk" },
    _sys: { path: "content/walks/highland-meadow-walk.json", filename: "highland-meadow-walk" },
  }]);

  await assert.rejects(
    prepareWalkForSave({ values: completeWalk(), cms: harness.cms, form: { crudType: "create" } }),
    /已被其他徒步路线使用/,
  );
});

test("an existing Walk does not conflict with its own slug", async () => {
  const node = {
    basic: { slug: "highland-meadow-walk" },
    _sys: { path: "content/walks/highland-meadow-walk.json", relativePath: "highland-meadow-walk.json", filename: "highland-meadow-walk" },
  };
  const harness = cmsWithNodes([node]);
  const error = await getWalkSlugValidationError({
    cms: harness.cms,
    form: {
      crudType: "update",
      id: "content\\walks\\highland-meadow-walk.json",
      getState: () => ({ initialValues: { basic: { slug: "highland-meadow-walk" } } }),
    },
    title: "Highland Meadow Walk",
    rawSlug: "highland-meadow-walk",
  });

  assert.equal(error, undefined);
});

test("unlimited stage and gallery images preserve every visual setting", async () => {
  const harness = cmsWithNodes();
  const values = completeWalk("image-settings-draft");
  values.publication.status = "draft";
  values.route.stages[0].images = Array.from({ length: 7 }, (_, index) => ({
    src: `/images/walks/stage-${index + 1}.webp`,
    alt: `Stage image ${index + 1}`,
    displayWidth: index % 2 ? "half" : "full-bleed",
    displayRatio: index % 2 ? "portrait-9-16" : "landscape-16-9",
    alignment: index % 2 ? "left" : "right",
    focalPoint: index % 2 ? "top" : "bottom",
  }));
  values.gallery.images = Array.from({ length: 5 }, (_, index) => ({
    src: `/images/walks/gallery-${index + 1}.webp`,
    alt: `Gallery image ${index + 1}`,
    displayWidth: "large",
    displayRatio: "landscape-4-3",
    alignment: "center",
    focalPoint: "center",
  }));

  const result = await prepareWalkForSave({ values, cms: harness.cms, form: { crudType: "create" } });
  const persisted = JSON.parse(JSON.stringify(result));
  assert.equal(persisted.route.stages[0].images.length, 7);
  assert.equal(persisted.gallery.images.length, 5);
  assert.deepEqual(persisted.route.stages[0].images[1], values.route.stages[0].images[1]);
  assert.deepEqual(persisted.gallery.images[4], values.gallery.images[4]);
});

test("missing image presets receive safe defaults and multiline notes normalize", async () => {
  const harness = cmsWithNodes();
  const result = await prepareWalkForSave({
    values: {
      title: "Forest Notes",
      basic: { slug: "forest-notes" },
      route: { stages: [{ title: " Forest ", body: " Path ", images: [{ src: " /forest.webp ", alt: " Forest path " }] }] },
      practical: { preparationNotes: ["Bring layers\r\n  Wear good shoes ", ""], relatedJourney: " content/journeys/yunnan-slowly.json " },
      publication: { status: "draft" },
    },
    cms: harness.cms,
    form: { crudType: "create" },
  });

  assert.deepEqual(result.route.stages[0].images[0], {
    src: "/forest.webp",
    alt: "Forest path",
    displayWidth: "standard",
    displayRatio: "original",
    alignment: "center",
    focalPoint: "center",
  });
  assert.deepEqual(result.practical.preparationNotes, ["Bring layers", "Wear good shoes"]);
  assert.equal(result.practical.relatedJourney, "content/journeys/yunnan-slowly.json");
});

test("route-guide statistics and risk notes are normalized without inventing missing values", async () => {
  const harness = cmsWithNodes();
  const result = await prepareWalkForSave({
    values: completeWalk("route-guide-data"),
    cms: harness.cms,
    form: { crudType: "create" },
  });

  assert.equal(result.route.options[0].title, "Forest Route");
  assert.equal(result.route.options[0].distanceKm, 14);
  assert.equal(result.route.options[0].highestElevationM, 2800);
  assert.equal(result.route.options[0].riskLevel, "moderate");
  assert.deepEqual(result.route.options[0].riskNotes, ["Slippery after rain", "Bring poles"]);
  assert.equal(result.route.options[0].duration, "Half day");
});

test("Tina schema contains an isolated six-group Walk collection and leaves Journey at nine groups", async () => {
  const source = await readFile(new URL("../tina/config.ts", import.meta.url), "utf8");
  assert.match(source, /name: "walk"[\s\S]*label: "徒步路线"[\s\S]*path: "content\/walks"/);
  const walkSource = source.split('name: "walk"')[1];
  assert.match(walkSource, /name: "title"[\s\S]*?required: true,[\s\S]*?isTitle: true,/);
  for (const label of ["1. 基本信息", "2. 首图", "3. 路线介绍", "4. 路线图片", "5. 实用信息", "6. 保存与发布"]) {
    assert.match(source, new RegExp(label.replace(".", "\\.")));
  }
  for (let index = 1; index <= 9; index += 1) {
    assert.match(source, new RegExp(`label: "${index}\\.`));
  }
  assert.doesNotMatch(source, /showOnWalkYunnan|显示在 Walk Yunnan/);
  assert.match(walkSource, /name: "options"[\s\S]*label: "路线方案与攻略数据"/);
  assert.match(walkSource, /name: "distanceKm"[\s\S]*name: "highestElevationM"[\s\S]*name: "elevationGainM"[\s\S]*name: "riskLevel"/);
});
