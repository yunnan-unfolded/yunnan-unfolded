import type { CSSProperties } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ArrowLink } from "./components/ArrowLink";
import { QuickInquiryForm } from "./components/QuickInquiryForm";
import { HeroSlideshow } from "./components/HeroSlideshow";
import { upcomingJourneys } from "./data/siteContent";
import { publishedJourneys } from "./lib/journeyContent";
import { getTravelGuides, type TravelGuideCard } from "./lib/travelGuideContent";
import type { WalkDetail } from "./lib/walkAdapter";
import { getWalks } from "./lib/walkContent";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "./lib/sitePaths";

const localDraftPreviewEnabled = process.env.NODE_ENV === "development"
  && process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

const homepageTravelGuideSlugs = [
  "how-to-pay-in-yunnan",
  "best-time-to-visit-yunnan",
  "how-to-get-around-yunnan",
] as const;

const homepageTravelGuideCardImages: Record<string, string> = {
  "how-to-pay-in-yunnan": "/images/travel-guides/homepage-cards/how-to-pay-in-yunnan.webp",
  "best-time-to-visit-yunnan": "/images/travel-guides/homepage-cards/best-time-to-visit-yunnan.webp",
  "how-to-get-around-yunnan": "/images/travel-guides/homepage-cards/how-to-get-around-yunnan.webp",
};

const travelGuideFocalPoints = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
} as const;

function isHomepageTravelGuide(guide: TravelGuideCard | undefined): guide is TravelGuideCard & { hero: NonNullable<TravelGuideCard["hero"]> & { src: string } } {
  return Boolean(guide?.status === "published" && guide.hero?.src);
}

function walkHref(walk: WalkDetail) {
  return `/walk-yunnan/${walk.slug}/`;
}

function walkDistances(walk: WalkDetail) {
  const distances = walk.routeOptions
    .map((option) => option.distanceKm)
    .filter((distance): distance is number => typeof distance === "number");
  return distances.length > 0 ? `${distances.join(" / ")} km` : undefined;
}

function walkCoverStyle(walk: WalkDetail) {
  const width = walk.hero.width;
  const height = walk.hero.height;
  return width && height
    ? ({ "--walk-card-aspect-ratio": `${width} / ${height}` } as CSSProperties)
    : undefined;
}

