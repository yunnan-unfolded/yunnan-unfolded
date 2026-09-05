import type { JourneyContent } from "../types/journey";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const mediaLayouts = new Set(["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"]);
const imageSizes = new Set(["compact", "standard", "wide"]);
const displayRatios = new Set([
  "original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16",
  "landscape", "portrait", "square",
]);
const focalPoints = new Set(["top", "center", "bottom", "left", "right"]);

function requiredText(value: unknown, label: string, errors: string[]) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${label}不能为空`);
}

export function validateJourneyContent(content: JourneyContent, filename = "Journey") {
  const errors: string[] = [];
  const title = content.title?.trim() || content.basic?.collection?.trim() || content.basic?.title?.trim();
  const summary = content.summary?.trim() || content.basic?.listingDescription?.trim();
  requiredText(content.basic?.slug, `${filename}：页面网址`, errors);
  const isPublished = content.publication?.status === "published";
  if (isPublished) {
    requiredText(title, `${filename}：路线名称`, errors);
    requiredText(summary, `${filename}：路线简介`, errors);
    requiredText(content.hero?.src, `${filename}：首图`, errors);
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
      if (!day.logistics) {
        requiredText(day.route, `${label}路线`, errors);
        requiredText(day.overnight, `${label}住宿地点`, errors);
      }
    }
    if (day.mediaLayout && !mediaLayouts.has(day.mediaLayout)) errors.push(`${label}图文版式无效`);
    if (day.imageSize && !imageSizes.has(day.imageSize)) errors.push(`${label}图片大小无效`);
    day.images?.forEach((image, imageIndex) => {
      if (isPublished) {
        requiredText(image.src, `${label}第${imageIndex + 1}张图片`, errors);
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
