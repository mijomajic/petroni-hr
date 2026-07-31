-- Phase 6H-C: protected bilingual legal-document drafts, publication history
-- and non-destructive restore. Legal approval remains a client/counsel task.

create table if not exists legal_documents (
  key text primary key,
  label text not null,
  route text not null unique,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (key in ('privacy', 'cookies', 'shop_terms', 'delivery_payment', 'returns_complaints'))
);

create table if not exists legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_key text not null references legal_documents(key) on delete restrict,
  version_number integer not null check (version_number > 0),
  version_label text not null check (length(trim(version_label)) >= 3),
  status text not null check (status in ('draft', 'published', 'archived')),
  effective_date date not null,
  title_hr text not null,
  title_en text not null,
  summary_hr text not null default '',
  summary_en text not null default '',
  content_hr text not null,
  content_en text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  restored_from_id uuid references legal_document_versions(id) on delete set null,
  unique (document_key, version_number)
);

create unique index if not exists idx_legal_document_one_draft
  on legal_document_versions (document_key) where status = 'draft';
create unique index if not exists idx_legal_document_one_published
  on legal_document_versions (document_key) where status = 'published';
create index if not exists idx_legal_document_history
  on legal_document_versions (document_key, version_number desc);

insert into legal_documents (key, label, route) values
  ('privacy', 'Politika privatnosti', '/privatnost'),
  ('cookies', 'Kolačići i pohrana preglednika', '/kolacici'),
  ('shop_terms', 'Uvjeti poslovanja webshopa', '/uvjeti-poslovanja'),
  ('delivery_payment', 'Plaćanje i dostava', '/placanje-dostava'),
  ('returns_complaints', 'Reklamacije i povrat', '/reklamacije-povrat')
on conflict (key) do update set label = excluded.label, route = excluded.route;

