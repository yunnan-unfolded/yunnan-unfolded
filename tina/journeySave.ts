import { normalizeJourneySlug, normalizeLinesList } from "../shared/journeyDefaults.ts";

type JourneyNode = {
  basic?: { slug?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type JourneySlugResponse = {
  journeyConnection?: { edges?: Array<{ node?: JourneyNode | null } | null> };
};

type JourneyInitialValues = {
  title?: string;
  basic?: { slug?: string };
  itinerary?: { days?: unknown[] };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

export type SaveForm = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  initialValues?: JourneyInitialValues;
  getState?: () => { initialValues?: JourneyInitialValues };
};

export type SaveCms = {
  alerts?: { error: (message: string) => unknown };
  api: {
    tina: {
      request: (query: string, options: { variables: Record<string, unknown> }) => Promise<unknown>;
    };
  };
};

export type JourneySaveContext = {
  values: Record<string, unknown>;
  cms: SaveCms;
  form: SaveForm;
};

function normalizeDocumentPath(value: unknown) {
  if (typeof value !== "string") return "";
  return decodeURIComponent(value)
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function getInitialValues(form: SaveForm) {
  return form.getState?.().initialValues ?? form.initialValues;
}

function isSameDocument(node: JourneyNode, form: SaveForm) {
  // Tina updates a create-form path as the generated filename changes. That
  // path is only a proposed destination, never an existing current document.
  if (form.crudType === "create") return false;

  const initialValues = getInitialValues(form);
  const currentPaths = [
    form.id,
    form.path,
    form.relativePath,
    initialValues?._sys?.path,
    initialValues?._sys?.relativePath,
    initialValues?._sys?.filename,
  ].map(normalizeDocumentPath).filter(Boolean);
  const nodePaths = [node._sys?.path, node._sys?.relativePath, node._sys?.filename]
    .map(normalizeDocumentPath)
    .filter(Boolean);

  return currentPaths.some((currentPath) => nodePaths.some((nodePath) => (
    currentPath === nodePath
    || currentPath.endsWith(`/${nodePath}`)
    || nodePath.endsWith(`/${currentPath}`)
  )));
}

function findDuplicateJourney(nodes: JourneyNode[], slug: string, form: SaveForm) {
  const sameSlug = nodes.filter((node) => node.basic?.slug === slug);
  const pathMatchedCurrent = sameSlug.find((node) => isSameDocument(node, form));
  if (pathMatchedCurrent) return sameSlug.find((node) => node !== pathMatchedCurrent);

  // Tina normally exposes the full path on update forms. If a version omits it,
  // exclude exactly one unchanged existing slug, but never hide a real duplicate.
  const initialSlug = getInitialValues(form)?.basic?.slug;
  if (form.crudType === "update" && initialSlug === slug && sameSlug.length === 1) return undefined;

  return sameSlug[0];
}

export async function getJourneySlugValidationError({
  cms,
  form,
  rawSlug,
  title,
}: {
  cms: SaveCms;
  form: SaveForm;
  rawSlug?: unknown;
  title?: unknown;
}) {
  const normalizedTitle = String(title ?? "").trim();
  if (!normalizedTitle) return "请先填写路线名称。";

  const slug = normalizeJourneySlug(String(rawSlug || normalizedTitle));
  if (!slug) return "无法根据路线名称生成页面网址，请使用英文路线名称。";

  let response: JourneySlugResponse;
  try {
    response = await cms.api.tina.request(
      `query JourneySlugs { journeyConnection { edges { node { basic { slug } _sys { filename path relativePath } } } } }`,
      { variables: {} },
    ) as JourneySlugResponse;
  } catch {
    return "暂时无法检查页面网址是否重复，请稍后重试。";
  }

  const nodes = response.journeyConnection?.edges
    ?.map((edge) => edge?.node)
    .filter((node): node is JourneyNode => Boolean(node)) ?? [];
  return findDuplicateJourney(nodes, slug, form)
    ? `页面网址“${slug}”已被其他路线使用，请更换路线名称后再保存。`
    : undefined;
}

function failSave(cms: SaveCms, message: string): never {
  cms.alerts?.error(message);
  throw new Error(message);
}

function cleanStringArray(value: unknown) {
  return normalizeLinesList(value);
}

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ ...item, src: String(item.src ?? "").trim(), alt: String(item.alt ?? "").trim() }))
    .filter((item) => Boolean(item.src));
}

function cleanHighlightItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({ ...item, title: String(item.title ?? "").trim(), description: String(item.description ?? "").trim() }))
    .filter((item) => Boolean(item.title));
}

