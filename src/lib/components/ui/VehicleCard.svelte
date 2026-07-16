<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { vehicleThumbnail } from '$lib/vehicle-images';

  type Props = {
    vehicle: Vehicle;
    detailHref?: string;
  };
  let { vehicle, detailHref }: Props = $props();

  const img = $derived(vehicleThumbnail(vehicle.images?.[0]));
  const desc = $derived(
    ($locale === 'hr' ? vehicle.description_hr : (vehicle.description_en || vehicle.description_hr)) || ''
  );
  const href = $derived(detailHref ?? `/vozila/najam-kampera/${vehicle.slug}`);
  const moreLabel = $derived($locale === 'hr' ? 'Vidi više' : 'View more');
</script>

<div class="card card-interactive flex flex-col overflow-hidden h-full">
  <a href={href} class="block overflow-hidden group">
    <div class="aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
      {#if img}
        <img
          src={img}
          alt={vehicle.name}
          width="480"
          height="360"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      {:else}
        <div class="flex h-full items-center justify-center px-6 text-center text-xs font-semibold uppercase tracking-wider text-[#9aa0a8]">
          {$locale === 'hr' ? 'Fotografija nije dostupna' : 'Photo unavailable'}
        </div>
      {/if}
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
