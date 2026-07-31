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
| `PETRONI_SUPABASE_PROJECT_REF` | Approved project ref used only by backup tooling |
| `PETRONI_BACKUP_DIR` | Private backup directory outside this repository |
| `PETRONI_BACKUP_PASSPHRASE_FILE` | Mode-600 passphrase file outside this repository |

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

`npm run audit:legacy` regenerates a dated WordPress sitemap/product-SKU audit from the still-live legacy site and local Supabase credentials. `npm run audit:legacy:decisions` writes the complete per-URL decision CSV. After cutover, pipe Vercel JSON logs into `npm run report:404` for the daily 404 summary described in `docs/go-live/legacy-url-audit.md`.

`npm run backup:production` creates the encrypted database/Auth/Storage backup described in `docs/go-live/backup-restore-runbook.md`. `npm run backup:restore-test -- /absolute/backup.tar.gz.enc` restores it into an isolated temporary PostgreSQL instance and writes non-sensitive evidence. Neither command may use a backup directory or passphrase file inside the repository.

## Database

Supabase migrations are stored in `supabase/migrations/` and must be applied in numeric order. Never edit an already-applied production migration; add a new idempotent migration instead.

Business configuration such as seasons, prices, fees, delivery rules, featured brands, editable page content and versioned legal documents lives in Supabase and is managed through `/admin`. Migration `0038` adds protected HR/EN legal drafts, publication history and non-destructive restore; legal approval remains a Petroni/counsel responsibility.

## Deployment

The production application is deployed by Vercel from the `main` branch. Configure all required environment variables for the Production environment before promoting a deployment. CorvusPay production credentials and callback URLs must match the final canonical domain.

Candidate deployment URL: `https://petroni-hr.vercel.app`.

As of 31 July 2026, `petroni.hr` and `www.petroni.hr` are configured as Vercel aliases but public DNS still serves the existing WordPress site. Do not change DNS ad hoc. Follow the ownership gates, DNS steps and rollback procedure in [`docs/go-live/`](docs/go-live/).

## Maintenance

- `src/` contains application and server code.
- `static/` contains production assets served directly by the application.
- `supabase/migrations/` is the authoritative database change history.
- `scripts/optimize-vehicle-images.mjs` and `scripts/vehicle-image-manifest.json` maintain the vehicle image library.
- Automated `*.test.ts` files are retained as regression coverage and should run before release.
- `docs/go-live/` is the authoritative operations set for ownership, hosting, release, DNS cutover, rollback and go-live approval. It intentionally contains no secret values.
