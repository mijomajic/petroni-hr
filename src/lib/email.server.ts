import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { supabaseAdmin } from '$lib/supabase.server';
import { createOrderConfirmationPdf } from '$lib/invoice.server';
import { renderTermsMarkup } from '$lib/terms-markup';

async function emailConfig() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('key,value')
    .in('key', ['admin_email', 'email_from', 'company', 'ibans']);
  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  return {
    admin: String(settings.admin_email ?? 'info@petroni.hr'),
    from: env.RESEND_FROM_EMAIL || String(settings.email_from ?? 'Petroni <onboarding@resend.dev>'),
    company: (settings.company ?? {}) as {
      name?: string;
      oib?: string;
      address?: string;
      email?: string;
      phone?: string;
      website?: string;
    },
    ibans: Array.isArray(settings.ibans) ? settings.ibans as Array<{ label?: string; bank?: string; iban?: string }> : []
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

const euro = (value: unknown) => `${Number(value ?? 0).toFixed(2)} EUR`;
const date = (value: unknown) => String(value ?? '').split('-').reverse().join('.');

function emailLayout(title: string, content: string) {
  return `<div style="margin:0;padding:32px 16px;background:#f5f5f3;font-family:Arial,sans-serif;color:#252525"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff"><tr><td style="padding:28px 32px;background:#252525;color:#ffffff"><div style="font-size:12px;letter-spacing:2px;font-weight:700">PETRONI</div><div style="margin-top:6px;font-size:14px;color:#d7d7d7">Najam kampera i oprema za putovanja</div></td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#252525">${title}</h1>${content}</td></tr><tr><td style="padding:20px 32px;background:#f5f5f3;font-size:12px;line-height:1.5;color:#666">Za pitanja nam odgovorite na ovaj email ili nam se javite na info@petroni.hr.</td></tr></table></div>`;
}

function detailRows(rows: Array<[string, unknown]>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border:1px solid #e6e6e6;border-collapse:collapse">${rows.map(([label, value]) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#666;font-size:14px">${escapeHtml(label)}</td><td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;text-align:right;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`).join('')}</table>`;
}

function bookingSummary(booking: Record<string, any>) {
  const vehicle = booking.vehicles?.name ?? booking.vehicle_name ?? 'Odabrano vozilo';
  return detailRows([
    ['Broj rezervacije', booking.confirmation_number],
    ['Vozilo', vehicle],
    ['Preuzimanje', `${booking.pickup_location}, ${date(booking.pickup_date)} u ${booking.pickup_time}`],
    ['Povrat', `${booking.dropoff_location}, ${date(booking.dropoff_date)} u ${booking.dropoff_time}`],
    ['Ukupno za najam', euro(booking.total_price)],
    ['Povratni depozit', euro(booking.deposit_amount)]
  ]);
}

function paymentSummary(booking: Record<string, any>, ibans: Array<{ label?: string; iban?: string }>) {
  const rows: Array<[string, unknown]> = [['Način plaćanja', booking.payment_method === 'bank_transfer' ? 'Bankovna uplata' : 'Kartično plaćanje']];
  if (booking.payment_split) {
    rows.push(['Prva rata', euro(booking.first_payment_amount)], ['Druga rata', `${euro(booking.second_payment_amount)} do ${date(booking.second_payment_due_date)}`]);
  } else {
    rows.push(['Iznos za uplatu', euro(booking.first_payment_amount ?? booking.total_price)]);
  }
  const ibansHtml = booking.payment_method === 'bank_transfer' && ibans.length
    ? `<p style="font-size:14px;line-height:1.6">Prilikom uplate obavezno navedite poziv na broj <strong>${escapeHtml(booking.confirmation_number)}</strong>.<br>${ibans.map((account) => `${escapeHtml(account.label ?? 'IBAN')}: <strong>${escapeHtml(account.iban ?? '')}</strong>`).join('<br>')}</p>`
    : '';
  return `${detailRows(rows)}${ibansHtml}`;
}

function orderSummary(order: Record<string, any>) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemRows = items.map((item: Record<string, any>) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e6e6e6;font-size:14px">${escapeHtml(item.name_hr ?? item.name ?? item.slug ?? 'Proizvod')} × ${escapeHtml(item.qty ?? item.quantity ?? 1)}</td><td style="padding:10px 0;border-bottom:1px solid #e6e6e6;text-align:right;font-size:14px;font-weight:700">${euro(Number(item.price ?? item.total ?? 0) * Number(item.qty ?? item.quantity ?? 1))}</td></tr>`).join('');
  const deliveryLabels: Record<string, string> = { overseas: 'Overseas dostava', boxnow: 'BoxNow paketomat', personal_pickup: 'Osobno preuzimanje' };
  const paymentLabels: Record<string, string> = { bank_transfer: 'Bankovna uplata', corvuspay: 'Kartično plaćanje', cash_on_delivery: 'Plaćanje pouzećem' };
  const surcharge = Number(order.payment_surcharge ?? 0);
  const locker = order.shipping_method === 'boxnow' ? order.shipping_address?.boxnow_locker : null;
  const breakdown = `<tr><td style="padding:10px 0;font-size:14px">Dostava: ${escapeHtml(deliveryLabels[order.shipping_method] ?? order.shipping_method ?? '-')}</td><td style="padding:10px 0;text-align:right;font-size:14px">${euro(order.shipping_cost)}</td></tr>${locker ? `<tr><td style="padding:6px 0;font-size:14px">BoxNow paketomat</td><td style="padding:6px 0;text-align:right;font-size:14px;font-weight:700">${escapeHtml(locker)}</td></tr>` : ''}${surcharge > 0 ? `<tr><td style="padding:6px 0;font-size:14px">Naknada za pouzeće</td><td style="padding:6px 0;text-align:right;font-size:14px">${euro(surcharge)}</td></tr>` : ''}<tr><td style="padding:6px 0;font-size:14px">Plaćanje: ${escapeHtml(paymentLabels[order.payment_method] ?? order.payment_method ?? '-')}</td><td></td></tr>`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;border-collapse:collapse">${itemRows}${breakdown}<tr><td style="padding:14px 0;font-size:16px;font-weight:700">Ukupno</td><td style="padding:14px 0;text-align:right;font-size:16px;font-weight:700">${euro(order.total)}</td></tr></table>`;
}

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
  const details = bookingSummary(booking);
  const termsBlock = terms?.content_hr
    ? `<hr style="border:0;border-top:1px solid #e6e6e6;margin:28px 0"><p style="font-size:14px"><strong>Uvjeti najma — verzija ${escapeHtml(terms.version)}</strong></p><div style="font-size:13px;line-height:1.55;color:#333">${renderTermsMarkup(terms.content_hr)}</div>`
    : '';
  const results = await Promise.all([
    send(
      { from: config.from, replyTo: config.admin, to: booking.driver_email, subject: `Zaprimili smo zahtjev za rezervaciju ${booking.confirmation_number}`, html: emailLayout('Zahtjev za rezervaciju je zaprimljen', `<p style="font-size:16px;line-height:1.6">Hvala, ${escapeHtml(booking.driver_name)}. Provjerit ćemo dostupnost i javiti vam se s potvrdom i daljnjim uputama.</p>${details}${paymentSummary(booking, config.ibans)}${termsBlock}`) },
      { bookingId: booking.id, messageType: 'booking_received_customer', recipient: booking.driver_email }
    ),
    send(
      { from: config.from, replyTo: booking.driver_email, to: config.admin, subject: `Nova rezervacija ${booking.confirmation_number}`, html: emailLayout('Nova rezervacija čeka pregled', `<p style="font-size:15px;line-height:1.6"><strong>${escapeHtml(booking.driver_name)} ${escapeHtml(booking.driver_last_name)}</strong><br>${escapeHtml(booking.driver_email)} · ${escapeHtml(booking.driver_phone)}</p>${details}${paymentSummary(booking, config.ibans)}<p style="font-size:14px">Otvorite administraciju za potpuni pregled podataka vozača, obračuna i e-suglasnosti.</p>`) },
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
    { from: config.from, replyTo: config.admin, to: booking.driver_email, subject: `Potvrđena rezervacija ${booking.confirmation_number}`, html: emailLayout('Vaša rezervacija je potvrđena', `<p style="font-size:16px;line-height:1.6">Veselimo se vašem putovanju. Sačuvajte ovaj email; ovdje su najvažniji podaci za preuzimanje vozila.</p>${bookingSummary(booking)}${paymentSummary(booking, config.ibans)}<p style="font-size:14px;line-height:1.6">Ako trebate promijeniti podatke ili imate pitanje prije preuzimanja, odgovorite na ovaj email.</p>`) },
    {
      bookingId: booking.id,
      messageType: 'booking_confirmed_customer',
      recipient: booking.driver_email,
      attemptedBy
    }
  );
}

export async function sendBookingCancelled(
  booking: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: booking.driver_email, subject: `Otkazana rezervacija ${booking.confirmation_number}`, html: emailLayout('Rezervacija je otkazana', `<p style="font-size:16px;line-height:1.6">Vaša rezervacija <strong>${escapeHtml(booking.confirmation_number)}</strong> je otkazana.</p>${bookingSummary(booking)}<p style="font-size:14px;line-height:1.6">Ova obavijest nije potvrda povrata novca. Ako je uplata već evidentirana, zasebno ćemo vam potvrditi način i rok povrata.</p>`) },
    {
      bookingId: booking.id,
      messageType: 'booking_cancelled_customer',
      recipient: booking.driver_email,
      attemptedBy
    }
  );
}

