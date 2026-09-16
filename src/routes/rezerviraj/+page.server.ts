import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase.server';
import { corvuspayAvailable } from '$lib/payments.server';
import { dev } from '$app/environment';
import { BUSINESS } from '$lib/config/business';
import { useStaticDemoData } from '$lib/demo-mode.server';
import {
  DEMO_EXTRAS,
  DEMO_EXTRA_CATEGORIES,
  DEMO_FEES,
  DEMO_LOCATIONS,
  DEMO_SEASONS,
  DEMO_SEASON_PRICES,
  DEMO_TERMS,
  DEMO_VEHICLES
} from '$lib/demo-data';

export const load: PageServerLoad = async ({ locals }) => {
  if (useStaticDemoData) {
    return {
      vehicles: DEMO_VEHICLES,
      locations: DEMO_LOCATIONS,
      extras: DEMO_EXTRAS,
      extraCategories: DEMO_EXTRA_CATEGORIES,
      seasons: DEMO_SEASONS,
      seasonPrices: DEMO_SEASON_PRICES,
      fees: DEMO_FEES,
      minDriverAge: 25,
      kmPerDayIncluded: 300,
      ibans: [],
      splitPaymentDueDays: 45,
      splitPaymentMinAdvanceDays: 45,
      bookingTimeSelectionStart: '09:00',
      bookingTimeSelectionEnd: '18:00',
      terms: DEMO_TERMS,
      corvuspayAvailable: false,
      profile: null
    };
  }

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
    vehicles: vehicles.data ?? (dev && vehicles.error ? DEMO_VEHICLES : []),
    locations: locations.data ?? (dev && locations.error ? DEMO_LOCATIONS : []),
    extras: extras.data ?? (dev && extras.error ? DEMO_EXTRAS : []),
    extraCategories: extraCategories.data ?? (dev && extraCategories.error ? DEMO_EXTRA_CATEGORIES : []),
    seasons: seasons.data ?? (dev && seasons.error ? DEMO_SEASONS : []),
    seasonPrices: seasonPrices.data ?? (dev && seasonPrices.error ? DEMO_SEASON_PRICES : []),
    fees: fees.data ?? (dev && fees.error ? DEMO_FEES : []),
    minDriverAge: Number(settingsMap.min_driver_age ?? 28),
    kmPerDayIncluded: Number(settingsMap.km_per_day_included ?? 300),
    ibans: settingsMap.ibans ?? [],
    splitPaymentDueDays: Number(settingsMap.split_payment_due_days ?? 45),
    splitPaymentMinAdvanceDays: Number(settingsMap.split_payment_min_advance_days ?? 45),
    bookingTimeSelectionStart: String(settingsMap.booking_time_selection_start ?? '09:00'),
    bookingTimeSelectionEnd: String(settingsMap.booking_time_selection_end ?? '18:00'),
    terms: terms.data ?? (dev && terms.error ? DEMO_TERMS : null),
    corvuspayAvailable: BUSINESS.rentalOnlinePaymentsEnabled && corvuspayAvailable(),
    profile: user
      ? {
          ...user.user_metadata,
          email: user.email ?? ''
        }
      : null
  };
};
