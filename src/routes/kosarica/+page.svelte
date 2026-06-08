<script lang="ts">
  import { cart, updateQty, removeFromCart } from '$lib/stores/cart';

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));
</script>

<svelte:head><title>Košarica — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-5xl mx-auto px-4 md:px-6">
    <h1 class="text-5xl font-black uppercase tracking-tight text-white mb-12">KOŠARICA</h1>

    {#if $cart.length === 0}
      <div class="text-center py-20 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-6" style="color: #2a2a2a">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p class="text-sm mb-6" style="color: #9ca3af">Vaša košarica je prazna</p>
        <a href="/shop" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest text-black" style="background: #F5C518">
          Nastavi kupovinu
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Items -->
        <div class="lg:col-span-2 space-y-4">
          {#each $cart as item}
            <div class="flex gap-4 p-5 rounded-2xl" style="background: #111; border: 1px solid #1a1a1a">
              <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0" style="background: #1a1a1a">
                {#if item.images?.[0]}
                  <img src={item.images[0]} alt={item.name_hr} class="w-full h-full object-contain p-2" />
                {/if}
              </div>
              <div class="flex-1">
                <p class="font-bold text-white mb-1">{item.name_hr}</p>
                <p class="text-sm font-bold mb-3" style="color: #F5C518">€{(item.price * item.qty).toFixed(2)}</p>
                <div class="flex items-center gap-3">
                  <div class="flex items-center rounded-xl overflow-hidden" style="background: #1a1a1a; border: 1px solid #2a2a2a">
                    <button onclick={() => updateQty(item.id, item.qty - 1)} class="px-3 py-2 font-bold hover:bg-white/10 text-white">-</button>
                    <span class="px-3 text-sm font-bold text-white">{item.qty}</span>
                    <button onclick={() => updateQty(item.id, item.qty + 1)} class="px-3 py-2 font-bold hover:bg-white/10 text-white">+</button>
                  </div>
                  <button onclick={() => removeFromCart(item.id)} class="text-xs underline transition-colors hover:text-white" style="color: #9ca3af">Ukloni</button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <div class="p-6 rounded-2xl sticky top-28" style="background: #111; border: 1px solid #1a1a1a">
            <h2 class="text-lg font-bold uppercase tracking-widest text-white mb-6">Sažetak</h2>
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span style="color: #9ca3af">Međuzbroj</span>
                <span class="text-white">€{total.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span style="color: #9ca3af">Dostava</span>
                <span class="text-white">Izračun pri naplati</span>
              </div>
              <div class="pt-3 flex justify-between font-bold text-lg" style="border-top: 1px solid #2a2a2a">
                <span class="text-white">Ukupno</span>
                <span style="color: #F5C518">€{total.toFixed(2)}</span>
              </div>
            </div>
            <a
              href="/checkout"
              class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95"
              style="background: #F5C518"
            >
              Naruči
            </a>
            <a href="/shop" class="mt-3 flex items-center justify-center w-full py-3 text-sm font-medium transition-colors hover:text-white" style="color: #9ca3af">
              Nastavi kupovinu
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
