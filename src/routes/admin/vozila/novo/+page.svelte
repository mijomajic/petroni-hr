<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let form = $state({
    name: '', slug: '', type: 'rental', category: 'COMFORT',
    seats: 4, bags: 4, base_price_per_day: 100, sale_price: 0,
    description_hr: '', description_en: '',
    images: '', is_available: true,
  });
  let loading = $state(false);
  let error = $state('');

  async function handleSave() {
    loading = true;
    error = '';
    const { error: err } = await supabase.from('vehicles').insert({
      ...form,
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
    if (err) { error = err.message; }
    else { goto('/admin/vozila'); }
    loading = false;
  }
</script>

<svelte:head><title>Novo vozilo — Admin — Petroni</title></svelte:head>

<div class="max-w-2xl">
  <div class="flex items-center gap-4 mb-8">
    <a href="/admin/vozila" class="text-sm transition-colors hover:text-[#2b2b2b]" style="color: #7a7f86">← Vozila</a>
    <h1 class="text-2xl font-black uppercase tracking-tight text-[#2b2b2b]">Novo vozilo</h1>
  </div>

  <div class="p-8 rounded-[2rem]" style="background: #ffffff; border: 1px solid #ededf0">
    <div class="space-y-5">
      {#each [
        { key: 'name', label: 'Naziv', type: 'text' },
        { key: 'slug', label: 'Slug (URL)', type: 'text' },
      ] as field}
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">{field.label}</label>
          <input type="text" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form[field.key as 'name' | 'slug']} />
        </div>
      {/each}

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Tip</label>
          <select class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.type}>
            <option value="rental">Najam</option>
            <option value="sale">Prodaja</option>
            <option value="film">Film</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Kategorija</label>
          <select class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.category}>
            <option value="COMFORT">COMFORT</option>
            <option value="ECO">ECO</option>
            <option value="ELITE">ELITE</option>
            <option value="DUO 4x4">DUO 4x4</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Sjedala</label>
          <input type="number" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.seats} />
        </div>
        <div class="space-y-2">
          <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Torbe</label>
          <input type="number" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.bags} />
        </div>
        {#if form.type === 'rental'}
          <div class="space-y-2 col-span-2">
            <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Cijena / dan (€)</label>
            <input type="number" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.base_price_per_day} />
          </div>
        {:else}
          <div class="space-y-2 col-span-2">
            <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Prodajna cijena (€)</label>
            <input type="number" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.sale_price} />
          </div>
        {/if}
      </div>

      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">Opis (HR)</label>
        <textarea rows="4" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none resize-none" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.description_hr}></textarea>
      </div>

      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest font-bold" style="color: #7a7f86">URL slike (jedan po retku)</label>
        <textarea rows="3" class="w-full px-4 py-3 rounded-xl text-[#2b2b2b] text-sm focus:outline-none resize-none font-mono" style="background: #f6f7f9; border: 1px solid #e7e8eb" bind:value={form.images}></textarea>
      </div>

      {#if error}
        <p class="p-3 rounded-xl text-sm" style="background: rgba(239,68,68,0.1); color: #ef4444">{error}</p>
      {/if}

      <button onclick={handleSave} disabled={loading || !form.name} class="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest text-black disabled:opacity-40" style="background: #F5C518">
        {loading ? 'Sprema...' : 'Spremi vozilo'}
      </button>
    </div>
  </div>
</div>
