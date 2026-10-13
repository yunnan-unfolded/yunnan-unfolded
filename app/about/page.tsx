import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { absoluteAssetUrl, absolutePageUrl, assetPath } from "../lib/sitePaths";
import styles from "./about.module.css";

const title = "About Yunnan Unfolded | Tailor-Made Travel in Yunnan";
const description = "Meet Chloe and learn how Yunnan Unfolded creates tailor-made journeys from Kunming, shaped around each traveller’s interests, timing and pace.";
const aboutUrl = absolutePageUrl("/about");
const homeUrl = absolutePageUrl("/");
const shareImage = absoluteAssetUrl("/images/about/chloe-alpine-lake.webp");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: aboutUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: aboutUrl,
    siteName: "Yunnan Unfolded",
    type: "website",
    images: [{
      url: shareImage,
      width: 1600,
      height: 2000,
      alt: "Chloe hiking beside an alpine lake in Yunnan",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${aboutUrl}#about`,
      url: aboutUrl,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": `${homeUrl}#website` },
      publisher: { "@id": `${homeUrl}#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${aboutUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
        { "@type": "ListItem", position: 2, name: "About", item: aboutUrl },
      ],
    },
  ],
};

const contentLinks = [
  {
    title: "Journeys",
    href: "/journeys/",
  },
  {
    title: "Walk Yunnan",
    href: "/walk-yunnan/",
  },
  {
    title: "Travel Guides",
    href: "/travel-guides/",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <div className={styles.topbar}>
        <Header />
      </div>

      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroHeading}>
          <p className={styles.eyebrow}>ABOUT YUNNAN UNFOLDED</p>
          <h1 id="about-title">The person behind your journey.</h1>
        </div>
        <div className={styles.heroIntroduction}>
          <p className={styles.heroLead}>Yunnan Unfolded grew out of Chloe’s work in travel in Kunming and her love of exploring the province on foot.</p>
        </div>
      </section>

      <section className={styles.chloe} aria-labelledby="meet-chloe-title">
        <figure className={styles.chloePortrait}>
          <Image
            src={assetPath("/images/about/chloe-alpine-lake.webp")}
            alt="Chloe hiking beside an alpine lake in Yunnan"
            width={1600}
            height={2000}
            sizes="(max-width: 760px) 88vw, (max-width: 1100px) 44vw, 480px"
          />
        </figure>
        <div className={styles.chloeCopy}>
          <h2 id="meet-chloe-title">Meet Chloe</h2>
          <p className={styles.chloeLead}>Hi, I’m Chloe, the person behind Yunnan Unfolded.</p>
          <p>Whenever I have time, I head for the mountains. Hiking has taken me through forests, alpine meadows and quiet villages across Yunnan.</p>
          <p>I enjoy the well-known places, but I am just as drawn to a morning market, a family-run guesthouse or a trail with time to stop and look around.</p>
        </div>
      </section>

      <section className={styles.planning} aria-labelledby="planning-title">
        <div className={styles.planningCopy}>
          <h2 id="planning-title">Why I plan this way</h2>
          <p className={styles.planningLead}>A good trip leaves room to notice where you are.</p>
          <p>Distances, seasons and altitude shape a journey here. I prefer a realistic route with time to enjoy each place, rather than fit in every famous stop.</p>
          <p>Getting to know the traveller matters just as much. Long days on the trail and quiet mornings over breakfast belong in different kinds of trips.</p>
        </div>
        <figure className={styles.planningImage}>
          <Image
            src={assetPath("/images/about/chloe-rhododendrons.webp")}
            alt="Chloe walking among alpine rhododendrons in Yunnan"
            width={1440}
            height={1920}
            sizes="(max-width: 760px) 88vw, (max-width: 1100px) 42vw, 520px"
          />
        </figure>
      </section>

      <section className={styles.explore} aria-labelledby="explore-title">
        <div className={styles.exploreIntroduction}>
          <h2 id="explore-title">What you will find here</h2>
          <p>The journeys, walks and guides share places I know and practical details that make travelling here easier.</p>
        </div>
        <nav className={styles.exploreLinks} aria-label="Explore Yunnan Unfolded">
          {contentLinks.map((item) => (
            <Link className={styles.exploreLink} href={item.href} key={item.href}>
              <span className={styles.exploreLinkTitle}>{item.title}</span>
              <span className={styles.exploreLinkArrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className={styles.final} aria-labelledby="about-final-title">
        <div className={styles.finalInner}>
          <h2 id="about-final-title">Thinking about Yunnan?</h2>
          <p>Tell me what you have in mind. We can take it from there.</p>
          <Link className="button button--gold" href="/plan-my-trip/">Plan My Trip</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
