<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const hrSections = [
    {
      title: 'Povrat proizvoda',
      paragraphs: [
        'Ako niste potpuno zadovoljni kupljenim proizvodom, imate pravo na povrat u roku od 14 dana od primitka proizvoda. Imate pravo na povrat punog plaćenog iznosa, ne uključujući trošak dostave ako je naplaćen. Svi proizvodi koji se vraćaju moraju biti nekorišteni i neotvoreni u originalnom pakiranju.',
        'Molimo vas da nas kontaktirate putem info@petroni.hr kako biste zatražili povrat i dobili daljnje upute. U predmet e-maila potrebno je napisati „POVRAT PROIZVODA”. Po primitku i pregledu proizvoda izvršit ćemo povrat sredstava istom metodom plaćanja koja je korištena prilikom kupnje.'
      ]
    },
    {
      title: 'Napomene',
      items: [
        'Povrati i zamjene moraju biti unaprijed dogovoreni.',
        'Uz robu koja udovoljava uvjetima povrata obavezno priložite kopiju računa i broj računa (IBAN) za povrat sredstava.',
        'Povrat sredstava izvršava se u zakonskom roku od 14 dana, nakon što proizvod zaprimimo u skladištu.',
        'Kupac mora prikladno zaštititi proizvod u kartonskoj kutiji. Povrat ili zamjena neće biti uvaženi ako je do oštećenja došlo zbog neprimjerenog pakiranja.',
        'Robu je potrebno vratiti bez odgađanja, najkasnije 14 dana od jednostranog raskida ugovora.'
      ],
      paragraphs: ['Ako zamjena artikla nije moguća, zadržavamo pravo ponuditi zamjenski artikl iste ili veće vrijednosti ili, ako zamjena nije moguća, vratiti novac.']
    },
    {
      title: 'Oštećeni ili neispravni proizvodi',
      paragraphs: [
        'Ako ste primili oštećen ili neispravan proizvod, obavijestite nas što je prije moguće, po mogućnosti u roku od dva radna dana od primitka pošiljke, putem e-maila na info@petroni.hr.',
        'Radi brže i točne obrade reklamacije u e-mail priložite fotografije proizvoda, ambalaže, transportne kutije i vidljivog oštećenja te u predmet navedite „REKLAMACIJA”. Proizvod i originalnu ambalažu nemojte bacati dok se postupak reklamacije ne završi.',
        'Reklamacije se obrađuju nakon pregleda dostavljene dokumentacije i/ili vraćenog proizvoda. Ako se utvrdi da je oštećenje nastalo nakon isporuke, nepravilnim rukovanjem, korištenjem ili drugim postupanjem kupca, reklamacija se može odbiti.',
        'Rok od dva radna dana služi lakšem utvrđivanju mogućeg oštećenja u transportu i bržoj obradi zahtjeva te ne ograničava zakonska prava kupca.'
      ]
    }
  ];

  const enSections = [
    { title: 'Product returns', paragraphs: ['If you are not fully satisfied with a purchased product, you may return it within 14 days of receiving it. Returned products must be unused, unopened and in their original packaging.', 'Contact us at info@petroni.hr with the subject “PRODUCT RETURN” to request return instructions. After receiving and inspecting the product, we will refund the payment using the original payment method.'] },
    { title: 'Important notes', items: ['Returns and exchanges must be agreed in advance.', 'Include a copy of the invoice and an IBAN for a refund where applicable.', 'Refunds are issued within the statutory 14-day period after the product reaches our warehouse.', 'Pack the product suitably in a cardboard box to prevent transport damage.', 'Return the goods without delay and no later than 14 days after withdrawal.'] },
    { title: 'Damaged or defective products', paragraphs: ['Notify us at info@petroni.hr as soon as possible, preferably within two business days of delivery. Include photos of the product, packaging, shipping box and visible damage, with “COMPLAINT” as the email subject.', 'Do not discard the product or original packaging until the complaint process has concluded. The two-business-day period helps identify transit damage and does not limit statutory consumer rights.'] }
  ];

  const sections = $derived($locale === 'hr' ? hrSections : enSections);
</script>

<svelte:head>
  <title>Reklamacije i povrat | Petroni webshop</title>
  <meta name="description" content="Informacije o reklamacijama, povratu proizvoda i postupku zamjene za narudžbe iz Petroni webshopa." />
  <meta property="og:title" content="Reklamacije i povrat | Petroni webshop" />
  <meta property="og:description" content="Informacije o reklamacijama, povratu proizvoda i postupku zamjene za narudžbe iz Petroni webshopa." />
</svelte:head>

<div class="section">
  <div class="container-x mx-auto max-w-3xl">
    <span class="eyebrow mb-3">Shop</span>
    <h1 class="section-title mb-4">{$locale === 'hr' ? 'Reklamacije i povrat' : 'Complaints & returns'}</h1>
    <p class="mb-10 text-[14px] leading-relaxed text-[#6b7178]">{$locale === 'hr' ? 'Dobrodošli na Petroni webshop. Molimo vas da pažljivo pročitate uvjete povrata i reklamacija prije kupnje.' : 'Please read these return and complaint terms carefully before purchasing from the Petroni webshop.'}</p>

    <div class="space-y-8">
      {#each sections as section}
        <section>
          <h2 class="mb-3 text-[19px] font-bold text-[#2b2b2b]">{section.title}</h2>
          {#each section.paragraphs ?? [] as paragraph}<p class="mb-4 text-[14px] leading-relaxed text-[#6b7178]">{paragraph}</p>{/each}
          {#if section.items}
            <ul class="list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-[#6b7178]">{#each section.items as item}<li>{item}</li>{/each}</ul>
          {/if}
        </section>
      {/each}
    </div>

    <a class="btn btn-primary mt-10 px-6 py-3" href="https://xcdwougdkczypzkcsobg.supabase.co/storage/v1/object/public/petroni-assets/documents/2024/02/POVRAT-ROBE-PETRONI.pdf" target="_blank" rel="noreferrer">{$locale === 'hr' ? 'Preuzmite obrazac za povrat robe' : 'Download the return form'}</a>
  </div>
</div>
