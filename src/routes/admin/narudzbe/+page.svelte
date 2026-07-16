<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head><title>Narudžbe — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Narudžbe</h1>
    <p class="mt-2 text-sm text-[#7a7f86]">Otvorite narudžbu za stavke, adresu, status plaćanja, dostavu i slanje potvrde kupcu.</p>
  </div>

  <div class="overflow-hidden rounded-2xl border border-[#ededf0] bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-[#e7e8eb]">
          <tr>
            {#each ['Broj', 'Kupac', 'Datum', 'Ukupno', 'Status', 'Plaćanje', 'Potvrda', 'Detalji'] as h}
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data.orders as order}
            <tr class="border-b border-[#f0f1f3]">
              <td class="px-4 py-3 font-mono text-xs font-bold text-[#2b2b2b]">{order.confirmation_number ?? order.id.slice(0, 8)}</td>
              <td class="px-4 py-3">
                <p class="font-medium text-[#2b2b2b]">{order.customer_name}</p>
                <p class="text-xs text-[#7a7f86]">{order.customer_email}</p>
              </td>
              <td class="px-4 py-3 text-xs text-[#7a7f86]">{new Date(order.created_at).toLocaleDateString('hr-HR')}</td>
              <td class="px-4 py-3 font-bold text-[#b5890a]">{Number(order.total).toFixed(2)} EUR</td>
              <td class="px-4 py-3"><span class="rounded-full bg-[#fff7e0] px-2 py-1 text-[10px] font-bold uppercase text-[#9a7600]">{order.status}</span></td>
              <td class="px-4 py-3"><span class="rounded-full {order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-[#fff7e0] text-[#9a7600]'} px-2 py-1 text-[10px] font-bold uppercase">{order.payment_status}</span></td>
              <td class="px-4 py-3 text-xs text-[#7a7f86]">{order.invoice_sent ? 'Poslan' : 'Nije poslan'}</td>
              <td class="px-4 py-3"><a href="/admin/narudzbe/{order.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Otvori</a></td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if data.orders.length === 0}
        <p class="p-8 text-center text-sm text-[#7a7f86]">Nema narudžbi.</p>
      {/if}
    </div>
  </div>
</div>
