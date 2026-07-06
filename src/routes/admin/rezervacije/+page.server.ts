import { supabaseAdmin } from '$lib/supabase.server';
import type { PageServerLoad } from './$types';

const statuses = new Set(['pending', 'confirmed', 'cancelled', 'completed']);

export const load: PageServerLoad = async ({ url }) => {
  const status = url.searchParams.get('status') ?? '';
  const dateFrom = url.searchParams.get('date_from') ?? '';
  const dateTo = url.searchParams.get('date_to') ?? '';

  let query = supabaseAdmin
    .from('bookings')
    .select('id,confirmation_number,driver_name,driver_last_name,driver_email,pickup_date,dropoff_date,total_price,status,payment_status,vehicles(name)')
    .order('created_at', { ascending: false });

  if (statuses.has(status)) query = query.eq('status', status);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) query = query.gte('pickup_date', dateFrom);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) query = query.lte('pickup_date', dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { bookings: data ?? [], filters: { status, dateFrom, dateTo } };
};
