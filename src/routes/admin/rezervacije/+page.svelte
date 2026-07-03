<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let bookings: any[] = $state([]);
  let loading = $state(true);
  let filterStatus = $state('');

  const filtered = $derived(filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/bookings/${id}/status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) bookings = bookings.map(b => b.id === id ? { ...b, status } : b);
  }

  onMount(async () => {
    const { data } = await supabase.from('bookings').select('*, vehicles(name)').order('created_at', { ascending: false });
    bookings = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Rezervacije — Admin — Petroni</title></svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Rezervacije</h1>
    <select class="px-4 py-2 rounded-xl text-sm text-[#2b2b2b] focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={filterStatus}>
      <option value="">Sve</option>
      <option value="pending">Na čekanju</option>
      <option value="confirmed">Potvrđene</option>
      <option value="cancelled">Otkazane</option>
      <option value="completed">Završene</option>
    </select>
  </div>

  <div class="rounded-2xl overflow-hidden" style="background: #ffffff; border: 1px solid #ededf0">
    {#if loading}
      <div class="p-8 space-y-3">
        {#each [1,2,3,4,5] as _}<div class="h-12 rounded-xl animate-pulse" style="background: #f6f7f9"></div>{/each}
      </div>
    {:else}
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
            {#each filtered as b}
              <tr style="border-bottom: 1px solid #f0f1f3">
                <td class="px-4 py-3">
                  <p class="text-[#2b2b2b] font-medium">{b.driver_name}</p>
                  <p class="text-xs" style="color: #7a7f86">{b.driver_email}</p>
                </td>
                <td class="px-4 py-3 text-[#2b2b2b]">{b.vehicles?.name ?? '—'}</td>
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
                  <select
                    class="px-3 py-1.5 rounded-xl text-xs text-[#2b2b2b] focus:outline-none"
                    style="background: #f6f7f9; border: 1px solid #e7e8eb"
                    value={b.status}
                    onchange={e => updateStatus(b.id, (e.target as HTMLSelectElement).value)}
                  >
                    <option value="pending">Na čekanju</option>
                    <option value="confirmed">Potvrdi</option>
                    <option value="cancelled">Otkaži</option>
                    <option value="completed">Završi</option>
                  </select>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if filtered.length === 0}
          <p class="p-8 text-sm text-center" style="color: #7a7f86">Nema rezervacija.</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
