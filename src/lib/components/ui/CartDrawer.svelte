<script lang="ts">
  import { cart, updateQty, removeFromCart } from '$lib/stores/cart';
  import { _ } from 'svelte-i18n';

  type Props = { open: boolean };
  let { open = $bindable() }: Props = $props();

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 transition-opacity duration-500"
    style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px)"
    onclick={() => open = false}
    role="button"
    tabindex="-1"
  ></div>

  <!-- Drawer -->
  <div class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col transition-transform duration-500" style="background: #111; border-left: 1px solid #2a2a2a">
    <!-- Header -->
    <div class="flex items-center justify-between p-6" style="border-bottom: 1px solid #1a1a1a">
      <h2 class="font-bold text-xl uppercase tracking-widest">{$_('cart.title')}</h2>
      <button
        onclick={() => open = false}
        class="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      {#if $cart.length === 0}
        <div class="flex flex-col items-center justify-center h-full gap-4" style="color: #9ca3af">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p class="text-sm">{$_('cart.empty')}</p>
          <button onclick={() => open = false} class="text-sm font-medium underline" style="color: #F5C518">{$_('cart.continueShopping')}</button>
        </div>
      {:else}
        {#each $cart as item}
          <div class="flex gap-4 p-4 rounded-2xl" style="background: #1a1a1a; border: 1px solid #2a2a2a">
            <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              {#if item.images?.[0]}
                <img src={item.images[0]} alt={item.name_hr} class="w-full h-full object-cover" />
              {:else}
                <div class="w-full h-full" style="background: #2a2a2a"></div>
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-white truncate mb-1">{item.name_hr}</p>
              <p class="font-bold text-white">€{(item.price * item.qty).toFixed(2)}</p>
              <div class="flex items-center gap-2 mt-2">
                <button onclick={() => updateQty(item.id, item.qty - 1)} class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors hover:bg-white/10" style="background: #2a2a2a">-</button>
                <span class="text-sm w-6 text-center">{item.qty}</span>
                <button onclick={() => updateQty(item.id, item.qty + 1)} class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors hover:bg-white/10" style="background: #2a2a2a">+</button>
                <button onclick={() => removeFromCart(item.id)} class="ml-auto text-xs transition-colors duration-200 hover:text-white" style="color: #9ca3af">{$_('cart.remove')}</button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Footer -->
    {#if $cart.length > 0}
      <div class="p-6" style="border-top: 1px solid #1a1a1a">
        <div class="flex justify-between mb-2">
          <span class="text-sm" style="color: #9ca3af">{$_('cart.subtotal')}</span>
          <span class="font-semibold">€{total.toFixed(2)}</span>
        </div>
        <p class="text-xs mb-4" style="color: #9ca3af">Dostava seračuna pri naplati</p>
        <a
          href="/checkout"
          onclick={() => open = false}
          class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-98"
          style="background: #F5C518"
        >
          {$_('cart.checkout')} — €{total.toFixed(2)}
        </a>
        <a
          href="/kosarica"
          onclick={() => open = false}
          class="mt-3 flex items-center justify-center w-full py-3 rounded-2xl text-sm font-medium transition-colors hover:bg-white/5"
          style="color: #9ca3af"
        >
          Pregled košarice
        </a>
      </div>
    {/if}
  </div>
{/if}
