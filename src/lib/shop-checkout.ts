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

export type OverseasPriceTier = {
  min: number;
  max: number | null;
  price: number;
};

export type OverseasShippingZone = {
  id: 'zone_1' | 'zone_2';
  label_hr: string;
  label_en: string;
  postalCodes: string[];
  tiers: OverseasPriceTier[];
};

export type ShopCheckoutConfig = {
  deliveryMethods: ShopDeliveryOption[];
  overseasZones: OverseasShippingZone[];
  freeShippingThreshold: number;
  cashOnDeliveryEnabled: boolean;
  cashOnDeliverySurcharge: number;
};

export const OVERSEAS_TIER_RANGES = [
  { min: 0, max: 100 },
  { min: 100, max: 250 },
  { min: 250, max: 500 },
  { min: 500, max: 1000 }
] as const;

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

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizePostalCode(value: unknown) {
  const raw = String(value ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  return digits.length === 5 ? digits : raw.toUpperCase().replace(/\s+/g, '');
}

export function normalizePostalCodes(value: unknown): string[] {
  const items = Array.isArray(value) ? value : String(value ?? '').split(/[\s,;]+/);
  return [...new Set(items.map(normalizePostalCode).filter((code) => /^\d{5}$/.test(code)))].sort();
}

function flatFallbackTiers(price: number): OverseasPriceTier[] {
  return OVERSEAS_TIER_RANGES.map((range) => ({ ...range, price }));
}

function normalizeTiers(value: unknown, fallbackPrice: number): OverseasPriceTier[] {
  if (!Array.isArray(value)) return flatFallbackTiers(fallbackPrice);
  const tiers = value
    .map((item) => record(item))
    .map((item) => ({
      min: money(item.min, -1),
      max: item.max === null ? null : money(item.max, -1),
      price: money(item.price, fallbackPrice)
    }))
    .filter((tier) => tier.min >= 0 && (tier.max === null || tier.max > tier.min))
    .sort((a, b) => a.min - b.min);
  return tiers.length ? tiers : flatFallbackTiers(fallbackPrice);
}

function normalizeOverseasZones(value: unknown, fallbackPrice: number): OverseasShippingZone[] {
  const zones = record(value);
  const zoneOne = record(zones.zone_1);
  const zoneTwo = record(zones.zone_2);
  const first: OverseasShippingZone = {
    id: 'zone_1',
    label_hr: String(zoneOne.label_hr ?? 'Zona I'),
    label_en: String(zoneOne.label_en ?? 'Zone I'),
    postalCodes: [],
    tiers: normalizeTiers(zoneOne.tiers, fallbackPrice)
  };
  return [
    first,
    {
      id: 'zone_2',
      label_hr: String(zoneTwo.label_hr ?? 'Zona II'),
      label_en: String(zoneTwo.label_en ?? 'Zone II'),
      postalCodes: normalizePostalCodes(zoneTwo.postal_codes),
      tiers: normalizeTiers(zoneTwo.tiers, fallbackPrice)
    }
  ];
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
  const overseasPrice = deliveryMethods.find((method) => method.id === 'overseas')?.price ?? 11;

  return {
    deliveryMethods,
    overseasZones: normalizeOverseasZones(settings.shop_overseas_zones, overseasPrice),
    freeShippingThreshold: money(settings.free_shipping_threshold),
    cashOnDeliveryEnabled: boolean(settings.cash_on_delivery_enabled, true),
    cashOnDeliverySurcharge: money(settings.cash_on_delivery_surcharge, 1)
  };
}

export function overseasZoneForPostalCode(postalCode: unknown, config: ShopCheckoutConfig) {
  const normalized = normalizePostalCode(postalCode);
  const zoneTwo = config.overseasZones.find((zone) => zone.id === 'zone_2');
  if (zoneTwo?.postalCodes.includes(normalized)) return zoneTwo;
  return config.overseasZones.find((zone) => zone.id === 'zone_1') ?? config.overseasZones[0];
}

export function overseasPriceForSubtotal(subtotalInput: number, postalCode: unknown, config: ShopCheckoutConfig) {
  const subtotal = money(subtotalInput);
  const fallbackPrice = config.deliveryMethods.find((method) => method.id === 'overseas')?.price ?? 0;
  const zone = overseasZoneForPostalCode(postalCode, config);
  const tier = zone?.tiers.find((candidate) => subtotal >= candidate.min && (candidate.max === null || subtotal < candidate.max));
  return money(tier?.price, fallbackPrice);
}

export function calculateShopOrderTotals(
  subtotalInput: number,
  deliveryMethod: ShopDeliveryMethod,
  paymentMethod: ShopPaymentMethod,
  config: ShopCheckoutConfig,
  postalCode = ''
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

  const qualifiesForFreeShipping = deliveryMethod === 'overseas'
    && config.freeShippingThreshold > 0
    && subtotal >= config.freeShippingThreshold;
  const configuredShippingCost = deliveryMethod === 'overseas'
    ? overseasPriceForSubtotal(subtotal, postalCode, config)
    : money(delivery.price);
  const shippingCost = deliveryMethod === 'personal_pickup' || qualifiesForFreeShipping ? 0 : configuredShippingCost;
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
