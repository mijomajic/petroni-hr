import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase.from('bookings').insert({
    vehicle_id: body.selectedVehicle?.id,
    pickup_location: body.pickupLocation,
    dropoff_location: body.dropoffLocation || body.pickupLocation,
    pickup_date: body.pickupDate,
    dropoff_date: body.dropoffDate,
    pickup_time: body.pickupTime,
    dropoff_time: body.dropoffTime,
    driver_name: `${body.driverDetails.firstName} ${body.driverDetails.lastName}`,
    driver_email: body.driverDetails.email,
    driver_phone: body.driverDetails.phone,
    driver_age: body.driverAge,
    extras: body.extras,
    total_price: body.total_price,
    status: 'pending',
    payment_status: 'unpaid',
  }).select().single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 400 });
  }

  return json({ success: true, booking: data });
};
