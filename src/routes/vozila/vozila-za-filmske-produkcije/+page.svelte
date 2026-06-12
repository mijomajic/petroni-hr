<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  const seed: Vehicle[] = [
    { id: 'f1', slug: 'citroen-unitvan', name: 'Citroën UnitVan', type: 'film', category: null, seats: 3, bags: 2, price_per_day: null, sale_price: null, description_hr: '', description_en: '', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f2', slug: 'honeywagon-vacum-jet-1', name: 'Honeywagon – prikolica WC Vacum-Jet 1+1', type: 'film', category: null, seats: 0, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Minimalna potrošnja vode i energije. Solarni paneli i baterije 12v osiguravaju…', description_en: 'Minimal water and energy consumption. Solar panels and 12v batteries.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f3', slug: 'honeywagon-vacum-jet-2', name: 'Honeywagon – WC prikolica -Vacum Jet – 2+1+1', type: 'film', category: null, seats: 0, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Dimenzije prikolice: 5,2m x 2,5m, odnosno sa ručnim rudom 6,8m x 2,5m…', description_en: 'Trailer dimensions 5.2m x 2.5m.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
    { id: 'f4', slug: 'kamion-eurocargo-75e15', name: 'Kamion EuroCargo 75E15 – taillift/grip/electric', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Dimenzije sanduka 7,10m D x 2,4m Š x 2,8m V…', description_en: 'Box dimensions 7.10m x 2.4m x 2.8m.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f5', slug: 'make-up-truck-peugeot-boxer', name: 'Make up truck – 2+1 radna mjesta – Peugeot Boxer', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Ovaj prenamijenjeni kamion za make-up savršeno je rješenje za pružanje usluga uljepšavanja…', description_en: 'A repurposed make-up truck for beauty services.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f6', slug: 'costume-truck-renault-master', name: 'Costume truck RENAULT MASTER Box', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: '', description_en: '', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
  ];

  let vehicles: Vehicle[] = $state(seed);

  onMount(() => {
    supabase.from('vehicles').select('*').eq('type', 'film').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) vehicles = data; });
  });
</script>

<svelte:head><title>Vozila za filmske produkcije — Petroni</title></svelte:head>

<!-- Hero -->
<section class="relative h-[300px] md:h-[400px] flex items-center overflow-hidden">
  <img src="https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp" alt="" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.25) 100%)"></div>
  <div class="container-x relative z-10">
    <nav class="flex items-center gap-2 text-xs mb-5 text-white/60">
      <a href="/" class="hover:text-white/90">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
      <a href="/vozila" class="hover:text-white/90">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</a><span>/</span>
      <span class="text-white/90">{$locale === 'hr' ? 'Filmske produkcije' : 'Film productions'}</span>
    </nav>
    <span class="block text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style="color:#f5c518">{$locale === 'hr' ? 'Specijalizirana flota' : 'Specialised fleet'}</span>
    <h1 class="text-[30px] md:text-[42px] font-extrabold uppercase leading-[1.1] tracking-tight max-w-2xl" style="color:#ffffff; text-shadow:0 2px 20px rgba(0,0,0,0.8)">
      {$locale === 'hr' ? 'Vozila za filmske produkcije' : 'Vehicles for film productions'}
    </h1>
    <p class="mt-4 max-w-xl text-[14px] leading-relaxed" style="color:rgba(255,255,255,0.82)">
      {$locale === 'hr'
        ? 'Posebno opremljena vozila za filmske i TV produkcije, reklame i fotografiranja. Fleksibilni uvjeti najma i stručna podrška.'
        : 'Specially equipped vehicles for film and TV productions, commercials and photo shoots. Flexible rental terms and expert support.'}
    </p>
  </div>
</section>

<!-- Features strip -->
<div class="py-6 border-b border-[#ededf0]" style="background:#fafbfc">
  <div class="container-x">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each [
        { icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', label: $locale === 'hr' ? 'Vrhunska oprema' : 'Premium equipment' },
        { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', label: $locale === 'hr' ? 'Stručna podrška' : 'Expert support' },
        { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: $locale === 'hr' ? 'Provjerena vozila' : 'Verified vehicles' },
        { icon: 'M1 3h15v13H1zM16 8l4 3-4 3V8z', label: $locale === 'hr' ? 'Brza dostava' : 'Fast delivery' },
      ] as f}
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full" style="background:#fff8d6">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b5890a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={f.icon}/></svg>
          </div>
          <span class="text-[12px] font-semibold text-[#3a3f45]">{f.label}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Vehicle grid -->
<section class="section">
  <div class="container-x">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {#each vehicles as vehicle}
        <VehicleCard {vehicle} detailHref={`/vozila/najam-kampera/${vehicle.slug}`} />
      {/each}
    </div>

    <div class="mt-14 rounded-xl p-8 md:p-12 text-center" style="background:#2b2b2b">
      <h2 class="text-[22px] md:text-[28px] font-extrabold text-white uppercase mb-3">{$locale === 'hr' ? 'Trebate vozilo po mjeri?' : 'Need a custom vehicle?'}</h2>
      <p class="text-white/70 text-[14px] max-w-xl mx-auto mb-7">
        {$locale === 'hr'
          ? 'Za posebne zahtjeve filmskih produkcija slobodno nas kontaktirajte — izrađujemo individualne ponude prilagođene Vašem projektu.'
          : 'For special film production requirements, feel free to contact us — we create individual offers tailored to your project.'}
      </p>
      <a href="/kontakt" class="btn btn-primary px-8 py-4">{$locale === 'hr' ? 'Zatražite ponudu' : 'Request a quote'}</a>
    </div>
  </div>
</section>
