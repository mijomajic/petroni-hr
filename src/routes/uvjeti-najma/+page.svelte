<script lang="ts">
  import { locale } from '$lib/stores/locale';
</script>

<svelte:head>
  <title>Uvjeti najma — Petroni</title>
  <meta name="description" content="Informacije o Petroni uvjetima najma kampera i prikazu punih uvjeta tijekom procesa online rezervacije." />
  <meta property="og:title" content="Uvjeti najma — Petroni" />
  <meta property="og:description" content="Informacije o Petroni uvjetima najma kampera i prikazu punih uvjeta tijekom procesa online rezervacije." />
</svelte:head>

<div class="section">
  <div class="container-x max-w-2xl mx-auto text-center">
    <span class="eyebrow mb-3">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</span>
    <h1 class="section-title mb-5">{$locale === 'hr' ? 'Uvjeti najma' : 'Rental terms'}</h1>
    <p class="lead">
      {$locale === 'hr'
        ? 'Potpuni uvjeti najma prikazuju se gostu tijekom procesa rezervacije. Nakon slanja zahtjeva za rezervaciju, prihvaćena verzija uvjeta šalje se i e-mailom.'
        : 'The full rental terms are shown to guests during the booking process. After the booking request is sent, the accepted terms version is also sent by email.'}
    </p>
    <a href="/rezerviraj" class="btn btn-primary mt-8">
      {$locale === 'hr' ? 'Pokreni rezervaciju' : 'Start booking'}
    </a>
  </div>
</div>
