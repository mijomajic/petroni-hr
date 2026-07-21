# Petroni

Production website, camper-booking platform, webshop and administration panel for Petroni. The application is built with SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, Supabase and Vercel.

## Requirements

- Node.js 22 or newer
- npm
- A Supabase project
- A Vercel project for production deployment

## Local setup

```bash
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Populate `.env` with local or development credentials; never commit that file.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Server-only Supabase service-role key |
| `PUBLIC_SITE_URL` | Canonical public website origin |
| `PUBLIC_BOXNOW_PARTNER_ID` | Optional BoxNow public widget identifier |
| `CORVUSPAY_STORE_ID` | Server-only CorvusPay store identifier |
| `CORVUSPAY_SECRET_KEY` | Server-only CorvusPay signing key |
| `CORVUSPAY_ENV` | `test` or `production` |
| `RESEND_API_KEY` | Server-only Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address used for transactional mail |

Keep server-only values in local `.env` and encrypted Vercel environment variables. `.env.example` contains names and safe placeholders only.

## Verification

Run these checks before deployment:

```bash
npm test
npm run test:pricing
npm run test:checkout
npm run test:corvuspay
npm run test:seo
npm run check
npm run build
```

`npm test` runs the complete regression suite. `npm run check` performs Svelte and TypeScript diagnostics. The project does not maintain a separate ESLint configuration.

## Database

Supabase migrations are stored in `supabase/migrations/` and must be applied in numeric order. Never edit an already-applied production migration; add a new idempotent migration instead.

Business configuration such as seasons, prices, fees, delivery rules, featured brands and editable page content lives in Supabase and is managed through `/admin`.

## Deployment

The production application is deployed by Vercel from the `main` branch. Configure all required environment variables for the Production environment before promoting a deployment. CorvusPay production credentials and callback URLs must match the final canonical domain.

Current pre-domain production URL: `https://petroni-hr.vercel.app`.

## Maintenance

- `src/` contains application and server code.
- `static/` contains production assets served directly by the application.
- `supabase/migrations/` is the authoritative database change history.
- `scripts/optimize-vehicle-images.mjs` and `scripts/vehicle-image-manifest.json` maintain the vehicle image library.
- Automated `*.test.ts` files are retained as regression coverage and should run before release.
