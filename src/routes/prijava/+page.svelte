<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Prijava — Petroni</title>
  <meta name="description" content="Prijavite se u svoj Petroni korisnički račun." />
</svelte:head>

<section class="min-h-[72vh] flex items-center py-16" style="background:#202124">
  <div class="container-x">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <span class="eyebrow mb-3">Korisnički račun</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">Dobro došli natrag</h1>
        <p class="mt-3 text-sm text-white/60">Pregledajte svoje rezervacije i narudžbe na jednom mjestu.</p>
      </div>

      <form method="POST" class="bg-white rounded-xl p-7 md:p-9 shadow-2xl">
        <input type="hidden" name="next" value={data.next} />
        <div class="space-y-5">
          <div>
            <label class="field-label" for="email">Email adresa</label>
            <input id="email" name="email" type="email" autocomplete="email" class="field" value={form?.email ?? ''} required />
          </div>
          <div>
            <label class="field-label" for="password">Lozinka</label>
            <input id="password" name="password" type="password" autocomplete="current-password" class="field" minlength="6" required />
          </div>

          {#if form?.error}
            <p class="rounded-md px-4 py-3 text-sm" style="background:#fdecec;color:#b42318">{form.error}</p>
          {:else if data.confirmationError}
            <p class="rounded-md px-4 py-3 text-sm" style="background:#fdecec;color:#b42318">Poveznica za potvrdu nije valjana ili je istekla. Pokušajte se registrirati ponovno.</p>
          {/if}

          <button class="btn btn-primary w-full py-3.5" type="submit">Prijavi se</button>
        </div>
      </form>

      <p class="text-center text-sm text-white/60 mt-6">
        Nemate račun?
        <a class="font-semibold hover:underline" style="color:#f5c518" href="/registracija?next={encodeURIComponent(data.next)}">Izradite ga ovdje.</a>
      </p>
    </div>
  </div>
</section>
