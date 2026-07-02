import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const [products, categories] = await Promise.all([
    locals.supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    locals.supabase.from('product_categories').select('*').order('sort_order')
  ]);

  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    loadError: products.error?.message ?? categories.error?.message ?? null
  };
};
