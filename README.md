# Alderway Campers rental demo

A production-ready camper-rental website, booking-request platform, optional webshop and administration panel. Alderway Campers is the fictional demonstration brand; repeated business identity values and the rental-payment feature flag live in `src/lib/config/business.ts`, while editable operational content can live in Supabase.

The standard rental setup is request-only: customers select a vehicle, dates and extras, review an estimated total, and submit the request without paying online. The customer receives a receipt confirmation; the operator receives the complete enquiry, confirms availability directly and arranges payment off-site. Existing payment-provider code remains available for clients that explicitly need it, but `rentalOnlinePaymentsEnabled` is off by default.

## Requirements

- Node.js 22 or newer
- npm
- A Supabase project for live catalogue, authentication and administration
- A Vercel project for production deployment

## Local setup

```bash
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Populate `.env` with local or development credentials; never commit that file.

When Supabase is not configured, the public site automatically uses the bundled Alderway fleet, catalogue and content in both development and production. This keeps the sales demo fast and makes the complete booking-request flow testable without external services. Set `PUBLIC_DEMO_MODE=true` to keep bundled data even when Supabase credentials are present. Set it to `false` and configure Supabase for a live client deployment with authentication and persistent administration.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PUBLIC_DEMO_MODE` | `true` for the bundled Alderway sales demo; `false` for live Supabase content |
| `PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Server-only Supabase service-role key |
| `PUBLIC_SITE_URL` | Canonical public website origin |
| `PUBLIC_BOXNOW_PARTNER_ID` | Optional BoxNow public widget identifier |
| `CORVUSPAY_STORE_ID` | Optional server-only CorvusPay store identifier for payment-enabled deployments |
| `CORVUSPAY_SECRET_KEY` | Server-only CorvusPay signing key |
| `CORVUSPAY_ENV` | `test` or `production` |
| `CORVUSPAY_API_CERT_PEM` | Server-only merchant mTLS certificate for transaction operations |
| `CORVUSPAY_API_KEY_PEM` | Server-only private key for the merchant API certificate |
| `CORVUSPAY_API_KEY_PASSPHRASE` | Optional private-key passphrase |
| `CRON_SECRET` | Server-only bearer secret for scheduled reconciliation |
| `RESEND_API_KEY` | Server-only Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address used for transactional mail |
| `RENTAL_SUPABASE_PROJECT_REF` | Approved project ref used only by backup tooling |
| `RENTAL_BACKUP_DIR` | Private backup directory outside this repository |
| `RENTAL_BACKUP_PASSPHRASE_FILE` | Mode-600 passphrase file outside this repository |

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

`npm run backup:production` creates an encrypted database/Auth/Storage backup. `npm run backup:restore-test -- /absolute/backup.tar.gz.enc` restores it into an isolated temporary PostgreSQL instance and writes non-sensitive evidence. Neither command may use a backup directory or passphrase file inside the repository.

## Database

Supabase migrations are stored in `supabase/migrations/` and must be applied in numeric order. Never edit an already-applied production migration; add a new idempotent migration instead.

Business configuration such as seasons, prices, fees, delivery rules, editable page content and versioned legal documents lives in Supabase and is managed through `/admin`. Migration `0042_alderway_demo_rebrand.sql` installs the fictional fleet and public demo content without changing booking, pricing, payment or audit record relationships.

## Deployment

The application can be deployed by Vercel from the `main` branch. For a standalone sales demo, set `PUBLIC_DEMO_MODE=true` and `PUBLIC_SITE_URL` to the deployment origin; public browsing and the request-booking experience then work without Supabase. Configure Supabase, Resend and the documented server-only variables when persistent admin, database records and real transactional email are required. CorvusPay credentials are not required for the standard request-only rental setup. If online payments are deliberately enabled for a client, the production credentials and callback URLs must match the final canonical domain.

The current production payment variables are intentionally empty until a merchant owner supplies and approves real credentials and the mTLS API certificate.

Suggested demo URL: `https://demo.alderwaycampers.com`. Replace it with the client domain in `PUBLIC_SITE_URL` for each deployment.

## Maintenance

- `src/` contains application and server code.
- `static/` contains production assets served directly by the application.
- `supabase/migrations/` is the authoritative database change history.
- `scripts/optimize-vehicle-images.mjs` and `scripts/vehicle-image-manifest.json` maintain the vehicle image library.
- Automated `*.test.ts` files are retained as regression coverage and should run before release.
- [`docs/deployment.md`](docs/deployment.md) contains the concise demo and live-client deployment checklist.
