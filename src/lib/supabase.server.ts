import { createClient } from '@supabase/supabase-js';
import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';

const url = pub.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? '';
const serviceKey = priv.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? '';

// Server-only admin client. Uses the SERVICE-ROLE key, which BYPASSES Row Level
// Security — so this must NEVER be imported into client/browser code. Two guards
// enforce that: the `.server.ts` filename (SvelteKit blocks client imports) and
// `$env/dynamic/private` (throws if evaluated in the browser).
//
// Use this for: guest booking/order inserts, all admin reads/writes, and
// customer-facing server loads that touch service-only tables (settings/IBANs,
// rental terms). Falls back to a placeholder so the app builds before keys exist.
export const supabaseAdmin = createClient(
  url || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
