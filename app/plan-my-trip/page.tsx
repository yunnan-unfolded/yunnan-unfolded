import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PlanTripFaq, PlannerJumpLink } from "../components/PlanTripInteractions";
import { TripPlannerForm } from "../components/TripPlannerForm";
import styles from "./plan-my-trip.module.css";

export const metadata: Metadata = {
  title: { absolute: "Plan a Private Yunnan Journey | Yunnan Unfolded" },
  description:
    "Tell our Kunming-based team how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
  alternates: { canonical: "/plan-my-trip" },
  openGraph: {
    title: "Plan a Private Yunnan Journey | Yunnan Unfolded",
    description:
      "Tell our Kunming-based team how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
    url: "/plan-my-trip",
  },
  twitter: {
    title: "Plan a Private Yunnan Journey | Yunnan Unfolded",
    description:
      "Tell our Kunming-based team how you’d like to experience Yunnan. Receive thoughtful, locally informed journey ideas and a personal reply within 24 hours.",
  },
};

const trustItems = [
  "Kunming-based local team",
  "English-speaking local guides",
  "Personal reply within 24 hours",
  "No compulsory shopping",
];

const planningPromises = [
  {
    title: "Local knowledge, shared honestly",
    body: "We’ll tell you what is worth your time, what may feel rushed and how the season, altitude and distances could affect your journey.",
  },
  {
    title: "Time to experience a place",
    body: "A good journey should leave room for conversations, unexpected discoveries and moments that were never written into the itinerary.",
  },
  {
    title: "No compulsory shopping",
    body: "We never add shopping stops simply because someone expects you to buy. Markets, craft studios or local products are included only when they genuinely interest you.",
  },
  {
    title: "Guidance in English",
    body: "English-speaking local guides help make the experience easier, more personal and more meaningful.",
  },
];

const processSteps = [
  {
    title: "Share what you have in mind",
    body: "Tell us your approximate dates, interests and travel style. You don’t need to know exactly where you want to go.",
  },
  {
    title: "Hear from someone local",
    body: "Our Kunming-based team will reply within 24 hours. We may ask a few more questions before suggesting the first shape of your journey.",
  },
  {
    title: "Shape the journey together",
    body: "We’ll refine the route, pace, accommodation and experiences with you until the itinerary feels entirely your own.",
  },
];

const bookingPromises = [
  {
    title: "A clear itinerary",
    body: "Before you confirm, you’ll know how the journey flows and what is included.",
  },
  {
    title: "A straightforward payment schedule",
    body: "A 50% deposit confirms your journey. The remaining balance is due before the journey begins.",
  },
  {
    title: "Room for plans to change",
    body: "Cancel 30 days or more before departure and receive a full refund, in accordance with the terms of your travel contract.",
  },
  {
    title: "No hidden shopping stops",
    body: "Your time belongs to you. Shopping is included only when you specifically ask for it.",
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
          <Image
            className={styles.storyImage}
            src="/images/hero/laoyao-mountain.jpg"
            alt="Clouds moving across mountain meadows at Laoyao Mountain in Yunnan"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 52vw"
          />
          <div className={styles.storyVeil} />
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Plan your journey</p>
            <h1 id="plan-trip-title">Tell us what you’d love your time in Yunnan to feel like.</h1>
            <p className={styles.introduction}>
              You don’t need to have the whole journey figured out. Share what you know so far—when you’d like to travel, what interests you and the kind of pace that feels right. We’ll bring the local knowledge and begin shaping the possibilities with you.
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

      <section className={styles.trustStrip} aria-label="Yunnan Unfolded travel planning promises">
        <div className={styles.trustStripInner}>
          {trustItems.map((item, index) => (
            <p key={item}><span>0{index + 1}</span>{item}</p>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.why}`} aria-labelledby="why-title">
        <div className={styles.sectionShell}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>Planned locally</p>
            <h2 id="why-title">Yunnan is home. That changes how we plan.</h2>
            <p>We know the places travellers come to see, but local knowledge is also knowing when to take the quieter road, which season changes a landscape, where an extra night is worthwhile and when a famous stop may not be right for you.</p>
          </div>
          <div className={styles.whyGrid}>
            <article className={styles.whyLead}>
              <span>01</span>
              <h3>We begin with you</h3>
              <p>We don’t start with a fixed itinerary. We begin with your time, interests and travel style, then shape the journey around them.</p>
            </article>
            <div className={styles.whyPromises}>
              {planningPromises.map((item, index) => (
                <article key={item.title}>
                  <span>0{index + 2}</span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.process}`} aria-labelledby="process-title">
        <div className={styles.sectionShell}>
          <p className={`${styles.sectionEyebrow} ${styles.eyebrowLight}`}>From idea to journey</p>
          <h2 id="process-title">A simple, personal planning process.</h2>
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

      <section className={`${styles.section} ${styles.local}`} aria-labelledby="local-title">
        <div className={`${styles.sectionShell} ${styles.localGrid}`}>
          <div className={styles.localVisual}>
            <Image
              src="/images/hero/jiuzihai-aerial.jpg"
              alt="A high mountain lake surrounded by green slopes in Yunnan"
              width={1080}
              height={1731}
              sizes="(max-width: 760px) 88vw, 42vw"
            />
            <p>Yunnan, seen from close to home</p>
          </div>
          <div className={styles.localCopy}>
            <p className={styles.sectionEyebrow}>Here in Yunnan</p>
            <h2 id="local-title">There is a real person behind every journey.</h2>
            <p>We’re based in Kunming and focus on one place: Yunnan. We understand the distances, changing seasons, high-altitude landscapes and small practical details that can make the difference between a journey that simply looks good on paper and one that genuinely feels good to experience.</p>
            <p>Your first reply will come from our team—not an automated itinerary generator. We’ll listen first, then offer ideas that make sense for you.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.promises}`} aria-labelledby="promises-title">
        <div className={styles.sectionShell}>
          <div className={styles.promiseHeading}>
            <p className={styles.sectionEyebrow}>Travel with clarity</p>
            <h2 id="promises-title">Thoughtful planning should also feel reassuring.</h2>
          </div>
          <div className={styles.promiseGrid}>
            {bookingPromises.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.sectionShell} ${styles.faqGrid}`}>
          <div className={styles.faqHeading}>
            <p className={styles.sectionEyebrow}>Before you enquire</p>
            <h2 id="faq-title">Questions, answered honestly.</h2>
          </div>
          <PlanTripFaq />
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <Image
          className={styles.finalCtaImage}
          src="/images/hero/jiuzihai-panorama.jpg"
          alt=""
          fill
          sizes="100vw"
        />
        <div className={styles.finalCtaVeil} />
        <div className={styles.finalCtaInner}>
          <p className={`${styles.sectionEyebrow} ${styles.eyebrowLight}`}>Begin with a conversation</p>
          <h2 id="final-cta-title">Your journey can begin with a few honest details.</h2>
          <p>Tell us roughly when you’d like to travel, who you’re travelling with and what draws you to Yunnan. We’ll help you find the shape of the journey from there.</p>
          <div className={styles.finalActions}>
            <PlannerJumpLink className={styles.primaryButton}>Start planning my journey</PlannerJumpLink>
            <Link className={styles.textLink} href="mailto:hello@yunnanunfolded.com">Not ready to complete the form? Send us a message and start with a simple question.</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
