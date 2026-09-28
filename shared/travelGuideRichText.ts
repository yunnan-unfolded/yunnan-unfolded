export type GuideNode = {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  url?: string;
  name?: string;
  props?: Record<string, unknown>;
  children?: GuideNode[];
};
export type GuideBody = { type: 'root'; children: GuideNode[] };
export const GUIDE_WIDTHS = ['full', 'wide', 'medium'] as const;
export const GUIDE_RATIOS = ['original', '3:2', '4:3', '3:4'] as const;
export const GUIDE_ALIGNMENTS = ['left', 'center', 'right'] as const;
export const GUIDE_FOCAL_POINTS = ['center', 'top', 'bottom', 'left', 'right'] as const;

function cleanObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function guideImageSetting(props: Record<string, unknown>, key: string, fallback = '') {
  const advanced = cleanObject(props.advanced);
  const value = advanced[key] ?? props[key];
  return typeof value === 'string' && value ? value : fallback;
}

export function safeGuideUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || (/[\s\\]/u.test(value) || [...value].some((char) => char.charCodeAt(0) < 32))) return undefined;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? value : undefined;
  } catch { return undefined; }
}
export function safeGuideSourceUrl(value: unknown): string | undefined {
  const url = safeGuideUrl(value);
  return url?.startsWith('https://') ? url : undefined;
}
export function guideNodeText(node: GuideNode): string {
  return node.text ?? (node.children ?? []).map(guideNodeText).join('');
}
export function walkGuideNodes(node: GuideNode, visit: (node: GuideNode, path: string) => void, path = 'body') {
  visit(node, path);
  node.children?.forEach((child, index) => walkGuideNodes(child, visit, `${path}.children[${index}]`));
}
export function guideBodyProblems(body: GuideBody, publishing: boolean) {
  const errors: string[] = [];
  walkGuideNodes(body, (node, path) => {
    const supported = ['root', 'text', 'p', 'h2', 'h3', 'ul', 'ol', 'li', 'lic', 'blockquote', 'hr', 'break', 'a', 'mdxJsxFlowElement'];
    if (typeof node.text !== 'string' && !supported.includes(node.type ?? '')) {
      errors.push(`${path}: 不支持的正文格式；图片请使用 Embed → 正文图片`);
    }
    if (node.type === 'a' && !safeGuideUrl(node.url)) errors.push(`${path}: 链接只允许站内地址或 HTTPS`);
    if (node.type !== 'mdxJsxFlowElement') return;
    if (node.name === 'Divider') return;
    if (node.name !== 'GuideImage') { errors.push(`${path}: 不支持的正文组件`); return; }
    const p = node.props ?? {};
    if (p.src && (!safeGuideUrl(p.src) || String(p.src).startsWith('#'))) errors.push(`${path}: 图片地址无效`);
    for (const [key, choices] of Object.entries({ displayWidth: GUIDE_WIDTHS, displayRatio: GUIDE_RATIOS, alignment: GUIDE_ALIGNMENTS, focalPoint: GUIDE_FOCAL_POINTS })) {
      const value = guideImageSetting(p, key);
      if (value && !(choices as readonly unknown[]).includes(value)) errors.push(`${path}.advanced.${key}: 图片设置无效`);
    }
    const sourceUrl = guideImageSetting(p, 'sourceUrl');
    const license = guideImageSetting(p, 'license');
    if (sourceUrl && !safeGuideSourceUrl(sourceUrl)) errors.push(`${path}.advanced.sourceUrl: 来源链接只允许 HTTPS`);
    if (publishing) {
      if (!p.src) errors.push(`${path}: 缺少图片`);
      if (typeof p.alt !== 'string' || !p.alt.trim()) errors.push(`${path}: 缺少英文 alt`);
      if (license && !sourceUrl) errors.push(`${path}: 填写许可证时请提供来源链接`);
    }
  });
  if (publishing && !guideNodeText(body).trim()) errors.push('正文至少需要一段文字');
  return errors;
}

type LegacyContent = { introduction?: string; sections?: { heading?: string; body?: string; images?: Record<string, unknown>[] }[] };
// Read-only adapter for unconverted documents. No filename/location mapping.
export function legacyGuideMarkdown(content: LegacyContent = {}) {
  const blocks = [content.introduction ?? ''];
  for (const section of content.sections ?? []) {
    if (section.heading) blocks.push(`## ${section.heading}`);
    blocks.push(section.body ?? '');
    for (const image of section.images ?? []) {
      const props = { ...image,
        displayWidth: image.displayWidth === 'full-bleed' ? 'full' : image.displayWidth === 'large' ? 'wide' : 'medium',
        displayRatio: image.displayRatio === 'landscape-4-3' ? '4:3' : image.displayRatio === 'portrait-3-4' ? '3:4' : 'original',
      };
      blocks.push(`<GuideImage ${Object.entries(props).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}=${typeof value === 'number' ? `{${value}}` : JSON.stringify(String(value))}`).join(' ')} />`);
    }
  }
  return blocks.filter(Boolean).join('\n\n').replace(/(^|\n\n)([^\n]+)\n(https:\/\/\S+)(?=\n\n|$)/g, '$1[$2]($3)');
}
