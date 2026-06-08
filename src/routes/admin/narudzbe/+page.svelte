<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let orders: any[] = $state([]);
  let loading = $state(true);

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
  }

  onMount(async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    orders = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Narudžbe — Admin — Petroni</title></svelte:head>

<div>
  <h1 class="text-3xl font-black uppercase tracking-tight text-white mb-8">Narudžbe</h1>

  <div class="rounded-2xl overflow-hidden" style="background: #111; border: 1px solid #1a1a1a">
    {#if loading}
      <div class="p-8 space-y-3">{#each [1,2,3] as _}<div class="h-12 rounded-xl animate-pulse" style="background: #1a1a1a"></div>{/each}</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="border-bottom: 1px solid #2a2a2a">
            <tr>{#each ['Kupac', 'Datum', 'Ukupno', 'Status', 'Plaćanje', 'Akcija'] as h}<th class="text-left px-4 py-3 text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{h}</th>{/each}</tr>
          </thead>
          <tbody>
            {#each orders as o}
              <tr style="border-bottom: 1px solid #1a1a1a">
                <td class="px-4 py-3"><p class="font-medium text-white">{o.customer_name}</p><p class="text-xs" style="color: #9ca3af">{o.customer_email}</p></td>
                <td class="px-4 py-3 text-xs" style="color: #9ca3af">{new Date(o.created_at).toLocaleDateString('hr-HR')}</td>
                <td class="px-4 py-3 font-bold" style="color: #F5C518">€{o.total}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style="{o.status === 'completed' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.15); color: #F5C518'}">{o.status}</span></td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style="{o.payment_status === 'paid' ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(245,197,24,0.15); color: #F5C518'}">{o.payment_status}</span></td>
                <td class="px-4 py-3">
                  <select class="px-3 py-1.5 rounded-xl text-xs text-white" style="background: #1a1a1a; border: 1px solid #2a2a2a" value={o.status} onchange={e => updateStatus(o.id, (e.target as HTMLSelectElement).value)}>
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
        {#if orders.length === 0}<p class="p-8 text-center text-sm" style="color: #9ca3af">Nema narudžbi.</p>{/if}
      </div>
    {/if}
  </div>
</div>
