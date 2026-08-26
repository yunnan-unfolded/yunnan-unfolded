import Image from "next/image";
import type { CSSProperties } from "react";
import type { JourneyDay, JourneyImage } from "../../data/journeys";
import { assetPath } from "../../lib/sitePaths";
import styles from "./tour-product.module.css";

export function ProductImage({
  image,
  className = "",
  sizes,
}: {
  image: JourneyImage;
  className?: string;
  sizes: string;
}) {
  const style = image.position ? ({ "--image-position": image.position } as CSSProperties) : undefined;
  return (
    <figure className={className} style={style}>
      <Image src={assetPath(image.src)} alt={image.alt} width={image.width} height={image.height} sizes={sizes} />
    </figure>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return <ul className={styles.bulletList}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function TourDay({ day, imageOnLeft }: { day: JourneyDay; imageOnLeft: boolean }) {
  const images = day.images ?? [];
  return (
    <article className={styles.day} data-image-side={imageOnLeft ? "left" : "right"} id={`journey-day-${day.day}`}>
      <header className={styles.dayHeader}>
        <div className={styles.dayNumber}>Day {day.day}</div>
        <div className={styles.dayHeading}>
          <h3>{day.title}</h3>
          <p>{day.subtitle}</p>
          <dl className={styles.daySummary}>
            <div><dt>Route</dt><dd>{day.route}</dd></div>
            {day.drive ? <div><dt>Drive Time</dt><dd>{day.drive}</dd></div> : null}
            <div><dt>Overnight</dt><dd>{day.overnight}</dd></div>
          </dl>
        </div>
      </header>

      <div className={[styles.dayBody, images.length === 0 ? styles.dayBodyNoImage : ""].join(" ")}>
        {images.length > 0 ? (
          <div className={styles.dayImages} data-count={images.length}>
            {images.map((image) => (
              <ProductImage image={image} key={image.src} sizes="(max-width: 760px) 100vw, 340px" />
            ))}
          </div>
        ) : null}

        <div className={styles.dayContent}>
          <div className={styles.dayDescription}>
            {day.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          {day.options && day.options.length > 0 ? (
            <div className={styles.optionGrid} aria-label={`Custom choices for day ${day.day}`}>
              {day.options.map((option) => (
                <section key={option.title}>
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                  <BulletList items={option.points} />
                </section>
              ))}
            </div>
          ) : null}

          <div className={styles.experiences}>
            <h4>Today’s Experiences</h4>
            <BulletList items={day.experiences} />
          </div>

          {day.note ? (
            <dl className={styles.dayMeta}>
              <div><dt>Practical Note</dt><dd>{day.note}</dd></div>
            </dl>
          ) : null}
        </div>
      </div>
    </article>
  );
}
