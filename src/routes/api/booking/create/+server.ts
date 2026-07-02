import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const { user } = await locals.safeGetSession();
  const driver = body.driverDetails ?? {};
  const totalPrice = Number(body.total_price);

  if (
    !body.selectedVehicle?.id ||
    !body.pickupLocation ||
    !body.pickupDate ||
    !body.dropoffDate ||
    !body.pickupTime ||
    !body.dropoffTime ||
    !driver.firstName ||
    !driver.email ||
    !driver.phone ||
    !Number.isFinite(totalPrice) ||
    totalPrice < 0
  ) {
    return json({ success: false, error: 'Nedostaju obavezni podaci rezervacije.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from('bookings').insert({
    confirmation_number: `PET-${Date.now().toString(36).toUpperCase()}`,
    user_id: user?.id ?? null,
    vehicle_id: body.selectedVehicle?.id,
    pickup_location: body.pickupLocation,
    dropoff_location: body.dropoffLocation || body.pickupLocation,
    pickup_date: body.pickupDate,
    dropoff_date: body.dropoffDate,
    pickup_time: body.pickupTime,
    dropoff_time: body.dropoffTime,
    driver_name: driver.firstName,
    driver_last_name: driver.lastName,
    driver_email: driver.email,
    driver_phone: driver.phone,
    driver_dob: driver.dateOfBirth || null,
    driver_license: driver.licenseNumber || null,
    driver_license_country: driver.licenseCountry || null,
    billing: {
      address: driver.address || '',
      city: driver.city || '',
      zip: driver.zip || '',
      country: driver.country || ''
    },
    price_breakdown: { extras: body.extras ?? {} },
    total_price: totalPrice,
    status: 'pending',
    payment_method: body.payment_method ?? null,
  }).select().single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 400 });
  }

  return json({ success: true, booking: data });
};
