import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PlanTripFaq, PlannerJumpLink } from "../components/PlanTripInteractions";
import { TripPlannerForm } from "../components/TripPlannerForm";
import { absoluteAssetUrl, absolutePageUrl, assetPath } from "../lib/sitePaths";
import styles from "./plan-my-trip.module.css";

export const metadata: Metadata = {
  title: { absolute: "Plan a Private Yunnan Journey | Yunnan Unfolded" },
  description:
    "Tell Chloe how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
  alternates: { canonical: absolutePageUrl("/plan-my-trip") },
  openGraph: {
    title: "Plan a Private Yunnan Journey | Yunnan Unfolded",
    description:
      "Tell Chloe how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
    url: absolutePageUrl("/plan-my-trip"),
    type: "website",
    images: [{ url: absoluteAssetUrl("/images/hero/laoyao-mountain.jpg"), width: 1920, height: 1080, alt: "Mountain meadows at Laoyao Mountain in Yunnan" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [absoluteAssetUrl("/images/hero/laoyao-mountain.jpg")],
    title: "Plan a Private Yunnan Journey | Yunnan Unfolded",
    description:
      "Tell Chloe how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
  },
};

const trustItems = [
  "Planned locally in Kunming",
  "Personal reply from Chloe",
  "English-speaking local guides",
  "No compulsory shopping",
];

const processSteps = [
  {
    title: "Share what you know",
    body: "A few dates, ideas or places you’re curious about are enough to begin. Nothing has to be final.",
  },
  {
    title: "Hear from Chloe",
    body: "Chloe will read your enquiry personally and reply within 24 hours with questions or suggestions.",
  },
  {
    title: "Shape the journey together",
    body: "Once the direction is clear, Chloe will explain what can be arranged and share a clear quote before you decide.",
  },
];

export default function PlanMyTripPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Header />
      </div>

      <section className={styles.hero} aria-labelledby="plan-trip-title">
        <div className={styles.story}>
          <picture>
            <source media="(max-width: 760px)" srcSet={assetPath("/images/optimized/laoyao-mountain-960.webp")} />
            <Image
              className={styles.storyImage}
              src={assetPath("/images/hero/laoyao-mountain.jpg")}
              alt="Clouds moving across mountain meadows at Laoyao Mountain in Yunnan"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 760px) 100vw, 52vw"
            />
          </picture>
            <div className={styles.storyVeil} />
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Plan your journey</p>
            <h1 id="plan-trip-title">Tell Chloe what kind of Yunnan journey feels right for you.</h1>
            <p className={styles.introduction}>
              You don’t need a finished itinerary. Share when you’re thinking of travelling, what interests you and the kind of pace you enjoy. Chloe will use her local knowledge to help shape a private journey that works in the real Yunnan—not just on paper.
            </p>
            <p className={styles.trustLine}>
              Based in Kunming <span aria-hidden="true">·</span> Personal reply within 24 hours <span aria-hidden="true">·</span> No obligation
            </p>
            <div className={styles.heroActions}>
              <PlannerJumpLink className={styles.primaryButton}>Start planning my journey</PlannerJumpLink>
              <Link className={styles.textLink} href="mailto:hello@yunnanunfolded.com">
                Prefer to talk first? Send us a message.
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.mobileHeroTrust} aria-label="Why plan with Yunnan Unfolded">
          {trustItems.map((item) => <span key={item}>{item}</span>)}
        </div>

        <div className={styles.formPanel} id="travel-brief">
          <TripPlannerForm />
        </div>
      </section>

      <section className={`${styles.section} ${styles.process}`} aria-labelledby="process-title">
        <div className={styles.sectionShell}>
          <p className={`${styles.sectionEyebrow} ${styles.eyebrowLight}`}>After you enquire</p>
          <h2 id="process-title">What happens next.</h2>
          <div className={styles.processGrid}>
            {processSteps.map((step, index) => (
              <article key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.sectionShell} ${styles.faqGrid}`}>
          <div className={styles.faqHeading}>
            <p className={styles.sectionEyebrow}>Before you enquire</p>
            <h2 id="faq-title">A few practical questions.</h2>
          </div>
          <PlanTripFaq />
        </div>
      </section>

      <Footer />
    </main>
  );
}
