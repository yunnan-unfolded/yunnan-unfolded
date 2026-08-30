import type { JourneyContent } from "../types/journey";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const mediaLayouts = new Set(["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"]);
const imageSizes = new Set(["compact", "standard", "wide"]);
const displayRatios = new Set(["landscape", "portrait", "square", "original"]);
const focalPoints = new Set(["top", "center", "bottom", "left", "right"]);

function requiredText(value: unknown, label: string, errors: string[]) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${label}不能为空`);
}

export function validateJourneyContent(content: JourneyContent, filename = "Journey") {
  const errors: string[] = [];
  requiredText(content.basic?.slug, `${filename}：slug`, errors);
  const isPublished = content.publication?.status === "published";
  if (isPublished) {
    requiredText(content.basic?.collection, `${filename}：路线名称`, errors);
    requiredText(content.basic?.title, `${filename}：页面标题`, errors);
    requiredText(content.basic?.listingDescription, `${filename}：列表简介`, errors);
    requiredText(content.hero?.src, `${filename}：首图`, errors);
    requiredText(content.hero?.alt, `${filename}：首图英文说明`, errors);
  }

  if (content.basic?.slug && !slugPattern.test(content.basic.slug)) {
    errors.push(`${filename}：slug只能使用小写英文字母、数字和连字符`);
  }

  const days = content.itinerary?.days ?? [];
  if (isPublished && content.basic?.durationDays !== days.length) {
    errors.push(`${filename}：行程天数必须与每日行程数量一致`);
  }

  days.forEach((day, index) => {
    const label = `${filename}：第${index + 1}天`;
    if (isPublished) {
      requiredText(day.title, `${label}标题`, errors);
      requiredText(day.route, `${label}路线`, errors);
      requiredText(day.overnight, `${label}住宿地点`, errors);
    }
    if (day.mediaLayout && !mediaLayouts.has(day.mediaLayout)) errors.push(`${label}图文版式无效`);
    if (day.imageSize && !imageSizes.has(day.imageSize)) errors.push(`${label}图片大小无效`);
    if ((day.images?.length ?? 0) > 2) errors.push(`${label}最多只能上传两张图片`);
    if (isPublished && day.mediaLayout === "two-images" && day.images?.length !== 2) {
      errors.push(`${label}选择“两张图片并排”时必须上传两张图片`);
    }
    day.images?.forEach((image, imageIndex) => {
      if (isPublished) {
        requiredText(image.src, `${label}第${imageIndex + 1}张图片`, errors);
        requiredText(image.alt, `${label}第${imageIndex + 1}张图片说明`, errors);
      }
      if (image.displayRatio && !displayRatios.has(image.displayRatio)) errors.push(`${label}图片比例无效`);
      if (image.focalPoint && !focalPoints.has(image.focalPoint)) errors.push(`${label}画面重点无效`);
    });
  });

  if (isPublished && days.length === 0) {
    errors.push(`${filename}：已发布路线必须至少包含一天行程`);
  }
  return errors;
}

export function assertValidJourneyCollection(contents: Array<{ filename: string; content: JourneyContent }>) {
  const errors = contents.flatMap(({ filename, content }) => validateJourneyContent(content, filename));
  const slugs = new Map<string, string>();
  for (const { filename, content } of contents) {
    const previous = slugs.get(content.basic.slug);
    if (previous) errors.push(`${filename}：slug“${content.basic.slug}”已被${previous}使用`);
    else slugs.set(content.basic.slug, filename);
  }
  if (errors.length > 0) throw new Error(`Journey内容校验失败：\n- ${errors.join("\n- ")}`);
}
