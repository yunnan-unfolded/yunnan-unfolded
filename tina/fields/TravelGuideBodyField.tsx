import { useState, type ComponentProps } from 'react';
import { MdxFieldPluginExtendible } from 'tinacms';
import { guideNodeText, type GuideBody } from '../../shared/travelGuideRichText';

type Props = ComponentProps<typeof MdxFieldPluginExtendible.Component>;
const NativeEditor = MdxFieldPluginExtendible.Component;

// Keep Tina's native rich-text editor. Reordering uses the public field value /
// onChange contract, never Slate internals, DOM manipulation, or a second body.
export function TravelGuideBodyField(props: Props) {
  const [revision, setRevision] = useState(0);
  const body = props.input.value as GuideBody | undefined;
  const nodes = body?.children ?? [];
  const legacy = props.form.getState().values.content as { introduction?: string; sections?: unknown[] } | undefined;
  if (legacy?.introduction?.trim() || legacy?.sections?.length) {
    return <p>4. 正文：这篇旧攻略尚未迁移，原文仍保留并正常展示。请单独确认迁移后再使用富文本编辑。</p>;
  }
  function move(index: number, direction: -1 | 1) {
    if (!body || index + direction < 0 || index + direction >= nodes.length) return;
    const children = [...nodes];
    [children[index], children[index + direction]] = [children[index + direction], children[index]];
    props.input.onChange({ ...body, children });
    // The native editor initializes its Slate state only on mount.
    setRevision((current) => current + 1);
  }
  return <>
    <NativeEditor {...props} key={revision} />
    {nodes.some((node) => node.name === 'GuideImage') ? <section aria-label="正文图片排序" style={{ marginTop: 12, padding: 12, border: '1px solid #d1d5db', borderRadius: 6 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>图片排序：每次移动一个正文块，图片设置会一起保留。</p>
      {nodes.map((node, index) => node.name === 'GuideImage' ? <div key={index} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13 }}>
        <span>第 {index + 1} 块 · {String(node.props?.caption || node.props?.alt || '正文图片')}（前：{index ? guideNodeText(nodes[index - 1]).slice(0, 24) || '图片 / 分隔线' : '正文开头'}）</span>
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>图片上移</button>
        <button type="button" disabled={index === nodes.length - 1} onClick={() => move(index, 1)}>图片下移</button>
      </div> : null)}
    </section> : null}
  </>;
}
