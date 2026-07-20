<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { cart, clearCart, syncCartStock } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import { calculateShopOrderTotals, deliverySupportsCashOnDelivery, overseasZoneForPostalCode, type ShopDeliveryMethod, type ShopPaymentMethod } from '$lib/shop-checkout';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let address = $state('');
  let city = $state('');
  let zip = $state('');
  let country = $state('Hrvatska');
  let boxnowLockerId = $state('');
  let boxnowLockerAddress = $state('');
  let boxnowLockerPostalCode = $state('');
  let boxnowWidgetReady = $state(false);
  let boxnowWidgetError = $state(false);
  let boxnowMapOpen = $state(false);
  let loading = $state(false);
  let submitError = $state('');
  let fieldErrors = $state<Record<string, string>>({});
  let deliveryMethod = $state<ShopDeliveryMethod>('overseas');
  let paymentMethod = $state<ShopPaymentMethod>('bank_transfer');
  let checkingStock = $state(true);
  const hasUnavailableItems = $derived($cart.some((item) => item.stock !== undefined && item.stock <= 0));

  const subtotal = $derived($cart.reduce((acc, i) => acc + i.price * i.qty, 0));
  const hasPickupOnlyItems = $derived($cart.some((item) => item.pickup_only));
  const enabledDeliveryMethods = $derived(data.checkoutConfig.deliveryMethods.filter((method) => method.enabled && (!hasPickupOnlyItems || method.id === 'personal_pickup')));
  const selectedDeliveryAvailable = $derived(enabledDeliveryMethods.some((method) => method.id === deliveryMethod));
  const codAvailable = $derived(deliverySupportsCashOnDelivery(deliveryMethod, data.checkoutConfig));
  const totals = $derived.by(() => {
    if (!selectedDeliveryAvailable) return { subtotal, shippingCost: 0, paymentSurcharge: 0, total: subtotal };
    try {
      return calculateShopOrderTotals(subtotal, deliveryMethod, paymentMethod, data.checkoutConfig, zip);
    } catch {
      return { subtotal, shippingCost: 0, paymentSurcharge: 0, total: subtotal };
    }
  });
  const total = $derived(totals.total);
  const activeOverseasZone = $derived(overseasZoneForPostalCode(zip, data.checkoutConfig));
  const boxnowLockerLabel = $derived([boxnowLockerAddress, boxnowLockerPostalCode].filter(Boolean).join(', '));

  function deliveryPrice(method: ShopDeliveryMethod) {
    try {
      return calculateShopOrderTotals(subtotal, method, 'bank_transfer', data.checkoutConfig, zip).shippingCost;
    } catch {
      return 0;
    }
  }

  $effect(() => {
    const nextDelivery = enabledDeliveryMethods[0]?.id;
    if (!selectedDeliveryAvailable && nextDelivery) deliveryMethod = nextDelivery;
    if (!codAvailable && paymentMethod === 'cash_on_delivery') paymentMethod = 'bank_transfer';
  });

  $effect(() => {
    if (!boxnowMapOpen || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  onMount(async () => {
    try {
      const result = await syncCartStock();
      if (result.unavailable.length) {
        submitError = $locale === 'hr'
          ? 'Jedan ili više proizvoda više nije dostupno. Vratite se u košaricu.'
          : 'One or more products are no longer available. Return to your cart.';
      } else if (result.adjusted) {
        submitError = $locale === 'hr'
          ? 'Količine su usklađene s trenutačnom zalihom. Pregledajte narudžbu prije nastavka.'
          : 'Quantities were adjusted to current stock. Review your order before continuing.';
      }
    } catch {
      submitError = $locale === 'hr'
        ? 'Stanje zalihe trenutačno nije moguće provjeriti.'
        : 'Stock could not be checked.';
    } finally {
      checkingStock = false;
    }
  });

  onMount(() => {
    const partnerId = env.PUBLIC_BOXNOW_PARTNER_ID?.trim();
    window._bn_map_widget_config = {
      ...(partnerId ? { partnerId: Number.isNaN(Number(partnerId)) ? partnerId : Number(partnerId) } : {}),
      parentElement: '#boxnowmap',
      type: 'iframe',
      gps: false,
      autoclose: false,
      autoshow: true,
      afterSelect(selected) {
        boxnowLockerId = String(selected.boxnowLockerId ?? '').trim();
        boxnowLockerAddress = String(selected.boxnowLockerAddressLine1 ?? '').trim();
        boxnowLockerPostalCode = String(selected.boxnowLockerPostalCode ?? '').trim();
        boxnowMapOpen = false;
        if (boxnowLockerId && boxnowLockerAddress) {
          clearFieldError('boxnowLocker');
          boxnowWidgetError = false;
        }
      }
    };

    document.querySelector<HTMLScriptElement>('script[data-boxnow-widget="v5"]')?.remove();

    const script = document.createElement('script');
    script.src = 'https://widget-cdn.boxnow.hr/map-widget/client/v5.js';
    script.async = true;
    script.defer = true;
    script.dataset.boxnowWidget = 'v5';
    script.onload = () => {
      boxnowWidgetReady = true;
      boxnowWidgetError = false;
    };
    script.onerror = () => {
      boxnowWidgetReady = false;
      boxnowWidgetError = true;
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
      delete window._bn_map_widget_config;
    };
  });

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
    if (deliveryMethod !== 'personal_pickup') {
      if (!address.trim()) errors.address = required;
      if (!city.trim()) errors.city = required;
      if (!zip.trim()) errors.zip = required;
      if (!country.trim()) errors.country = required;
    }
    if (deliveryMethod === 'boxnow' && (!boxnowLockerId || !boxnowLockerAddress)) {
      errors.boxnowLocker = $locale === 'hr' ? 'Odaberite paketomat na BoxNow karti.' : 'Select a locker on the BoxNow map.';
    }
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
    if (!selectedDeliveryAvailable) {
      submitError = $locale === 'hr'
        ? 'Za ovu košaricu trenutačno nema dostupnog načina preuzimanja.'
        : 'No delivery or pickup method is currently available for this cart.';
      return;
    }
    if (!validateCustomer()) return;
    loading = true;
    submitError = '';
    try {
      const stockResult = await syncCartStock();
      if (stockResult.unavailable.length) {
        submitError = $locale === 'hr'
          ? 'Jedan ili više proizvoda više nije dostupno. Vratite se u košaricu.'
          : 'One or more products are no longer available. Return to your cart.';
        return;
      }
      if (stockResult.adjusted) {
        submitError = $locale === 'hr'
          ? 'Količine su promijenjene prema trenutačnoj zalihi. Pregledajte narudžbu i pokušajte ponovno.'
          : 'Quantities changed to match current stock. Review the order and try again.';
        return;
      }
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: $cart,
          customer: {
            name,
            email,
            phone,
            address,
            city,
            zip,
            country,
            boxnow_locker: boxnowLockerLabel,
            boxnow_locker_id: boxnowLockerId,
            boxnow_locker_address: boxnowLockerAddress,
            boxnow_locker_postal_code: boxnowLockerPostalCode
          },
          payment_method: paymentMethod,
          delivery_method: deliveryMethod
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
  <title>{$locale === 'hr' ? 'Narudžba' : 'Checkout'} — Petroni</title>
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
            <div class:hidden={deliveryMethod !== 'boxnow'} class="md:col-span-2 rounded-lg border border-[#eed68a] bg-[#fffaf0] p-4">
                  <span class="field-label">{$locale === 'hr' ? 'BoxNow paketomat' : 'BoxNow locker'} *</span>
                  {#if boxnowLockerId && boxnowLockerAddress}
                    <div class="mb-3 rounded-md border border-[#d7c267] bg-white p-3" aria-live="polite">
                      <p class="text-sm font-bold text-[#2b2b2b]">{boxnowLockerAddress}</p>
                      <p class="mt-1 text-xs text-[#6f5600]">{boxnowLockerPostalCode ? `${boxnowLockerPostalCode} · ` : ''}BoxNow ID: {boxnowLockerId}</p>
                    </div>
                  {/if}
                  <button id="boxnow-locker-button" type="button" disabled={!boxnowWidgetReady} onclick={() => boxnowMapOpen = true} class="btn btn-dark w-full disabled:cursor-wait disabled:opacity-60">
                    {boxnowLockerId
                      ? ($locale === 'hr' ? 'Promijeni paketomat' : 'Change locker')
                      : boxnowWidgetReady
                        ? ($locale === 'hr' ? 'Odaberi paketomat na karti' : 'Select locker on map')
                        : ($locale === 'hr' ? 'Učitavam BoxNow kartu…' : 'Loading BoxNow map…')}
                  </button>
                  {#if fieldErrors.boxnowLocker}<p class="checkout-field-error">{fieldErrors.boxnowLocker}</p>{/if}
                  {#if boxnowWidgetError}
                    <p class="mt-2 text-xs leading-relaxed text-[#9f1f18]">{$locale === 'hr' ? 'BoxNow karta se nije učitala. Osvježite stranicu ili odaberite drugi način dostave.' : 'The BoxNow map did not load. Refresh the page or select another delivery method.'}</p>
                  {:else}
                    <p class="mt-2 text-xs leading-relaxed text-[#6f5600]">{$locale === 'hr' ? 'Otvorite službenu BoxNow kartu i odaberite paketomat za dostavu.' : 'Open the official BoxNow map and select your delivery locker.'}</p>
                  {/if}
            </div>
            {#if deliveryMethod !== 'personal_pickup'}
              <div class="md:col-span-2"><label for="checkout_address" class="field-label">{$locale === 'hr' ? 'Adresa dostave' : 'Delivery address'} *</label><input id="checkout_address" autocomplete="street-address" class="field" aria-invalid={Boolean(fieldErrors.address)} oninput={() => clearFieldError('address')} bind:value={address} />{#if fieldErrors.address}<p class="checkout-field-error">{fieldErrors.address}</p>{/if}</div>
              <div><label for="checkout_city" class="field-label">{$locale === 'hr' ? 'Grad' : 'City'} *</label><input id="checkout_city" autocomplete="address-level2" class="field" aria-invalid={Boolean(fieldErrors.city)} oninput={() => clearFieldError('city')} bind:value={city} />{#if fieldErrors.city}<p class="checkout-field-error">{fieldErrors.city}</p>{/if}</div>
              <div><label for="checkout_zip" class="field-label">{$locale === 'hr' ? 'Poštanski broj' : 'ZIP'} *</label><input id="checkout_zip" autocomplete="postal-code" class="field" aria-invalid={Boolean(fieldErrors.zip)} oninput={() => clearFieldError('zip')} bind:value={zip} />{#if fieldErrors.zip}<p class="checkout-field-error">{fieldErrors.zip}</p>{/if}</div>
              <div class="md:col-span-2"><label for="checkout_country" class="field-label">{$locale === 'hr' ? 'Država' : 'Country'} *</label><input id="checkout_country" autocomplete="country-name" class="field" aria-invalid={Boolean(fieldErrors.country)} oninput={() => clearFieldError('country')} bind:value={country} />{#if fieldErrors.country}<p class="checkout-field-error">{fieldErrors.country}</p>{/if}</div>
            {:else}
              <p class="md:col-span-2 rounded-lg bg-[#fffaf0] p-4 text-sm text-[#6f5600]">{$locale === 'hr' ? 'Adresa dostave nije potrebna. Petroni će vam potvrditi termin i lokaciju osobnog preuzimanja.' : 'A delivery address is not required. Petroni will confirm the personal pickup time and location.'}</p>
            {/if}
          </div>
        </div>

        <div class="card card-static p-7">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Dostava' : 'Delivery'}</h2>
          {#if hasPickupOnlyItems}
            <p class="mb-4 rounded-lg border border-[#eed68a] bg-[#fffaf0] p-3 text-sm text-[#6f5600]">{$locale === 'hr' ? 'Košarica sadrži proizvod koji je dostupan samo za osobno preuzimanje.' : 'Your cart contains an item available for personal pickup only.'}</p>
          {/if}
          <div class="grid grid-cols-1 gap-3">
            {#each enabledDeliveryMethods as method}
              <button type="button" onclick={() => deliveryMethod = method.id} class="flex items-center justify-between rounded-md p-4 text-left" style="border:2px solid {deliveryMethod === method.id ? '#f5c518' : '#e2e4e8'}">
                <span>
                  <b class="text-sm text-[#2b2b2b]">{$locale === 'hr' ? method.label_hr : method.label_en}</b>
                  {#if method.id === 'overseas'}
                    <small class="mt-1 block text-[#7a7f86]">{$locale === 'hr' ? activeOverseasZone?.label_hr : activeOverseasZone?.label_en}{#if data.checkoutConfig.freeShippingThreshold > 0} · {$locale === 'hr' ? 'besplatno od' : 'free from'} {data.checkoutConfig.freeShippingThreshold.toFixed(2)} €{/if}</small>
                  {:else if method.id === 'boxnow'}
                    <small class="mt-1 block text-[#7a7f86]">{$locale === 'hr' ? 'Paketomat birate na službenoj BoxNow karti.' : 'Choose a locker on the official BoxNow map.'}</small>
                  {/if}
                </span>
                <span class="font-bold text-[#b5890a]">{deliveryPrice(method.id).toFixed(2)} €</span>
              </button>
            {/each}
          </div>
          {#if enabledDeliveryMethods.length === 0}
            <p class="mt-3 rounded-lg border border-[#f2b8b5] bg-[#fff6f5] p-3 text-sm text-[#9f1f18]">{$locale === 'hr' ? 'Za ovu košaricu trenutačno nema dostupnog načina preuzimanja. Kontaktirajte Petroni prije naručivanja.' : 'No delivery or pickup method is currently available for this cart. Contact Petroni before ordering.'}</p>
          {/if}
        </div>

        <div class="card card-static p-7">
          <h2 class="text-base font-bold uppercase tracking-wide text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Plaćanje' : 'Payment'}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button type="button" onclick={() => paymentMethod = 'bank_transfer'} class="p-4 rounded-md text-center" style="border:2px solid {paymentMethod === 'bank_transfer' ? '#f5c518' : '#e2e4e8'}">
              <p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Bankovna uplata' : 'Bank transfer'}</p>
              <p class="text-xs text-[#9aa0a8] mt-1">HUB-3 / PDF417</p>
            </button>
            <button type="button" onclick={() => data.corvuspayAvailable && (paymentMethod = 'corvuspay')} disabled={!data.corvuspayAvailable} class="p-4 rounded-md text-center disabled:opacity-50" style="border:2px solid {paymentMethod === 'corvuspay' ? '#f5c518' : '#e2e4e8'}">
              <p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Kartica' : 'Card'}</p>
              <p class="text-xs text-[#9aa0a8] mt-1">{data.corvuspayAvailable ? 'CorvusPay' : ($locale === 'hr' ? 'Uskoro dostupno' : 'Coming soon')}</p>
            </button>
            <button type="button" onclick={() => codAvailable && (paymentMethod = 'cash_on_delivery')} disabled={!codAvailable} class="p-4 rounded-md text-center disabled:opacity-50" style="border:2px solid {paymentMethod === 'cash_on_delivery' ? '#f5c518' : '#e2e4e8'}">
              <p class="font-semibold text-[#2b2b2b] text-sm">{$locale === 'hr' ? 'Pouzeće' : 'Cash on delivery'}</p>
              <p class="text-xs text-[#9aa0a8] mt-1">{codAvailable ? `+${data.checkoutConfig.cashOnDeliverySurcharge.toFixed(2)} €` : ($locale === 'hr' ? 'Nije dostupno za ovu dostavu' : 'Unavailable for this delivery')}</p>
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
            <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Međuzbroj' : 'Subtotal'}</span><span class="text-[#2b2b2b]">{subtotal.toFixed(2)} €</span></div>
            <div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Dostava' : 'Delivery'}</span><span class="text-[#2b2b2b]">{totals.shippingCost.toFixed(2)} €</span></div>
            {#if totals.paymentSurcharge > 0}<div class="flex justify-between text-sm"><span class="text-[#7a7f86]">{$locale === 'hr' ? 'Naknada za pouzeće' : 'Cash-on-delivery fee'}</span><span class="text-[#2b2b2b]">{totals.paymentSurcharge.toFixed(2)} €</span></div>{/if}
            <div class="flex justify-between font-bold text-lg"><span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}</span><span style="color:#b5890a">{total.toFixed(2)} €</span></div>
          </div>
          {#if submitError}
            <p id="checkout-error" role="alert" class="mb-4 rounded-lg border border-[#f2b8b5] bg-[#fff6f5] p-3 text-sm text-[#9f1f18]">{submitError}</p>
          {/if}
          <button onclick={handleCheckout} disabled={loading || checkingStock || hasUnavailableItems || !selectedDeliveryAvailable || $cart.length === 0} class="btn btn-primary w-full disabled:opacity-50">
            {checkingStock ? ($locale === 'hr' ? 'Provjeravam zalihu…' : 'Checking stock…') : loading ? ($locale === 'hr' ? 'Obrađujem…' : 'Processing…') : `${$locale === 'hr' ? 'Naruči' : 'Place order'} ${total.toFixed(2)} €`}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<div
  class="fixed inset-0 z-[70] flex items-center justify-center bg-[#17181a]/65 p-3 transition-opacity duration-200 md:p-8"
  class:visible={boxnowMapOpen}
  class:pointer-events-auto={boxnowMapOpen}
  class:opacity-100={boxnowMapOpen}
  class:invisible={!boxnowMapOpen}
  class:pointer-events-none={!boxnowMapOpen}
  class:opacity-0={!boxnowMapOpen}
  aria-hidden={!boxnowMapOpen}
>
  <div class="relative h-[min(82dvh,900px)] w-[min(94vw,1800px)] overflow-hidden rounded-[10px] bg-white shadow-[0_24px_70px_rgba(20,22,26,0.28)]">
    <div id="boxnowmap" class="absolute inset-0"></div>
    <button
      type="button"
      onclick={() => boxnowMapOpen = false}
      class="absolute right-3 top-3 z-[1] rounded-md border border-[#d9dce1] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#2b2b2b] shadow-sm transition hover:bg-[#f5f5f5] active:translate-y-px"
    >
      {$locale === 'hr' ? 'Zatvori' : 'Close'}
    </button>
  </div>
</div>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (boxnowMapOpen = false)} />

<style>
  :global(#checkout-customer .field[aria-invalid='true']) {
    border-color: #d92d20;
    background: #fffafa;
    box-shadow: 0 0 0 1px rgba(217, 45, 32, 0.1);
  }
  .checkout-field-error { margin-top: .35rem; color: #b42318; font-size: .74rem; line-height: 1.4; }
  :global(#boxnowmap iframe[id^='boxnow_map_widget']) {
    position: absolute !important;
    inset: 0 !important;
    z-index: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border: 0 !important;
    border-radius: 10px !important;
  }
</style>
