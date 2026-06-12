<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  let vehicle: Vehicle | null = $state(null);
  let loading = $state(true);
  let activeImage = $state(0);

  const seed: Record<string, Vehicle> = {
    'weinsberg-caraone-550qdk': { id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK', type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null, description_hr: 'Udoban obiteljski karavan idealan za ljetna putovanja. Prostrani interijer s modernom opremom, klima uređaj, potpuno opremljena kuhinja i udobne ležaljke.', description_en: 'A comfortable family caravan ideal for summer travel.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: { Godina: '2024', Vozilo: 'Ford', Model: 'Transit', Motor: '2.0tdci 155ks', 'Broj ležajeva': '6-8', 'Broj sjedala': '6', Tenda: '✓' }, is_available: true, created_at: '' },
    'weinsberg-caraone-550uk': { id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK', type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null, description_hr: 'Kompaktan i ekonomičan karavan za par ili manju obitelj. Idealan za brze vikend izlete i dulja putovanja.', description_en: 'Compact and economical caravan.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: { Godina: '2023', Vozilo: 'Caravan', Model: 'CaraOne', 'Broj ležajeva': '2-4', 'Broj sjedala': '4' }, is_available: true, created_at: '' },
    'caratour-ford-600mq': { id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null, description_hr: 'Vaš san o istraživanju svijeta sada postaje stvarnost. Dizajniran za one koji se uvijek osjećaju spremni za avanturu, omogućavajući vam da uživate u slobodnom vremenu bez odricanja od bilo čega bitnog.', description_en: 'Your dream of exploring the world becomes reality.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { Godina: '2024', Vozilo: 'Ford', Model: 'Transit', Motor: '2.0tdci 155ks', 'Broj ležajeva': '6-8', 'Dimenzije ležajeva': '150x200', 'Broj sjedala': '6', Tenda: '✓', 'Radio/CD/MP3': '✓', Tempomat: '✓', 'Klima kabina': '✓' }, is_available: true, created_at: '' },
  };

  function fallbackFromSlug(slug: string): Vehicle {
    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { id: slug, slug, name, type: 'sale', category: null, seats: null, bags: null, price_per_day: null, sale_price: null, description_hr: 'Za više informacija o ovom vozilu, specifikacijama i dostupnosti slobodno nas kontaktirajte.', description_en: 'Contact us for more information about this vehicle.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { Godina: '2024' }, is_available: true, created_at: '' };
  }

  onMount(() => {
    const slug = $page.params.slug;
    vehicle = seed[slug] ?? fallbackFromSlug(slug);
    loading = false;
    supabase.from('vehicles').select('*').eq('slug', slug).single()
      .then(({ data }) => { if (data) vehicle = data; });
  });

  const specEntries = $derived(vehicle?.specs ? Object.entries(vehicle.specs) : []);
  const desc = $derived(vehicle ? ($locale === 'hr' ? vehicle.description_hr : (vehicle.description_en || vehicle.description_hr)) : '');
</script>

<svelte:head><title>{vehicle?.name ?? 'Vozilo'} — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    {#if vehicle}
      <nav class="flex items-center gap-2 text-xs mb-6 text-[#9aa0a8] flex-wrap">
        <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
        <a href="/vozila" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</a><span>/</span>
        <span class="text-[#2b2b2b]">{vehicle.name}</span>
      </nav>

      <h1 class="text-[26px] md:text-[34px] font-bold text-[#2b2b2b] mb-8 leading-tight">{vehicle.name}</h1>

      {#if vehicle.type === 'film' && specEntries.length === 0 && !vehicle.price_per_day}
        <!-- Film vehicle: full-width layout -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div class="lg:col-span-3">
            <div class="relative rounded-xl overflow-hidden bg-[#f3f4f6] aspect-[16/10] mb-4 border border-[#ededf0]">
              <img src={vehicle.images[activeImage]} alt={vehicle.name} class="w-full h-full object-cover" />
              {#if vehicle.images.length > 1}
                <button onclick={() => activeImage = (activeImage - 1 + vehicle!.images.length) % vehicle!.images.length}
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white" aria-label="Prev">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onclick={() => activeImage = (activeImage + 1) % vehicle!.images.length}
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white" aria-label="Next">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              {/if}
            </div>
            {#if vehicle.images.length > 1}
              <div class="flex gap-3 mb-6">
                {#each vehicle.images as img, i}
                  <button onclick={() => activeImage = i} class="w-20 h-16 rounded-md overflow-hidden border-2 transition-colors" style="border-color:{activeImage === i ? '#f5c518' : '#ededf0'}">
                    <img src={img} alt="" class="w-full h-full object-cover" />
                  </button>
                {/each}
              </div>
            {/if}
            {#if desc}
              <p class="text-[15px] leading-relaxed text-[#6b7178]">{desc}</p>
            {/if}
          </div>
          <div class="lg:col-span-2 space-y-5">
            <div class="card p-7">
              <p class="text-[12px] font-bold uppercase tracking-widest mb-4" style="color:#b5890a">{$locale === 'hr' ? 'Cijena najma' : 'Rental price'}</p>
              <p class="text-[22px] font-extrabold text-[#2b2b2b] mb-2">{$locale === 'hr' ? 'Individualna ponuda' : 'Individual quote'}</p>
              <p class="text-[13px] text-[#8b9099] mb-6">{$locale === 'hr' ? 'Cijena ovisi o trajanju i specifičnim zahtjevima produkcije.' : 'Price depends on duration and specific production requirements.'}</p>
              <a href="/kontakt" class="btn btn-primary w-full py-4 mb-3">{$locale === 'hr' ? 'Zatražite ponudu' : 'Request a quote'}</a>
              <a href="/rezerviraj" class="btn btn-outline w-full py-4">{$locale === 'hr' ? 'Rezerviraj' : 'Book'}</a>
            </div>
            <div class="card p-6">
              <p class="text-[12px] font-bold uppercase tracking-widest mb-4" style="color:#b5890a">{$locale === 'hr' ? 'Uključuje' : 'Includes'}</p>
              {#each ($locale === 'hr' ? ['Tehnička ispravnost vozila', 'Podrška tima za produksiju', 'Fleksibilno preuzimanje', 'Dostava na lokaciju'] : ['Technical vehicle inspection', 'Production team support', 'Flexible pick-up', 'On-location delivery']) as item}
                <div class="flex items-center gap-2 py-2 border-b border-[#f0f1f3] last:border-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-[13px] text-[#5b6168]">{item}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>

      {:else}
        <!-- Standard rental/sale layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <div class="relative rounded-lg overflow-hidden bg-[#f3f4f6] aspect-[4/3] mb-4 border border-[#ededf0]">
              <img src={vehicle.images[activeImage]} alt={vehicle.name} class="w-full h-full object-cover" />
              {#if vehicle.images.length > 1}
                <button onclick={() => activeImage = (activeImage - 1 + vehicle!.images.length) % vehicle!.images.length}
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white" aria-label="Prev">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button onclick={() => activeImage = (activeImage + 1) % vehicle!.images.length}
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white" aria-label="Next">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              {/if}
            </div>
            {#if vehicle.images.length > 1}
              <div class="flex gap-3 mb-8">
                {#each vehicle.images as img, i}
                  <button onclick={() => activeImage = i} class="w-20 h-16 rounded-md overflow-hidden border-2 transition-colors" style="border-color:{activeImage === i ? '#f5c518' : '#ededf0'}">
                    <img src={img} alt="" class="w-full h-full object-cover" />
                  </button>
                {/each}
              </div>
            {/if}
            <h2 class="text-[20px] font-bold text-[#2b2b2b] mb-3">{vehicle.name}</h2>
            {#if desc}
              <p class="text-[14px] leading-relaxed text-[#6b7178] mb-8">{desc}</p>
            {/if}
            <div class="flex flex-wrap gap-3">
              <a href="/rezerviraj" class="btn btn-primary px-7 py-3.5">{$locale === 'hr' ? 'Rezerviraj' : 'Book'}</a>
              <a href="/kontakt" class="btn btn-outline px-7 py-3.5">{$locale === 'hr' ? 'Kontaktirajte nas' : 'Contact us'}</a>
            </div>
          </div>

          <aside class="lg:col-span-1">
            <div class="card p-6">
              {#each specEntries as [key, val]}
                <div class="flex items-center justify-between py-2.5 border-b border-[#f0f1f3] last:border-0">
                  <span class="text-[12px] font-bold uppercase tracking-wide text-[#2b2b2b]">{key}:</span>
                  <span class="text-[13px] text-[#6b7178]">{val as string}</span>
                </div>
              {/each}
              {#if vehicle.price_per_day}
                <div class="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                  <span class="text-[12px] font-bold uppercase tracking-wide text-[#2b2b2b]">{$locale === 'hr' ? 'Cijena od' : 'Price from'}:</span>
                  <span class="text-[14px] font-bold" style="color:#b5890a">{vehicle.price_per_day} €/{$locale === 'hr' ? 'dan' : 'day'}</span>
                </div>
              {/if}
              {#if vehicle.sale_price}
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-[12px] font-bold uppercase tracking-wide text-[#2b2b2b]">{$locale === 'hr' ? 'Prodajna cijena' : 'Sale price'}:</span>
                  <span class="text-[14px] font-bold" style="color:#b5890a">{vehicle.sale_price.toLocaleString('hr-HR')} €</span>
                </div>
              {/if}
            </div>
          </aside>
        </div>
      {/if}
    {:else}
      <div class="text-center py-20 text-[#8b9099]">
        <p>{$locale === 'hr' ? 'Vozilo nije pronađeno.' : 'Vehicle not found.'}</p>
        <a href="/vozila/najam-kampera" class="mt-4 inline-block text-sm underline" style="color:#b5890a">{$locale === 'hr' ? 'Natrag na listu' : 'Back to list'}</a>
      </div>
    {/if}
  </div>
</div>
