<script lang="ts">
  import { locale } from '$lib/stores/locale';
</script>

<svelte:head><title>Rezervacija potvrđena — Petroni</title></svelte:head>

<div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
  <div class="text-center max-w-lg">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style="background:#fff7e0;border:2px solid #fbe7a1">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1 class="text-3xl md:text-4xl font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Rezervacija potvrđena!' : 'Booking confirmed!'}</h1>
    <p class="text-[15px] leading-relaxed text-[#6b7178] mb-10">
      {$locale === 'hr' ? 'Vaša rezervacija je uspješno primljena. Detalji su poslani na Vašu e-mail adresu. Javit ćemo Vam se u roku od 24 sata.' : 'Your booking has been received. Details were sent to your email. We will contact you within 24 hours.'}
    </p>
    <a href="/" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Povratak na početnu' : 'Back to home'}</a>
  </div>
</div>
