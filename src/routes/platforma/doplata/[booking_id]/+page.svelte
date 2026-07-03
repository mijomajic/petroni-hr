<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head><title>Doplata rezervacije — Petroni</title></svelte:head>
<div class="max-w-3xl mx-auto px-4 py-16">
  <h1 class="text-3xl font-bold mb-2">Doplata rezervacije</h1>
  <p class="text-[#6b7178] mb-8">#{data.booking.confirmation_number} · dospijeće {data.booking.second_payment_due_date}</p>
  {#if data.booking.second_payment_status === 'paid'}
    <div class="card card-static p-6"><p class="font-bold text-green-700">Doplata je evidentirana kao plaćena.</p></div>
  {:else}
    <div class="card card-static p-6 mb-6">
      <p class="field-label">Preostali iznos</p>
      <p class="text-3xl font-bold">{Number(data.booking.second_payment_amount).toFixed(2)} EUR</p>
      {#if data.corvuspayAvailable}
        <form method="POST" action="/api/corvuspay/start" class="mt-5">
          <input type="hidden" name="booking_id" value={data.booking.id} />
          <input type="hidden" name="part" value="2" />
          <button class="btn btn-primary">Plati karticom</button>
        </form>
      {:else}
        <p class="text-sm text-[#8b9099] mt-4">Kartično plaćanje uskoro dostupno.</p>
      {/if}
    </div>
    <h2 class="font-bold text-xl mb-4">Bankovna uplata</h2>
    <div class="space-y-4">
      {#each data.bankTransfers as transfer}
        <div class="card card-static p-5"><p class="font-bold">{transfer.bank}</p><p>{transfer.iban}</p><img class="w-full mt-4" src={transfer.barcode} alt="HUB-3 PDF417" /></div>
      {/each}
    </div>
  {/if}
</div>
