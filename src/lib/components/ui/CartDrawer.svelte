<script lang="ts">
  import { cart, updateQty, removeFromCart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import { fly, fade } from 'svelte/transition';

  type Props = { open: boolean };
  let { open = $bindable() }: Props = $props();

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));
  const t = $derived($locale === 'hr'
    ? { title: 'Košarica', empty: 'Vaša košarica je prazna', shop: 'Nastavi kupovinu', subtotal: 'Međuzbroj', ship: 'Dostava se računa pri naplati', checkout: 'Naruči', view: 'Pregled košarice', remove: 'Ukloni' }
    : { title: 'Cart', empty: 'Your cart is empty', shop: 'Continue shopping', subtotal: 'Subtotal', ship: 'Shipping calculated at checkout', checkout: 'Checkout', view: 'View cart', remove: 'Remove' });
</script>

{#if open}
  <div class="fixed inset-0 z-[60]" style="background:rgba(20,22,26,0.45)" transition:fade={{ duration: 250 }}
       onclick={() => open = false} onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') open = false; }}
       role="button" tabindex="-1" aria-label="Close"></div>

  <div class="fixed right-0 top-0 bottom-0 z-[61] w-full max-w-md flex flex-col bg-white shadow-2xl"
       transition:fly={{ x: 420, duration: 350 }}>
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-5 border-b border-[#eceef1]">
      <h2 class="font-bold text-lg uppercase tracking-wide text-[#2b2b2b]">{t.title}</h2>
      <button onclick={() => open = false} class="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[#f3f4f6]" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      {#if $cart.length === 0}
        <div class="flex flex-col items-center justify-center h-full gap-4 text-[#8b9099]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p class="text-sm">{t.empty}</p>
          <button onclick={() => open = false} class="text-sm font-semibold" style="color:#b5890a">{t.shop}</button>
        </div>
      {:else}
        {#each $cart as item (item.id)}
          <div class="flex gap-4 p-3 rounded-lg border border-[#eceef1]">
            <div class="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-[#f6f7f9] flex items-center justify-center">
              {#if item.images?.[0]}
                <img src={item.images[0]} alt={item.name_hr} class="w-full h-full object-contain p-1" />
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-[#2b2b2b] line-clamp-2 mb-1">{$locale === 'hr' ? item.name_hr : (item.name_en || item.name_hr)}</p>
              <p class="font-semibold text-[#2b2b2b] mb-2">{(item.price * item.qty).toFixed(2)} €</p>
              <div class="flex items-center gap-2">
                <button onclick={() => updateQty(item.id, item.qty - 1)} class="w-7 h-7 rounded border border-[#e2e4e8] flex items-center justify-center font-bold text-[#2b2b2b] hover:border-[#f5c518]">−</button>
                <span class="text-sm w-6 text-center text-[#2b2b2b]">{item.qty}</span>
                <button onclick={() => updateQty(item.id, item.qty + 1)} class="w-7 h-7 rounded border border-[#e2e4e8] flex items-center justify-center font-bold text-[#2b2b2b] hover:border-[#f5c518]">+</button>
                <button onclick={() => removeFromCart(item.id)} class="ml-auto text-xs text-[#8b9099] hover:text-[#e11d48]">{t.remove}</button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Footer -->
    {#if $cart.length > 0}
      <div class="px-6 py-5 border-t border-[#eceef1]">
        <div class="flex justify-between mb-1">
          <span class="text-sm text-[#7a7f86]">{t.subtotal}</span>
          <span class="font-semibold text-[#2b2b2b]">{total.toFixed(2)} €</span>
        </div>
        <p class="text-xs text-[#8b9099] mb-4">{t.ship}</p>
        <a href="/checkout" onclick={() => open = false} class="btn btn-primary w-full">{t.checkout} — {total.toFixed(2)} €</a>
        <a href="/kosarica" onclick={() => open = false} class="mt-2 flex items-center justify-center w-full py-2.5 text-sm font-medium text-[#7a7f86] hover:text-[#2b2b2b] transition-colors">{t.view}</a>
      </div>
    {/if}
  </div>
{/if}
