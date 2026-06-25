-- Petroni backend — Phase 1: seed data (PLACEHOLDERS)
-- Every value below is a starting placeholder the client confirms/edits via the
-- admin panel. IBANs and the notification email are the only values already
-- confirmed by the client; the rest (fee amounts, location fees, working-hour
-- windows, extra prices) are best-guess placeholders.

-- ---------------------------------------------------------------------------
-- SETTINGS
-- ---------------------------------------------------------------------------
insert into settings (key, value) values
('ibans', '[
  {"bank":"Erste&Steiermärkische bank d.d.","iban":"HR89 2402 006 11 000 54183","bic":"ESBCHR22"},
  {"bank":"Addiko Bank d.d.","iban":"HR95 2500 0091 1015 5198 1","bic":"HAABHR22"},
  {"bank":"Zagrebačka banka d.d.","iban":"HR50 236 0000 1101 417 883","bic":"ZABAHR2X"}
]'),
('free_shipping_threshold', '1000'),
('min_driver_age', '28'),
('km_per_day_included', '300'),
('admin_email', '"info@petroni.hr"'),
('company', '{"name":"Petroni d.o.o.","oib":"","address":""}');

-- ---------------------------------------------------------------------------
-- BOOKING EXTRAS (30 known extras from the existing site — placeholder prices)
-- ---------------------------------------------------------------------------
insert into booking_extras (name_hr, price, price_type, category, max_qty, is_required, sort_order) values
('Trošak rezervacije / Booking fee', 75, 'per_rental', 'depozit', 1, true, 1),
('ECO Depozit / Deposit 2.000,00€', 2000, 'refundable', 'depozit', 1, false, 2),
('Depozit Plus', 2000, 'refundable', 'depozit', 1, false, 3),
('Posude za jelo (1-4 osobe)', 45, 'per_rental', 'oprema', 1, false, 4),
('Posteljina / Bedding', 35, 'per_rental', 'oprema', 4, false, 5),
('Ručnici 3kom / Towels', 15, 'per_rental', 'oprema', 4, false, 6),
('Bicikl / Bicycle', 10, 'per_day', 'oprema', 4, false, 7),
('Nosač za bicikl / Bicycle rack', 40, 'per_rental', 'oprema', 1, false, 8),
('Bicikl + sjedalo za dijete', 15, 'per_day', 'oprema', 1, false, 9),
('Dječje sjedalo / Child seat', 40, 'per_rental', 'oprema', 2, false, 10),
('Dječje sjedalo - booster', 15, 'per_rental', 'oprema', 2, false, 11),
('Pretvarač napona 12v-220v (150/300W)', 4, 'per_day', 'oprema', 1, false, 12),
('WiFi uređaj / device', 10, 'per_day', 'oprema', 1, false, 13),
('GPS GARMIN', 7, 'per_day', 'oprema', 1, false, 14),
('GPS GARMIN Camper 770MLT', 10, 'per_day', 'oprema', 1, false, 15),
('Vanjska stolica / Outdoor chair', 2, 'per_day', 'oprema', 6, false, 16),
('Vanjski stol / Outdoor table', 3, 'per_day', 'oprema', 2, false, 17),
('Dodatni vozač / Additional driver', 55, 'per_rental', 'ostalo', 2, false, 18),
('Dodatna plinska boca / Gas cylinder', 50, 'per_rental', 'oprema', 2, false, 19),
('Osiguranje za gume / Tire insurance', 10, 'per_day', 'ostalo', 1, false, 20),
('Čišćenje WC kasete i kućišta', 150, 'per_rental', 'ciscenje', 1, false, 21),
('Čišćenje hladnjaka', 60, 'per_rental', 'ciscenje', 1, false, 22),
('Čišćenje štednjaka', 80, 'per_rental', 'ciscenje', 1, false, 23),
('Štednjak - čišćenje i servis', 150, 'per_rental', 'ciscenje', 1, false, 24),
('Pranje pribora za jelo', 60, 'per_rental', 'ciscenje', 1, false, 25),
('Čišćenje tapecirunga / Upholstery', 200, 'per_rental', 'ciscenje', 1, false, 26),
('Završno čišćenje / Final cleaning', 150, 'per_rental', 'ciscenje', 1, false, 27),
('Prelazak granice / Border crossing fee', 50, 'per_rental', 'ostalo', 5, false, 28),
('Naknada za otoke / Islands fee', 70, 'per_rental', 'ostalo', 1, false, 29),
('Naknada za festival / Festival fee', 50, 'per_rental', 'ostalo', 1, false, 30);

-- ---------------------------------------------------------------------------
-- FEES (placeholder amounts; client confirms via admin)
-- ---------------------------------------------------------------------------
insert into fees (key, name_hr, description_hr, amount, fee_type) values
('sunday_holiday', 'Naknada za nedjelju/praznik', 'Doplata za preuzimanje ili povrat nedjeljom ili praznikom', 50, 'per_event'),
('after_hours', 'Naknada izvan radnog vremena', 'Doplata za preuzimanje/povrat izvan definiranog vremena', 50, 'per_event'),
('extra_km', 'Naknada za prekoračenje kilometara', 'Cijena po prijeđenom kilometru iznad uključenih 300km/dan', 0.3, 'per_km');

-- ---------------------------------------------------------------------------
-- RENTAL LOCATIONS (placeholder fees + working-hour windows; client confirms)
-- ---------------------------------------------------------------------------
insert into rental_locations (name, location_fee, pickup_window, return_window, sort_order) values
('Zagreb Depot', 0, '13:00-15:00', '08:00-10:00', 1),
('Zagreb City Centre', 0, '11:00-13:00', '13:00-15:00', 2),
('Zagreb Airport', 0, '11:00-13:00', '13:00-15:00', 3),
('Split Airport', 0, '11:00-13:00', '13:00-15:00', 4),
('Dubrovnik Airport', 0, '11:00-13:00', '13:00-15:00', 5),
('Pula Airport', 0, '11:00-13:00', '13:00-15:00', 6),
('Zadar Airport', 0, '11:00-13:00', '13:00-15:00', 7),
('Krk (Rijeka) Airport', 0, '11:00-13:00', '13:00-15:00', 8),
('Ljubljana Airport', 0, '11:00-13:00', '13:00-15:00', 9),
('Budapest Airport', 0, '11:00-13:00', '13:00-15:00', 10),
('Vienna Airport', 0, '11:00-13:00', '13:00-15:00', 11);
