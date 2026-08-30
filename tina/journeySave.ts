type JourneyNode = {
  basic?: { slug?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type JourneySlugResponse = {
  journeyConnection?: { edges?: Array<{ node?: JourneyNode | null } | null> };
};

type JourneyInitialValues = {
  basic?: { slug?: string };
  itinerary?: { days?: unknown[] };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type SaveForm = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  initialValues?: JourneyInitialValues;
  getState?: () => { initialValues?: JourneyInitialValues };
};

type SaveCms = {
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

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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

function failSave(cms: SaveCms, message: string): never {
  cms.alerts?.error(message);
  throw new Error(message);
}

export async function prepareJourneyForSave({ values, cms, form }: JourneySaveContext) {
  const basic = { ...((values.basic as Record<string, unknown> | undefined) ?? {}) };
  const itinerary = { ...((values.itinerary as Record<string, unknown> | undefined) ?? {}) };
  const publicationValues = (values.publication as Record<string, unknown> | undefined) ?? {};
  const publication = { ...publicationValues, status: publicationValues.status || "draft" };
  const rawDays = Array.isArray(itinerary.days) ? itinerary.days as Array<Record<string, unknown>> : [];
  const days: Array<Record<string, unknown>> = rawDays.map((day, index) => ({ ...day, day: index + 1 }));
  const initialDays = getInitialValues(form)?.itinerary?.days ?? [];

  if (days.length < initialDays.length && typeof globalThis.confirm === "function") {
    const confirmed = globalThis.confirm(`确定删除 ${initialDays.length - days.length} 天行程并保存吗？此操作只影响当前路线。`);
    if (!confirmed) failSave(cms, "已取消删除，内容尚未保存。");
  }

  const slug = slugify(String(basic.slug || basic.collection || basic.title || "journey"));
  basic.slug = slug;
  basic.durationDays = days.length;
  if (typeof basic.durationNights !== "number") basic.durationNights = Math.max(0, days.length - 1);
  itinerary.days = days;

  if (publication.status === "published") {
    const missing: string[] = [];
    if (!basic.collection) missing.push("路线名称");
    if (!basic.title) missing.push("页面标题");
    if (!basic.listingDescription) missing.push("路线列表简介");
    const hero = values.hero as Record<string, unknown> | undefined;
    if (!hero?.src) missing.push("首图");
    if (!hero?.alt) missing.push("首图英文说明");
    if (days.length === 0) missing.push("至少一天每日行程");

    days.forEach((day, index) => {
      if (!day.title) missing.push(`第${index + 1}天标题`);
      if (!day.route) missing.push(`第${index + 1}天路线`);
      if (!day.overnight) missing.push(`第${index + 1}天住宿地点`);
      const images = Array.isArray(day.images) ? day.images as Array<Record<string, unknown>> : [];
      if (images.length > 2) missing.push(`第${index + 1}天最多只能上传两张图片`);
      if (day.mediaLayout === "two-images" && images.length !== 2) missing.push(`第${index + 1}天选择“两张图片并排”时必须上传两张图片`);
      images.forEach((image, imageIndex) => {
        if (!image.src) missing.push(`第${index + 1}天第${imageIndex + 1}张图片`);
        if (!image.alt) missing.push(`第${index + 1}天第${imageIndex + 1}张图片英文说明`);
      });
    });
    if (missing.length > 0) failSave(cms, `保存失败：发布前请完成：${missing.join("、")}。内容尚未保存。`);

    let response: JourneySlugResponse;
    try {
      response = await cms.api.tina.request(
        `query JourneySlugs { journeyConnection { edges { node { basic { slug } _sys { filename path relativePath } } } } }`,
        { variables: {} },
      ) as JourneySlugResponse;
    } catch {
      failSave(cms, "保存失败：暂时无法检查页面网址是否重复。内容尚未保存，请稍后重试。");
    }

    const nodes = response.journeyConnection?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is JourneyNode => Boolean(node)) ?? [];
    const duplicate = findDuplicateJourney(nodes, slug, form);
    if (duplicate) failSave(cms, `保存失败：页面网址“${slug}”已被其他路线使用，请更换后再保存。内容尚未保存。`);
  }

  return { ...values, basic, itinerary, publication };
}

export const journeySaveTestables = { findDuplicateJourney, isSameDocument, normalizeDocumentPath };
