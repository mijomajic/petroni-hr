<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Registracija — Petroni</title>
  <meta name="description" content="Izradite Petroni korisnički račun." />
</svelte:head>

<section class="min-h-[72vh] flex items-center py-16" style="background:#202124">
  <div class="container-x">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <span class="eyebrow mb-3">Novi korisnik</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">Izradite korisnički račun</h1>
        <p class="mt-3 text-sm text-white/60">Brže rezervacije i jednostavan pregled svih zahtjeva.</p>
      </div>

      <div class="bg-white rounded-xl p-7 md:p-9 shadow-2xl">
        {#if form?.success}
          <div class="text-center py-8">
            <div class="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl" style="background:#fff7d6;color:#8a6500">✓</div>
            <h2 class="text-xl font-bold text-[#2b2b2b] mb-3">Provjerite svoj email</h2>
            <p class="text-sm leading-relaxed text-[#6b7178]">Poslali smo poveznicu za potvrdu na <strong>{form.email}</strong>. Nakon potvrde moći ćete se prijaviti.</p>
            <a href="/prijava?next={encodeURIComponent(data.next)}" class="btn btn-primary mt-7">Natrag na prijavu</a>
          </div>
        {:else}
          <form method="POST">
            <input type="hidden" name="next" value={data.next} />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="field-label" for="first_name">Ime *</label>
                <input id="first_name" name="first_name" class="field" autocomplete="given-name" value={form?.values?.firstName ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="last_name">Prezime *</label>
                <input id="last_name" name="last_name" class="field" autocomplete="family-name" value={form?.values?.lastName ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="email">Email adresa *</label>
                <input id="email" name="email" type="email" class="field" autocomplete="email" value={form?.values?.email ?? ''} required />
              </div>
              <div>
                <label class="field-label" for="phone">Telefon</label>
                <input id="phone" name="phone" type="tel" class="field" autocomplete="tel" value={form?.values?.phone ?? ''} />
              </div>
              <div>
                <label class="field-label" for="password">Lozinka *</label>
                <input id="password" name="password" type="password" class="field" autocomplete="new-password" minlength="8" required />
              </div>
              <div>
                <label class="field-label" for="password_confirm">Ponovite lozinku *</label>
                <input id="password_confirm" name="password_confirm" type="password" class="field" autocomplete="new-password" minlength="8" required />
              </div>
            </div>

            {#if form?.error}
              <p class="rounded-md px-4 py-3 text-sm mt-5" style="background:#fdecec;color:#b42318">{form.error}</p>
            {/if}

            <button class="btn btn-primary w-full py-3.5 mt-7" type="submit">Izradi račun</button>
          </form>
        {/if}
      </div>

      <p class="text-center text-sm text-white/60 mt-6">
        Već imate račun?
        <a class="font-semibold hover:underline" style="color:#f5c518" href="/prijava?next={encodeURIComponent(data.next)}">Prijavite se.</a>
      </p>
    </div>
  </div>
</section>
