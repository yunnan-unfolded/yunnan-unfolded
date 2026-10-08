import { guideNodeText } from "../shared/travelGuideRichText.ts";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  buildTravelGuideDirectoryStructuredData,
  getTravelGuideBySlug,
  getTravelGuideContentBySlug,
  getTravelGuides,
  publishedTravelGuides,
  travelGuideContentToCard,
  travelGuideContentToDetail,
  travelGuideEntriesToCards,
  travelGuideContents,
} from "../app/lib/travelGuideContent.ts";
import { buildTravelGuideMetadata, buildTravelGuideStructuredData } from "../app/lib/travelGuideSeo.ts";
import { getTravelGuidePublishMissingFields, prepareTravelGuideForSave } from "../tina/travelGuideSave.ts";
import {
  normalizeTravelGuideSlug,
  normalizeTravelGuideTitleValue,
  resolveTravelGuideEditorLabel,
  TRAVEL_GUIDE_DEFAULT_ITEM,
  TRAVEL_GUIDE_EDITOR_DRAFT_LABEL,
} from "../shared/travelGuideDefaults.ts";

const publishedContent = {
  title: "Planning a First Journey Through Yunnan",
  basic: {
    slug: "planning-a-first-journey-through-yunnan",
    category: "Journey planning",
    region: "Yunnan",
    summary: "A practical starting point for deciding where to go and how much time to allow.",
  },
  hero: {
    src: "/images/hero/jiuzihai-panorama.jpg",
    alt: "Mountain lakes in Yunnan",
    displayWidth: "standard",
    displayRatio: "landscape-16-9",
    alignment: "center",
    focalPoint: "top",
    width: 1922,
    height: 1080,
  },
  content: {
    introduction: "Begin with the shape of the province.\n\nThen decide how quickly you want to move.",
    sections: [{ heading: "Choosing a region", body: "Distances matter.", images: [] }],
  },
  seo: {},
  publication: { status: "published" },
};

const draftContent = {
  ...structuredClone(publishedContent),
  title: "Private Draft Guide",
  basic: {
    ...structuredClone(publishedContent.basic),
    slug: "private-draft-guide",
    region: undefined,
  },
  hero: undefined,
  publication: { status: "draft" },
};

const publishedEntry = { filename: `${publishedContent.basic.slug}.json`, content: publishedContent };
const draftEntry = { filename: `${draftContent.basic.slug}.json`, content: draftContent };

test("the first practical guide is published with its approved content", () => {
  const slug = "how-to-pay-in-yunnan";
  assert.ok(getTravelGuideBySlug(slug));
  assert.ok(getTravelGuideContentBySlug(slug));

  const localGuide = getTravelGuideBySlug(slug, true);
  const localEntry = getTravelGuideContentBySlug(slug, true);
  assert.ok(localGuide);
  assert.ok(localEntry);
  assert.equal(localGuide.status, "published");
  assert.equal(localGuide.title, "How to Pay in Yunnan as a Foreign Visitor");
  assert.equal(localGuide.hero?.src, "/images/travel-guides/how-to-pay-in-yunnan/hero-payment-yunnan.webp");
  assert.equal(localGuide.body.children.filter((node) => node.type === "h2").length, 9);
  assert.ok(localGuide.body.children.some((node) => node.type === "h2" && guideNodeText(node) === "Frequently asked questions"));
  assert.ok(localGuide.body.children.some((node) => node.type === "h2" && guideNodeText(node) === "Official references"));
  const paymentImages = localGuide.body.children.filter((node) => node.name === "GuideImage").map((node) => node.props?.src);
  assert.ok(paymentImages.includes("/images/travel-guides/how-to-pay-in-yunnan/qr-payment-shop.webp"));
  assert.ok(paymentImages.includes("/images/travel-guides/how-to-pay-in-yunnan/travel-payment-backup.webp"));
  assert.equal(localEntry.filename, `${slug}.json`);
});

test("published Travel Guide metadata is indexable with canonical and public structured data", () => {
  const guide = getTravelGuideBySlug("how-to-pay-in-yunnan");
  assert.ok(guide);
  const metadata = buildTravelGuideMetadata(guide);
  const canonical = "https://yunnanunfolded.com/travel-guides/how-to-pay-in-yunnan/";
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.deepEqual(metadata.alternates, { canonical });
  assert.equal(metadata.openGraph?.url, canonical);
  assert.deepEqual(buildTravelGuideStructuredData(guide).map((entry) => entry["@type"]), ["BreadcrumbList", "Article"]);
});

