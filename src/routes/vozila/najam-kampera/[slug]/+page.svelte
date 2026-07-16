<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { absoluteUrl, breadcrumbSchema, graphSchema, jsonLd, truncateText } from '$lib/seo';
  import { vehicleThumbnail } from '$lib/vehicle-images';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const vehicle: Vehicle = $derived(data.vehicle as Vehicle);
  let activeImage = $state(0);

  type DisplaySpec = { label: string; value: string };

  const specEntries = $derived.by<DisplaySpec[]>(() => {
    if (!vehicle.specs) return [];

    const labels: Record<string, { hr: string; en: string }> = {
      cab_ac: { hr: 'Klima u kabini', en: 'Cab air conditioning' },
      chassis: { hr: 'Podvozje', en: 'Chassis' },
      power_hp: { hr: 'Snaga motora', en: 'Engine power' },
      living_ac: { hr: 'Klima u kamperu', en: 'Living-area air conditioning' },
      model_year: { hr: 'Godina modela', en: 'Model year' },
      seats_beds: { hr: 'Sjedala / ležajevi', en: 'Seats / berths' },
      deposit_eur: { hr: 'Povratni polog', en: 'Refundable deposit' },
      dimensions_m: { hr: 'Dimenzije (D × Š × V)', en: 'Dimensions (L × W × H)' },
      transmission: { hr: 'Mjenjač', en: 'Transmission' },
      living_ac_note: { hr: 'Napomena o klimi', en: 'Air conditioning note' }
    };

    const yesNo = (value: unknown) => value
      ? ($locale === 'hr' ? 'Da' : 'Yes')
      : ($locale === 'hr' ? 'Ne' : 'No');
    const formatValue = (key: string, value: unknown) => {
      if (key === 'cab_ac' || key === 'living_ac') return yesNo(value);
      if (key === 'power_hp') return `${value} KS`;
      if (key === 'deposit_eur') return `${Number(value).toLocaleString('hr-HR')} €`;
      if (key === 'transmission') {
        const manual = $locale === 'hr' ? 'Ručni' : 'Manual';
        const automatic = $locale === 'hr' ? 'Automatski' : 'Automatic';
        return value === 'manual' ? manual : value === 'automatic' ? automatic : String(value);
      }
      return String(value);
    };

    return Object.entries(vehicle.specs).map(([key, value]) => ({
      label: labels[key]?.[$locale] ?? key.replaceAll('_', ' '),
      value: formatValue(key, value)
    }));
  });
  const summaryMetrics = $derived.by(() => {
    const dimensions = String(vehicle.specs?.dimensions_m ?? '')
      .split(/[x×]/i)
      .map(value => value.trim())
      .filter(Boolean);
    const labels = $locale === 'hr'
      ? { seats: 'Putnika', beds: 'Ležajeva', length: 'Duljina', width: 'Širina' }
      : { seats: 'Passengers', beds: 'Berths', length: 'Length', width: 'Width' };

    return [
      vehicle.seats ? { value: String(vehicle.seats), label: labels.seats } : null,
      vehicle.beds ? { value: String(vehicle.beds), label: labels.beds } : null,
      dimensions[0] ? { value: `${dimensions[0]} m`, label: labels.length } : null,
      dimensions[1] ? { value: `${dimensions[1]} m`, label: labels.width } : null
    ].filter((metric): metric is { value: string; label: string } => metric !== null);
  });
  const desc = $derived($locale === 'hr' ? vehicle.description_hr : (vehicle.description_en || vehicle.description_hr));
  const metaDescription = $derived(truncateText(desc || `${vehicle.name} u Petroni ponudi vozila za najam i prodaju.`, 155));
  const vehicleUrl = $derived(absoluteUrl(`/vozila/najam-kampera/${vehicle.slug}`));
  const vehicleImages = $derived((vehicle.images ?? []).map(absoluteUrl));
  const vehicleImage = $derived(vehicleImages[0]);
  const vehicleSchema = $derived(graphSchema([
    breadcrumbSchema([
      { name: 'Petroni', path: '/' },
      { name: 'Vozila', path: '/vozila' },
      { name: vehicle.name, path: `/vozila/najam-kampera/${vehicle.slug}` }
    ]),
    {
      '@type': 'Vehicle',
      '@id': `${vehicleUrl}#vehicle`,
      name: vehicle.name,
      description: metaDescription,
      image: vehicleImages,
      url: vehicleUrl,
      brand: { '@type': 'Brand', name: vehicle.name.split(' ')[0] },
      vehicleSeatingCapacity: vehicle.seats ?? undefined,
      numberOfDoors: undefined,
      offers: vehicle.base_price_per_day || vehicle.sale_price
        ? {
            '@type': 'Offer',
            url: vehicleUrl,
            priceCurrency: 'EUR',
            price: (vehicle.sale_price ?? vehicle.base_price_per_day)?.toString(),
            availability: vehicle.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            businessFunction: vehicle.type === 'sale' ? 'https://schema.org/Sell' : 'https://schema.org/LeaseOut'
          }
        : undefined
    }
  ]));
</script>

