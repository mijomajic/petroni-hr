<script lang="ts">
  import { cart, clearCart } from '$lib/stores/cart';

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let address = $state('');
  let city = $state('');
  let zip = $state('');
  let country = $state('Hrvatska');
  let loading = $state(false);

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));

  async function handleCheckout() {
    loading = true;
    try {
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: $cart,
          customer: { name, email, phone, address, city, zip, country },
          total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        window.location.href = '/checkout/success';
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Narudžba — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-6xl mx-auto px-4 md:px-6">
    <h1 class="text-4xl font-black uppercase tracking-tight text-white mb-12">NARUDŽBA</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Form -->
      <div class="space-y-6">
        <div class="p-8 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
          <h2 class="text-lg font-bold uppercase tracking-widest text-white mb-6">Podaci kupca</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each [
              { key: 'name', label: 'Ime i prezime', type: 'text', bind: name, span: 2 },
              { key: 'email', label: 'Email', type: 'email', bind: email, span: 1 },
              { key: 'phone', label: 'Telefon', type: 'tel', bind: phone, span: 1 },
              { key: 'address', label: 'Adresa', type: 'text', bind: address, span: 2 },
              { key: 'city', label: 'Grad', type: 'text', bind: city, span: 1 },
              { key: 'zip', label: 'Poštanski broj', type: 'text', bind: zip, span: 1 },
              { key: 'country', label: 'Država', type: 'text', bind: country, span: 2 },
            ] as field}
              <div class="{field.span === 2 ? 'md:col-span-2' : ''} space-y-2">
                <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{field.label}</label>
                <input
                  type={field.type}
                  class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                  style="background: #1a1a1a; border: 1px solid #2a2a2a"
                  bind:value={field.bind}
                />
              </div>
            {/each}
          </div>
        </div>

        <div class="p-8 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
          <h2 class="text-lg font-bold uppercase tracking-widest text-white mb-4">Plaćanje</h2>
          <div class="p-4 rounded-xl" style="background: #1a1a1a; border: 1px solid #2a2a2a">
            <p class="text-sm text-center" style="color: #9ca3af">Stripe elementi aktivirani nakon unosa API ključeva.</p>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div class="p-6 rounded-[2rem] sticky top-28" style="background: #111; border: 1px solid #1a1a1a">
          <h2 class="text-lg font-bold uppercase tracking-widest text-white mb-6">Vaša narudžba</h2>
          <div class="space-y-3 mb-6">
            {#each $cart as item}
              <div class="flex justify-between text-sm">
                <span style="color: #9ca3af">{item.name_hr} × {item.qty}</span>
                <span class="text-white">€{(item.price * item.qty).toFixed(2)}</span>
              </div>
            {/each}
          </div>
          <div class="pt-4 space-y-2 mb-6" style="border-top: 1px solid #2a2a2a">
            <div class="flex justify-between text-sm"><span style="color: #9ca3af">Međuzbroj</span><span class="text-white">€{total.toFixed(2)}</span></div>
            <div class="flex justify-between font-bold text-xl"><span class="text-white">Ukupno</span><span style="color: #F5C518">€{total.toFixed(2)}</span></div>
          </div>
          <button
            onclick={handleCheckout}
            disabled={loading || $cart.length === 0 || !name || !email}
            class="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-40"
            style="background: #F5C518"
          >
            {loading ? 'Obrađujem...' : `Plati €${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
