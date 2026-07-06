<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head><title>Rezervacije — Admin — Petroni</title></svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Rezervacije</h1>
    <form method="GET" class="flex items-end gap-2">
      <label class="text-xs text-[#7a7f86]">Od
        <input type="date" name="date_from" value={data.filters.dateFrom} class="block px-3 py-2 rounded-xl text-sm text-[#2b2b2b]" style="background:#f6f7f9;border:1px solid #e7e8eb" />
      </label>
      <label class="text-xs text-[#7a7f86]">Do
        <input type="date" name="date_to" value={data.filters.dateTo} class="block px-3 py-2 rounded-xl text-sm text-[#2b2b2b]" style="background:#f6f7f9;border:1px solid #e7e8eb" />
      </label>
      <select name="status" class="px-4 py-2 rounded-xl text-sm text-[#2b2b2b]" style="background:#f6f7f9;border:1px solid #e7e8eb" value={data.filters.status}>
        <option value="">Svi statusi</option>
        <option value="pending">Na čekanju</option>
        <option value="confirmed">Potvrđene</option>
        <option value="cancelled">Otkazane</option>
        <option value="completed">Završene</option>
      </select>
      <button class="px-4 py-2 rounded-xl text-sm font-bold bg-[#F5C518] text-black">Filtriraj</button>
    </form>
  </div>

  <div class="rounded-2xl overflow-hidden" style="background: #ffffff; border: 1px solid #ededf0">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="border-bottom: 1px solid #e7e8eb">
            <tr>
              {#each ['Vozač', 'Vozilo', 'Preuzimanje', 'Povrat', 'Ukupno', 'Status', 'Akcija'] as h}
                <th class="text-left px-4 py-3 text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each data.bookings as b}
              <tr style="border-bottom: 1px solid #f0f1f3">
                <td class="px-4 py-3">
                  <p class="text-[#2b2b2b] font-medium">{b.driver_name}</p>
                  <p class="text-xs" style="color: #7a7f86">{b.driver_email}</p>
                </td>
                <td class="px-4 py-3 text-[#2b2b2b]">{b.vehicles?.[0]?.name ?? '—'}</td>
                <td class="px-4 py-3" style="color: #7a7f86">{b.pickup_date}</td>
                <td class="px-4 py-3" style="color: #7a7f86">{b.dropoff_date}</td>
                <td class="px-4 py-3 font-bold" style="color: #F5C518">€{b.total_price}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style="{b.status === 'confirmed' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : b.status === 'pending' ? 'background: rgba(245,197,24,0.15); color: #F5C518' : b.status === 'cancelled' ? 'background: rgba(239,68,68,0.1); color: #ef4444' : 'background: rgba(100,100,100,0.15); color: #7a7f86'}">
                    {b.status}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <a href="/admin/rezervacije/{b.id}" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f6f7f9] border border-[#e7e8eb]">Otvori</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if data.bookings.length === 0}
          <p class="p-8 text-sm text-center" style="color: #7a7f86">Nema rezervacija.</p>
        {/if}
      </div>
  </div>
</div>