export async function sendSecondPaymentLink(booking: Record<string, any>, paymentLink: string, attemptedBy?: string) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: booking.driver_email, subject: `Doplata za rezervaciju ${booking.confirmation_number}`, html: emailLayout('Dostupna je poveznica za doplatu', `<p style="font-size:16px;line-height:1.6">Preostali iznos za vašu rezervaciju je <strong>${euro(booking.second_payment_amount)}</strong>. Rok za uplatu je ${date(booking.second_payment_due_date)}.</p><p style="margin:24px 0"><a href="${escapeHtml(paymentLink)}" style="display:inline-block;padding:13px 18px;background:#252525;color:#ffffff;text-decoration:none;font-weight:700">Otvori doplatu</a></p><p style="font-size:13px;line-height:1.6;color:#666">Poveznica vrijedi do dana preuzimanja. Ako imate pitanje, odgovorite na ovaj email.</p>`) },
    { bookingId: booking.id, messageType: 'booking_second_payment_link_customer', recipient: booking.driver_email, attemptedBy }
  );
}

export async function sendSecondPaymentReceived(booking: Record<string, any>) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: booking.driver_email, subject: `Doplata evidentirana za rezervaciju ${booking.confirmation_number}`, html: emailLayout('Doplata je uspješno evidentirana', `<p style="font-size:16px;line-height:1.6">Evidentirali smo preostalu uplatu od <strong>${euro(booking.second_payment_amount)}</strong> za rezervaciju <strong>${escapeHtml(booking.confirmation_number)}</strong>.</p><p style="font-size:14px;line-height:1.6">Rezervacija je sada u cijelosti plaćena. Ako imate pitanje prije preuzimanja, odgovorite na ovaj email.</p>`) },
    {
      bookingId: booking.id,
      messageType: 'booking_second_payment_received_customer',
      recipient: booking.driver_email
    }
  );
}

