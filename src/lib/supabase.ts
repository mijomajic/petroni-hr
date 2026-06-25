import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SUPABASE_URL ?? '';
const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';

// Public (anon-key) client. Subject to Row Level Security. Falls back to a
// placeholder so the app still builds before the Supabase project/keys exist.
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

// ---------------------------------------------------------------------------
// Row types — kept in sync with /supabase/migrations/0001_init.sql
// ---------------------------------------------------------------------------

export type Vehicle = {
  id: string;
  slug: string;
  name: string;
  type: 'rental' | 'sale' | 'film';
  category: string | null;
  seats: number | null;
  bags: number | null;
  sale_price: number | null;
  description_hr: string | null;
  description_en: string | null;
  images: string[];
  specs: Record<string, unknown> | null;
  is_available: boolean;
  created_at: string;
  // --- New schema columns (all nullable in DB). Optional here so the temporary
  //     hardcoded mock vehicle arrays still type-check until Phase 2 rewires the UI. ---
  beds?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  base_price_per_day?: number | null;
  sort_order?: number;
  /** @deprecated DB column is now `base_price_per_day`. Kept until Phase 2 rewires the UI. */
  price_per_day?: number | null;
};

export type Season = {
  id: string;
  name: string;
  date_from: string;
  date_to: string;
  min_nights: number;
  sort_order: number;
};

export type SeasonPrice = {
  id: string;
  season_id: string;
  vehicle_id: string;
  price_per_day: number;
};

export type Fee = {
  id: string;
  key: 'sunday_holiday' | 'after_hours' | 'extra_km' | string;
  name_hr: string;
  description_hr: string | null;
  amount: number;
  fee_type: 'per_day' | 'per_event' | 'per_km' | 'percent';
  is_active: boolean;
};

export type RentalLocation = {
  id: string;
  name: string;
  location_fee: number;
  pickup_window: string | null;
  return_window: string | null;
  sort_order: number;
};

export type BookingExtra = {
  id: string;
  name_hr: string;
  name_en: string | null;
  description_hr: string | null;
  price: number;
  price_type: 'per_rental' | 'per_day' | 'refundable';
  category: 'oprema' | 'ciscenje' | 'depozit' | 'ostalo' | string | null;
  max_qty: number;
  is_required: boolean;
  sort_order: number;
};

export type Booking = {
  id: string;
  confirmation_number: string | null;
  user_id: string | null;
  vehicle_id: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time: string;
  dropoff_time: string;
  num_adults: number | null;
  num_children: number | null;
  planned_km: number | null;
  destination: string | null;
  driver_name: string;
  driver_last_name: string | null;
  driver_email: string;
  driver_phone: string;
  driver_dob: string | null;
  driver_license: string | null;
  driver_license_country: string | null;
  billing: Record<string, unknown> | null;
  notes: string | null;
  price_breakdown: Record<string, unknown> | null;
  extras_total: number;
  fees_total: number;
  total_price: number;
  deposit_amount: number | null;
  payment_split: boolean;
  first_payment_status: 'unpaid' | 'paid';
  second_payment_status: 'unpaid' | 'paid' | 'not_applicable';
  second_payment_due_date: string | null;
  payment_method: 'bank_transfer' | 'corvuspay' | 'cash' | null;
  corvuspay_order_id: string | null;
  terms_accepted_at: string | null;
  terms_accepted_ip: string | null;
  terms_version: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  invoice_sent: boolean;
  created_at: string;
};

export type BookingExtraSelection = {
  id: string;
  booking_id: string;
  extra_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
};

export type VehicleBlockedDate = {
  id: string;
  vehicle_id: string;
  date_from: string;
  date_to: string;
  reason: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name_hr: string;
  name_en: string | null;
  description_hr: string | null;
  description_en: string | null;
  price: number;
  category_id: string | null;
  images: string[];
  stock: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductCategory = {
  id: string;
  slug: string;
  name_hr: string;
  name_en: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type Order = {
  id: string;
  confirmation_number: string | null;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  items: unknown;
  subtotal: number;
  shipping_method: string | null;
  shipping_cost: number;
  total: number;
  payment_method: string | null;
  payment_status: 'unpaid' | 'paid' | string;
  corvuspay_order_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  invoice_sent: boolean;
  notes: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  slug: string;
  title_hr: string;
  title_en: string | null;
  content_hr: string | null;
  content_en: string | null;
  excerpt_hr: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  /** @deprecated Not a DB column in the new schema. Kept for the temporary mock posts until Phase 2. */
  excerpt_en?: string | null;
};

export type RentalTerms = {
  id: string;
  version: string;
  content_hr: string;
  is_active: boolean;
  created_at: string;
};

export type Setting = {
  key: string;
  value: unknown;
};

export async function checkAvailability(vehicleId: string, pickupDate: string, dropoffDate: string): Promise<boolean> {
  const [{ data: bookingConflicts }, { data: blockedConflicts }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .neq('status', 'cancelled')
      .lte('pickup_date', dropoffDate)
      .gte('dropoff_date', pickupDate),
    supabase
      .from('vehicle_blocked_dates')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .lte('date_from', dropoffDate)
      .gte('date_to', pickupDate)
  ]);

  return (bookingConflicts?.length ?? 0) === 0 && (blockedConflicts?.length ?? 0) === 0;
}
