<script lang="ts">
  import './layout.css';
  import { setupI18n } from '$lib/i18n';
  import { waitLocale } from 'svelte-i18n';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { onMount } from 'svelte';

  let { children } = $props();
  let ready = $state(false);

  setupI18n();

  onMount(async () => {
    await waitLocale();
    ready = true;
  });
</script>

<svelte:head>
  <link rel="icon" href="https://www.petroni.hr/wp-content/uploads/2024/03/cropped-Group-3-270x270.jpg" />
  <meta name="theme-color" content="#0a0a0a" />
</svelte:head>

{#if ready}
  <Header />
  <main>
    {@render children()}
  </main>
  <Footer />
{:else}
  <div class="fixed inset-0 flex items-center justify-center" style="background: #0a0a0a">
    <img src="https://www.petroni.hr/wp-content/uploads/2024/03/Logo-Petroni-Yellow-New.png" alt="Petroni" class="h-12 w-auto animate-pulse" />
  </div>
{/if}
