export type ShopDeliveryMethod = 'overseas' | 'boxnow' | 'personal_pickup';
export type ShopPaymentMethod = 'bank_transfer' | 'corvuspay' | 'cash_on_delivery';

export type ShopDeliveryOption = {
  id: ShopDeliveryMethod;
  label_hr: string;
  label_en: string;
  price: number;
  enabled: boolean;
  allows_cod: boolean;
};

export type ShopCheckoutConfig = {
  deliveryMethods: ShopDeliveryOption[];
  freeShippingThreshold: number;
  cashOnDeliveryEnabled: boolean;
  cashOnDeliverySurcharge: number;
};

const DEFAULT_DELIVERY_METHODS: ShopDeliveryOption[] = [
  { id: 'overseas', label_hr: 'Overseas dostava', label_en: 'Overseas delivery', price: 11, enabled: true, allows_cod: true },
  { id: 'boxnow', label_hr: 'BoxNow paketomat', label_en: 'BoxNow locker', price: 9, enabled: true, allows_cod: false },
  { id: 'personal_pickup', label_hr: 'Osobno preuzimanje', label_en: 'Personal pickup', price: 0, enabled: true, allows_cod: false }
];

function money(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : fallback;
}

function boolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeCheckoutConfig(settings: Record<string, unknown>): ShopCheckoutConfig {
  const configured = settings.shop_shipping_methods;
  const records = configured && typeof configured === 'object' && !Array.isArray(configured)
    ? configured as Record<string, Record<string, unknown>>
    : {};

  const deliveryMethods = DEFAULT_DELIVERY_METHODS.map((fallback) => {
    const option = records[fallback.id] ?? {};
    return {
      id: fallback.id,
      label_hr: String(option.label_hr ?? fallback.label_hr),
      label_en: String(option.label_en ?? fallback.label_en),
      price: fallback.id === 'personal_pickup' ? 0 : money(option.price, fallback.price),
      enabled: boolean(option.enabled, fallback.enabled),
      allows_cod: boolean(option.allows_cod, fallback.allows_cod)
    };
  });

  return {
    deliveryMethods,
    freeShippingThreshold: money(settings.free_shipping_threshold),
    cashOnDeliveryEnabled: boolean(settings.cash_on_delivery_enabled, true),
    cashOnDeliverySurcharge: money(settings.cash_on_delivery_surcharge, 1)
  };
}

export function calculateShopOrderTotals(
  subtotalInput: number,
  deliveryMethod: ShopDeliveryMethod,
  paymentMethod: ShopPaymentMethod,
  config: ShopCheckoutConfig
) {
  const subtotal = money(subtotalInput);
  const delivery = config.deliveryMethods.find((option) => option.id === deliveryMethod);
  if (!delivery?.enabled) throw new Error('Odabrani način dostave nije dostupan.');
  if (paymentMethod === 'cash_on_delivery' && !config.cashOnDeliveryEnabled) {
    throw new Error('Plaćanje pouzećem nije dostupno.');
  }
  if (paymentMethod === 'cash_on_delivery' && !delivery.allows_cod) {
    throw new Error('Plaćanje pouzećem nije dostupno za odabrani način dostave.');
  }

  const qualifiesForFreeShipping = deliveryMethod !== 'personal_pickup'
    && config.freeShippingThreshold > 0
    && subtotal >= config.freeShippingThreshold;
  const shippingCost = deliveryMethod === 'personal_pickup' || qualifiesForFreeShipping ? 0 : money(delivery.price);
  const paymentSurcharge = paymentMethod === 'cash_on_delivery' ? money(config.cashOnDeliverySurcharge) : 0;
  const total = money(subtotal + shippingCost + paymentSurcharge);

  return { subtotal, shippingCost, paymentSurcharge, total };
}

export function pickupOnlyRequiresPersonalPickup(hasPickupOnlyItems: boolean, deliveryMethod: ShopDeliveryMethod) {
  return hasPickupOnlyItems && deliveryMethod !== 'personal_pickup';
}

export function deliverySupportsCashOnDelivery(deliveryMethod: ShopDeliveryMethod, config: ShopCheckoutConfig) {
  return config.cashOnDeliveryEnabled
    && Boolean(config.deliveryMethods.find((option) => option.id === deliveryMethod)?.allows_cod);
}
