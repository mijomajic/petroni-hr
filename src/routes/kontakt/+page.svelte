<script lang="ts">
  let name = $state('');
  let email = $state('');
  let message = $state('');
  let sent = $state(false);
  let loading = $state(false);

  async function handleSubmit() {
    loading = true;
    await new Promise(r => setTimeout(r, 1000));
    sent = true;
    loading = false;
  }
</script>

<svelte:head><title>Kontakt — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-5xl mx-auto px-4 md:px-6">
    <div class="mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">Javite nam se</span>
      <h1 class="text-5xl font-black uppercase tracking-tight text-white mb-4">KONTAKT</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Contact info -->
      <div class="space-y-8">
        {#each [
          { icon: '📍', title: 'Adresa', lines: ['Petroni d.o.o.', 'Zagreb, Hrvatska'] },
          { icon: '📞', title: 'Telefon', lines: ['+385 1 234 5678'] },
          { icon: '✉️', title: 'Email', lines: ['info@petroni.hr'] },
          { icon: '🕐', title: 'Radno vrijeme', lines: ['Pon–Pet: 8:00–16:00', 'Sub: 9:00–13:00'] },
        ] as info}
          <div class="flex items-start gap-5">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style="background: rgba(245,197,24,0.1)">
              {info.icon}
            </div>
            <div>
              <h3 class="font-bold text-white mb-1">{info.title}</h3>
              {#each info.lines as line}
                <p class="text-sm" style="color: #9ca3af">{line}</p>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Form -->
      <div class="p-8 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
        {#if sent}
          <div class="text-center py-10">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background: rgba(245,197,24,0.15)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 class="font-bold text-white text-xl mb-2">Poruka poslana!</h3>
            <p class="text-sm" style="color: #9ca3af">Javit ćemo vam se što je prije moguće.</p>
          </div>
        {:else}
          <h2 class="text-lg font-bold uppercase tracking-widest text-white mb-6">Pošaljite poruku</h2>
          <div class="space-y-4">
            {#each [
              { label: 'Ime i prezime', type: 'text', bind: name },
              { label: 'Email adresa', type: 'email', bind: email },
            ] as field}
              <div class="space-y-2">
                <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">{field.label}</label>
                <input type={field.type} class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none" style="background: #1a1a1a; border: 1px solid #2a2a2a" bind:value={field.bind} />
              </div>
            {/each}
            <div class="space-y-2">
              <label class="text-xs uppercase tracking-widest font-bold" style="color: #9ca3af">Poruka</label>
              <textarea rows="5" class="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none resize-none" style="background: #1a1a1a; border: 1px solid #2a2a2a" bind:value={message}></textarea>
            </div>
            <button
              onclick={handleSubmit}
              disabled={loading || !name || !email || !message}
              class="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-40"
              style="background: #F5C518"
            >
              {loading ? 'Šaljem...' : 'Pošalji poruku'}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
