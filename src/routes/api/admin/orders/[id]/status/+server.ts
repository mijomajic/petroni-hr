import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { sendOrderInvoice } from '$lib/email.server';
import { requireAdministrator, recordAdminEvent } from '$lib/admin.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const administrator = await requireAdministrator(locals);
  const { status } = await request.json();
  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) return json({ error: 'Invalid status' }, { status: 400 });
  const { data: before } = await supabaseAdmin.from('orders').select('status,payment_status,invoice_sent').eq('id', params.id).single();
  const patch: Record<string, unknown> = { status };
  if (status === 'completed') patch.shipped_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from('orders').update(patch).eq('id', params.id).select().single();
  if (error) return json({ error: error.message }, { status: 400 });
  if (status === 'completed' && data.payment_status === 'paid' && !data.invoice_sent) {
    const sent = await sendOrderInvoice(data, administrator.user.id);
    if (sent) {
      await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', data.id);
      data.invoice_sent = true;
    }
  }
  await recordAdminEvent({
    administrator,
    entityType: 'order',
    entityId: params.id,
    action: 'order_status_changed',
    beforeState: before,
    afterState: { status: data.status, payment_status: data.payment_status, invoice_sent: data.invoice_sent }
  });
  return json({ order: data });
};
