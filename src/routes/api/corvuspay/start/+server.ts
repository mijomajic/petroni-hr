import { error, redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { createCorvuspayRedirect } from '$lib/payments.server';
import { validateSecondPaymentToken } from '$lib/payment-tokens.server';
import { corvuspayBookingOrderNumber } from '$lib/corvuspay.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  const form = await request.formData();
  const bookingId = String(form.get('booking_id') ?? '');
  const part = form.get('part') === '2' ? 2 : 1;
  const token = String(form.get('token') ?? '');
  if (part !== 2 || !(await validateSecondPaymentToken(bookingId, token))) {
    throw error(404, 'Poveznica za plaćanje nije valjana.');
  }
  const { data: booking } = await supabaseAdmin.from('bookings')
    .select('id,confirmation_number,driver_email,first_payment_amount,second_payment_amount,payment_split,first_payment_status,second_payment_status,status')
    .eq('id', bookingId).single();
  if (
    !booking?.payment_split ||
    booking.status !== 'confirmed' ||
    booking.first_payment_status !== 'paid' ||
    booking.second_payment_status === 'paid'
  ) {
    throw error(404);
  }
  const redirectData = createCorvuspayRedirect({
    orderNumber: corvuspayBookingOrderNumber(booking.id, part),
    amount: Number(part === 2 ? booking.second_payment_amount : booking.first_payment_amount),
    description: `${part === 2 ? 'Doplata' : 'Rezervacija'} ${booking.confirmation_number}`,
    email: booking.driver_email,
    baseUrl: url.origin
  });
  if (!redirectData) throw error(503, 'CorvusPay nije konfiguriran.');
  await supabaseAdmin.from('payment_attempts').insert({
    booking_id: booking.id,
    payment_part: part,
    provider: 'corvuspay',
    action: 'redirect_created',
    status: 'started',
    provider_reference: corvuspayBookingOrderNumber(booking.id, part)
  });
  const escapeAttribute = (value: string) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const response = `<!doctype html><html><body><form id="pay" method="post" action="${escapeAttribute(redirectData.url)}">${Object.entries(redirectData.fields).map(([key, value]) => `<input type="hidden" name="${escapeAttribute(key)}" value="${escapeAttribute(value)}">`).join('')}</form><script>document.getElementById('pay').submit()</script></body></html>`;
  return new Response(response, { headers: { 'content-type': 'text/html; charset=utf-8' } });
};
