<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  type Props = {
    vehicle: Vehicle;
    detailHref?: string;
  };
  let { vehicle, detailHref }: Props = $props();

  const img = $derived(vehicle.images?.[0] || 'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg');
  const desc = $derived(
    ($locale === 'hr' ? vehicle.description_hr : (vehicle.description_en || vehicle.description_hr)) || ''
  );
  const href = $derived(detailHref ?? `/vozila/najam-kampera/${vehicle.slug}`);
  const moreLabel = $derived($locale === 'hr' ? 'Vidi više' : 'View more');
</script>

<div class="card flex flex-col overflow-hidden h-full">
  <a href={href} class="block overflow-hidden group">
    <div class="aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
      <img
        src={img}
        alt={vehicle.name}
        width="768"
        height="576"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
      />
    </div>
  </a>

  <div class="px-5 pt-5 pb-1 flex items-center justify-center min-h-[72px] text-center">
    <h3 class="font-semibold text-[17px] leading-snug text-[#2b2b2b] text-center">{vehicle.name}</h3>
  </div>

  <div class="px-5 py-5 flex flex-col flex-1 items-center text-center">
    {#if desc}
      <p class="text-[13.5px] leading-relaxed text-[#7a7f86] mb-5 line-clamp-3">{desc}</p>
    {:else}
      <p class="text-[13.5px] leading-relaxed text-[#7a7f86] mb-5">
        {vehicle.name} — {$locale === 'hr' ? 'detalji o vozilu, oprema i udobnost.' : 'vehicle details, equipment and comfort.'}
      </p>
    {/if}
    <a href={href} class="btn btn-primary mt-auto">{moreLabel}</a>
  </div>
</div>
