import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [rentals, sales, products] = await Promise.all([
    locals.supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .order('sort_order')
      .limit(6),
    locals.supabase.from('vehicles').select('*').eq('type', 'sale').order('sort_order').limit(3),
    locals.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
  ]);

  return {
    rentalVehicles: rentals.data ?? [],
    saleVehicles: sales.data ?? [],
    products: products.data ?? []
  };
};
