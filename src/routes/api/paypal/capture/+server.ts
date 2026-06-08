import { json } from '@sveltejs/kit';
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { orderId, bookingId } = await request.json();

  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'placeholder-paypal-client-id') {
    return json({ success: false, error: 'PayPal not configured' }, { status: 503 });
  }

  try {
    const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json();

    const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });
    const capture = await captureRes.json();

    return json({ success: true, capture });
  } catch {
    return json({ success: false, error: 'Capture failed' }, { status: 500 });
  }
};
