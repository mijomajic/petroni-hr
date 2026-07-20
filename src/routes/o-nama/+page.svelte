<script lang="ts">
  import AboutPageContent from '$lib/components/content/AboutPageContent.svelte';
  import { localizedText, type SitePageContent } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const content = $derived(data.pageContent as SitePageContent);
  const title = $derived(localizedText(content.title, $locale));
  const description = $derived(localizedText(content.seoDescription, $locale));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<AboutPageContent {content} />
