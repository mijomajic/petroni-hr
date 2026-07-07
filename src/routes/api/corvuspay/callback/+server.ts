import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { verifyCorvuspayCallback } from '$lib/payments.server';
import { revokeSecondPaymentTokens } from '$lib/payment-tokens.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  const form = await request.formData();
  const fields = Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
  if (!verifyCorvuspayCallback(fields)) return new Response('Invalid signature', { status: 400 });
  const orderNumber = String(fields.order_number ?? '');
  const successful = ['success', 'approved', 'completed'].includes(String(fields.status ?? fields.result ?? '').toLowerCase());
  if (orderNumber.startsWith('order:')) {
    const orderId = orderNumber.slice('order:'.length);
    if (orderId && successful) {
      await supabaseAdmin.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', orderId);
    }
    return new Response('OK');
  }
  const [bookingId, partText] = orderNumber.split(':');
  if (bookingId) {
    await supabaseAdmin.from('payment_attempts').insert({
      booking_id: bookingId,
      payment_part: partText === '2' ? 2 : 1,
      provider: 'corvuspay',
      action: 'callback_received',
      status: successful ? 'succeeded' : 'failed',
      provider_reference: String(fields.order_number ?? ''),
      metadata: {
        result: String(fields.status ?? fields.result ?? 'unknown')
      }
    });
  }
  if (bookingId && successful) {
    const part = partText === '2' ? 2 : 1;
    const { data: booking } = await supabaseAdmin.from('bookings')
      .select('payment_split,first_payment_status,second_payment_status')
      .eq('id', bookingId).single();
    const update = part === 2
      ? {
          second_payment_status: 'paid',
          payment_status: booking?.first_payment_status === 'paid' ? 'paid' : 'partial'
        }
      : {
          first_payment_status: 'paid',
          payment_status: booking?.payment_split && booking?.second_payment_status !== 'paid' ? 'partial' : 'paid'
        };
    await supabaseAdmin.from('bookings').update(update).eq('id', bookingId);
    if (part === 2) await revokeSecondPaymentTokens(bookingId);
  }
  return new Response('OK');
};

export const GET: RequestHandler = async ({ url }) => {
  const result = url.searchParams.get('result');
  throw redirect(303, result === 'success' ? '/rezerviraj/success?payment=success' : '/rezerviraj/success?payment=cancel');
};
