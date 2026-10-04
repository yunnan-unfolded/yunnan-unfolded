# Phase 2.7A SEO and performance audit

Audit completed locally on 4 October 2026. Baseline: `9163205b9230026452412bb87285f21809cc057f`. This report was prepared before the authorised local commit. Nothing has been published.

## Search readiness

The live root robots.txt and sitemap.xml return 200. The Sitemap uses 14 unique absolute HTTPS URLs: Home, Journeys, Walk Yunnan, Travel Guides, About, Plan My Trip, one published Journey, one published Walk and six published Travel Guides. All return 200. Canonicals are unique and self-referencing; titles and descriptions are present and unique; each page has one H1. Pages permit indexing through the normal index/follow default and do not emit noindex. No Sitemap drafts, local URLs, duplicate URLs, broken internal links or invalid anchors were found.

53 distinct image URLs were checked using real Chrome: same-origin HEAD responses succeeded and external images loaded. Nondecorative image descriptions are English. Empty alts on background/decorative photography and the labelled logo link were not replaced with speculative descriptions.

JSON-LD parses successfully. Organization, AboutPage, CollectionPage, Article, TouristTrip and BreadcrumbList data do not show conflicting identities or invented ratings/prices. Publicly loaded HTML, scripts and styles were scanned (374 resources); no draft markers, credential-shaped tokens, personal test data, Windows user paths or LAN URLs were found.

Search readiness does not establish actual Google indexing. Search Console could not be accessed: the current-browser tool failed to initialize. Ownership, Sitemap submission/read status, indexed-page counts, exclusion reasons, Core Web Vitals, Manual Actions and Security Issues remain unverified. No settings were changed.

## Field data

No field data was obtained. The official PageSpeed Insights attempt returned 429 from its analysis backend. Whether the site has enough CrUX samples is unknown; this is not evidence that samples are insufficient. No p75 LCP, INP or CLS pass/fail conclusion is possible.

Official good thresholds are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile: https://web.dev/articles/vitals

## Lab data: live site

One cold-cache sample per page template in Chrome, mobile 390px/DPR2, 150ms latency, 1.6Mbps download, CPU 4x slowdown. PerformanceObserver/CDP measurements, not Lighthouse scores and not real-user Core Web Vitals.

| Template | LCP | CLS | Blocking time |
| --- | ---: | ---: | ---: |
| Home | 7.86s | 0.0045 | 255ms |
| Journey detail | 4.66s | 0 | 260ms |
| Walk detail | 19.85s | 0.0014 | 255ms |
| Travel Guide detail | 2.52s | 0.0014 | 267ms |
| About | 2.04s | 0 | 259ms |
| Plan My Trip | 3.68s | 0.0015 | 323ms |

Unthrottled desktop samples: Home LCP 1.19s / CLS 0.0083; Plan My Trip LCP 1.11s / CLS 0.0177. Recorded click-event durations were 48–80ms on mobile. These few interactions cannot establish INP.

The first-screen images were LCP elements for Home, Journey, Walk, Guide and Plan My Trip; About's introductory text was LCP. Live JS encoded transfer was approximately 176–183KB per template. JS responses used gzip and max-age=600. Third-party resource hosts included fonts.googleapis.com, images.pexels.com and assets.tina.io. No tracking was added. Non-hero images generally use lazy loading, and observed layout shifts were small. Limited interaction coverage does not establish that otherwise unused code can be removed safely.

## Prioritized findings

- **P0:** No confirmed public-site blocker in this audit. Google indexing/security status is unknown without Search Console.
- **P1:** Home downloads both CSS-hidden desktop and mobile priority images (718KB combined). The Walk LCP image is a 3.45MB PNG. The mobile Plan image is a 330KB desktop JPEG.
- **P2:** Walk directory and Plan My Trip lack OG images; Walk Twitter metadata inherits Home copy. Playfair Display is requested again through an external CSS import despite existing Next self-hosting. CMS-hosted Journey hero delivery, static responsive resources for other large images, cache policy and 255–323ms lab blocking time warrant future focused investigation; no architectural rewrite was attempted.

## Local changes

- Home first slide uses one picture/image with viewport-selected CMS sources. Mobile no longer requests the desktop JPEG. All three slides are read from the new Tina Home configuration rather than constants in the renderer. There is no fixed derivative mapping for Home; same-name overwrites cannot remain bound to an old derivative.
- Added two derivatives of existing confirmed images. Originals and existing Journey/Walk/Guide content files are unchanged. Home uses its configured original mobile image (365KB) or desktop image (353KB), instead of downloading both (718KB). Mobile Plan image is 79KB (vs 330KB). Walk image preserves its original 1086×1448 dimensions and crop, is 599KB (vs 3.45MB PNG), and only the exact known source is mapped; unrelated CMS sources pass through unchanged. The three initial fixed Home derivatives were removed before commit.
- Removed duplicate external font import and CSS variable override; headings still use Playfair Display from existing next/font self-hosting.
- Added page-specific OG/Twitter images and corrected inherited Walk Twitter copy using existing page text.
- Updated two stale tests referencing the generic placeholder route deleted on the baseline; retained draft-isolation checks. Added actual browser responsive-request and rendered-metadata regressions.

Changed files (19):

