<script lang="ts">
</script>

<svelte:head><title>Vozila — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="text-center mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">Petroni</span>
      <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">VOZILA</h1>
      <p class="text-sm" style="color: #9ca3af">Odaberite kategoriju koja vam odgovara</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each [
        {
          href: '/vozila/najam-kampera',
          img: 'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg',
          title: 'Najam Kampera',
          desc: 'Kratkoročni i dugoročni najam vrhunskih kampera i karavana za nezaboravna putovanja.'
        },
        {
          href: '/vozila/vozila-za-prodaju',
          img: 'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg',
          title: 'Vozila za Prodaju',
          desc: 'Kvalitetni rabljeni i novi kamperi i karavani po konkurentnim cijenama.'
        },
        {
          href: '/vozila/vozila-za-filmske-produkcije',
          img: 'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp',
          title: 'Filmske Produkcije',
          desc: 'Posebno opremljena vozila za filmske i TV produkcije po cijeloj regiji.'
        },
      ] as cat}
        <a href={cat.href} class="group relative rounded-[2rem] overflow-hidden block h-80 transition-all duration-700 hover:scale-[1.02]" style="border: 1px solid #2a2a2a">
          <img src={cat.img} alt={cat.title} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <h2 class="text-2xl font-black uppercase tracking-tight text-white mb-2">{cat.title}</h2>
            <p class="text-sm leading-relaxed mb-4" style="color: rgba(255,255,255,0.7)">{cat.desc}</p>
            <span class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors" style="color: #F5C518">
              Pogledaj
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
