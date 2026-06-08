import { json } from '@sveltejs/kit';
import { env as priv } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { amount } = await request.json();
  const clientId = priv.PAYPAL_CLIENT_ID ?? '';
  const clientSecret = priv.PAYPAL_CLIENT_SECRET ?? '';

  if (!clientId || clientId === 'placeholder-paypal-client-id') {
    return json({ success: false, error: 'PayPal not configured' }, { status: 503 });
  }

  try {
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json();

    const res = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
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
