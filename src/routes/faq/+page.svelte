<script lang="ts">
  import FaqSection from '$lib/components/content/FaqSection.svelte';
  import { localizedText, type SitePageContent } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';
  import { breadcrumbSchema, graphSchema, jsonLd } from '$lib/seo';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const content = $derived(data.pageContent as SitePageContent);
  const section = $derived(content.sections.find((item) => item.type === 'faq' && item.visible));
  const title = $derived(localizedText(content.title, $locale));
  const description = $derived(localizedText(content.seoDescription, $locale));
  const faqSchema = $derived(graphSchema([
    breadcrumbSchema([{ name: 'Petroni', path: '/' }, { name: 'FAQ', path: '/faq' }]),
    {
      '@type': 'FAQPage',
      mainEntity: (section?.items ?? []).map((item) => ({
        '@type': 'Question',
        name: localizedText(item.title, 'hr'),
        acceptedAnswer: { '@type': 'Answer', text: localizedText(item.body, 'hr') }
      }))
    }
  ]));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {@html `<script type="application/ld+json">${jsonLd(faqSchema)}</script>`}
</svelte:head>

{#if section}<FaqSection {section} primaryHeading />{/if}
