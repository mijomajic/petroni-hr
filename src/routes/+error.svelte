<script lang="ts">
  import { page } from '$app/stores';
  import { locale } from '$lib/stores/locale';

  const status = $derived($page.status);
  const heading = $derived(status === 404
    ? ($locale === 'hr' ? 'Stranica nije pronađena' : 'Page not found')
    : ($locale === 'hr' ? 'Dogodila se pogreška' : 'Something went wrong'));
  const sub = $derived(status === 404
    ? ($locale === 'hr' ? 'Stranica koju tražite ne postoji ili je premještena.' : 'The page you are looking for does not exist or has been moved.')
    : ($locale === 'hr' ? 'Molimo pokušajte ponovno ili se vratite na naslovnicu.' : 'Please try again or return to the homepage.'));
</script>

<svelte:head><title>{status} — Petroni</title></svelte:head>

<div class="section flex items-center justify-center" style="min-height:60vh">
  <div class="container-x text-center max-w-lg mx-auto">
    <p class="text-[64px] font-extrabold mb-2" style="color:#f5c518">{status}</p>
    <h1 class="text-[26px] font-bold text-[#2b2b2b] mb-3">{heading}</h1>
    <p class="text-[14px] text-[#6b7178] mb-8">{sub}</p>
    <a href="/" class="btn btn-primary px-8 py-3.5 inline-block">{$locale === 'hr' ? 'Povratak na naslovnicu' : 'Back to homepage'}</a>
  </div>
</div>
