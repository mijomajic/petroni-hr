import { json } from '@sveltejs/kit';
import { getAvailableProducts } from '$lib/shop-stock.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const ids: string[] = [...new Set<string>(
    (Array.isArray(body.ids) ? body.ids : [])
      .map((id: unknown) => String(id))
      .filter((id: string) => /^[0-9a-f-]{36}$/i.test(id))
  )].slice(0, 100);

  if (!ids.length) return json({ products: [] });
  const { data, error } = await getAvailableProducts(ids);
  if (error) return json({ error: 'Stanje zalihe trenutačno nije moguće provjeriti.' }, { status: 500 });

  return json({
    products: (data ?? []).map((product) => ({
      id: product.id,
      stock: product.stock,
      is_active: product.is_active
    }))
  });
};
