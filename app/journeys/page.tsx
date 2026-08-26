import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { publishedJourneys } from "../data/journeys";
import { absoluteAssetUrl, absolutePageUrl, assetPath } from "../lib/sitePaths";
import styles from "./journeys.module.css";

const heroJourney = publishedJourneys[0];

export const metadata: Metadata = {
  title: { absolute: "Private Journeys Through Yunnan | Yunnan Unfolded" },
  description:
    "Explore private, tailor-made journeys through Yunnan shaped around local culture, mountain landscapes and a more thoughtful pace.",
  alternates: { canonical: absolutePageUrl("/journeys") },
  openGraph: {
    title: "Private Journeys Through Yunnan | Yunnan Unfolded",
    description:
      "Travel ideas shaped by local knowledge, with every route adapted to your time, interests and preferred pace.",
    url: absolutePageUrl("/journeys"),
    siteName: "Yunnan Unfolded",
    type: "website",
    images: heroJourney
      ? [{
          url: absoluteAssetUrl(heroJourney.hero.src),
          width: heroJourney.hero.width,
          height: heroJourney.hero.height,
          alt: heroJourney.hero.alt,
        }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Journeys Through Yunnan | Yunnan Unfolded",
    description: "Locally rooted journey ideas, tailored to the people travelling.",
    images: heroJourney ? [absoluteAssetUrl(heroJourney.hero.src)] : undefined,
  },
};

export default function JourneysPage() {
  const heroStyle = heroJourney
    ? ({
        "--journey-hero-position": heroJourney.hero.directoryPosition ?? heroJourney.hero.position ?? "center",
        "--journey-hero-position-mobile": heroJourney.hero.directoryMobilePosition ?? heroJourney.hero.directoryPosition ?? heroJourney.hero.position ?? "center",
      } as CSSProperties)
    : undefined;

  return (
    <main className={styles.page}>
      <section className={styles.directoryHero} aria-labelledby="journeys-directory-title" style={heroStyle}>
        <Header />
        {heroJourney ? (
          <Image
            className={styles.heroImage}
            src={assetPath(heroJourney.hero.src)}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        ) : null}
        <div className={styles.heroVeil} />
        <div className={`${styles.directoryHeroInner} shell`}>
          <p className={styles.eyebrow}>Journeys · shaped locally</p>
          <h1 id="journeys-directory-title">Private journeys through Yunnan</h1>
          <p>
            These routes are travel ideas, not fixed departures. Each can be adjusted around your time, interests, walking level and preferred pace.
          </p>
        </div>
      </section>

      <section className={styles.directoryIntroduction} aria-labelledby="journeys-introduction-title">
        <div className="shell">
          <p className={styles.eyebrow}>A place to begin</p>
          <div>
            <h2 id="journeys-introduction-title">Choose the feeling of a journey before the final shape.</h2>
            <p>
              Our journeys bring together landscapes, living culture and the quieter roads between familiar places. They show what is possible; the final route is always shaped through conversation.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.directoryList} aria-label="Yunnan journeys">
        <div className="shell">
          {publishedJourneys.map((journey, index) => (
            <article className={styles.directoryCard} key={journey.slug}>
              <Link
                className={styles.directoryCardImage}
                href={`/journeys/${journey.slug}`}
                aria-label={`Explore ${journey.collection}`}
              >
                <Image
                  src={assetPath(journey.hero.src)}
                  alt={journey.hero.alt}
                  width={journey.hero.width}
                  height={journey.hero.height}
                  sizes="(max-width: 760px) 92vw, 58vw"
                />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </Link>
              <div className={styles.directoryCardCopy}>
                <p className={styles.cardMeta}>{journey.duration.label} · {journey.startLocation} to {journey.endLocation}</p>
                <h2><Link href={`/journeys/${journey.slug}`}>{journey.collection}</Link></h2>
                <p>{journey.listingDescription}</p>
                <Link className={styles.editorialLink} href={`/journeys/${journey.slug}`}>
                  Explore this journey <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.directoryCta} aria-labelledby="journeys-cta-title">
        <div className="shell">
          <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Your journey, personally shaped</p>
          <h2 id="journeys-cta-title">Not looking for a journey off the shelf?</h2>
          <p>Tell us what draws you to Yunnan and we’ll begin with the places, pace and experiences that make sense for you.</p>
          <Link className={styles.goldButton} href="/plan-my-trip/">Plan my journey</Link>
        </div>
      </section>

      <Footer />
      <Link className="side-cta" href="/plan-my-trip/"><span>Plan my trip</span></Link>
      <Link className="mobile-cta" href="/plan-my-trip/">Plan my Yunnan trip <span>↗</span></Link>
    </main>
  );
}
