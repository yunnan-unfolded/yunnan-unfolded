import {
  normalizeTravelGuideSlug,
  resolveTravelGuideEditorLabel,
  TRAVEL_GUIDE_IMAGE_ALIGNMENTS,
  TRAVEL_GUIDE_IMAGE_FOCAL_POINTS,
  TRAVEL_GUIDE_IMAGE_RATIOS,
  TRAVEL_GUIDE_IMAGE_WIDTHS,
} from "../shared/travelGuideDefaults.ts";

type TravelGuideNode = {
  basic?: { slug?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type TravelGuideSlugResponse = {
  travelGuideConnection?: { edges?: Array<{ node?: TravelGuideNode | null } | null> };
};

type SaveForm = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  initialValues?: { basic?: { slug?: string }; _sys?: TravelGuideNode["_sys"] };
  getState?: () => { initialValues?: { basic?: { slug?: string }; _sys?: TravelGuideNode["_sys"] } };
};

type SaveCms = {
  alerts?: { error: (message: string) => unknown };
  api?: { tina?: { request: (query: string, options: { variables: Record<string, unknown> }) => Promise<unknown> } };
};

type SaveContext = {
  values: Record<string, unknown>;
  cms: SaveCms;
  form: SaveForm;
};

function normalizeDocumentPath(value: unknown) {
  if (typeof value !== "string") return "";
  return decodeURIComponent(value)
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function getInitialValues(form: SaveForm) {
  return form.getState?.().initialValues ?? form.initialValues;
}

function currentFilenameSlug(form: SaveForm) {
  const source = [
    getInitialValues(form)?._sys?.filename,
    form.relativePath,
    form.path,
    form.id,
  ].find((value) => typeof value === "string" && value.trim());
  if (typeof source !== "string") return "";
  return normalizeTravelGuideSlug(source.split(/[\\/]/).at(-1) ?? "");
}

function isSameTravelGuide(node: TravelGuideNode, form: SaveForm) {
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

function findDuplicateTravelGuide(nodes: TravelGuideNode[], slug: string, form: SaveForm) {
  const sameSlug = nodes.filter((node) => normalizeTravelGuideSlug(node.basic?.slug ?? "") === slug);
  const current = sameSlug.find((node) => isSameTravelGuide(node, form));
  if (current) return sameSlug.find((node) => node !== current);
  const initialSlug = normalizeTravelGuideSlug(getInitialValues(form)?.basic?.slug ?? "");
  if (form.crudType === "update" && initialSlug === slug && sameSlug.length === 1) return undefined;
  return sameSlug[0];
}

async function getTravelGuideSlugError(cms: SaveCms, form: SaveForm, slug: string) {
  const tinaApi = cms.api?.tina;
  if (!tinaApi) return undefined;
  let response: TravelGuideSlugResponse;
  try {
    response = await tinaApi.request(
      `query TravelGuideSlugs { travelGuideConnection { edges { node { basic { slug } _sys { filename path relativePath } } } } }`,
      { variables: {} },
    ) as TravelGuideSlugResponse;
  } catch {
    return "暂时无法检查页面网址是否重复，请稍后重试。";
  }
  const nodes = response.travelGuideConnection?.edges
    ?.map((edge) => edge?.node)
    .filter((node): node is TravelGuideNode => Boolean(node)) ?? [];
  return findDuplicateTravelGuide(nodes, slug, form)
    ? `页面网址“${slug}”已被其他旅行攻略使用，请更换标题或页面网址后再保存。`
    : undefined;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function validChoice<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]) {
  return options.includes(value as T[number]) ? value as T[number] : fallback;
}

function invalidChoice(value: unknown, options: readonly string[]) {
  return value !== undefined && value !== null && value !== "" && !options.includes(String(value));
}

function imagePresetErrors(value: unknown, location: string) {
  if (!value || typeof value !== "object") return [];
  const image = value as Record<string, unknown>;
  if (!cleanText(image.src)) return [];
  const errors: string[] = [];
  if (invalidChoice(image.displayWidth, TRAVEL_GUIDE_IMAGE_WIDTHS)) errors.push(`${location}的显示宽度`);
  if (invalidChoice(image.displayRatio, TRAVEL_GUIDE_IMAGE_RATIOS)) errors.push(`${location}的图片比例`);
  if (invalidChoice(image.alignment, TRAVEL_GUIDE_IMAGE_ALIGNMENTS)) errors.push(`${location}的图片位置`);
  if (invalidChoice(image.focalPoint, TRAVEL_GUIDE_IMAGE_FOCAL_POINTS)) errors.push(`${location}的画面重点`);
  return errors;
}

function collectImagePresetErrors(hero: unknown, sections: unknown) {
  const errors = imagePresetErrors(hero, "第 3 部分「首图」");
  if (!Array.isArray(sections)) return errors;
  sections.forEach((section, sectionIndex) => {
    if (!section || typeof section !== "object") return;
    const images = (section as Record<string, unknown>).images;
    if (!Array.isArray(images)) return;
    images.forEach((image, imageIndex) => {
      errors.push(...imagePresetErrors(image, `第 4 部分「正文」第 ${sectionIndex + 1} 个区块第 ${imageIndex + 1} 张图片`));
    });
  });
  return errors;
}

export function getTravelGuidePublishMissingFields(values: Record<string, unknown>) {
  const title = cleanText(values.title);
  const basic = (values.basic as Record<string, unknown> | undefined) ?? {};
  const hero = (values.hero as Record<string, unknown> | undefined) ?? {};
  const content = (values.content as Record<string, unknown> | undefined) ?? {};
  const sections = cleanSections(content.sections);
  const slug = normalizeTravelGuideSlug(cleanText(basic.slug) || title);
  const missing: string[] = [];

  if (!title) missing.push("第 1 部分「标题（英文）」");
  if (!slug) missing.push("第 2 部分「有效的页面网址」");
  if (!cleanText(basic.category)) missing.push("第 2 部分「分类」");
  if (!cleanText(basic.summary)) missing.push("第 2 部分「简短摘要」");
  if (!cleanText(hero.src)) missing.push("第 3 部分「封面图片」");
  if (!cleanText(hero.alt)) missing.push("第 3 部分「封面图片英文说明」");
  if (!sections.some((section) => Boolean(section.heading || section.body))) {
    missing.push("第 4 部分「至少一个有效正文区块」");
  }
  sections.forEach((section, sectionIndex) => {
    section.images.forEach((image, imageIndex) => {
      if (!image.alt) missing.push(`第 4 部分第 ${sectionIndex + 1} 个正文区块的第 ${imageIndex + 1} 张图片英文说明`);
    });
  });

  return missing;
}

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      ...item,
      src: cleanText(item.src),
      alt: cleanText(item.alt),
      displayWidth: validChoice(item.displayWidth, TRAVEL_GUIDE_IMAGE_WIDTHS, "standard"),
      displayRatio: validChoice(item.displayRatio, TRAVEL_GUIDE_IMAGE_RATIOS, "original"),
      alignment: validChoice(item.alignment, TRAVEL_GUIDE_IMAGE_ALIGNMENTS, "center"),
      focalPoint: validChoice(item.focalPoint, TRAVEL_GUIDE_IMAGE_FOCAL_POINTS, "center"),
      width: cleanOptionalNumber(item.width),
      height: cleanOptionalNumber(item.height),
    }))
    .filter((item) => Boolean(item.src));
}

