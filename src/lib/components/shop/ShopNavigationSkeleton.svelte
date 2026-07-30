<script lang="ts">
  import { locale } from '$lib/stores/locale';
</script>

<div class="shop-navigation-skeleton" aria-hidden="true">
  <section class="shop-skeleton-hero">
    <img src="/images/vehicles/knaus-boxdrive-680me/01-man-1.webp" alt="" width="1440" height="1080" class="shop-skeleton-hero__image" />
    <div class="shop-skeleton-hero__overlay"></div>
    <div class="container-x shop-skeleton-hero__content">
      <span class="shop-skeleton-eyebrow">{$locale === 'hr' ? 'Kamping oprema' : 'Camping equipment'}</span>
      <h1>Shop</h1>
      <p>{$locale === 'hr' ? 'Sve što trebate za savršeno kamping iskustvo' : 'Everything you need for the perfect camping experience'}</p>
    </div>
  </section>

  <div class="shop-skeleton-info"><div class="container-x shop-skeleton-info__items">
    <span>✓ {$locale === 'hr' ? 'Dostava unutar EU' : 'Delivery across EU'}</span>
    <span>✓ {$locale === 'hr' ? 'Sigurno plaćanje' : 'Secure payment'}</span>
    <span>✓ {$locale === 'hr' ? 'Povrat u 14 dana' : '14-day returns'}</span>
  </div></div>

  <div class="shop-skeleton-content"><div class="container-x">
    <div class="shop-skeleton-results">
      <span class="shimmer shop-skeleton-count"></span>
      <span class="shop-skeleton-select">{$locale === 'hr' ? 'Zadano sortiranje' : 'Default sorting'} <b>⌄</b></span>
    </div>

    <section class="shop-skeleton-brands">
      <p>{$locale === 'hr' ? 'Istaknuti brendovi' : 'Featured brands'}</p>
      <div class="shop-skeleton-brand-list">
        {#each Array(6) as _}<span class="shimmer shop-skeleton-brand"></span>{/each}
      </div>
    </section>

    <div class="shop-skeleton-layout">
      <div class="shop-skeleton-grid">
        {#each Array(12) as _}
          <article class="shop-skeleton-product">
            <div class="shimmer shop-skeleton-product__image"></div>
            <div class="shimmer shop-skeleton-product__line"></div>
            <div class="shimmer shop-skeleton-product__line shop-skeleton-product__line--short"></div>
            <div class="shimmer shop-skeleton-product__button"></div>
          </article>
        {/each}
      </div>

      <aside class="shop-skeleton-sidebar">
        <section class="shop-skeleton-panel">
          <p>{$locale === 'hr' ? 'Dostava' : 'Shipping'}</p>
          <span>{$locale === 'hr' ? 'Dostava samo unutar EU.' : 'Delivery within EU only.'}</span>
          <span>{$locale === 'hr' ? 'Dostava izvan HR: na upit.' : 'Delivery outside HR: on request.'}</span>
          <span>{$locale === 'hr' ? 'Cijena dostave samo za HR.' : 'Shipping price for HR only.'}</span>
        </section>
        <section class="shop-skeleton-panel">
          <p>{$locale === 'hr' ? 'Pretraži' : 'Search'}</p>
          <div class="shop-skeleton-input"></div><div class="shop-skeleton-search-button">{$locale === 'hr' ? 'Pretraži' : 'Search'}</div>
        </section>
        <section class="shop-skeleton-panel">
          <p>{$locale === 'hr' ? 'Kategorije' : 'Categories'}</p>
          {#each Array(7) as _}<div class="shimmer shop-skeleton-category"></div>{/each}
        </section>
      </aside>
    </div>
  </div></div>
</div>

<style>
  .shop-navigation-skeleton { position: fixed; z-index: 40; top: 72px; right: 0; bottom: 0; left: 0; overflow: hidden auto; background: #fff; pointer-events: none; }
  .shop-skeleton-hero { position: relative; display: flex; height: 220px; align-items: center; overflow: hidden; }
  .shop-skeleton-hero__image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .shop-skeleton-hero__overlay { position: absolute; inset: 0; background: linear-gradient(to right,rgba(0,0,0,.82),rgba(0,0,0,.55) 50%,rgba(0,0,0,.18)); }
  .shop-skeleton-hero__content { position: relative; z-index: 1; }
  .shop-skeleton-eyebrow, .shop-skeleton-hero h1, .shop-skeleton-hero p { display: block; margin: 0; }
  .shop-skeleton-eyebrow { margin-bottom: .75rem; color: #f5c518; font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
  .shop-skeleton-hero h1 { color: #fff; font-size: 32px; font-weight: 800; letter-spacing: -.025em; line-height: 1; text-transform: uppercase; text-shadow: 0 2px 20px rgba(0,0,0,.8); }
  .shop-skeleton-hero p { margin-top: .5rem; color: rgba(255,255,255,.82); font-size: 14px; }
  .shop-skeleton-info { border-bottom: 1px solid #ededf0; background: #fafbfc; }
  .shop-skeleton-info__items { display: flex; flex-wrap: wrap; gap: 1.5rem; padding-top: 1rem; padding-bottom: 1rem; color: #6b7178; font-size: 12px; }
  .shop-skeleton-info__items span::first-letter { color: #16a34a; }
  .shop-skeleton-content { padding-top: 2rem; padding-bottom: 4.5rem; }
  .shop-skeleton-results { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
  .shop-skeleton-count { display: block; width: 148px; height: 14px; border-radius: 3px; }
  .shop-skeleton-select { display: flex; align-items: center; justify-content: space-between; width: min(220px,100%); height: 42px; padding: 0 .85rem; border: 1px solid #e2e4e8; border-radius: 6px; color: #9aa0a8; font-size: 13px; }
  .shop-skeleton-brands { margin-bottom: 2rem; padding: 1.25rem 0; border-top: 1px solid #e7e8eb; border-bottom: 1px solid #e7e8eb; }
  .shop-skeleton-brands p, .shop-skeleton-panel p { margin: 0 0 .75rem; color: #b5890a; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
  .shop-skeleton-brands p { color: #6b7178; }
  .shop-skeleton-brand-list { display: flex; gap: .5rem; overflow: hidden; }
  .shop-skeleton-brand { display: block; flex: 0 0 98px; height: 38px; border-radius: 6px; }
  .shop-skeleton-layout { display: flex; flex-direction: column; gap: 2.5rem; }
  .shop-skeleton-grid { display: grid; flex: 1; grid-template-columns: repeat(1,minmax(0,1fr)); gap: 1.25rem; }
  .shop-skeleton-product { min-width: 0; padding: .75rem; border: 1px solid #ededf0; border-radius: 10px; background: #fff; }
  .shop-skeleton-product__image { aspect-ratio: 1; margin-bottom: .9rem; }
  .shop-skeleton-product__line { width: 85%; height: .72rem; margin-bottom: .55rem; border-radius: 3px; }
  .shop-skeleton-product__line--short { width: 42%; }
  .shop-skeleton-product__button { width: 100%; height: 38px; margin-top: 1rem; border-radius: 5px; }
  .shop-skeleton-sidebar { display: grid; gap: 1.25rem; }
  .shop-skeleton-panel { padding: 1.25rem; border: 1px solid #ededf0; border-radius: 10px; background: #fff; }
  .shop-skeleton-panel span { display: block; margin-top: .25rem; color: #a4a9af; font-size: 12px; line-height: 1.5; }
  .shop-skeleton-input { height: 40px; border: 1px solid #e2e4e8; border-radius: 6px; }
  .shop-skeleton-search-button { margin-top: .75rem; padding: .7rem; border-radius: 5px; background: #f5c518; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-align: center; text-transform: uppercase; }
  .shop-skeleton-category { height: 27px; margin-top: .35rem; border-radius: 3px; }
  .shimmer { background: linear-gradient(100deg,#f1f0ed 30%,#faf9f7 48%,#f1f0ed 66%); background-size: 220% 100%; animation: shimmer 1.1s ease-in-out infinite; }
  @keyframes shimmer { to { background-position: -220% 0; } }
  @media (min-width: 640px) { .shop-skeleton-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
  @media (min-width: 768px) { .shop-navigation-skeleton { top: 78px; } .shop-skeleton-hero { height: 280px; } .shop-skeleton-hero h1 { font-size: 46px; } .shop-skeleton-content { padding-top: 2.5rem; padding-bottom: 5.5rem; } .shop-skeleton-results { flex-direction: row; align-items: center; justify-content: space-between; } }
  @media (min-width: 1024px) { .shop-skeleton-layout { flex-direction: row; gap: 2.5rem; } .shop-skeleton-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } .shop-skeleton-sidebar { flex: 0 0 18rem; display: block; } .shop-skeleton-panel { margin-bottom: 1.25rem; } }
  @media (min-width: 1280px) { .shop-skeleton-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
  @media (prefers-reduced-motion: reduce) { .shimmer { animation: none; } }
</style>
