import { supabaseAdmin } from '$lib/supabase.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 24;

function getNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);
  if (!rawValue) return undefined;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export const load: PageServerLoad = async ({ params, url }) => {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const sort = url.searchParams.get('sort') ?? 'newest';
  const query = (url.searchParams.get('q') ?? '').trim();
  const minPrice = getNumberParam(url, 'min');
  const maxPrice = getNumberParam(url, 'max');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: category }, { data: categories }] = await Promise.all([
    supabaseAdmin.from('product_categories').select('*').eq('slug', params.category).single(),
    supabaseAdmin.from('product_categories').select('*').order('sort_order')
  ]);

  if (!category) error(404, 'Kategorija nije pronađena.');

  const allCategories = categories ?? [];
  const categoryIds = [
    category.id,
    ...allCategories.filter((item) => item.parent_id === category.id).map((item) => item.id)
  ];

  let productsQuery = supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .in('category_id', categoryIds)
    .eq('is_active', true);

  if (query) {
    const safeQuery = query.replace(/[%_,]/g, ' ');
    productsQuery = productsQuery.or(`name_hr.ilike.%${safeQuery}%,sku.ilike.%${safeQuery}%`);
  }
  if (minPrice !== undefined) productsQuery = productsQuery.gte('price', minPrice);
  if (maxPrice !== undefined) productsQuery = productsQuery.lte('price', maxPrice);

  if (sort === 'price_asc') {
    productsQuery = productsQuery.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    productsQuery = productsQuery.order('price', { ascending: false });
  } else {
    productsQuery = productsQuery.order('created_at', { ascending: false });
  }

  const [{ data: products, error: productsError, count }, { data: productCategories }] = await Promise.all([
    productsQuery.range(from, to),
    supabaseAdmin
      .from('products')
      .select('category_id')
      .eq('is_active', true)
      .not('category_id', 'is', null)
      .range(0, 5000)
  ]);

  const usedCategoryIds = new Set((productCategories ?? []).map((product) => product.category_id));
  const visibleCategoryIds = new Set(usedCategoryIds);
  for (const item of allCategories) {
    if (usedCategoryIds.has(item.id) && item.parent_id) visibleCategoryIds.add(item.parent_id);
  }

  return {
    category,
    categories: allCategories.filter((item) => visibleCategoryIds.has(item.id)),
    products: products ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    sort,
    query,
    minPrice: url.searchParams.get('min') ?? '',
    maxPrice: url.searchParams.get('max') ?? '',
    loadError: productsError?.message ?? null
  };
};
