<script lang="ts">
  import { onMount } from 'svelte';
  import { locale } from '$lib/stores/locale';
  import { BUSINESS, CLIENT_STORAGE_KEYS } from '$lib/config/business';
  let result: any = $state(null);
  onMount(() => {
    const raw = sessionStorage.getItem(CLIENT_STORAGE_KEYS.bookingResult);
    if (raw) result = JSON.parse(raw);
  });
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Zahtjev zaprimljen' : 'Request received'} — {BUSINESS.shortName}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
  <div class="text-center max-w-6xl w-full">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style="background:#f5e8df;border:2px solid #fbe7a1">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c87442" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Zahtjev je zaprimljen!' : 'Request received!'}</h1>
    <p class="mx-auto mb-10 max-w-2xl text-[15px] leading-relaxed text-[#6b7178]">
      {$locale === 'hr'
        ? 'Provjerit ćemo dostupnost i poslati vam konačnu potvrdu e-poštom. Naplata nije izvršena; plaćanje dogovaramo izravno nakon potvrde.'
        : 'We will check availability and email your final confirmation. No payment has been taken; payment is arranged directly after confirmation.'}
    </p>
    {#if result?.booking}
      <div class="mx-auto mb-8 max-w-2xl text-left card card-static p-5">
        <p class="field-label">{$locale === 'hr' ? 'Referenca zahtjeva' : 'Request reference'}</p>
        <p class="font-bold text-lg mb-4">#{result.booking.confirmation_number}</p>
        {#if result.booking.vehicle_name}
          <p class="text-sm text-[#60656b]">{result.booking.vehicle_name}</p>
        {/if}
        {#if result.booking.pickup_date && result.booking.dropoff_date}
          <p class="text-sm text-[#60656b]">{result.booking.pickup_date} → {result.booking.dropoff_date}</p>
        {/if}
        {#if Number.isFinite(Number(result.booking.estimated_total))}
          <p class="mt-3 text-sm font-semibold text-[#2b2b2b]">
            {$locale === 'hr' ? 'Procijenjeni ukupni iznos' : 'Estimated total'}: {Number(result.booking.estimated_total).toFixed(2)} {BUSINESS.currency}
          </p>
        {/if}
        {#if BUSINESS.rentalOnlinePaymentsEnabled && result.booking.payment_split}
          <p class="text-sm text-[#60656b] mt-2">
            {$locale === 'hr'
              ? `Drugi dio: ${result.booking.second_payment_amount} EUR, dospijeće ${result.booking.second_payment_due_date} (${result.booking.second_payment_due_days} dana prije preuzimanja).`
              : `Second payment: EUR ${result.booking.second_payment_amount}, due ${result.booking.second_payment_due_date} (${result.booking.second_payment_due_days} days before pickup).`}
          </p>
        {/if}
      </div>
      {#if BUSINESS.rentalOnlinePaymentsEnabled && result.bankTransfers?.length}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {#each result.bankTransfers as transfer}
            <div class="card card-static p-5 text-left">
              <p class="font-bold">{transfer.bank}</p><p class="text-sm mt-1">{transfer.iban}</p>
              <p class="text-sm">{$locale === 'hr' ? 'Iznos' : 'Amount'}: {transfer.amount} EUR · {$locale === 'hr' ? 'Poziv na broj' : 'Reference'}: {transfer.reference}</p>
              <img src={transfer.barcode} alt="Bank transfer payment code" class="w-full mt-4 bg-white" />
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    <a href="/" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Povratak na početnu' : 'Back to home'}</a>
  </div>
</div>
