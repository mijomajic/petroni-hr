const DAY_MS = 86_400_000;

function utcStartOfDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function daysUntilPickup(pickupDate: string, today = new Date()): number {
  const pickup = new Date(`${pickupDate}T00:00:00Z`);
  if (Number.isNaN(pickup.getTime())) return Number.NEGATIVE_INFINITY;
  return Math.round((pickup.getTime() - utcStartOfDay(today)) / DAY_MS);
}

export function splitPaymentIsEligible(
  pickupDate: string,
  minimumAdvanceDays: number,
  today = new Date()
): boolean {
  return daysUntilPickup(pickupDate, today) > Math.max(1, minimumAdvanceDays);
}

export function secondPaymentDueDate(pickupDate: string, dueDays: number): string {
  const due = new Date(`${pickupDate}T00:00:00Z`);
  if (Number.isNaN(due.getTime())) return '';
  due.setUTCDate(due.getUTCDate() - Math.max(1, dueDays));
  return due.toISOString().slice(0, 10);
}

export function timeIsWithinBookingWindow(time: string, start: string, end: string): boolean {
  return /^\d{2}:\d{2}$/.test(time) && time >= start && time <= end;
}
