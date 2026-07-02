import assert from 'node:assert/strict';
import test from 'node:test';
import { getCroatianPublicHolidays } from './holidays';
import { calculatePricing, type PricingConfig } from './pricing';
import type { BookingExtra, RentalLocation, Season, Vehicle } from './supabase';

const vehicle: Vehicle = {
  id: 'vehicle-1',
  slug: 'test-vehicle',
  name: 'Test vehicle',
  type: 'rental',
  category: 'COMFORT',
  seats: 4,
  beds: 4,
  bags: 4,
  max_adults: 4,
  max_children: 2,
  base_price_per_day: 100,
  sale_price: null,
  description_hr: null,
  description_en: null,
  images: [],
  specs: null,
  is_available: true,
  sort_order: 1,
  created_at: '2026-01-01T00:00:00Z'
};

const location: RentalLocation = {
  id: 'location-1',
  name: 'Zagreb Depot',
  location_fee: 20,
  pickup_window: '13:00-15:00',
  return_window: '08:00-10:00',
  sort_order: 1
};

const bookingFee: BookingExtra = {
  id: 'booking-fee',
  name_hr: 'Trošak rezervacije',
  name_en: null,
  description_hr: null,
  price: 40,
  price_type: 'per_rental',
  category: 'ostalo',
  max_qty: 1,
  is_required: true,
  sort_order: 1
};

function config(overrides: Partial<PricingConfig> = {}): PricingConfig {
  return {
    seasons: [],
    seasonPrices: [],
    fees: [],
    locations: [location],
    extras: [bookingFee],
    kmPerDayIncluded: 300,
    ...overrides
  };
}

function season(id: string, name: string, from: string, to: string, minNights = 1): Season {
  return { id, name, date_from: from, date_to: to, min_nights: minNights, sort_order: 1 };
}

test('2026 Croatian moving holidays match the official calendar', () => {
  const holidays = getCroatianPublicHolidays(2026);
  assert.equal(holidays.has('2026-04-05'), true);
  assert.equal(holidays.has('2026-04-06'), true);
  assert.equal(holidays.has('2026-06-04'), true);
  assert.equal(holidays.has('2026-08-05'), true);
});

test('minimum nights use the pickup season and required booking fee is automatic', () => {
  const main = season('main', 'Glavna sezona', '2026-07-01', '2026-08-31', 7);
  const result = calculatePricing(
    {
      vehicle,
      pickupDate: '2026-07-10',
      dropoffDate: '2026-07-13',
      pickupTime: '14:00',
      dropoffTime: '09:00',
      pickupLocation: 'Zagreb Depot',
      dropoffLocation: 'Zagreb Depot',
      plannedKm: 0,
      selectedExtras: {}
    },
    config({
      seasons: [main],
      seasonPrices: [{ id: 'price-1', season_id: main.id, vehicle_id: vehicle.id, price_per_day: 120 }]
    })
  );

  assert.equal(result.nights, 3);
  assert.equal(result.billable_nights, 7);
  assert.equal(result.min_nights_applied, true);
  assert.equal(result.vehicle_total, 840);
  assert.equal(result.extras_total, 40);
  assert.equal(result.fees_total, 20);
  assert.equal(result.payable_total, 900);
});

test('rentals spanning seasons are split night by night', () => {
  const early = season('early', 'Predsezona', '2026-06-01', '2026-06-30');
  const main = season('main', 'Glavna sezona', '2026-07-01', '2026-08-31');
  const result = calculatePricing(
    {
      vehicle,
      pickupDate: '2026-06-29',
      dropoffDate: '2026-07-03',
      pickupTime: '14:00',
      dropoffTime: '09:00',
      pickupLocation: 'Zagreb Depot',
      dropoffLocation: 'Zagreb Depot',
      plannedKm: 0,
      selectedExtras: {}
    },
    config({
      seasons: [early, main],
      seasonPrices: [
        { id: 'price-1', season_id: early.id, vehicle_id: vehicle.id, price_per_day: 80 },
        { id: 'price-2', season_id: main.id, vehicle_id: vehicle.id, price_per_day: 120 }
      ]
    })
  );

  assert.equal(result.vehicle_total, 400);
  assert.deepEqual(result.season_names, ['Predsezona', 'Glavna sezona']);
});

test('event fees, per-day extras, deposits and estimated extra kilometres stay separate', () => {
  const bicycle: BookingExtra = {
    ...bookingFee,
    id: 'bicycle',
    name_hr: 'Bicikl',
    price: 10,
    price_type: 'per_day',
    max_qty: 4,
    is_required: false
  };
  const deposit: BookingExtra = {
    ...bookingFee,
    id: 'deposit',
    name_hr: 'Depozit',
    price: 2_000,
    price_type: 'refundable',
    is_required: false
  };

  const result = calculatePricing(
    {
      vehicle,
      pickupDate: '2026-04-05',
      dropoffDate: '2026-04-07',
      pickupTime: '11:00',
      dropoffTime: '12:00',
      pickupLocation: 'Zagreb Depot',
      dropoffLocation: 'Zagreb Depot',
      plannedKm: 800,
      selectedExtras: { bicycle: 2, deposit: 1 },
      paymentSplit: true
    },
    config({
      extras: [bookingFee, bicycle, deposit],
      fees: [
        {
          id: 'sunday',
          key: 'sunday_holiday',
          name_hr: 'Nedjelja/praznik',
          description_hr: null,
          amount: 50,
          fee_type: 'per_event',
          is_active: true
        },
        {
          id: 'after',
          key: 'after_hours',
          name_hr: 'Izvan radnog vremena',
          description_hr: null,
          amount: 30,
          fee_type: 'per_event',
          is_active: true
        },
        {
          id: 'km',
          key: 'extra_km',
          name_hr: 'Dodatni kilometar',
          description_hr: null,
          amount: 0.3,
          fee_type: 'per_km',
          is_active: true
        }
      ]
    })
  );

  assert.equal(result.vehicle_total, 200);
  assert.equal(result.extras_total, 80);
  assert.equal(result.fees_total, 130);
  assert.equal(result.refundable_deposit, 2_000);
  assert.equal(result.payable_total, 410);
  assert.equal(result.deposit_if_split, 205);
  assert.equal(result.estimated_extra_km, 200);
  assert.equal(result.estimated_extra_km_cost, 60);
});
