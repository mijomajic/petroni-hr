import { json } from '@sveltejs/kit';
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

async function getPayPalToken() {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export const POST: RequestHandler = async ({ request }) => {
  const { amount } = await request.json();

  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'placeholder-paypal-client-id') {
    return json({ success: false, error: 'PayPal not configured' }, { status: 503 });
  }

  try {
    const token = await getPayPalToken();
    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'EUR', value: amount.toString() } }],
      }),
    });
    const order = await res.json();
    return json({ orderId: order.id });
  } catch {
    return json({ success: false, error: 'PayPal error' }, { status: 500 });
  }
};
