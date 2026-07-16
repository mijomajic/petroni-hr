import { supabaseAdmin } from '$lib/supabase.server';

export type AvailableProduct = Record<string, unknown> & {
  id: string;
  stock: number;
  available_stock?: number;
};

export function withAvailableStock<T extends AvailableProduct>(product: T): T {
  return {
    ...product,
    stock: Math.max(0, Number(product.available_stock ?? product.stock ?? 0))
  };
}

export async function reserveOrderStock(orderId: string) {
  return supabaseAdmin.rpc('reserve_shop_order_stock', { p_order_id: orderId });
}

export async function commitOrderStock(orderId: string, orderStatus?: string) {
  return supabaseAdmin.rpc('commit_shop_order_stock', {
    p_order_id: orderId,
    p_order_status: orderStatus ?? null
  });
}

export async function cancelOrderAndReleaseStock(orderId: string) {
  return supabaseAdmin.rpc('cancel_shop_order_and_release_stock', { p_order_id: orderId });
}

export async function getAvailableProducts(ids: string[]) {
  if (!ids.length) return { data: [], error: null };
  const result = await supabaseAdmin
    .from('shop_products_available')
    .select('*')
    .in('id', ids);
  return {
    ...result,
    data: (result.data ?? []).map((product) => withAvailableStock(product as AvailableProduct))
  };
}

export async function getActiveReservedQuantity(productId: string) {
  const { data, error } = await supabaseAdmin
    .from('shop_stock_reservations')
    .select('quantity')
    .eq('product_id', productId)
    .eq('status', 'active');

  return {
    quantity: (data ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0),
    error
  };
}
