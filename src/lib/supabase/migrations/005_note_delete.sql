-- Allow room members to delete individual notes.

drop policy if exists "Members can delete room notes"
on public.notes;

create policy "Members can delete room notes"
on public.notes
for delete
to authenticated
using (
  (select private.is_room_member(room_id))
);

grant delete
on public.notes
to authenticated;
