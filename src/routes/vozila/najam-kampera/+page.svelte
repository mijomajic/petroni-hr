<script lang="ts">
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import { absoluteUrl, breadcrumbSchema, graphSchema, jsonLd } from '$lib/seo';
  import { locale } from '$lib/stores/locale';
  import type { BookingExtra, RentalLocation, Season, SeasonPrice, Vehicle } from '$lib/supabase';
  import type { PageProps } from './$types';

  type VehicleGroup = {
    name: string;
    id: string;
    vehicles: Vehicle[];
  };

  type SeasonSummary = Season & {
    minimumPrice: number | null;
    maximumPrice: number | null;
  };

  const categoryOrder = ['ELITE', 'COMFORT', 'DUO 4x4', 'ECO', 'KAMP PRIKOLICE'];

  let { data }: PageProps = $props();
  const vehicles = $derived(data.vehicles as Vehicle[]);
  const seasons = $derived(data.seasons as Season[]);
  const seasonPrices = $derived(data.seasonPrices as SeasonPrice[]);
  const locations = $derived(data.locations as RentalLocation[]);
  const equipment = $derived(
    (data.extras as BookingExtra[]).filter((extra) => extra.category === 'oprema' && extra.max_qty > 0)
  );

  const vehicleGroups = $derived.by(() => {
    const groups: VehicleGroup[] = categoryOrder
      .map((name) => ({
        name,
        id: categoryId(name),
        vehicles: vehicles.filter((vehicle) => vehicle.category === name)
      }))
      .filter((group) => group.vehicles.length > 0);

    const uncategorized = vehicles.filter((vehicle) => !categoryOrder.includes(vehicle.category ?? ''));
    if (uncategorized.length > 0) {
      groups.push({ name: 'OSTALO', id: 'ostalo', vehicles: uncategorized });
    }

    return groups;
  });

  const seasonSummaries = $derived.by(() => {
    const activeVehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));

    return seasons.map((season): SeasonSummary => {
      const prices = seasonPrices
        .filter((price) => price.season_id === season.id && activeVehicleIds.has(price.vehicle_id))
        .map((price) => Number(price.price_per_day))
        .filter((price) => Number.isFinite(price));

      return {
        ...season,
        minimumPrice: prices.length > 0 ? Math.min(...prices) : null,
        maximumPrice: prices.length > 0 ? Math.max(...prices) : null
      };
    });
  });

  const description = $derived(
    $locale === 'hr'
      ? 'Najam kampera i kamp prikolica u Hrvatskoj uz Petroni: pregled vozila, kategorija, kapaciteta i sezonskih cijena.'
      : 'Camper and caravan rental in Croatia with Petroni: explore vehicles, categories, capacities and seasonal prices.'
  );
  const pageSchema = $derived(graphSchema([
    breadcrumbSchema([
      { name: 'Petroni', path: '/' },
      { name: $locale === 'hr' ? 'Vozila' : 'Vehicles', path: '/vozila' },
      { name: $locale === 'hr' ? 'Najam kampera' : 'Camper rental', path: '/vozila/najam-kampera' }
    ]),
    {
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl('/vozila/najam-kampera')}#collection`,
      name: $locale === 'hr' ? 'Najam kampera' : 'Camper rental',
      description,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: vehicles.slice(0, 20).map((vehicle, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(`/vozila/${vehicle.slug}`),
          name: vehicle.name
        }))
      }
    }
  ]));

  function categoryId(category: string) {
    return category
      .toLocaleLowerCase('hr')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  function formatDate(value: string) {
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat($locale === 'hr' ? 'hr-HR' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat($locale === 'hr' ? 'hr-HR' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2
    }).format(value);
  }

  function localizedSeasonName(name: string) {
    if ($locale === 'hr') return name;
    return name
      .replace('Niska sezona', 'Low season')
      .replace('Srednja sezona', 'Mid season')
      .replace('Visoka sezona', 'High season');
  }

  function extraName(extra: BookingExtra) {
    return $locale === 'hr' ? extra.name_hr : (extra.name_en || extra.name_hr);
  }

  function priceTypeLabel(priceType: BookingExtra['price_type']) {
    if (priceType === 'per_day') return $locale === 'hr' ? 'po danu' : 'per day';
    if (priceType === 'refundable') return $locale === 'hr' ? 'povratno' : 'refundable';
    return $locale === 'hr' ? 'po najmu' : 'per rental';
  }
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Najam kampera u Hrvatskoj – rezervirajte online | Petroni' : 'Camper rental in Croatia – book online | Petroni'}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={$locale === 'hr' ? 'Najam kampera u Hrvatskoj – rezervirajte online | Petroni' : 'Camper rental in Croatia – book online | Petroni'} />
  <meta property="og:description" content={description} />
  {@html `<script type="application/ld+json">${jsonLd(pageSchema)}</script>`}
</svelte:head>

<main>
  <section class="section pb-10 sm:pb-14">
    <div class="container-x">
      <nav class="mb-5 flex items-center gap-2 text-xs text-[#9aa0a8]" aria-label={$locale === 'hr' ? 'Putanja stranice' : 'Breadcrumb'}>
        <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
        <a href="/vozila" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</a><span>/</span>
        <span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</span>
      </nav>

      <div class="max-w-3xl">
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b5890a]">Petroni rental</p>
        <h1 class="section-title mb-3">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</h1>
        <p class="lead">{$locale === 'hr' ? 'Pronađite kamper ili kamp prikolicu za svoje sljedeće putovanje.' : 'Find the camper or caravan for your next journey.'}</p>
      </div>

      {#if vehicleGroups.length > 0}
        <nav class="mt-8 flex flex-wrap gap-2" aria-label={$locale === 'hr' ? 'Kategorije vozila' : 'Vehicle categories'}>
          {#each vehicleGroups as group}
            <a
              href={`#${group.id}`}
              class="rounded-full border border-[#dedfe3] bg-white px-4 py-2 text-xs font-bold tracking-[0.08em] text-[#44484e] transition-colors hover:border-[#f5c518] hover:bg-[#fffbea] hover:text-[#7c6100]"
            >
              {group.name}
              <span class="ml-1 text-[#9aa0a8]">{group.vehicles.length}</span>
            </a>
          {/each}
        </nav>
      {/if}
    </div>
  </section>

  <section class="pb-16 sm:pb-24" aria-labelledby="fleet-heading">
    <div class="container-x">
      <h2 id="fleet-heading" class="sr-only">{$locale === 'hr' ? 'Vozila za najam' : 'Rental vehicles'}</h2>

      {#if data.loadError}
        <div class="card border-[#eadfba] bg-[#fffaf0] p-6 text-sm text-[#6f5600]">
          {$locale === 'hr' ? 'Vozila trenutačno nije moguće učitati. Pokušajte ponovno malo kasnije.' : 'Vehicles cannot be loaded right now. Please try again shortly.'}
        </div>
      {:else if vehicleGroups.length === 0}
        <div class="card p-10 text-center text-[#7a7f86]">
          {$locale === 'hr' ? 'Trenutačno nema objavljenih vozila za najam.' : 'There are currently no published rental vehicles.'}
        </div>
      {:else}
        <div class="space-y-16 sm:space-y-20">
          {#each vehicleGroups as group}
            <section id={group.id} class="scroll-mt-28" aria-labelledby={`${group.id}-heading`}>
              <div class="mb-6 flex items-center gap-4 sm:mb-8">
                <h2 id={`${group.id}-heading`} class="text-2xl font-black tracking-tight text-[#252525] sm:text-3xl">{group.name}</h2>
                <div class="h-px flex-1 bg-[#e5e6e9]"></div>
                <span class="text-xs font-semibold uppercase tracking-wider text-[#969ba3]">
                  {group.vehicles.length} {group.vehicles.length === 1 ? ($locale === 'hr' ? 'vozilo' : 'vehicle') : ($locale === 'hr' ? 'vozila' : 'vehicles')}
                </span>
              </div>

              <div class="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
                {#each group.vehicles as vehicle}
                  <VehicleCard {vehicle} />
                {/each}
              </div>
            </section>
          {/each}
        </div>
      {/if}

      {#if vehicles.length > 0}
        <div class="mt-14 flex justify-center sm:mt-18">
          <a href="/rezerviraj" class="btn btn-primary px-8 py-3.5">
            {$locale === 'hr' ? 'Provjeri termine i rezerviraj' : 'Check dates and book'}
          </a>
        </div>
      {/if}
    </div>
  </section>

  {#if seasonSummaries.length > 0 || equipment.length > 0 || locations.length > 0}
    <section class="border-y border-[#e9eaed] bg-[#f7f8f9] py-16 sm:py-24" aria-labelledby="rental-info-heading">
      <div class="container-x">
        <div class="mb-10 max-w-3xl sm:mb-14">
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b5890a]">{$locale === 'hr' ? 'Prije rezervacije' : 'Before booking'}</p>
          <h2 id="rental-info-heading" class="text-3xl font-black tracking-tight text-[#252525] sm:text-4xl">
            {$locale === 'hr' ? 'Sve važno na jednom mjestu' : 'Everything important in one place'}
          </h2>
          <p class="mt-4 text-[15px] leading-7 text-[#72777f]">
            {$locale === 'hr' ? 'Cijena ovisi o sezoni i odabranom vozilu. Točan obračun vidjet ćete prije slanja rezervacije.' : 'The price depends on the season and selected vehicle. You will see the exact calculation before submitting your booking.'}
          </p>
        </div>

        <div class="space-y-8">
          {#if seasonSummaries.length > 0}
            <article class="overflow-hidden rounded-2xl border border-[#e1e3e6] bg-white" aria-labelledby="season-info-heading">
              <div class="border-b border-[#ececef] px-6 py-5 sm:px-8">
                <h3 id="season-info-heading" class="text-lg font-black text-[#2b2b2b]">{$locale === 'hr' ? 'Sezonske cijene i minimalni najam' : 'Seasonal prices and minimum stay'}</h3>
              </div>
              <div class="divide-y divide-[#ececef]">
                {#each seasonSummaries as season}
                  <div class="grid gap-3 px-6 py-5 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center sm:gap-6 sm:px-8">
                    <div>
                      <p class="font-bold text-[#303238]">{localizedSeasonName(season.name)}</p>
                      <p class="mt-1 text-xs text-[#8a8f97]">{formatDate(season.date_from)} – {formatDate(season.date_to)}</p>
                    </div>
                    <p class="text-sm text-[#60656c]">
                      {$locale === 'hr' ? 'Minimalno' : 'Minimum'} <strong class="text-[#2b2b2b]">{season.min_nights}</strong> {$locale === 'hr' ? 'noćenja' : 'nights'}
                    </p>
                    <p class="text-sm font-bold text-[#8a6a00] sm:text-right">
                      {#if season.minimumPrice !== null && season.maximumPrice !== null}
                        {#if season.minimumPrice === season.maximumPrice}
                          {formatMoney(season.minimumPrice)} / {$locale === 'hr' ? 'dan' : 'day'}
                        {:else}
                          {formatMoney(season.minimumPrice)} – {formatMoney(season.maximumPrice)} / {$locale === 'hr' ? 'dan' : 'day'}
                        {/if}
                      {:else}
                        {$locale === 'hr' ? 'Prema odabranom vozilu' : 'Based on selected vehicle'}
                      {/if}
                    </p>
                  </div>
                {/each}
              </div>
            </article>
          {/if}

          <div class="grid gap-8 lg:grid-cols-2">
            {#if equipment.length > 0}
              <article class="rounded-2xl border border-[#e1e3e6] bg-white p-6 sm:p-8" aria-labelledby="equipment-info-heading">
                <h3 id="equipment-info-heading" class="text-lg font-black text-[#2b2b2b]">{$locale === 'hr' ? 'Dodatna oprema' : 'Additional equipment'}</h3>
                <p class="mt-2 text-sm leading-6 text-[#7a7f86]">{$locale === 'hr' ? 'Opremu birate tijekom rezervacije, ovisno o svojim potrebama.' : 'Choose equipment during booking according to your needs.'}</p>
                <ul class="mt-6 divide-y divide-[#eff0f2]">
                  {#each equipment as extra}
                    <li class="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <span class="text-sm font-medium leading-5 text-[#41444a]">{extraName(extra)}</span>
                      <span class="shrink-0 text-right text-xs font-bold leading-5 text-[#8a6a00]">{formatMoney(Number(extra.price))} <span class="font-medium text-[#92979f]">{priceTypeLabel(extra.price_type)}</span></span>
                    </li>
                  {/each}
                </ul>
              </article>
            {/if}

            {#if locations.length > 0}
              <article class="rounded-2xl border border-[#e1e3e6] bg-white p-6 sm:p-8" aria-labelledby="locations-info-heading">
                <h3 id="locations-info-heading" class="text-lg font-black text-[#2b2b2b]">{$locale === 'hr' ? 'Lokacije preuzimanja' : 'Pickup locations'}</h3>
                <p class="mt-2 text-sm leading-6 text-[#7a7f86]">{$locale === 'hr' ? 'Dostupne lokacije i eventualne naknade uvijek se obračunavaju prema odabiru u rezervaciji.' : 'Available locations and any applicable fees are always calculated from your booking selection.'}</p>
                <ul class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {#each locations as location}
                    <li class="rounded-xl border border-[#eceef0] bg-[#fafafa] p-4">
                      <p class="text-sm font-bold text-[#35383d]">{location.name}</p>
                      {#if location.pickup_window}
                        <p class="mt-1.5 text-xs leading-5 text-[#81868e]">{$locale === 'hr' ? 'Preuzimanje' : 'Pickup'}: {location.pickup_window}</p>
                      {/if}
                      {#if location.return_window}
                        <p class="text-xs leading-5 text-[#81868e]">{$locale === 'hr' ? 'Povrat' : 'Return'}: {location.return_window}</p>
                      {/if}
                      <p class="mt-2 text-xs font-semibold text-[#8a6a00]">
                        {Number(location.location_fee) > 0
                          ? `${$locale === 'hr' ? 'Naknada' : 'Fee'}: ${formatMoney(Number(location.location_fee))}`
                          : ($locale === 'hr' ? 'Bez lokacijske naknade' : 'No location fee')}
                      </p>
                    </li>
                  {/each}
                </ul>
              </article>
            {/if}
          </div>
        </div>
      </div>
    </section>
  {/if}
</main>