insert into legal_document_versions (
  document_key, version_number, version_label, status, effective_date,
  title_hr, title_en, summary_hr, summary_en, content_hr, content_en,
  published_at
) values
  (
    'privacy', 1, '2026-07-31-technical-baseline', 'published', date '2026-07-31',
    'Politika privatnosti', 'Privacy Policy',
    'Kako Petroni obrađuje osobne podatke. Konačni tekst odobravaju Petroni i pravni savjetnik.',
    'How Petroni processes personal data. Petroni and its legal adviser remain responsible for final approval.',
    $hr$## Voditelj obrade i kontakt

Voditelj obrade je Petroni d.o.o., Ul. Slavka Tomerlina 8, 10360 Sesvete, Hrvatska. Za pitanja ili zahtjeve obratite se na info@petroni.hr ili +385 91 242 7247.

## Podaci i svrhe

Obrađujemo podatke računa, vozača i rezervacije, webshop narudžbe i dostave, obavijesti o zalihi, plaćanja, račune, prigovore, e-suglasnost, tehničke zapise i komunikaciju. Svrhe su radnje prije ugovora i izvršenje ugovora, pravne obveze, sigurnost, sprječavanje zlouporabe, pravni zahtjevi i radnje koje korisnik zatraži.

## Primatelji

Kada je nužno, podatke mogu obrađivati Supabase, Vercel, Resend i povezana email infrastruktura, CorvusPay, banke, Overseas Express, BoxNow, knjigovodstvo, pravni ili IT savjetnici i nadležna tijela. Petroni ne pohranjuje pune podatke kartice.

## Čuvanje i prava

Podaci se čuvaju koliko je potrebno za uslugu, zakonske obveze, sigurnost i pravne zahtjeve. Možete zatražiti pristup, ispravak, brisanje, ograničenje, prenosivost, prigovor ili povlačenje privole kada je primjenjivo. Možete se obratiti i AZOP-u.

## Tehničke mjere i promjene

Primjenjuju se kontrola pristupa, serverska provjera cijena i sigurnosni zapisi. E-suglasnost je revizijski trag, ne jamstvo pravne provedivosti. Objavljena verzija i povijest vode se u zaštićenom administracijskom sustavu.$hr$,
    $en$## Controller and contact

The controller is Petroni d.o.o., Ul. Slavka Tomerlina 8, 10360 Sesvete, Croatia. Contact info@petroni.hr or +385 91 242 7247 for questions or rights requests.

## Data, purposes and recipients

We process account, driver, booking, webshop, delivery, stock-alert, payment, invoice, complaint, consent, technical-log and communication data for pre-contract steps, contract performance, legal duties, security and user-requested actions. Where necessary, providers include Supabase, Vercel, Resend, CorvusPay, banks, Overseas Express and BoxNow. Petroni does not store full card details.

## Retention and rights

Data is kept only as long as needed for the service, legal duties, security and claims. Users may request access, correction, deletion, restriction, portability, objection or withdrawal of consent where applicable. The Croatian data-protection authority may also be contacted.

## Changes

Consent records are an audit trail, not a guarantee of legal enforceability. Published versions and history are maintained in the protected administration system.$en$,
    now()
  ),
  (
    'cookies', 1, '2026-07-31-technical-baseline', 'published', date '2026-07-31',
    'Kolačići i pohrana preglednika', 'Cookies and Browser Storage',
    'Popis nužnih kolačića i pohrane. Trenutačno nema analitičkih ni marketinških kolačića.',
    'Inventory of necessary cookies and storage. There are currently no analytics or advertising cookies.',
    $hr$## Trenutačna uporaba

- Supabase Auth postavlja nužne sesijske kolačiće za prijavu.
- Kratkotrajni HttpOnly kolačići koriste se tijekom oporavka lozinke.
- Lokalna pohrana čuva jezik i košaricu.
- Sesijska pohrana čuva nacrt rezervacije i kratkotrajni rezultat narudžbe ili rezervacije.

## Analitika i vanjske usluge

Trenutačno nema Google Analyticsa, oglasnih piksela ni marketinških kolačića. Fontovi i zastavice poslužuju se lokalno. BoxNow karta učitava se tek kada kupac otvori kartu. Vanjske poveznice kontaktiraju odredište tek nakon klika.

## Upravljanje

Podaci se mogu izbrisati kroz sučelje ili postavke preglednika. Brisanje prijavnih kolačića odjavljuje korisnika, a brisanje sesijske pohrane uklanja nedovršeni nacrt.$hr$,
    $en$## Current use

Necessary Supabase session cookies support authentication, short-lived HttpOnly cookies protect password recovery, local storage retains language and cart, and session storage retains booking drafts and short-lived results.

## Analytics and external services

There are currently no analytics, advertising pixels or marketing cookies. Fonts and flags are local. BoxNow loads only after the customer opens its map. External links contact their destinations only after a click.

## Controls

Browser data can be removed through the interface or browser settings. Clearing authentication cookies signs the user out and clearing session storage removes an unfinished draft.$en$,
    now()
  ),
  (
    'shop_terms', 1, '2026-07-31-technical-baseline', 'published', date '2026-07-31',
    'Uvjeti poslovanja webshopa', 'Webshop Terms of Business',
    'Osnovna pravila naručivanja. Konačni tekst potvrđuju Petroni i pravni savjetnik.',
    'Core ordering rules. Petroni and its legal adviser must approve the final text.',
    $hr$## Prodavatelj

Petroni d.o.o., Ul. Slavka Tomerlina 8, 10360 Sesvete, Hrvatska; info@petroni.hr; +385 91 242 7247.

## Proizvodi, cijene i dostupnost

Cijene su u eurima. Zaliha i ukupni iznos provjeravaju se na serveru. Očita pogreška u cijeni, opisu ili zalihi ne stvara obvezu isporuke po pogrešnom podatku; kupcu će se ponuditi nastavak ili otkazivanje.

## Narudžba, plaćanje i dostava

Slanje narudžbe evidentira zahtjev na obradu. Automatska poruka potvrđuje primitak i ne mora sama značiti konačno prihvaćanje ili otpremu. Dostupne metode i cijene prikazuju se u checkoutu i na stranici Plaćanje i dostava.

## Povrat, prigovori i privatnost

Postupak je opisan na stranici Reklamacije i povrat. Ovaj tekst ne ograničava obvezna prava kupca. Obrada podataka opisana je u Politici privatnosti i dokumentu o kolačićima. Konačni tekst odobravaju Petroni i pravni savjetnik.$hr$,
    $en$## Seller

Petroni d.o.o., Ul. Slavka Tomerlina 8, 10360 Sesvete, Croatia; info@petroni.hr; +385 91 242 7247.

## Products and orders

Prices are in euros. Stock and totals are checked on the server. An obvious price, description or stock error does not create an obligation to supply using incorrect information. Submitting an order records a request for processing; an automated receipt does not necessarily mean final acceptance or dispatch.

## Payment, delivery and rights

Available methods and prices appear at checkout and on the Payment and Shipping page. Returns are described on the Complaints and Returns page. This baseline does not limit mandatory rights. Petroni and its legal adviser remain responsible for final approval.$en$,
    now()
  ),
  (
    'delivery_payment', 1, '2026-07-31-technical-baseline', 'published', date '2026-07-31',
    'Plaćanje i dostava', 'Payment and Shipping',
    'Metode plaćanja i dostave. Važeće cijene prikazane su iz poslovnih postavki.',
    'Payment and shipping methods. Current prices are shown from business settings.',
    $hr$## Plaćanje

Checkout prikazuje samo omogućene metode. Bankovna uplata koristi podatke iz potvrde. Pouzeće je dostupno samo za podržanu dostavu i može imati prikazanu naknadu. Kartično plaćanje koristi CorvusPay kada je omogućeno.

## Dostava

Overseas cijena ovisi o zoni, poštanskom broju i vrijednosti košarice. BoxNow ima zasebnu cijenu, a karta se učitava tek nakon klika. Proizvodi samo za osobno preuzimanje ne šalju se dostavnom službom. Rokovi su procjene i mogu ovisiti o zalihi, uplati, dostavljaču i adresi.$hr$,
    $en$## Payment

Checkout shows only enabled methods. Bank transfers use confirmation details, cash on delivery is limited to supported delivery methods, and card payment uses CorvusPay when enabled.

## Shipping

Overseas pricing depends on zone, postcode and cart value. BoxNow has a separate price and loads its map only after a click. Pickup-only products cannot be shipped. Delivery times are estimates and may depend on stock, payment, carrier and address.$en$,
    now()
  ),
  (
    'returns_complaints', 1, '2026-07-31-technical-baseline', 'published', date '2026-07-31',
    'Reklamacije i povrat', 'Complaints and Returns',
    'Postupak za povrat, transportno oštećenje i reklamacije.',
    'Process for returns, transit damage and complaints.',
    $hr$## Povrat

Za upute se javite na info@petroni.hr s predmetom „POVRAT PROIZVODA”. Robu vratite bez nepotrebnog odgađanja, odgovarajuće zaštićenu i uz podatke narudžbe. Upute ne ograničavaju zakonska prava.

## Oštećen ili neispravan proizvod

Obavijestite Petroni što prije. Za bržu obradu priložite fotografije proizvoda, ambalaže, transportne kutije i oštećenja te sačuvajte robu i ambalažu do završetka postupka. Preporučeni brzi rok za transportno oštećenje ne ograničava prava kupca.

## Obrada

Petroni pregledava podatke i, kada je potrebno, vraćenu robu te obavještava kupca o rješenju. Konačni postupak i tekst potvrđuju Petroni ili pravni savjetnik.$hr$,
    $en$## Returns

Contact info@petroni.hr with the subject “PRODUCT RETURN” for instructions. Return goods without unnecessary delay, suitably protected and linked to the order. These instructions do not limit mandatory rights.

## Damaged or defective goods

Notify Petroni promptly and include photos of the product, packaging, shipping box and damage. Keep the goods and packaging until the process is complete. Petroni or its legal adviser must approve the final process and wording.$en$,
    now()
  )
