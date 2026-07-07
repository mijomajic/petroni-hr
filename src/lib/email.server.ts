import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { supabaseAdmin } from '$lib/supabase.server';
import { createInvoicePdf } from '$lib/invoice.server';
import { renderTermsMarkup } from '$lib/terms-markup';

async function emailConfig() {
  const { data } = await supabaseAdmin.from('settings').select('key,value').in('key', ['admin_email', 'email_from', 'company']);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    admin: String(settings.admin_email ?? 'info@petroni.hr'),
    from: env.RESEND_FROM_EMAIL || String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
    company: (settings.company ?? {}) as { name?: string; oib?: string; address?: string }
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

type EmailContext = {
  bookingId?: string;
  orderId?: string;
  messageType: string;
  recipient: string;
  attemptedBy?: string;
};

async function recordEmailAttempt(
  context: EmailContext,
  result: {
    status: 'sent' | 'failed' | 'skipped';
    providerMessageId?: string;
    errorMessage?: string;
  }
) {
  const { error } = await supabaseAdmin.from('email_attempts').insert({
    booking_id: context.bookingId ?? null,
    order_id: context.orderId ?? null,
    message_type: context.messageType,
    recipient: context.recipient,
    status: result.status,
    provider_message_id: result.providerMessageId ?? null,
    error_message: result.errorMessage?.slice(0, 500) ?? null,
    attempted_by: context.attemptedBy ?? null
  });
  if (error) console.error('Email attempt audit failed', error.message);
}

async function send(
  message: Parameters<Resend['emails']['send']>[0],
  context: EmailContext
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    await recordEmailAttempt(context, {
      status: 'skipped',
      errorMessage: 'RESEND_API_KEY nije konfiguriran.'
    });
    return false;
  }
  try {
    const result = await new Resend(env.RESEND_API_KEY).emails.send(message);
    if (result.error) {
      await recordEmailAttempt(context, {
        status: 'failed',
        errorMessage: result.error.message
      });
      return false;
    }
    await recordEmailAttempt(context, {
      status: 'sent',
      providerMessageId: result.data?.id
    });
    return true;
  } catch (sendError) {
    await recordEmailAttempt(context, {
      status: 'failed',
      errorMessage: sendError instanceof Error ? sendError.message : 'Nepoznata greška slanja.'
    });
    return false;
  }
}

export async function sendBookingReceived(
  booking: Record<string, any>,
  terms?: { version?: string | null; content_hr?: string | null }
) {
  const config = await emailConfig();
  const details = `<p>Broj rezervacije: <strong>${escapeHtml(booking.confirmation_number)}</strong></p><p>${escapeHtml(booking.pickup_date)} - ${escapeHtml(booking.dropoff_date)}</p><p>Ukupno: ${Number(booking.total_price).toFixed(2)} EUR</p>`;
  const termsBlock = terms?.content_hr
    ? `<hr><p><strong>Uvjeti najma - verzija ${escapeHtml(terms.version)}</strong></p><div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#333">${renderTermsMarkup(terms.content_hr)}</div>`
    : '';
  const results = await Promise.all([
    send(
      { from: config.from, to: booking.driver_email, subject: 'Zahtjev za rezervaciju zaprimljen', html: `<h1>Zahtjev je zaprimljen</h1>${details}<p>Rezervacija čeka pregled i potvrdu.</p>${termsBlock}` },
      { bookingId: booking.id, messageType: 'booking_received_customer', recipient: booking.driver_email }
    ),
    send(
      { from: config.from, to: config.admin, subject: `Nova rezervacija ${booking.confirmation_number}`, html: `<h1>Nova rezervacija</h1><p>${escapeHtml(booking.driver_name)} ${escapeHtml(booking.driver_last_name)}</p>${details}` },
      { bookingId: booking.id, messageType: 'booking_received_admin', recipient: config.admin }
    )
  ]);
  return results.every(Boolean);
}

export async function sendBookingConfirmed(
  booking: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  return send(
    { from: config.from, to: booking.driver_email, subject: `Rezervacija ${booking.confirmation_number} potvrđena`, html: `<h1>Rezervacija je potvrđena</h1><p>Termin: ${escapeHtml(booking.pickup_date)} - ${escapeHtml(booking.dropoff_date)}</p>` },
    {
      bookingId: booking.id,
      messageType: 'booking_confirmed_customer',
      recipient: booking.driver_email,
      attemptedBy
    }
  );
}

export async function sendOrderInvoice(
  order: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  const pdf = await createInvoicePdf({
    number: order.confirmation_number ?? order.id.slice(0, 8).toUpperCase(),
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    company: config.company,
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total),
    paymentStatus: order.payment_status
  });
  return send(
    {
      from: config.from,
      to: order.customer_email,
      subject: `Račun ${order.confirmation_number ?? ''}`.trim(),
      html: '<h1>Vaša narudžba je plaćena i poslana</h1><p>Račun se nalazi u privitku.</p>',
      attachments: [{ filename: `racun-${order.confirmation_number ?? order.id}.pdf`, content: Buffer.from(pdf) }]
    },
    {
      orderId: order.id,
      messageType: 'order_invoice_customer',
      recipient: order.customer_email,
      attemptedBy
    }
  );
}
