import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { sendBookingConfirmed } from '$lib/email.server';
import { requireAdministrator, recordAdminEvent } from '$lib/admin.server';
import { revokeSecondPaymentTokens } from '$lib/payment-tokens.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const administrator = await requireAdministrator(locals);
  const { status } = await request.json();
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) return json({ error: 'Invalid status' }, { status: 400 });
  const { data: before } = await supabaseAdmin.from('bookings').select('status').eq('id', params.id).single();
  const { data, error } = await supabaseAdmin.from('bookings').update({ status }).eq('id', params.id).select().single();
  if (error) return json({ error: error.message }, { status: 400 });
  let sent: boolean | null = null;
  if (status === 'confirmed' && before?.status !== 'confirmed') {
    sent = await sendBookingConfirmed(data, administrator.user.id);
    await supabaseAdmin.from('bookings').update({ confirmation_email_sent: sent }).eq('id', data.id);
  }
  await recordAdminEvent({
    administrator,
    entityType: 'booking',
    entityId: params.id,
    action: 'booking_status_changed',
    beforeState: before,
    afterState: { status },
    metadata: sent === null ? {} : { confirmation_email_sent: sent }
  });
  if (status === 'cancelled' || status === 'completed') {
    await revokeSecondPaymentTokens(params.id);
  }
  return json({ booking: data });
};
