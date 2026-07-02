import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  const [vehicles, locations, extras, seasons, seasonPrices, fees, settings] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order'),
    locals.supabase.from('rental_locations').select('*').order('sort_order'),
    locals.supabase.from('booking_extras').select('*').order('sort_order'),
    locals.supabase.from('seasons').select('*').order('sort_order'),
    locals.supabase.from('season_prices').select('*'),
    locals.supabase.from('fees').select('*').eq('is_active', true),
    supabaseAdmin
      .from('settings')
      .select('key,value')
      .in('key', ['min_driver_age', 'km_per_day_included'])
  ]);

  const settingsMap = Object.fromEntries(
    (settings.data ?? []).map((setting) => [setting.key, setting.value])
  );

  return {
    vehicles: vehicles.data ?? [],
    locations: locations.data ?? [],
    extras: extras.data ?? [],
    seasons: seasons.data ?? [],
    seasonPrices: seasonPrices.data ?? [],
    fees: fees.data ?? [],
    minDriverAge: Number(settingsMap.min_driver_age ?? 28),
    kmPerDayIncluded: Number(settingsMap.km_per_day_included ?? 300),
    profile: user
      ? {
          ...user.user_metadata,
          email: user.email ?? ''
        }
      : null
  };
};
