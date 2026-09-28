import { readFileSync, writeFileSync } from 'node:fs';
import { parseMDX } from '@tinacms/mdx';
import { legacyGuideMarkdown, walkGuideNodes } from '../shared/travelGuideRichText.ts';
import { travelGuideBodyField } from '../shared/travelGuideRichTextSchema.ts';

export const approvedSlugs = ['how-to-pay-in-yunnan', 'china-visa-entry-guide-yunnan', 'essential-apps-for-traveling-in-yunnan', 'how-to-get-around-yunnan', 'best-time-to-visit-yunnan', 'internet-sim-cards-yunnan'];
const write = process.argv.includes('--write');
// Validate every proposed migration before writing any file. Only the fixed
// allowlist is considered; legacy user drafts are never migrated implicitly.
const changes = approvedSlugs.map((slug) => {
  const path = `content/travel-guides/${slug}.json`;
  const old = JSON.parse(readFileSync(path, 'utf8'));
  if (old.basic.slug !== slug) throw new Error(`Slug mismatch: ${path}`);
  if (old.body !== undefined) return { path, skipped: true };
  const body = legacyGuideMarkdown(old.content);
  const parsed = parseMDX(body, travelGuideBodyField, (url) => url);
  const images = [];
  walkGuideNodes(parsed, (node) => {
    if (node.type === 'invalid_markdown') throw new Error(`Invalid MDX: ${path}`);
    if (node.name === 'GuideImage') images.push(node.props.src);
  });
  const expected = (old.content?.sections ?? []).flatMap((section) => (section.images ?? []).map((image) => image.src));
  if (JSON.stringify(images) !== JSON.stringify(expected)) throw new Error(`Image preservation failed: ${path}`);
  const metadata = { ...old };
  delete metadata.content;
  return { path, next: { ...metadata, body }, images: images.length };
});
for (const change of changes) {
  if (write && !change.skipped) writeFileSync(change.path, `${JSON.stringify(change.next, null, 2)}\n`);
  console.log(`${change.skipped ? 'already migrated' : write ? 'migrated' : 'ready'} ${change.path}; images=${change.images ?? '-'}`);
}
