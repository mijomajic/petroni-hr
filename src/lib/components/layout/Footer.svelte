<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import { BUSINESS } from '$lib/config/business';

  const year = new Date().getFullYear();

  const links = $derived($locale === 'hr'
    ? [
        { href: '/privatnost', label: 'Privatnost' },
        { href: '/kolacici', label: 'Kolačići' },
        { href: '/uvjeti-poslovanja', label: 'Uvjeti poslovanja' },
        { href: '/placanje-dostava', label: 'Plaćanje & Dostava' },
        { href: '/reklamacije-povrat', label: 'Reklamacije & Povrat' },
        { href: '/faq', label: 'FAQ' },
        { href: '/kontakt', label: 'Kontakt' }
      ]
    : [
        { href: '/privatnost', label: 'Privacy' },
        { href: '/kolacici', label: 'Cookies' },
        { href: '/uvjeti-poslovanja', label: 'Terms of Business' },
        { href: '/placanje-dostava', label: 'Payment & Shipping' },
        { href: '/reklamacije-povrat', label: 'Complaints & Returns' },
        { href: '/faq', label: 'FAQ' },
        { href: '/kontakt', label: 'Contact' }
      ]);
</script>

<footer style="background:#1f3a32">
  <div class="container-x py-12 flex flex-col items-center gap-6 text-center">
    <!-- Links -->
    <nav class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px]">
      {#each links as link, i}
        <a href={link.href} class="transition-colors duration-200 hover:text-[#c87442]" style="color:#cfd2d6">{link.label}</a>
        {#if i < links.length - 1}
          <span style="color:#5a5d61">|</span>
        {/if}
      {/each}
    </nav>

    <!-- Copyright -->
    <p class="text-[12px]" style="color:#b9c3bd">{BUSINESS.legalName} © {year} – {$locale === 'hr' ? 'Sva prava pridržana' : 'All rights reserved'}</p>
  </div>
</footer>
