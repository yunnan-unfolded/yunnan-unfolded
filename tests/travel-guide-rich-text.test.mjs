import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { travelGuideBodyField as field } from '../shared/travelGuideRichTextSchema.ts';
import { guideBodyProblems, guideImageSetting, safeGuideSourceUrl, safeGuideUrl, legacyGuideMarkdown, guideNodeText } from '../shared/travelGuideRichText.ts';
import { readGuideBody } from '../app/lib/travelGuideRichText.ts';
import { prepareTravelGuideForSave } from '../tina/travelGuideSave.ts';

const parse = (text) => parseMDX(text, field, (url) => url);
const markdown = 'First paragraph.\n\n<GuideImage src="/images/example.webp" alt="A mountain" caption="Caption" displayWidth="medium" alignment="right" displayRatio="3:4" focalPoint="top" source="Archive" photographer="Photographer" license="CC BY" sourceUrl="https://example.com/photo" />\n\nSecond paragraph.\n\n## Heading\n\n### Subheading\n\n1. Ordered\n\n- Unordered\n\n> Quote\n\n**Bold** and *italic* [internal](/travel-guides/) [external](https://example.com/)\n\n---';
test('official Tina MDX roundtrip preserves order, marks, links, lists and image settings', () => {
  const first = parse(markdown);
  const saved = parse(serializeMDX(first, field, (url) => url));
  assert.deepEqual(saved, first);
  assert.deepEqual(saved.children.slice(0, 4).map((node) => node.type), ['p', 'mdxJsxFlowElement', 'p', 'h2']);
  assert.equal(saved.children[1].props.displayRatio, '3:4');
  assert.deepEqual(guideBodyProblems(saved, true), []);
  const moved = structuredClone(first);
  const [image] = moved.children.splice(1, 1);
  moved.children.splice(3, 0, image);
  assert.deepEqual(parse(serializeMDX(moved, field, (url) => url)), moved);
  moved.children.splice(3, 1);
  assert.equal(parse(serializeMDX(moved, field, (url) => url)).children.some((node) => node.name === 'GuideImage'), false);
});
test('new image embeds keep the simple fields visible and receive safe advanced defaults', () => {
  const imageTemplate = field.templates.find((template) => template.name === 'GuideImage');
  assert.ok(imageTemplate);
  assert.deepEqual(imageTemplate.defaultItem.advanced, {
    displayWidth: 'wide', alignment: 'center', displayRatio: 'original', focalPoint: 'center',
  });
  const visibleFields = imageTemplate.fields.filter((entry) => entry.ui?.component !== 'hidden').map((entry) => entry.name);
  assert.deepEqual(visibleFields, ['src', 'alt', 'caption', 'advanced']);
  assert.equal(imageTemplate.fields.find((entry) => entry.name === 'alt').label, '图片描述（发布前填写）');
  const advanced = imageTemplate.fields.find((entry) => entry.name === 'advanced');
  assert.equal(advanced.label, '高级图片设置（通常无需修改）');
  assert.equal(advanced.fields.find((entry) => entry.name === 'alignment').label, '对齐');
});
test('nested advanced image settings roundtrip while legacy top-level settings remain compatible', () => {
  const nested = parse('<GuideImage src="/images/example.webp" advanced={{displayWidth: "full", alignment: "right", displayRatio: "3:4", focalPoint: "top"}} />');
  const saved = parse(serializeMDX(nested, field, (url) => url));
  assert.deepEqual(saved, nested);
  const props = saved.children[0].props;
  assert.equal(guideImageSetting(props, 'displayWidth', 'wide'), 'full');
  assert.equal(guideImageSetting(props, 'alignment', 'center'), 'right');
  assert.equal(guideImageSetting({ displayWidth: 'medium' }, 'displayWidth', 'wide'), 'medium');
  assert.equal(guideImageSetting({}, 'displayWidth', 'wide'), 'wide');
});
test('draft image metadata can be incomplete; publishing requires image and alt', async () => {
  const body = parse('Text.\n\n<GuideImage src="/images/example.webp" />');
  const values = { title: 'Draft', basic: { slug: 'draft', category: 'Advice', summary: 'Summary' }, hero: { src: '/hero.webp', alt: 'Hero' }, body, publication: { status: 'draft' } };
  const result = await prepareTravelGuideForSave({ values, cms: {}, form: { crudType: 'create' } });
  assert.deepEqual(result.body, body);
  assert.deepEqual(result.content, {}); // Tina's object serializer requires an object, not undefined.
  await assert.rejects(prepareTravelGuideForSave({ values: { ...values, publication: { status: 'published' } }, cms: {}, form: { crudType: 'create' } }), /英文 alt/);
  assert.deepEqual(
    guideBodyProblems(parse('Text.\n\n<GuideImage src="/images/licensed.webp" alt="A licensed travel photograph" />'), true),
    [],
    'source, photographer and licence remain optional when publishing',
  );
});
test('unconverted user content cannot be silently overwritten by an empty new body', async () => {
  await assert.rejects(prepareTravelGuideForSave({ values: { title: 'User draft', basic: { slug: 'user-draft' }, publication: { status: 'draft' }, content: { introduction: 'Keep this text' }, body: parse('') }, cms: {}, form: {} }), /旧正文尚未迁移/);
});
test('unsupported pasted content and anchor-only images are rejected instead of silently dropped', () => {
  assert.ok(guideBodyProblems(parse('![Image](/image.webp)'), false).length);
  assert.ok(guideBodyProblems(parse('<GuideImage src="#anchor" />'), false).length);
  assert.ok(guideBodyProblems({ type: 'root', children: [{ type: 'html', children: [] }] }, false).length);
});
test('unsafe URLs are rejected; safe internal and HTTPS links survive', () => {
  for (const url of ['javascript:alert(1)', 'http://example.com', '//evil.test', '/\\evil.test', 'https://user:pass@example.com', 'data:text/html,a']) assert.equal(safeGuideUrl(url), undefined);
  for (const url of ['/travel-guides/', '#heading', 'https://example.com/a']) assert.equal(safeGuideUrl(url), url);
  assert.ok(guideBodyProblems(parse('[bad](http://example.com)'), false).length);
  assert.equal(safeGuideSourceUrl('/travel-guides/'), undefined);
  assert.equal(safeGuideSourceUrl('http://example.com/photo'), undefined);
  assert.equal(safeGuideSourceUrl('https://example.com/photo'), 'https://example.com/photo');
  assert.ok(guideBodyProblems(parse('<GuideImage src="/image.webp" advanced={{sourceUrl: "http://example.com/photo"}} />'), false).length);
});
test('new body always wins over legacy content, including intentionally empty body', () => {
  const legacy = { introduction: 'Legacy intro', sections: [{ heading: 'Legacy heading', body: 'Legacy text', images: [] }] };
  assert.match(legacyGuideMarkdown(legacy), /Legacy intro/);
  assert.equal(guideNodeText(readGuideBody({ body: '', content: legacy })), '');
  assert.equal(guideNodeText(readGuideBody({ body: 'New text', content: legacy })), 'New text');
});
test('six approved guides use only new body; payment images and FAQs remain', () => {
  const slugs = ['how-to-pay-in-yunnan', 'china-visa-entry-guide-yunnan', 'essential-apps-for-traveling-in-yunnan', 'how-to-get-around-yunnan', 'best-time-to-visit-yunnan', 'internet-sim-cards-yunnan'];
  for (const slug of slugs) {
    const document = JSON.parse(readFileSync(`content/travel-guides/${slug}.json`, 'utf8'));
    assert.ok(document.content === undefined || (document.content && Object.keys(document.content).length === 0));
    assert.equal(document.publication.status, 'published');
    const body = readGuideBody(document);
    assert.equal(body.children.some((node) => node.type === 'invalid_markdown'), false);
    assert.ok(guideNodeText(body).includes('Frequently asked questions'));
    if (slug === 'how-to-pay-in-yunnan') {
      const images = body.children.filter((node) => node.name === 'GuideImage').map((node) => node.props?.src);
      assert.ok(images.includes('/images/travel-guides/how-to-pay-in-yunnan/qr-payment-shop.webp'));
      assert.ok(images.includes('/images/travel-guides/how-to-pay-in-yunnan/travel-payment-backup.webp'));
    }
  }
});

