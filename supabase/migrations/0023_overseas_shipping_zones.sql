-- Phase 6C: Overseas price tiers and Croatian postal-code zones supplied by Petroni.
-- Tier maxima are exclusive: 0-99.99, 100-249.99, 250-499.99 and 500-999.99 EUR.
-- The existing free_shipping_threshold setting applies to Overseas from 1000 EUR.

begin;

insert into settings (key, value) values
  ('shop_overseas_zones', '{
    "zone_1": {
      "label_hr": "Zona I",
      "label_en": "Zone I",
      "tiers": [
        {"min": 0, "max": 100, "price": 11},
        {"min": 100, "max": 250, "price": 17},
        {"min": 250, "max": 500, "price": 23},
        {"min": 500, "max": 1000, "price": 45}
      ]
    },
    "zone_2": {
      "label_hr": "Zona II",
      "label_en": "Zone II",
      "postal_codes": [
        "20221", "20222", "20223", "20224", "20225", "20226", "20260", "20270", "20271", "20290",
        "21225", "21400", "21403", "21405", "21410", "21412", "21420", "21426", "21430", "21432",
        "21450", "21460", "21463", "21465", "21469", "21480", "21483", "21485", "22232", "22233",
        "22234", "22235", "22236", "23212", "23250", "23262", "23275", "23281", "23282", "23283",
        "23284", "23285", "23286", "23287", "23291", "23292", "23293", "23294", "23295", "23296",
        "51280", "51542", "51550", "51552", "51554", "51556", "51557", "51561", "51562", "53291"
      ],
      "tiers": [
        {"min": 0, "max": 100, "price": 20},
        {"min": 100, "max": 250, "price": 30},
        {"min": 250, "max": 500, "price": 35},
        {"min": 500, "max": 1000, "price": 60}
      ]
    }
  }'::jsonb)
on conflict (key) do nothing;

commit;
