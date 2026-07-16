<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { clearCart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';

  let result: any = $state(null);
  const paymentResult = $derived(page.url.searchParams.get('payment'));
  const cancelled = $derived(paymentResult === 'cancel');

  onMount(() => {
    const raw = sessionStorage.getItem('petroni_order_result');
    if (raw) result = JSON.parse(raw);
    if (paymentResult === 'success') clearCart();
  });
</script>

<svelte:head>
  <title>{cancelled ? 'Plaćanje otkazano' : 'Narudžba zaprimljena'} — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-[70vh] py-16 md:py-20">
  <div class="container-x max-w-6xl">
    <header class="mx-auto mb-10 max-w-2xl text-center">
      <div class="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border-2" class:border-[#f2b8b5]={cancelled} class:bg-[#fff6f5]={cancelled} class:border-[#b6e6c8]={!cancelled} class:bg-[#e9f9ef]={!cancelled}>
        {#if cancelled}
          <svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="#b42318" stroke-width="2.3"><path d="M7 7l10 10M17 7L7 17"/></svg>
        {:else}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {/if}
      </div>
      <h1 class="text-wrap-balance text-3xl font-bold text-[#2b2b2b] md:text-5xl">{cancelled ? ($locale === 'hr' ? 'Plaćanje je otkazano' : 'Payment cancelled') : ($locale === 'hr' ? 'Narudžba je zaprimljena' : 'Order received')}</h1>
      <p class="mt-5 text-[15px] leading-7 text-[#6b7178]">
        {cancelled
          ? ($locale === 'hr' ? 'Kartica nije terećena. Proizvodi su ostali u košarici pa možete pokušati ponovno ili odabrati bankovnu uplatu.' : 'Your card was not charged. The products remain in your cart so you can try again or choose bank transfer.')
          : ($locale === 'hr' ? 'Detalje smo poslali na vašu email adresu. Narudžbu ćemo pregledati i javiti vam se sa sljedećim korakom.' : 'We sent the details to your email. We will review the order and contact you with the next step.')}
      </p>
    </header>

    {#if !cancelled && result?.order}
      <section class="card card-static mx-auto mb-8 max-w-3xl p-6 text-left md:p-8">
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-[#9a7600]">{$locale === 'hr' ? 'Broj narudžbe' : 'Order number'}</p>
        <p class="mt-2 text-xl font-black text-[#2b2b2b]">#{result.order.confirmation_number}</p>
        <p class="mt-2 text-sm text-[#60656b]">{$locale === 'hr' ? 'Ukupno' : 'Total'}: <b>{Number(result.order.total).toFixed(2)} EUR</b></p>
      </section>

      {#if result.bankTransfers?.length}
        <section class="mb-10" aria-labelledby="bank-transfer-title">
          <div class="mb-5 text-center">
            <h2 id="bank-transfer-title" class="text-xl font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Podaci za bankovnu uplatu' : 'Bank transfer details'}</h2>
            <p class="mt-2 text-sm text-[#7a7f86]">{$locale === 'hr' ? 'Odaberite jedan račun. Iznos i poziv na broj jednaki su na sve tri uplatnice.' : 'Choose one account. The amount and payment reference are the same on all three slips.'}</p>
          </div>
          <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {#each result.bankTransfers as transfer}
              <article class="card card-static flex min-w-0 flex-col p-6 text-left">
                <p class="min-h-[3rem] text-base font-bold leading-snug text-[#2b2b2b]">{transfer.bank}</p>
                <dl class="mt-4 space-y-3 text-sm text-[#60656b]">
                  <div><dt class="text-xs uppercase tracking-wide text-[#92979d]">IBAN</dt><dd class="mt-1 break-all font-semibold tabular-nums">{transfer.iban}</dd></div>
                  <div class="grid grid-cols-2 gap-3"><div><dt class="text-xs uppercase tracking-wide text-[#92979d]">{$locale === 'hr' ? 'Iznos' : 'Amount'}</dt><dd class="mt-1 font-semibold">{Number(transfer.amount).toFixed(2)} EUR</dd></div><div><dt class="text-xs uppercase tracking-wide text-[#92979d]">{$locale === 'hr' ? 'Poziv' : 'Reference'}</dt><dd class="mt-1 break-all font-semibold">{transfer.reference}</dd></div></div>
                </dl>
                <div class="mt-5 rounded-lg bg-white p-2"><img src={transfer.barcode} alt="HUB-3 PDF417 za {transfer.bank}" class="w-full" /></div>
              </article>
            {/each}
          </div>
        </section>
      {/if}
    {/if}

    <div class="text-center"><a href={cancelled ? '/checkout' : '/shop'} class="btn btn-primary px-8 py-3.5">{cancelled ? ($locale === 'hr' ? 'Pokušaj ponovno' : 'Try again') : ($locale === 'hr' ? 'Nastavi kupovinu' : 'Continue shopping')}</a></div>
  </div>
</main>
