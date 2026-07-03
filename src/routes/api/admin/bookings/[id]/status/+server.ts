import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { sendBookingConfirmed } from '$lib/email.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { user } = await locals.safeGetSession();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const { status } = await request.json();
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) return json({ error: 'Invalid status' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('bookings').update({ status }).eq('id', params.id).select().single();
  if (error) return json({ error: error.message }, { status: 400 });
  if (status === 'confirmed') await sendBookingConfirmed(data);
  return json({ booking: data });
};
