import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { env as priv } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const stripeKey = priv.STRIPE_SECRET_KEY ?? '';
  const supabaseUrl = pub.PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = priv.SUPABASE_SERVICE_KEY ?? '';

  if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    const supabase = createClient(supabaseUrl, serviceKey);
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

  const stripe = new Stripe(stripeKey);
  const amount = Math.round(body.total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    metadata: { type: 'order', customer_email: body.customer.email },
  });

  return json({ success: true, clientSecret: paymentIntent.client_secret });
};