<svelte:head>
  <title>{vehicle?.name ?? 'Vozilo'} — Petroni</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={`${vehicle?.name ?? 'Vozilo'} — Petroni`} />
  <meta property="og:description" content={metaDescription} />
  {#if vehicleImage}<meta property="og:image" content={vehicleImage} />{/if}
  {@html `<script type="application/ld+json">${jsonLd(vehicleSchema)}</script>`}
</svelte:head>

<div class="section">
  <div class="container-x">
    {#if vehicle}
      <nav class="flex items-center gap-2 text-xs mb-6 text-[#9aa0a8] flex-wrap">
        <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
        <a href="/vozila" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</a><span>/</span>
        <span class="text-[#2b2b2b]">{vehicle.name}</span>
      </nav>

      <h1 class="text-[26px] md:text-[34px] font-bold text-[#2b2b2b] mb-8 leading-tight">{vehicle.name}</h1>

      {#if vehicle.type === 'film' && specEntries.length === 0 && !vehicle.base_price_per_day}
        <!-- Film vehicle: full-width layout -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div class="lg:col-span-3">
            <div class="relative rounded-xl overflow-hidden bg-[#f3f4f6] aspect-[16/10] mb-4 border border-[#ededf0]">
              {#if vehicle.images[activeImage]}
                <img src={vehicle.images[activeImage]} alt={vehicle.name} width="1440" height="1080" class="w-full h-full object-cover" />
              {:else}
                <div class="flex h-full items-center justify-center px-6 text-center text-sm font-semibold uppercase tracking-wider text-[#9aa0a8]">
                  {$locale === 'hr' ? 'Fotografija nije dostupna' : 'Photo unavailable'}
                </div>
              {/if}
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
              <div class="flex gap-3 mb-6 overflow-x-auto pb-2">
                {#each vehicle.images as img, i}
                  <button onclick={() => activeImage = i} class="h-16 w-20 flex-none overflow-hidden rounded-md border-2 transition-colors" style="border-color:{activeImage === i ? '#f5c518' : '#ededf0'}" aria-label={`${$locale === 'hr' ? 'Prikaži fotografiju' : 'Show photo'} ${i + 1}`}>
                    <img src={vehicleThumbnail(img)} alt="" width="480" height="360" loading="lazy" class="w-full h-full object-cover" />
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
        {#if vehicle.type === 'rental' && summaryMetrics.length}
          <section class="mb-8 overflow-hidden rounded-xl bg-[#252a35] text-white shadow-[0_18px_35px_-28px_rgba(29,35,48,0.75)]" aria-label={$locale === 'hr' ? 'Sažetak kapaciteta i dimenzija' : 'Capacity and dimensions summary'}>
            <div class="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
              {#each summaryMetrics as metric}
                <div class="px-4 py-5 text-center sm:px-6 sm:py-6">
                  <p class="text-[27px] font-bold leading-none tracking-tight sm:text-[32px]">{metric.value}</p>
                  <p class="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">{metric.label}</p>
                </div>
              {/each}
            </div>
          </section>
        {/if}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            <div class="relative rounded-lg overflow-hidden bg-[#f3f4f6] aspect-[4/3] mb-4 border border-[#ededf0]">
              {#if vehicle.images[activeImage]}
                <img src={vehicle.images[activeImage]} alt={vehicle.name} width="1440" height="1080" class="w-full h-full object-cover" />
              {:else}
                <div class="flex h-full items-center justify-center px-6 text-center text-sm font-semibold uppercase tracking-wider text-[#9aa0a8]">
                  {$locale === 'hr' ? 'Fotografija nije dostupna' : 'Photo unavailable'}
                </div>
              {/if}
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
              <div class="flex gap-3 mb-8 overflow-x-auto pb-2">
                {#each vehicle.images as img, i}
                  <button onclick={() => activeImage = i} class="h-16 w-20 flex-none overflow-hidden rounded-md border-2 transition-colors" style="border-color:{activeImage === i ? '#f5c518' : '#ededf0'}" aria-label={`${$locale === 'hr' ? 'Prikaži fotografiju' : 'Show photo'} ${i + 1}`}>
                    <img src={vehicleThumbnail(img)} alt="" width="480" height="360" loading="lazy" class="w-full h-full object-cover" />
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
              {#each specEntries as spec}
                <div class="flex items-center justify-between py-2.5 border-b border-[#f0f1f3] last:border-0">
                  <span class="text-[12px] font-bold uppercase tracking-wide text-[#2b2b2b]">{spec.label}:</span>
                  <span class="text-right text-[13px] text-[#6b7178]">{spec.value}</span>
                </div>
              {/each}
              {#if vehicle.base_price_per_day}
                <div class="flex items-center justify-between py-2.5 border-b border-[#f0f1f3]">
                  <span class="text-[12px] font-bold uppercase tracking-wide text-[#2b2b2b]">{$locale === 'hr' ? 'Cijena od' : 'Price from'}:</span>
                  <span class="text-[14px] font-bold" style="color:#b5890a">{vehicle.base_price_per_day} €/{$locale === 'hr' ? 'dan' : 'day'}</span>
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
