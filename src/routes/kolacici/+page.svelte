<script lang="ts">
  import LegalDocumentPage from '$lib/components/legal/LegalDocumentPage.svelte';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<LegalDocumentPage document={data.document} eyebrow="Petroni" />
