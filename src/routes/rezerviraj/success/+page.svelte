<script lang="ts">
  import { onMount } from 'svelte';
  import { locale } from '$lib/stores/locale';
  let result: any = $state(null);
  onMount(() => {
    const raw = sessionStorage.getItem('petroni_booking_result');
    if (raw) result = JSON.parse(raw);
  });
  const today = new Date().toISOString().slice(0, 10);
</script>

<svelte:head><title>Rezervacija potvrđena — Petroni</title></svelte:head>

<div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
  <div class="text-center max-w-6xl w-full">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style="background:#fff7e0;border:2px solid #fbe7a1">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Zahtjev je zaprimljen!' : 'Request received!'}</h1>
    <p class="text-[15px] leading-relaxed text-[#6b7178] mb-10">
      {$locale === 'hr' ? 'Rezervacija čeka pregled i potvrdu. Ako je slanje e-pošte konfigurirano, detalji stižu na Vašu adresu.' : 'Your booking awaits review and confirmation. If email delivery is configured, details will arrive by email.'}
    </p>
    {#if result?.booking}
      <div class="text-left card card-static p-5 mb-8">
        <p class="font-bold mb-2">#{result.booking.confirmation_number}</p>
        {#if result.booking.payment_split}
          <p class="text-sm text-[#60656b] mt-2">
            {$locale === 'hr'
              ? `Drugi dio: ${result.booking.second_payment_amount} EUR, ${result.booking.second_payment_due_date <= today ? `dospijeva odmah jer je preuzimanje unutar ${result.booking.second_payment_due_days} dana` : `dospijeće ${result.booking.second_payment_due_date}`}.`
              : `Second payment: EUR ${result.booking.second_payment_amount}, ${result.booking.second_payment_due_date <= today ? `due immediately because pickup is within ${result.booking.second_payment_due_days} days` : `due ${result.booking.second_payment_due_date}`}.`}
          </p>
        {/if}
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
    <a href="/" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Povratak na početnu' : 'Back to home'}</a>
  </div>
</div>
