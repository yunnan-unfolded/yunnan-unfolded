import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import type { WalkDetail } from "../lib/walkAdapter";
import { getWalks } from "../lib/walkContent";
import { absolutePageUrl, assetPath } from "../lib/sitePaths";
import styles from "./walk-directory.module.css";

const localDraftPreviewEnabled = process.env.NODE_ENV === "development"
  && process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

export const metadata: Metadata = {
  title: { absolute: "Walk Yunnan | Guided Walking Routes | Yunnan Unfolded" },
  description:
    "Compare guided walking routes through Yunnan by distance, elevation, terrain and season, with practical notes shaped by local knowledge.",
  alternates: { canonical: absolutePageUrl("/walk-yunnan") },
  openGraph: {
    title: "Walk Yunnan | Guided Walking Routes | Yunnan Unfolded",
    description:
      "Mountain paths, forest walks and high-country routes in Yunnan, compared with the practical details needed to choose well.",
    url: absolutePageUrl("/walk-yunnan"),
    siteName: "Yunnan Unfolded",
    type: "website",
  },
};

function distanceSummary(walk: WalkDetail) {
  const distances = walk.routeOptions
    .map((option) => option.distanceKm)
    .filter((value): value is number => typeof value === "number");
  return distances.length > 0 ? `${distances.join(" / ")} km` : "Route dependent";
}

function highestPoint(walk: WalkDetail) {
  const elevations = walk.routeOptions
    .map((option) => option.highestElevationM)
    .filter((value): value is number => typeof value === "number");
  return elevations.length > 0
    ? `${Math.max(...elevations).toLocaleString("en-US")} m`
    : "Route dependent";
}

function maximumClimb(walk: WalkDetail) {
  const gains = walk.routeOptions
    .map((option) => option.elevationGainM)
    .filter((value): value is number => typeof value === "number");
  return gains.length > 0
    ? `Up to ${Math.max(...gains).toLocaleString("en-US")} m`
    : "Route dependent";
}

function routeHref(walk: WalkDetail) {
  return `/walk-yunnan/${walk.slug}/`;
}