export default function Home() {
  const homepageWalks = getWalks(localDraftPreviewEnabled).slice(0, 1);
  const publishedTravelGuides = getTravelGuides();
  const travelGuideBySlug = new Map(publishedTravelGuides.map((guide) => [guide.slug, guide]));
  const homepageTravelGuides = homepageTravelGuideSlugs
    .map((slug) => travelGuideBySlug.get(slug))
    .filter(isHomepageTravelGuide);
  const journeyCards = [
    ...publishedJourneys.map((journey) => ({
      title: journey.collection,
      route: `${journey.startLocation} to ${journey.endLocation} · ${journey.duration.days} days`,
      description: journey.homepageDescription,
      image: journey.hero.src,
      alt: journey.homepageImageAlt,
      href: `/journeys/${journey.slug}`,
      startingPrice: undefined,
    })),
    ...upcomingJourneys,
  ];
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <Header />
        <HeroSlideshow />
        <div className="hero__veil" />
        <div className="hero__content shell reveal">
          <p className="eyebrow eyebrow--light">Southwest China, seen slowly</p>
          <h1 id="hero-title">Yunnan is our home.<br />Let us show you a side of it most travelers never see.</h1>
          <div className="hero__actions">
            <Link className="button button--ivory" href="/journeys">Explore journeys</Link>
            <ArrowLink href="/plan-my-trip" light>Plan my trip</ArrowLink>
          </div>
        </div>
        <a className="hero__scroll" href="#introduction" aria-label="Scroll to introduction"><span /></a>
      </section>

      <section className="intro section" id="introduction">
        <div className="intro__visual">
          <div className="intro__image-wrap">
            <Image className="intro__image" src="https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Green rice terraces unfolding across the hills of Yunnan" width={1120} height={1400} />
            <span className="intro__caption">Southern Yunnan · China</span>
          </div>
        </div>
        <div className="intro__copy">
          <p className="eyebrow">Look beyond the familiar</p>
          <h2 aria-label="There is another side of Yunnan.">
            <span className="intro__title-desktop" aria-hidden="true"><span>There is another side</span><span>of Yunnan.</span></span>
            <span className="intro__title-mobile" aria-hidden="true"><span>There is another</span><span>side of Yunnan.</span></span>
          </h2>
          <div className="intro__body">
            <p>Beyond the familiar routes are mountain trails, old villages, family kitchens, tea forests and landscapes that reveal themselves slowly.</p>
            <p>We create thoughtful journeys for travelers who want to experience Yunnan more deeply—with local knowledge, unhurried pacing and room for discovery.</p>
          </div>
        </div>
      </section>

      <section className="quick-inquiry" aria-labelledby="quick-inquiry-title">
        <div className="quick-inquiry__story">
          <Image src="https://images.pexels.com/photos/6513729/pexels-photo-6513729.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Mountain country and open fields in Yunnan" width={1800} height={1500} />
          <div className="quick-inquiry__veil" />
          <div className="quick-inquiry__story-copy">
            <small>Personal journeys · locally shaped</small>
            <p id="quick-inquiry-title">Tell us what draws you to Yunnan.</p>
            <span>Share a few details. We’ll respond personally with ideas shaped around your time and interests.</span>
          </div>
        </div>
        <div className="quick-inquiry__panel"><QuickInquiryForm /></div>
      </section>

      <section className="journeys section" aria-labelledby="journeys-title">
        <div className="section-heading shell">
          <div><p className="eyebrow">Curated journeys</p><h2 id="journeys-title">Follow a different path.</h2></div>
          <ArrowLink href="/journeys">View all journeys</ArrowLink>
        </div>
        <div className="journey-grid shell">
          {journeyCards.map((journey,index)=>{
            const href = journey.href ?? "/journeys";
            return <article className={`journey-card journey-card--${index+1}`} key={journey.title}><Link href={href} className="journey-card__image-wrap" aria-label={`Explore ${journey.title}`}><Image className="journey-card__image" src={assetPath(journey.image)} alt={journey.alt} width={1000} height={1250}/><span className="journey-card__number">0{index+1}</span></Link><div className="journey-card__content"><p className="journey-card__route">{journey.route}{journey.startingPrice ? ` · From ${journey.startingPrice} per person` : ""}</p><h3><Link href={href}>{journey.title}</Link></h3><p>{journey.description}</p><ArrowLink href={href}>Discover the journey</ArrowLink></div></article>;
          })}
        </div>
      </section>

      <section className="walk" aria-labelledby="walk-title">
        <div className="walk__hero">
          <Image className="walk__hero-image" src="https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=2200" alt="A narrow trail leading through misty mountains" width={2200} height={1500} />
          <div className="walk__hero-veil" />
          <div className="walk__hero-content shell">
            <p className="eyebrow eyebrow--gold">Walk Yunnan</p>
            <h2 id="walk-title">Explore Yunnan<br />on foot</h2>
            <p>Walk beyond the road into high valleys, alpine forests and villages reached at a human pace.</p>
          </div>
        </div>
        <div className="walk__directory">
          <div className="shell">
            <div className="walk__directory-heading">
              <div><p className="eyebrow">Selected walking journeys</p><h3>Routes shaped by the land</h3></div>
              <p>These are just a few ways to experience Yunnan on foot. Every journey can be adapted to your pace, interests and time.</p>
            </div>
            {homepageWalks.length > 0 ? (
              <div className="walk__route-list">
                {homepageWalks.map((walk, index) => {
                  const href = walkHref(walk);
                  const distances = walkDistances(walk);
                  return (
                    <article className="walk-route" key={walk.slug}>
                      <span className="walk-route__number">0{index + 1}</span>
                      <div className="walk-route__copy">
                        <div className="walk-route__region-line">
                          <p className="walk-route__region">{walk.region}</p>
                          {walk.status === "draft" ? <span>Local Draft</span> : null}
                        </div>
                        <h4><Link href={href}>{walk.title}</Link></h4>
                        <p>{walk.summary}</p>
                      </div>
                      <dl className="walk-route__meta">
                        {distances ? <div><dt>Distances</dt><dd>{distances}</dd></div> : null}
                        <div><dt>Difficulty</dt><dd>{walk.difficulty}</dd></div>
                        <div><dt>Best season</dt><dd>{walk.recommendedSeasons}</dd></div>
                      </dl>
                      <Link
                        className="walk-route__image-wrap"
                        href={href}
                        aria-label={`Explore ${walk.title}`}
                        style={walkCoverStyle(walk)}
                      >
                        <Image
                          src={assetPath(walk.hero.src)}
                          alt={walk.hero.alt}
                          width={walk.hero.width ?? 720}
                          height={walk.hero.height ?? 480}
                          sizes="(max-width: 760px) 88vw, 290px"
                        />
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="walk__empty-state">
                <p className="eyebrow">Routes in preparation</p>
                <h4>New ways to walk through Yunnan are taking shape.</h4>
                <p>Explore the walking directory or tell us what kind of landscape and pace you have in mind.</p>
              </div>
            )}
            <div className="walk__actions">
              <ArrowLink href="/walk-yunnan">Explore all walking journeys</ArrowLink>
              <Link className="button button--gold" href="/plan-my-trip">Plan a walking trip</Link>
            </div>
          </div>
        </div>
      </section>

      {homepageTravelGuides.length > 0 ? (
        <section className="home-travel-guides section" id="home-travel-guides" aria-labelledby="home-travel-guides-title">
          <div className="home-travel-guides__heading shell">
            <div>
              <p className="eyebrow">Travel Guides</p>
              <h2 id="home-travel-guides-title">Practical advice for travelling in Yunnan</h2>
            </div>
            <div className="home-travel-guides__introduction">
              <p>Clear, useful guidance on payments, seasons and getting around, written for international travellers planning an independent trip.</p>
              <Link className="button button--gold" href="/travel-guides/">Explore all Travel Guides</Link>
            </div>
          </div>
          <div className="home-travel-guides__grid shell">
            {homepageTravelGuides.map((guide, index) => {
              const focalPoint = guide.hero.focalPoint ?? "center";
              const cardImage = homepageTravelGuideCardImages[guide.slug];
              return (
                <article className="home-travel-guide-card" key={guide.slug}>
                  <Link
                    className="home-travel-guide-card__image-wrap"
                    href={guide.href}
                    aria-label={`Read ${guide.title}`}
                    style={{ "--home-guide-focus": travelGuideFocalPoints[focalPoint] } as CSSProperties}
                  >
                    <Image
                      src={assetPath(cardImage)}
                      alt={guide.hero.alt ?? ""}
                      width={1200}
                      height={900}
                      sizes="(max-width: 760px) 88vw, 30vw"
                    />
                    <span className="home-travel-guide-card__number">0{index + 1}</span>
                  </Link>
                  <div className="home-travel-guide-card__content">
                    <p className="home-travel-guide-card__category">{guide.category}</p>
                    <h3><Link href={guide.href}>{guide.title}</Link></h3>
                    <p>{guide.summary}</p>
                    <ArrowLink href={guide.href}>Read the guide</ArrowLink>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="local section shell" aria-labelledby="local-title">
        <div className="local__portrait"><Image src="https://images.pexels.com/photos/868097/pexels-photo-868097.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="" width={1000} height={1250}/></div>
        <div className="local__content"><p className="eyebrow">Meet Chloe</p><h2 id="local-title">A journey shaped from the inside.</h2><p className="local__lead">Yunnan Unfolded grows from Chloe’s firsthand knowledge of the province—and a lasting curiosity for the paths, people and stories found between the well-known places.</p><p>She is a local travel professional and passionate hiker who knows both classic Yunnan and its quieter routes. Her approach is simple: listen closely, travel thoughtfully and let each place set the pace.</p><ArrowLink href="/about">Meet Chloe</ArrowLink></div>
      </section>

      <section className="planning section" aria-labelledby="planning-title">
        <div className="planning__inner shell"><p className="eyebrow eyebrow--gold">Begin a conversation</p><h2 id="planning-title">What kind of Yunnan<br />are you dreaming of?</h2><p>Tell us about your time, interests and travel style. We’ll help shape a journey that feels entirely your own.</p><Link className="button button--gold" href="/plan-my-trip">Plan my trip</Link></div>
      </section>

      <Footer/>
      <Link className="side-cta" href="/plan-my-trip"><span>Plan my trip</span></Link>
      <Link className="mobile-cta" href="/plan-my-trip">Plan my Yunnan trip <span>↗</span></Link>
    </main>
  );
}
