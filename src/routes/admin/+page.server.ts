import { supabaseAdmin } from '$lib/supabase.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [bookings, vehicles, orders, recent, revenue] = await Promise.all([
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('vehicles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin
      .from('bookings')
      .select('id,confirmation_number,driver_name,pickup_date,dropoff_date,status,payment_status')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('bookings')
      .select('total_price')
      .eq('payment_status', 'paid')
      .gte('created_at', monthStart.toISOString())
  ]);

  return {
    stats: {
      pendingBookings: bookings.count ?? 0,
      vehicles: vehicles.count ?? 0,
      orders: orders.count ?? 0,
      revenue: (revenue.data ?? []).reduce((sum, row) => sum + Number(row.total_price), 0)
    },
    recentBookings: recent.data ?? []
  };
};
