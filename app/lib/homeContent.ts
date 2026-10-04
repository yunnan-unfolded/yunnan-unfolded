import home from "../../content/home/home.json";

export type HomeHeroSlide = {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  place: string;
};

export function getHomeHeroSlides(): HomeHeroSlide[] {
  return [home.first, home.second, home.third];
}
