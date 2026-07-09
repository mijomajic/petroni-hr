<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Doplata rezervacije — Petroni</title>
  <meta name="referrer" content="no-referrer" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>
<div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
  <div class="text-center max-w-6xl w-full">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style="background:#fff7e0;border:2px solid #fbe7a1">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5" aria-hidden="true"><path d="M12 2v20M17 6.5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4">Doplata rezervacije</h1>
    <p class="text-[15px] leading-relaxed text-[#6b7178] mb-10">Rezervacija #{data.booking.confirmation_number} · dospijeće {data.booking.second_payment_due_date}</p>
    {#if data.booking.second_payment_status === 'paid'}
      <div class="card card-static p-6"><p class="font-bold text-green-700">Doplata je evidentirana kao plaćena.</p></div>
    {:else}
      <div class="text-left card card-static p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p class="field-label">Preostali iznos</p>
          <p class="text-3xl font-bold text-[#2b2b2b]">{Number(data.booking.second_payment_amount).toFixed(2)} EUR</p>
        </div>
        {#if data.corvuspayAvailable}
          <form method="POST" action="/api/corvuspay/start">
            <input type="hidden" name="booking_id" value={data.booking.id} />
            <input type="hidden" name="part" value="2" />
            <input type="hidden" name="token" value={data.token} />
            <button class="btn btn-primary active:scale-[0.98]">Plati karticom</button>
          </form>
        {:else}
          <p class="text-sm text-[#8b9099]">Kartično plaćanje uskoro dostupno.</p>
        {/if}
      </div>

      <h2 class="font-bold text-xl text-[#2b2b2b] mb-5">Bankovna uplata</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {#each data.bankTransfers as transfer}
          <div class="card card-static p-5 text-left min-w-0">
            <p class="font-bold">{transfer.bank}</p>
            <p class="text-sm mt-1 break-all">{transfer.iban}</p>
            <p class="text-sm">Iznos: {Number(data.booking.second_payment_amount).toFixed(2)} EUR · Poziv na broj: {data.booking.confirmation_number}</p>
            <img class="w-full h-32 object-contain mt-4 bg-white" src={transfer.barcode} alt="HUB-3 PDF417 za {transfer.bank}" />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
