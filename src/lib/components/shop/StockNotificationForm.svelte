<script lang="ts">
  import { locale } from '$lib/stores/locale';

  type Props = {
    productId: string;
    expanded?: boolean;
    compact?: boolean;
  };

  let { productId, expanded = false, compact = false }: Props = $props();
  let open = $state(false);
  let email = $state('');
  let website = $state('');
  let loading = $state(false);
  let message = $state('');
  let success = $state(false);

  $effect(() => {
    if (expanded) open = true;
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    message = '';
    success = false;
    try {
      const response = await fetch('/api/shop/stock-notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId, email, locale: $locale, website })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        message = payload.error || ($locale === 'hr' ? 'Prijavu nije moguće spremiti.' : 'The alert could not be saved.');
        return;
      }
      success = true;
      message = $locale === 'hr'
        ? 'Prijava je spremljena. Poslat ćemo vam jednu poruku kada proizvod ponovno bude dostupan.'
        : 'Your alert is saved. We will send one email when the product is available again.';
      email = '';
    } catch {
      message = $locale === 'hr'
        ? 'Prijavu trenutačno nije moguće spremiti. Pokušajte ponovno.'
        : 'The alert could not be saved right now. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

{#if !open}
  <button
    type="button"
    onclick={() => open = true}
    class="btn mt-auto min-h-11 w-full border border-[#2b2b2b] bg-white px-2 py-2.5 text-[10px] tracking-[0.025em] text-[#2b2b2b] transition hover:bg-[#2b2b2b] hover:text-white active:translate-y-px"
  >
    {compact
      ? ($locale === 'hr' ? 'Obavijesti me' : 'Notify me')
      : ($locale === 'hr' ? 'Obavijesti me o dostupnosti' : 'Notify me when available')}
  </button>
{:else if success}
  <div class="rounded-md border border-[#bddcc8] bg-[#f1faf4] px-3 py-3 text-left text-xs leading-relaxed text-[#176b37]" aria-live="polite">
    {message}
  </div>
{:else}
  <form onsubmit={submit} class={compact ? 'mt-auto text-left' : 'rounded-xl border border-[#e2e4e8] bg-[#fafbfc] p-5'}>
    {#if !compact}
      <p class="mb-1 text-sm font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Obavijest o dostupnosti' : 'Back-in-stock alert'}</p>
      <p class="mb-4 text-xs leading-relaxed text-[#6b7178]">{$locale === 'hr' ? 'Ostavite email i javit ćemo vam kada proizvod ponovno dođe na zalihu.' : 'Leave your email and we will let you know when this product is back in stock.'}</p>
    {/if}
    <label>
      <span class={compact ? 'sr-only' : 'field-label'}>{$locale === 'hr' ? 'Email adresa' : 'Email address'}</span>
      <input
        type="email"
        autocomplete="email"
        required
        bind:value={email}
        class="field text-[13px]"
        placeholder={$locale === 'hr' ? 'ime@primjer.hr' : 'name@example.com'}
      />
    </label>
    <label class="hidden">Website<input tabindex="-1" autocomplete="off" bind:value={website} /></label>
    <button disabled={loading} class="btn btn-primary mt-2.5 w-full py-2.5 text-[11px] text-[#25282c] disabled:opacity-50 active:translate-y-px">
      {loading ? ($locale === 'hr' ? 'Spremam…' : 'Saving…') : ($locale === 'hr' ? 'Obavijesti me' : 'Notify me')}
    </button>
    {#if compact}
      <button type="button" onclick={() => { open = false; message = ''; }} class="mt-2 w-full text-center text-[10px] font-semibold text-[#7a7f86] hover:text-[#2b2b2b]">
        {$locale === 'hr' ? 'Odustani' : 'Cancel'}
      </button>
    {/if}
    {#if message}<p class="mt-2 text-xs leading-relaxed text-[#9f1f18]" aria-live="polite">{message}</p>{/if}
    <p class="mt-2 text-[10px] leading-relaxed text-[#8b9099]">
      {$locale === 'hr' ? 'Email koristimo samo za ovu obavijest.' : 'We use your email only for this alert.'}
      <a href="/privatnost" class="ml-1 underline hover:text-[#2b2b2b]">{$locale === 'hr' ? 'Privatnost' : 'Privacy'}</a>
    </p>
  </form>
{/if}
