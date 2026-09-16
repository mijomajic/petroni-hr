import { json } from '@sveltejs/kit';
import { getUnavailableVehicleIds } from '$lib/pricing.server';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { useStaticDemoData } from '$lib/demo-mode.server';

export const GET: RequestHandler = async ({ url }) => {
  const vehicleId = url.searchParams.get('vehicleId');
  const vehicleIds = (url.searchParams.get('vehicleIds') ?? vehicleId ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const pickupDate = url.searchParams.get('pickupDate');
  const dropoffDate = url.searchParams.get('dropoffDate');

  if (
    vehicleIds.length === 0 ||
    !pickupDate ||
    !dropoffDate ||
    !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dropoffDate) ||
    dropoffDate <= pickupDate
  ) {
    return json({ available: false, error: 'Neispravni parametri dostupnosti.' }, { status: 400 });
  }

  if (useStaticDemoData) {
    return json({ available: vehicleId ? true : undefined, unavailableVehicleIds: [] });
  }

  let unavailableVehicleIds: string[];
  try {
    unavailableVehicleIds = await getUnavailableVehicleIds(vehicleIds, pickupDate, dropoffDate);
  } catch {
    if (dev) return json({ available: vehicleId ? true : undefined, unavailableVehicleIds: [] });
    return json({ available: false, error: 'Provjera dostupnosti nije uspjela.' }, { status: 500 });
  }

  return json({
    available: vehicleId ? !unavailableVehicleIds.includes(vehicleId) : undefined,
    unavailableVehicleIds
  });
};
