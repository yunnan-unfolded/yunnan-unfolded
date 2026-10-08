import Image from "next/image";
import { getHomeHeroSlides } from "../lib/homeContent";
import { assetPath } from "../lib/sitePaths";

export function HeroSlideshow() {
  const slides = getHomeHeroSlides();
  return (
    <>
      <div className="hero__slideshow" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`hero__slide hero__slide--${index + 1}`}
            key={index}
          >
            {slide.mobileSrc ? (
              <picture style={{ position: "absolute", inset: 0 }}>
                <source
                  media="(max-width: 760px)"
                  srcSet={assetPath(slide.mobileSrc)}
                  sizes="100vw"
                />
                <Image
                  className="hero__image"
                  src={assetPath(slide.desktopSrc)}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </picture>
            ) : (
              <Image
                className="hero__image"
                src={assetPath(slide.desktopSrc)}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            )}
          </div>
        ))}
      </div>

      <div
        className="hero__carousel-controls"
        aria-hidden="true"
      >
        <span className="hero__counter" aria-hidden="true">
          01
          <span />
          {String(slides.length).padStart(2, "0")}
        </span>
        <div className="hero__dots">
          {slides.map((slide, index) => (
            <span
              className={`hero__dot hero__dot--${index + 1}`}
              key={slide.place}
            />
          ))}
        </div>
      </div>

      <div className="hero__places" aria-hidden="true">
        {slides.map((slide, index) => (
          <span
            className={`hero__place hero__place--${index + 1}`}
            key={slide.place}
          >
            {slide.place}
          </span>
        ))}
      </div>
      <span className="sr-only">
        Yunnan photography: {slides.map((slide) => slide.alt).join("; ")}
      </span>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hero__slide,
          .hero__image,
          .hero__dot,
          .hero__place,
          .hero__scroll span {
            animation: none !important;
          }

          .hero__slide {
            opacity: 0 !important;
          }

          .hero__slide--1 {
            opacity: 1 !important;
          }

          .hero__place {
            opacity: 0 !important;
          }

          .hero__place--1 {
            opacity: .72 !important;
          }

          .hero__dot {
            background: rgba(255, 255, 255, .35) !important;
            box-shadow: none !important;
          }

          .hero__dot--1 {
            background: white !important;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, .14) !important;
          }
        }
      `}</style>
    </>
  );
}
