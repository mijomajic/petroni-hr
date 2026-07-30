<div class="shop-navigation-skeleton" aria-hidden="true">
  <div class="shop-navigation-skeleton__bar shimmer"></div>
  <div class="shop-navigation-skeleton__grid">
    {#each Array(8) as _}
      <div class="shop-navigation-skeleton__card">
        <div class="shop-navigation-skeleton__image shimmer"></div>
        <div class="shop-navigation-skeleton__line shimmer"></div>
        <div class="shop-navigation-skeleton__line shop-navigation-skeleton__line--short shimmer"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  .shop-navigation-skeleton { position: fixed; z-index: 55; top: .9rem; right: 1rem; width: min(18rem, calc(100vw - 2rem)); overflow: hidden; border: 1px solid #ecebe7; border-radius: .55rem; background: rgba(255,255,255,.96); padding: .8rem; box-shadow: 0 8px 24px rgba(16,24,40,.12); pointer-events: none; }
  .shop-navigation-skeleton__bar { height: .7rem; width: 45%; margin: 0 0 .7rem; border-radius: .25rem; }
  .shop-navigation-skeleton__grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: .45rem; }
  .shop-navigation-skeleton__card { min-width: 0; }
  .shop-navigation-skeleton__image { aspect-ratio: 1; margin-bottom: .35rem; }
  .shop-navigation-skeleton__line { height: .35rem; margin-bottom: .25rem; width: 82%; }
  .shop-navigation-skeleton__line--short { width: 36%; }
  .shimmer { background: linear-gradient(100deg,#f1f0ed 30%,#faf9f7 48%,#f1f0ed 66%); background-size: 220% 100%; animation: shimmer 1.1s ease-in-out infinite; }
  @keyframes shimmer { to { background-position: -220% 0; } }
  @media (max-width: 480px) { .shop-navigation-skeleton { top: .55rem; right: .55rem; width: 15rem; } }
</style>