- app/components/HeroSlideshow.tsx
- app/components/walks/WalkDetailPage.tsx
- app/globals.css
- app/plan-my-trip/page.tsx
- app/walk-yunnan/page.tsx
- app/lib/optimizedImages.ts
- tests/seo-performance.test.mjs
- tests/walk-content.test.mjs
- tests/travel-guide-content.test.mjs
- public/images/optimized/laoyao-mountain-960.webp
- public/images/optimized/luoguqing-hero-1086.webp

- app/lib/homeContent.ts
- content/home/home.json
- tina/config.ts
- tina/homeCollection.ts
- tina/fields/HomeImageField.tsx
- tina/tina-lock.json
- tests/home-hero-cms.browser.test.mjs
- docs/phase-2-7a-seo-performance-audit.md

## Verification and limits

TypeScript, ESLint, relevant Journey/Walk/Guide/enquiry tests, browser regressions, the initial production build and one rebuild after the Home CMS correction, custom-domain static export verification and git diff --check pass after addressing the stale baseline tests. next-env.d.ts has no final diff. tina-lock.json now includes Home; all three existing collection schemas are identical to the baseline.

18 rendered checks cover six templates at 1440px, 390px and 430px. Full-page screenshots were inspected: one H1, no horizontal overflow, broken images, obvious stretching or obscured text. English form Start/Continue/Back, retained values, required/invalid email messages, every FAQ, mobile menu and source context from Journey/Walk/Guide were clicked successfully. POST requests were intercepted; no emails were sent. Browser emulation is not a new physical-phone acceptance test. Current-session automatic translation was not tested in this phase.

Initial prototype local retest (the Home fixed-derivative implementation was subsequently removed, so its LCP is not a measurement of the final Home): Home LCP 6.53s, Walk 7.60s, Plan My Trip 2.58s; CLS 0 in these samples. These use an uncompressed local server rather than the live gzip/CDN server, and the Home sample overlapped other browser checks; do not treat them as controlled before/after estimates of production improvement or as passing field metrics. Remaining LCP work is not hidden by a passing build.

The Windows export stores some Next RSC segment files at nested paths, while the browser requests dotted paths. This caused local preview prefetch 404s; the live site counterpart had no errors. Only the ignored temporary preview server maps those paths to actual export files. Application routing and deployment workflows were not changed. Interaction tests passed after this preview correction.

All 157 text export files were scanned. Public pages and loaded bundles have no detected drafts, credential-shaped tokens, test data or local addresses/paths. The locally generated Tina admin/index.html contains its local CMS GraphQL address. Thus this local CMS preview export is not directly suitable for deployment; it is not being represented as a fully clean cloud-admin release artifact. No secrets or external configuration were changed.

Preview is running from this worktree on 0.0.0.0:3002. Loopback and LAN requests return 200. The 130 original untracked user files remain untouched. Branch: codex/phase-2-7a-seo-performance-audit. The authorised local commit includes only the 19 intended files. No push, deployment or PR is authorised by this follow-up. Original Plan My Trip preview on 3001 remains running.

## Home image CMS verification, 4 October 2026

The baseline did not have a Home Tina collection: its three slideshow sources were hard-coded in HeroSlideshow. Therefore there was no pre-existing Home field connection to preserve. This was disclosed before adding a narrowly scoped Home image configuration. Page copy, layout and the three existing Journey/Walk/Guide collections were not changed.

Tina now edits content/home/home.json. Each of the three fixed slideshow positions has desktopSrc, optional mobileSrc, English alt and place fields. The renderer reads that JSON and passes its actual field values to the image/picture sources. With no mobileSrc, both viewports use the desktopSrc responsively. With independent fields, each viewport reads its respective field. No code edit is required when choosing another image. Existing image-picker support is retained, with a bound path/HTTPS-address input for already existing images outside the shared media-library root.

Real Chrome UI test against the local Tina editor, not direct JSON writes:

1. Selected an existing Laoyao image through the media picker, clicked Insert and Save. Tina GraphQL succeeded; the 1440px Home preview loaded the saved desktop source, while mobile retained its configured image.
2. Changed the mobile field to an existing Erhai image and clicked Save. Both 390px and 430px loaded that saved mobile source; desktop retained the separate saved desktop source.
3. Cleared the mobile field and saved. Both mobile widths loaded the desktop source. Reloading the editor retained the saved fields.
4. Restored both original source values through the editor and saved. All three widths loaded their original configured sources. The entire parsed Home document equals the pre-test document, including untouched slides and descriptions. Four save mutations returned HTTP 200 without GraphQL errors.

No image was uploaded, downloaded into the repository or generated for this test. Existing approved image files were reused. Test selections were removed from Home configuration. Screenshots and detailed evidence remain ignored under artifacts/home-cms. The reproducible UI regression test is tests/home-hero-cms.browser.test.mjs; it performs temporary local saves and restores in finally, and blocks POSTs outside the local Tina endpoint.

The CMS-backed development preview runs at http://127.0.0.1:3004/ and its editor at http://127.0.0.1:3004/admin/index.html#/collections/edit/home/home. Saving updates this development preview. The production static preview on port 3002 reflects the final rebuilt configuration; future live-site changes still follow the site's existing content-save/build/publish workflow. No external service or deployment was modified.
