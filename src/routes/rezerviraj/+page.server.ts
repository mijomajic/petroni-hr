import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';
import { corvuspayAvailable } from '$lib/payments.server';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession();
  const [vehicles, locations, extras, extraCategories, seasons, seasonPrices, fees, settings, terms] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order'),
    locals.supabase.from('rental_locations').select('*').order('sort_order'),
    locals.supabase.from('booking_extras').select('*').order('sort_order'),
    locals.supabase.from('booking_extra_categories').select('*').order('sort_order'),
    locals.supabase.from('seasons').select('*').order('sort_order'),
    locals.supabase.from('season_prices').select('*'),
    locals.supabase.from('fees').select('*').eq('is_active', true),
    supabaseAdmin
      .from('settings')
      .select('key,value')
      .in('key', [
        'min_driver_age',
        'km_per_day_included',
        'ibans',
        'split_payment_due_days',
        'split_payment_min_advance_days',
        'booking_time_selection_start',
        'booking_time_selection_end'
      ]),
    supabaseAdmin.from('rental_terms').select('*').eq('is_active', true).single()
  ]);

  const settingsMap = Object.fromEntries(
    (settings.data ?? []).map((setting) => [setting.key, setting.value])
  );

  return {
    vehicles: vehicles.data ?? [],
    locations: locations.data ?? [],
    extras: extras.data ?? [],
    extraCategories: extraCategories.data ?? [],
    seasons: seasons.data ?? [],
    seasonPrices: seasonPrices.data ?? [],
    fees: fees.data ?? [],
    minDriverAge: Number(settingsMap.min_driver_age ?? 28),
    kmPerDayIncluded: Number(settingsMap.km_per_day_included ?? 300),
    ibans: settingsMap.ibans ?? [],
    splitPaymentDueDays: Number(settingsMap.split_payment_due_days ?? 45),
    splitPaymentMinAdvanceDays: Number(settingsMap.split_payment_min_advance_days ?? 45),
    bookingTimeSelectionStart: String(settingsMap.booking_time_selection_start ?? '09:00'),
    bookingTimeSelectionEnd: String(settingsMap.booking_time_selection_end ?? '18:00'),
    terms: terms.data ?? null,
    corvuspayAvailable: corvuspayAvailable(),
    profile: user
      ? {
          ...user.user_metadata,
          email: user.email ?? ''
        }
      : null
  };
};
