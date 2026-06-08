<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';

  let vehicles: Vehicle[] = $state([]);
  let loading = $state(true);

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from('vehicles').update({ is_available: !current }).eq('id', id);
    vehicles = vehicles.map(v => v.id === id ? { ...v, is_available: !current } : v);
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Jeste li sigurni?')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    vehicles = vehicles.filter(v => v.id !== id);
  }

  onMount(async () => {
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    vehicles = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Vozila — Admin — Petroni</title></svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-white">Vozila</h1>
    <a href="/admin/vozila/novo" class="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest text-black" style="background: #F5C518">
      + Dodaj vozilo
    </a>
  </div>

  <div class="rounded-2xl overflow-hidden" style="background: #111; border: 1px solid #1a1a1a">
    {#if loading}
      <div class="p-8 space-y-3">{#each [1,2,3] as _}<div class="h-12 rounded-xl animate-pulse" style="background: #1a1a1a"></div>{/each}</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="border-bottom: 1px solid #2a2a2a">
            <tr>
              {#each ['Vozilo', 'Tip', 'Kategorija', 'Cijena', 'Status', 'Akcije'] as h}
                <th class="text-left px-4 py-3 text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each vehicles as v}
              <tr style="border-bottom: 1px solid #1a1a1a">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    {#if v.images?.[0]}
                      <img src={v.images[0]} alt={v.name} class="w-12 h-8 object-cover rounded-lg" />
                    {/if}
                    <span class="font-medium text-white">{v.name}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs uppercase tracking-widest" style="color: #9ca3af">{v.type}</td>
                <td class="px-4 py-3 text-xs uppercase" style="color: #9ca3af">{v.category || '—'}</td>
                <td class="px-4 py-3 font-bold" style="color: #F5C518">
                  {v.type === 'rental' ? `€${v.price_per_day}/dan` : `€${v.sale_price}`}
                </td>
                <td class="px-4 py-3">
                  <button onclick={() => toggleAvailability(v.id, v.is_available)} class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                    style="{v.is_available ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(239,68,68,0.1); color: #ef4444'}">
                    {v.is_available ? 'Dostupno' : 'Nedostupno'}
                  </button>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <a href="/admin/vozila/{v.id}" class="px-3 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-white/10" style="color: #9ca3af; border: 1px solid #2a2a2a">Uredi</a>
                    <button onclick={() => deleteVehicle(v.id)} class="px-3 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-red-500/20" style="color: #ef4444; border: 1px solid rgba(239,68,68,0.2)">Briši</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if vehicles.length === 0}
          <p class="p-8 text-center text-sm" style="color: #9ca3af">Nema vozila. <a href="/admin/vozila/novo" class="underline" style="color: #F5C518">Dodajte prvo vozilo.</a></p>
        {/if}
      </div>
    {/if}
  </div>
</div>
