import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env as pub } from '$env/dynamic/public';
import { env as priv } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const vehicleId = url.searchParams.get('vehicleId');
  const pickupDate = url.searchParams.get('pickupDate');
  const dropoffDate = url.searchParams.get('dropoffDate');

  if (!vehicleId || !pickupDate || !dropoffDate) {
    return json({ available: false, error: 'Missing parameters' }, { status: 400 });
  }

  const supabase = createClient(pub.PUBLIC_SUPABASE_URL ?? '', priv.SUPABASE_SERVICE_KEY ?? '');

  const [{ data: bookingConflicts }, { data: blockedConflicts }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .neq('status', 'cancelled')
      .lte('pickup_date', dropoffDate)
      .gte('dropoff_date', pickupDate),
    supabase
      .from('vehicle_blocked_dates')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .lte('date_from', dropoffDate)
      .gte('date_to', pickupDate),
  ]);

  const available = (bookingConflicts?.length ?? 0) === 0 && (blockedConflicts?.length ?? 0) === 0;

  return json({ available });
};
