import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CartItem = {
  id: string;
  slug: string;
  name_hr: string;
  name_en?: string;
  price: number;
  images: string[];
  qty: number;
};

const initial: CartItem[] = browser
  ? JSON.parse(localStorage.getItem('petroni_cart') || '[]')
  : [];

export const cart = writable<CartItem[]>(initial);

if (browser) {
  cart.subscribe(value => {
    localStorage.setItem('petroni_cart', JSON.stringify(value));
  });
}

export function addToCart(product: Omit<CartItem, 'qty'>, qty = 1) {
  cart.update(items => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
      return [...items];
    }
    return [...items, { ...product, qty }];
  });
}

export function updateQty(id: string, qty: number) {
  cart.update(items => {
    if (qty <= 0) return items.filter(i => i.id !== id);
    return items.map(i => i.id === id ? { ...i, qty } : i);
  });
}

export function removeFromCart(id: string) {
  cart.update(items => items.filter(i => i.id !== id));
}

export function clearCart() {
  cart.set([]);
}
