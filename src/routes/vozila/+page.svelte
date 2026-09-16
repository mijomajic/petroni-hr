<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import { BUSINESS } from '$lib/config/business';
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Naša flota' : 'Our fleet'} | {BUSINESS.name}</title>
  <meta name="description" content="Explore compact camper vans and spacious motorhomes, then check live availability online." />
</svelte:head>

<section class="relative isolate min-h-[420px] overflow-hidden bg-[#1f3a32] md:min-h-[520px]">
  <img src="/images/brand/alderway-hero.webp" alt="" class="absolute inset-0 h-full w-full object-cover" />
  <div class="absolute inset-0 bg-gradient-to-r from-[#10241e]/90 via-[#10241e]/55 to-transparent"></div>
  <div class="container-x relative flex min-h-[420px] items-center py-16 md:min-h-[520px]">
    <div class="max-w-2xl">
      <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e1ad8a]">{BUSINESS.name}</p>
      <h1 class="font-serif text-5xl font-semibold leading-none tracking-tight text-white md:text-7xl">
        {$locale === 'hr' ? 'Pronađite pravi kamper' : 'Find your way to travel'}
      </h1>
      <p class="mt-6 max-w-xl text-base leading-7 text-white/85">
        {$locale === 'hr' ? 'Kompaktni kamperi za dvoje, prostrani obiteljski modeli i jasne cijene za svaki termin.' : 'Compact camper vans for two, roomy family motorhomes and clear pricing for every date.'}
      </p>
      <a href="/vozila/najam-kampera" class="btn btn-primary mt-8 px-7 py-4">
        {$locale === 'hr' ? 'Pregledaj flotu' : 'Explore the fleet'} <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>

<section class="section bg-[#fbfaf7]">
  <div class="container-x grid gap-8 md:grid-cols-3">
    {#each [
      { title: $locale === 'hr' ? 'Jasna usporedba' : 'Easy to compare', body: $locale === 'hr' ? 'Kapacitet, raspored, oprema i cijene prikazani su na jednom mjestu.' : 'Capacity, layout, equipment and pricing are shown in one place.' },
      { title: $locale === 'hr' ? 'Provjerena vozila' : 'Carefully prepared', body: $locale === 'hr' ? 'Svaki kamper prolazi tehnički pregled, čišćenje i osobno preuzimanje.' : 'Every camper receives an inspection, full clean and personal handover.' },
      { title: $locale === 'hr' ? 'Rezervacija bez nagađanja' : 'Booking without guesswork', body: $locale === 'hr' ? 'Odaberite termin i dodatke, a konačni obračun vidite prije slanja.' : 'Choose dates and extras, then see the full calculation before submitting.' }
    ] as item}
      <article class="border-t border-[#d8d0c5] pt-6">
        <h2 class="text-xl font-semibold text-[#1f3a32]">{item.title}</h2>
        <p class="mt-3 text-sm leading-7 text-[#65716b]">{item.body}</p>
      </article>
    {/each}
  </div>
</section>