on conflict (document_key, version_number) do nothing;

alter table legal_documents enable row level security;
alter table legal_document_versions enable row level security;

drop policy if exists "Legal document metadata is public" on legal_documents;
create policy "Legal document metadata is public"
  on legal_documents for select using (true);

drop policy if exists "Published legal document versions are public" on legal_document_versions;
create policy "Published legal document versions are public"
  on legal_document_versions for select using (status = 'published');

revoke all on legal_documents, legal_document_versions from anon, authenticated;
grant select on legal_documents to anon, authenticated;
grant select on legal_document_versions to anon, authenticated;

create or replace function save_legal_document_draft(
  p_document_key text,
  p_version_label text,
  p_effective_date date,
  p_title_hr text,
  p_title_en text,
  p_summary_hr text,
  p_summary_en text,
  p_content_hr text,
  p_content_en text,
  p_actor uuid
)
returns legal_document_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
  new_version legal_document_versions;
begin
  perform pg_advisory_xact_lock(hashtext(p_document_key));
  if not exists (select 1 from legal_documents where key = p_document_key) then
    raise exception 'Nepoznat pravni dokument.';
  end if;
  if length(trim(p_version_label)) < 3 or length(trim(p_title_hr)) < 3 or length(trim(p_title_en)) < 3 then
    raise exception 'Oznaka i oba naslova su obavezni.';
  end if;
  if length(trim(p_content_hr)) < 50 or length(trim(p_content_en)) < 50 then
    raise exception 'HR i EN tekst moraju imati najmanje 50 znakova.';
  end if;

  update legal_document_versions set status = 'archived'
    where document_key = p_document_key and status = 'draft';
  select coalesce(max(version_number), 0) + 1 into next_number
    from legal_document_versions where document_key = p_document_key;

  insert into legal_document_versions (
    document_key, version_number, version_label, status, effective_date,
    title_hr, title_en, summary_hr, summary_en, content_hr, content_en, created_by
  ) values (
    p_document_key, next_number, trim(p_version_label), 'draft', p_effective_date,
    trim(p_title_hr), trim(p_title_en), trim(coalesce(p_summary_hr, '')),
    trim(coalesce(p_summary_en, '')), trim(p_content_hr), trim(p_content_en), p_actor
  ) returning * into new_version;

  update legal_documents set updated_at = now(), updated_by = p_actor where key = p_document_key;
  return new_version;
