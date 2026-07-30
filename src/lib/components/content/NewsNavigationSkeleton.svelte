<script lang="ts">
  import { locale } from '$lib/stores/locale';
</script>

<div class="news-navigation-skeleton" aria-hidden="true">
  <div class="container-x news-navigation-skeleton__container">
    <header class="news-navigation-skeleton__header">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Priče, vodiči i novosti' : 'Stories, guides and news'}</span>
      <h1 class="section-title">{$locale === 'hr' ? 'Iz svijeta kampiranja' : 'From the world of camping'}</h1>
      <p>{$locale === 'hr' ? 'Praktični savjeti, novosti iz Petronija i ideje za sigurnije, opuštenije putovanje.' : 'Practical advice, news from Petroni and ideas for safer, more relaxed travel.'}</p>
    </header>

    <section class="news-navigation-skeleton__featured">
      <div class="shimmer news-navigation-skeleton__featured-image"></div>
      <div class="news-navigation-skeleton__featured-copy">
        <span class="shimmer news-navigation-skeleton__date"></span>
        <span class="shimmer news-navigation-skeleton__title"></span>
        <span class="shimmer news-navigation-skeleton__title news-navigation-skeleton__title--short"></span>
        <span class="shimmer news-navigation-skeleton__body"></span>
        <span class="shimmer news-navigation-skeleton__body news-navigation-skeleton__body--short"></span>
        <span class="news-navigation-skeleton__link">{$locale === 'hr' ? 'Pročitaj članak →' : 'Read article →'}</span>
      </div>
    </section>

    <section>
      <div class="news-navigation-skeleton__latest"><h2>{$locale === 'hr' ? 'Najnovije objave' : 'Latest posts'}</h2><span class="shimmer"></span></div>
      <div class="news-navigation-skeleton__list">
        {#each Array(6) as _}
          <article class="news-navigation-skeleton__item">
            <div class="shimmer news-navigation-skeleton__thumbnail"></div>
            <div class="news-navigation-skeleton__item-copy">
              <span class="shimmer news-navigation-skeleton__item-date"></span>
              <span class="shimmer news-navigation-skeleton__item-title"></span>
              <span class="shimmer news-navigation-skeleton__item-title news-navigation-skeleton__item-title--short"></span>
              <span class="shimmer news-navigation-skeleton__item-body"></span>
            </div>
          </article>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .news-navigation-skeleton { position: fixed; z-index: 40; top: 72px; right: 0; bottom: 0; left: 0; overflow: auto; background: #fbfbfa; pointer-events: none; }
  .news-navigation-skeleton__container { padding-top: 4.5rem; padding-bottom: 4.5rem; }
  .news-navigation-skeleton__header { max-width: 42rem; margin-bottom: 2.5rem; }
  .news-navigation-skeleton__header p { max-width: 36rem; margin: 1rem 0 0; color: #747980; font-size: 15px; line-height: 1.75; }
  .news-navigation-skeleton__featured { display: grid; overflow: hidden; margin-bottom: 3rem; border-radius: 1rem; background: #252525; }
  .news-navigation-skeleton__featured-image { aspect-ratio: 16 / 10; }
  .news-navigation-skeleton__featured-copy { display: flex; flex-direction: column; justify-content: end; padding: 1.75rem; }
  .news-navigation-skeleton__date { width: 92px; height: 10px; margin-bottom: 1rem; border-radius: 2px; }
  .news-navigation-skeleton__title { width: 95%; height: 25px; margin-bottom: .55rem; border-radius: 3px; }
  .news-navigation-skeleton__title--short { width: 66%; }
  .news-navigation-skeleton__body { width: 88%; height: 11px; margin-top: 1.2rem; border-radius: 2px; }
  .news-navigation-skeleton__body--short { width: 62%; margin-top: .45rem; }
  .news-navigation-skeleton__link { margin-top: 1.75rem; color: #f5c518; font-size: 14px; font-weight: 700; }
  .news-navigation-skeleton__latest { display: flex; align-items: end; justify-content: space-between; padding-bottom: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #dedfdf; }
  .news-navigation-skeleton__latest h2 { margin: 0; color: #2b2b2b; font-size: 20px; }
  .news-navigation-skeleton__latest span { width: 45px; height: 10px; border-radius: 2px; }
  .news-navigation-skeleton__list { display: grid; gap: 2.5rem 2rem; }
  .news-navigation-skeleton__item { display: grid; grid-template-columns: 128px minmax(0,1fr); gap: 1.25rem; }
  .news-navigation-skeleton__thumbnail { aspect-ratio: 4 / 3; border-radius: .75rem; }
  .news-navigation-skeleton__item-copy { min-width: 0; padding-top: .25rem; }
  .news-navigation-skeleton__item-date { display: block; width: 70px; height: 9px; margin-bottom: .65rem; border-radius: 2px; }
  .news-navigation-skeleton__item-title { display: block; width: 92%; height: 15px; margin-bottom: .42rem; border-radius: 2px; }
  .news-navigation-skeleton__item-title--short { width: 58%; }
  .news-navigation-skeleton__item-body { display: block; width: 83%; height: 10px; margin-top: .8rem; border-radius: 2px; }
  .shimmer { display: block; background: linear-gradient(100deg,#efefed 30%,#fafaf8 48%,#efefed 66%); background-size: 220% 100%; animation: shimmer 1.1s ease-in-out infinite; }
  @keyframes shimmer { to { background-position: -220% 0; } }
  @media (min-width: 640px) { .news-navigation-skeleton__item { grid-template-columns: 190px minmax(0,1fr); } }
  @media (min-width: 768px) { .news-navigation-skeleton { top: 78px; } .news-navigation-skeleton__container { padding-top: 5.5rem; padding-bottom: 5.5rem; } .news-navigation-skeleton__header { margin-bottom: 3.5rem; } .news-navigation-skeleton__featured { grid-template-columns: 1.35fr 1fr; } .news-navigation-skeleton__featured-image { min-height: 410px; aspect-ratio: auto; } .news-navigation-skeleton__featured-copy { padding: 2.5rem; } .news-navigation-skeleton__list { grid-template-columns: repeat(2,minmax(0,1fr)); } }
  @media (prefers-reduced-motion: reduce) { .shimmer { animation: none; } }
</style>
