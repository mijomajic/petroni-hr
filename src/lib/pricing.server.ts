import { supabaseAdmin } from '$lib/supabase.server';
import type { PricingConfig } from '$lib/pricing';

export async function loadPricingConfig(): Promise<{
  config: PricingConfig;
  minDriverAge: number;
}> {
  const [seasons, seasonPrices, fees, locations, extras, settings] = await Promise.all([
    supabaseAdmin.from('seasons').select('*').order('sort_order'),
    supabaseAdmin.from('season_prices').select('*'),
    supabaseAdmin.from('fees').select('*').eq('is_active', true),
    supabaseAdmin.from('rental_locations').select('*').order('sort_order'),
    supabaseAdmin.from('booking_extras').select('*').order('sort_order'),
    supabaseAdmin
      .from('settings')
      .select('key,value')
      .in('key', ['min_driver_age', 'km_per_day_included'])
  ]);

  const firstError = [
    seasons.error,
    seasonPrices.error,
    fees.error,
    locations.error,
    extras.error,
    settings.error
  ].find(Boolean);
  if (firstError) throw new Error(firstError.message);

  const settingsMap = Object.fromEntries(
    (settings.data ?? []).map((setting) => [setting.key, setting.value])
  );

  return {
    config: {
      seasons: seasons.data ?? [],
      seasonPrices: seasonPrices.data ?? [],
      fees: fees.data ?? [],
      locations: locations.data ?? [],
      extras: extras.data ?? [],
      kmPerDayIncluded: Number(settingsMap.km_per_day_included ?? 300)
    },
    minDriverAge: Number(settingsMap.min_driver_age ?? 28)
  };
}

export async function getUnavailableVehicleIds(
  vehicleIds: string[],
  pickupDate: string,
  dropoffDate: string
): Promise<string[]> {
  const [{ data: bookingConflicts, error: bookingError }, { data: blockedConflicts, error: blockedError }] =
    await Promise.all([
      supabaseAdmin
        .from('bookings')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds)
        .neq('status', 'cancelled')
        .lt('pickup_date', dropoffDate)
        .gt('dropoff_date', pickupDate),
      supabaseAdmin
        .from('vehicle_blocked_dates')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds)
        .lt('date_from', dropoffDate)
        .gte('date_to', pickupDate)
    ]);

  if (bookingError) throw new Error(bookingError.message);
  if (blockedError) throw new Error(blockedError.message);

  return [
    ...new Set(
      [...(bookingConflicts ?? []), ...(blockedConflicts ?? [])]
        .map((row) => row.vehicle_id)
        .filter((id): id is string => Boolean(id))
    )
  ];
}