test('six release candidates keep accurate image descriptions and exclude the two restricted references', () => {
  const slugs = ['how-to-pay-in-yunnan', 'china-visa-entry-guide-yunnan', 'essential-apps-for-traveling-in-yunnan', 'how-to-get-around-yunnan', 'best-time-to-visit-yunnan', 'internet-sim-cards-yunnan'];
  const documents = slugs.map((slug) => JSON.parse(readFileSync(`content/travel-guides/${slug}.json`, 'utf8')));

  for (const document of documents) {
    assert.equal(document.publication.status, 'published');
    if (document.hero?.src) assert.ok(document.hero.alt?.trim(), `${document.basic.slug} Hero needs English alt text`);
    const images = readGuideBody(document).children.filter((node) => node.name === 'GuideImage');
    for (const image of images) assert.ok(image.props?.alt?.trim(), `${document.basic.slug} body image needs English alt text`);
  }

  const allContent = JSON.stringify(documents);
  assert.equal(allContent.includes('/images/journeys/攻略/高铁.jpg'), false);
  assert.equal(allContent.includes('/images/journeys/香格里拉/當代中國-潮遊生活-旅遊風物-普達措國家公園０７_x1.jpg'), false);

  const transport = documents.find((document) => document.basic.slug === 'how-to-get-around-yunnan');
  const trainImage = readGuideBody(transport).children.find((node) => node.props?.src === '/images/travel-guides/how-to-get-around-yunnan/yunnan-modern-passenger-train.webp');
  assert.equal(trainImage.props?.alt, 'A modern passenger train at a mountain railway station in Yunnan');
  assert.equal(trainImage.props?.advanced?.source, 'AI-generated for Yunnan Unfolded');

  const seasons = documents.find((document) => document.basic.slug === 'best-time-to-visit-yunnan');
  const craneImage = readGuideBody(seasons).children.find((node) => node.props?.src === '/images/travel-guides/best-time-to-visit-yunnan/shangri-la-black-necked-cranes.webp');
  assert.equal(craneImage.props?.alt, 'Black-necked cranes crossing an autumn wetland in northwest Yunnan');
  assert.equal(craneImage.props?.advanced?.source, 'AI-generated for Yunnan Unfolded');

  const payment = documents.find((document) => document.basic.slug === 'how-to-pay-in-yunnan');
  assert.match(payment.body, /carry a little RMB cash/);
  assert.doesNotMatch(payment.body, /ca\s*\n\s*rry/);

  assert.match(seasons.body, /autumn colour vary from year to year/);
  assert.doesNotMatch(seasons.body, /va\s*\n\s*ry/);

  const visa = documents.find((document) => document.basic.slug === 'china-visa-entry-guide-yunnan');
  const airportImage = readGuideBody(visa).children.find((node) => node.name === 'GuideImage');
  assert.equal(airportImage.props?.photographer, 'N509FZ');
  assert.equal(airportImage.props?.source, 'Wikimedia Commons');
  assert.equal(airportImage.props?.license, 'CC BY-SA 4.0');
  assert.match(airportImage.props?.sourceUrl ?? '', /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
});
