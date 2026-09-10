import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Journey } from "../../types/journey";
import type { WalkDetail } from "../../lib/walkAdapter";
import type { WalkImage, WalkRouteOption } from "../../types/walk";
import { assetPath, routePath } from "../../lib/sitePaths";
import { Footer } from "../Footer";
import { Header } from "../Header";
import styles from "./walk-detail.module.css";

const widthClasses = {
  standard: styles.mediaStandard,
  large: styles.mediaLarge,
  "full-bleed": styles.mediaFull,
  half: styles.mediaHalf,
} as const;

const ratioClasses = {
  original: styles.ratioOriginal,
  "landscape-16-9": styles.ratioLandscapeWide,
  "landscape-4-3": styles.ratioLandscape,
  "portrait-3-4": styles.ratioPortrait,
  "portrait-9-16": styles.ratioPortraitTall,
} as const;

const alignmentClasses = {
  center: styles.alignCenter,
  left: styles.alignLeft,
  right: styles.alignRight,
} as const;

const focalPoints = {
  center: "center center",
  top: "center top",
  bottom: "center bottom",
  left: "left center",
  right: "right center",
} as const;

const routeTypeLabels = {
  "out-and-back": "Out and back",
  loop: "Loop",
  "point-to-point": "Point to point",
} as const;

const riskLabels = {
  lower: "Lower risk",
  moderate: "Moderate risk",
  high: "Higher risk",
} as const;

const riskClasses = {
  lower: styles.riskLower,
  moderate: styles.riskModerate,
  high: styles.riskHigh,
} as const;

function metric(value: number | undefined, suffix: string) {
  return value === undefined ? undefined : `${value.toLocaleString("en-US")} ${suffix}`;
}

