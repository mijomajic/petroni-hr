<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Product } from '$lib/supabase';

  let products: Product[] = $state([]);
  let loading = $state(true);

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    products = products.map(p => p.id === id ? { ...p, is_active: !current } : p);
  }

  onMount(async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    products = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Proizvodi — Admin — Petroni</title></svelte:head>

<div>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Proizvodi</h1>
    <a href="/admin/proizvodi/novo" class="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest text-black" style="background: #F5C518">+ Dodaj proizvod</a>
  </div>

  <div class="rounded-2xl overflow-hidden" style="background: #ffffff; border: 1px solid #ededf0">
    {#if loading}
      <div class="p-8 space-y-3">{#each [1,2,3] as _}<div class="h-12 rounded-xl animate-pulse" style="background: #f6f7f9"></div>{/each}</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead style="border-bottom: 1px solid #e7e8eb">
            <tr>{#each ['Proizvod', 'SKU', 'Cijena', 'Zaliha', 'Status'] as h}<th class="text-left px-4 py-3 text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{h}</th>{/each}</tr>
          </thead>
          <tbody>
            {#each products as p}
              <tr style="border-bottom: 1px solid #f0f1f3">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    {#if p.images?.[0]}<img src={p.images[0]} alt={p.name_hr} class="w-12 h-10 object-cover rounded-lg" />{/if}
                    <div><p class="font-medium text-[#2b2b2b]">{p.name_hr}</p></div>
                  </div>
                </td>
                <td class="px-4 py-3 font-mono text-xs" style="color: #7a7f86">{p.sku || '—'}</td>
                <td class="px-4 py-3 font-bold" style="color: #F5C518">€{p.price.toFixed(2)}</td>
                <td class="px-4 py-3 text-[#2b2b2b]">{p.stock}</td>
                <td class="px-4 py-3">
                  <button onclick={() => toggleActive(p.id, p.is_active)} class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style="{p.is_active ? 'background: rgba(22,163,74,0.15); color: #16a34a' : 'background: rgba(239,68,68,0.1); color: #ef4444'}">
                    {p.is_active ? 'Aktivno' : 'Neaktivno'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if products.length === 0}<p class="p-8 text-center text-sm" style="color: #7a7f86">Nema proizvoda.</p>{/if}
      </div>
    {/if}
  </div>
</div>
