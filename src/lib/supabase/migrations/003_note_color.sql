-- ============================================================
-- Persist sticky-note colors
-- ============================================================

begin;


-- Existing notes receive the primary color when this migration runs.
alter table public.notes
  add column if not exists color text;

alter table public.notes
  alter column color set default 'primary',
  alter column color set not null;


-- Keep the stored value aligned with the UI color tokens.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_color_check'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
      add constraint notes_color_check
      check (color in ('primary', 'secondary', 'chart', 'muted'));
  end if;
end;
$$;


comment on column public.notes.color is
  'Sticky-note color token used by the room board UI';


commit;
