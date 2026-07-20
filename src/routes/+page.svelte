<script lang="ts">
  import HomePageContent from '$lib/components/content/HomePageContent.svelte';
  import { localizedText, type SitePageContent } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';
  import type { Vehicle } from '$lib/supabase';
  import { DEFAULT_IMAGE, graphSchema, jsonLd, organizationSchema, websiteSchema } from '$lib/seo';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const content = $derived(data.pageContent as SitePageContent);
  const rentalVehicles = $derived(data.rentalVehicles as Vehicle[]);
  const saleVehicles = $derived(data.saleVehicles as Vehicle[]);
  const title = $derived(localizedText(content.title, $locale));
  const description = $derived(localizedText(content.seoDescription, $locale));
  const homeSchema = graphSchema([organizationSchema(), websiteSchema()]);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={DEFAULT_IMAGE} />
  {@html `<script type="application/ld+json">${jsonLd(homeSchema)}</script>`}
</svelte:head>

<HomePageContent {content} {rentalVehicles} {saleVehicles} />
