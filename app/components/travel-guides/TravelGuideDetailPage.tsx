import { TravelGuideBody, guideHeadingId } from "./TravelGuideBody";
import { guideNodeText } from "../../../shared/travelGuideRichText";
import Image from "next/image";
import Link from "next/link";
import type { TravelGuideDetail } from "../../lib/travelGuideContent";
import { assetPath, routePath } from "../../lib/sitePaths";
import { Footer } from "../Footer";
import { Header } from "../Header";
import styles from "./travel-guide-detail.module.css";

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
                {guide.body.children.map((node, index) => node.type === "h2" ? (
                  <li key={index}><a href={`#${guideHeadingId(node, index)}`}>{guideNodeText(node)}</a></li>
                ) : null)}
              </ol>
            </aside>

            <div className={styles.articleBody}>
              <TravelGuideBody body={guide.body} />
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
