-- ============================================================
-- User display profiles for room members
-- ============================================================

begin;


-- Keep display data separate from auth.users and never expose raw emails
-- through the public Data API.
create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text not null
    check (char_length(trim(display_name)) > 0),

  created_at timestamptz not null
    default now()
);

comment on table public.profiles is
  'Display-safe user information for authenticated room collaboration';

comment on column public.profiles.display_name is
  'Email prefix before @, stored for display without exposing the email';


-- Create or refresh a profile from the email prefix whenever an auth user
-- is created or their email changes.
create or replace function private.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
      'User'
    )
  )
  on conflict (id) do update
  set display_name = excluded.display_name;

  return new;
end;
$$;

revoke all on function private.sync_user_profile() from public;

drop trigger if exists sync_user_profile on auth.users;

create trigger sync_user_profile
after insert or update of email on auth.users
for each row
execute function private.sync_user_profile();


-- Backfill users that existed before this migration.
insert into public.profiles (
  id,
  display_name
)
select
  users.id,
  coalesce(
    nullif(trim(split_part(coalesce(users.email, ''), '@', 1)), ''),
    'User'
  )
from auth.users as users
on conflict (id) do nothing;


-- SECURITY DEFINER avoids recursive room_members RLS checks while finding
-- profiles belonging to rooms shared with the current user.
create or replace function private.can_view_profile(
  requested_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members as viewer_membership
    join public.room_members as target_membership
      on target_membership.room_id = viewer_membership.room_id
    where viewer_membership.user_id = (select auth.uid())
      and target_membership.user_id = requested_user_id
  );
$$;

revoke all on function private.can_view_profile(uuid) from public;
grant execute on function private.can_view_profile(uuid)
  to authenticated;


-- Profiles are readable only by users who share a room with the profile
-- owner. A user may also read their own profile.
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "Room members can view profiles"
  on public.profiles;

create policy "Room members can view profiles"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.can_view_profile(id))
);


-- The application only reads profiles. The trigger above owns profile
-- creation and synchronization.
revoke all on public.profiles
  from anon, authenticated;

grant select
on public.profiles
to authenticated;


commit;