function cleanSections(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      ...item,
      heading: cleanText(item.heading),
      body: cleanText(item.body),
      images: cleanImages(item.images),
    }))
    .filter((item) => Boolean(item.heading || item.body || item.images.length));
}

function failSave(cms: SaveCms, message: string): never {
  cms.alerts?.error(message);
  throw new Error(message);
}

export async function prepareTravelGuideForSave({ values, cms, form }: SaveContext) {
  const title = cleanText(values.title);
  const basicValues = (values.basic as Record<string, unknown> | undefined) ?? {};
  const requestedSlug = cleanText(basicValues.slug);
  const slug = normalizeTravelGuideSlug(requestedSlug || title);
  const publicationValues = (values.publication as Record<string, unknown> | undefined) ?? {};
  const requestedStatus = publicationValues.status;
  if (requestedStatus !== undefined && requestedStatus !== "draft" && requestedStatus !== "published") {
    failSave(cms, "保存失败：第 6 部分「保存与发布」的当前状态无效。内容尚未保存。");
  }
  const publication = {
    ...publicationValues,
    status: requestedStatus === "published" ? "published" : "draft",
  };
  if (publication.status === "draft" && !title) {
    failSave(cms, "保存失败：请先填写第 1 部分「标题（英文）」。其他内容仍可继续编辑，当前内容尚未保存。");
  }
  if (publication.status === "draft" && !slug) {
    failSave(cms, "保存失败：第 2 部分「分类与摘要」中的页面网址无效，请使用英文标题或英文页面网址。内容尚未保存。");
  }
  const basic = {
    ...basicValues,
    slug,
    category: cleanText(basicValues.category),
    region: cleanText(basicValues.region),
    summary: cleanText(basicValues.summary),
  };
  const heroValues = (values.hero as Record<string, unknown> | undefined) ?? {};
  const heroImage = cleanImages([heroValues])[0] ?? {
    src: "",
    alt: "",
    displayWidth: "standard",
    displayRatio: "original",
    alignment: "center",
    focalPoint: "center",
  };
  const contentValues = (values.content as Record<string, unknown> | undefined) ?? {};
  const presetErrors = collectImagePresetErrors(heroValues, contentValues.sections);
  if (presetErrors.length > 0) {
    failSave(cms, `保存失败：${presetErrors.join("、")}设置无效，请重新选择。内容尚未保存。`);
  }
  const content = {
    ...contentValues,
    introduction: cleanText(contentValues.introduction),
    sections: cleanSections(contentValues.sections),
  };
  const seoValues = (values.seo as Record<string, unknown> | undefined) ?? {};
  const seo = {
    ...seoValues,
    title: cleanText(seoValues.title),
    description: cleanText(seoValues.description),
  };

  if (publication.status === "published") {
    const missing = getTravelGuidePublishMissingFields({
      ...values,
      title,
      basic,
      hero: heroImage,
      content,
    });
    if (missing.length > 0) {
      failSave(cms, `保存失败：无法发布。请完成：${missing.join("、")}。内容尚未保存；已保存版本仍保持草稿状态。`);
    }
  }

  const slugError = await getTravelGuideSlugError(cms, form, slug);
  if (slugError) failSave(cms, `保存失败：${slugError} 内容尚未保存。`);

  return {
    ...values,
    editorLabel: resolveTravelGuideEditorLabel(title, values.editorLabel),
    title,
    basic,
    hero: heroImage,
    content,
    seo,
    publication,
  };
}

export const travelGuideSaveTestables = {
  cleanImages,
  cleanSections,
  collectImagePresetErrors,
  currentFilenameSlug,
  findDuplicateTravelGuide,
  isSameTravelGuide,
  normalizeDocumentPath,
};
