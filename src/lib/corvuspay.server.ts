import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export type CorvuspayPaymentReference =
  | { kind: 'booking'; bookingId: string; paymentPart: 1 | 2 }
  | { kind: 'order'; orderId: string };

function compactUuid(id: string): string {
  const compact = id.replaceAll('-', '');
  if (!/^[0-9a-f]{32}$/i.test(compact)) {
    throw new Error('CorvusPay reference requires a UUID.');
  }
  return compact.toLowerCase();
}

function uuidFromCompact(value: string): string {
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function corvuspayBookingOrderNumber(bookingId: string, paymentPart: 1 | 2): string {
  // CorvusPay permits at most 36 characters in order_number.
  return `B${compactUuid(bookingId)}${paymentPart}`;
}

export function corvuspayShopOrderNumber(orderId: string): string {
  return `S${compactUuid(orderId)}`;
}

export function parseCorvuspayOrderNumber(orderNumber: string): CorvuspayPaymentReference | null {
  const booking = /^B([0-9a-f]{32})([12])$/i.exec(orderNumber);
  if (booking) {
    return {
      kind: 'booking',
      bookingId: uuidFromCompact(booking[1].toLowerCase()),
      paymentPart: booking[2] === '2' ? 2 : 1
    };
  }
  const order = /^S([0-9a-f]{32})$/i.exec(orderNumber);
  if (order) return { kind: 'order', orderId: uuidFromCompact(order[1].toLowerCase()) };
  return null;
}

export function signCorvuspayFields(secretKey: string, fields: Record<string, string>): string {
  const message = Object.entries(fields)
    .filter(([key]) => key !== 'signature')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}${value}`)
    .join('');
  return createHmac('sha256', secretKey).update(message, 'utf8').digest('hex');
}

export function corvuspayCheckoutFields(input: {
  storeId: string;
  secretKey: string;
  orderNumber: string;
  amount: number;
  description: string;
  email: string;
}): Record<string, string> {
  const fields: Record<string, string> = {
    version: '1.6',
    store_id: input.storeId,
    order_number: input.orderNumber,
    language: 'hr',
    currency: 'EUR',
    amount: input.amount.toFixed(2),
    cart: input.description.slice(0, 255),
    require_complete: 'false',
    cardholder_country_code: 'HR',
    cardholder_email: input.email
  };
  return { ...fields, signature: signCorvuspayFields(input.secretKey, fields) };
}

function signaturesMatch(expectedValue: string, receivedValue: string): boolean {
  const expected = Buffer.from(expectedValue, 'hex');
  const received = Buffer.from(receivedValue, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyCorvuspayFields(secretKey: string, fields: Record<string, string>): boolean {
  const signature = fields.signature;
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  return signaturesMatch(signCorvuspayFields(secretKey, fields), signature);
}

export function corvuspayCallbackState(secretKey: string, orderNumber: string): string {
  return createHmac('sha256', secretKey)
    .update(`corvuspay-callback:${orderNumber}`, 'utf8')
    .digest('hex');
}

export function verifyCorvuspayCallbackState(secretKey: string, orderNumber: string, state: string): boolean {
  return /^[0-9a-f]{64}$/i.test(state) && signaturesMatch(corvuspayCallbackState(secretKey, orderNumber), state);
}

export function corvuspayStatusHash(input: {
  secretKey: string;
  orderNumber: string;
  storeId: string;
  timestamp: string;
}): string {
  return createHash('sha1')
    .update(`${input.secretKey}${input.orderNumber}${input.storeId}978${input.timestamp}1.6`, 'utf8')
    .digest('hex');
}

/**
 * A card success redirect always identifies the authorization with these three
 * fields. CorvusPay can append provider-specific response fields, while the
 * signature may cover either the complete response or this documented core.
 */
export function verifyCorvuspayCardSuccessResponse(secretKey: string, fields: Record<string, string>): boolean {
  const keys = ['approval_code', 'language', 'order_number'] as const;
  if (!keys.every((key) => typeof fields[key] === 'string' && fields[key].length > 0)) return false;

  if (verifyCorvuspayFields(secretKey, fields)) return true;
  const coreFields = Object.fromEntries(keys.map((key) => [key, fields[key]]));
  return verifyCorvuspayFields(secretKey, { ...coreFields, signature: fields.signature });
}
