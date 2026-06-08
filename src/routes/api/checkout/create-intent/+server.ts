import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { STRIPE_SECRET_KEY, SUPABASE_SERVICE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    // Dev mode: simulate success
    const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);
    await supabase.from('orders').insert({
      customer_name: body.customer.name,
      customer_email: body.customer.email,
      customer_phone: body.customer.phone,
      shipping_address: body.customer,
      items: body.items,
      subtotal: body.total,
      total: body.total,
      status: 'pending',
      payment_status: 'unpaid',
    });
    return json({ success: true, mode: 'dev' });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const amount = Math.round(body.total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { type: 'order', customer_email: body.customer.email },
  });

  return json({ success: true, clientSecret: paymentIntent.client_secret });
};