export default function WalkYunnanPage() {
  const walks = getWalks(localDraftPreviewEnabled);
  const publicWalks = getWalks(false);
  const featuredWalk = walks[0];
  const heroStyle = featuredWalk
    ? ({ "--walk-hero-position": "center" } as CSSProperties)
    : undefined;
  const directoryUrl = absolutePageUrl("/walk-yunnan");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Walk Yunnan",
    description: "Guided walking routes through Yunnan, compared by distance, elevation, terrain and season.",
    url: directoryUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: publicWalks.length,
      itemListElement: publicWalks.map((walk, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: walk.title,
        url: absolutePageUrl(`/walk-yunnan/${walk.slug}`),
      })),
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <section className={styles.hero} aria-labelledby="walk-directory-title">
        <div className={`${styles.heroInner} shell`} style={heroStyle}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Walk Yunnan · locally guided</p>
            <h1 id="walk-directory-title">Let the landscape set the pace.</h1>
            <p className={styles.heroIntroduction}>
              Compare forest paths, mountain walks and high-country routes through Yunnan with the practical details needed to choose well.
            </p>
            {featuredWalk ? (
              <div className={styles.featuredPrompt}>
                <p>{featuredWalk.status === "draft" ? "Local draft preview" : "Featured walk"} · {featuredWalk.region}</p>
                <Link href={routeHref(featuredWalk)}>
                  Explore {featuredWalk.title} <span aria-hidden="true">↗</span>
                </Link>
              </div>
            ) : (
              <Link className={styles.primaryButton} href="/plan-my-trip/">Plan a walking journey</Link>
            )}
          </div>

          {featuredWalk ? (
            <Link
              className={styles.heroVisual}
              href={routeHref(featuredWalk)}
              aria-label={`Explore ${featuredWalk.title}`}
            >
              <Image
                src={assetPath(featuredWalk.hero.src)}
                alt={featuredWalk.hero.alt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 54vw"
              />
              <div className={styles.heroVisualVeil} />
              <div className={styles.heroVisualCaption}>
                <span>Featured route</span>
                <strong>{featuredWalk.title}</strong>
                <small>{distanceSummary(featuredWalk)} · {featuredWalk.recommendedSeasons}</small>
              </div>
            </Link>
          ) : (
            <div className={styles.heroEmpty} aria-hidden="true"><span>Routes in preparation</span></div>
          )}
        </div>
      </section>

      <section className={styles.introduction} aria-labelledby="walk-introduction-title">
        <div className="shell">
          <p className={styles.eyebrow}>Choose with confidence</p>
          <div>
            <h2 id="walk-introduction-title">Start with distance, terrain and how you want the day to feel.</h2>
            <p>
              A short walk and a full mountain traverse can pass through the same landscape while asking very different things of the people walking. Each route below separates scenery from the practical facts: time, elevation, trail surface and risk.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.directory} aria-labelledby="walk-list-title">
        <div className="shell">
          <div className={styles.directoryHeading}>
            <div>
              <p className={styles.eyebrow}>Walking routes</p>
              <h2 id="walk-list-title">Find your way into Yunnan.</h2>
            </div>
            <p>Every walk can be discussed with our Yunnan-based team and adjusted around current weather, trail conditions and your walking level.</p>
          </div>

          {walks.length > 0 ? (
            <div className={styles.routeList}>
              {walks.map((walk, index) => (
                <article className={styles.routeCard} key={walk.slug}>
                  <Link
                    className={styles.routeImage}
                    href={routeHref(walk)}
                    aria-label={`Explore ${walk.title}`}
                  >
                    <Image
                      src={assetPath(walk.hero.src)}
                      alt={walk.hero.alt}
                      width={walk.hero.width ?? 1600}
                      height={walk.hero.height ?? 1200}
                      sizes="(max-width: 900px) 92vw, 48vw"
                    />
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </Link>

                  <div className={styles.routeCopy}>
                    <div className={styles.routeMetaLine}>
                      <p>{walk.region}</p>
                      {walk.status === "draft" ? <span>Local draft</span> : null}
                    </div>
                    <h3><Link href={routeHref(walk)}>{walk.title}</Link></h3>
                    <p className={styles.routeSummary}>{walk.summary}</p>

                    <dl className={styles.routeFacts}>
                      <div><dt>Route choices</dt><dd>{walk.routeOptions.length || "Flexible"}</dd></div>
                      <div><dt>Distances</dt><dd>{distanceSummary(walk)}</dd></div>
                      <div><dt>Highest point</dt><dd>{highestPoint(walk)}</dd></div>
                      <div><dt>Elevation gain</dt><dd>{maximumClimb(walk)}</dd></div>
                      <div><dt>Walking level</dt><dd>{walk.difficulty}</dd></div>
                      <div><dt>Best season</dt><dd>{walk.recommendedSeasons}</dd></div>
                    </dl>

                    <Link className={styles.editorialLink} href={routeHref(walk)}>
                      Compare route options <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.eyebrow}>More routes are being prepared</p>
              <h3>Looking for a particular kind of walk?</h3>
              <p>Tell us the season, distance and level that feel right. We can begin with local conditions rather than a fixed list.</p>
              <Link className={styles.primaryButton} href="/plan-my-trip/">Ask about walking in Yunnan</Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="walk-cta-title">
        <div className="shell">
          <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Plan with local knowledge</p>
          <h2 id="walk-cta-title">Not sure which distance or elevation is right for you?</h2>
          <p>Tell us how much walking feels comfortable and when you plan to travel. We’ll suggest a route that fits the people walking and the mountain conditions.</p>
          <Link className={styles.goldButton} href="/plan-my-trip/">Plan my walking journey</Link>
        </div>
      </section>

      <Footer />
      <Link className="side-cta" href="/plan-my-trip/"><span>Plan my trip</span></Link>
      <Link className="mobile-cta" href="/plan-my-trip/">Plan my Yunnan trip <span>↗</span></Link>
    </main>
  );
}
