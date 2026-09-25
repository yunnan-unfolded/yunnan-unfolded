import type { TinaField } from 'tinacms';
import { GUIDE_ALIGNMENTS, GUIDE_FOCAL_POINTS, GUIDE_RATIOS, GUIDE_WIDTHS } from './travelGuideRichText.ts';

export const travelGuideBodyField: TinaField = {
  type: 'rich-text', name: 'body', label: '4. 正文',
  description: '连续书写；用 Embed → 正文图片在光标处插图。正文下方的图片上移 / 下移可调整顺序；图片菜单 Remove 可删除。图片说明可在草稿阶段留空。',
  parser: { type: 'mdx' },
  overrides: { toolbar: ['heading', 'bold', 'italic', 'link', 'ul', 'ol', 'quote', 'hr', 'embed'], headingLevels: ['h2', 'h3'] },
  templates: [{
    name: 'GuideImage', label: '正文图片',
    defaultItem: {
      src: '',
      alt: '',
      caption: '',
      advanced: {
        displayWidth: 'wide',
        alignment: 'center',
        displayRatio: 'original',
        focalPoint: 'center',
      },
    },
    fields: [
      { type: 'image', name: 'src', label: '图片' },
      {
        type: 'string',
        name: 'alt',
        label: '图片描述（发布前填写）',
        description: '用一句简短英文描述图片内容，用于无障碍访问和图片搜索。保存草稿时可以留空。',
      },
      { type: 'string', name: 'caption', label: '图片说明（可选）' },
      {
        type: 'object',
        name: 'advanced',
        label: '高级图片设置（通常无需修改）',
        fields: [
          { type: 'string', name: 'displayWidth', label: '显示宽度', options: [{ label: '通栏图', value: 'full' }, { label: '大图', value: 'wide' }, { label: '标准图', value: 'medium' }] },
          { type: 'string', name: 'alignment', label: '对齐', options: [{ label: '靠左', value: 'left' }, { label: '居中', value: 'center' }, { label: '靠右', value: 'right' }] },
          { type: 'string', name: 'displayRatio', label: '显示比例', options: [{ label: '保持原图比例', value: 'original' }, { label: '横图 3:2', value: '3:2' }, { label: '横图 4:3', value: '4:3' }, { label: '竖图 3:4', value: '3:4' }] },
          { type: 'string', name: 'focalPoint', label: '焦点位置', options: [{ label: '中间', value: 'center' }, { label: '上方', value: 'top' }, { label: '下方', value: 'bottom' }, { label: '左侧', value: 'left' }, { label: '右侧', value: 'right' }] },
          { type: 'string', name: 'source', label: '图片来源（可选）' },
          { type: 'string', name: 'photographer', label: '摄影师（可选）' },
          { type: 'string', name: 'license', label: '许可证（可选）' },
          { type: 'string', name: 'sourceUrl', label: '来源链接（HTTPS，可选）' },
        ],
      },
      // Read-only compatibility for the six migrated guides. New images use
      // the grouped advanced object above; existing top-level props stay intact.
      { type: 'string', name: 'displayWidth', ui: { component: 'hidden' }, options: [...GUIDE_WIDTHS] },
      { type: 'string', name: 'alignment', ui: { component: 'hidden' }, options: [...GUIDE_ALIGNMENTS] },
      { type: 'string', name: 'displayRatio', ui: { component: 'hidden' }, options: [...GUIDE_RATIOS] },
      { type: 'string', name: 'focalPoint', ui: { component: 'hidden' }, options: [...GUIDE_FOCAL_POINTS] },
      { type: 'string', name: 'source', ui: { component: 'hidden' } },
      { type: 'string', name: 'photographer', ui: { component: 'hidden' } },
      { type: 'string', name: 'license', ui: { component: 'hidden' } },
      { type: 'string', name: 'sourceUrl', ui: { component: 'hidden' } },
      { type: 'number', name: 'width', ui: { component: 'hidden' } },
      { type: 'number', name: 'height', ui: { component: 'hidden' } },
    ],
  } as NonNullable<Extract<TinaField, { type: 'rich-text' }>['templates']>[number] & { defaultItem: Record<string, unknown> }, { name: 'Divider', label: '分隔线', fields: [{ type: 'string', name: 'label', label: '备注（不显示）' }] }],
};
