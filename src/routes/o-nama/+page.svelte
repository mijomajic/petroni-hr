<svelte:head><title>O nama — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-5xl mx-auto px-4 md:px-6">
    <div class="mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">Petroni d.o.o.</span>
      <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">O NAMA</h1>
      <p class="text-lg leading-relaxed max-w-2xl" style="color: #9ca3af">
        Vaš pouzdani partner za kamping i karavaning od 2005. godine.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div class="space-y-6">
        <p class="text-sm leading-relaxed" style="color: #9ca3af">
          Petroni d.o.o. je hrvatska tvrtka specijalizirana za najam i prodaju kampera, karavana i opreme za kamping. S više od 19 godina iskustva, mi smo vaš pouzdani partner za sva kamping putovanja.
        </p>
        <p class="text-sm leading-relaxed" style="color: #9ca3af">
          Naša misija je pružiti vam slobodu ceste uz maksimalnu udobnost i sigurnost. Svako naše vozilo prolazi strog tehnički pregled prije iznajmljivanja, a naš tim stoji vam na raspolaganju 24/7.
        </p>
        <p class="text-sm leading-relaxed" style="color: #9ca3af">
          Osim najma, nudimo i kompletan asortiman kamping opreme u našem online shopu — od elektrike i plinske opreme do namještaja i sanitarija.
        </p>
      </div>
      <div class="rounded-[2rem] overflow-hidden aspect-square" style="border: 1px solid #2a2a2a">
        <img src="https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp" alt="Petroni" class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-6 mb-20">
      {#each [['19+', 'Godina iskustva'], ['546+', 'Zadovoljnih klijenata'], ['20+', 'Vozila u floti']] as [num, label]}
        <div class="text-center p-8 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
          <div class="text-5xl font-black mb-2" style="color: #F5C518">{num}</div>
          <div class="text-xs font-bold uppercase tracking-widest" style="color: #9ca3af">{label}</div>
        </div>
      {/each}
    </div>

    <!-- Team / Values -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each [
        { icon: '🏆', title: 'Kvaliteta', desc: 'Sva naša vozila održavaju se prema najvišim standardima i prolaze redovite tehničke preglede.' },
        { icon: '🤝', title: 'Pouzdanost', desc: 'Transparentne cijene, bez skrivenih troškova. Točno ono što piše u ponudi — bez iznenađenja.' },
        { icon: '❤️', title: 'Podrška', desc: 'Naš tim je dostupan 24/7 za sve vaše potrebe tijekom putovanja.' },
      ] as val}
        <div class="p-6 rounded-2xl" style="background: #111; border: 1px solid #1a1a1a">
          <div class="text-3xl mb-4">{val.icon}</div>
          <h3 class="font-bold text-white mb-2">{val.title}</h3>
          <p class="text-sm leading-relaxed" style="color: #9ca3af">{val.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
