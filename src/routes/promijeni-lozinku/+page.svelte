<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let submitting = $state(false);
  const context = $derived(form?.context ?? data.context);
  const errorMessage = $derived.by(() => {
    if (!form?.errorCode) return '';
    const hr: Record<string, string> = {
      current_required: 'Unesite trenutnu lozinku.',
      too_short: 'Nova lozinka mora imati najmanje 8 znakova.',
      mismatch: 'Nova lozinka i potvrda nisu jednake.',
      same_password: 'Nova lozinka mora biti drugačija od trenutne.',
      session_expired: 'Sesija je istekla. Prijavite se ponovno.',
      auth_error: 'Trenutna lozinka nije ispravna ili promjenu trenutačno nije moguće spremiti.'
    };
    const en: Record<string, string> = {
      current_required: 'Enter your current password.',
      too_short: 'The new password must contain at least 8 characters.',
      mismatch: 'The new password and confirmation do not match.',
      same_password: 'The new password must be different from the current password.',
      session_expired: 'Your session has expired. Sign in again.',
      auth_error: 'The current password is incorrect or the change cannot be saved right now.'
    };
    return ($locale === 'hr' ? hr : en)[form.errorCode] ?? ($locale === 'hr' ? 'Lozinku nije moguće promijeniti.' : 'The password cannot be changed.');
  });
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Promjena lozinke' : 'Change password'} — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="flex min-h-[72vh] items-center bg-[#f7f8fa] py-16">
  <div class="container-x">
    <div class="mx-auto max-w-lg">
      <div class="mb-8 text-left">
        <span class="eyebrow mb-3">{$locale === 'hr' ? 'Sigurnost računa' : 'Account security'}</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-[#2b2b2b]">{$locale === 'hr' ? 'Promijenite lozinku' : 'Change your password'}</h1>
        <p class="mt-3 text-sm leading-relaxed text-[#6b7178]">{$locale === 'hr' ? `Prijavljeni ste kao ${data.email}. Nakon promjene odjavit ćemo sve aktivne sesije.` : `You are signed in as ${data.email}. After the change, all active sessions will be signed out.`}</p>
      </div>

      {#if form?.success}
        <div class="rounded-xl border border-[#e5e7eb] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(30,34,40,0.35)] md:p-9">
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7e0] text-[#9a7600]"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></div>
          <h2 class="text-lg font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Lozinka je promijenjena' : 'Password changed'}</h2>
          <p class="mt-2 text-sm leading-relaxed text-[#6b7178]">{$locale === 'hr' ? 'Sve sesije su odjavljene. Prijavite se novom lozinkom.' : 'All sessions have been signed out. Sign in with your new password.'}</p>
          <a href={form.loginPath} class="btn btn-primary mt-6 w-full py-3.5">{$locale === 'hr' ? 'Prijavi se ponovno' : 'Sign in again'}</a>
        </div>
      {:else}
        <form method="POST" onsubmit={() => submitting = true} class="rounded-xl border border-[#e5e7eb] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(30,34,40,0.35)] md:p-9">
          <input type="hidden" name="context" value={context} />
          <div class="space-y-5">
            <div class="space-y-2"><label class="field-label" for="current_password">{$locale === 'hr' ? 'Trenutna lozinka' : 'Current password'}</label><input id="current_password" name="current_password" type="password" autocomplete="current-password" class="field" required /></div>
            <div class="space-y-2"><label class="field-label" for="new_password">{$locale === 'hr' ? 'Nova lozinka' : 'New password'}</label><input id="new_password" name="password" type="password" autocomplete="new-password" class="field" minlength="8" required /><p class="text-xs text-[#8b9099]">{$locale === 'hr' ? 'Najmanje 8 znakova i drugačija od trenutne lozinke.' : 'At least 8 characters and different from your current password.'}</p></div>
            <div class="space-y-2"><label class="field-label" for="new_password_confirm">{$locale === 'hr' ? 'Ponovite novu lozinku' : 'Confirm new password'}</label><input id="new_password_confirm" name="password_confirm" type="password" autocomplete="new-password" class="field" minlength="8" required /></div>
          </div>
          {#if errorMessage}<p role="alert" class="mt-5 rounded-md bg-[#fdecec] px-4 py-3 text-sm text-[#b42318]">{errorMessage}</p>{/if}
          <button class="btn btn-primary mt-6 w-full py-3.5 disabled:opacity-50 active:-translate-y-px" type="submit" disabled={submitting}>{submitting ? ($locale === 'hr' ? 'Spremam…' : 'Saving…') : ($locale === 'hr' ? 'Promijeni lozinku' : 'Change password')}</button>
        </form>
      {/if}
    </div>
  </div>
</section>
