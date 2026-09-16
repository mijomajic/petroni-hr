import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase.server';
import { withAvailableStock, type AvailableProduct } from '$lib/shop-stock.server';
import type { PageServerLoad } from './$types';
import { DEMO_PRODUCTS } from '$lib/demo-data';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const load: PageServerLoad = async ({ params }) => {
  if (useStaticDemoData) {
    const product = DEMO_PRODUCTS.find((item) => item.slug === params.slug);
    if (!product) error(404, 'Proizvod nije pronađen.');
    return {
      product,
      relatedProducts: DEMO_PRODUCTS.filter((item) => item.category_id === product.category_id && item.id !== product.id)
    };
  }

  const { data: productRow, error: productError } = await supabaseAdmin
    .from('shop_products_available')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (productError || !productRow) error(404, 'Proizvod nije pronađen.');
  const product = withAvailableStock(productRow as AvailableProduct);

  const { data: relatedProducts } = product.category_id
    ? await supabaseAdmin
        .from('shop_products_available')
        .select('*')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: [] };

  return {
    product,
    relatedProducts: (relatedProducts ?? []).map((related) => withAvailableStock(related as AvailableProduct))
  };
};
