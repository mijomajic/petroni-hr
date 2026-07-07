import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import bwipjs from 'bwip-js';

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
  return Boolean(env.CORVUSPAY_STORE_ID && env.CORVUSPAY_SECRET_KEY && env.CORVUSPAY_ENV);
}

function corvusSignature(fields: Record<string, string>): string {
  const canonical = Object.keys(fields).sort().map((key) => `${key}=${fields[key]}`).join('&');
  return createHmac('sha256', env.CORVUSPAY_SECRET_KEY ?? '').update(canonical).digest('hex');
}

export function createCorvuspayRedirect(input: {
  orderNumber: string;
  amount: number;
  description: string;
  email: string;
  baseUrl: string;
  successPath?: string;
  cancelPath?: string;
  callbackPath?: string;
}): { url: string; fields: Record<string, string> } | null {
  if (!corvuspayAvailable()) return null;
  const environment = env.CORVUSPAY_ENV?.toLowerCase();
  const url = environment === 'production'
    ? 'https://cps.corvus.hr/redirect/'
    : 'https://test-wallet.corvuspay.com/checkout/';
  const fields: Record<string, string> = {
    store_id: env.CORVUSPAY_STORE_ID!,
    order_number: input.orderNumber,
    amount: input.amount.toFixed(2),
    currency: 'EUR',
    language: 'hr',
    cart: input.description.slice(0, 255),
    cardholder_email: input.email,
    success_url: `${input.baseUrl}${input.successPath ?? '/api/corvuspay/callback?result=success'}`,
    cancel_url: `${input.baseUrl}${input.cancelPath ?? '/api/corvuspay/callback?result=cancel'}`,
    callback_url: `${input.baseUrl}${input.callbackPath ?? '/api/corvuspay/callback'}`
  };
  return { url, fields: { ...fields, signature: corvusSignature(fields) } };
}

export function verifyCorvuspayCallback(fields: Record<string, string>): boolean {
  if (!corvuspayAvailable() || !fields.signature) return false;
  const { signature, ...signedFields } = fields;
  const expected = Buffer.from(corvusSignature(signedFields));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
