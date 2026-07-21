<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let submitting = $state(false);
  const context = $derived(form?.context ?? data.context);
  const errorMessage = $derived.by(() => {
    if (!form?.errorCode) return '';
    if (form.errorCode === 'too_short') return $locale === 'hr' ? 'Nova lozinka mora imati najmanje 8 znakova.' : 'The new password must contain at least 8 characters.';
    if (form.errorCode === 'mismatch') return $locale === 'hr' ? 'Nova lozinka i potvrda nisu jednake.' : 'The new password and confirmation do not match.';
    if (form.errorCode === 'recovery_expired') return $locale === 'hr' ? 'Recovery sesija je istekla. Zatražite novu poveznicu.' : 'The recovery session has expired. Request a new link.';
    return $locale === 'hr' ? 'Lozinku trenutačno nije moguće spremiti. Zatražite novu recovery poveznicu.' : 'The password cannot be saved right now. Request a new recovery link.';
  });
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Postavljanje nove lozinke' : 'Set a new password'} — Petroni</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="flex min-h-[72vh] items-center bg-[#202124] py-16">
  <div class="container-x">
    <div class="mx-auto max-w-md">
      <div class="mb-8 text-left">
        <span class="eyebrow mb-3">{$locale === 'hr' ? 'Recovery potvrđen' : 'Recovery confirmed'}</span>
        <h1 class="text-3xl font-extrabold uppercase tracking-tight text-white">{$locale === 'hr' ? 'Postavite novu lozinku' : 'Set a new password'}</h1>
        <p class="mt-3 text-sm leading-relaxed text-white/60">{$locale === 'hr' ? `Poveznica je potvrđena za ${data.email}. Nakon spremanja odjavit ćemo sve postojeće sesije.` : `The link was confirmed for ${data.email}. After saving, all existing sessions will be signed out.`}</p>
      </div>

      <form method="POST" onsubmit={() => submitting = true} class="rounded-xl bg-white p-7 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] md:p-9">
        <input type="hidden" name="context" value={context} />
        <div class="space-y-5">
          <div class="space-y-2"><label class="field-label" for="recovery_password">{$locale === 'hr' ? 'Nova lozinka' : 'New password'}</label><input id="recovery_password" name="password" type="password" autocomplete="new-password" class="field" minlength="8" required /><p class="text-xs text-[#8b9099]">{$locale === 'hr' ? 'Upotrijebite najmanje 8 znakova.' : 'Use at least 8 characters.'}</p></div>
          <div class="space-y-2"><label class="field-label" for="recovery_password_confirm">{$locale === 'hr' ? 'Ponovite novu lozinku' : 'Confirm new password'}</label><input id="recovery_password_confirm" name="password_confirm" type="password" autocomplete="new-password" class="field" minlength="8" required /></div>
        </div>
        {#if errorMessage}<p role="alert" class="mt-5 rounded-md bg-[#fdecec] px-4 py-3 text-sm text-[#b42318]">{errorMessage}</p>{/if}
        <button class="btn btn-primary mt-6 w-full py-3.5 disabled:opacity-50 active:-translate-y-px" type="submit" disabled={submitting}>{submitting ? ($locale === 'hr' ? 'Spremam…' : 'Saving…') : ($locale === 'hr' ? 'Spremi novu lozinku' : 'Save new password')}</button>
      </form>
    </div>
  </div>
</section>
