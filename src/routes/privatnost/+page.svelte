<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const sections = $derived($locale === 'hr' ? [
    { title: 'Prikupljanje podataka', body: 'Petroni d.o.o. prikuplja osobne podatke (ime, e-mail, telefon, adresu) isključivo u svrhu obrade rezervacija, narudžbi i komunikacije s korisnicima. Podaci se ne ustupaju trećim stranama osim partnera neophodnih za izvršenje usluge (npr. dostavne službe, platni procesori).' },
    { title: 'Korištenje podataka', body: 'Prikupljeni podaci koriste se za obradu narudžbi i rezervacija, slanje obavijesti o statusu, te, uz Vašu suglasnost, za marketinšku komunikaciju. Podaci se čuvaju u skladu s važećim zakonskim propisima o zaštiti osobnih podataka (GDPR).' },
    { title: 'Kolačići (cookies)', body: 'Stranica koristi kolačiće radi poboljšanja korisničkog iskustva i analize prometa. Korištenjem stranice pristajete na uporabu kolačića sukladno ovoj politici.' },
    { title: 'Prava korisnika', body: 'Imate pravo zatražiti uvid, ispravak ili brisanje svojih osobnih podataka u svakom trenutku slanjem zahtjeva na info@petroni.hr.' },
    { title: 'Uvjeti poslovanja', body: 'Korištenjem ove web stranice i naših usluga (najam vozila i online shop) prihvaćate ove uvjete poslovanja. Sve cijene iskazane su u eurima (€) i uključuju PDV, osim ako nije drugačije navedeno. Petroni d.o.o. pridržava pravo izmjene cijena i uvjeta bez prethodne najave.' },
    { title: 'Rješavanje sporova', body: 'Eventualne sporove strane će pokušati riješiti mirnim putem. Ako to nije moguće, nadležan je sud prema sjedištu tvrtke Petroni d.o.o.' },
  ] : [
    { title: 'Data collection', body: 'Petroni d.o.o. collects personal data (name, email, phone, address) solely for the purpose of processing bookings, orders and customer communication. Data is not shared with third parties except partners necessary to fulfil the service (e.g. delivery providers, payment processors).' },
    { title: 'Use of data', body: 'Collected data is used to process orders and bookings, send status notifications, and, with your consent, for marketing communication. Data is stored in accordance with applicable personal data protection laws (GDPR).' },
    { title: 'Cookies', body: 'This website uses cookies to improve user experience and analyse traffic. By using the website you agree to the use of cookies in accordance with this policy.' },
    { title: 'User rights', body: 'You have the right to request access to, correction of, or deletion of your personal data at any time by sending a request to info@petroni.hr.' },
    { title: 'Terms of business', body: 'By using this website and our services (vehicle rental and online shop) you accept these terms of business. All prices are stated in euros (€) and include VAT unless stated otherwise. Petroni d.o.o. reserves the right to change prices and terms without prior notice.' },
    { title: 'Dispute resolution', body: 'Any disputes will be resolved amicably whenever possible. If this is not possible, the court with jurisdiction over the registered seat of Petroni d.o.o. shall apply.' },
  ]);
</script>

<svelte:head>
  <title>Privatnost & Uvjeti poslovanja — Petroni</title>
  <meta name="description" content="Petroni informacije o privatnosti, obradi osobnih podataka, kolačićima, pravima korisnika i uvjetima poslovanja." />
  <meta property="og:title" content="Privatnost & Uvjeti poslovanja — Petroni" />
  <meta property="og:description" content="Petroni informacije o privatnosti, obradi osobnih podataka, kolačićima, pravima korisnika i uvjetima poslovanja." />
</svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    <span class="eyebrow mb-3">{$locale === 'hr' ? 'Pravne informacije' : 'Legal information'}</span>
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Privatnost & Uvjeti poslovanja' : 'Privacy & Terms of business'}</h1>

    <div class="space-y-8">
      {#each sections as s}
        <div>
          <h2 class="text-[18px] font-bold text-[#2b2b2b] mb-2">{s.title}</h2>
          <p class="text-[14px] leading-relaxed text-[#6b7178]">{s.body}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
