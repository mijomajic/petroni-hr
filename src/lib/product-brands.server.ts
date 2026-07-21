import { supabaseAdmin } from '$lib/supabase.server';
import { orderedFeaturedBrands, uniqueProductBrands } from '$lib/product-brands';

const BATCH_SIZE = 1000;
const PUBLIC_CATEGORY_CACHE_MS = 60_000;

let publicCategoryCache: { ids: string[]; expiresAt: number } | null = null;
let publicCategoryRequest: Promise<string[]> | null = null;

async function collectBrands(
  source: 'products' | 'shop_products_available',
  options: { activeOnly?: boolean; categoryIds?: string[] } = {}
) {
  const rows: Array<{ brand: string | null }> = [];

  for (let from = 0; ; from += BATCH_SIZE) {
    let query = supabaseAdmin
      .from(source)
      .select('id,brand')
      .not('brand', 'is', null)
      .order('id', { ascending: true });
    if (options.activeOnly) query = query.eq('is_active', true);
    if (options.categoryIds?.length) query = query.in('category_id', options.categoryIds);

    const { data, error } = await query.range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < BATCH_SIZE) break;
  }

  return uniqueProductBrands(rows);
}

export function getPublicProductBrands(categoryIds?: string[]) {
  return collectBrands('shop_products_available', { activeOnly: true, categoryIds });
}

export function getAdminProductBrands() {
  return collectBrands('products');
}

export async function getFeaturedPublicProductBrands(categoryIds?: string[]) {
  const setting = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'shop_featured_brands')
    .maybeSingle();
  if (setting.error) return [];

  const configured = Array.isArray(setting.data?.value)
    ? setting.data.value.map((value) => String(value ?? '').trim()).filter(Boolean)
    : [];
  if (configured.length === 0) return [];

  let query = supabaseAdmin
    .from('shop_products_available')
    .select('brand')
    .eq('is_active', true)
    .in('brand', configured)
    .limit(1000);
  if (categoryIds?.length) query = query.in('category_id', categoryIds);

  const available = await query;
  if (available.error) return [];
  return orderedFeaturedBrands(uniqueProductBrands(available.data ?? []), configured);
}

async function loadUsedPublicCategoryIds() {
  const ids = new Set<string>();
  for (let from = 0; ; from += BATCH_SIZE) {
    const { data, error } = await supabaseAdmin
      .from('shop_products_available')
      .select('id,category_id')
      .eq('is_active', true)
      .not('category_id', 'is', null)
      .order('id', { ascending: true })
      .range(from, from + BATCH_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    for (const row of batch) if (row.category_id) ids.add(row.category_id);
    if (batch.length < BATCH_SIZE) break;
  }
  return [...ids];
}

export async function getUsedPublicCategoryIds() {
  if (publicCategoryCache && publicCategoryCache.expiresAt > Date.now()) {
    return new Set(publicCategoryCache.ids);
  }

  publicCategoryRequest ??= loadUsedPublicCategoryIds();
  try {
    const ids = await publicCategoryRequest;
    publicCategoryCache = { ids, expiresAt: Date.now() + PUBLIC_CATEGORY_CACHE_MS };
    return new Set(ids);
  } finally {
    publicCategoryRequest = null;
  }
}
