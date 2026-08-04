-- ============================================================
-- Membership-based collaboration rooms migration
-- ============================================================

begin;


-- ============================================================
-- 1. Validate existing rooms table
-- ============================================================

alter table public.rooms
  alter column id set default gen_random_uuid(),
  alter column name set not null,
  alter column created_by set not null,
  alter column created_by set default auth.uid(),
  alter column created_at set not null,
  alter column created_at set default now();


-- Ensure rooms.created_by references Supabase Auth.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_created_by_fkey'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_created_by_fkey
      foreign key (created_by)
      references auth.users(id);
  end if;
end;
$$;


-- Prevent blank room names.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_name_not_blank'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_name_not_blank
      check (char_length(trim(name)) > 0);
  end if;
end;
$$;


-- ============================================================
-- 2. Create room_members
-- ============================================================

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),

  room_id uuid not null
    references public.rooms(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id),

  role text not null
    default 'member'
    check (role in ('owner', 'member')),

  joined_at timestamptz not null
    default now(),

  constraint room_members_room_id_user_id_key
    unique (room_id, user_id)
);

comment on table public.room_members is
  'Persistent room membership and room access source of truth';

comment on column public.room_members.role is
  'Room role: owner or member. Both roles have equal note permissions in the demo.';


-- ============================================================
-- 3. Update notes table
-- ============================================================

alter table public.notes
  alter column id set default gen_random_uuid(),
  alter column room_id set not null,
  alter column content set not null,
  alter column position_x set not null,
  alter column position_y set not null,
  alter column created_by set not null,
  alter column created_by set default auth.uid(),
  alter column created_at set not null,
  alter column created_at set default now(),
  alter column updated_at set not null,
  alter column updated_at set default now();


-- Ensure notes.room_id uses ON DELETE CASCADE.
do $$
declare
  constraint_name text;
begin
  select conname
  into constraint_name
  from pg_constraint
  where conrelid = 'public.notes'::regclass
    and contype = 'f'
    and confrelid = 'public.rooms'::regclass
    and conkey = array[
      (
        select attnum
        from pg_attribute
        where attrelid = 'public.notes'::regclass
          and attname = 'room_id'
      )
    ]::smallint[]
  limit 1;

  if constraint_name is not null then
    execute format(
      'alter table public.notes drop constraint %I',
      constraint_name
    );
  end if;

  alter table public.notes
    add constraint notes_room_id_fkey
    foreign key (room_id)
    references public.rooms(id)
    on delete cascade;
end;
$$;


-- Ensure notes.created_by references Supabase Auth.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_created_by_fkey'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
      add constraint notes_created_by_fkey
      foreign key (created_by)
      references auth.users(id);
  end if;
end;
$$;


-- Prevent blank notes.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_content_not_blank'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
      add constraint notes_content_not_blank
      check (char_length(trim(content)) > 0);
  end if;
end;
$$;


-- ============================================================
-- 4. Backfill memberships for existing rooms
-- ============================================================

-- Every existing room creator becomes that room's owner.
insert into public.room_members (
  room_id,
  user_id,
  role,
  joined_at
)
select
  rooms.id,
  rooms.created_by,
  'owner',
  rooms.created_at
from public.rooms
on conflict (room_id, user_id) do update
set role = 'owner';


-- Optional but useful for preserving access to existing notes:
-- add historical note creators as normal room members.
insert into public.room_members (
  room_id,
  user_id,
  role
)
select distinct
  notes.room_id,
  notes.created_by,
  'member'
from public.notes
join public.rooms
  on rooms.id = notes.room_id
where notes.created_by <> rooms.created_by
on conflict (room_id, user_id) do nothing;


-- ============================================================
-- 5. Required indexes
-- ============================================================

create index if not exists room_members_room_id_idx
  on public.room_members (room_id);

create index if not exists room_members_user_id_idx
  on public.room_members (user_id);

create index if not exists notes_room_id_idx
  on public.notes (room_id);

