<script lang="ts">
  import LegalDocumentPage from '$lib/components/legal/LegalDocumentPage.svelte';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<LegalDocumentPage document={data.document} eyebrow="Shop" />

<div class="container-x mx-auto max-w-4xl pb-20 text-center">
  <a class="btn btn-primary px-6 py-3" href="https://xcdwougdkczypzkcsobg.supabase.co/storage/v1/object/public/petroni-assets/documents/2024/02/POVRAT-ROBE-PETRONI.pdf" target="_blank" rel="noreferrer">
    {$locale === 'hr' ? 'Preuzmite obrazac za povrat robe' : 'Download the return form'}
  </a>
</div>
