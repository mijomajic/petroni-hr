import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { calculatePricing } from '$lib/pricing';
import { getUnavailableVehicleIds, loadPricingConfig } from '$lib/pricing.server';
import type { RequestHandler } from './$types';
import {
  createCorvuspayRedirect,
  corvuspayAvailable,
  hub3BarcodeDataUrl,
  hub3Payload,
  paymentAmount,
  type IbanSetting
} from '$lib/payments.server';
import { sendBookingReceived } from '$lib/email.server';

function ageOnDate(dateOfBirth: string, referenceDate: string): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  const reference = new Date(`${referenceDate}T00:00:00Z`);
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    reference.getUTCMonth() < birth.getUTCMonth() ||
    (reference.getUTCMonth() === birth.getUTCMonth() &&
      reference.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export const POST: RequestHandler = async ({ request, locals, getClientAddress, url }) => {
  const body = await request.json();
  const { user } = await locals.safeGetSession();
  const driver = body.driverDetails ?? {};
  const vehicleId = String(body.selectedVehicle?.id ?? '');
  const pickupDate = String(body.pickupDate ?? '');
  const dropoffDate = String(body.dropoffDate ?? '');
  const dateOfBirth = String(driver.dateOfBirth ?? '');
  const rawNumAdults = Number(body.numAdults);
  const rawNumChildren = Number(body.numChildren);
  const rawPlannedKm = Number(body.plannedKm);
  const numAdults = Math.floor(rawNumAdults);
  const numChildren = Math.floor(rawNumChildren);
  const plannedKm = Math.floor(rawPlannedKm);
  const destination = String(body.destination ?? '').trim();
  const paymentMethod = String(body.payment_method ?? '');
  const paymentSplit = body.payment_split === true;

  if (
    !vehicleId ||
    !body.pickupLocation ||
    !isValidIsoDate(pickupDate) ||
    !isValidIsoDate(dropoffDate) ||
    dropoffDate <= pickupDate ||
    !isValidTime(body.pickupTime) ||
    !isValidTime(body.dropoffTime) ||
    !destination ||
    !Number.isFinite(rawNumAdults) ||
    !Number.isFinite(rawNumChildren) ||
    !Number.isFinite(rawPlannedKm) ||
    numAdults < 1 ||
    numChildren < 0 ||
    plannedKm <= 0 ||
    !driver.firstName ||
    !driver.lastName ||
    !driver.email ||
    !driver.phone ||
    !isValidIsoDate(dateOfBirth) ||
    !driver.licenseNumber ||
    !driver.licenseCountry ||
    !driver.address ||
    !driver.city ||
    !driver.zip ||
    !driver.country ||
    !body.terms_accepted ||
    !['bank_transfer', 'corvuspay'].includes(paymentMethod)
  ) {
    return json({ success: false, error: 'Nedostaju obavezni podaci rezervacije.' }, { status: 400 });
  }
  if (paymentMethod === 'corvuspay' && !corvuspayAvailable()) {
    return json(
      { success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' },
      { status: 503 }
    );
  }

  const [{ data: vehicle, error: vehicleError }, pricingData, { data: terms }, { data: paymentSettings }] = await Promise.all([
    supabaseAdmin.from('vehicles').select('*').eq('id', vehicleId).eq('type', 'rental').single(),
    loadPricingConfig(),
    supabaseAdmin.from('rental_terms').select('version,content_hr').eq('is_active', true).single(),
    supabaseAdmin.from('settings').select('key,value').in('key', ['ibans', 'company', 'split_payment_due_days'])
  ]);

  if (vehicleError || !vehicle || !vehicle.is_available) {
    return json({ success: false, error: 'Odabrano vozilo više nije dostupno.' }, { status: 409 });
  }
  if (!terms) {
    return json({ success: false, error: 'Aktivni uvjeti najma nisu dostupni.' }, { status: 503 });
  }
  const pickupLocation = pricingData.config.locations.find(
    (location) => location.name === body.pickupLocation
  );
  const dropoffLocationName = String(body.dropoffLocation || body.pickupLocation);
  const dropoffLocation = pricingData.config.locations.find(
    (location) => location.name === dropoffLocationName
  );
  if (!pickupLocation || !dropoffLocation) {
    return json({ success: false, error: 'Odabrana lokacija nije valjana.' }, { status: 400 });
  }
  if (
    (vehicle.seats ?? vehicle.max_adults ?? 0) < numAdults + numChildren ||
    (vehicle.max_adults ?? vehicle.seats ?? 0) < numAdults ||
    (vehicle.max_children ?? 0) < numChildren
  ) {
    return json({ success: false, error: 'Odabrano vozilo nema dovoljan kapacitet.' }, { status: 400 });
  }
  if (ageOnDate(dateOfBirth, pickupDate) < pricingData.minDriverAge) {
    return json(
      {
        success: false,
        error: `Vozač na dan preuzimanja mora imati najmanje ${pricingData.minDriverAge} godina.`
      },
      { status: 400 }
    );
  }

  const unavailableIds = await getUnavailableVehicleIds([vehicleId], pickupDate, dropoffDate);
  if (unavailableIds.includes(vehicleId)) {
    return json(
      { success: false, error: 'Vozilo je u međuvremenu rezervirano za odabrane datume.' },
      { status: 409 }
    );
  }

  const pricing = calculatePricing(
    {
      vehicle,
      pickupDate,
      dropoffDate,
      pickupTime: body.pickupTime,
      dropoffTime: body.dropoffTime,
      pickupLocation: pickupLocation.name,
      dropoffLocation: dropoffLocation.name,
      plannedKm,
      selectedExtras: body.extras ?? {}
    },
    pricingData.config
  );

  if (pricing.nights <= 0 || pricing.payable_total < 0) {
    return json({ success: false, error: 'Cijenu rezervacije nije moguće izračunati.' }, { status: 400 });
  }
  const settings = Object.fromEntries((paymentSettings ?? []).map((row) => [row.key, row.value]));
  const dueDays = Math.max(1, Number(settings.split_payment_due_days ?? 3));
  const dueDate = new Date(`${pickupDate}T00:00:00Z`);
  dueDate.setUTCDate(dueDate.getUTCDate() - dueDays);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (dueDate < today) dueDate.setTime(today.getTime());
  const firstAmount = paymentAmount(pricing.payable_total, paymentSplit, 1);
  const secondAmount = paymentSplit ? paymentAmount(pricing.payable_total, true, 2) : 0;
  const confirmationNumber = `PET-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabaseAdmin.from('bookings').insert({
    confirmation_number: confirmationNumber,
    user_id: user?.id ?? null,
    vehicle_id: vehicleId,
    pickup_location: pickupLocation.name,
    dropoff_location: dropoffLocation.name,
    pickup_date: pickupDate,
    dropoff_date: dropoffDate,
    pickup_time: body.pickupTime,
    dropoff_time: body.dropoffTime,
    num_adults: numAdults,
    num_children: numChildren,
    planned_km: plannedKm,
    destination,
    driver_name: driver.firstName,
    driver_last_name: driver.lastName,
    driver_email: driver.email,
    driver_phone: driver.phone,
    driver_dob: dateOfBirth,
    driver_license: driver.licenseNumber || null,
    driver_license_country: driver.licenseCountry || null,
    billing: {
      address: driver.address || '',
      city: driver.city || '',
      zip: driver.zip || '',
      country: driver.country || ''
    },
    notes: pricing.extra_km_note,
    price_breakdown: pricing,
    extras_total: pricing.extras_total,
    fees_total: pricing.fees_total,
    total_price: pricing.payable_total,
    deposit_amount: pricing.refundable_deposit,
    payment_split: paymentSplit,
    first_payment_amount: firstAmount,
    second_payment_amount: secondAmount,
    first_payment_status: 'unpaid',
    second_payment_status: paymentSplit ? 'unpaid' : 'not_applicable',
    second_payment_due_date: paymentSplit ? dueDate.toISOString().slice(0, 10) : null,
    payment_status: 'unpaid',
    status: 'pending',
    payment_method: paymentMethod,
    terms_accepted_at: new Date().toISOString(),
    terms_accepted_ip: getClientAddress(),
    terms_version: terms.version
  }).select('*,vehicles(name)').single();

  if (error) {
    return json({ success: false, error: error.message }, { status: 400 });
  }

  if (pricing.extra_selections.length > 0) {
    const { error: selectionsError } = await supabaseAdmin
      .from('booking_extra_selections')
      .insert(
        pricing.extra_selections.map((selection) => ({
          booking_id: data.id,
          extra_id: selection.extra_id,
          qty: selection.qty,
          unit_price: selection.unit_price,
          total_price: selection.total_price
        }))
      );

    if (selectionsError) {
      await supabaseAdmin.from('bookings').delete().eq('id', data.id);
      return json({ success: false, error: selectionsError.message }, { status: 400 });
    }
  }

  sendBookingReceived(data, terms).then(async (sent) => {
    if (sent) await supabaseAdmin.from('bookings').update({ confirmation_email_sent: true }).eq('id', data.id);
  }).catch((mailError) => console.error('Booking email failed', mailError));

  const response: Record<string, unknown> = {
    success: true,
    booking: {
      id: data.id,
      confirmation_number: data.confirmation_number,
      payment_method: data.payment_method,
      payment_split: data.payment_split,
      first_payment_amount: firstAmount,
      second_payment_amount: secondAmount,
      second_payment_due_date: data.second_payment_due_date,
      second_payment_due_days: dueDays
    }
  };
  if (paymentMethod === 'bank_transfer') {
    const company = (settings.company ?? {}) as { name?: string; address?: string };
    response.bankTransfers = await Promise.all(((settings.ibans ?? []) as IbanSetting[]).map(async (account) => {
      const payload = hub3Payload({
        amount: firstAmount,
        recipient: company.name ?? 'Petroni d.o.o.',
        address: company.address ?? '',
        iban: account.iban,
        reference: confirmationNumber,
        description: `Rezervacija ${confirmationNumber}`
      });
      return { ...account, amount: firstAmount, reference: confirmationNumber, barcode: await hub3BarcodeDataUrl(payload) };
    }));
    await supabaseAdmin.from('payment_attempts').insert({
      booking_id: data.id,
      payment_part: 1,
      provider: 'bank_transfer',
      action: 'payment_instructions_created',
      status: 'pending',
      provider_reference: confirmationNumber
    });
  }
  if (paymentMethod === 'corvuspay') {
    const redirect = createCorvuspayRedirect({
      orderNumber: `${data.id}:1`,
      amount: firstAmount,
      description: `Rezervacija ${confirmationNumber}`,
      email: data.driver_email,
      baseUrl: url.origin
    });
    if (!redirect) {
      await supabaseAdmin.from('bookings').delete().eq('id', data.id);
      return json({ success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' }, { status: 503 });
    }
    await supabaseAdmin.from('payment_attempts').insert({
      booking_id: data.id,
      payment_part: 1,
      provider: 'corvuspay',
      action: 'redirect_created',
      status: 'started',
      provider_reference: `${data.id}:1`
    });
    response.corvuspay = redirect;
  }
  return json(response);
};