export async function sendOrderReceived(order: Record<string, any>) {
  const config = await emailConfig();
  const summary = orderSummary(order);
  const payment = order.payment_method === 'bank_transfer'
    ? 'Odabrali ste bankovnu uplatu. Podaci za uplatu prikazani su nakon narudžbe.'
    : order.payment_method === 'cash_on_delivery'
      ? 'Odabrali ste plaćanje pouzećem.'
      : 'Odabrali ste kartično plaćanje.';
  return Promise.all([
    send(
      { from: config.from, replyTo: config.admin, to: order.customer_email, subject: `Zaprimili smo narudžbu ${order.confirmation_number}`, html: emailLayout('Hvala na narudžbi', `<p style="font-size:16px;line-height:1.6">Narudžba <strong>${escapeHtml(order.confirmation_number)}</strong> je zaprimljena. ${payment}</p>${summary}<p style="font-size:14px;line-height:1.6">Obavijestit ćemo vas kada narudžba bude plaćena i poslana. Nakon slanja dobit ćete PDF potvrdu narudžbe i plaćanja.</p>`) },
      { orderId: order.id, messageType: 'order_received_customer', recipient: order.customer_email }
    ),
    send(
      { from: config.from, replyTo: order.customer_email, to: config.admin, subject: `Nova shop narudžba ${order.confirmation_number}`, html: emailLayout('Nova shop narudžba', `<p style="font-size:15px;line-height:1.6"><strong>${escapeHtml(order.customer_name)}</strong><br>${escapeHtml(order.customer_email)} · ${escapeHtml(order.customer_phone)}</p>${summary}`) },
      { orderId: order.id, messageType: 'order_received_admin', recipient: config.admin }
    )
  ]);
}

