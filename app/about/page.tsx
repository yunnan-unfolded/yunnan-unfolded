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
          <h1 id="about-title">A more personal way to experience Yunnan.</h1>
        </div>
        <div className={styles.heroIntroduction}>
          <p className={styles.heroLead}>Yunnan Unfolded is a travel studio based in Kunming. We create tailor-made journeys for travellers who want to experience Yunnan at a pace that feels right for them.</p>
          <p>Yunnan is beautiful, but it is not always simple to plan. Distances can be longer than they look on a map. Altitude changes quickly, the seasons feel different from one region to another, and trying to fit too much into one trip can take the pleasure out of it.</p>
          <p>We are here to make the journey clearer, more comfortable and more personal.</p>
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
          <p>I work in travel in Kunming, and whenever I have time, I head for the mountains. Hiking has taken me through forests, alpine meadows, quiet villages and many corners of Yunnan that are easy to miss when you are rushing from one famous sight to the next.</p>
          <p>I enjoy Yunnan’s well-known places, but I am equally drawn to the quieter parts: a small road through the countryside, a local market in the morning, a family-run guesthouse, or a trail that gives you enough time to stop and look around.</p>
          <p>When I plan a trip, I start by getting to know the traveller. Some people want long days outdoors. Some prefer good food, comfortable stays and unhurried mornings. Others are visiting China for the first time and simply want someone to make the practical side feel less overwhelming.</p>
          <p>There is no single “best” way to travel through Yunnan. The right trip depends on who you are, when you come and what you would like to take home from the experience.</p>
        </div>
      </section>

      <section className={styles.planning} aria-labelledby="planning-title">
        <div className={styles.planningCopy}>
          <h2 id="planning-title">How we plan a journey</h2>
          <p className={styles.planningLead}>We begin with a conversation.</p>
          <p>Tell us what brought Yunnan to mind, how many days you have and the kind of travel you enjoy. You do not need to arrive with a finished itinerary. A few places, a photograph, a walking route or even a rough idea is enough to begin.</p>
          <p>From there, we shape the journey around the season, distances, altitude, transport and your preferred pace. We keep the plan practical, but leave enough space for the trip to feel like a journey rather than a checklist.</p>
          <p>The result is not a standard tour taken from a shelf. It is a route made for you.</p>
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
          <p>The journeys, walks and practical guides on this website are a way to share the Yunnan we know.</p>
          <p>Some will help you understand the main travel regions. Others offer ideas for walking, choosing the right season, getting around or handling everyday things such as payments and mobile internet.</p>
          <p>You can use them to plan independently, or as a starting point for a tailor-made journey with us.</p>
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
          <p className={styles.finalLead}>You do not need to have everything figured out.</p>
          <p>Tell us what you are interested in, when you might travel and what kind of pace feels comfortable. We will help you turn those first ideas into a journey that makes sense.</p>
          <Link className="button button--gold" href="/plan-my-trip/">PLAN MY YUNNAN TRIP</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
