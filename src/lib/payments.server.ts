import { env } from '$env/dynamic/private';
import bwipjs from 'bwip-js';
import { signCorvuspayFields, verifyCorvuspayFields } from '$lib/corvuspay.server';

export type IbanSetting = { bank: string; iban: string; bic?: string };

export function paymentAmount(total: number, split: boolean, part: 1 | 2 = 1): number {
  if (!split) return Math.round(total * 100) / 100;
  const first = Math.round(total * 50) / 100;
  return part === 1 ? first : Math.round((total - first) * 100) / 100;
}

export function hub3Payload(input: {
  amount: number;
  recipient: string;
  address: string;
  iban: string;
  reference: string;
  description: string;
}): string {
  const cents = Math.round(input.amount * 100).toString().padStart(15, '0');
  return [
    'HRVHUB30', 'EUR', cents, '', '', '', input.recipient.slice(0, 25),
    input.address.slice(0, 25), '', input.iban.replace(/\s/g, ''), 'HR00',
    input.reference.replace(/[^0-9A-Za-z-]/g, '').slice(0, 22), 'COST',
    input.description.slice(0, 35)
  ].join('\n');
}

export async function hub3BarcodeDataUrl(payload: string): Promise<string> {
  const png = await bwipjs.toBuffer({
    bcid: 'pdf417',
    text: payload,
    scale: 2,
    height: 12,
    includetext: false
  });
  return `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
}

export function corvuspayAvailable(): boolean {
  return Boolean(
    env.CORVUSPAY_STORE_ID &&
    env.CORVUSPAY_SECRET_KEY &&
    ['test', 'production'].includes(env.CORVUSPAY_ENV?.toLowerCase() ?? '')
  );
}

export function createCorvuspayRedirect(input: {
  orderNumber: string;
  amount: number;
  description: string;
  email: string;
  baseUrl: string;
  successPath?: string;
  cancelPath?: string;
}): { url: string; fields: Record<string, string> } | null {
  if (!corvuspayAvailable()) return null;
  const environment = env.CORVUSPAY_ENV?.toLowerCase();
  const url = environment === 'production'
    ? 'https://wallet.corvuspay.com/checkout/'
    : 'https://wallet.test.corvuspay.com/checkout/';
  const fields: Record<string, string> = {
    version: '1.6',
    store_id: env.CORVUSPAY_STORE_ID!,
    order_number: input.orderNumber,
    language: 'hr',
    currency: 'EUR',
    amount: input.amount.toFixed(2),
    cart: input.description.slice(0, 255),
    require_complete: 'false',
    cardholder_country_code: 'HR',
    cardholder_email: input.email,
    success_url: `${input.baseUrl}${input.successPath ?? '/api/corvuspay/callback'}`,
    cancel_url: `${input.baseUrl}${input.cancelPath ?? '/api/corvuspay/cancel'}`
  };
  return { url, fields: { ...fields, signature: signCorvuspayFields(env.CORVUSPAY_SECRET_KEY!, fields) } };
}

export function verifyCorvuspayCallback(fields: Record<string, string>): boolean {
  return corvuspayAvailable() && verifyCorvuspayFields(env.CORVUSPAY_SECRET_KEY!, fields);
}
