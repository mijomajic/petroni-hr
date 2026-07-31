import { supabaseAdmin } from '$lib/supabase.server';
import { parseCorvuspayOrderNumber } from '$lib/corvuspay.server';
import {
  corvuspayStatusApiAvailable,
  corvuspayTransactionStatus
} from '$lib/payments.server';
import {
  classifyCorvuspayReconciliation,
  corvuspayReconciliationSeverity,
  type CorvuspayReconciliationKind
} from '$lib/corvuspay-reconciliation';
import { sendPaymentReconciliationAlert } from '$lib/email.server';

export type ReconciliationTrigger = 'scheduled' | 'admin' | 'callback';

export type CorvuspayReconciliationResult = {
  providerReference: string;
  kind: CorvuspayReconciliationKind;
  providerStatus: string | null;
  localStatus: string;
  expectedAmount: number;
  incidentId: string | null;
  alerted: boolean;
};

type LocalPayment = {
  bookingId?: string;
  orderId?: string;
  paymentPart?: 1 | 2;
  expectedAmount: number;
  localStatus: string;
  localPaid: boolean;
  adminPath: string;
};

async function localPayment(providerReference: string): Promise<LocalPayment | null> {
  const reference = parseCorvuspayOrderNumber(providerReference);
  if (!reference) return null;

  if (reference.kind === 'order') {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id,total,payment_status,payment_method,corvuspay_order_id')
      .eq('id', reference.orderId)
      .eq('payment_method', 'corvuspay')
      .eq('corvuspay_order_id', providerReference)
      .maybeSingle();
    if (!order) return null;
    return {
      orderId: order.id,
      expectedAmount: Number(order.total),
      localStatus: String(order.payment_status),
      localPaid: order.payment_status === 'paid',
      adminPath: `/admin/narudzbe/${order.id}`
    };
  }

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id,payment_method,payment_split,first_payment_amount,second_payment_amount,first_payment_status,second_payment_status')
    .eq('id', reference.bookingId)
    .eq('payment_method', 'corvuspay')
    .maybeSingle();
  if (!booking || (reference.paymentPart === 2 && !booking.payment_split)) return null;
  const localStatus = reference.paymentPart === 1
    ? String(booking.first_payment_status)
    : String(booking.second_payment_status);
  return {
    bookingId: booking.id,
    paymentPart: reference.paymentPart,
    expectedAmount: Number(reference.paymentPart === 1 ? booking.first_payment_amount : booking.second_payment_amount),
    localStatus,
    localPaid: localStatus === 'paid',
    adminPath: `/admin/rezervacije/${booking.id}`
  };
}

