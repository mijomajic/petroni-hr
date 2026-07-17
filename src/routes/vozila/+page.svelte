<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const cats = $derived([
    {
      href: '/vozila/najam-kampera',
      img: '/images/vehicles/ci-horon-79m/01-horon-79-1-thumb.webp',
      title: $locale === 'hr' ? 'Najam kampera' : 'Camper rental'
    },
    {
      href: '/vozila/vozila-za-prodaju',
      img: '/images/vehicles/weinsberg-caracompact-suite-640meq/01-3300-caracompact-suite-pepper-mb-640meg-exbp-presse-8616-thumb.webp',
      title: $locale === 'hr' ? 'Vozila za prodaju' : 'Vehicles for sale'
    },
    {
      href: '/vozila/vozila-za-filmske-produkcije',
      img: '/images/vehicles/make-up-truck-peugeot-boxer/01-peugeot-sminka-1-thumb.webp',
      title: $locale === 'hr' ? 'Filmske produkcije' : 'Film productions'
    },
  ]);
</script>

<svelte:head>
  <title>Kamperi za najam, prodaju i snimanja | Petroni</title>
  <meta name="description" content="Pregled Petroni ponude vozila: najam kampera, vozila za prodaju i specijalizirana vozila za filmske produkcije." />
  <meta property="og:title" content="Kamperi za najam, prodaju i snimanja | Petroni" />
  <meta property="og:description" content="Pregled Petroni ponude vozila: najam kampera, vozila za prodaju i specijalizirana vozila za filmske produkcije." />
</svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-12">
      <span class="eyebrow mb-3">Petroni</span>
      <h1 class="section-title">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</h1>
      <p class="lead mt-3">{$locale === 'hr' ? 'Odaberite kategoriju koja vam odgovara' : 'Choose the category that suits you'}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
      {#each cats as cat}
        <a href={cat.href} class="card card-interactive group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-4">
          <div class="aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
            <img src={cat.img} alt={cat.title} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div class="flex flex-1 items-center justify-between gap-4 p-6 md:p-7">
            <h2 class="text-[20px] font-bold leading-tight text-[#2b2b2b] text-balance">{cat.title}</h2>
            <span class="inline-flex shrink-0 items-center gap-2 text-[12px] font-bold uppercase tracking-wide" style="color:#b5890a">
              {$locale === 'hr' ? 'Pogledaj' : 'View'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
