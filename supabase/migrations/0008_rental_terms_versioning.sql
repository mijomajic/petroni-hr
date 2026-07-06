-- Atomically replace the active rental terms while preserving every previous
-- version used by booking e-consent records.

create unique index if not exists idx_rental_terms_version_unique
  on rental_terms (version);

create or replace function replace_active_rental_terms(
  p_version text,
  p_content_hr text
)
returns rental_terms
language plpgsql
set search_path = public
as $$
declare
  new_terms rental_terms;
begin
  if length(trim(p_version)) < 3 then
    raise exception 'Verzija uvjeta mora imati najmanje 3 znaka.';
  end if;
  if length(trim(p_content_hr)) < 50 then
    raise exception 'Tekst uvjeta mora imati najmanje 50 znakova.';
  end if;

  update rental_terms set is_active = false where is_active = true;

  insert into rental_terms (version, content_hr, is_active)
  values (trim(p_version), trim(p_content_hr), true)
  returning * into new_terms;

  return new_terms;
end;
$$;

revoke all on function replace_active_rental_terms(text, text) from public, anon, authenticated;
grant execute on function replace_active_rental_terms(text, text) to service_role;
