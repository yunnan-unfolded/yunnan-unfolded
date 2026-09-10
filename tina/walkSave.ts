import {
  normalizeWalkLines,
  normalizeWalkSlug,
  WALK_DIFFICULTIES,
  WALK_IMAGE_ALIGNMENTS,
  WALK_IMAGE_FOCAL_POINTS,
  WALK_IMAGE_RATIOS,
  WALK_IMAGE_WIDTHS,
} from "../shared/walkDefaults.ts";

type WalkNode = {
  basic?: { slug?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type WalkSlugResponse = {
  walkConnection?: { edges?: Array<{ node?: WalkNode | null } | null> };
};

type WalkInitialValues = {
  title?: string;
  basic?: { slug?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

export type WalkSaveForm = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  initialValues?: WalkInitialValues;
  getState?: () => { initialValues?: WalkInitialValues };
};

export type WalkSaveCms = {
  alerts?: { error: (message: string) => unknown };
  api: {
    tina: {
      request: (query: string, options: { variables: Record<string, unknown> }) => Promise<unknown>;
    };
  };
};

export type WalkSaveContext = {
  values: Record<string, unknown>;
  cms: WalkSaveCms;
  form: WalkSaveForm;
};

function normalizeDocumentPath(value: unknown) {
  if (typeof value !== "string") return "";
  return decodeURIComponent(value)
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function getInitialValues(form: WalkSaveForm) {
  return form.getState?.().initialValues ?? form.initialValues;
}

function currentFilenameSlug(form: WalkSaveForm) {
  const source = [
    getInitialValues(form)?._sys?.filename,
    form.relativePath,
    form.path,
    form.id,
  ].find((value) => typeof value === "string" && value.trim());
  if (typeof source !== "string") return "";
  return normalizeWalkSlug(source.split(/[\\/]/).at(-1) ?? "");
}

function isSameWalk(node: WalkNode, form: WalkSaveForm) {
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

function findDuplicateWalk(nodes: WalkNode[], slug: string, form: WalkSaveForm) {
  const sameSlug = nodes.filter((node) => normalizeWalkSlug(node.basic?.slug ?? "") === slug);
  const pathMatchedCurrent = sameSlug.find((node) => isSameWalk(node, form));
  if (pathMatchedCurrent) return sameSlug.find((node) => node !== pathMatchedCurrent);

  const initialSlug = normalizeWalkSlug(getInitialValues(form)?.basic?.slug ?? "");
  if (form.crudType === "update" && initialSlug === slug && sameSlug.length === 1) return undefined;
  return sameSlug[0];
}

export async function getWalkSlugValidationError({
  cms,
  form,
  rawSlug,
  title,
}: {
  cms: WalkSaveCms;
  form: WalkSaveForm;
  rawSlug?: unknown;
  title?: unknown;
}) {
  const proposed = String(rawSlug || title || currentFilenameSlug(form)).trim();
  if (!proposed) return undefined;
  const slug = normalizeWalkSlug(proposed);
  if (!slug) return "无法生成页面网址，请使用英文路线名称。";

  let response: WalkSlugResponse;
  try {
    response = await cms.api.tina.request(
      `query WalkSlugs { walkConnection { edges { node { basic { slug } _sys { filename path relativePath } } } } }`,
      { variables: {} },
    ) as WalkSlugResponse;
  } catch {
    return "暂时无法检查页面网址是否重复，请稍后重试。";
  }

  const nodes = response.walkConnection?.edges
    ?.map((edge) => edge?.node)
    .filter((node): node is WalkNode => Boolean(node)) ?? [];
  return findDuplicateWalk(nodes, slug, form)
    ? `页面网址“${slug}”已被其他徒步路线使用，请更换路线名称或页面网址后再保存。`
    : undefined;
}

function failSave(cms: WalkSaveCms, message: string): never {
  cms.alerts?.error(message);
  throw new Error(message);
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validChoice<T extends readonly string[]>(value: unknown, choices: T, fallback: T[number]) {
  return choices.includes(value as T[number]) ? value as T[number] : fallback;
}

function cleanWalkImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      ...item,
      src: cleanText(item.src),
      alt: cleanText(item.alt),
      displayWidth: validChoice(item.displayWidth, WALK_IMAGE_WIDTHS, "standard"),
      displayRatio: validChoice(item.displayRatio, WALK_IMAGE_RATIOS, "original"),
      alignment: validChoice(item.alignment, WALK_IMAGE_ALIGNMENTS, "center"),
      focalPoint: validChoice(item.focalPoint, WALK_IMAGE_FOCAL_POINTS, "center"),
    }))
    .filter((item) => Boolean(item.src));
}

function cleanStages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      ...item,
      title: cleanText(item.title),
      body: cleanText(item.body),
      images: cleanWalkImages(item.images),
    }));
}

