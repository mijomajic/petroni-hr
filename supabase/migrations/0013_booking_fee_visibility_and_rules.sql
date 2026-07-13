-- Make special booking fees visible and safely auto-selectable from an explicit guest declaration.
alter table booking_extras
  add column if not exists auto_apply_rule text;

alter table booking_extras
  drop constraint if exists booking_extras_auto_apply_rule_check;

alter table booking_extras
  add constraint booking_extras_auto_apply_rule_check
  check (auto_apply_rule is null or auto_apply_rule in ('border_crossing', 'festival'));

update booking_extras
set category = 'posebne_naknade', auto_apply_rule = 'border_crossing'
where name_hr = 'Prelazak granice / Border crossing fee';

update booking_extras
set category = 'posebne_naknade', auto_apply_rule = 'festival'
where name_hr = 'Naknada za festival / Festival fee';

update booking_extras
set category = 'posebne_naknade'
where name_hr = 'Naknada za otoke / Islands fee';