export async function prepareJourneyForSave({ values, cms, form }: JourneySaveContext) {
  const basic = { ...((values.basic as Record<string, unknown> | undefined) ?? {}) };
  const overview = { ...((values.overview as Record<string, unknown> | undefined) ?? {}) };
  const itinerary = { ...((values.itinerary as Record<string, unknown> | undefined) ?? {}) };
  const highlights = { ...((values.highlights as Record<string, unknown> | undefined) ?? {}) };
  const gallery = { ...((values.gallery as Record<string, unknown> | undefined) ?? {}) };
  const inclusions = { ...((values.inclusions as Record<string, unknown> | undefined) ?? {}) };
  const audience = { ...((values.audience as Record<string, unknown> | undefined) ?? {}) };
  const booking = { ...((values.booking as Record<string, unknown> | undefined) ?? {}) };
  const seo = { ...((values.seo as Record<string, unknown> | undefined) ?? {}) };
  const advanced = { ...((values.advanced as Record<string, unknown> | undefined) ?? {}) };
  const publicationValues = (values.publication as Record<string, unknown> | undefined) ?? {};
  const publication = { ...publicationValues, status: publicationValues.status || "draft" };
  const rawDays = Array.isArray(itinerary.days) ? itinerary.days as Array<Record<string, unknown>> : [];
  const days: Array<Record<string, unknown>> = rawDays.map((day, index) => ({
    ...day,
    day: index + 1,
    title: String(day.title ?? "").trim(),
    logistics: typeof day.logistics === "string" ? day.logistics.trim() : day.logistics,
    paragraphs: cleanStringArray(day.paragraphs),
    experiences: cleanStringArray(day.experiences),
    images: cleanImages(day.images),
    options: Array.isArray(day.options) ? day.options.map((option) => {
      const entry = option as Record<string, unknown>;
      return { ...entry, points: cleanStringArray(entry.points) };
    }) : [],
  }));
  const initialDays = getInitialValues(form)?.itinerary?.days ?? [];

  if (days.length < initialDays.length && typeof globalThis.confirm === "function") {
    const confirmed = globalThis.confirm(`确定删除 ${initialDays.length - days.length} 天行程并保存吗？此操作只影响当前路线。`);
    if (!confirmed) failSave(cms, "已取消删除，内容尚未保存。");
  }

  const title = String(values.title || basic.collection || basic.title || "").trim();
  const summary = String(values.summary || basic.listingDescription || basic.subtitle || "").trim();
  const slug = normalizeJourneySlug(String(basic.slug || title));
  if (!title) failSave(cms, "保存失败：请先填写路线名称。内容尚未保存。");
  if (!slug) failSave(cms, "保存失败：无法根据路线名称生成页面网址，请使用英文路线名称。内容尚未保存。");
  basic.slug = slug;
  basic.durationDays = days.length;
  if (typeof basic.durationNights !== "number") basic.durationNights = Math.max(0, days.length - 1);
  if ("searchKeywords" in basic) basic.searchKeywords = cleanStringArray(basic.searchKeywords);
  if ("heroFacts" in basic) basic.heroFacts = cleanStringArray(basic.heroFacts);
  if ("promises" in basic) basic.promises = cleanStringArray(basic.promises);
  overview.paragraphs = cleanStringArray(overview.paragraphs);
  itinerary.days = days;
  highlights.items = cleanHighlightItems(highlights.items);
  highlights.images = cleanImages(highlights.images);
  gallery.images = cleanImages(gallery.images);
  inclusions.included = cleanStringArray(inclusions.included);
  inclusions.excluded = cleanStringArray(inclusions.excluded);
  audience.suitable = cleanStringArray(audience.suitable);
  audience.considerations = cleanStringArray(audience.considerations);
  booking.conditions = cleanStringArray(booking.conditions);
  seo.keywords = cleanStringArray(seo.keywords);

  const advancedHero = { ...((advanced.hero as Record<string, unknown> | undefined) ?? {}) };
  const advancedInquiry = { ...((advanced.inquiry as Record<string, unknown> | undefined) ?? {}) };
  advancedHero.facts = cleanStringArray(advancedHero.facts);
  advancedInquiry.promises = cleanStringArray(advancedInquiry.promises);
  advanced.hero = advancedHero;
  advanced.inquiry = advancedInquiry;

  if (publication.status === "published") {
    const missing: string[] = [];
    if (!title) missing.push("路线名称");
    if (!summary) missing.push("路线简介");
    const hero = values.hero as Record<string, unknown> | undefined;
    if (!hero?.src) missing.push("首图");
    if (days.length === 0) missing.push("至少一天每日行程");

    days.forEach((day, index) => {
      if (!day.title) missing.push(`第${index + 1}天标题`);
      if (!day.logistics && !day.route) missing.push(`第${index + 1}天交通与住宿`);
      if (!day.logistics && !day.overnight) missing.push(`第${index + 1}天住宿地点`);
      const images = Array.isArray(day.images) ? day.images as Array<Record<string, unknown>> : [];
      images.forEach((image, imageIndex) => {
        if (!image.src) missing.push(`第${index + 1}天第${imageIndex + 1}张图片`);
      });
    });
    if (missing.length > 0) failSave(cms, `保存失败：发布前请完成：${missing.join("、")}。内容尚未保存。`);
  }

  const slugError = await getJourneySlugValidationError({ cms, form, rawSlug: slug, title });
  if (slugError) failSave(cms, `保存失败：${slugError} 内容尚未保存。`);

  return { ...values, title, summary, basic, overview, itinerary, highlights, gallery, inclusions, audience, booking, seo, advanced, publication };
}

export const journeySaveTestables = { cleanHighlightItems, cleanStringArray, findDuplicateJourney, isSameDocument, normalizeDocumentPath };
