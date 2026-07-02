import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { data: product, error: productError } = await locals.supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (productError || !product) error(404, 'Proizvod nije pronađen.');

  const { data: relatedProducts } = product.category_id
    ? await locals.supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: [] };

  return { product, relatedProducts: relatedProducts ?? [] };
};
