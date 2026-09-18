import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import {
  buildTravelGuideDirectoryStructuredData,
  getTravelGuides,
  type TravelGuideCard,
} from "../lib/travelGuideContent";
import { absoluteAssetUrl, absolutePageUrl, assetPath } from "../lib/sitePaths";
import styles from "./travel-guides.module.css";

const localDraftPreviewEnabled = process.env.NODE_ENV === "development"
  && process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

const title = "Travel Guides | Practical Yunnan Travel Advice";
const description = "Practical Yunnan travel guides covering planning, transport, seasons and destinations, prepared with a locally rooted perspective.";
const directoryUrl = absolutePageUrl("/travel-guides");
const shareImage = absoluteAssetUrl("/images/hero/jiuzihai-panorama.jpg");

export const metadata: Metadata = {
  title: { absolute: `${title} | Yunnan Unfolded` },
  description,
  alternates: { canonical: directoryUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${title} | Yunnan Unfolded`,
    description,
    url: directoryUrl,
    siteName: "Yunnan Unfolded",
    type: "website",
    images: [{
      url: shareImage,
      width: 1922,
      height: 1080,
      alt: "Alpine lakes and a lone hiker at Jiuzihai in Yunnan",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Yunnan Unfolded`,
    description,
    images: [shareImage],
  },
};

const ratioValues = {
  "landscape-16-9": "16 / 9",
  "landscape-4-3": "4 / 3",
  "portrait-3-4": "3 / 4",
  "portrait-9-16": "9 / 16",
} as const;

const focalPointValues = {
  center: "50% 50%",
  top: "50% 20%",
  bottom: "50% 80%",
  left: "20% 50%",
  right: "80% 50%",
} as const;

function guideImageStyle(guide: TravelGuideCard) {
  const image = guide.hero;
  if (!image) return undefined;
  const naturalRatio = image.width && image.height ? `${image.width} / ${image.height}` : "4 / 3";
  const ratio = image.displayRatio && image.displayRatio !== "original"
    ? ratioValues[image.displayRatio]
    : naturalRatio;
  return {
    "--guide-card-ratio": ratio,
    "--guide-card-position": focalPointValues[image.focalPoint ?? "center"],
  } as CSSProperties;
}

export default function TravelGuidesPage() {
  const guides = getTravelGuides(localDraftPreviewEnabled);
  const publicGuides = getTravelGuides(false);
  const structuredData = buildTravelGuideDirectoryStructuredData(publicGuides, directoryUrl);

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <section className={styles.hero} aria-labelledby="travel-guides-title">
        <div className={`${styles.heroInner} shell`}>
          <div className={styles.heroHeading}>
            <p className={styles.eyebrow}>Travel Guides · Yunnan</p>
            <h1 id="travel-guides-title">Practical notes for travelling well.</h1>
          </div>
          <div className={styles.heroIntroduction}>
            <p>
              Clear, grounded guidance for planning a journey through Yunnan—from choosing the season and arranging transport to understanding what different places ask of your time.
            </p>
            <Link href="/plan-my-trip/">Ask us about your plans <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.editorialIndex} aria-label="Guide topics">
        <div className="shell">
          <div><span>01</span><strong>When to go</strong><p>Season, weather and the changing character of each region.</p></div>
          <div><span>02</span><strong>How to move</strong><p>Routes, road time and the practical rhythm of travelling through Yunnan.</p></div>
          <div><span>03</span><strong>What to expect</strong><p>Useful context for destinations, walks and locally shaped experiences.</p></div>
        </div>
      </section>

      <section className={styles.directory} aria-labelledby="guide-directory-title">
        <div className="shell">
          <div className={styles.directoryHeading}>
            <div>
              <p className={styles.eyebrow}>From our field notes</p>
              <h2 id="guide-directory-title">Plan with better context.</h2>
            </div>
            <p>Useful details should make a journey easier to understand—not turn it into a checklist. Each guide will focus on the decisions that genuinely shape a trip.</p>
          </div>

          {guides.length > 0 ? (
            <div className={styles.guideGrid}>
              {guides.map((guide, index) => (
                <article className={styles.guideCard} key={guide.slug}>
                  <Link
                    aria-label={`Read ${guide.title}`}
                    className={styles.guideImage}
                    href={guide.href}
                    style={guideImageStyle(guide)}
                  >
                    {guide.hero ? (
                      <Image
                        src={assetPath(guide.hero.src ?? "")}
                        alt={guide.hero.alt ?? ""}
                        width={guide.hero.width ?? 1200}
                        height={guide.hero.height ?? 900}
                        sizes="(max-width: 760px) 92vw, 44vw"
                      />
                    ) : (
                      <span className={styles.imageFallback} aria-hidden="true">Yunnan Unfolded</span>
                    )}
                    <span className={styles.cardNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </Link>
                  <div className={styles.guideCopy}>
                    <div className={styles.guideMeta}>
                      <p>{guide.category}{guide.region ? ` · ${guide.region}` : ""}</p>
                      {guide.status === "draft" ? <span>Local Draft</span> : null}
                    </div>
                    <h3><Link href={guide.href}>{guide.title}</Link></h3>
                    <p>{guide.summary}</p>
                    <Link className={styles.readLink} href={guide.href}>Read the guide <span aria-hidden="true">↗</span></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.eyebrow}>Field notes in preparation</p>
              <h3>Practical guides are taking shape.</h3>
              <p>
                We are preparing clear notes on journey planning, transport, seasons and destinations across Yunnan. Until then, tell us what you are considering and we will answer personally.
              </p>
              <div className={styles.emptyActions}>
                <Link className={styles.primaryButton} href="/journeys/">Explore journeys</Link>
                <Link className={styles.secondaryLink} href="/plan-my-trip/">Ask a travel question <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="guides-cta-title">
        <div className="shell">
          <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Planning something specific?</p>
          <h2 id="guides-cta-title">Begin with the questions that matter to you.</h2>
          <p>Share your dates, interests and pace. Our Yunnan-based team will respond with practical ideas shaped around the journey you have in mind.</p>
          <Link className={styles.goldButton} href="/plan-my-trip/">Plan my Yunnan journey</Link>
        </div>
      </section>

      <Footer />
      <Link className="side-cta" href="/plan-my-trip/"><span>Plan my trip</span></Link>
    </main>
  );
}
