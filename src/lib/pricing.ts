import { isCroatianPublicHoliday, isSunday } from '$lib/holidays';
import type {
  BookingExtra,
  Fee,
  RentalLocation,
  Season,
  SeasonPrice,
  Vehicle
} from '$lib/supabase';

const DAY_MS = 86_400_000;

export type PricingLineItemType =
  | 'vehicle'
  | 'location'
  | 'sunday_holiday'
  | 'after_hours'
  | 'extra';

export type PricingLineItem = {
  type: PricingLineItemType;
  label: string;
  amount: number;
  extra_id?: string;
  qty?: number;
  unit_price?: number;
};

export type PricingExtraSelection = {
  extra_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
  price_type: BookingExtra['price_type'];
};

export type PricingConfig = {
  seasons: Season[];
  seasonPrices: SeasonPrice[];
  fees: Fee[];
  locations: RentalLocation[];
  extras: BookingExtra[];
  kmPerDayIncluded: number;
};

export type PricingInput = {
  vehicle: Vehicle | null;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  plannedKm: number;
  selectedExtras: Record<string, number>;
  crossesBorder?: boolean;
  attendsFestival?: boolean;
  paymentSplit?: boolean;
};

export type PricingResult = {
  nights: number;
  billable_nights: number;
  season_name: string | null;
  season_names: string[];
  min_nights_applied: boolean;
  min_nights_note: string | null;
  line_items: PricingLineItem[];
  extra_selections: PricingExtraSelection[];
  vehicle_total: number;
  extras_total: number;
  fees_total: number;
  refundable_deposit: number;
  payable_total: number;
  deposit_if_split: number;
  included_km: number;
  estimated_extra_km: number;
  estimated_extra_km_cost: number;
  extra_km_note: string | null;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseDate(dateIso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
  const date = new Date(`${dateIso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function findSeason(dateIso: string, seasons: Season[]): Season | null {
  return (
    seasons
      .filter((season) => season.date_from <= dateIso && season.date_to >= dateIso)
      .sort((a, b) => a.sort_order - b.sort_order)[0] ?? null
  );
}

function priceForSeason(
  vehicle: Vehicle,
  season: Season | null,
  seasonPrices: SeasonPrice[]
): number {
  if (season) {
    const seasonal = seasonPrices.find(
      (price) => price.vehicle_id === vehicle.id && price.season_id === season.id
    );
    if (seasonal) return Number(seasonal.price_per_day);
  }
  return Number(vehicle.base_price_per_day ?? 0);
}

function refundableDepositForVehicle(vehicle: Vehicle): number {
  const deposit = vehicle.specs?.deposit_eur;
  const numericDeposit = typeof deposit === 'number' ? deposit : Number(deposit ?? 0);
  return Number.isFinite(numericDeposit) ? Math.max(0, numericDeposit) : 0;
}

function isOutsideWindow(time: string, window: string | null): boolean {
  if (!time || !window) return false;
  const [from, to] = window.split('-').map((value) => value.trim());
  if (!from || !to) return false;
  return time < from || time > to;
}

function emptyResult(): PricingResult {
  return {
    nights: 0,
    billable_nights: 0,
    season_name: null,
    season_names: [],
    min_nights_applied: false,
    min_nights_note: null,
    line_items: [],
    extra_selections: [],
    vehicle_total: 0,
    extras_total: 0,
    fees_total: 0,
    refundable_deposit: 0,
    payable_total: 0,
    deposit_if_split: 0,
    included_km: 0,
    estimated_extra_km: 0,
    estimated_extra_km_cost: 0,
    extra_km_note: null
  };
}

export function calculatePricing(input: PricingInput, config: PricingConfig): PricingResult {
  const pickup = parseDate(input.pickupDate);
  const dropoff = parseDate(input.dropoffDate);
  if (!input.vehicle || !pickup || !dropoff || dropoff <= pickup) return emptyResult();

  const nights = Math.round((dropoff.getTime() - pickup.getTime()) / DAY_MS);
  const pickupSeason = findSeason(input.pickupDate, config.seasons);
  const minimumNights = Math.max(1, Number(pickupSeason?.min_nights ?? 1));
  const billableNights = Math.max(nights, minimumNights);
  const minNightsApplied = billableNights > nights;
  const lineItems: PricingLineItem[] = [];
  const seasonNames: string[] = [];
  const vehicleGroups = new Map<string, { season: string; price: number; nights: number }>();

  for (let index = 0; index < nights; index += 1) {
    const nightIso = dateToIso(addDays(pickup, index));
    const season = findSeason(nightIso, config.seasons);
    const seasonLabel = season?.name ?? 'Osnovna cijena';
    const price = priceForSeason(input.vehicle, season, config.seasonPrices);
    const key = `${season?.id ?? 'base'}:${price}`;
    const group = vehicleGroups.get(key) ?? { season: seasonLabel, price, nights: 0 };
    group.nights += 1;
    vehicleGroups.set(key, group);
    if (!seasonNames.includes(seasonLabel)) seasonNames.push(seasonLabel);
  }

  if (minNightsApplied) {
    const price = priceForSeason(input.vehicle, pickupSeason, config.seasonPrices);
    const seasonLabel = pickupSeason?.name ?? 'Osnovna cijena';
    const key = `${pickupSeason?.id ?? 'base'}:${price}`;
    const group = vehicleGroups.get(key) ?? { season: seasonLabel, price, nights: 0 };
    group.nights += billableNights - nights;
    vehicleGroups.set(key, group);
    if (!seasonNames.includes(seasonLabel)) seasonNames.push(seasonLabel);
  }

  let vehicleTotal = 0;
  for (const group of vehicleGroups.values()) {
    const amount = roundMoney(group.price * group.nights);
    vehicleTotal += amount;
    lineItems.push({
      type: 'vehicle',
      label: `Vozilo — ${group.season} (${group.price} €/dan × ${group.nights})`,
      amount
    });
  }

  let feesTotal = 0;
  const pickupLocation = config.locations.find((location) => location.name === input.pickupLocation);
  const resolvedDropoffName = input.dropoffLocation || input.pickupLocation;
  const dropoffLocation = config.locations.find((location) => location.name === resolvedDropoffName);

  if (pickupLocation && Number(pickupLocation.location_fee) > 0) {
    const amount = Number(pickupLocation.location_fee);
    lineItems.push({ type: 'location', label: `Lokacija preuzimanja — ${pickupLocation.name}`, amount });
    feesTotal += amount;
  }
  if (
    dropoffLocation &&
    dropoffLocation.name !== pickupLocation?.name &&
    Number(dropoffLocation.location_fee) > 0
  ) {
    const amount = Number(dropoffLocation.location_fee);
    lineItems.push({ type: 'location', label: `Lokacija povrata — ${dropoffLocation.name}`, amount });
    feesTotal += amount;
  }

  const sundayHolidayFee = config.fees.find(
    (fee) => fee.key === 'sunday_holiday' && fee.is_active
  );
  if (sundayHolidayFee) {
    const eventAmount = Number(sundayHolidayFee.amount);
    const chargedEvents = [
      { label: 'preuzimanje', date: input.pickupDate },
      { label: 'povrat', date: input.dropoffDate }
    ].filter(({ date }) => isSunday(date) || isCroatianPublicHoliday(date));

    for (const event of chargedEvents) {
      lineItems.push({
        type: 'sunday_holiday',
        label: `${sundayHolidayFee.name_hr} — ${event.label}`,
        amount: eventAmount
      });
      feesTotal += eventAmount;
    }
  }

  const afterHoursFee = config.fees.find((fee) => fee.key === 'after_hours' && fee.is_active);
  if (afterHoursFee) {
    const eventAmount = Number(afterHoursFee.amount);
    if (pickupLocation && isOutsideWindow(input.pickupTime, pickupLocation.pickup_window)) {
      lineItems.push({
        type: 'after_hours',
        label: `${afterHoursFee.name_hr} — preuzimanje`,
        amount: eventAmount
      });
      feesTotal += eventAmount;
    }
    if (dropoffLocation && isOutsideWindow(input.dropoffTime, dropoffLocation.return_window)) {
      lineItems.push({
        type: 'after_hours',
        label: `${afterHoursFee.name_hr} — povrat`,
        amount: eventAmount
      });
      feesTotal += eventAmount;
    }
  }

  let extrasTotal = 0;
  let refundableDeposit = refundableDepositForVehicle(input.vehicle);
  const extraSelections: PricingExtraSelection[] = [];
  for (const extra of config.extras) {
    const appliesAutomatically =
      (extra.auto_apply_rule === 'border_crossing' && input.crossesBorder) ||
      (extra.auto_apply_rule === 'festival' && input.attendsFestival);
    const requestedQty = Math.max(
      appliesAutomatically ? 1 : 0,
      Math.floor(Number(input.selectedExtras[extra.id] ?? 0))
    );
    const qty = Math.min(extra.max_qty, extra.is_required ? Math.max(1, requestedQty) : requestedQty);
    if (qty === 0) continue;

    const unitPrice = Number(extra.price);
    const multiplier = extra.price_type === 'per_day' ? nights : 1;
    const selectionTotal = roundMoney(unitPrice * qty * multiplier);
    extraSelections.push({
      extra_id: extra.id,
      qty,
      unit_price: unitPrice,
      total_price: selectionTotal,
      price_type: extra.price_type
    });

    if (extra.price_type === 'refundable') {
      refundableDeposit += selectionTotal;
      continue;
    }

    const amount = selectionTotal;
    extrasTotal += amount;
    lineItems.push({
      type: 'extra',
      label: `${extra.name_hr} × ${qty}${extra.price_type === 'per_day' ? ` × ${nights} dana` : ''}`,
      amount,
      extra_id: extra.id,
      qty,
      unit_price: unitPrice
    });
  }

  const includedKm = Math.max(0, Number(config.kmPerDayIncluded)) * nights;
  const estimatedExtraKm = Math.max(0, Number(input.plannedKm || 0) - includedKm);
  const extraKmFee = config.fees.find((fee) => fee.key === 'extra_km' && fee.is_active);
  const estimatedExtraKmCost = extraKmFee
    ? roundMoney(estimatedExtraKm * Number(extraKmFee.amount))
    : 0;
  const extraKmNote =
    estimatedExtraKm > 0
      ? `Procjena prekoračenja: ${estimatedExtraKm} km (${estimatedExtraKmCost} €). Konačni obračun radi se po povratku vozila.`
      : null;

  vehicleTotal = roundMoney(vehicleTotal);
  feesTotal = roundMoney(feesTotal);
  extrasTotal = roundMoney(extrasTotal);
  refundableDeposit = roundMoney(refundableDeposit);
  const payableTotal = roundMoney(vehicleTotal + feesTotal + extrasTotal);

  return {
    nights,
    billable_nights: billableNights,
    season_name: seasonNames.length ? seasonNames.join(' / ') : null,
    season_names: seasonNames,
    min_nights_applied: minNightsApplied,
    min_nights_note: minNightsApplied
      ? `Minimalni broj noćenja za ovu sezonu je ${minimumNights} — cijena se obračunava za ${minimumNights} noćenja.`
      : null,
    line_items: lineItems,
    extra_selections: extraSelections,
    vehicle_total: vehicleTotal,
    extras_total: extrasTotal,
    fees_total: feesTotal,
    refundable_deposit: refundableDeposit,
    payable_total: payableTotal,
    deposit_if_split: input.paymentSplit ? roundMoney(payableTotal / 2) : payableTotal,
    included_km: includedKm,
    estimated_extra_km: estimatedExtraKm,
    estimated_extra_km_cost: estimatedExtraKmCost,
    extra_km_note: extraKmNote
  };
}
