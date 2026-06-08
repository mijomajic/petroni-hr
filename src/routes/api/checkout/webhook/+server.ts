import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { env as priv } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const stripeKey = priv.STRIPE_SECRET_KEY ?? '';
  const webhookSecret = priv.STRIPE_WEBHOOK_SECRET ?? '';

  if (!stripeKey) return json({ error: 'Not configured' }, { status: 503 });

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient(pub.PUBLIC_SUPABASE_URL ?? '', priv.SUPABASE_SERVICE_KEY ?? '');

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { type } = intent.metadata;

    if (type === 'booking') {
      await supabase.from('bookings')
        .update({ payment_status: 'deposit_paid', status: 'confirmed' })
        .eq('stripe_payment_intent', intent.id);
    } else if (type === 'order') {
      await supabase.from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('stripe_payment_intent', intent.id);
    }
  }

  return json({ received: true });
};
