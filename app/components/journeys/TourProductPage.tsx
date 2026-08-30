import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Journey } from "../../types/journey";
import { assetPath } from "../../lib/sitePaths";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { BulletList, ProductImage, TourDay } from "./TourDay";
import styles from "./tour-product.module.css";

export function TourProductPage({ journey, editFields }: { journey: Journey; editFields?: { title?: string } }) {
  const heroStyle = { "--hero-position": journey.hero.position ?? "center" } as CSSProperties;
  const firstDay = journey.days[0]?.day;
  const lastDay = journey.days.at(-1)?.day;
  const itineraryEyebrow = firstDay && lastDay
    ? firstDay === lastDay ? `Day ${firstDay}` : `Day ${firstDay}–${lastDay}`
    : "Itinerary";

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="journey-title">
        <Header />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroLabels}>
              <span>{journey.heroEyebrow}</span>
              <span>{journey.collection}</span>
            </div>
            <h1 data-tina-field={editFields?.title} id="journey-title">{journey.title}</h1>
            <p className={styles.heroSubtitle}>{journey.subtitle}</p>
            <ul className={styles.heroFacts}>
              {journey.heroFacts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href={journey.primaryHref}>{journey.finalCta.primaryLabel}</Link>
              <Link className={styles.textButton} href={journey.questionHref}>{journey.finalCta.secondaryLabel}</Link>
            </div>
          </div>
          <div className={styles.heroMedia} style={heroStyle}>
            <Image src={assetPath(journey.hero.src)} alt={journey.hero.alt} fill priority sizes="(max-width: 760px) 100vw, 52vw" />
          </div>
        </div>
      </section>

      <section className={styles.promiseBar} aria-label="Our service promises">
        <div className={styles.container}>
          {journey.promises.map((promise) => <p key={promise}>{promise}</p>)}
        </div>
      </section>

      <div className={[styles.productLayout, styles.container].join(" ")}>
        <div className={styles.mainColumn}>
          <section className={styles.overview} aria-labelledby="journey-overview-title">
            <div className={styles.sectionTitle}>
              <span>Overview</span>
              <h2 id="journey-overview-title">Tour Overview</h2>
            </div>
            <div className={styles.overviewCopy}>
              {journey.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <dl className={styles.factTable}>
              {journey.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>

          <section className={styles.highlights} aria-labelledby="journey-highlights-title">
            <div className={styles.sectionTitle}>
              <span>Highlights</span>
              <h2 id="journey-highlights-title">Tour Highlights</h2>
            </div>
            <div className={styles.highlightGrid}>
              {journey.highlights.map(([title, description], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </article>
              ))}
            </div>
            {journey.highlightImages.length > 0 ? (
              <div className={styles.highlightImages}>
                {journey.highlightImages.map((image) => (
                  <ProductImage image={image} key={image.src} sizes="(max-width: 760px) 100vw, 390px" />
                ))}
              </div>
            ) : null}
          </section>

          <section className={styles.route} aria-labelledby="journey-route-title">
            <div className={styles.sectionTitle}>
              <span>Route</span>
              <h2 id="journey-route-title">Route at a Glance</h2>
            </div>
            <p className={styles.routeText}>{journey.route}</p>
            <ol>
              {journey.routeStops.map(([place, days]) => (
                <li key={place}><span /><strong>{place}</strong><small>{days}</small></li>
              ))}
            </ol>
          </section>

          <section className={styles.itinerary} aria-labelledby="journey-itinerary-title">
            <div className={styles.itineraryIntro}>
              <span>{itineraryEyebrow}</span>
              <h2 id="journey-itinerary-title">Day-by-Day Itinerary</h2>
              <p>Every day follows the same practical structure. Exact visits and timings are adjusted around your interests, travel dates and local conditions.</p>
            </div>
            <div className={styles.dayList}>
              {journey.days.map((day) => <TourDay day={day} key={day.day} />)}
            </div>
            <p className={styles.proposalNotice}>Accommodation, meals and final inclusions will be clearly confirmed in your personal proposal before booking.</p>
          </section>

          <section className={styles.suitable} aria-labelledby="journey-suitable-title">
            <div className={styles.sectionTitle}>
              <span>Good to know</span>
              <h2 id="journey-suitable-title">Is This Journey for You?</h2>
            </div>
            <BulletList items={journey.suitable} />
            {journey.considerations.length > 0 ? (
              <div className={styles.considerations}>
                <h3>Practical Considerations</h3>
                <BulletList items={journey.considerations} />
              </div>
            ) : null}
          </section>

          <section className={styles.inclusions} aria-label="Tour inclusions and exclusions">
            <div><h2>Included</h2><BulletList items={journey.included} /></div>
            <div><h2>Not Included</h2><BulletList items={journey.excluded} /></div>
          </section>

          <section className={styles.conditions} aria-labelledby="journey-conditions-title">
            <div className={styles.sectionTitle}>
              <span>Before booking</span>
              <h2 id="journey-conditions-title">Booking Conditions</h2>
            </div>
            <ol>
              {journey.conditions.map((condition, index) => (
                <li key={condition}><span>{String(index + 1).padStart(2, "0")}</span><p>{condition}</p></li>
              ))}
            </ol>
          </section>
        </div>

        <aside className={styles.sidebar} aria-label="Journey enquiry">
          <div className={styles.inquiryCard}>
            <span className={styles.cardEyebrow}>{journey.inquiryEyebrow}</span>
            <h2>Plan This Private Journey</h2>
            <ul>
              {journey.inquiryFacts.map((fact) => (
                <li key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></li>
              ))}
            </ul>
            <p>{journey.inquiryPromise}</p>
            <Link className={styles.primaryButton} href={journey.primaryHref}>{journey.finalCta.primaryLabel}</Link>
            <Link className={styles.cardLink} href={journey.questionHref}>{journey.finalCta.secondaryLabel}</Link>
          </div>
        </aside>
      </div>

      <section className={styles.finalCta} aria-labelledby="journey-cta-title">
        <div className={styles.container}>
          <div>
            <span>{journey.finalCta.eyebrow}</span>
            <h2 id="journey-cta-title">{journey.finalCta.title}</h2>
            <p>{journey.finalCta.body}</p>
          </div>
          <div className={styles.finalActions}>
            <Link className={styles.primaryButton} href={journey.primaryHref}>{journey.finalCta.primaryLabel}</Link>
            <Link className={styles.finalTextLink} href={journey.questionHref}>{journey.finalCta.secondaryLabel}</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
