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
  const href = $derived(detailHref ?? `/vozila/${vehicle.slug}`);
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

  <div class="flex flex-1 flex-col items-center px-5 pb-5 pt-4 text-center">
    <h3 class="mb-2 flex min-h-11 items-center text-center text-[17px] font-semibold leading-snug text-[#2b2b2b]">{vehicle.name}</h3>
    {#if desc}
      <p class="mb-4 line-clamp-3 text-[13.5px] leading-relaxed text-[#7a7f86]">{desc}</p>
    {:else}
      <p class="mb-4 text-[13.5px] leading-relaxed text-[#7a7f86]">
        {vehicle.name} — {$locale === 'hr' ? 'detalji o vozilu, oprema i udobnost.' : 'vehicle details, equipment and comfort.'}
      </p>
    {/if}
    <a href={href} class="btn btn-primary mt-auto">{moreLabel}</a>
  </div>
</div>
