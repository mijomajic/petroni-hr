<script lang="ts">
  import { page } from '$app/state';
  import FaqSection from '$lib/components/content/FaqSection.svelte';
  import { localizedText, type SitePageContent, type SitePageItem } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const content = $derived(data.pageContent as SitePageContent);
  const contactSection = $derived(content.sections.find((section) => section.type === 'contact' && section.visible));
  const faqSection = $derived(content.sections.find((section) => section.type === 'faq' && section.visible));
  const title = $derived(localizedText(content.title, $locale));
  const description = $derived(localizedText(content.seoDescription, $locale));
  const tx = (value: { hr: string; en: string } | undefined) => localizedText(value, $locale);
  const detail = (id: string): SitePageItem | undefined => contactSection?.items?.find((item) => item.id === id);
  const contactNote = $derived(detail('note'));
  const contactMap = $derived(detail('map'));

  const product = page.url.searchParams.get('product')?.trim() ?? '';
  const productPath = page.url.searchParams.get('path')?.trim() ?? '';
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let topic = $state(product ? 'Shop' : 'Prodaja');
  let message = $state(product ? `Zanima me dostupnost proizvoda: ${product}` : '');
  let agree = $state(false);
  let sent = $state(false);
  let loading = $state(false);
  let submitError = $state('');
  let website = $state('');

  async function handleSubmit() {
    submitError = '';
    if (!name.trim() || !email.trim() || !message.trim() || !agree) {
      submitError = $locale === 'hr' ? 'Ispunite obavezna polja i prihvatite Politiku privatnosti.' : 'Complete the required fields and accept the Privacy Policy.';
      return;
    }
    loading = true;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, topic, message, product, productPath, website })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);
      sent = true;
    } catch (submitFailure) {
      submitError = submitFailure instanceof Error && submitFailure.message
        ? submitFailure.message
        : ($locale === 'hr' ? 'Poruku trenutno nije moguće poslati.' : 'The message could not be sent.');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

{#if contactSection}
  <section class="section">
    <div class="container-x">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h1 class="mb-3 text-[30px] font-bold text-[#2b2b2b]">{tx(contactSection.title)}</h1>
          <p class="mb-8 text-[14px] text-[#7a7f86]">{tx(contactSection.body)}</p>

          {#if sent}
            <div class="card p-8 text-center"><div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7e0]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><h2 class="mb-1 text-lg font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Poruka je poslana' : 'Message sent'}</h2><p class="text-sm text-[#7a7f86]">{$locale === 'hr' ? 'Javit ćemo Vam se što je prije moguće.' : 'We will get back to you as soon as possible.'}</p></div>
          {:else}
            <div class="space-y-5">
              {#if product}<div class="rounded-xl border border-[#eadfba] bg-[#fffaf0] p-4"><p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9a7600]">{$locale === 'hr' ? 'Upit za proizvod' : 'Product inquiry'}</p><p class="mt-1 text-sm font-semibold text-[#2b2b2b]">{product}</p></div>{/if}
              <div><label class="field-label" for="contact_name">{$locale === 'hr' ? 'Ime i prezime' : 'Full name'} *</label><input id="contact_name" class="field" required bind:value={name} /></div>
              <div><label class="field-label" for="contact_email">Email *</label><input id="contact_email" type="email" class="field" required bind:value={email} /></div>
              <div><label class="field-label" for="contact_phone">{$locale === 'hr' ? 'Broj telefona' : 'Phone number'}</label><input id="contact_phone" type="tel" class="field" bind:value={phone} /></div>
              <div><label class="field-label" for="contact_topic">{$locale === 'hr' ? 'Tema' : 'Topic'} *</label><select id="contact_topic" class="field" bind:value={topic}><option>{$locale === 'hr' ? 'Prodaja' : 'Sales'}</option><option>{$locale === 'hr' ? 'Najam' : 'Rental'}</option><option>Shop</option><option>{$locale === 'hr' ? 'Ostalo' : 'Other'}</option></select></div>
              <div><label class="field-label" for="contact_message">{$locale === 'hr' ? 'Poruka' : 'Message'} *</label><textarea id="contact_message" rows="5" class="field resize-none" required bind:value={message}></textarea></div>
              <div class="hidden" aria-hidden="true"><label for="contact_website">Website</label><input id="contact_website" tabindex="-1" autocomplete="off" bind:value={website} /></div>
              <label class="flex items-start gap-2 text-[13px] text-[#7a7f86]"><input type="checkbox" class="mt-1 accent-[#f5c518]" bind:checked={agree} /><span>{$locale === 'hr' ? 'Prihvaćam i slažem se s' : 'I accept and agree to the'} <a href="/privatnost" class="font-semibold text-[#b5890a]">{$locale === 'hr' ? 'uvjetima poslovanja & Politikom privatnosti' : 'terms of business & Privacy Policy'}</a></span></label>
              {#if submitError}<p role="alert" class="rounded-lg border border-[#f2b8b5] bg-[#fff6f5] p-3 text-sm text-[#9f1f18]">{submitError}</p>{/if}
              <button type="button" onclick={handleSubmit} disabled={loading} class="btn btn-primary px-8 py-3.5 disabled:opacity-50 active:-translate-y-px">{loading ? ($locale === 'hr' ? 'Šaljem…' : 'Sending…') : ($locale === 'hr' ? 'Pošalji' : 'Send')}</button>
            </div>
          {/if}
        </div>

        <div>
          <div class="mb-6 space-y-3 text-[14px]">
            {#each ['address', 'phone', 'email'] as id}
              {@const item = detail(id)}
              {#if item}<p><span class="font-bold text-[#2b2b2b]">{tx(item.title)}:</span> {#if item.href}<a href={item.href} class="text-[#6b7178] hover:text-[#b5890a]">{tx(item.body)}</a>{:else}<span class="text-[#6b7178]">{tx(item.body)}</span>{/if}</p>{/if}
            {/each}
            {#if contactNote}<p class="text-[13px] leading-relaxed text-[#8b9099]"><span class="font-bold uppercase text-[#2b2b2b]">{tx(contactNote.title)}:</span> {tx(contactNote.body)}</p>{/if}
          </div>
          {#if contactMap}<div class="card card-static p-6"><p class="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#b5890a]">{tx(contactMap.title)}</p><p class="mb-5 whitespace-pre-line text-[14px] leading-relaxed text-[#6b7178]">{tx(contactMap.body)}</p>{#if contactMap.href}<a href={contactMap.href} target="_blank" rel="noopener noreferrer" class="btn btn-outline px-5 py-3">{$locale === 'hr' ? 'Otvori u Google Maps' : 'Open in Google Maps'}</a>{/if}</div>{/if}
        </div>
      </div>
    </div>
  </section>
{/if}

{#if faqSection}<FaqSection section={faqSection} />{/if}
