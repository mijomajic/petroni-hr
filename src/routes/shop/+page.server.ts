import { supabaseAdmin } from '$lib/supabase.server';
import { withAvailableStock, type AvailableProduct } from '$lib/shop-stock.server';
import { getFeaturedPublicProductBrands, getUsedPublicCategoryIds } from '$lib/product-brands.server';
import type { PageServerLoad } from './$types';
import { DEMO_PRODUCTS, DEMO_PRODUCT_CATEGORIES } from '$lib/demo-data';
import { useStaticDemoData } from '$lib/demo-mode.server';

const PAGE_SIZE = 24;

const DEMO_CATALOGUE = (() => {
  const categoryGroups = DEMO_PRODUCT_CATEGORIES.map((category) =>
    DEMO_PRODUCTS.filter((product) => product.category_id === category.id)
  );
  const longestGroup = Math.max(0, ...categoryGroups.map((group) => group.length));
  return Array.from({ length: longestGroup }, (_, productIndex) =>
    categoryGroups.map((group) => group[productIndex]).filter(Boolean)
  ).flat();
})();

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

  if (useStaticDemoData) {
    let demoProducts = DEMO_CATALOGUE.filter((product) => {
      const searchable = `${product.name_hr} ${product.name_en ?? ''} ${product.sku ?? ''} ${product.brand ?? ''}`.toLowerCase();
      return (!query || searchable.includes(query.toLowerCase()))
        && (!brand || product.brand?.toLowerCase() === brand.toLowerCase())
        && (minPrice === undefined || product.price >= minPrice)
        && (maxPrice === undefined || product.price <= maxPrice);
    });
    if (sort === 'price_asc') demoProducts = demoProducts.toSorted((a, b) => a.price - b.price);
    if (sort === 'price_desc') demoProducts = demoProducts.toSorted((a, b) => b.price - a.price);
    const total = demoProducts.length;

    return {
      products: demoProducts.slice(from, to + 1),
      categories: DEMO_PRODUCT_CATEGORIES,
      featuredBrands: ['Alderway Essentials'],
      total,
      page,
      pageSize: PAGE_SIZE,
      sort,
      query,
      brand,
      minPrice: url.searchParams.get('min') ?? '',
      maxPrice: url.searchParams.get('max') ?? '',
      loadError: null
    };
  }

  let productsQuery = supabaseAdmin
    .from('shop_products_available')
    .select('id,slug,name_hr,name_en,price,images,stock,available_stock,pickup_only', { count: 'exact' })
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

  const [products, categories, usedCategoryIds, featuredBrands] = await Promise.all([
    productsQuery.range(from, to),
    supabaseAdmin.from('product_categories').select('*').order('sort_order'),
    getUsedPublicCategoryIds(),
    getFeaturedPublicProductBrands()
  ]);

  const allCategories = categories.data ?? [];
  const visibleCategoryIds = new Set(usedCategoryIds);
  for (const category of allCategories) {
    if (usedCategoryIds.has(category.id) && category.parent_id) visibleCategoryIds.add(category.parent_id);
  }
  const visibleCategories = allCategories.filter((category) => visibleCategoryIds.has(category.id));

  return {
    products: (products.data ?? []).map((product) => withAvailableStock(product as AvailableProduct)),
    categories: visibleCategories,
    featuredBrands,
    total: products.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    sort,
    query,
    brand,
    minPrice: url.searchParams.get('min') ?? '',
    maxPrice: url.searchParams.get('max') ?? '',
    loadError: products.error?.message ?? categories.error?.message ?? null
  };
};
