import type { BookingExtra, RentalLocation, Season, SeasonPrice, Vehicle } from '$lib/supabase';
import type { PageServerLoad } from './$types';

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

async function safeQuery<T>(
  query: PromiseLike<QueryResult<T>>,
  fallback: T
): Promise<{ data: T; error: string | null }> {
  try {
    const result = await query;
    return {
      data: result.data ?? fallback,
      error: result.error?.message ?? null
    };
  } catch (error) {
    return {
      data: fallback,
      error: error instanceof Error ? error.message : 'Podaci trenutačno nisu dostupni.'
    };
  }
}

export const load: PageServerLoad = async ({ locals }) => {
  const [vehicles, seasons, seasonPrices, extras, locations] = await Promise.all([
    safeQuery<Vehicle[]>(
      locals.supabase
        .from('vehicles')
        .select('*')
        .eq('type', 'rental')
        .eq('is_available', true)
        .order('sort_order'),
      []
    ),
    safeQuery<Season[]>(
      locals.supabase.from('seasons').select('*').order('date_from', { ascending: true }),
      []
    ),
    safeQuery<SeasonPrice[]>(locals.supabase.from('season_prices').select('*'), []),
    safeQuery<BookingExtra[]>(
      locals.supabase
        .from('booking_extras')
        .select('*')
        .gt('max_qty', 0)
        .neq('category', 'admin_depozit')
        .order('sort_order'),
      []
    ),
    safeQuery<RentalLocation[]>(
      locals.supabase.from('rental_locations').select('*').order('sort_order'),
      []
    )
  ]);

  const errors = [vehicles.error, seasons.error, seasonPrices.error, extras.error, locations.error].filter(
    (error): error is string => Boolean(error)
  );

  return {
    vehicles: vehicles.data,
    seasons: seasons.data,
    seasonPrices: seasonPrices.data,
    extras: extras.data,
    locations: locations.data,
    loadError: vehicles.error,
    partialLoadError: errors.length > 0 ? errors.join(' | ') : null
  };
};
