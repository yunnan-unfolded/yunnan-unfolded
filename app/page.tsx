import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ArrowLink } from "./components/ArrowLink";
import { guides, journeys } from "./data/siteContent";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <Header />
        <Image
          className="hero__image"
          src="https://images.pexels.com/photos/1060267/pexels-photo-1060267.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt="Snow-covered mountain peaks in Yunnan"
          width={2400}
          height={1600}
          priority
        />
        <div className="hero__veil" />
        <div className="hero__content shell reveal">
          <p className="eyebrow eyebrow--light">Southwest China, seen slowly</p>
          <h1 id="hero-title">Yunnan,<br /><em>unfolded.</em></h1>
          <p className="hero__lede">Journeys into the mountains, cultures and hidden corners of southwest China.</p>
          <div className="hero__actions">
            <Link className="button button--ivory" href="/journeys">Explore journeys</Link>
            <ArrowLink href="/plan-my-trip" light>Plan my trip</ArrowLink>
          </div>
        </div>
        <span className="hero__place">Diqing, northwest Yunnan</span>
        <a className="hero__scroll" href="#introduction" aria-label="Scroll to introduction"><span /></a>
      </section>

      <section className="intro section shell" id="introduction">
        <div className="intro__marker"><span>01</span><span>Our Yunnan</span></div>
        <div className="intro__copy">
          <p className="eyebrow">Look beyond the familiar</p>
          <h2>There is another side<br />of Yunnan.</h2>
          <div className="intro__body">
            <p>Beyond the familiar routes are mountain trails, old villages, family kitchens, tea forests and landscapes that reveal themselves slowly.</p>
            <p>We create thoughtful journeys for travelers who want to experience Yunnan more deeply—with local knowledge, unhurried pacing and room for discovery.</p>
          </div>
        </div>
      </section>

      <section className="journeys section" aria-labelledby="journeys-title">
        <div className="section-heading shell">
          <div><p className="eyebrow">Curated journeys</p><h2 id="journeys-title">Follow a different path.</h2></div>
          <ArrowLink href="/journeys">View all journeys</ArrowLink>
        </div>
        <div className="journey-grid shell">
          {journeys.map((journey, index) => (
            <article className={`journey-card journey-card--${index + 1}`} key={journey.title}>
              <Link href="/journeys" className="journey-card__image-wrap" aria-label={`Explore ${journey.title}`}>
                <Image className="journey-card__image" src={journey.image} alt={journey.alt} width={1000} height={1250} />
                <span className="journey-card__number">0{index + 1}</span>
              </Link>
              <div className="journey-card__content">
                <p className="journey-card__route">{journey.route}</p>
                <h3><Link href="/journeys">{journey.title}</Link></h3>
                <p>{journey.description}</p>
                <ArrowLink href="/journeys">Discover the journey</ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="walk section" aria-labelledby="walk-title">
        <div className="walk__image-panel">
          <Image src="https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=2000" alt="A narrow trail leading through misty mountains" width={1600} height={1800} />
          <span className="walk__caption">Paths into the high country</span>
        </div>
        <div className="walk__content">
          <p className="eyebrow eyebrow--gold">Walk Yunnan</p>
          <h2 id="walk-title">Some places are best understood <em>on foot.</em></h2>
          <p>Walk beyond the road into high valleys, alpine forests and villages reached at a human pace. From Yubeng and Haba to lesser-known trails, these journeys leave space for the land to lead.</p>
          <ul aria-label="Featured walking regions"><li>Yubeng</li><li>Haba & Black Lake</li><li>Tiger Leaping Gorge</li></ul>
          <ArrowLink href="/walk-yunnan" light>Walk Yunnan</ArrowLink>
        </div>
      </section>

      <section className="local section shell" aria-labelledby="local-title">
        <div className="local__portrait">
          <Image src="https://images.pexels.com/photos/868097/pexels-photo-868097.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="A hiker standing in a mountain landscape" width={1000} height={1250} />
          <span className="image-note">Portrait placeholder · Chloe in the field</span>
        </div>
        <div className="local__content">
          <p className="eyebrow">Local by nature</p>
          <h2 id="local-title">A journey shaped from the inside.</h2>
          <p className="local__lead">Yunnan Unfolded grows from Chloe’s firsthand knowledge of the province—and a lasting curiosity for the paths, people and stories found between the well-known places.</p>
          <p>She is a local travel professional and passionate hiker who knows both classic Yunnan and its quieter routes. Her approach is simple: listen closely, travel thoughtfully and let each place set the pace.</p>
          <ArrowLink href="/about">Meet Chloe</ArrowLink>
        </div>
      </section>

      <section className="guides section" aria-labelledby="guides-title">
        <div className="section-heading shell">
          <div><p className="eyebrow">Field notes</p><h2 id="guides-title">Read before you wander.</h2></div>
          <ArrowLink href="/travel-guides">Explore travel guides</ArrowLink>
        </div>
        <div className="guide-grid shell">
          {guides.map((guide, index) => (
            <article className="guide-card" key={guide.title}>
              <Link href="/travel-guides" className="guide-card__image-wrap"><Image src={guide.image} alt={guide.alt} width={900} height={675} /></Link>
              <p className="guide-card__meta">{guide.category}<span>0{index + 1}</span></p>
              <h3><Link href="/travel-guides">{guide.title}</Link></h3>
              <ArrowLink href="/travel-guides">Read the guide</ArrowLink>
            </article>
          ))}
        </div>
      </section>

      <section className="planning section" aria-labelledby="planning-title">
        <div className="planning__inner shell">
          <p className="eyebrow eyebrow--gold">Begin a conversation</p>
          <h2 id="planning-title">What kind of Yunnan<br />are you dreaming of?</h2>
          <p>Tell us about your time, interests and travel style. We’ll help shape a journey that feels entirely your own.</p>
          <Link className="button button--gold" href="/plan-my-trip">Plan my trip</Link>
        </div>
      </section>

      <Footer />
      <Link className="side-cta" href="/plan-my-trip"><span>Plan my trip</span></Link>
      <Link className="mobile-cta" href="/plan-my-trip">Plan my Yunnan trip <span>↗</span></Link>
    </main>
  );
}