create index if not exists rooms_created_by_idx
  on public.rooms (created_by);


-- Useful for the home-page room list.
create index if not exists room_members_user_id_joined_at_idx
  on public.room_members (user_id, joined_at desc);


-- The unique constraint already creates a unique index for:
-- room_members(room_id, user_id)


-- ============================================================
-- 6. Private authorization helper functions
-- ============================================================

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;


-- SECURITY DEFINER prevents recursive room_members RLS checks.
create or replace function private.is_room_member(
  requested_room_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_members.room_id = requested_room_id
      and room_members.user_id = (select auth.uid())
  );
$$;


create or replace function private.is_room_owner(
  requested_room_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_members.room_id = requested_room_id
      and room_members.user_id = (select auth.uid())
      and room_members.role = 'owner'
  );
$$;


-- Used by Realtime Broadcast and Presence authorization.
-- The client channel topic must equal the room UUID string.
create or replace function private.is_realtime_room_member(
  requested_topic text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_members.room_id::text = requested_topic
      and room_members.user_id = (select auth.uid())
  );
$$;


revoke all on function private.is_room_member(uuid) from public;
revoke all on function private.is_room_owner(uuid) from public;
revoke all on function private.is_realtime_room_member(text) from public;

grant execute on function private.is_room_member(uuid)
  to authenticated;

grant execute on function private.is_room_owner(uuid)
  to authenticated;

grant execute on function private.is_realtime_room_member(text)
  to authenticated;


-- ============================================================
-- 7. Atomic room creation function
-- ============================================================

create or replace function public.create_room(
  room_name text
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  created_room public.rooms;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if room_name is null or char_length(trim(room_name)) = 0 then
    raise exception 'Room name is required'
      using errcode = '22023';
  end if;

  insert into public.rooms (
    name,
    created_by
  )
  values (
    trim(room_name),
    current_user_id
  )
  returning *
  into created_room;

  insert into public.room_members (
    room_id,
    user_id,
    role
  )
  values (
    created_room.id,
    current_user_id,
    'owner'
  );

  return created_room;
end;
$$;


revoke all on function public.create_room(text) from public;
grant execute on function public.create_room(text)
  to authenticated;


-- ============================================================
-- 8. Join-room function
-- ============================================================

create or replace function public.join_room(
  requested_room_id uuid
)
returns public.room_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  membership public.room_members;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.rooms
    where rooms.id = requested_room_id
  ) then
    raise exception 'Room not found'
      using errcode = 'P0002';
  end if;

  select *
  into membership
  from public.room_members
  where room_members.room_id = requested_room_id
    and room_members.user_id = current_user_id;

  if membership.id is not null then
    return membership;
  end if;

  insert into public.room_members (
    room_id,
    user_id,
    role
  )
  values (
    requested_room_id,
    current_user_id,
    'member'
  )
  returning *
  into membership;

  return membership;
end;
$$;


revoke all on function public.join_room(uuid) from public;
grant execute on function public.join_room(uuid)
  to authenticated;


-- ============================================================
-- 9. updated_at and immutable-column triggers
-- ============================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


drop trigger if exists set_notes_updated_at
  on public.notes;

create trigger set_notes_updated_at
before update on public.notes
for each row
execute function private.set_updated_at();


create or replace function private.protect_room_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Room ID cannot be changed';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Room creator cannot be changed';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Room creation date cannot be changed';
  end if;

  return new;
end;
$$;


drop trigger if exists protect_room_columns
  on public.rooms;

create trigger protect_room_columns
before update on public.rooms
for each row
execute function private.protect_room_columns();


create or replace function private.protect_note_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Note ID cannot be changed';
  end if;

  if new.room_id is distinct from old.room_id then
    raise exception 'A note cannot be moved to another room';
  end if;

  if new.created_by is distinct from old.created_by then
    raise exception 'Note creator cannot be changed';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Note creation date cannot be changed';
  end if;

  return new;
end;
$$;


drop trigger if exists protect_note_columns
  on public.notes;

