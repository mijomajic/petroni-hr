<script lang="ts">
  import { cart, clearCart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let address = $state('');
  let city = $state('');
  let zip = $state('');
  let country = $state('Hrvatska');
  let loading = $state(false);
  let submitError = $state('');
  let paymentMethod = $state<'bank_transfer' | 'corvuspay'>('bank_transfer');

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));

  async function handleCheckout() {
    loading = true;
    submitError = '';
    try {
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: $cart,
          customer: { name, email, phone, address, city, zip, country },
          payment_method: paymentMethod
        }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('petroni_order_result', JSON.stringify(data));
        clearCart();
        if (data.corvuspay) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.corvuspay.url;
          for (const [name, value] of Object.entries(data.corvuspay.fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = String(value);
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
        } else {
          window.location.href = '/checkout/success';
        }
      } else {
        submitError = data.error || ($locale === 'hr' ? 'Narudžbu nije moguće spremiti.' : 'The order could not be saved.');
      }
    } catch (e) {
      console.error(e);
      submitError = $locale === 'hr'
        ? 'Narudžbu nije moguće spremiti. Provjerite vezu i pokušajte ponovno.'
        : 'The order could not be saved. Check your connection and try again.';
    } finally { loading = false; }
  }

  const fields = $derived([
    { key: 'name', label: $locale === 'hr' ? 'Ime i prezime' : 'Full name', type: 'text', span: 2 },
    { key: 'email', label: 'Email', type: 'email', span: 1 },
    { key: 'phone', label: $locale === 'hr' ? 'Telefon' : 'Phone', type: 'tel', span: 1 },
    { key: 'address', label: $locale === 'hr' ? 'Adresa' : 'Address', type: 'text', span: 2 },
    { key: 'city', label: $locale === 'hr' ? 'Grad' : 'City', type: 'text', span: 1 },
    { key: 'zip', label: $locale === 'hr' ? 'Poštanski broj' : 'ZIP', type: 'text', span: 1 },
    { key: 'country', label: $locale === 'hr' ? 'Država' : 'Country', type: 'text', span: 2 },
  ]);
</script>

<svelte:head><title>Narudžba — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x max-w-6xl mx-auto">
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Narudžba' : 'Checkout'}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div class="space-y-6">
        <div class="card p-7">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Podaci kupca' : 'Customer details'}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each fields as f}
              <div class="{f.span === 2 ? 'md:col-span-2' : ''}">
                <span class="field-label">{f.label}</span>
                {#if f.key === 'name'}<input type={f.type} class="field" bind:value={name} />
                {:else if f.key === 'email'}<input type={f.type} class="field" bind:value={email} />
                {:else if f.key === 'phone'}<input type={f.type} class="field" bind:value={phone} />
                {:else if f.key === 'address'}<input type={f.type} class="field" bind:value={address} />
                {:else if f.key === 'city'}<input type={f.type} class="field" bind:value={city} />
                {:else if f.key === 'zip'}<input type={f.type} class="field" bind:value={zip} />
                {:else}<input type={f.type} class="field" bind:value={country} />{/if}
              </div>
            {/each}
          </div>
        </div>

        <div class="card p-7">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Plaćanje' : 'Payment'}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onclick={() => paymentMethod = 'bank_transfer'} class="p-4 rounded-md text-center" style="border:2px solid {paymentMethod === 'bank_transfer' ? '#f5c518' : '#e2e4e8'}">
              <p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Bankovna uplata' : 'Bank transfer'}</p>
              <p class="text-xs text-[#9aa0a8] mt-1">HUB-3 / PDF417</p>
            </button>
            <button type="button" onclick={() => data.corvuspayAvailable && (paymentMethod = 'corvuspay')} disabled={!data.corvuspayAvailable} class="p-4 rounded-md text-center disabled:opacity-50" style="border:2px solid {paymentMethod === 'corvuspay' ? '#f5c518' : '#e2e4e8'}">
              <p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Kartica' : 'Card'}</p>
              <p class="text-xs text-[#9aa0a8] mt-1">{data.corvuspayAvailable ? 'CorvusPay' : ($locale === 'hr' ? 'Uskoro dostupno' : 'Coming soon')}</p>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div class="card p-6 sticky top-24">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Vaša narudžba' : 'Your order'}</h2>
          {#if $cart.length === 0}
            <p class="text-sm text-[#9aa0a8] mb-4">{$locale === 'hr' ? 'Košarica je prazna.' : 'Your cart is empty.'}</p>
          {:else}
            <div class="space-y-3 mb-5">
              {#each $cart as item (item.id)}
                <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{($locale === 'hr' ? item.name_hr : (item.name_en || item.name_hr))} × {item.qty}</span><span class="text-[#2b2b2b]">{(item.price * item.qty).toFixed(2)} €</span></div>
              {/each}
            </div>
          {/if}
          <div class="pt-4 space-y-2 mb-5 border-t border-[#ededf0]">
            <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Međuzbroj' : 'Subtotal'}</span><span class="text-[#2b2b2b]">{total.toFixed(2)} €</span></div>
            <div class="flex justify-between font-bold text-lg"><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}</span><span style="color:#b5890a">{total.toFixed(2)} €</span></div>
          </div>
          {#if submitError}
            <p class="text-sm text-[#b42318] mb-4">{submitError}</p>
          {/if}
          <button onclick={handleCheckout} disabled={loading || $cart.length === 0 || !name || !email} class="btn btn-primary w-full disabled:opacity-50">
            {loading ? ($locale === 'hr' ? 'Obrađujem…' : 'Processing…') : `${$locale === 'hr' ? 'Naruči' : 'Place order'} ${total.toFixed(2)} €`}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
