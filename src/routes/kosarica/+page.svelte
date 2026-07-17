<script lang="ts">
  import { onMount } from 'svelte';
  import { cart, updateQty, removeFromCart, syncCartStock } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));

  let couponCode = $state('');
  let couponMessage = $state('');
  let checkingStock = $state(true);
  let stockMessage = $state('');
  const hasUnavailableItems = $derived($cart.some((item) => item.stock !== undefined && item.stock <= 0));

  onMount(async () => {
    try {
      const result = await syncCartStock();
      if (result.unavailable.length) {
        stockMessage = $locale === 'hr'
          ? 'Jedan ili više proizvoda više nije dostupno. Uklonite ih iz košarice.'
          : 'One or more products are no longer available. Remove them from your cart.';
      } else if (result.adjusted) {
        stockMessage = $locale === 'hr'
          ? 'Količine u košarici usklađene su s trenutačnom zalihom.'
          : 'Cart quantities were adjusted to current stock.';
      }
    } catch {
      stockMessage = $locale === 'hr'
        ? 'Stanje zalihe trenutačno nije moguće provjeriti. Pokušajte ponovno.'
        : 'Stock could not be checked. Please try again.';
    } finally {
      checkingStock = false;
    }
  });

  function applyCoupon() {
    if (!couponCode.trim()) return;
    couponMessage = $locale === 'hr' ? 'Kupon nije valjan.' : 'Coupon is not valid.';
  }
</script>

<svelte:head>
  <title>Košarica — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="section">
  <div class="container-x max-w-5xl mx-auto">
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Košarica' : 'Cart'}</h1>

    {#if $cart.length === 0}
      <div class="text-center py-20 card">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d7dade" stroke-width="1.2" class="mx-auto mb-5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p class="text-[#7a7f86] mb-6">{$locale === 'hr' ? 'Vaša košarica je prazna' : 'Your cart is empty'}</p>
        <a href="/shop" class="btn btn-primary px-7 py-3">{$locale === 'hr' ? 'Nastavi kupovinu' : 'Continue shopping'}</a>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          {#each $cart as item (item.id)}
            <div class="card flex gap-4 p-5">
              <div class="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-[#f6f7f9] flex items-center justify-center">
                {#if item.images?.[0]}<img src={item.images[0]} alt="" class="w-full h-full object-contain p-2" />{/if}
              </div>
              <div class="flex-1">
                <p class="font-medium text-[#2b2b2b] mb-1">{$locale === 'hr' ? item.name_hr : (item.name_en || item.name_hr)}</p>
                <p class="font-semibold mb-3" style="color:#b5890a">{(item.price * item.qty).toFixed(2)} €</p>
                {#if item.pickup_only}
                  <p class="mb-3 inline-flex rounded-md bg-[#fff7e0] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7a5d00]">{$locale === 'hr' ? 'Samo osobno preuzimanje' : 'Pickup only'}</p>
                {/if}
                <div class="flex items-center gap-3">
                  <div class="flex items-center rounded-md overflow-hidden border border-[#e2e4e8]">
                    <button onclick={() => updateQty(item.id, item.qty - 1)} class="px-3 py-2 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9]">−</button>
                    <span class="px-3 text-sm font-semibold text-[#2b2b2b]">{item.qty}</span>
                    <button onclick={() => updateQty(item.id, item.qty + 1)} disabled={item.stock !== undefined && item.qty >= item.stock} class="px-3 py-2 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9] disabled:cursor-not-allowed disabled:opacity-35">+</button>
                  </div>
                  <button onclick={() => removeFromCart(item.id)} class="text-xs text-[#8b9099] hover:text-[#e11d48] underline">{$locale === 'hr' ? 'Ukloni' : 'Remove'}</button>
                </div>
                {#if item.stock !== undefined}
                  <p class="mt-2 text-xs" class:text-[#b42318]={item.stock <= 0} class:text-[#7a7f86]={item.stock > 0}>
                    {item.stock > 0
                      ? ($locale === 'hr' ? `Dostupno: ${item.stock}` : `Available: ${item.stock}`)
                      : ($locale === 'hr' ? 'Trenutačno nije dostupno' : 'Currently unavailable')}
                  </p>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <div>
          <div class="card p-6 sticky top-24">
            <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Sažetak' : 'Summary'}</h2>

            <div class="mb-5">
              <span class="field-label">{$locale === 'hr' ? 'Kod kupona' : 'Coupon code'}</span>
              <div class="flex gap-2">
                <input type="text" class="field" placeholder={$locale === 'hr' ? 'Unesite kod' : 'Enter code'} bind:value={couponCode} />
                <button onclick={applyCoupon} class="btn btn-ghost px-4 whitespace-nowrap text-[11px]">{$locale === 'hr' ? 'PRIMIJENI KUPON' : 'APPLY COUPON'}</button>
              </div>
              {#if couponMessage}
                <p class="text-xs mt-2" style="color:#e11d48">{couponMessage}</p>
              {/if}
            </div>

            <div class="space-y-3 mb-5">
              <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Međuzbroj' : 'Subtotal'}</span><span class="text-[#2b2b2b]">{total.toFixed(2)} €</span></div>
              <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Dostava' : 'Shipping'}</span><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Izračun pri naplati' : 'At checkout'}</span></div>
              <div class="pt-3 flex justify-between font-bold text-lg border-t border-[#ededf0]"><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}</span><span style="color:#b5890a">{total.toFixed(2)} €</span></div>
            </div>
            {#if stockMessage}<p class="mb-4 rounded-lg border border-[#f0d49b] bg-[#fffaf0] p-3 text-sm text-[#805b12]">{stockMessage}</p>{/if}
            {#if hasUnavailableItems || checkingStock}
              <button disabled class="btn btn-primary w-full opacity-50">{checkingStock ? ($locale === 'hr' ? 'Provjeravam zalihu…' : 'Checking stock…') : ($locale === 'hr' ? 'Provjerite košaricu' : 'Check your cart')}</button>
            {:else}
              <a href="/checkout" class="btn btn-primary w-full">{$locale === 'hr' ? 'Naruči' : 'Checkout'}</a>
            {/if}
            <a href="/shop" class="mt-2 flex items-center justify-center w-full py-2.5 text-sm font-medium text-[#7a7f86] hover:text-[#2b2b2b]">{$locale === 'hr' ? 'Nastavi kupovinu' : 'Continue shopping'}</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
