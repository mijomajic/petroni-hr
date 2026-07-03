import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { sendOrderInvoice } from '$lib/email.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const { status } = await request.json();
  if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) return json({ error: 'Invalid status' }, { status: 400 });
  const patch: Record<string, unknown> = { status };
  if (status === 'completed') patch.shipped_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from('orders').update(patch).eq('id', params.id).select().single();
  if (error) return json({ error: error.message }, { status: 400 });
  if (status === 'completed' && data.payment_status === 'paid' && !data.invoice_sent) {
    const sent = await sendOrderInvoice(data);
    if (sent) await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', data.id);
  }
  return json({ order: data });
};
