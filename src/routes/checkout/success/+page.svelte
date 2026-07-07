<script lang="ts">
  import { onMount } from 'svelte';
  import { locale } from '$lib/stores/locale';
  let result: any = $state(null);
  onMount(() => {
    const raw = sessionStorage.getItem('petroni_order_result');
    if (raw) result = JSON.parse(raw);
  });
</script>

<svelte:head><title>Narudžba potvrđena — Petroni</title></svelte:head>

<div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
  <div class="text-center max-w-lg">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style="background:#e9f9ef;border:2px solid #b6e6c8">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Narudžba potvrđena!' : 'Order confirmed!'}</h1>
    <p class="text-[15px] leading-relaxed text-[#6b7178] mb-10">
      {$locale === 'hr' ? 'Hvala na narudžbi! Detalji su poslani na Vašu e-mail adresu. Vaša narudžba bit će obrađena u najkraćem roku.' : 'Thank you for your order! Details were sent to your email and will be processed shortly.'}
    </p>
    {#if result?.order}
      <div class="text-left card card-static p-5 mb-8">
        <p class="font-bold mb-2">#{result.order.confirmation_number}</p>
        <p class="text-sm text-[#60656b]">
          {$locale === 'hr' ? 'Ukupno' : 'Total'}: {Number(result.order.total).toFixed(2)} EUR
        </p>
      </div>
      {#if result.bankTransfers?.length}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {#each result.bankTransfers as transfer}
            <div class="card card-static p-5 text-left">
              <p class="font-bold">{transfer.bank}</p><p class="text-sm mt-1">{transfer.iban}</p>
              <p class="text-sm">{$locale === 'hr' ? 'Iznos' : 'Amount'}: {transfer.amount} EUR · {$locale === 'hr' ? 'Poziv na broj' : 'Reference'}: {transfer.reference}</p>
              <img src={transfer.barcode} alt="HUB-3 PDF417" class="w-full mt-4 bg-white" />
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    <a href="/shop" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Nastavi kupovinu' : 'Continue shopping'}</a>
  </div>
</div>
