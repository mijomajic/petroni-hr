import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env as priv } from '$env/dynamic/private';
import { supabaseAdmin } from '$lib/supabase.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const stripeKey = priv.STRIPE_SECRET_KEY ?? '';
  const { user } = await locals.safeGetSession();

  if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    const { error } = await supabaseAdmin.from('orders').insert({
      confirmation_number: `NAR-${Date.now().toString(36).toUpperCase()}`,
      user_id: user?.id ?? null,
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
    if (error) return json({ success: false, error: error.message }, { status: 400 });
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