test("the Travel Guide detail route generates drafts only for authorised local preview", () => {
  const routeSource = readFileSync("app/travel-guides/[slug]/page.tsx", "utf8");
  assert.match(routeSource, /NODE_ENV === "development"/);
  assert.match(routeSource, /TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(routeSource, /publishedTravelGuides\.map/);
  assert.match(routeSource, /guide\.status !== "published" && !localDraftPreviewEnabled/);
  assert.match(routeSource, /buildTravelGuideStructuredData\(guide\)/);
  const detailSource = readFileSync("app/components/travel-guides/TravelGuideDetailPage.tsx", "utf8");
  assert.match(detailSource, /<TravelGuideBody body=\{guide.body\}/);
  assert.match(readFileSync("app/components/travel-guides/TravelGuideBody.tsx", "utf8"), /loading="lazy"/);
  assert.match(readFileSync("app/components/travel-guides/TravelGuideBody.tsx", "utf8"), /GuideImageFigure/);
});

test("Travel Guide rich body renders an allowlisted tree without raw HTML", () => {
  const source = readFileSync("app/components/travel-guides/TravelGuideBody.tsx", "utf8");
  assert.match(source, /safeGuideUrl/);
  assert.match(source, /noopener noreferrer/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
});

test("saved guides keep matching filenames and any drafts stay out of public output", () => {
  for (const entry of travelGuideContents) {
    assert.equal(entry.filename, `${entry.content.basic.slug}.json`);
  }
  const publicGuides = getTravelGuides(false);
  assert.deepEqual(publicGuides, publishedTravelGuides);
  assert.ok(publicGuides.every((guide) => guide.status === "published"));
  const publicItemList = buildTravelGuideDirectoryStructuredData(publicGuides, "https://yunnanunfolded.com/travel-guides/");
  const publicUrls = publicItemList.mainEntity?.itemListElement.map((item) => item.url) ?? [];
  for (const { content } of travelGuideContents.filter((entry) => entry.content.publication.status === "draft")) {
    assert.equal(publicGuides.some((guide) => guide.slug === content.basic.slug), false);
    assert.equal(publicUrls.some((url) => url.endsWith(`/travel-guides/${content.basic.slug}/`)), false);
    assert.ok(getTravelGuides(true).some((guide) => guide.slug === content.basic.slug));
  }
});

test("production includes only published guides while authorised local data may include drafts", () => {
  const production = travelGuideEntriesToCards([draftEntry, publishedEntry]);
  const localPreview = travelGuideEntriesToCards([draftEntry, publishedEntry], true);
  assert.deepEqual(production.map((guide) => guide.title), [publishedContent.title]);
  assert.deepEqual(localPreview.map((guide) => guide.title), [publishedContent.title, draftContent.title]);
  assert.equal(localPreview.find((guide) => guide.status === "draft")?.title, "Private Draft Guide");
});

test("cards expose stable future detail links and tolerate missing optional fields", () => {
  const publishedCard = travelGuideContentToCard(publishedContent);
  const draftCard = travelGuideContentToCard(draftContent);
  assert.equal(publishedCard.href, "/travel-guides/planning-a-first-journey-through-yunnan/");
  assert.equal(draftCard.region, undefined);
  assert.equal(draftCard.hero, undefined);
  assert.doesNotThrow(() => travelGuideContentToDetail(draftContent));
  assert.deepEqual(travelGuideContentToDetail(publishedContent).introduction, [
    "Begin with the shape of the province.",
    "Then decide how quickly you want to move.",
  ]);
});

test("directory structured data is parseable and never invents an empty ItemList", () => {
  const directoryUrl = "https://yunnanunfolded.com/travel-guides/";
  const empty = buildTravelGuideDirectoryStructuredData([], directoryUrl);
  const populated = buildTravelGuideDirectoryStructuredData(
    travelGuideEntriesToCards([draftEntry, publishedEntry]),
    directoryUrl,
  );
  assert.equal(empty["@type"], "CollectionPage");
  assert.equal("mainEntity" in empty, false);
  assert.equal(populated.mainEntity?.numberOfItems, 1);
  assert.deepEqual(populated.mainEntity?.itemListElement.map((item) => item.name), [publishedContent.title]);
  assert.equal(JSON.parse(JSON.stringify(populated))["@type"], "CollectionPage");
  assert.equal(JSON.stringify(populated).includes(draftContent.title), false);
});

test("the independent directory route replaces the generic placeholder and keeps drafts local", () => {
  const source = readFileSync(new URL("../app/travel-guides/page.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../app/travel-guides/travel-guides.module.css", import.meta.url), "utf8");
  const placeholderPath = new URL("../app/[slug]/page.tsx", import.meta.url);
  const placeholder = existsSync(placeholderPath) ? readFileSync(placeholderPath, "utf8") : "";
  assert.match(source, /getTravelGuides\(localDraftPreviewEnabled\)/);
  assert.match(source, /focalPointValues\[image\.focalPoint \?\? "center"\]/);
  assert.doesNotMatch(source, /image\.displayRatio|naturalRatio|--guide-card-ratio/);
  assert.match(styles, /\.guideImage\s*\{[\s\S]*?aspect-ratio:\s*4\s*\/\s*3/);
  assert.match(styles, /\.guideImage img\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*cover;/);
  assert.match(styles, /object-position:\s*var\(--guide-card-position, center\)/);
  assert.match(source, /process\.env\.TINA_LOCAL_DRAFT_PREVIEW === "true"/);
  assert.match(source, /guide\.status === "draft" \? <span>Local Draft<\/span>/);
  assert.match(source, /guides\.length > 0/);
  assert.match(source, /Practical guides are taking shape\./);
  assert.match(source, /buildTravelGuideDirectoryStructuredData\(publicGuides/);
  assert.doesNotMatch(placeholder, /"travel-guides":/);
  assert.doesNotMatch(source, /search|filter|pagination/i);
});

test("the homepage selects three published Travel Guides from Tina data in the approved order", () => {
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const staticContent = readFileSync(new URL("../app/data/siteContent.ts", import.meta.url), "utf8");
  const expectedSlugs = [
    "how-to-pay-in-yunnan",
    "best-time-to-visit-yunnan",
    "how-to-get-around-yunnan",
  ];
  const selected = expectedSlugs
    .map((slug) => getTravelGuides().find((guide) => guide.slug === slug))
    .filter(Boolean);

  assert.deepEqual(selected.map((guide) => guide.slug), expectedSlugs);
  assert.ok(selected.every((guide) => guide.status === "published" && guide.hero?.src));
  assert.match(source, /const publishedTravelGuides = getTravelGuides\(\)/);
  assert.match(source, /homepageTravelGuides\.length > 0/);
  assert.match(source, /href=\{guide\.href\}/);
  assert.match(source, /travelGuideFocalPoints\[focalPoint\]/);
  assert.match(source, /src=\{assetPath\(cardImage\)\}/);
  assert.match(source, /Practical advice for travelling in Yunnan/);
  assert.doesNotMatch(source, /\bguides\.map\(|import \{ guides,/);
  assert.match(staticContent, /export const guides =/);
  assert.match(styles, /\.home-travel-guide-card__image-wrap\s*\{[^}]*aspect-ratio:4\/3/);
  assert.match(styles, /\.home-travel-guide-card__image-wrap img\s*\{[^}]*width:100%;[^}]*height:100%;[^}]*object-fit:cover;[^}]*object-position:var\(--home-guide-focus,center\)/);
  assert.match(styles, /@media \(max-width:760px\)[\s\S]*?\.home-travel-guides__grid \{ grid-template-columns:1fr;/);

  assert.match(source, /const cardImage = guide\.hero\.src/);
  assert.doesNotMatch(source, /homepageTravelGuideCardImages/);
});

test("metadata uses the public canonical and the existing site share image", () => {
  const source = readFileSync(new URL("../app/travel-guides/page.tsx", import.meta.url), "utf8");
  assert.match(source, /absolutePageUrl\("\/travel-guides"\)/);
  assert.match(source, /robots: \{ index: true, follow: true \}/);
  assert.match(source, /absoluteAssetUrl\("\/images\/hero\/jiuzihai-panorama\.jpg"\)/);
  assert.match(source, /summary_large_image/);
});

test("the Sitemap derives future detail URLs only from published Travel Guide data", () => {
  const source = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(source, /publishedTravelGuides\.map/);
  assert.match(source, /`\/travel-guides\/\$\{guide\.slug\}`/);
  assert.equal(source.includes(publishedContent.basic.slug), false);
});

test("Tina exposes one Chinese Travel Guide collection with reusable image controls", () => {
  const source = readFileSync(new URL("../tina/config.ts", import.meta.url), "utf8");
  const titleField = readFileSync(new URL("../tina/fields/TravelGuideTitleField.tsx", import.meta.url), "utf8");
  assert.equal((source.match(/name: "travelGuide"/g) ?? []).length, 1);
  assert.match(source, /label: "旅行攻略"/);
  assert.match(source, /path: "content\/travel-guides"/);
  assert.match(source, /label: "3\. 封面图（用于攻略目录和文章顶部）"/);
  assert.match(source, /目录卡片会自动按 4:3 裁切，可通过焦点位置调整主体/);
  assert.match(source, /beforeSubmit: prepareTravelGuideForSave/);
  assert.match(source, /fields: walkImageFields\(\)/);
  assert.match(source, /defaultItem: TRAVEL_GUIDE_DEFAULT_ITEM/);
  assert.match(source, /name: "editorLabel",[\s\S]*?required: true,[\s\S]*?isTitle: true,[\s\S]*?component: "hidden"/);
  const publicTitleField = source.match(/name: "title",\s*label: "1\. 标题（英文）",[\s\S]*?component: TravelGuideTitleField as never/)?.[0] ?? "";
  assert.ok(publicTitleField);
  assert.doesNotMatch(publicTitleField, /required: true|isTitle: true/);
  assert.match(titleField, /input\.onChange\(normalizeTravelGuideTitleValue\(value\)\)/);
  assert.doesNotMatch(titleField, /\buseField\s*\(|\buseForm\s*\(/);
  assert.match(titleField, /useFormState<\{ title\?: string \}>/);
  assert.match(titleField, /onInput=\{handleInput\}/);
  assert.match(titleField, /commitValue\(event\.currentTarget\.value\)/);
  assert.match(titleField, /onCompositionEnd=\{handleCompositionEnd\}/);
  assert.match(titleField, /commitCurrentValue\(event\)/);
  assert.doesNotMatch(titleField, /useState|\u200B|\u200C|\u200D|\uFEFF/);
});

test("the Tina title adapter syncs visible English, Chinese and composition text before navigation", () => {
  const source = readFileSync(new URL("../tina/config.ts", import.meta.url), "utf8");
  const titleField = readFileSync(new URL("../tina/fields/TravelGuideTitleField.tsx", import.meta.url), "utf8");
  assert.match(source, /name: "editorLabel",[\s\S]*?required: true,[\s\S]*?isTitle: true/);
  assert.match(titleField, /event\.currentTarget\.value/);
  assert.match(titleField, /normalizeTravelGuideTitleValue\(event\.currentTarget\.value\)/);
  assert.match(titleField, /onBlur=\{handleBlur\}/);
  assert.equal(TRAVEL_GUIDE_DEFAULT_ITEM.title, "");
  assert.equal(normalizeTravelGuideTitleValue("Yunnan Travel Guide"), "Yunnan Travel Guide");
  assert.equal(normalizeTravelGuideTitleValue("云南旅游公约"), "云南旅游公约");
  assert.equal(normalizeTravelGuideTitleValue(undefined), "");
  assert.equal(/[\u200B-\u200D\uFEFF]/u.test(TRAVEL_GUIDE_DEFAULT_ITEM.title), false);
  assert.equal(resolveTravelGuideEditorLabel("云南旅游公约", TRAVEL_GUIDE_EDITOR_DRAFT_LABEL), "云南旅游公约");
  assert.equal(resolveTravelGuideEditorLabel("", "Existing draft label"), "Existing draft label");
  assert.equal(resolveTravelGuideEditorLabel("", ""), TRAVEL_GUIDE_EDITOR_DRAFT_LABEL);
});

test("new Travel Guides use schema-compatible draft defaults without invalid optional objects", () => {
  assert.deepEqual(TRAVEL_GUIDE_DEFAULT_ITEM, {
    editorLabel: TRAVEL_GUIDE_EDITOR_DRAFT_LABEL,
    title: "",
    basic: { slug: "", category: "", region: "", summary: "" },
    hero: {
      src: "",
      alt: "",
      displayWidth: "standard",
      displayRatio: "original",
      alignment: "center",
      focalPoint: "center",
    },
    content: { introduction: "", sections: [] },
    seo: { title: "", description: "" },
    publication: { status: "draft" },
  });
});

test("save normalisation keeps drafts flexible and preserves image presentation settings", async () => {
  const errors = [];
  const cms = { alerts: { error: (message) => errors.push(message) } };
  const saved = await prepareTravelGuideForSave({
    cms,
    form: {},
    values: {
      title: "  A Useful Guide  ",
      basic: { slug: "", category: " Planning ", summary: " Summary " },
      hero: {},
      content: {
        introduction: "",
        sections: [{
          heading: " Notes ",
          body: " Body ",
          images: [{ src: "/image.jpg", alt: " View ", displayWidth: "half", displayRatio: "portrait-3-4", alignment: "right", focalPoint: "top" }],
        }],
      },
      publication: { status: "draft" },
    },
  });
  assert.equal(saved.basic.slug, "a-useful-guide");
  assert.equal(saved.editorLabel, "A Useful Guide");
  assert.equal(saved.publication.status, "draft");
  assert.deepEqual(saved.content.sections[0].images[0], {
    src: "/image.jpg",
    alt: "View",
    displayWidth: "half",
    displayRatio: "portrait-3-4",
    alignment: "right",
    focalPoint: "top",
    width: undefined,
    height: undefined,
  });
  assert.deepEqual(errors, []);
});

test("the internal editor label is never exposed through cards, detail data or structured data", () => {
  const contentWithInternalLabel = {
    ...structuredClone(publishedContent),
    editorLabel: TRAVEL_GUIDE_EDITOR_DRAFT_LABEL,
  };
  const publicOutput = JSON.stringify({
    card: travelGuideContentToCard(contentWithInternalLabel),
    detail: travelGuideContentToDetail(contentWithInternalLabel),
    structured: buildTravelGuideDirectoryStructuredData(
      travelGuideEntriesToCards([{ filename: "guide.json", content: contentWithInternalLabel }]),
      "https://yunnanunfolded.com/travel-guides/",
    ),
  });
  assert.equal(publicOutput.includes("editorLabel"), false);
  assert.equal(publicOutput.includes(TRAVEL_GUIDE_EDITOR_DRAFT_LABEL), false);
});

test("publishing incomplete content fails visibly while slug normalisation stays collection-specific", async () => {
  const errors = [];
  const cms = { alerts: { error: (message) => errors.push(message) } };
  await assert.rejects(
    prepareTravelGuideForSave({
      cms,
      form: {},
      values: { title: "", basic: {}, hero: {}, content: {}, publication: { status: "published" } },
    }),
    /保存失败：无法发布/,
  );
  assert.match(errors[0], /内容尚未保存/);
  assert.match(errors[0], /第 1 部分「标题（英文）」/);
  assert.match(errors[0], /第 2 部分「分类」/);
  assert.match(errors[0], /第 3 部分「封面图片」/);
  assert.match(errors[0], /第 4 部分「至少一个有效正文区块」/);
  assert.equal(normalizeTravelGuideSlug("content/travel-guides/First Guide.json"), "first-guide");
  assert.equal(normalizeTravelGuideSlug("travel-guides-guides-first-guide"), "first-guide");
});

test("a title-only incomplete draft saves while empty SEO, Hero and body items remain harmless", async () => {
  const saved = await prepareTravelGuideForSave({
    cms: { alerts: { error: () => assert.fail("A valid draft must not show a save error") } },
    form: { crudType: "create" },
    values: {
      title: "Working Notes for Yunnan",
      basic: {},
      hero: {},
      content: { sections: [{ heading: "", body: "", images: [] }] },
      seo: {},
      publication: { status: "draft" },
    },
  });
  assert.equal(saved.basic.slug, "working-notes-for-yunnan");
  assert.equal(saved.publication.status, "draft");
  assert.deepEqual(saved.content.sections, []);
  assert.deepEqual(saved.seo, { title: "", description: "" });
});

test("saving a blank draft gives a specific title message without making other sections required", async () => {
  const errors = [];
  await assert.rejects(
    prepareTravelGuideForSave({
      cms: { alerts: { error: (message) => errors.push(message) } },
      form: { crudType: "create" },
      values: structuredClone(TRAVEL_GUIDE_DEFAULT_ITEM),
    }),
    /第 1 部分「标题（英文）」/,
  );
  assert.match(errors[0], /其他内容仍可继续编辑/);
  assert.doesNotMatch(errors[0], /首图|正文|搜索展示/);
});

test("complete content publishes and blank SEO safely falls back to title and summary", async () => {
  const saved = await prepareTravelGuideForSave({
    cms: { alerts: { error: () => assert.fail("Complete published content must not fail") } },
    form: { crudType: "create" },
    values: structuredClone(publishedContent),
  });
  assert.equal(saved.publication.status, "published");
  const detail = travelGuideContentToDetail(saved);
  assert.equal(detail.seo.title, `${publishedContent.title} | Yunnan Unfolded`);
  assert.equal(detail.seo.description, publishedContent.basic.summary);
});

test("the publication control preflights incomplete content without poisoning Tina navigation", () => {
  const missing = getTravelGuidePublishMissingFields({
    title: "Draft Guide",
    basic: { slug: "draft-guide", category: "", summary: "" },
    hero: { src: "", alt: "" },
    content: { sections: [] },
  });
  assert.deepEqual(missing, [
    "第 2 部分「分类」",
    "第 2 部分「简短摘要」",
    "第 3 部分「封面图片」",
    "第 3 部分「封面图片英文说明」",
    "第 4 部分「至少一个有效正文区块」",
  ]);
  const publicationSource = readFileSync("tina/fields/TravelGuidePublicationStatusField.tsx", "utf8");
  assert.match(publicationSource, /getTravelGuidePublishMissingFields\(values\)/);
  assert.match(publicationSource, /内容尚未保存，当前版本仍保持草稿状态/);
  assert.match(publicationSource, /无法保存草稿。请先填写第 1 部分/);
  assert.match(readFileSync("tina/config.ts", "utf8"), /component: TravelGuidePublicationStatusField as never/);
});

test("invalid slug, publication state and image presets report their exact sections", async () => {
  const cases = [
    {
      values: { title: "Valid title", basic: { slug: "中文" }, publication: { status: "draft" } },
      expected: /第 2 部分「分类与摘要」中的页面网址无效/,
    },
    {
      values: { title: "Valid title", basic: {}, publication: { status: "ready" } },
      expected: /第 6 部分「保存与发布」的当前状态无效/,
    },
    {
      values: {
        title: "Valid title",
        basic: {},
        hero: { src: "/image.jpg", displayWidth: "giant" },
        publication: { status: "draft" },
      },
      expected: /第 3 部分「首图」的显示宽度设置无效/,
    },
  ];
  for (const current of cases) {
    await assert.rejects(
      prepareTravelGuideForSave({
        cms: { alerts: { error: () => undefined } },
        form: { crudType: "create" },
        values: current.values,
      }),
      current.expected,
    );
  }
});

test("a duplicate Travel Guide slug is blocked while an existing document excludes itself", async () => {
  const duplicateNode = {
    basic: { slug: "existing-guide" },
    _sys: {
      filename: "existing-guide",
      path: "content/travel-guides/existing-guide.json",
      relativePath: "existing-guide.json",
    },
  };
  const errors = [];
  const cms = {
    alerts: { error: (message) => errors.push(message) },
    api: { tina: { request: async () => ({ travelGuideConnection: { edges: [{ node: duplicateNode }] } }) } },
  };
  const values = {
    title: "Existing Guide",
    basic: { slug: "existing-guide", category: "Planning", summary: "Summary" },
    hero: {},
    content: {},
    publication: { status: "draft" },
  };

  await assert.rejects(
    prepareTravelGuideForSave({ values, cms, form: { crudType: "create" } }),
    /已被其他旅行攻略使用/,
  );
  assert.match(errors.at(-1), /内容尚未保存/);

  const updated = await prepareTravelGuideForSave({
    values,
    cms,
    form: {
      crudType: "update",
      id: "content/travel-guides/existing-guide.json",
      initialValues: { basic: { slug: "existing-guide" } },
    },
  });
  assert.equal(updated.basic.slug, "existing-guide");
});

test("slug checks preserve the Tina client method binding used by the browser", async () => {
  let bindingPreserved = false;
  const tina = {
    async request() {
      bindingPreserved = this === tina;
      return { travelGuideConnection: { edges: [] } };
    },
  };
  const saved = await prepareTravelGuideForSave({
    cms: { alerts: { error: () => assert.fail("The bound request must succeed") }, api: { tina } },
    form: { crudType: "create" },
    values: {
      title: "Bound Client Draft",
      basic: {},
      hero: {},
      content: {},
      seo: {},
      publication: { status: "draft" },
    },
  });
  assert.equal(bindingPreserved, true);
  assert.equal(saved.basic.slug, "bound-client-draft");
});
