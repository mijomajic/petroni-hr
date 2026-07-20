<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let submitting = $state(false);
  const context = $derived(form?.context ?? data.context);
  const loginPath = $derived(context === 'admin' ? '/admin/login' : '/prijava');
  const errorMessage = $derived.by(() => {
    if (form?.errorCode === 'invalid_email') return $locale === 'hr' ? 'Unesite valjanu email adresu.' : 'Enter a valid email address.';
    if (form?.errorCode === 'send_failed') return $locale === 'hr'
      ? 'Zahtjev trenutačno nije moguće poslati. Pričekajte nekoliko minuta i pokušajte ponovno.'
      : 'The request cannot be sent right now. Wait a few minutes and try again.';
    return '';
  });
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Zaboravljena lozinka' : 'Forgot password'} — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="flex min-h-[72vh] items-center bg-[#202124] py-16">
  <div class="container-x">
    <div class="mx-auto max-w-md">
      <div class="mb-8 text-left">
        <span class="eyebrow mb-3">{$locale === 'hr' ? 'Siguran pristup računu' : 'Secure account access'}</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">{$locale === 'hr' ? 'Obnovite lozinku' : 'Reset your password'}</h1>
        <p class="mt-3 text-sm leading-relaxed text-white/60">{$locale === 'hr' ? 'Unesite email računa. Ako račun postoji, poslat ćemo jednokratnu poveznicu za postavljanje nove lozinke.' : 'Enter the account email. If the account exists, we will send a one-time link for setting a new password.'}</p>
      </div>

      {#if form?.sent}
        <div class="rounded-xl bg-white p-7 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] md:p-9">
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e0] text-[#9a7600]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 4 16 0 0 16-16 0Z"/><path d="m4 6 8 6 8-6"/></svg>
          </div>
          <h2 class="text-lg font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Provjerite email' : 'Check your email'}</h2>
          <p class="mt-2 text-sm leading-relaxed text-[#6b7178]">{$locale === 'hr' ? 'Ako postoji račun s tom adresom, recovery poveznica je poslana. Poveznica je jednokratna i vremenski ograničena.' : 'If an account exists for that address, a recovery link has been sent. The link is single-use and time-limited.'}</p>
          <a href={loginPath} class="btn btn-primary mt-6 w-full py-3.5">{$locale === 'hr' ? 'Natrag na prijavu' : 'Back to sign in'}</a>
        </div>
      {:else}
        <form method="POST" onsubmit={() => submitting = true} class="rounded-xl bg-white p-7 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] md:p-9">
          <input type="hidden" name="context" value={context} />
          <div class="hidden" aria-hidden="true"><label for="recovery_website">Website</label><input id="recovery_website" name="website" tabindex="-1" autocomplete="off" /></div>
          <div class="space-y-2">
            <label class="field-label" for="recovery_email">{$locale === 'hr' ? 'Email adresa' : 'Email address'}</label>
            <input id="recovery_email" name="email" type="email" autocomplete="email" class="field" value={form?.email ?? ''} required />
            <p class="text-xs leading-relaxed text-[#8b9099]">{$locale === 'hr' ? 'Upotrijebite adresu kojom se prijavljujete u Petroni.' : 'Use the address you use to sign in to Petroni.'}</p>
          </div>

          {#if errorMessage}
            <p role="alert" class="mt-5 rounded-md bg-[#fdecec] px-4 py-3 text-sm text-[#b42318]">{errorMessage}</p>
          {:else if data.invalidLink}
            <p role="alert" class="mt-5 rounded-md bg-[#fdecec] px-4 py-3 text-sm text-[#b42318]">{$locale === 'hr' ? 'Recovery poveznica nije valjana ili je istekla. Zatražite novu.' : 'The recovery link is invalid or has expired. Request a new one.'}</p>
          {/if}

          <button class="btn btn-primary mt-6 w-full py-3.5 disabled:opacity-50 active:-translate-y-px" type="submit" disabled={submitting}>{submitting ? ($locale === 'hr' ? 'Šaljem…' : 'Sending…') : ($locale === 'hr' ? 'Pošalji poveznicu' : 'Send recovery link')}</button>
        </form>
      {/if}

      <a href={loginPath} class="mt-6 block text-sm font-semibold text-[#f5c518] hover:underline">← {$locale === 'hr' ? 'Natrag na prijavu' : 'Back to sign in'}</a>
    </div>
  </div>
</section>
