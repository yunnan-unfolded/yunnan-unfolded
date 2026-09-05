import Image from "next/image";
import type { CSSProperties } from "react";
import type { JourneyDay, JourneyImage } from "../../types/journey";
import { assetPath } from "../../lib/sitePaths";
import { formatJourneyLogistics } from "../../../shared/journeyDefaults";
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
    <figure className={className} data-focal-point={image.focalPoint ?? "center"} data-legacy-aspect={image.legacyAspect} data-ratio={image.displayRatio ?? "landscape"} style={style}>
      <Image src={assetPath(image.src)} alt={image.alt} width={image.width} height={image.height} loading="lazy" sizes={sizes} />
    </figure>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return <ul className={styles.bulletList}>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function TourDay({ day }: { day: JourneyDay }) {
  const images = day.mediaLayout === "text-only" ? [] : day.images ?? [];
  const hasImageGallery = images.length >= 3;
  const effectiveLayout = hasImageGallery
    ? "image-above"
    : day.mediaLayout === "two-images" && images.length < 2 ? "image-above" : day.mediaLayout;
  const effectiveSize = hasImageGallery
    ? "wide"
    : day.mediaLayout === "two-images" && images.length < 2 ? "wide" : day.imageSize;
  return (
    <article className={styles.day} data-image-size={effectiveSize} data-media-layout={effectiveLayout} id={`journey-day-${day.day}`}>
      <header className={styles.dayHeader}>
        <div className={styles.dayNumber}>Day {day.day}</div>
        <div className={styles.dayHeading}>
          <h3>{day.title}</h3>
          {day.subtitle ? <p>{day.subtitle}</p> : null}
          <dl className={styles.daySummary}>
            {day.logistics ? (
              <div className={styles.daySummaryCombined}><dt>Route · Drive · Overnight</dt><dd>{formatJourneyLogistics(day.logistics)}</dd></div>
            ) : (
              <>
                {day.route ? <div><dt>Route</dt><dd>{day.route}</dd></div> : null}
                {day.drive ? <div><dt>Drive Time</dt><dd>{day.drive}</dd></div> : null}
                {day.overnight ? <div><dt>Overnight</dt><dd>{day.overnight}</dd></div> : null}
              </>
            )}
          </dl>
        </div>
      </header>

      <div className={[styles.dayBody, images.length === 0 ? styles.dayBodyNoImage : ""].join(" ")}>
        {images.length > 0 ? (
          <div className={styles.dayImages} data-count={images.length} data-gallery={hasImageGallery ? "true" : undefined}>
            {images.map((image, imageIndex) => (
              <ProductImage image={image} key={`${image.src}-${imageIndex}`} sizes="(max-width: 760px) 100vw, 340px" />
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

          {day.experiences.length > 0 ? (
            <div className={styles.experiences}>
              <h4>Today’s Experiences</h4>
              <BulletList items={day.experiences} />
            </div>
          ) : null}

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