function RouteOptionCard({ option }: { option: WalkRouteOption }) {
  const facts = [
    ["Distance", metric(option.distanceKm, "km")],
    option.duration ? ["Walking time", option.duration] : null,
    ["Route type", routeTypeLabels[option.routeType]],
    ["Start elevation", metric(option.startElevationM, "m")],
    ["Highest point", metric(option.highestElevationM, "m")],
    ["Elevation gain", metric(option.elevationGainM, "m")],
  ].filter((fact): fact is string[] => Boolean(fact?.[1]));

  return (
    <article className={`${styles.routeOption} ${option.riskLevel === "high" ? styles.routeOptionHigh : ""}`}>
      <div className={styles.routeOptionHeading}>
        <div>
          <p className={styles.routeOptionLabel}>Route option</p>
          <h3>{option.title}</h3>
        </div>
        <span className={`${styles.riskBadge} ${riskClasses[option.riskLevel]}`}>
          {riskLabels[option.riskLevel]}
        </span>
      </div>
      {option.summary ? <p className={styles.routeOptionSummary}>{option.summary}</p> : null}
      <dl className={styles.routeOptionFacts}>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {option.terrain ? (
        <div className={styles.routeOptionDetail}>
          <h4>Trail surface</h4>
          <p>{option.terrain}</p>
        </div>
      ) : null}
      {option.suitability ? (
        <div className={styles.routeOptionDetail}>
          <h4>Who it suits</h4>
          <p>{option.suitability}</p>
        </div>
      ) : null}
      {option.riskNotes.length > 0 ? (
        <div className={styles.routeWarnings}>
          <h4>What to know</h4>
          <ul>{option.riskNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
      ) : null}
    </article>
  );
}

function SectionHeading({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className={styles.sectionHeading}>
      <span>{number}</span>
      <h2>{children}</h2>
    </div>
  );
}

function WalkImageFigure({ image, paired = false }: { image: WalkImage; paired?: boolean }) {
  const classes = [
    styles.mediaItem,
    paired ? styles.mediaPaired : widthClasses[image.displayWidth],
    alignmentClasses[image.alignment],
  ].join(" ");
  const width = image.width ?? 1600;
  const height = image.height ?? 1067;
  const sizes = paired || image.displayWidth === "half"
    ? "(max-width: 700px) 92vw, 42vw"
    : image.displayWidth === "standard"
      ? "(max-width: 700px) 92vw, 62vw"
      : "(max-width: 700px) 92vw, 78vw";

  return (
    <figure className={classes}>
      {image.displayRatio === "original" ? (
        <Image
          className={styles.originalImage}
          src={assetPath(image.src)}
          alt={image.alt}
          width={width}
          height={height}
          sizes={sizes}
          loading="lazy"
          style={{ objectPosition: focalPoints[image.focalPoint] }}
        />
      ) : (
        <div className={`${styles.ratioFrame} ${ratioClasses[image.displayRatio]}`}>
          <Image
            src={assetPath(image.src)}
            alt={image.alt}
            fill
            sizes={sizes}
            loading="lazy"
            style={{ objectPosition: focalPoints[image.focalPoint] }}
          />
        </div>
      )}
    </figure>
  );
}

function WalkMediaSequence({ images }: { images: WalkImage[] }) {
  const items: ReactNode[] = [];
  let index = 0;

  while (index < images.length) {
    const image = images[index];
    const nextImage = images[index + 1];
    if (image.displayWidth === "half" && nextImage?.displayWidth === "half") {
      items.push(
        <div className={styles.halfPair} key={`${image.src}-${nextImage.src}`}>
          <WalkImageFigure image={image} paired />
          <WalkImageFigure image={nextImage} paired />
        </div>,
      );
      index += 2;
      continue;
    }

    items.push(<WalkImageFigure image={image} key={`${image.src}-${index}`} />);
    index += 1;
  }

  return <div className={styles.mediaSequence}>{items}</div>;
}

export function WalkDetailPage({
  walk,
  relatedJourney,
  isLocalDraft,
}: {
  walk: WalkDetail;
  relatedJourney?: Journey;
  isLocalDraft: boolean;
}) {
  const hasRouteOptions = walk.routeOptions.length > 0;
  const distances = walk.routeOptions
    .map((option) => option.distanceKm)
    .filter((value): value is number => typeof value === "number");
  const elevations = walk.routeOptions
    .flatMap((option) => [option.startElevationM, option.highestElevationM])
    .filter((value): value is number => typeof value === "number");
  const distanceSummary = distances.length > 0 ? `${distances.join(" / ")} km` : undefined;
  const elevationSummary = elevations.length > 0
    ? `${Math.min(...elevations).toLocaleString("en-US")}–${Math.max(...elevations).toLocaleString("en-US")} m`
    : undefined;
  const facts: string[][] = hasRouteOptions ? [
    ["Location", walk.region],
    distanceSummary ? ["Route Options", distanceSummary] : ["Difficulty", walk.difficulty],
    elevationSummary ? ["Elevation Range", elevationSummary] : ["Difficulty", walk.difficulty],
    ["Best Season", walk.recommendedSeasons],
    ["Local Guide", walk.routeOptions.some((option) => option.riskLevel === "high") ? "Strongly advised for the full traverse" : "Available on request"],
  ] : [
    ["Difficulty", walk.difficulty],
    ...(walk.approximateDuration ? [["Walking Time", walk.approximateDuration]] : []),
    ["Best Season", walk.recommendedSeasons],
    ["Guided Walk", "With a trusted local guide"],
  ];
  let sectionIndex = 1;
  const nextSectionNumber = () => String(sectionIndex++).padStart(2, "0");
  const introNumber = nextSectionNumber();
  const optionsNumber = hasRouteOptions ? nextSectionNumber() : undefined;
  const landscapesNumber = nextSectionNumber();
  const locationNumber = walk.location ? nextSectionNumber() : undefined;
  const seasonNumber = walk.seasonNote ? nextSectionNumber() : undefined;
  const beforeNumber = walk.preparationNotes.length > 0 ? nextSectionNumber() : undefined;
  const relatedNumber = relatedJourney ? nextSectionNumber() : undefined;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Header />
        <div className={`${styles.heroGrid} shell`}>
          <div className={styles.heroMedia}>
            <Image
              src={assetPath(walk.hero.src)}
              alt={walk.hero.alt}
              fill
              sizes="(max-width: 700px) 100vw, 60vw"
              priority
            />
          </div>
          <div className={styles.heroCopy}>
            {isLocalDraft ? <p className={styles.draftLabel}>Local draft preview</p> : null}
            <p className={styles.eyebrow}>Walk Yunnan · {walk.region}</p>
            <h1>{walk.title}</h1>
            <p className={styles.summary}>{walk.summary}</p>
            <a className={styles.textLink} href="#the-walk">Discover the walk <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <dl className={`${styles.facts} shell`}>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <main>
        <section className={`${styles.intro} shell`} id="the-walk">
          <SectionHeading number={introNumber}>The Walk</SectionHeading>
          <div className={styles.introCopy}>
            {walk.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>

        {hasRouteOptions ? (
          <section className={styles.routeChoices}>
            <div className={`${styles.routeChoicesInner} shell`}>
              <SectionHeading number={optionsNumber ?? "02"}>Choose Your Route</SectionHeading>
              <p className={styles.routeChoicesIntro}>Luoguqing can be approached at very different levels. Compare the distance, elevation and trail conditions before deciding which version fits your experience and comfort.</p>
              <div className={styles.routeOptionGrid}>
                {walk.routeOptions.map((option) => <RouteOptionCard key={option.title} option={option} />)}
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.routeSection}>
          <div className={`${styles.routeInner} shell`}>
            <SectionHeading number={landscapesNumber}>{hasRouteOptions ? "Landscapes Along the Way" : "Route at a Glance"}</SectionHeading>
            <div className={styles.stages}>
              {walk.stages.map((stage, index) => (
                <article className={styles.stage} key={`${stage.title}-${index}`}>
                  <div className={styles.stageCopy}>
                    <p className={styles.stageNumber}>Stage {String(index + 1).padStart(2, "0")}</p>
                    <h3>{stage.title}</h3>
                    <p>{stage.body}</p>
                  </div>
                  {stage.images.length > 0 ? <WalkMediaSequence images={stage.images} /> : null}
                </article>
              ))}
            </div>
            {walk.gallery.length > 0 ? <WalkMediaSequence images={walk.gallery} /> : null}
          </div>
        </section>

        {walk.location ? (
          <section className={`${styles.location} shell`}>
            <SectionHeading number={locationNumber ?? "04"}>Location &amp; Access</SectionHeading>
            <div className={styles.locationCopy}>
              <h3>{walk.location}</h3>
              {walk.accessNote ? <p>{walk.accessNote}</p> : null}
              {walk.signalNote ? <aside><strong>Signal note</strong><p>{walk.signalNote}</p></aside> : null}
            </div>
          </section>
        ) : null}

        {walk.seasonNote ? (
          <section className={`${styles.season} shell`}>
            <SectionHeading number={seasonNumber ?? "03"}>When to Go</SectionHeading>
            <div className={styles.seasonNote}>
              <p>{walk.seasonNote}</p>
            </div>
          </section>
        ) : null}

        {walk.preparationNotes.length > 0 ? (
          <section className={styles.before}>
            <div className={`${styles.beforeInner} shell`}>
              <SectionHeading number={beforeNumber ?? "04"}>Before You Walk</SectionHeading>
              <ul>
                {walk.preparationNotes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
          </section>
        ) : null}

        {relatedJourney ? (
          <section className={`${styles.related} shell`}>
            <SectionHeading number={relatedNumber ?? "05"}>Related Journey</SectionHeading>
            <div className={styles.relatedCard}>
              <div>
                <p className={styles.relatedEyebrow}>Private Journey · {relatedJourney.duration.label}</p>
                <h3>{relatedJourney.title}</h3>
                <p>{relatedJourney.listingDescription}</p>
              </div>
              <Link className={styles.relatedLink} href={routePath(`/journeys/${relatedJourney.slug}`)}>
                View the journey <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </section>
        ) : null}

        <section className={styles.enquiry}>
          <div className={`${styles.enquiryInner} shell`}>
            <p className={styles.enquiryEyebrow}>Plan with local knowledge</p>
            <h2>Shape this walk around your journey.</h2>
            <p>Tell us when you plan to travel, how much walking feels comfortable and what draws you to Luoguqing. Our Yunnan-based team will reply personally and shape the walk around the season and current conditions.</p>
            <div className={styles.enquiryActions}>
              <Link className="button button--gold" href={walk.primaryHref}>Plan this walk</Link>
              <Link className={styles.enquiryLink} href={walk.questionHref}>Ask a question <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
