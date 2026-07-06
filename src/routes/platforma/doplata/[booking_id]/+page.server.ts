import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { corvuspayAvailable, hub3BarcodeDataUrl, hub3Payload, type IbanSetting } from '$lib/payments.server';
import { validateSecondPaymentToken } from '$lib/payment-tokens.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
  setHeaders({ 'cache-control': 'no-store, private' });
  const token = url.searchParams.get('token') ?? '';
  if (!(await validateSecondPaymentToken(params.booking_id, token))) {
    throw error(404, 'Doplata nije pronađena ili poveznica više ne vrijedi.');
  }
  const [{ data: booking }, { data: rows }] = await Promise.all([
    supabaseAdmin.from('bookings')
      .select('id,confirmation_number,driver_name,second_payment_amount,second_payment_due_date,second_payment_status,first_payment_status,payment_split,status')
      .eq('id', params.booking_id).single(),
    supabaseAdmin.from('settings').select('key,value').in('key', ['ibans', 'company'])
  ]);
  if (
    !booking?.payment_split ||
    booking.status !== 'confirmed' ||
    booking.first_payment_status !== 'paid' ||
    booking.second_payment_status === 'paid'
  ) {
    throw error(404, 'Doplata nije pronađena.');
  }
  const settings = Object.fromEntries((rows ?? []).map((row) => [row.key, row.value]));
  const company = (settings.company ?? {}) as { name?: string; address?: string };
  const bankTransfers = await Promise.all(((settings.ibans ?? []) as IbanSetting[]).map(async (account) => {
    const payload = hub3Payload({
      amount: Number(booking.second_payment_amount),
      recipient: company.name ?? 'Petroni d.o.o.',
      address: company.address ?? '',
      iban: account.iban,
      reference: booking.confirmation_number,
      description: `Doplata ${booking.confirmation_number}`
    });
    return { ...account, barcode: await hub3BarcodeDataUrl(payload) };
  }));
  return { booking, bankTransfers, corvuspayAvailable: corvuspayAvailable(), token };
};
