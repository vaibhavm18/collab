-- =========================================================
-- Collaboration Rooms + Sticky Notes
-- =========================================================

-- ---------------------------------------------------------
-- 1. Rooms table
-- ---------------------------------------------------------

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(trim(name)) > 0),

  created_by uuid not null
    default auth.uid()
    references auth.users(id),

  created_at timestamptz not null
    default now()
);

comment on table public.rooms is
  'Collaboration rooms created by authenticated users';


-- ---------------------------------------------------------
-- 2. Notes table
-- ---------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),

  room_id uuid not null
    references public.rooms(id)
    on delete cascade,

  content text not null
    check (char_length(trim(content)) > 0),

  position_x double precision not null
    default 0,

  position_y double precision not null
    default 0,

  created_by uuid not null
    default auth.uid()
    references auth.users(id),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);

comment on table public.notes is
  'Sticky notes belonging to collaboration rooms';


-- ---------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------

-- Room list sorted newest first
create index if not exists rooms_created_at_idx
  on public.rooms (created_at desc);

-- Quickly load notes for one room
create index if not exists notes_room_id_idx
  on public.notes (room_id);

-- Useful when loading room notes in creation order
create index if not exists notes_room_id_created_at_idx
  on public.notes (room_id, created_at);


-- ---------------------------------------------------------
-- 4. Automatically maintain notes.updated_at
-- ---------------------------------------------------------

create or replace function public.set_note_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_notes_updated_at on public.notes;

create trigger set_notes_updated_at
before update on public.notes
for each row
execute function public.set_note_updated_at();


-- ---------------------------------------------------------
-- 5. Prevent ownership fields from being changed
-- ---------------------------------------------------------

create or replace function public.prevent_ownership_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_room_ownership_change
  on public.rooms;

create trigger prevent_room_ownership_change
before update on public.rooms
for each row
execute function public.prevent_ownership_change();

drop trigger if exists prevent_note_ownership_change
  on public.notes;

create trigger prevent_note_ownership_change
before update on public.notes
for each row
execute function public.prevent_ownership_change();


-- ---------------------------------------------------------
-- 6. Enable Row Level Security
-- ---------------------------------------------------------

alter table public.rooms enable row level security;
alter table public.notes enable row level security;


-- Remove policies first so this script can be rerun
drop policy if exists "Authenticated users can view rooms"
  on public.rooms;

drop policy if exists "Authenticated users can create rooms"
  on public.rooms;

drop policy if exists "Room creators can update rooms"
  on public.rooms;

drop policy if exists "Room creators can delete rooms"
  on public.rooms;

drop policy if exists "Authenticated users can view notes"
  on public.notes;

drop policy if exists "Authenticated users can create notes"
  on public.notes;

drop policy if exists "Authenticated users can update notes"
  on public.notes;


-- ---------------------------------------------------------
-- 7. Rooms policies
-- ---------------------------------------------------------

-- Simplest demo:
-- every authenticated user can view every room.
create policy "Authenticated users can view rooms"
on public.rooms
for select
to authenticated
using ((select auth.uid()) is not null);


-- Users can create rooms only as themselves.
create policy "Authenticated users can create rooms"
on public.rooms
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and created_by = (select auth.uid())
);


-- Optional management policies:
-- only the creator can rename or delete a room.
create policy "Room creators can update rooms"
on public.rooms
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));


create policy "Room creators can delete rooms"
on public.rooms
for delete
to authenticated
using (created_by = (select auth.uid()));


-- ---------------------------------------------------------
-- 8. Notes policies
-- ---------------------------------------------------------

-- Every authenticated user can view notes in accessible rooms.
create policy "Authenticated users can view notes"
on public.notes
for select
to authenticated
using (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.rooms
    where rooms.id = notes.room_id
  )
);


-- Users can create notes only as themselves and only in
-- an existing room.
create policy "Authenticated users can create notes"
on public.notes
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and created_by = (select auth.uid())
  and exists (
    select 1
    from public.rooms
    where rooms.id = notes.room_id
  )
);


-- Collaboration behaviour:
-- every authenticated user can move or edit notes.
create policy "Authenticated users can update notes"
on public.notes
for update
to authenticated
using (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.rooms
    where rooms.id = notes.room_id
  )
)
with check (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.rooms
    where rooms.id = notes.room_id
  )
);


-- No DELETE policy is created for notes because deleting
-- individual notes is not required for the initial demo.
-- Notes are still deleted automatically when their room
-- is deleted because of ON DELETE CASCADE.


-- ---------------------------------------------------------
-- 9. Explicit API privileges
-- ---------------------------------------------------------

grant select, insert, update, delete
on table public.rooms
to authenticated;

grant select, insert, update
on table public.notes
to authenticated;


-- ---------------------------------------------------------
-- 10. Enable Supabase Realtime
-- ---------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime
      add table public.rooms;
  end if;

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