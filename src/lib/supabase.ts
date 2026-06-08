import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SUPABASE_URL ?? '';
const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

export type Vehicle = {
  id: string;
  slug: string;
  name: string;
  type: 'rental' | 'sale' | 'film';
  category: string | null;
  seats: number | null;
  bags: number | null;
  price_per_day: number | null;
  sale_price: number | null;
  description_hr: string | null;
  description_en: string | null;
  images: string[];
  specs: Record<string, unknown> | null;
  is_available: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  vehicle_id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time: string;
  dropoff_time: string;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  driver_age: number;
  extras: Record<string, unknown> | null;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'deposit_paid' | 'paid';
  stripe_payment_intent: string | null;
  paypal_order_id: string | null;
  notes: string | null;
  created_at: string;
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

export type Post = {
  id: string;
  slug: string;
  title_hr: string;
  title_en: string | null;
  content_hr: string | null;
  content_en: string | null;
  excerpt_hr: string | null;
  excerpt_en: string | null;
  cover_image: string | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
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
