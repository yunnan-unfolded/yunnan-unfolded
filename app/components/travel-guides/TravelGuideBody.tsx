import type { CSSProperties, ReactNode } from 'react';
import { guideImageSetting, guideNodeText, safeGuideSourceUrl, safeGuideUrl, type GuideNode, type GuideBody } from '../../../shared/travelGuideRichText';
import { assetPath, routePath } from '../../lib/sitePaths';
import styles from './travel-guide-body.module.css';

export function guideHeadingId(node: GuideNode, index: number) {
  return `${guideNodeText(node).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'}-${index}`;
}
function hrefFor(value: unknown) {
  const href = safeGuideUrl(value);
  if (!href || !href.startsWith('/')) return href;
  const split = href.search(/[?#]/);
  return split < 0 ? routePath(href) : `${routePath(href.slice(0, split))}${href.slice(split)}`;
}
const focal: Record<string, string> = { center: '50% 50%', left: '0% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' };
const ratios: Record<string, string> = { '3:2': '3 / 2', '4:3': '4 / 3', '3:4': '3 / 4' };
export function GuideImageFigure({ image }: { image: Record<string, unknown> }) {
  const src = safeGuideUrl(image.src);
  if (!src || src.startsWith('#')) return null;
  const widthSetting = guideImageSetting(image, 'displayWidth', 'wide');
  const width = ['full', 'wide', 'medium'].includes(widthSetting) ? widthSetting : 'wide';
  const alignmentSetting = guideImageSetting(image, 'alignment', 'center');
  const align = ['left', 'center', 'right'].includes(alignmentSetting) ? alignmentSetting : 'center';
  const ratio = ratios[guideImageSetting(image, 'displayRatio', 'original')];
  const credit = ['source', 'photographer', 'license'].map((key) => guideImageSetting(image, key)).filter(Boolean).join(' · ');
  const sourceUrl = safeGuideSourceUrl(guideImageSetting(image, 'sourceUrl'));
  return <figure className={styles.figure} data-width={width} data-align={align} style={{ '--image-ratio': ratio, '--image-focus': focal[guideImageSetting(image, 'focalPoint', 'center')] ?? focal.center } as CSSProperties}>
    {/* Natural dimensions are kept for original; cropped presets use object-fit. Local media needs no download or transform. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src.startsWith('/') ? assetPath(src) : src} alt={typeof image.alt === 'string' ? image.alt : ''}
      loading="lazy" decoding="async" className={ratio ? styles.cropped : styles.original}
      width={typeof image.width === 'number' ? image.width : undefined} height={typeof image.height === 'number' ? image.height : undefined} />
    {image.caption || credit || sourceUrl ? <figcaption>
      {typeof image.caption === 'string' ? <span>{image.caption}</span> : null}
      {credit ? <small>{credit}</small> : null}
      {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">Image source</a> : null}
    </figcaption> : null}
  </figure>;
}
function renderNode(node: GuideNode, index: number): ReactNode {
  if (typeof node.text === 'string') {
    let text: ReactNode = node.text;
    if (node.bold) text = <strong>{text}</strong>;
    if (node.italic) text = <em>{text}</em>;
    return <span key={index}>{text}</span>;
  }
  const children = node.children?.map(renderNode);
  switch (node.type) {
    case 'p': return <p key={index}>{children}</p>;
    case 'h2': return <h2 id={guideHeadingId(node, index)} key={index}>{children}</h2>;
    case 'h3': return <h3 key={index}>{children}</h3>;
    case 'ul': return <ul key={index}>{children}</ul>;
    case 'ol': return <ol key={index}>{children}</ol>;
    case 'li': return <li key={index}>{children}</li>;
    case 'lic': return <span key={index}>{children}</span>;
    case 'blockquote': return <blockquote key={index}>{children}</blockquote>;
    case 'hr': return <hr key={index} />;
    case 'break': return <br key={index} />;
    case 'a': {
      const href = hrefFor(node.url);
      return href ? <a key={index} href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer">{children}</a> : <span key={index}>{children}</span>;
    }
    case 'mdxJsxFlowElement':
      if (node.name === 'GuideImage') return <GuideImageFigure key={index} image={node.props ?? {}} />;
      if (node.name === 'Divider') return <hr key={index} />;
      return null;
    default: return null; // Never execute raw HTML, JavaScript, or arbitrary components.
  }
}
export function TravelGuideBody({ body }: { body: GuideBody }) {
  return <div className={styles.body}>{body.children.map(renderNode)}</div>;
}
