<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Doplata rezervacije — Petroni</title>
  <meta name="referrer" content="no-referrer" />
</svelte:head>
<div class="min-h-[70dvh] bg-[#f7f8f9]">
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
    <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end mb-10">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7600] mb-3">Petroni · sigurno plaćanje</p>
        <h1 class="text-3xl md:text-4xl font-black tracking-tight text-[#25282c]">Doplata rezervacije</h1>
        <p class="text-[#6b7178] mt-3">Rezervacija <b>#{data.booking.confirmation_number}</b> · dospijeće {data.booking.second_payment_due_date}</p>
      </div>
      <div class="lg:text-right">
        <p class="text-xs font-bold uppercase tracking-wider text-[#7a7f86]">Preostali iznos</p>
        <p class="text-4xl font-black tracking-tight text-[#25282c] mt-1">{Number(data.booking.second_payment_amount).toFixed(2)} <span class="text-xl">EUR</span></p>
      </div>
    </div>

    {#if data.booking.second_payment_status === 'paid'}
      <div class="p-6 rounded-2xl border border-[#b7dfc3] bg-[#effaf2]"><p class="font-bold text-[#18743a]">Doplata je evidentirana kao plaćena.</p></div>
    {:else}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-y border-[#dfe2e6] mb-10">
        <div><p class="font-bold text-[#25282c]">Plaćanje karticom</p><p class="text-sm text-[#7a7f86]">Sigurna naplata putem CorvusPaya.</p></div>
        {#if data.corvuspayAvailable}
          <form method="POST" action="/api/corvuspay/start">
            <input type="hidden" name="booking_id" value={data.booking.id} />
            <input type="hidden" name="part" value="2" />
            <input type="hidden" name="token" value={data.token} />
            <button class="btn btn-primary active:scale-[0.98]">Plati karticom</button>
          </form>
        {:else}
          <span class="inline-flex px-4 py-2 rounded-lg bg-[#eceef1] text-sm font-bold text-[#8b9099]">Uskoro dostupno</span>
        {/if}
      </div>

      <div class="mb-5">
        <h2 class="font-black text-xl text-[#25282c]">Bankovna uplata</h2>
        <p class="text-sm text-[#7a7f86] mt-1">Odaberite jednu banku i skenirajte pripadajući HUB-3 barkod.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each data.bankTransfers as transfer}
          <article class="bg-white border border-[#e1e3e6] rounded-2xl p-5 min-w-0">
            <div class="min-h-14">
              <p class="font-bold text-[#25282c] leading-tight">{transfer.bank}</p>
              <p class="text-sm font-mono text-[#6b7178] mt-2 break-all">{transfer.iban}</p>
            </div>
            <div class="mt-5 pt-4 border-t border-[#eceef1] bg-white overflow-hidden">
              <img class="w-full h-32 object-contain" src={transfer.barcode} alt="HUB-3 PDF417 za {transfer.bank}" />
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</div>
