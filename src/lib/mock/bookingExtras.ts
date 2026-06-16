export type BookingExtra = {
  id: string;
  name_hr: string;
  name_en: string;
  price: number;
  max_qty: number;
  is_required: boolean;
  sort_order: number;
};

export const bookingExtras: BookingExtra[] = [
  { id: 'booking-fee', name_hr: 'Trošak rezervacije', name_en: 'Booking fee', price: 75, max_qty: 1, is_required: true, sort_order: 1 },
  { id: 'deposit-plus', name_hr: 'Polog Plus', name_en: 'Deposit Plus', price: 2000, max_qty: 1, is_required: false, sort_order: 2 },
  { id: 'b10-deposit', name_hr: 'B10 polog', name_en: 'B10 Deposit', price: 2000, max_qty: 1, is_required: false, sort_order: 3 },
  { id: 'dinnerware-1-4-persons', name_hr: 'Posuđe za 1-4 osobe', name_en: 'Dinnerware 1-4 persons', price: 45, max_qty: 1, is_required: false, sort_order: 4 },
  { id: 'bedding', name_hr: 'Posteljina', name_en: 'Bedding', price: 45, max_qty: 4, is_required: false, sort_order: 5 },
  { id: 'towels', name_hr: 'Ručnici', name_en: 'Towels', price: 30, max_qty: 4, is_required: false, sort_order: 6 },
  { id: 'bicycle', name_hr: 'Bicikl', name_en: 'Bicycle', price: 50, max_qty: 4, is_required: false, sort_order: 7 },
  { id: 'bicycle-rack', name_hr: 'Nosač za bicikle', name_en: 'Bicycle rack', price: 60, max_qty: 1, is_required: false, sort_order: 8 },
  { id: 'bicycle-child-seat', name_hr: 'Bicikl + dječje sjedalo', name_en: 'Bicycle + child seat', price: 80, max_qty: 1, is_required: false, sort_order: 9 },
  { id: 'child-seat', name_hr: 'Dječje sjedalo', name_en: 'Child seat', price: 40, max_qty: 2, is_required: false, sort_order: 10 },
  { id: 'child-seat-booster', name_hr: 'Booster sjedalo za dijete', name_en: 'Child seat booster', price: 30, max_qty: 2, is_required: false, sort_order: 11 },
  { id: 'voltage-converter-12v-220v', name_hr: 'Naponski pretvarač 12v-220v', name_en: 'Voltage converter 12v-220v', price: 30, max_qty: 1, is_required: false, sort_order: 12 },
  { id: 'wifi-router', name_hr: 'WiFi ruter', name_en: 'WiFi Router', price: 40, max_qty: 1, is_required: false, sort_order: 13 },
  { id: 'gps-garmin', name_hr: 'GPS GARMIN', name_en: 'GPS GARMIN', price: 70, max_qty: 1, is_required: false, sort_order: 14 },
  { id: 'gps-garmin-camper-795lt', name_hr: 'GPS GARMIN Camper 795LT', name_en: 'GPS GARMIN Camper 795LT', price: 90, max_qty: 1, is_required: false, sort_order: 15 },
  { id: 'outdoor-chair', name_hr: 'Vrtni stolac', name_en: 'Outdoor chair', price: 12, max_qty: 6, is_required: false, sort_order: 16 },
  { id: 'outdoor-table', name_hr: 'Vrtni stol', name_en: 'Outdoor table', price: 15, max_qty: 2, is_required: false, sort_order: 17 },
  { id: 'additional-driver', name_hr: 'Dodatni vozač', name_en: 'Additional driver', price: 40, max_qty: 2, is_required: false, sort_order: 18 },
  { id: 'additional-gas-cylinder', name_hr: 'Dodatna plinska boca', name_en: 'Additional Gas Cylinder', price: 35, max_qty: 2, is_required: false, sort_order: 19 },
  { id: 'tire-insurance', name_hr: 'Osiguranje guma', name_en: 'Tire insurance', price: 40, max_qty: 1, is_required: false, sort_order: 20 },
  { id: 'toilet-cassette-cleaning', name_hr: 'Čišćenje kazete WC-a', name_en: 'Toilet cassette cleaning', price: 70, max_qty: 1, is_required: false, sort_order: 21 },
  { id: 'refrigerator-cleaning', name_hr: 'Čišćenje hladnjaka', name_en: 'Refrigerator cleaning', price: 65, max_qty: 1, is_required: false, sort_order: 22 },
  { id: 'floor-cleaning', name_hr: 'Čišćenje podova', name_en: 'Floor cleaning', price: 35, max_qty: 1, is_required: false, sort_order: 23 },
  { id: 'stove-cleaning-servicing', name_hr: 'Čišćenje i servis štednjaka', name_en: 'Stove cleaning & servicing', price: 60, max_qty: 1, is_required: false, sort_order: 24 },
  { id: 'washing-of-tableware', name_hr: 'Pranje posuđa', name_en: 'Washing of tableware', price: 35, max_qty: 1, is_required: false, sort_order: 25 },
  { id: 'upholstery-cleaning', name_hr: 'Čišćenje tapeciranog namještaja', name_en: 'Upholstery cleaning', price: 175, max_qty: 1, is_required: false, sort_order: 26 },
  { id: 'final-cleaning', name_hr: 'Završno čišćenje', name_en: 'Final cleaning', price: 200, max_qty: 1, is_required: false, sort_order: 27 },
  { id: 'border-crossing-fee', name_hr: 'Naknada za prelazak granice', name_en: 'Border crossing fee', price: 50, max_qty: 5, is_required: false, sort_order: 28 },
  { id: 'pet-fee', name_hr: 'Naknada za kućnog ljubimca', name_en: 'Pet fee', price: 50, max_qty: 2, is_required: false, sort_order: 29 },
  { id: 'festival-fee', name_hr: 'Naknada za festival', name_en: 'Festival fee', price: 50, max_qty: 1, is_required: false, sort_order: 30 },
];
