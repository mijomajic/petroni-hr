import { supabaseAdmin } from '$lib/supabase.server';
import { withAvailableStock, type AvailableProduct } from '$lib/shop-stock.server';
import { getPublicProductBrands, getUsedPublicCategoryIds } from '$lib/product-brands.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 24;

function getNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);
  if (!rawValue) return undefined;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function categoryTreeIds(categories: Array<{ id: string; parent_id: string | null }>, rootId: string) {
  const result = new Set([rootId]);
  let foundNew = true;
  while (foundNew) {
    foundNew = false;
    for (const category of categories) {
      if (category.parent_id && result.has(category.parent_id) && !result.has(category.id)) {
        result.add(category.id);
        foundNew = true;
      }
    }
  }
  return [...result];
}

export const load: PageServerLoad = async ({ params, url }) => {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const sort = url.searchParams.get('sort') ?? 'newest';
  const query = (url.searchParams.get('q') ?? '').trim();
  const brand = (url.searchParams.get('brand') ?? '').trim();
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
  const categoryIds = categoryTreeIds(allCategories, category.id);

  let productsQuery = supabaseAdmin
    .from('shop_products_available')
    .select('*', { count: 'exact' })
    .in('category_id', categoryIds)
    .eq('is_active', true);

  if (query) {
    const safeQuery = query.replace(/[%_,]/g, ' ');
    productsQuery = productsQuery.or(`name_hr.ilike.%${safeQuery}%,sku.ilike.%${safeQuery}%,brand.ilike.%${safeQuery}%`);
  }
  if (brand) productsQuery = productsQuery.ilike('brand', brand);
  if (minPrice !== undefined) productsQuery = productsQuery.gte('price', minPrice);
  if (maxPrice !== undefined) productsQuery = productsQuery.lte('price', maxPrice);

  if (sort === 'price_asc') {
    productsQuery = productsQuery.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    productsQuery = productsQuery.order('price', { ascending: false });
  } else {
    productsQuery = productsQuery.order('created_at', { ascending: false });
  }

  const [{ data: products, error: productsError, count }, usedCategoryIds, brands] = await Promise.all([
    productsQuery.range(from, to),
    getUsedPublicCategoryIds(),
    getPublicProductBrands(categoryIds)
  ]);

  const visibleCategoryIds = new Set(usedCategoryIds);
  for (const item of allCategories) {
    if (usedCategoryIds.has(item.id) && item.parent_id) visibleCategoryIds.add(item.parent_id);
  }

  return {
    category,
    categories: allCategories.filter((item) => visibleCategoryIds.has(item.id)),
    brands,
    products: (products ?? []).map((product) => withAvailableStock(product as AvailableProduct)),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    sort,
    query,
    brand,
    minPrice: url.searchParams.get('min') ?? '',
    maxPrice: url.searchParams.get('max') ?? '',
    loadError: productsError?.message ?? null
  };
};
