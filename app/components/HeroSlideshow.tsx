import Image from "next/image";
import { assetPath } from "../lib/sitePaths";

const slides = [
  {
    desktopSrc: "/images/hero/jiuzihai-panorama.jpg",
    mobileSrc: "/images/hero/jiuzihai-aerial.jpg",
    alt: "Alpine lakes and a lone hiker at Jiuzihai in Yunnan",
    place: "Jiuzihai · Yunnan",
  },
  {
    desktopSrc: "/images/hero/laoyao-mountain.jpg",
    alt: "Clouds drifting over the mountain meadows of Laoyao Mountain in Yunnan",
    place: "Laoyao Mountain · Yunnan",
  },
  {
    desktopSrc:
      "https://images.pexels.com/photos/1060267/pexels-photo-1060267.jpeg?auto=compress&cs=tinysrgb&w=2400",
    alt: "Snow-covered mountain peaks in Diqing, northwest Yunnan",
    place: "Diqing · Northwest Yunnan",
  },
];

export function HeroSlideshow() {
  return (
    <>
      <div className="hero__slideshow" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`hero__slide hero__slide--${index + 1}`}
            key={slide.desktopSrc}
          >
            <Image
              className={`hero__image${slide.mobileSrc ? " hero__image--desktop" : ""}`}
              src={assetPath(slide.desktopSrc)}
              alt=""
              fill
              sizes="100vw"
              priority={index === 0}
            />
            {slide.mobileSrc ? (
              <Image
                className="hero__image hero__image--mobile"
                src={assetPath(slide.mobileSrc)}
                alt=""
                fill
                sizes="100vw"
                priority={index === 0}
              />
            ) : null}
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
