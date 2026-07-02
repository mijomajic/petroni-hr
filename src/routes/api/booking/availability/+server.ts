import { json } from '@sveltejs/kit';
import { getUnavailableVehicleIds } from '$lib/pricing.server';
import type { RequestHandler } from './$types';

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

  let unavailableVehicleIds: string[];
  try {
    unavailableVehicleIds = await getUnavailableVehicleIds(vehicleIds, pickupDate, dropoffDate);
  } catch {
    return json({ available: false, error: 'Provjera dostupnosti nije uspjela.' }, { status: 500 });
  }

  return json({
    available: vehicleId ? !unavailableVehicleIds.includes(vehicleId) : undefined,
    unavailableVehicleIds
  });
};
