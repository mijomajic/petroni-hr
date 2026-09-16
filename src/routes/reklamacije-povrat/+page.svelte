<script lang="ts">
  import LegalDocumentPage from '$lib/components/legal/LegalDocumentPage.svelte';
  import { locale } from '$lib/stores/locale';
  import { BUSINESS } from '$lib/config/business';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<LegalDocumentPage document={data.document} eyebrow="Shop" />

<div class="container-x mx-auto max-w-4xl pb-20 text-center">
  <a class="btn btn-primary px-6 py-3" href={`mailto:${BUSINESS.email}?subject=Product%20return`}>
    {$locale === 'hr' ? 'Zatražite upute za povrat' : 'Request return instructions'}
  </a>
</div>
