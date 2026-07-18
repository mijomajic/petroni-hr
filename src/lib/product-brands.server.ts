import { supabaseAdmin } from '$lib/supabase.server';
import { uniqueProductBrands } from '$lib/product-brands';

const BATCH_SIZE = 1000;

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

export async function getUsedPublicCategoryIds() {
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
  return ids;
}