export async function sendOrderCancelled(
  order: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: order.customer_email, subject: `Otkazana narudžba ${order.confirmation_number}`, html: emailLayout('Narudžba je otkazana', `<p style="font-size:16px;line-height:1.6">Vaša narudžba <strong>${escapeHtml(order.confirmation_number)}</strong> je otkazana.</p>${orderSummary(order)}<p style="font-size:14px;line-height:1.6">Ova obavijest nije potvrda povrata novca. Ako je uplata već evidentirana, zasebno ćemo vam potvrditi način i rok povrata.</p>`) },
    {
      orderId: order.id,
      messageType: 'order_cancelled_customer',
      recipient: order.customer_email,
      attemptedBy
    }
  );
}

export async function sendOrderProcessing(
  order: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: order.customer_email, subject: `Narudžba ${order.confirmation_number} je potvrđena`, html: emailLayout('Narudžba je potvrđena i u obradi', `<p style="font-size:16px;line-height:1.6">Potvrdili smo narudžbu <strong>${escapeHtml(order.confirmation_number)}</strong> i započeli obradu.</p>${orderSummary(order)}<p style="font-size:14px;line-height:1.6">Poslat ćemo vam novu obavijest kada pošiljka bude spremna i poslana.</p>`) },
    { orderId: order.id, messageType: 'order_processing_customer', recipient: order.customer_email, attemptedBy }
  );
}

export async function sendOrderPaymentReceived(
  order: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  return send(
    { from: config.from, replyTo: config.admin, to: order.customer_email, subject: `Uplata evidentirana za narudžbu ${order.confirmation_number}`, html: emailLayout('Uplata je evidentirana', `<p style="font-size:16px;line-height:1.6">Evidentirali smo uplatu za narudžbu <strong>${escapeHtml(order.confirmation_number)}</strong>.</p>${orderSummary(order)}<p style="font-size:14px;line-height:1.6">Narudžbu ćemo pripremiti za slanje. Nakon slanja dobit ćete PDF potvrdu narudžbe i plaćanja.</p>`) },
    { orderId: order.id, messageType: 'order_payment_received_customer', recipient: order.customer_email, attemptedBy }
  );
}

export async function sendOrderConfirmation(
  order: Record<string, any>,
  attemptedBy?: string
) {
  const config = await emailConfig();
  const pdf = await createOrderConfirmationPdf({
    number: order.confirmation_number ?? order.id.slice(0, 8).toUpperCase(),
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    company: config.company,
    ibans: config.ibans,
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping_cost),
    paymentSurcharge: Number(order.payment_surcharge),
    deliveryMethod: order.shipping_method,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status
  });
  return send(
    {
      from: config.from,
      replyTo: config.admin,
      to: order.customer_email,
      subject: `Potvrda narudžbe i plaćanja ${order.confirmation_number ?? ''}`.trim(),
      html: emailLayout('Narudžba je plaćena i poslana', `<p style="font-size:16px;line-height:1.6">Vaša narudžba <strong>${escapeHtml(order.confirmation_number)}</strong> je poslana. PDF potvrda narudžbe i plaćanja nalazi se u privitku. Ovaj dokument nije službeni fiskalizirani račun.</p>${orderSummary(order)}<p style="font-size:14px;line-height:1.6">Hvala što kupujete kod Petronija.</p>`),
      attachments: [{ filename: `potvrda-narudzbe-${order.confirmation_number ?? order.id}.pdf`, content: Buffer.from(pdf) }]
    },
    {
      orderId: order.id,
      messageType: 'order_confirmation_customer',
      recipient: order.customer_email,
      attemptedBy
    }
  );
}

export async function sendContactInquiry(inquiry: {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  product?: string;
  productUrl?: string;
}) {
  const config = await emailConfig();
  if (!env.RESEND_API_KEY) return false;
  const productBlock = inquiry.product
    ? detailRows([
        ['Proizvod', inquiry.product],
        ['Poveznica', inquiry.productUrl || '—']
      ])
    : '';
  try {
    const result = await new Resend(env.RESEND_API_KEY).emails.send({
      from: config.from,
      replyTo: inquiry.email,
      to: config.admin,
      subject: `${inquiry.product ? 'Upit za proizvod' : 'Kontakt upit'} — ${inquiry.topic}`,
      html: emailLayout('Novi upit sa stranice', `<p style="font-size:15px;line-height:1.6"><strong>${escapeHtml(inquiry.name)}</strong><br>${escapeHtml(inquiry.email)}${inquiry.phone ? ` · ${escapeHtml(inquiry.phone)}` : ''}</p>${productBlock}<p style="margin-top:20px;font-size:15px;line-height:1.7;white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>`)
    });
    return !result.error;
  } catch {
    return false;
  }
}
