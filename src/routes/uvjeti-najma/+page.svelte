<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const sections = $derived($locale === 'hr' ? [
    { title: 'Uvjeti za vozača', body: 'Vozač mora imati najmanje 21 godinu i posjedovati važeću vozačku dozvolu B kategorije izdanu prije najmanje 2 godine. Za vozila veće nosivosti može biti potrebna viša minimalna starost ili dodatno radno iskustvo s vozačkom dozvolom.' },
    { title: 'Polog (kaucija)', body: 'Prilikom preuzimanja vozila naplaćuje se povratni polog koji ovisi o odabranom vozilu. Polog se vraća nakon povrata vozila, umanjen za eventualnu štetu, gorivo ili druge troškove sukladno ugovoru o najmu.' },
    { title: 'Politika goriva', body: 'Vozilo se preuzima i vraća s istom razinom goriva. Ako vozilo nije vraćeno s punim spremnikom, razlika u gorivu i trošak punjenja naplaćuju se prema važećem cjeniku.' },
    { title: 'Otkazivanje rezervacije', body: 'Besplatno otkazivanje moguće je do 30 dana prije preuzimanja vozila. Otkazivanje unutar 30 dana podliježe naknadi sukladno uvjetima otkazivanja navedenim u ugovoru o najmu.' },
    { title: 'Osiguranje', body: 'Sva vozila uključuju osnovno kasko osiguranje s vlastitim udjelom u eventualnoj šteti. Dodatno osiguranje s nižim ili nultim udjelom moguće je ugovoriti uz nadoplatu prilikom rezervacije.' },
    { title: 'Kilometraža', body: 'Najam uključuje ugovorenu dnevnu kilometražu. Prekoračenje dogovorene kilometraže naplaćuje se po kilometru sukladno važećem cjeniku, a obračunava se prilikom povrata vozila.' },
  ] : [
    { title: 'Driver requirements', body: 'The driver must be at least 21 years old and hold a valid category B driving licence issued at least 2 years ago. Larger vehicles may require a higher minimum age or additional driving experience.' },
    { title: 'Deposit', body: 'A refundable deposit is charged at vehicle pickup, depending on the selected vehicle. The deposit is refunded after the vehicle is returned, minus any damage, fuel or other costs as set out in the rental agreement.' },
    { title: 'Fuel policy', body: 'The vehicle is collected and returned with the same fuel level. If the vehicle is not returned with a full tank, the fuel difference and refuelling fee are charged according to the current price list.' },
    { title: 'Cancellation', body: 'Free cancellation is possible up to 30 days before pickup. Cancellation within 30 days is subject to a fee in accordance with the cancellation terms stated in the rental agreement.' },
    { title: 'Insurance', body: 'All vehicles include basic collision insurance with an excess in case of damage. Additional insurance with a lower or zero excess can be arranged for an extra fee when booking.' },
    { title: 'Mileage', body: 'The rental includes the agreed daily mileage allowance. Exceeding the agreed mileage is charged per kilometre according to the current price list, calculated upon vehicle return.' },
  ]);
</script>

<svelte:head><title>Uvjeti najma — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    <span class="eyebrow mb-3">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</span>
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Uvjeti najma' : 'Rental terms'}</h1>

    <div class="space-y-8">
      {#each sections as s}
        <div>
          <h2 class="text-[18px] font-bold text-[#2b2b2b] mb-2">{s.title}</h2>
          <p class="text-[14px] leading-relaxed text-[#6b7178]">{s.body}</p>
        </div>
      {/each}
    </div>

    <div class="card p-6 mt-10">
      <p class="text-[13px] text-[#7a7f86]">{$locale === 'hr' ? 'Za dodatna pitanja o uvjetima najma slobodno nas kontaktirajte.' : 'For further questions about the rental terms, feel free to contact us.'}</p>
      <a href="/kontakt" class="inline-block mt-3 text-sm font-semibold" style="color:#b5890a">{$locale === 'hr' ? 'Kontaktirajte nas →' : 'Contact us →'}</a>
    </div>
  </div>
</div>
