# Phase 2.9 — Site clarity and visitor paths

Local implementation and validation complete; publication remains unauthorised. Branch: `codex/phase-2-9-site-clarity-audit`. Baseline: `31772eae0df867e566a72ff0ff1b899ae16ef8a9`.

## Findings before the change

- The Home hero promised a different side of Yunnan, but did not directly identify Chloe, Kunming or the private tailor-made service.
- Home, About and Plan My Trip repeated introductions about personal pacing, local knowledge and beginning with rough ideas. About spent substantial space explaining the enquiry process rather than the person behind it.
- Enquiry navigation used several labels, including Plan my journey, Plan my Yunnan trip and Plan my walking journey.
- The Old Roads of Yunnan and South into the Green looked like complete Journey cards but led back to the directory. Neither had a detail page.
- Existing fixed side and mobile enquiry buttons duplicated the normal navigation and page calls to action. The mobile bar obscured text near the bottom of the viewport during visual inspection.
- Home had a duplicate `quick-inquiry-title` ID on the background story and form heading.

## Final page responsibilities

| Page | Purpose and final change |
| --- | --- |
| Home | The first screen says “Private journeys through Yunnan” and “Tailor-made trips with Chloe in Kunming”. Explore journeys and Plan My Trip present the two next steps. Shorter introductions and a brief Chloe teaser leave the biography to About. |
| About | Focuses on Chloe’s travel work in Kunming, hiking and reasons for preferring realistic routes. Removed repeated consultation instructions while retaining both photos and the main sections. |
| Plan My Trip | Shorter title and introduction explain the private service and distinguish an enquiry from a booking. Existing next-step process, FAQ, form fields and delivery code remain unchanged. |
| Journeys | Published routes remain the focus. Shortened the directory introduction and final invitation. |
| Walk Yunnan | Emphasises the practical route facts: time, elevation, terrain and risk. Shortened repeated planning copy. |
| Travel Guides | States the actual guide topics and invites visitors to pick the question they have now. Removed the extra hero enquiry link and shortened the final invitation. |
| Navigation/footer | Retained all existing navigation destinations, unified general enquiry labels to Plan My Trip and their route to `/plan-my-trip/`. Footer identifies Chloe and Kunming; About link says Meet Chloe. Removed duplicate floating enquiry bars. |

## Hidden, preserved and untouched

The two unfinished Home Journey cards are hidden by selecting only published Journeys for the homepage. Their existing titles, descriptions, ordering, image fields and source data remain in `app/data/siteContent.ts` and `content/home/home.json`; no detail page was created. The single published homepage Journey uses a simple two-column treatment on desktop and the original stacked card on mobile, avoiding two empty grid columns.

No published Journey, Walk or Travel Guide JSON or body was modified. No homepage image configuration or image file was changed. No form field or submission logic was changed. The Home quick form’s only edit is its link to the full planner. Worker, Resend, DNS and external TinaCloud settings were not changed; no emails were sent.

## Changed files

- `app/page.tsx`
- `app/about/page.tsx`
- `app/plan-my-trip/page.tsx`
- `app/journeys/page.tsx`
- `app/walk-yunnan/page.tsx`
- `app/travel-guides/page.tsx`
- `app/components/Header.tsx`
- `app/components/Footer.tsx`
- `app/components/QuickInquiryForm.tsx`
- `app/components/travel-guides/TravelGuideDetailPage.tsx` — enquiry button label only
- `app/components/walks/WalkDetailPage.tsx` — enquiry button label only
- `app/globals.css` — short Home introduction and single Journey card styling
- `tests/home-example-images-cms.browser.test.mjs` — retained CMS fields are editable while unfinished cards stay hidden
- `tests/home-section-images-cms.browser.test.mjs` — homepage card expectation now includes only the real Journey
- `tests/site-clarity.browser.test.mjs` — real rendered visitor path regression
- `docs/phase-2-9-site-clarity-audit.md`

## Validation and limits

TypeScript, ESLint and 57 related enquiry/Journey/Walk/Guide tests passed. Production static export passed with the local Tina data service active. The default Turbopack attempt rejected the external dependency junction; validation used Next’s supported webpack build without changing tracked build configuration. An initial standalone webpack attempt lacked the Tina data service and failed; the complete local Tina/webpack pipeline then passed. A further build verifies the removal of the fixed enquiry bars found during visual inspection.

The browser regression uses real Chrome at 1440, 390 and 430px, with GET/HEAD only and all other request methods blocked. It checks rendered images, one H1, overflow, hero links, required/invalid-email feedback, start focus, continue/back, every FAQ, mobile menu and referral context from real content links. It never submits an enquiry. An initial test selector incorrectly expected an unnormalised About link; the selector was corrected without changing application routing.

All 14 published pages return HTTP 200 and have one H1. Preview serves the production static output, binds all IPv4 interfaces. The exact current desktop and Wi-Fi addresses are provided in the task response, rather than stored in application code. Physical-phone acceptance and real email delivery are not part of this local check.

Ignored screenshots, build helpers and diagnostic evidence stay under `artifacts/`. Browser regression configuration uses `CLARITY_TEST_BASE_URL`, optional `CLARITY_BROWSER_MODULE` and optional `CLARITY_TEST_WIDTHS`; no preview address is embedded in the test. `next-env.d.ts`, generated Tina lock changes and user files are excluded from the final diff. As of local validation, no commit, push, PR or deployment had been performed.

### Final verification after removing the floating bars

- Complete real-Chrome regression passed: 18 page/viewport checks across 1440, 390 and 430px; 15 unique internal link/anchor targets; start focus, required/invalid email, continue/back, all seven FAQ items, mobile menu click/Escape, and all three content referral paths. No runtime or Console errors, failed images, horizontal overflow or enquiry submissions.
- Final screenshots were reviewed. The floating bars are absent; the homepage service introduction and two visitor paths are visible, and the single real Journey preserves its image aspect ratio.
- Production static export and TypeScript passed after the last application change. Modified-file ESLint and git diff --check passed. The earlier 57 related contract/content tests remain valid; the final application change only removes duplicate navigation links.
- About now has 9 prose paragraphs rather than 17, with consultation instructions moved out of its biography role.
- At the end of local validation, HEAD remained the required baseline; 16 expected files were modified/new and staging was empty. Original workspace retains 130 untracked user files, untouched. The active static preview process listens on all IPv4 interfaces and both loopback and current Wi-Fi access return HTTP 200.

### Local commit authorised (2026-10-11)

The user authorised one local commit containing exactly the 16 listed files, with message `feat: simplify site messaging and visitor paths`. No push, PR, merge or deployment is authorised. Commit preparation verified the file allowlist and absence of preview URLs, machine paths, credential values and test content in application changes. Test inputs stay in the regression code, not site content.
