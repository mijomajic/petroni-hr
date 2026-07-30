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
  .shop-navigation-skeleton { position: fixed; z-index: 55; inset: 0; overflow: hidden; background: #fff; padding: 7.5rem 1.5rem 3rem; pointer-events: none; }
  .shop-navigation-skeleton__bar { height: 2.75rem; width: min(26rem, 100%); margin: 0 auto 2.5rem; border-radius: .25rem; }
  .shop-navigation-skeleton__grid { display: grid; max-width: 80rem; margin: 0 auto; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; }
  .shop-navigation-skeleton__card { min-width: 0; border: 1px solid #ecebe7; padding: 1rem; }
  .shop-navigation-skeleton__image { aspect-ratio: 1; margin-bottom: 1rem; }
  .shop-navigation-skeleton__line { height: .75rem; margin-bottom: .65rem; width: 82%; }
  .shop-navigation-skeleton__line--short { width: 36%; }
  .shimmer { background: linear-gradient(100deg,#f1f0ed 30%,#faf9f7 48%,#f1f0ed 66%); background-size: 220% 100%; animation: shimmer 1.1s ease-in-out infinite; }
  @keyframes shimmer { to { background-position: -220% 0; } }
  @media (min-width: 768px) { .shop-navigation-skeleton__grid { grid-template-columns: repeat(4,minmax(0,1fr)); gap: 1.5rem; } }
</style>
