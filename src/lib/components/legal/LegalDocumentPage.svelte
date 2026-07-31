<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import { renderTermsMarkup } from '$lib/terms-markup';
  import type { LegalDocumentVersion } from '$lib/legal-documents';

  let { document, eyebrow = 'Petroni' }: { document: LegalDocumentVersion; eyebrow?: string } = $props();
  const title = $derived($locale === 'hr' ? document.title_hr : document.title_en);
  const summary = $derived($locale === 'hr' ? document.summary_hr : document.summary_en);
  const content = $derived($locale === 'hr' ? document.content_hr : document.content_en);
  const formattedDate = $derived(new Intl.DateTimeFormat($locale === 'hr' ? 'hr-HR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(`${document.effective_date}T12:00:00Z`)));
</script>

<svelte:head>
  <title>{title} — Petroni</title>
  <meta name="description" content={summary} />
  <meta property="og:title" content={`${title} — Petroni`} />
  <meta property="og:description" content={summary} />
</svelte:head>

<div class="section legal-page">
  <div class="container-x mx-auto max-w-4xl">
    <span class="eyebrow mb-3">{eyebrow}</span>
    <h1 class="section-title mb-4">{title}</h1>
    {#if summary}<p class="lead mb-4">{summary}</p>{/if}
    <p class="mb-10 text-[12px] leading-relaxed text-[#8b9099]">
      {$locale === 'hr' ? 'Verzija' : 'Version'} {document.version_label}
      · {$locale === 'hr' ? 'primjenjuje se od' : 'effective from'} {formattedDate}
    </p>
    {#if document.uses_fallback}
      <div class="mb-8 rounded-xl border border-[#f0d87a] bg-[#fffaf0] p-4 text-sm leading-6 text-[#6f5600]">
        {$locale === 'hr'
          ? 'Prikazana je tehnička početna verzija. Konačni tekst i pravnu ocjenu potvrđuju Petroni i pravni savjetnik.'
          : 'This is the technical baseline version. Petroni and its legal adviser remain responsible for final wording and legal review.'}
      </div>
    {/if}
    <article class="legal-document rounded-2xl border border-[#e7e8eb] bg-white p-6 md:p-9">
      {@html renderTermsMarkup(content)}
    </article>
  </div>
</div>

<style>
  :global(.legal-document h2) { margin: 1.8rem 0 .75rem; color: #2b2b2b; font-size: 1.15rem; font-weight: 900; line-height: 1.3; text-transform: uppercase; }
  :global(.legal-document h2:first-child) { margin-top: 0; }
  :global(.legal-document h3) { margin: 1.4rem 0 .55rem; color: #2b2b2b; font-size: 1rem; font-weight: 800; }
  :global(.legal-document p) { margin: 0 0 .85rem; color: #62676e; font-size: .875rem; line-height: 1.8; }
  :global(.legal-document ul), :global(.legal-document ol) { margin: .35rem 0 1rem 1.3rem; color: #62676e; font-size: .875rem; line-height: 1.75; }
  :global(.legal-document li) { margin: .35rem 0; padding-left: .2rem; }
  :global(.legal-document strong) { color: #3d4248; }
</style>
