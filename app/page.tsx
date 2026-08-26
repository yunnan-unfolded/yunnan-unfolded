import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ArrowLink } from "./components/ArrowLink";
import { QuickInquiryForm } from "./components/QuickInquiryForm";
import { HeroSlideshow } from "./components/HeroSlideshow";
import { guides, journeys, walkingRoutes } from "./data/siteContent";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "./lib/sitePaths";

export default function Home() {
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
            <p>Tell us what draws you to Yunnan.</p>
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
          {journeys.map((journey,index)=>{
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
            <div className="walk__route-list">
              {walkingRoutes.map((route, index) => (
                <article className="walk-route" key={route.title}>
                  <span className="walk-route__number">0{index + 1}</span>
                  <div className="walk-route__copy">
                    <p className="walk-route__region">{route.region}</p>
                    <h4><Link href="/walk-yunnan">{route.title}</Link></h4>
                    <p>{route.description}</p>
                  </div>
                  <dl className="walk-route__meta">
                    <div><dt>Duration</dt><dd>{route.duration}</dd></div>
                    <div><dt>Difficulty</dt><dd>{route.difficulty}</dd></div>
                  </dl>
                  <Link className="walk-route__image-wrap" href="/walk-yunnan" aria-label={`Explore ${route.title}`}>
                    <Image src={route.image} alt={route.alt} width={720} height={480} />
                  </Link>
                </article>
              ))}
            </div>
            <div className="walk__actions">
              <ArrowLink href="/walk-yunnan">Explore all walking journeys</ArrowLink>
              <Link className="button button--gold" href="/plan-my-trip">Plan a walking trip</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="local section shell" aria-labelledby="local-title">
        <div className="local__portrait"><Image src="https://images.pexels.com/photos/868097/pexels-photo-868097.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="" width={1000} height={1250}/></div>
        <div className="local__content"><p className="eyebrow">Meet Chloe</p><h2 id="local-title">A journey shaped from the inside.</h2><p className="local__lead">Yunnan Unfolded grows from Chloe’s firsthand knowledge of the province—and a lasting curiosity for the paths, people and stories found between the well-known places.</p><p>She is a local travel professional and passionate hiker who knows both classic Yunnan and its quieter routes. Her approach is simple: listen closely, travel thoughtfully and let each place set the pace.</p><ArrowLink href="/about">Meet Chloe</ArrowLink></div>
      </section>

      <section className="guides section" aria-labelledby="guides-title">
        <div className="section-heading shell"><div><p className="eyebrow">Field notes</p><h2 id="guides-title">Read before you wander.</h2></div><ArrowLink href="/travel-guides">Explore travel guides</ArrowLink></div>
        <div className="guide-grid shell">{guides.map((guide,index)=><article className="guide-card" key={guide.title}><Link href="/travel-guides" className="guide-card__image-wrap"><Image src={guide.image} alt={guide.alt} width={900} height={675}/></Link><p className="guide-card__meta">{guide.category}<span>0{index+1}</span></p><h3><Link href="/travel-guides">{guide.title}</Link></h3><ArrowLink href="/travel-guides">Read the guide</ArrowLink></article>)}</div>
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
