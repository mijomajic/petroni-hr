import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const [{ data: category }, { data: categories }] = await Promise.all([
    locals.supabase.from('product_categories').select('*').eq('slug', params.category).single(),
    locals.supabase.from('product_categories').select('*').order('sort_order')
  ]);

  if (!category) error(404, 'Kategorija nije pronađena.');

  const { data: products, error: productsError } = await locals.supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return {
    category,
    categories: categories ?? [],
    products: products ?? [],
    loadError: productsError?.message ?? null
  };
};
