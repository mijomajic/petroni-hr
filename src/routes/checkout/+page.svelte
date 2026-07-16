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
  let fieldErrors = $state<Record<string, string>>({});
  let paymentMethod = $state<'bank_transfer' | 'corvuspay'>('bank_transfer');

  const total = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));

  function clearFieldError(key: string) {
    if (!fieldErrors[key]) return;
    fieldErrors = Object.fromEntries(Object.entries(fieldErrors).filter(([field]) => field !== key));
  }

  function validateCustomer() {
    const required = $locale === 'hr' ? 'Ovo polje je obavezno.' : 'This field is required.';
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = required;
    if (!email.trim()) errors.email = required;
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = $locale === 'hr' ? 'Unesite valjanu email adresu.' : 'Enter a valid email address.';
    if (!phone.trim()) errors.phone = required;
    if (!address.trim()) errors.address = required;
    if (!city.trim()) errors.city = required;
    if (!zip.trim()) errors.zip = required;
    if (!country.trim()) errors.country = required;
    fieldErrors = errors;
    if (Object.keys(errors).length) {
      submitError = $locale === 'hr' ? 'Provjerite označena polja prije naručivanja.' : 'Check the highlighted fields before placing the order.';
      requestAnimationFrame(() => {
        document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.querySelector<HTMLElement>('#checkout-customer [aria-invalid="true"]')?.focus({ preventScroll: true });
      });
      return false;
    }
    return true;
  }

  async function handleCheckout() {
    if (!validateCustomer()) return;
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
          clearCart();
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

</script>

<svelte:head>
  <title>Narudžba — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="section overflow-clip">
  <div class="container-x max-w-6xl mx-auto">
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Narudžba' : 'Checkout'}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div class="space-y-6">
        <div id="checkout-customer" class="card card-static p-7">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Podaci kupca' : 'Customer details'}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2"><label for="checkout_name" class="field-label">{$locale === 'hr' ? 'Ime i prezime' : 'Full name'} *</label><input id="checkout_name" autocomplete="name" class="field" aria-invalid={Boolean(fieldErrors.name)} oninput={() => clearFieldError('name')} bind:value={name} />{#if fieldErrors.name}<p class="checkout-field-error">{fieldErrors.name}</p>{/if}</div>
            <div><label for="checkout_email" class="field-label">Email *</label><input id="checkout_email" type="email" autocomplete="email" class="field" aria-invalid={Boolean(fieldErrors.email)} oninput={() => clearFieldError('email')} bind:value={email} />{#if fieldErrors.email}<p class="checkout-field-error">{fieldErrors.email}</p>{/if}</div>
            <div><label for="checkout_phone" class="field-label">{$locale === 'hr' ? 'Telefon' : 'Phone'} *</label><input id="checkout_phone" type="tel" autocomplete="tel" class="field" aria-invalid={Boolean(fieldErrors.phone)} oninput={() => clearFieldError('phone')} bind:value={phone} />{#if fieldErrors.phone}<p class="checkout-field-error">{fieldErrors.phone}</p>{/if}</div>
            <div class="md:col-span-2"><label for="checkout_address" class="field-label">{$locale === 'hr' ? 'Adresa' : 'Address'} *</label><input id="checkout_address" autocomplete="street-address" class="field" aria-invalid={Boolean(fieldErrors.address)} oninput={() => clearFieldError('address')} bind:value={address} />{#if fieldErrors.address}<p class="checkout-field-error">{fieldErrors.address}</p>{/if}</div>
            <div><label for="checkout_city" class="field-label">{$locale === 'hr' ? 'Grad' : 'City'} *</label><input id="checkout_city" autocomplete="address-level2" class="field" aria-invalid={Boolean(fieldErrors.city)} oninput={() => clearFieldError('city')} bind:value={city} />{#if fieldErrors.city}<p class="checkout-field-error">{fieldErrors.city}</p>{/if}</div>
            <div><label for="checkout_zip" class="field-label">{$locale === 'hr' ? 'Poštanski broj' : 'ZIP'} *</label><input id="checkout_zip" autocomplete="postal-code" class="field" aria-invalid={Boolean(fieldErrors.zip)} oninput={() => clearFieldError('zip')} bind:value={zip} />{#if fieldErrors.zip}<p class="checkout-field-error">{fieldErrors.zip}</p>{/if}</div>
            <div class="md:col-span-2"><label for="checkout_country" class="field-label">{$locale === 'hr' ? 'Država' : 'Country'} *</label><input id="checkout_country" autocomplete="country-name" class="field" aria-invalid={Boolean(fieldErrors.country)} oninput={() => clearFieldError('country')} bind:value={country} />{#if fieldErrors.country}<p class="checkout-field-error">{fieldErrors.country}</p>{/if}</div>
          </div>
        </div>

        <div class="card card-static p-7">
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
        <div class="card card-static p-6 lg:sticky lg:top-24">
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
            <p id="checkout-error" role="alert" class="mb-4 rounded-lg border border-[#f2b8b5] bg-[#fff6f5] p-3 text-sm text-[#9f1f18]">{submitError}</p>
          {/if}
          <button onclick={handleCheckout} disabled={loading || $cart.length === 0} class="btn btn-primary w-full disabled:opacity-50">
            {loading ? ($locale === 'hr' ? 'Obrađujem…' : 'Processing…') : `${$locale === 'hr' ? 'Naruči' : 'Place order'} ${total.toFixed(2)} €`}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(#checkout-customer .field[aria-invalid='true']) {
    border-color: #d92d20;
    background: #fffafa;
    box-shadow: 0 0 0 1px rgba(217, 45, 32, 0.1);
  }
  .checkout-field-error { margin-top: .35rem; color: #b42318; font-size: .74rem; line-height: 1.4; }
</style>
