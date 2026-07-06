import { fail, error } from '@sveltejs/kit';
import { requireAdministrator, recordAdminEvent } from '$lib/admin.server';
import { sendBookingConfirmed } from '$lib/email.server';
import {
  createSecondPaymentToken,
  revokeSecondPaymentTokens
} from '$lib/payment-tokens.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

const bookingStatuses = new Set(['pending', 'confirmed', 'cancelled', 'completed']);
const paymentStatuses = new Set(['unpaid', 'paid']);

async function getBooking(id: string) {
  return supabaseAdmin
    .from('bookings')
    .select('*,vehicles(name,slug),booking_extra_selections(*,booking_extras(name_hr))')
    .eq('id', id)
    .single();
}

export const load: PageServerLoad = async ({ params }) => {
  const [bookingResult, events, emails, payments, activeTokens] = await Promise.all([
    getBooking(params.id),
    supabaseAdmin
      .from('admin_events')
      .select('*')
      .eq('entity_type', 'booking')
      .eq('entity_id', params.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('email_attempts')
      .select('*')
      .eq('booking_id', params.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('payment_attempts')
      .select('*')
      .eq('booking_id', params.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('booking_payment_tokens')
      .select('id,expires_at,created_at')
      .eq('booking_id', params.id)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
  ]);

  if (bookingResult.error || !bookingResult.data) throw error(404, 'Rezervacija nije pronađena.');
  return {
    booking: bookingResult.data,
    events: events.data ?? [],
    emailAttempts: emails.data ?? [],
    paymentAttempts: payments.data ?? [],
    activeToken: activeTokens.data?.[0] ?? null
  };
};

export const actions: Actions = {
  status: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const status = String(form.get('status') ?? '');
    if (!bookingStatuses.has(status)) return fail(400, { message: 'Neispravan status.' });

    const { data: before } = await getBooking(params.id);
    if (!before) return fail(404, { message: 'Rezervacija nije pronađena.' });
    if (before.status === status) return { message: 'Status je već postavljen.' };

    const { data: after, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();
    if (updateError) return fail(400, { message: updateError.message });

    let emailSent: boolean | null = null;
    if (status === 'confirmed') {
      emailSent = await sendBookingConfirmed(after, administrator.user.id);
      await supabaseAdmin
        .from('bookings')
        .update({ confirmation_email_sent: emailSent })
        .eq('id', params.id);
    }

    await recordAdminEvent({
      administrator,
      entityType: 'booking',
      entityId: params.id,
      action: 'booking_status_changed',
      beforeState: { status: before.status },
      afterState: { status },
      metadata: emailSent === null ? {} : { confirmation_email_sent: emailSent }
    });
    if (status === 'cancelled' || status === 'completed') {
      await revokeSecondPaymentTokens(params.id);
    }

    return {
      message: emailSent === false
        ? 'Status je spremljen, ali email nije poslan. Možete ga ponovno poslati.'
        : 'Status rezervacije je spremljen.'
    };
  },

  payment: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const part = String(form.get('part') ?? '');
    const status = String(form.get('status') ?? '');
    if (!['1', '2'].includes(part) || !paymentStatuses.has(status)) {
      return fail(400, { message: 'Neispravan status plaćanja.' });
    }

    const { data: before } = await getBooking(params.id);
    if (!before) return fail(404, { message: 'Rezervacija nije pronađena.' });
    if (part === '2' && !before.payment_split) {
      return fail(400, { message: 'Rezervacija nema drugu ratu.' });
    }

    const patch = part === '1'
      ? { first_payment_status: status }
      : { second_payment_status: status };
    const first = part === '1' ? status : before.first_payment_status;
    const second = part === '2' ? status : before.second_payment_status;
    const paymentStatus = first === 'paid' && (!before.payment_split || second === 'paid')
      ? 'paid'
      : first === 'paid' || second === 'paid'
        ? 'partial'
        : 'unpaid';

    const { data: after, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ ...patch, payment_status: paymentStatus })
      .eq('id', params.id)
      .select()
      .single();
    if (updateError) return fail(400, { message: updateError.message });

    await Promise.all([
      supabaseAdmin.from('payment_attempts').insert({
        booking_id: params.id,
        payment_part: Number(part),
        provider: 'admin',
        action: 'manual_status_change',
        status,
        metadata: { actor_email: administrator.email }
      }),
      recordAdminEvent({
        administrator,
        entityType: 'booking',
        entityId: params.id,
        action: 'payment_status_changed',
        beforeState: {
          first_payment_status: before.first_payment_status,
          second_payment_status: before.second_payment_status,
          payment_status: before.payment_status
        },
        afterState: {
          first_payment_status: after.first_payment_status,
          second_payment_status: after.second_payment_status,
          payment_status: after.payment_status
        },
        metadata: { payment_part: Number(part) }
      })
    ]);

    if (after.second_payment_status === 'paid') await revokeSecondPaymentTokens(params.id);
    return { message: 'Status plaćanja je spremljen.' };
  },

  retryConfirmation: async ({ params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const { data: booking } = await getBooking(params.id);
    if (!booking) return fail(404, { message: 'Rezervacija nije pronađena.' });
    if (booking.status !== 'confirmed') {
      return fail(400, { message: 'Email potvrde može se poslati samo za potvrđenu rezervaciju.' });
    }
    const sent = await sendBookingConfirmed(booking, administrator.user.id);
    await supabaseAdmin
      .from('bookings')
      .update({ confirmation_email_sent: sent })
      .eq('id', params.id);
    await recordAdminEvent({
      administrator,
      entityType: 'booking',
      entityId: params.id,
      action: 'confirmation_email_retried',
      metadata: { sent }
    });
    return {
      message: sent ? 'Email potvrde je poslan.' : 'Email nije poslan. Provjerite zapis pokušaja.'
    };
  },

  generatePaymentLink: async ({ params, locals, url }) => {
    const administrator = await requireAdministrator(locals);
    const { data: booking } = await getBooking(params.id);
    if (
      !booking?.payment_split ||
      booking.status !== 'confirmed' ||
      booking.second_payment_status === 'paid'
    ) {
      return fail(400, { message: 'Za ovu rezervaciju nije potrebna doplata.' });
    }

    const pickupExpiry = new Date(`${booking.pickup_date}T23:59:59Z`);
    const minimumExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiresAt = pickupExpiry > minimumExpiry ? pickupExpiry : minimumExpiry;
    const token = await createSecondPaymentToken({
      bookingId: booking.id,
      expiresAt: expiresAt.toISOString(),
      createdBy: administrator.user.id
    });
    const paymentLink = `${url.origin}/platforma/doplata/${booking.id}?token=${encodeURIComponent(token)}`;

    await recordAdminEvent({
      administrator,
      entityType: 'booking',
      entityId: params.id,
      action: 'second_payment_link_generated',
      metadata: { expires_at: expiresAt.toISOString() }
    });
    return { message: 'Nova poveznica je izrađena. Prethodna više ne vrijedi.', paymentLink };
  },

  revokePaymentLink: async ({ params, locals }) => {
    const administrator = await requireAdministrator(locals);
    await revokeSecondPaymentTokens(params.id);
    await recordAdminEvent({
      administrator,
      entityType: 'booking',
      entityId: params.id,
      action: 'second_payment_link_revoked'
    });
    return { message: 'Poveznica za doplatu je opozvana.' };
  }
};