export async function prepareWalkForSave({ values, cms, form }: WalkSaveContext) {
  const title = cleanText(values.title);
  const basicValues = (values.basic as Record<string, unknown> | undefined) ?? {};
  const basic = {
    ...basicValues,
    slug: cleanText(basicValues.slug),
    region: cleanText(basicValues.region),
    summary: cleanText(basicValues.summary),
    difficulty: validChoice(basicValues.difficulty, WALK_DIFFICULTIES, "gentle"),
    approximateDuration: cleanText(basicValues.approximateDuration),
    recommendedSeasons: cleanText(basicValues.recommendedSeasons),
    searchKeywords: normalizeWalkLines(basicValues.searchKeywords),
  };
  const routeValues = (values.route as Record<string, unknown> | undefined) ?? {};
  const route = {
    ...routeValues,
    introduction: cleanText(routeValues.introduction),
    stages: cleanStages(routeValues.stages),
  };
  const galleryValues = (values.gallery as Record<string, unknown> | undefined) ?? {};
  const gallery = { ...galleryValues, images: cleanWalkImages(galleryValues.images) };
  const practicalValues = (values.practical as Record<string, unknown> | undefined) ?? {};
  const practical = {
    ...practicalValues,
    seasonNote: cleanText(practicalValues.seasonNote),
    preparationNotes: normalizeWalkLines(practicalValues.preparationNotes),
    relatedJourney: cleanText(practicalValues.relatedJourney),
  };
  const heroValues = (values.hero as Record<string, unknown> | undefined) ?? {};
  const hero = { ...heroValues, src: cleanText(heroValues.src), alt: cleanText(heroValues.alt) };
  const seoValues = (values.seo as Record<string, unknown> | undefined) ?? {};
  const seo = { ...seoValues, title: cleanText(seoValues.title), description: cleanText(seoValues.description) };
  const publicationValues = (values.publication as Record<string, unknown> | undefined) ?? {};
  const publication = { ...publicationValues, status: publicationValues.status === "published" ? "published" : "draft" };
  const slug = normalizeWalkSlug(String(basic.slug || title || currentFilenameSlug(form) || "new-walk"));
  basic.slug = slug || "new-walk";

  if (publication.status === "published") {
    const missing: string[] = [];
    if (!title) missing.push("路线名称");
    if (!basic.region) missing.push("所在地区");
    if (!basic.summary) missing.push("列表简短介绍");
    if (!basic.difficulty) missing.push("徒步难度");
    if (!basic.approximateDuration) missing.push("大约时长");
    if (!basic.recommendedSeasons) missing.push("推荐季节");
    if (!hero.src) missing.push("首图");
    if (!hero.alt) missing.push("首图英文说明");
    if (!route.introduction) missing.push("路线整体介绍");
    route.stages.forEach((stage, stageIndex) => {
      const stageLabel = stage.title ? `路线阶段“${stage.title}”` : `路线阶段 ${stageIndex + 1}`;
      stage.images.forEach((image, imageIndex) => {
        if (!image.alt) missing.push(`${stageLabel}第 ${imageIndex + 1} 张图片英文说明`);
      });
    });
    gallery.images.forEach((image, imageIndex) => {
      if (!image.alt) missing.push(`路线图集第 ${imageIndex + 1} 张图片英文说明`);
    });
    if (missing.length > 0) {
      failSave(cms, `保存失败：发布前请完成：${missing.join("、")}。内容尚未保存。`);
    }
  }

  const slugError = await getWalkSlugValidationError({ cms, form, rawSlug: basic.slug, title });
  if (slugError) failSave(cms, `保存失败：${slugError} 内容尚未保存。`);

  return { ...values, title, basic, hero, route, gallery, practical, seo, publication };
}

export const walkSaveTestables = {
  cleanStages,
  cleanWalkImages,
  currentFilenameSlug,
  findDuplicateWalk,
  isSameWalk,
  normalizeDocumentPath,
};