create trigger protect_note_columns
before update on public.notes
for each row
execute function private.protect_note_columns();


-- ============================================================
-- 10. Enable RLS
-- ============================================================

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.notes enable row level security;


-- Force table owners to respect RLS during ordinary access.
alter table public.rooms force row level security;
alter table public.room_members force row level security;
alter table public.notes force row level security;


-- ============================================================
-- 11. Remove previous application-table policies
-- ============================================================

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('rooms', 'room_members', 'notes')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;


-- ============================================================
-- 12. Rooms policies
-- ============================================================

-- A room appears only to its persistent members.
create policy "Members can view their rooms"
on public.rooms
for select
to authenticated
using (
  (select private.is_room_member(id))
);


-- Only an owner can rename a room.
create policy "Owners can update their rooms"
on public.rooms
for update
to authenticated
using (
  (select private.is_room_owner(id))
)
with check (
  (select private.is_room_owner(id))
  and created_by = (select auth.uid())
);


-- Only an owner can delete a room.
-- Related memberships and notes are deleted by cascading FKs.
create policy "Owners can delete their rooms"
on public.rooms
for delete
to authenticated
using (
  (select private.is_room_owner(id))
);


-- There is intentionally no direct INSERT policy.
-- Rooms must be created through public.create_room(), ensuring
-- the owner membership is created in the same transaction.


-- ============================================================
-- 13. Room membership policies
-- ============================================================

-- Members can read membership rows for rooms they belong to.
create policy "Members can view room memberships"
on public.room_members
for select
to authenticated
using (
  (select private.is_room_member(room_id))
);


-- Users can join a room only as themselves and only as member.
-- The join_room() RPC is still the preferred client API.
create policy "Users can join rooms as members"
on public.room_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'member'
  and exists (
    select 1
    from public.rooms
    where rooms.id = room_members.room_id
  )
);


-- No UPDATE policy:
-- users cannot promote themselves or change membership ownership.

-- No DELETE policy:
-- leaving rooms is not part of the initial demo.


-- ============================================================
-- 14. Notes policies
-- ============================================================

create policy "Members can view room notes"
on public.notes
for select
to authenticated
using (
  (select private.is_room_member(room_id))
);


create policy "Members can create room notes"
on public.notes
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_room_member(room_id))
);


-- Both owners and members can update note content and position.
create policy "Members can update room notes"
on public.notes
for update
to authenticated
using (
  (select private.is_room_member(room_id))
)
with check (
  (select private.is_room_member(room_id))
);


-- No DELETE policy because note deletion is not required.
-- Room deletion still cascades to related notes.


-- ============================================================
-- 15. API privileges
-- ============================================================

revoke all on public.rooms
  from anon, authenticated;

revoke all on public.room_members
  from anon, authenticated;

revoke all on public.notes
  from anon, authenticated;


grant select, update, delete
on public.rooms
to authenticated;

grant select, insert
on public.room_members
to authenticated;

grant select, insert, update
on public.notes
to authenticated;


-- ============================================================
-- 16. Supabase Realtime Postgres Changes
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notes'
  ) then
    alter publication supabase_realtime
      add table public.notes;
  end if;
end;
$$;


-- ============================================================
-- 17. Realtime Broadcast and Presence authorization
-- ============================================================

-- Remove only policies created by this migration if rerun.
drop policy if exists
  "Room members can receive realtime messages"
  on realtime.messages;

drop policy if exists
  "Room members can send realtime messages"
  on realtime.messages;


-- Members may receive Broadcast and Presence messages only for
-- a topic equal to their room UUID.
create policy "Room members can receive realtime messages"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and (
    select private.is_realtime_room_member(
      realtime.topic()
    )
  )
);


-- Members may send cursor broadcasts and track Presence only
-- for rooms they have joined.
create policy "Room members can send realtime messages"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension in ('broadcast', 'presence')
  and (
    select private.is_realtime_room_member(
      realtime.topic()
    )
  )
);


commit;