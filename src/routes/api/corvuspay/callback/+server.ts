import { error, redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { env } from '$env/dynamic/private';
import { parseCorvuspayOrderNumber, verifyCorvuspayCallbackState } from '$lib/corvuspay.server';
import { corvuspayTransactionStatus, verifyCorvuspayCallback } from '$lib/payments.server';
import { revokeSecondPaymentTokens } from '$lib/payment-tokens.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const fields = Object.fromEntries(url.searchParams.entries());
  const gatewayFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => key !== 'state')
  );
  const orderNumber = String(fields.order_number ?? '');
  const callbackState = String(fields.state ?? '');
  let approvalCode: string | null = String(fields.approval_code ?? '') || null;

  if (!verifyCorvuspayCallback(gatewayFields)) {
    if (!corvuspayAvailableForCallback() || !verifyCorvuspayCallbackState(env.CORVUSPAY_SECRET_KEY!, orderNumber, callbackState)) {
      throw error(400, 'Neispravan CorvusPay povratni zahtjev.');
    }
    const transaction = await corvuspayTransactionStatus(orderNumber);
    if (!transaction || !['authorized', 'completed'].includes(transaction.status)) {
      throw error(400, 'CorvusPay transakciju nije moguće potvrditi.');
    }
    approvalCode = transaction.approvalCode;
  }

  const reference = parseCorvuspayOrderNumber(orderNumber);
  if (!reference) throw error(400, 'Nepoznata CorvusPay transakcija.');

  if (reference.kind === 'order') {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', reference.orderId)
      .eq('payment_method', 'corvuspay')
      .eq('corvuspay_order_id', orderNumber)
      .single();
    if (!order) throw error(404, 'Narudžba nije pronađena.');
    await supabaseAdmin.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', order.id);
    throw redirect(303, '/checkout/success?payment=success');
  }

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id,payment_split,first_payment_status,second_payment_status')
    .eq('id', reference.bookingId)
    .eq('payment_method', 'corvuspay')
    .single();
  if (!booking) throw error(404, 'Rezervacija nije pronađena.');
  const { data: paymentAttempt } = await supabaseAdmin
    .from('payment_attempts')
    .select('id')
    .eq('booking_id', booking.id)
    .eq('payment_part', reference.paymentPart)
    .eq('provider', 'corvuspay')
    .eq('action', 'redirect_created')
    .eq('provider_reference', orderNumber)
    .limit(1)
    .maybeSingle();
  if (!paymentAttempt) throw error(404, 'CorvusPay pokušaj plaćanja nije pronađen.');
  if (
    reference.paymentPart === 2 &&
    (!booking.payment_split || booking.first_payment_status !== 'paid' || booking.second_payment_status === 'paid')
  ) {
    throw error(409, 'Doplata za ovu rezervaciju nije dostupna.');
  }

  const paymentStatus = reference.paymentPart === 2
    ? (booking.first_payment_status === 'paid' ? 'paid' : 'partial')
    : (booking.payment_split && booking.second_payment_status !== 'paid' ? 'partial' : 'paid');
  const update = reference.paymentPart === 2
    ? { second_payment_status: 'paid', payment_status: paymentStatus }
    : { first_payment_status: 'paid', payment_status: paymentStatus };
  await supabaseAdmin.from('bookings').update(update).eq('id', booking.id);
  await supabaseAdmin.from('payment_attempts').insert({
    booking_id: booking.id,
    payment_part: reference.paymentPart,
    provider: 'corvuspay',
    action: 'success_redirect_verified',
    status: 'succeeded',
    provider_reference: orderNumber,
    metadata: { approval_code: approvalCode, language: fields.language ?? null }
  });
  if (reference.paymentPart === 2) await revokeSecondPaymentTokens(booking.id);
  throw redirect(303, '/rezerviraj/success?payment=success');
};

function corvuspayAvailableForCallback(): boolean {
  return Boolean(env.CORVUSPAY_SECRET_KEY && env.CORVUSPAY_STORE_ID);
}
