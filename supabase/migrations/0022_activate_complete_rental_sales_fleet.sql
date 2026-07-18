-- Every canonical rental camper/caravan is both publicly active and offered
-- for sale. Historical duplicate rows whose type is `sale` remain archived;
-- their canonical rental records already carry the confirmed sale details.
update vehicles
set
  is_available = true,
  is_for_sale = true
where type = 'rental';
