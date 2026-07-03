import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { supabaseAdmin } from '$lib/supabase.server';
import { createInvoicePdf } from '$lib/invoice.server';

async function emailConfig() {
  const { data } = await supabaseAdmin.from('settings').select('key,value').in('key', ['admin_email', 'email_from', 'company']);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    admin: String(settings.admin_email ?? 'info@petroni.hr'),
    from: env.RESEND_FROM_EMAIL || String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
    company: (settings.company ?? {}) as { name?: string; oib?: string; address?: string }
  };
}

async function send(message: Parameters<Resend['emails']['send']>[0]): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const result = await new Resend(env.RESEND_API_KEY).emails.send(message);
  if (result.error) throw new Error(result.error.message);
  return true;
}

export async function sendBookingReceived(booking: Record<string, any>) {
  const config = await emailConfig();
  const details = `<p>Broj rezervacije: <strong>${booking.confirmation_number}</strong></p><p>${booking.pickup_date} - ${booking.dropoff_date}</p><p>Ukupno: ${Number(booking.total_price).toFixed(2)} EUR</p>`;
  const results = await Promise.all([
    send({ from: config.from, to: booking.driver_email, subject: 'Zahtjev za rezervaciju zaprimljen', html: `<h1>Zahtjev je zaprimljen</h1>${details}<p>Rezervacija čeka pregled i potvrdu.</p>` }),
    send({ from: config.from, to: config.admin, subject: `Nova rezervacija ${booking.confirmation_number}`, html: `<h1>Nova rezervacija</h1><p>${booking.driver_name} ${booking.driver_last_name}</p>${details}` })
  ]);
  return results.every(Boolean);
}

export async function sendBookingConfirmed(booking: Record<string, any>) {
  const config = await emailConfig();
  return send({ from: config.from, to: booking.driver_email, subject: `Rezervacija ${booking.confirmation_number} potvrđena`, html: `<h1>Rezervacija je potvrđena</h1><p>Termin: ${booking.pickup_date} - ${booking.dropoff_date}</p>` });
}

export async function sendOrderInvoice(order: Record<string, any>) {
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
  return send({
    from: config.from,
    to: order.customer_email,
    subject: `Račun ${order.confirmation_number ?? ''}`.trim(),
    html: '<h1>Vaša narudžba je plaćena i poslana</h1><p>Račun se nalazi u privitku.</p>',
    attachments: [{ filename: `racun-${order.confirmation_number ?? order.id}.pdf`, content: Buffer.from(pdf) }]
  });
}
