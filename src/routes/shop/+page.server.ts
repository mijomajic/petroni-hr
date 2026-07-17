import { supabaseAdmin } from '$lib/supabase.server';
import { withAvailableStock, type AvailableProduct } from '$lib/shop-stock.server';
import { uniqueProductBrands } from '$lib/product-brands';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 24;

function getNumberParam(url: URL, key: string) {
  const rawValue = url.searchParams.get(key);
  if (!rawValue) return undefined;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export const load: PageServerLoad = async ({ url }) => {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const sort = url.searchParams.get('sort') ?? 'newest';
  const query = (url.searchParams.get('q') ?? '').trim();
  const brand = (url.searchParams.get('brand') ?? '').trim();
  const minPrice = getNumberParam(url, 'min');
  const maxPrice = getNumberParam(url, 'max');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let productsQuery = supabaseAdmin
    .from('shop_products_available')
    .select('*', { count: 'exact' })
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

  const [products, categories, productCategories, productBrands] = await Promise.all([
    productsQuery.range(from, to),
    supabaseAdmin.from('product_categories').select('*').order('sort_order'),
    supabaseAdmin
      .from('shop_products_available')
      .select('category_id')
      .eq('is_active', true)
      .not('category_id', 'is', null)
      .range(0, 5000),
    supabaseAdmin
      .from('shop_products_available')
      .select('brand')
      .eq('is_active', true)
      .not('brand', 'is', null)
      .range(0, 5000)
  ]);

  const allCategories = categories.data ?? [];
  const usedCategoryIds = new Set((productCategories.data ?? []).map((product) => product.category_id));
  const visibleCategoryIds = new Set(usedCategoryIds);
  for (const category of allCategories) {
    if (usedCategoryIds.has(category.id) && category.parent_id) visibleCategoryIds.add(category.parent_id);
  }
  const visibleCategories = allCategories.filter((category) => visibleCategoryIds.has(category.id));

  return {
    products: (products.data ?? []).map((product) => withAvailableStock(product as AvailableProduct)),
    categories: visibleCategories,
    brands: uniqueProductBrands(productBrands.data ?? []),
    total: products.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    sort,
    query,
    brand,
    minPrice: url.searchParams.get('min') ?? '',
    maxPrice: url.searchParams.get('max') ?? '',
    loadError: products.error?.message ?? categories.error?.message ?? productBrands.error?.message ?? null
  };
};
