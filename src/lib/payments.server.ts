import { env } from '$env/dynamic/private';
import bwipjs from 'bwip-js';
import {
  corvuspayCheckoutFields,
  corvuspayStatusHash,
  verifyCorvuspayCardSuccessResponse
} from '$lib/corvuspay.server';

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

function corvuspayTimestamp(date = new Date()): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCHours()).padStart(2, '0'),
    String(date.getUTCMinutes()).padStart(2, '0'),
    String(date.getUTCSeconds()).padStart(2, '0')
  ].join('');
}

function xmlValue(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  return match?.[1]?.trim() || null;
}

export type CorvuspayTransactionStatus = {
  orderNumber: string;
  status: string;
  approvalCode: string | null;
};

/** Checks CorvusPay server-to-server when a hosted-page redirect contains no signed result fields. */
export async function corvuspayTransactionStatus(orderNumber: string): Promise<CorvuspayTransactionStatus | null> {
  if (!corvuspayAvailable()) return null;
  const environment = env.CORVUSPAY_ENV!.toLowerCase();
  const timestamp = corvuspayTimestamp();
  const storeId = env.CORVUSPAY_STORE_ID!;
  const body = new URLSearchParams({
    store_id: storeId,
    order_number: orderNumber,
    currency_code: '978',
    timestamp,
    version: '1.6',
    hash: corvuspayStatusHash({
      secretKey: env.CORVUSPAY_SECRET_KEY!,
      orderNumber,
      storeId,
      timestamp
    })
  });
  const endpoint = environment === 'production'
    ? 'https://cps.corvus.hr/status'
    : 'https://testcps.corvus.hr/status';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000)
    });
    const xml = await response.text();
    if (!response.ok) {
      console.warn('CorvusPay status API rejected lookup', {
        httpStatus: response.status,
        responseShape: xml.startsWith('<?xml') ? 'xml' : 'non_xml'
      });
      return null;
    }
    const resolvedOrderNumber = xmlValue(xml, 'order-number');
    const status = xmlValue(xml, 'status')?.toLowerCase();
    if (!resolvedOrderNumber || !status || resolvedOrderNumber !== orderNumber) {
      console.warn('CorvusPay status API returned an unusable lookup', {
        responseShape: xml.startsWith('<?xml') ? 'xml' : 'non_xml',
        hasOrderNumber: Boolean(resolvedOrderNumber),
        orderMatches: resolvedOrderNumber === orderNumber,
        transactionStatus: status,
        responseCode: xmlValue(xml, 'response-code')
      });
      return null;
    }
    return { orderNumber: resolvedOrderNumber, status, approvalCode: xmlValue(xml, 'approval-code') };
  } catch (caught) {
    console.warn('CorvusPay status API lookup failed before receiving a response', {
      errorName: caught instanceof Error ? caught.name : 'unknown_error',
      errorMessage: caught instanceof Error ? caught.message : String(caught)
    });
    return null;
  }
}

export function createCorvuspayRedirect(input: {
  orderNumber: string;
  amount: number;
  description: string;
  email: string;
}): { url: string; fields: Record<string, string> } | null {
  if (!corvuspayAvailable()) return null;
  const environment = env.CORVUSPAY_ENV?.toLowerCase();
  const url = environment === 'production'
    ? 'https://wallet.corvuspay.com/checkout/'
    : 'https://wallet.test.corvuspay.com/checkout/';
  return {
    url,
    fields: corvuspayCheckoutFields({
      storeId: env.CORVUSPAY_STORE_ID!,
      secretKey: env.CORVUSPAY_SECRET_KEY!,
      ...input
    })
  };
}

export function verifyCorvuspayCallback(fields: Record<string, string>): boolean {
  return corvuspayAvailable() && verifyCorvuspayCardSuccessResponse(env.CORVUSPAY_SECRET_KEY!, fields);
}
