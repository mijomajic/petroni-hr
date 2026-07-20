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
import { getAvailableProducts, reserveOrderStock } from '$lib/shop-stock.server';
import {
  calculateShopOrderTotals,
  normalizeCheckoutConfig,
  overseasZoneForPostalCode,
  pickupOnlyRequiresPersonalPickup,
  type ShopDeliveryMethod,
  type ShopPaymentMethod
} from '$lib/shop-checkout';

type CartItem = {
  id?: string;
  qty?: number;
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const { user } = await locals.safeGetSession();
  const paymentMethod = String(body.payment_method ?? 'bank_transfer') as ShopPaymentMethod;
  const deliveryMethod = String(body.delivery_method ?? '') as ShopDeliveryMethod;
  const items = Array.isArray(body.items) ? body.items as CartItem[] : [];
  const customer = body.customer ?? {};
  const customerRecord = {
    name: String(customer.name ?? '').trim(),
    email: String(customer.email ?? '').trim(),
    phone: String(customer.phone ?? '').trim(),
    address: String(customer.address ?? '').trim(),
    city: String(customer.city ?? '').trim(),
    zip: String(customer.zip ?? '').trim(),
    country: String(customer.country ?? '').trim(),
    boxnow_locker: String(customer.boxnow_locker ?? '').trim(),
    boxnow_locker_id: String(customer.boxnow_locker_id ?? '').trim(),
    boxnow_locker_address: String(customer.boxnow_locker_address ?? '').trim(),
    boxnow_locker_postal_code: String(customer.boxnow_locker_postal_code ?? '').trim()
  };

  const requiredCustomerValues = deliveryMethod === 'personal_pickup'
    ? [customerRecord.name, customerRecord.email, customerRecord.phone]
    : deliveryMethod === 'boxnow'
      ? [customerRecord.name, customerRecord.email, customerRecord.phone, customerRecord.address, customerRecord.city, customerRecord.zip, customerRecord.country, customerRecord.boxnow_locker, customerRecord.boxnow_locker_id, customerRecord.boxnow_locker_address]
      : [customerRecord.name, customerRecord.email, customerRecord.phone, customerRecord.address, customerRecord.city, customerRecord.zip, customerRecord.country];
  if (requiredCustomerValues.some((value) => !value) || !/^\S+@\S+\.\S+$/.test(customerRecord.email)) {
    return json({ success: false, error: 'Ispunite sve podatke kupca i unesite valjanu email adresu.' }, { status: 400 });
  }
  if (Object.values(customerRecord).some((value) => value.length > 240)) {
    return json({ success: false, error: 'Jedno ili više polja kupca je predugačko.' }, { status: 400 });
  }
  if (deliveryMethod === 'boxnow' && !/^[A-Za-z0-9_-]{1,80}$/.test(customerRecord.boxnow_locker_id)) {
    return json({ success: false, error: 'Odaberite valjan BoxNow paketomat putem karte.' }, { status: 400 });
  }

  if (!['bank_transfer', 'corvuspay', 'cash_on_delivery'].includes(paymentMethod)) {
    return json({ success: false, error: 'Odaberite valjan način plaćanja.' }, { status: 400 });
  }
  if (paymentMethod === 'corvuspay' && !corvuspayAvailable()) {
    return json({ success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' }, { status: 503 });
  }
  if (!items.length) {
    return json({ success: false, error: 'Košarica je prazna.' }, { status: 400 });
  }
  if (!['overseas', 'boxnow', 'personal_pickup'].includes(deliveryMethod)) {
    return json({ success: false, error: 'Odaberite valjan način dostave.' }, { status: 400 });
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
    getAvailableProducts(ids),
    supabaseAdmin.from('settings').select('key,value').in('key', [
      'ibans',
      'company',
      'shop_shipping_methods',
      'shop_overseas_zones',
      'free_shipping_threshold',
      'cash_on_delivery_enabled',
      'cash_on_delivery_surcharge'
    ])
  ]);

  if (productsError) return json({ success: false, error: productsError.message }, { status: 400 });
  if (!products?.length || products.length !== ids.length || products.some((product) => !product.is_active)) {
    return json({ success: false, error: 'Neki proizvodi više nisu dostupni.' }, { status: 400 });
  }
  const insufficientStock = products.find((product) => Number(product.stock) < (quantities.get(product.id) ?? 1));
  if (insufficientStock) {
    return json({ success: false, error: `Proizvod “${insufficientStock.name_hr}” nema dovoljnu dostupnu količinu.` }, { status: 409 });
  }
  const settings = Object.fromEntries((paymentSettings ?? []).map((row) => [row.key, row.value]));
  const checkoutConfig = normalizeCheckoutConfig(settings);
  const overseasZone = deliveryMethod === 'overseas'
    ? overseasZoneForPostalCode(customerRecord.zip, checkoutConfig)
    : null;
  const shippingAddress = {
    ...customerRecord,
    ...(overseasZone ? {
      overseas_zone: overseasZone.id,
      overseas_zone_label: overseasZone.label_hr
    } : {})
  };
  const hasPickupOnlyItems = products.some((product) => Boolean(product.pickup_only));
  if (pickupOnlyRequiresPersonalPickup(hasPickupOnlyItems, deliveryMethod)) {
    return json({ success: false, error: 'Košarica sadrži proizvod dostupan samo za osobno preuzimanje.' }, { status: 400 });
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
      images: product.images,
      pickup_only: Boolean(product.pickup_only)
    };
  });
  const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.price * item.qty, 0) * 100) / 100;
  let totals;
  try {
    totals = calculateShopOrderTotals(subtotal, deliveryMethod, paymentMethod, checkoutConfig, customerRecord.zip);
  } catch (pricingError) {
    return json({ success: false, error: pricingError instanceof Error ? pricingError.message : 'Odabrana kombinacija dostave i plaćanja nije dostupna.' }, { status: 400 });
  }
  const confirmationNumber = `NAR-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error } = await supabaseAdmin.from('orders').insert({
    confirmation_number: confirmationNumber,
    user_id: user?.id ?? null,
    customer_name: customerRecord.name,
    customer_email: customerRecord.email,
    customer_phone: customerRecord.phone,
    shipping_address: shippingAddress,
    billing_address: customerRecord,
    items: orderItems,
    subtotal: totals.subtotal,
    shipping_method: deliveryMethod,
    shipping_cost: totals.shippingCost,
    payment_surcharge: totals.paymentSurcharge,
    total: totals.total,
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: paymentMethod,
    notes: null
  }).select().single();

  if (error) return json({ success: false, error: error.message }, { status: 400 });

  const reservation = await reserveOrderStock(order.id);
  if (reservation.error) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return json({
      success: false,
      error: reservation.error.message || 'Neki proizvodi više nemaju dovoljnu dostupnu količinu.'
    }, { status: 409 });
  }

  sendOrderReceived(order).catch((mailError) => console.error('Order email failed', mailError));

  const response: Record<string, unknown> = {
    success: true,
    order: {
      id: order.id,
      confirmation_number: order.confirmation_number,
      payment_method: order.payment_method,
      delivery_method: order.shipping_method,
      delivery_zone: overseasZone?.id ?? null,
      shipping_cost: order.shipping_cost,
      payment_surcharge: order.payment_surcharge,
      total: order.total
    }
  };

  if (paymentMethod === 'bank_transfer') {
    const company = (settings.company ?? {}) as { name?: string; address?: string };
    response.bankTransfers = await Promise.all(((settings.ibans ?? []) as IbanSetting[]).map(async (account) => {
      const payload = hub3Payload({
        amount: totals.total,
        recipient: company.name ?? 'Petroni d.o.o.',
        address: company.address ?? '',
        iban: account.iban,
        reference: confirmationNumber,
        description: `Narudžba ${confirmationNumber}`
      });
      return { ...account, amount: totals.total, reference: confirmationNumber, barcode: await hub3BarcodeDataUrl(payload) };
    }));
  }

  if (paymentMethod === 'corvuspay') {
    const redirect = createCorvuspayRedirect({
      orderNumber: corvuspayShopOrderNumber(order.id),
      amount: totals.total,
      description: `Narudžba ${confirmationNumber}`,
      email: order.customer_email
    });
    if (!redirect) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return json({ success: false, error: 'CorvusPay je uskoro dostupan. Odaberite bankovnu uplatu.' }, { status: 503 });
    }
    const providerReference = corvuspayShopOrderNumber(order.id);
    await Promise.all([
      supabaseAdmin.from('orders').update({ corvuspay_order_id: providerReference }).eq('id', order.id),
      supabaseAdmin.from('payment_attempts').insert({
        order_id: order.id,
        provider: 'corvuspay',
        action: 'redirect_created',
        status: 'started',
        provider_reference: providerReference
      })
    ]);
    response.corvuspay = redirect;
  }

  return json(response);
};
