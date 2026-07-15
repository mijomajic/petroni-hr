import { redirect } from '@sveltejs/kit';
import { parseCorvuspayOrderNumber } from '$lib/corvuspay.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { RequestHandler } from './$types';

const handleCancel: RequestHandler = async ({ request, url }) => {
  let orderNumber = String(url.searchParams.get('order_number') ?? '');
  if (request.method === 'POST') {
    const value = (await request.formData()).get('order_number');
    if (typeof value === 'string') orderNumber = value;
  }

  const reference = parseCorvuspayOrderNumber(orderNumber);
  if (reference) await recordCancelledAttempt(reference, orderNumber);
  throw redirect(303, reference?.kind === 'order' ? '/checkout/success?payment=cancel' : '/rezerviraj/success?payment=cancel');
};

export const GET = handleCancel;
export const POST = handleCancel;

async function recordCancelledAttempt(
  reference: NonNullable<ReturnType<typeof parseCorvuspayOrderNumber>>,
  orderNumber: string
) {
  const existingQuery = supabaseAdmin
    .from('payment_attempts')
    .select('id')
    .eq('provider', 'corvuspay')
    .eq('action', 'cancel_redirect_received')
    .eq('provider_reference', orderNumber)
    .limit(1);
  const existing = reference.kind === 'order'
    ? await existingQuery.eq('order_id', reference.orderId).maybeSingle()
    : await existingQuery.eq('booking_id', reference.bookingId).eq('payment_part', reference.paymentPart).maybeSingle();
  if (existing.data) return;

  if (reference.kind === 'order') {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', reference.orderId)
      .eq('payment_method', 'corvuspay')
      .eq('corvuspay_order_id', orderNumber)
      .maybeSingle();
    if (!order) return;
    await supabaseAdmin.from('payment_attempts').insert({
      order_id: order.id,
      provider: 'corvuspay',
      action: 'cancel_redirect_received',
      status: 'cancelled',
      provider_reference: orderNumber
    });
    return;
  }

  const { data: attempt } = await supabaseAdmin
    .from('payment_attempts')
    .select('booking_id')
    .eq('booking_id', reference.bookingId)
    .eq('payment_part', reference.paymentPart)
    .eq('provider', 'corvuspay')
    .eq('action', 'redirect_created')
    .eq('provider_reference', orderNumber)
    .limit(1)
    .maybeSingle();
  if (!attempt) return;
  await supabaseAdmin.from('payment_attempts').insert({
    booking_id: reference.bookingId,
    payment_part: reference.paymentPart,
    provider: 'corvuspay',
    action: 'cancel_redirect_received',
    status: 'cancelled',
    provider_reference: orderNumber
  });
}
