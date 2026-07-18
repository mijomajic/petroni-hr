-- Create and confirm the info@petroni.hr user in Supabase Authentication first.
-- The existing administrator remains active as a recovery account until the new
-- login has been verified in production.
do $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = 'info@petroni.hr'
  limit 1;

  if target_user_id is null then
    raise exception 'Create and confirm the Supabase Auth user info@petroni.hr before applying migration 0021.';
  end if;

  insert into admin_users (user_id, email, role, is_active)
  values (target_user_id, 'info@petroni.hr', 'admin', true)
  on conflict (user_id) do update
  set email = excluded.email,
      role = excluded.role,
      is_active = true;
end $$;
