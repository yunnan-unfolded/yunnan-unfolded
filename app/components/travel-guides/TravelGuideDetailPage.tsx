import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { TravelGuideDetail } from "../../lib/travelGuideContent";
import { assetPath, routePath } from "../../lib/sitePaths";
import type { TravelGuideImage } from "../../types/travelGuide";
import { Footer } from "../Footer";
import { Header } from "../Header";
import styles from "./travel-guide-detail.module.css";

function sectionId(heading: string | undefined, index: number) {
  const slug = (heading ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `section-${index + 1}`;
}

function internalMarkdownHref(href: string) {
  if (href.startsWith("#")) return href;
  const suffixIndex = href.search(/[?#]/);
  const pathname = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);
  return `${routePath(pathname)}${suffix}`;
}

function renderInlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*\n]+)\*\*|\[([^\]\n]+)\]\((https:\/\/[^\s)]+|\/(?!\/)[^\s)]*|#[^\s)]*)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
    const key = `${keyPrefix}-${match.index}`;
    if (match[2]) {
      nodes.push(<strong key={key}>{match[2]}</strong>);
    } else {
      const label = match[3];
      const href = match[4];
      if (href.startsWith("https://")) {
        nodes.push(
          <a className={styles.inlineLink} href={href} key={key} rel="noreferrer" target="_blank">
            {label}
          </a>,
        );
      } else if (href.startsWith("#")) {
        nodes.push(<a className={styles.inlineLink} href={href} key={key}>{label}</a>);
      } else {
        nodes.push(<Link className={styles.inlineLink} href={internalMarkdownHref(href)} key={key}>{label}</Link>);
      }
    }
    cursor = pattern.lastIndex;
  }

  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function renderBodyBlock(block: string, key: string): ReactNode {
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  if (lines[0].startsWith("### ")) {
    return <h3 className={styles.question} key={key}>{lines[0].slice(4)}</h3>;
  }

  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul className={styles.checklist} key={key}>
        {lines.map((line, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(line.slice(2), `${key}-${index}`)}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return (
      <ol className={styles.numberedList} key={key}>
        {lines.map((line, index) => (
          <li key={`${key}-${index}`}>{renderInlineMarkdown(line.replace(/^\d+\.\s/, ""), `${key}-${index}`)}</li>
        ))}
      </ol>
    );
  }

  const sourceUrl = lines.length === 2 && /^https:\/\//.test(lines[1]) ? lines[1] : undefined;
  if (sourceUrl) {
    return (
      <a className={styles.sourceLink} href={sourceUrl} key={key} rel="noreferrer" target="_blank">
        <span>{lines[0]}</span>
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return <p key={key}>{renderInlineMarkdown(lines.join(" "), key)}</p>;
}

const imageWidthClasses = {
  standard: styles.imageStandard,
  large: styles.imageLarge,
  "full-bleed": styles.imageFull,
  half: styles.imageHalf,
} as const;

const imageRatioClasses = {
  "landscape-16-9": styles.ratioWide,
  "landscape-4-3": styles.ratioLandscape,
  "portrait-3-4": styles.ratioPortrait,
  "portrait-9-16": styles.ratioTall,
} as const;

const imageAlignmentClasses = {
  center: styles.imageCenter,
  left: styles.imageLeft,
  right: styles.imageRight,
} as const;

const focalPoints = {
  center: "50% 50%",
  top: "50% 20%",
  bottom: "50% 80%",
  left: "20% 50%",
  right: "80% 50%",
} as const;

function GuideImageFigure({ image }: { image: TravelGuideImage }) {
  if (!image.src) return null;
  const width = image.width ?? 1536;
  const height = image.height ?? 1024;
  const ratio = image.displayRatio ?? "original";
  const classes = [
    styles.sectionImage,
    imageWidthClasses[image.displayWidth ?? "standard"],
    imageAlignmentClasses[image.alignment ?? "center"],
  ].join(" ");
  const style = { "--guide-image-position": focalPoints[image.focalPoint ?? "center"] } as CSSProperties;

  return (
    <figure className={classes} style={style}>
      {ratio === "original" ? (
        <Image
          alt={image.alt ?? ""}
          className={styles.originalSectionImage}
          height={height}
          loading="lazy"
          sizes="(max-width: 700px) 92vw, 760px"
          src={assetPath(image.src)}
          width={width}
        />
      ) : (
        <div className={`${styles.imageFrame} ${imageRatioClasses[ratio]}`}>
          <Image
            alt={image.alt ?? ""}
            fill
            loading="lazy"
            sizes="(max-width: 700px) 92vw, 760px"
            src={assetPath(image.src)}
          />
        </div>
      )}
    </figure>
  );
}

export function TravelGuideDetailPage({
  guide,
  isLocalDraft,
}: {
  guide: TravelGuideDetail;
  isLocalDraft: boolean;
}) {
  const enquiryHref = `${routePath("/plan-my-trip")}?source=travel-guide&guide=${encodeURIComponent(guide.slug)}`;

  return (
    <div className={styles.page}>
      <Header />
      <main>
        <article>
          <header className={`${styles.hero} ${guide.hero ? styles.heroWithImage : styles.heroWithoutImage}`}>
            <div className={`${styles.heroInner} shell`}>
              <div className={styles.heroCopy}>
                {isLocalDraft ? <p className={styles.draftLabel}>Local Draft</p> : null}
                <p className={styles.eyebrow}>{guide.category}{guide.region ? ` · ${guide.region}` : ""}</p>
                <h1>{guide.title}</h1>
                <p className={styles.summary}>{guide.summary}</p>
                <Link className={styles.backLink} href={routePath("/travel-guides")}>← Back to Travel Guides</Link>
              </div>
              {guide.hero ? (
                <figure className={styles.heroMedia}>
                  <Image
                    alt={guide.hero.alt ?? ""}
                    height={guide.hero.height ?? 1000}
                    priority
                    sizes="(max-width: 760px) 100vw, 55vw"
                    src={assetPath(guide.hero.src ?? "")}
                    width={guide.hero.width ?? 1400}
                  />
                </figure>
              ) : (
                <div className={styles.heroEditorial} aria-hidden="true">
                  <span>Practical Yunnan notes</span>
                  <strong>Prepared for the road ahead.</strong>
                </div>
              )}
            </div>
          </header>

          <div className={`${styles.articleGrid} shell`}>
            <aside className={styles.contents} aria-label="Guide contents">
              <p>In this guide</p>
              <ol>
                {guide.sections.map((section, index) => (
                  <li key={`${section.heading}-${index}`}>
                    <a href={`#${sectionId(section.heading, index)}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </aside>

            <div className={styles.articleBody}>
              <section className={styles.introduction} aria-label="Introduction">
                {guide.introduction.map((paragraph, index) => index === guide.introduction.length - 1 && paragraph.startsWith("Last checked:") ? (
                  <aside className={styles.updateNote} key={paragraph}>{paragraph}</aside>
                ) : <p key={paragraph}>{paragraph}</p>)}
              </section>

              {guide.sections.map((section, sectionIndex) => (
                <section
                  className={`${styles.contentSection} ${section.heading?.toLowerCase() === "frequently asked questions" ? styles.faqSection : ""} ${section.heading?.toLowerCase() === "official references" ? styles.referencesSection : ""}`}
                  id={sectionId(section.heading, sectionIndex)}
                  key={`${section.heading}-${sectionIndex}`}
                >
                  <div className={styles.sectionHeading}>
                    <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                    <h2>{section.heading}</h2>
                  </div>
                  <div className={styles.sectionCopy}>
                    {section.body.map((block, blockIndex) => renderBodyBlock(block, `${sectionIndex}-${blockIndex}`))}
                  </div>
                  {section.images.length > 0 ? (
                    <div className={styles.sectionMedia}>
                      {section.images.map((image, imageIndex) => (
                        <GuideImageFigure image={image} key={`${image.src}-${imageIndex}`} />
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </article>

        <section className={styles.cta} aria-labelledby="travel-guide-cta-title">
          <div className={`${styles.ctaInner} shell`}>
            <p className={styles.ctaEyebrow}>Travel with confidence</p>
            <h2 id="travel-guide-cta-title">Plan the Yunnan journey that fits you.</h2>
            <p>Tell us how you like to travel, how much time you have and what you want to experience. We will help shape a route with the right pace and practical support.</p>
            <Link className="button button--gold" href={enquiryHref}>Plan my Yunnan trip</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
