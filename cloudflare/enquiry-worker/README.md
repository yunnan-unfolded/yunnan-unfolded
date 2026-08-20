# Yunnan Unfolded enquiry Worker

This Worker exposes `POST /enquiries` and sends validated homepage and detailed trip enquiries through Resend. `OPTIONS /enquiries` handles browser CORS preflight requests.

The verified GitHub Pages site is `https://yunnan-unfolded.github.io/yunnan-unfolded/`, whose browser origin is `https://yunnan-unfolded.github.io`. The allowlist also contains the future apex and `www` domains plus the local preview origins currently used by the project. CORS never uses `*`.

## Configure and deploy

1. Install this directory’s dependencies with `pnpm install --ignore-workspace`.
2. Authenticate Wrangler with the Cloudflare account that will own the Worker.
3. Run `pnpm run secret:resend` and enter the Resend API key when Wrangler prompts. Never place the key in this repository or in `wrangler.jsonc`.
4. Run `pnpm run deploy`.
5. Copy the exact deployed Worker URL, append `/enquiries`, and save that full public URL as the GitHub Actions repository variable `NEXT_PUBLIC_ENQUIRY_API_URL`.
6. Re-run the GitHub Pages deployment so both static forms are built with the Worker endpoint.

The non-secret sender, recipient and allowed origins are declared in `wrangler.jsonc`. Update the allowlist when the site’s public origin changes.
Local Wrangler secret files (`.dev.vars*`) are ignored by Git.

## Local checks

Run `pnpm run check` for Worker TypeScript validation and `pnpm run dev` for a local Worker. For local site testing, set `NEXT_PUBLIC_ENQUIRY_API_URL` to the exact local Wrangler `/enquiries` URL before starting Next.js.
