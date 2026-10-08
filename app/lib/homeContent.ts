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

export type HomeSectionImage = {
  src: string;
  alt: string;
  focalPoint?: "" | "center" | "top" | "bottom" | "left" | "right";
};

export function getHomeSectionImages(): Record<"introduction" | "inquiry" | "walkBanner" | "chloe" | "oldRoads" | "southGreen", HomeSectionImage> {
  return { introduction: home.introduction, inquiry: home.inquiry, walkBanner: home.walkBanner, chloe: home.chloe, oldRoads: home.oldRoads, southGreen: home.southGreen } as Record<"introduction" | "inquiry" | "walkBanner" | "chloe" | "oldRoads" | "southGreen", HomeSectionImage>;
}

export function homeImagePosition(image: HomeSectionImage) {
  const positions = { center: "50% 50%", top: "50% 0%", bottom: "50% 100%", left: "0% 50%", right: "100% 50%" };
  return image.focalPoint ? positions[image.focalPoint] : undefined;
}
