# Yunnan Unfolded

Phase 1 of the official website for Yunnan Unfolded: a boutique, locally rooted travel brand creating thoughtful journeys through Yunnan, China.

## Included in Phase 1

- Responsive editorial homepage
- Accessible desktop and mobile navigation
- Reusable footer, links, buttons and content cards
- Structured local content ready for a future Sanity migration
- Placeholder routes for Journeys, Walk Yunnan, Travel Guides and About
- Responsive detailed trip planner and homepage quick enquiry
- Enquiry delivery through a dedicated Cloudflare Worker and Resend
- SEO metadata, `robots.txt` and sitemap foundations
- GitHub Pages static build configuration

Booking, payments, Sanity and analytics are intentionally deferred.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

The two enquiry forms send to the public Worker endpoint configured as `NEXT_PUBLIC_ENQUIRY_API_URL`. The Worker and its deployment instructions live in `cloudflare/enquiry-worker`; Resend credentials remain in Cloudflare and are never included in the static site.

## Production checks

```bash
pnpm typecheck
pnpm lint
pnpm build:pages:project
pnpm verify:pages:project
pnpm build:pages:domain
pnpm verify:pages:domain
```

## Static deployment modes

The static site has two explicit build targets:

- `github-project` keeps the current `/yunnan-unfolded` base path for the existing GitHub Pages project URL.
- `custom-domain` exports the same site at the root path for `https://yunnanunfolded.com`.

`scripts/build-site.mjs` selects the target through `SITE_DEPLOYMENT_MODE`. `next.config.ts` then injects the matching public base path and origin for shared asset and SEO helpers. The production Pages workflow continues to build `github-project` until the custom-domain cutover is explicitly authorized.

## Content and assets

Homepage journey and guide content is stored in `app/data/siteContent.ts`. The Phase 1 photography is provisional and uses replaceable remote image URLs. Replace these with approved, locally optimized brand photography before final launch.

The temporary logo treatment is isolated in `app/components/Header.tsx` and `app/globals.css` so it can be replaced with the final brand mark later.
