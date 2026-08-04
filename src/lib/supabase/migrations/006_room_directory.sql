-- Allow authenticated users to discover every room from the home page.
-- Room membership, notes, and the room workspace remain protected by their
-- existing policies and the authenticated room route.

drop policy if exists "Members can view their rooms"
on public.rooms;

create policy "Authenticated users can view rooms"
on public.rooms
for select
to authenticated
using ((select auth.uid()) is not null);
