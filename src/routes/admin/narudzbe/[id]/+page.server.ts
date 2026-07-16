import { error, fail } from '@sveltejs/kit';
import { textField } from '$lib/admin-cms.server';
import { recordAdminEvent, requireAdministrator } from '$lib/admin.server';
import { sendOrderCancelled, sendOrderInvoice, sendOrderPaymentReceived, sendOrderProcessing } from '$lib/email.server';
import { supabaseAdmin } from '$lib/supabase.server';
import type { Actions, PageServerLoad } from './$types';

const orderStatuses = new Set(['pending', 'processing', 'completed', 'cancelled']);
const paymentStatuses = new Set(['unpaid', 'paid']);

async function getOrder(id: string) {
  return supabaseAdmin.from('orders').select('*').eq('id', id).single();
}

export const load: PageServerLoad = async ({ params }) => {
  const [order, events, emails, payments] = await Promise.all([
    getOrder(params.id),
    supabaseAdmin.from('admin_events').select('*').eq('entity_type', 'order').eq('entity_id', params.id).order('created_at', { ascending: false }),
    supabaseAdmin.from('email_attempts').select('*').eq('order_id', params.id).order('created_at', { ascending: false }),
    supabaseAdmin.from('payment_attempts').select('*').eq('order_id', params.id).order('created_at', { ascending: false })
  ]);
  if (order.error || !order.data) throw error(404, 'Narudžba nije pronađena.');
  return {
    order: order.data,
    events: events.data ?? [],
    emailAttempts: emails.data ?? [],
    paymentAttempts: payments.data ?? []
  };
};

export const actions: Actions = {
  status: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const status = textField(form, 'status');
    if (!orderStatuses.has(status)) return fail(400, { message: 'Neispravan status narudžbe.' });
    const { data: before } = await getOrder(params.id);
    if (!before) return fail(404, { message: 'Narudžba nije pronađena.' });
    if (before.status === status) return { message: 'Status je već postavljen.' };
    const patch: Record<string, unknown> = { status };
    if (status === 'completed') patch.shipped_at = new Date().toISOString();
    const { data: after, error: updateError } = await supabaseAdmin.from('orders').update(patch).eq('id', params.id).select().single();
    if (updateError) return fail(400, { message: updateError.message });

    let invoiceSent: boolean | null = null;
    let statusEmailSent: boolean | null = null;
    if (status === 'completed' && after.payment_status === 'paid' && !after.invoice_sent) {
      invoiceSent = await sendOrderInvoice(after, administrator.user.id);
      if (invoiceSent) {
        await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', params.id);
        after.invoice_sent = true;
      }
    } else if (status === 'cancelled') {
      statusEmailSent = await sendOrderCancelled(after, administrator.user.id);
    } else if (status === 'processing') {
      statusEmailSent = await sendOrderProcessing(after, administrator.user.id);
    }

    await recordAdminEvent({
      administrator,
      entityType: 'order',
      entityId: params.id,
      action: 'order_status_changed',
      beforeState: { status: before.status, shipped_at: before.shipped_at, invoice_sent: before.invoice_sent },
      afterState: { status: after.status, shipped_at: after.shipped_at, invoice_sent: after.invoice_sent },
      metadata: {
        ...(invoiceSent === null ? {} : { invoice_sent: invoiceSent }),
        ...(statusEmailSent === null ? {} : { status_email_sent: statusEmailSent, status_email_type: status })
      }
    });
    return {
      message: invoiceSent === false
        ? 'Status je spremljen, ali račun nije poslan.'
        : statusEmailSent === false
          ? 'Status je spremljen, ali pripadajući email nije poslan.'
          : 'Status narudžbe je spremljen.'
    };
  },

  payment: async ({ request, params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const form = await request.formData();
    const paymentStatus = textField(form, 'payment_status');
    if (!paymentStatuses.has(paymentStatus)) return fail(400, { message: 'Neispravan status plaćanja.' });
    const { data: before } = await getOrder(params.id);
    if (!before) return fail(404, { message: 'Narudžba nije pronađena.' });
    const { data: after, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', params.id)
      .select()
      .single();
    if (updateError) return fail(400, { message: updateError.message });

    let invoiceSent: boolean | null = null;
    let paymentEmailSent: boolean | null = null;
    if (paymentStatus === 'paid' && after.status === 'completed' && !after.invoice_sent) {
      invoiceSent = await sendOrderInvoice(after, administrator.user.id);
      if (invoiceSent) {
        await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', params.id);
        after.invoice_sent = true;
      }
    } else if (paymentStatus === 'paid' && before.payment_status !== 'paid') {
      paymentEmailSent = await sendOrderPaymentReceived(after, administrator.user.id);
    }

    await Promise.all([
      supabaseAdmin.from('payment_attempts').insert({
        order_id: params.id,
        provider: 'admin',
        action: 'manual_status_change',
        status: paymentStatus,
        metadata: { actor_email: administrator.email }
      }),
      recordAdminEvent({
        administrator,
        entityType: 'order',
        entityId: params.id,
        action: 'order_payment_status_changed',
        beforeState: { payment_status: before.payment_status },
        afterState: { payment_status: after.payment_status, invoice_sent: after.invoice_sent },
        metadata: {
          ...(invoiceSent === null ? {} : { invoice_sent: invoiceSent }),
          ...(paymentEmailSent === null ? {} : { payment_email_sent: paymentEmailSent })
        }
      })
    ]);
    return { message: invoiceSent === false
      ? 'Status plaćanja je spremljen, ali račun nije poslan.'
      : paymentEmailSent === false
        ? 'Status plaćanja je spremljen, ali email o uplati nije poslan.'
        : 'Status plaćanja je spremljen.' };
  },

  retryInvoice: async ({ params, locals }) => {
    const administrator = await requireAdministrator(locals);
    const { data: order } = await getOrder(params.id);
    if (!order) return fail(404, { message: 'Narudžba nije pronađena.' });
    if (order.payment_status !== 'paid' || order.status !== 'completed') {
      return fail(400, { message: 'Račun se šalje tek kada je narudžba plaćena i završena/poslana.' });
    }
    const sent = await sendOrderInvoice(order, administrator.user.id);
    if (sent) await supabaseAdmin.from('orders').update({ invoice_sent: true }).eq('id', params.id);
    await recordAdminEvent({
      administrator,
      entityType: 'order',
      entityId: params.id,
      action: 'order_invoice_retried',
      metadata: { sent }
    });
    return { message: sent ? 'Račun je poslan.' : 'Račun nije poslan. Provjerite email pokušaje.' };
  }
};
