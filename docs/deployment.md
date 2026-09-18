# Alderway deployment guide

This repository supports two deployment modes from the same codebase.

## Standalone sales demo

Use this mode for the Eastline master demo or a temporary client preview.

1. Authenticate Wrangler with `npx wrangler login`, then run `npm run deploy`, or connect `main` to Cloudflare Builds.
2. Keep `PUBLIC_DEMO_MODE=true` in `wrangler.jsonc`.
3. Set `PUBLIC_SITE_URL` to the final HTTPS deployment origin in the Cloudflare Worker settings.
4. Leave Supabase, Resend and CorvusPay values empty unless those services are intentionally being demonstrated.
5. Run the public smoke test below after the deployment is ready.

The bundled fleet, shop, journal, legal content and booking estimate flow are available without a database. Demo booking submissions return a clearly identified demo reference and do not send email or persist personal information.

## Connected client deployment

Use this mode when the client needs persistent bookings, transactional email and the administration panel.

1. Create a Supabase project and apply every SQL file in `supabase/migrations/` in numeric order.
2. Confirm that `0042_alderway_demo_rebrand.sql` has completed successfully.
3. Set `PUBLIC_DEMO_MODE=false` in the Cloudflare Worker environment.
4. Configure `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`; store `SUPABASE_SERVICE_KEY` with `wrangler secret put`.
5. Store `RESEND_API_KEY` as a Worker secret and configure a verified `RESEND_FROM_EMAIL` sender.
6. Set `PUBLIC_SITE_URL` to the canonical HTTPS origin.
7. Create the first administrator through the approved Supabase/admin onboarding process.
8. Configure `CRON_SECRET` if the scheduled reconciliation route remains enabled.

The old Vercel HTTP cron is intentionally not copied into the standalone demo because request-only rentals do not use CorvusPay reconciliation. A payment-enabled client deployment can call the protected reconciliation endpoint from a Cloudflare Cron Trigger or another scheduler.

The standard rental flow does not charge customers online. `rentalOnlinePaymentsEnabled` in `src/lib/config/business.ts` stays `false`; the company confirms availability and arranges payment directly. CorvusPay variables are only required for a client project that explicitly enables online payments.

## Required release checks

Run against the exact commit being deployed:

```bash
npm ci
npm test
npm run check
npm run build
```

## Public smoke test

- Home page, navigation and mobile menu load correctly.
- Fleet displays all demo vehicles and each detail page opens.
- Booking dates, vehicle selection, extras and estimated total work.
- Request submission reaches the confirmation page and states that no payment was taken.
- Shop lists all products, category filters work and product pages open.
- Contact, FAQ, privacy, cookies and rental terms pages render.
- No customer-specific brand, address, email or phone number is visible.

## Connected-mode smoke test

- An administrator can sign in and reach every management section.
- A booking request is stored as pending and appears in the admin panel.
- The customer and operator receive the expected booking-request emails.
- Uploaded media uses the configured Supabase storage buckets.
- Database backup and restore commands run with paths outside the repository.

Never commit `.env`, service-role keys, payment keys, certificates, backup passphrases or recovery codes.
