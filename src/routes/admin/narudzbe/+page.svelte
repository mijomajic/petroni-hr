<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let orders: any[] = $state([]);
  let loading = $state(true);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/orders/${id}/status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    if (response.ok) orders = orders.map(o => o.id === id ? { ...o, status } : o);
  }

  onMount(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    orders = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Narudžbe — Admin — Petroni</title></svelte:head>

<div>
  <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b] mb-8">Narudžbe</h1>

  <div class="rounded-2xl overflow-hidden" style="background: #ffffff; border: 1px solid #ededf0">
    {#if loading}
      <div class="p-8 space-y-3">{#each [1,2,3] as _}<div class="h-12 rounded-xl animate-pulse" style="background: #f6f7f9"></div>{/each}</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="border-bottom: 1px solid #e7e8eb">
            <tr>{#each ['Kupac', 'Datum', 'Ukupno', 'Status', 'Plaćanje', 'Akcija'] as h}<th class="text-left px-4 py-3 text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{h}</th>{/each}</tr>
          </thead>
          <tbody>
            {#each orders as o}
              <tr style="border-bottom: 1px solid #f0f1f3">
                <td class="px-4 py-3"><p class="font-medium text-[#2b2b2b]">{o.customer_name}</p><p class="text-xs" style="color: #7a7f86">{o.customer_email}</p></td>
                <td class="px-4 py-3 text-xs" style="color: #7a7f86">{new Date(o.created_at).toLocaleDateString('hr-HR')}</td>
                <td class="px-4 py-3 font-bold" style="color: #F5C518">€{o.total}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style="{o.status === 'completed' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.15); color: #F5C518'}">{o.status}</span></td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style="{o.payment_status === 'paid' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.15); color: #F5C518'}">{o.payment_status}</span></td>
                <td class="px-4 py-3">
                  <select class="px-3 py-1.5 rounded-xl text-xs text-[#2b2b2b]" style="background: #f6f7f9; border: 1px solid #e7e8eb" value={o.status} onchange={e => updateStatus(o.id, (e.target as HTMLSelectElement).value)}>
                    <option value="pending">Na čekanju</option>
                    <option value="processing">U obradi</option>
                    <option value="completed">Završena</option>
                    <option value="cancelled">Otkazana</option>
                  </select>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if orders.length === 0}<p class="p-8 text-center text-sm" style="color: #7a7f86">Nema narudžbi.</p>{/if}
      </div>
    {/if}
  </div>
</div>
