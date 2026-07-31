import { env } from '$env/dynamic/private';
import bwipjs from 'bwip-js';
import { request as httpsRequest } from 'node:https';
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

export function corvuspayStatusApiAvailable(): boolean {
  return corvuspayAvailable() && Boolean(env.CORVUSPAY_API_CERT_PEM && env.CORVUSPAY_API_KEY_PEM);
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
  responseCode: string | null;
};

function pem(value: string): string {
  return value.replaceAll('\\n', '\n');
}

async function corvuspayStatusRequest(endpoint: URL, body: URLSearchParams): Promise<{
  statusCode: number;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      endpoint,
      {
        method: 'POST',
        cert: pem(env.CORVUSPAY_API_CERT_PEM!),
        key: pem(env.CORVUSPAY_API_KEY_PEM!),
        passphrase: env.CORVUSPAY_API_KEY_PASSPHRASE || undefined,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': Buffer.byteLength(body.toString())
        },
        timeout: 10_000
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => resolve({
          statusCode: response.statusCode ?? 0,
          body: Buffer.concat(chunks).toString('utf8')
        }));
      }
    );
    request.on('timeout', () => request.destroy(new Error('CorvusPay status API timeout.')));
    request.on('error', reject);
    request.end(body.toString());
  });
}

/** Checks CorvusPay server-to-server using the merchant mTLS API certificate. */
export async function corvuspayTransactionStatus(orderNumber: string): Promise<CorvuspayTransactionStatus | null> {
  if (!corvuspayStatusApiAvailable()) return null;
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
  const endpoint = new URL(environment === 'production'
    ? 'https://cps.corvus.hr/status'
    : 'https://testcps.corvus.hr/status');

  try {
    const response = await corvuspayStatusRequest(endpoint, body);
    const xml = response.body;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      console.warn('CorvusPay status API rejected lookup', {
        httpStatus: response.statusCode,
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
    return {
      orderNumber: resolvedOrderNumber,
      status,
      approvalCode: xmlValue(xml, 'approval-code'),
      responseCode: xmlValue(xml, 'response-code')
    };
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
