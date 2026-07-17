-- Consolidate duplicate rental/sale rows so each physical camper has one
-- canonical public detail page while preserving its confirmed sale price.

begin;

update vehicles as rental
set
  is_for_sale = true,
  sale_price = sale.sale_price
from vehicles as sale
where rental.slug = 'caratour-ford-600mq'
  and sale.slug = 'caratour-ford-600mq-prodaja';

update vehicles as rental
set
  is_for_sale = true,
  sale_price = sale.sale_price
from vehicles as sale
where rental.slug = 'ci-horon-79m'
  and sale.slug = 'caravans-international-horon-79m';

-- Keep the historical rows for audit/reference, but remove them from public
-- catalogues. Existing public URLs are redirected at the application layer.
update vehicles
set is_available = false
where slug in (
  'caratour-ford-600mq-prodaja',
  'caravans-international-horon-79m'
);

commit;