async function resolveIncident(providerReference: string, note: string) {
  await supabaseAdmin
    .from('payment_reconciliation_incidents')
    .update({
      state: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_note: note,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('provider', 'corvuspay')
    .eq('provider_reference', providerReference)
    .eq('state', 'open');
}

export async function reconcileCorvuspayReference(
  providerReference: string,
  options: { trigger: ReconciliationTrigger; sendAlert?: boolean }
): Promise<CorvuspayReconciliationResult> {
  const payment = await localPayment(providerReference);
  if (!payment) throw new Error('CorvusPay referenca nije povezana s Petroni zapisom.');

  const apiConfigured = corvuspayStatusApiAvailable();
  const provider = apiConfigured
    ? await corvuspayTransactionStatus(providerReference)
    : null;
  const kind = classifyCorvuspayReconciliation({
    providerStatus: provider?.status ?? null,
    localPaid: payment.localPaid
  });
  const severity = corvuspayReconciliationSeverity(kind);
  const now = new Date();

  await supabaseAdmin.from('payment_attempts').insert({
    booking_id: payment.bookingId ?? null,
    order_id: payment.orderId ?? null,
    payment_part: payment.paymentPart ?? null,
    provider: 'corvuspay',
    action: 'status_reconciled',
    status: severity ? 'attention_required' : 'matched',
    provider_reference: providerReference,
    metadata: {
      trigger: options.trigger,
      provider_status: provider?.status ?? null,
      provider_response_code: provider?.responseCode ?? null,
      local_status: payment.localStatus,
      expected_amount: payment.expectedAmount,
      api_certificate_configured: apiConfigured
    }
  });

  if (!severity) {
    await resolveIncident(providerReference, `Automatski usklađeno: ${provider?.status}/${payment.localStatus}.`);
    return {
      providerReference,
      kind,
      providerStatus: provider?.status ?? null,
      localStatus: payment.localStatus,
      expectedAmount: payment.expectedAmount,
      incidentId: null,
      alerted: false
    };
  }

  const { data: existing } = await supabaseAdmin
    .from('payment_reconciliation_incidents')
    .select('id,last_alerted_at')
    .eq('provider', 'corvuspay')
    .eq('provider_reference', providerReference)
    .maybeSingle();
  const { data: incident, error: incidentError } = await supabaseAdmin
    .from('payment_reconciliation_incidents')
    .upsert({
      provider: 'corvuspay',
      provider_reference: providerReference,
      booking_id: payment.bookingId ?? null,
      order_id: payment.orderId ?? null,
      payment_part: payment.paymentPart ?? null,
      expected_amount: payment.expectedAmount,
      currency: 'EUR',
      provider_status: provider?.status ?? 'lookup_failed',
      local_status: payment.localStatus,
      severity,
      state: 'open',
      last_checked_at: now.toISOString(),
      resolved_at: null,
      resolution_note: null,
      details: {
        trigger: options.trigger,
        provider_response_code: provider?.responseCode ?? null,
        api_certificate_configured: apiConfigured
      },
      updated_at: now.toISOString()
    }, { onConflict: 'provider,provider_reference' })
    .select('id,last_alerted_at')
    .single();
  if (incidentError || !incident) throw new Error(`Incident nije spremljen: ${incidentError?.message ?? 'nepoznata greška'}`);

  const lastAlertedAt = incident.last_alerted_at ?? existing?.last_alerted_at;
  const alertExpired = !lastAlertedAt || now.getTime() - new Date(lastAlertedAt).getTime() >= 24 * 60 * 60 * 1000;
  let alerted = false;
  if (options.sendAlert !== false && alertExpired) {
    alerted = await sendPaymentReconciliationAlert({
      bookingId: payment.bookingId,
      orderId: payment.orderId,
      providerReference,
      expectedAmount: payment.expectedAmount,
      providerStatus: provider?.status ?? (apiConfigured ? 'status lookup nije uspio' : 'API certifikat nije konfiguriran'),
      localStatus: payment.localStatus,
      severity,
      adminPath: payment.adminPath
    });
    if (alerted) {
      await supabaseAdmin
        .from('payment_reconciliation_incidents')
        .update({ last_alerted_at: now.toISOString(), updated_at: now.toISOString() })
        .eq('id', incident.id);
    }
  }

  return {
    providerReference,
    kind,
    providerStatus: provider?.status ?? null,
    localStatus: payment.localStatus,
    expectedAmount: payment.expectedAmount,
    incidentId: incident.id,
    alerted
  };
}

export async function runCorvuspayReconciliation(trigger: ReconciliationTrigger = 'scheduled') {
  const { data: run, error: runError } = await supabaseAdmin
    .from('payment_reconciliation_runs')
    .insert({ provider: 'corvuspay', trigger_source: trigger })
    .select('id')
    .single();
  if (runError || !run) throw new Error(`Reconciliation run nije pokrenut: ${runError?.message ?? 'nepoznata greška'}`);

  try {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: attempts }, { data: openIncidents }] = await Promise.all([
      supabaseAdmin
        .from('payment_attempts')
        .select('provider_reference,created_at')
        .eq('provider', 'corvuspay')
        .eq('action', 'redirect_created')
        .not('provider_reference', 'is', null)
        .gte('created_at', since)
        .lte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(250),
      supabaseAdmin
        .from('payment_reconciliation_incidents')
        .select('provider_reference')
        .eq('provider', 'corvuspay')
        .eq('state', 'open')
        .limit(100)
    ]);
    const references = [...new Set([
      ...(openIncidents ?? []).map((row) => String(row.provider_reference)),
      ...(attempts ?? []).map((row) => String(row.provider_reference))
    ])].slice(0, 50);

    const results: CorvuspayReconciliationResult[] = [];
    let errorCount = 0;
    let lookupWarningSent = false;
    for (let index = 0; index < references.length; index += 3) {
      const batch = await Promise.all(references.slice(index, index + 3).map(async (reference) => {
        try {
          const result = await reconcileCorvuspayReference(reference, {
            trigger,
            sendAlert: corvuspayStatusApiAvailable() || !lookupWarningSent
          });
          if (result.kind === 'lookup_failed' && result.alerted) lookupWarningSent = true;
          return result;
        } catch (caught) {
          errorCount += 1;
          console.error('CorvusPay reconciliation item failed', {
            providerReference: reference,
            message: caught instanceof Error ? caught.message : String(caught)
          });
          return null;
        }
      }));
      results.push(...batch.filter((result): result is CorvuspayReconciliationResult => Boolean(result)));
    }

    const incidentCount = results.filter((result) => result.incidentId).length;
    const summary = {
      scanned_count: references.length,
      matched_count: results.length - incidentCount,
      incident_count: incidentCount,
      error_count: errorCount,
      status: errorCount === references.length && references.length > 0 ? 'failed' : 'completed',
      completed_at: new Date().toISOString(),
      details: {
        status_api_configured: corvuspayStatusApiAvailable(),
        limit: 50
      }
    };
    await supabaseAdmin.from('payment_reconciliation_runs').update(summary).eq('id', run.id);
    return { runId: run.id, ...summary };
  } catch (caught) {
    await supabaseAdmin.from('payment_reconciliation_runs').update({
      status: 'failed',
      error_count: 1,
      completed_at: new Date().toISOString(),
      details: { message: caught instanceof Error ? caught.message : String(caught) }
    }).eq('id', run.id);
    throw caught;
  }
}
