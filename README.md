# Yunnan Unfolded

Phase 1 of the official website for Yunnan Unfolded: a boutique, locally rooted travel brand creating thoughtful journeys through Yunnan, China.

## Included in Phase 1

- Responsive editorial homepage
- Accessible desktop and mobile navigation
- Reusable footer, links, buttons and content cards
- Structured local content ready for a future Sanity migration
- Placeholder routes for Journeys, Walk Yunnan, Travel Guides, About and Plan My Trip
- SEO metadata, `robots.txt` and sitemap foundations
- Cloudflare Sites-ready build configuration

Booking, payments, inquiry form processing, Sanity, tawk.to, analytics and email integrations are intentionally deferred.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Production checks

```bash
npm run build
npm run lint
npm test
```

## Content and assets

Homepage journey and guide content is stored in `app/data/siteContent.ts`. The Phase 1 photography is provisional and uses replaceable remote image URLs. Replace these with approved, locally optimized brand photography before final launch.

The temporary logo treatment is isolated in `app/components/Header.tsx` and `app/globals.css` so it can be replaced with the final brand mark later.
