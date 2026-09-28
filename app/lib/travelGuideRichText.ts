import { parseMDX } from '@tinacms/mdx';
import { legacyGuideMarkdown, type GuideBody } from '../../shared/travelGuideRichText.ts';
import { travelGuideBodyField } from '../../shared/travelGuideRichTextSchema.ts';
import type { TravelGuideContent } from '../types/travelGuide.ts';

export function readGuideBody(content: TravelGuideContent): GuideBody {
  if (content.body && typeof content.body === 'object') return content.body;
  const markdown = typeof content.body === 'string' ? content.body : legacyGuideMarkdown(content.content);
  return parseMDX(markdown, travelGuideBodyField as Parameters<typeof parseMDX>[1], (url) => url) as GuideBody;
}
