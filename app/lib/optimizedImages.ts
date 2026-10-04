// These derivatives preserve the original crop and dimensions. Unlisted CMS
// images continue to use their original source.
export function optimizedHeroSource(src: string) {
  return src === "/images/journeys/罗古箐/Codex-图像-2026年9月2日-23_06_03.png"
    ? "/images/optimized/luoguqing-hero-1086.webp"
    : src;
}
