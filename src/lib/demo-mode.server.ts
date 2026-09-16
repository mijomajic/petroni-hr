import { env } from '$env/dynamic/public';

const supabaseUrl = env.PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const publicSupabaseConfigured = Boolean(
  supabaseUrl
  && supabaseAnonKey
  && !supabaseUrl.includes('placeholder.supabase.co')
  && supabaseAnonKey !== 'placeholder'
);

const demoModeRequested = ['1', 'true', 'yes', 'on'].includes(
  (env.PUBLIC_DEMO_MODE?.trim().toLowerCase() ?? '')
);

/**
 * Keeps the reusable demo instant in local previews and fresh deployments.
 * Configure Supabase to use live data, or set PUBLIC_DEMO_MODE=true to keep the
 * bundled public catalogue even when a backend is connected.
 */
export const useStaticDemoData = demoModeRequested || !publicSupabaseConfigured;
