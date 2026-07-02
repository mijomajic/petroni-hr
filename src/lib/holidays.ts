const DAY_MS = 86_400_000;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

// Gregorian Easter calculation (Meeus/Jones/Butcher algorithm).
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Croatian public holidays used by the booking fee engine.
 *
 * Fixed dates follow the current Croatian holiday calendar. Easter, Easter
 * Monday and Corpus Christi are calculated for any year. Verify this list
 * annually against the Ministry of Foreign and European Affairs calendar in
 * case legislation changes.
 */
export function getCroatianPublicHolidays(year: number): Set<string> {
  const fixed = [
    '01-01', // Nova godina
    '01-06', // Bogojavljenje / Sveta tri kralja
    '05-01', // Praznik rada
    '05-30', // Dan državnosti
    '06-22', // Dan antifašističke borbe
    '08-05', // Dan pobjede i domovinske zahvalnosti
    '08-15', // Velika Gospa
    '11-01', // Svi sveti
    '11-18', // Dan sjećanja
    '12-25', // Božić
    '12-26'  // Sveti Stjepan
  ].map((monthDay) => `${year}-${monthDay}`);

  const easter = easterSunday(year);
  return new Set([
    ...fixed,
    isoDate(easter),
    isoDate(addUtcDays(easter, 1)),
    isoDate(addUtcDays(easter, 60))
  ]);
}

export function isCroatianPublicHoliday(dateIso: string): boolean {
  const year = Number(dateIso.slice(0, 4));
  return Number.isInteger(year) && getCroatianPublicHolidays(year).has(dateIso);
}

export function isSunday(dateIso: string): boolean {
  const date = new Date(`${dateIso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.getUTCDay() === 0;
}