end;
$$;

create or replace function publish_legal_document_version(p_version_id uuid, p_actor uuid)
returns legal_document_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  target legal_document_versions;
begin
  select * into target from legal_document_versions where id = p_version_id for update;
  if target.id is null or target.status <> 'draft' then
    raise exception 'Objaviti se može samo trenutačni nacrt.';
  end if;
  perform pg_advisory_xact_lock(hashtext(target.document_key));
  update legal_document_versions set status = 'archived'
    where document_key = target.document_key and status = 'published';
  update legal_document_versions
    set status = 'published', published_at = now(), published_by = p_actor
    where id = target.id returning * into target;
  update legal_documents set updated_at = now(), updated_by = p_actor where key = target.document_key;
  return target;
end;
$$;

create or replace function restore_legal_document_version(p_version_id uuid, p_actor uuid)
returns legal_document_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  source legal_document_versions;
  next_number integer;
  restored legal_document_versions;
begin
  select * into source from legal_document_versions where id = p_version_id;
  if source.id is null then raise exception 'Verzija ne postoji.'; end if;
  perform pg_advisory_xact_lock(hashtext(source.document_key));
  update legal_document_versions set status = 'archived'
    where document_key = source.document_key and status = 'draft';
  select coalesce(max(version_number), 0) + 1 into next_number
    from legal_document_versions where document_key = source.document_key;
  insert into legal_document_versions (
    document_key, version_number, version_label, status, effective_date,
    title_hr, title_en, summary_hr, summary_en, content_hr, content_en,
    created_by, restored_from_id
  ) values (
    source.document_key, next_number, source.version_label || '-restore-' || next_number,
    'draft', source.effective_date, source.title_hr, source.title_en,
    source.summary_hr, source.summary_en, source.content_hr, source.content_en,
    p_actor, source.id
  ) returning * into restored;
  update legal_documents set updated_at = now(), updated_by = p_actor where key = source.document_key;
  return restored;
end;
$$;

revoke all on function save_legal_document_draft(text, text, date, text, text, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function publish_legal_document_version(uuid, uuid) from public, anon, authenticated;
revoke all on function restore_legal_document_version(uuid, uuid) from public, anon, authenticated;
grant execute on function save_legal_document_draft(text, text, date, text, text, text, text, text, text, uuid) to service_role;
grant execute on function publish_legal_document_version(uuid, uuid) to service_role;
grant execute on function restore_legal_document_version(uuid, uuid) to service_role;
