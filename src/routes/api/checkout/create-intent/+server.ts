import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import {
  corvuspayAvailable,
  createCorvuspayRedirect,
  hub3BarcodeDataUrl,
  hub3Payload,
  type IbanSetting
} from '$lib/payments.server';
import { corvuspayShopOrderNumber } from '$lib/corvuspay.server';
import type { RequestHandler } from './$types';
import { sendOrderReceived } from '$lib/email.server';

type CartItem = {
  id?: string;
  qty?: number;
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const { user } = await locals.safeGetSession();
  const paymentMethod = String(body.payment_method ?? 'bank_transfer');
  const items = Array.isArray(body.items) ? body.items as CartItem[] : [];
  const customer = body.customer ?? {};

  if (!['bank_transfer', 'corvuspay'].includes(paymentMethod)) {
    return json({ success: false, error: 'Odaberite valjan način plaćanja.' }, { status: 400 });
  }
  if (paymentMethod === 'corvuspay' && !corvuspayAvailable()) {
    return json({ success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' }, { status: 503 });
  }
  if (!items.length) {
    return json({ success: false, error: 'Košarica je prazna.' }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!item.id) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + qty);
  }
  const ids = [...quantities.keys()];
  if (!ids.length) return json({ success: false, error: 'Košarica je prazna.' }, { status: 400 });

  const [{ data: products, error: productsError }, { data: paymentSettings }] = await Promise.all([
    supabaseAdmin.from('products').select('id,slug,name_hr,name_en,price,images,stock,is_active').in('id', ids).eq('is_active', true),
    supabaseAdmin.from('settings').select('key,value').in('key', ['ibans', 'company'])
  ]);

  if (productsError) return json({ success: false, error: productsError.message }, { status: 400 });
  if (!products?.length || products.length !== ids.length) {
    return json({ success: false, error: 'Neki proizvodi više nisu dostupni.' }, { status: 400 });
  }

  const orderItems = products.map((product) => {
    const qty = quantities.get(product.id) ?? 1;
    return {
      id: product.id,
      slug: product.slug,
      name_hr: product.name_hr,
      name_en: product.name_en,
      price: Number(product.price),
      qty,
      images: product.images
    };
  });
  const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
  const confirmationNumber = `NAR-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    confirmation_number: confirmationNumber,
    user_id: user?.id ?? null,
    customer_name: String(customer.name ?? ''),
    customer_email: String(customer.email ?? ''),
    customer_phone: String(customer.phone ?? ''),
    shipping_address: customer,
    billing_address: customer,
    items: orderItems,
    subtotal,
    total: subtotal,
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: paymentMethod
  }).select().single();

  if (error) return json({ success: false, error: error.message }, { status: 400 });

  sendOrderReceived(order).catch((mailError) => console.error('Order email failed', mailError));

  const response: Record<string, unknown> = {
    success: true,
    order: {
      id: order.id,
      confirmation_number: order.confirmation_number,
      payment_method: order.payment_method,
      total: order.total
    }
  };

  const settings = Object.fromEntries((paymentSettings ?? []).map((row) => [row.key, row.value]));
  if (paymentMethod === 'bank_transfer') {
    const company = (settings.company ?? {}) as { name?: string; address?: string };
    response.bankTransfers = await Promise.all(((settings.ibans ?? []) as IbanSetting[]).map(async (account) => {
      const payload = hub3Payload({
        amount: subtotal,
        recipient: company.name ?? 'Petroni d.o.o.',
        address: company.address ?? '',
        iban: account.iban,
        reference: confirmationNumber,
        description: `Narudžba ${confirmationNumber}`
      });
      return { ...account, amount: subtotal, reference: confirmationNumber, barcode: await hub3BarcodeDataUrl(payload) };
    }));
  }

  if (paymentMethod === 'corvuspay') {
    const redirect = createCorvuspayRedirect({
      orderNumber: corvuspayShopOrderNumber(order.id),
      amount: subtotal,
      description: `Narudžba ${confirmationNumber}`,
      email: order.customer_email
    });
    if (!redirect) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return json({ success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' }, { status: 503 });
    }
    await supabaseAdmin.from('orders').update({ corvuspay_order_id: corvuspayShopOrderNumber(order.id) }).eq('id', order.id);
    response.corvuspay = redirect;
  }

  return json(response);
};
