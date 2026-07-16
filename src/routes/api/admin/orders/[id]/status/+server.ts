import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { sendOrderCancelled, sendOrderConfirmation } from '$lib/email.server';
import { requireAdministrator, recordAdminEvent } from '$lib/admin.server';
import { cancelOrderAndReleaseStock } from '$lib/shop-stock.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const administrator = await requireAdministrator(locals);
  const { status } = await request.json();
  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) return json({ error: 'Invalid status' }, { status: 400 });
  const { data: before } = await supabaseAdmin.from('orders').select('status,payment_status,invoice_sent').eq('id', params.id).single();
  if (before?.status === status) return json({ order: before });
  if (before?.status === 'cancelled') return json({ error: 'Cancelled orders cannot be reopened.' }, { status: 409 });
  const patch: Record<string, unknown> = { status };
  if (status === 'completed') patch.shipped_at = new Date().toISOString();
  let data: Record<string, any>;
  if (status === 'cancelled') {
    const cancelled = await cancelOrderAndReleaseStock(params.id);
    if (cancelled.error || !cancelled.data) {
      return json({ error: cancelled.error?.message ?? 'Order could not be cancelled.' }, { status: 400 });
    }
    data = cancelled.data as Record<string, any>;
  } else {
    const updated = await supabaseAdmin.from('orders').update(patch).eq('id', params.id).select().single();
    if (updated.error) return json({ error: updated.error.message }, { status: 400 });
    data = updated.data;
  }
  let emailSent: boolean | null = null;
  if (status === 'completed' && data.payment_status === 'paid' && !data.invoice_sent) {
    emailSent = await sendOrderConfirmation(data, administrator.user.id);
    if (emailSent) {
      await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', data.id);
      data.invoice_sent = true;
    }
  } else if (status === 'cancelled') {
    emailSent = await sendOrderCancelled(data, administrator.user.id);
  }
  await recordAdminEvent({
    administrator,
    entityType: 'order',
    entityId: params.id,
    action: 'order_status_changed',
    beforeState: before,
    afterState: { status: data.status, payment_status: data.payment_status, invoice_sent: data.invoice_sent },
    metadata: emailSent === null ? {} : {
      email_type: status === 'completed' ? 'confirmation' : 'cancellation',
      email_sent: emailSent
    }
  });
  return json({ order: data });
};
