import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CartItem = {
  id: string;
  slug: string;
  name_hr: string;
  name_en?: string;
  price: number;
  images: string[];
  qty: number;
  stock?: number;
  pickup_only?: boolean;
};

const initial: CartItem[] = browser
  ? (JSON.parse(localStorage.getItem('petroni_cart') || '[]') as CartItem[]).map((item) => ({
      ...item,
      qty: Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1))),
      stock: Number.isFinite(Number(item.stock)) ? Math.max(0, Math.floor(Number(item.stock))) : undefined
    }))
  : [];

export const cart = writable<CartItem[]>(initial);

if (browser) {
  cart.subscribe(value => {
    localStorage.setItem('petroni_cart', JSON.stringify(value));
  });
}

export function addToCart(product: Omit<CartItem, 'qty'>, qty = 1) {
  let added = 0;
  cart.update(items => {
    const existing = items.find(i => i.id === product.id);
    const maximum = Number.isFinite(Number(product.stock)) ? Math.max(0, Number(product.stock)) : 99;
    if (maximum <= 0) return items;
    if (existing) {
      const nextQty = Math.min(maximum, existing.qty + Math.max(1, qty));
      added = nextQty - existing.qty;
      existing.qty = nextQty;
      existing.stock = product.stock;
      return [...items];
    }
    const nextQty = Math.min(maximum, Math.max(1, qty));
    added = nextQty;
    return [...items, { ...product, qty: nextQty }];
  });
  return { added, maximum: Number(product.stock ?? 99) };
}

export function updateQty(id: string, qty: number) {
  cart.update(items => {
    if (qty <= 0) return items.filter(i => i.id !== id);
    return items.map(i => {
      if (i.id !== id) return i;
      const maximum = i.stock ?? 99;
      return maximum > 0
        ? { ...i, qty: Math.min(Math.max(1, Math.floor(qty)), maximum) }
        : i;
    });
  });
}

export async function syncCartStock(): Promise<{
  adjusted: boolean;
  unavailable: string[];
}> {
  const items = get(cart);
  if (!items.length) return { adjusted: false, unavailable: [] };

  const response = await fetch('/api/shop/stock', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids: items.map((item) => item.id) })
  });
  if (!response.ok) throw new Error('Stock check failed');
  const payload = await response.json();
  const levels = new Map<string, { stock: number; is_active: boolean; pickup_only: boolean }>(
    (payload.products ?? []).map((product: { id: string; stock: number; is_active: boolean; pickup_only: boolean }) => [product.id, product])
  );
  let adjusted = false;
  const unavailable: string[] = [];

  cart.update((current) => current.map((item) => {
    const level = levels.get(item.id);
    const stock = level?.is_active ? Math.max(0, Math.floor(Number(level.stock) || 0)) : 0;
    if (stock <= 0) unavailable.push(item.name_hr);
    const qty = stock > 0 ? Math.min(item.qty, stock) : item.qty;
    if (qty !== item.qty || stock !== item.stock) adjusted = adjusted || qty !== item.qty;
    return { ...item, qty, stock, pickup_only: Boolean(level?.pickup_only) };
  }));

  return { adjusted, unavailable };
}

export function removeFromCart(id: string) {
  cart.update(items => items.filter(i => i.id !== id));
}

export function clearCart() {
  cart.set([]);
}
