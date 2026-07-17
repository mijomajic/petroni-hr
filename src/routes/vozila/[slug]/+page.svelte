<script lang="ts">
  import VehicleDetail from '../najam-kampera/[slug]/+page.svelte';
  import type { PageProps } from './$types';

  let { data, params, form }: PageProps = $props();
</script>

<VehicleDetail {data} {params} {form} />
