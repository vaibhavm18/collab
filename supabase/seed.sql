-- CollabBoard demo seed
--
-- Run the migrations in src/lib/supabase/migrations first, then run this
-- file in the Supabase SQL Editor. It is also compatible with the standard
-- Supabase CLI seed location: supabase/seed.sql.
--
-- Demo credentials for all ten users:
--   password: demo-password
--
-- These accounts and records are intentionally predictable for a demo. Do
-- not use these credentials or this seed against a production project.

begin;

-- Seed confirmed email/password users so the demo can be opened immediately.
-- The token columns use empty strings because the Auth service expects those
-- values to be non-null when a user is inserted directly for local/demo use.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'ari@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:00:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:00:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:00:00+05:30',
    timestamptz '2026-08-04 09:00:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'maya@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:05:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:05:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:05:00+05:30',
    timestamptz '2026-08-04 09:05:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'leo@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:10:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:10:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:10:00+05:30',
    timestamptz '2026-08-04 09:10:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'noa@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:15:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:15:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:15:00+05:30',
    timestamptz '2026-08-04 09:15:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'sam@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:20:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:20:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:20:00+05:30',
    timestamptz '2026-08-04 09:20:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000006',
    'authenticated',
    'authenticated',
    'priya@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:25:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:25:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:25:00+05:30',
    timestamptz '2026-08-04 09:25:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000007',
    'authenticated',
    'authenticated',
    'theo@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:30:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:30:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:30:00+05:30',
    timestamptz '2026-08-04 09:30:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000008',
    'authenticated',
    'authenticated',
    'zara@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:35:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:35:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:35:00+05:30',
    timestamptz '2026-08-04 09:35:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000009',
    'authenticated',
    'authenticated',
    'eli@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:40:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:40:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:40:00+05:30',
    timestamptz '2026-08-04 09:40:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000010',
    'authenticated',
    'authenticated',
    'june@collabboard.demo',
    crypt('demo-password', gen_salt('bf', 12)),
    timestamptz '2026-08-04 09:45:00+05:30',
    null,
    '',
    timestamptz '2026-08-04 09:45:00+05:30',
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    timestamptz '2026-08-04 09:45:00+05:30',
    timestamptz '2026-08-04 09:45:00+05:30',
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at,
  deleted_at = null,
  is_anonymous = false;

-- Email identities are required for password sign-in.
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '{"sub":"10000000-0000-4000-8000-000000000001","email":"ari@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:00:00+05:30',
    timestamptz '2026-08-04 09:00:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '{"sub":"10000000-0000-4000-8000-000000000002","email":"maya@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:05:00+05:30',
    timestamptz '2026-08-04 09:05:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    '{"sub":"10000000-0000-4000-8000-000000000003","email":"leo@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:10:00+05:30',
    timestamptz '2026-08-04 09:10:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000004',
    '{"sub":"10000000-0000-4000-8000-000000000004","email":"noa@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:15:00+05:30',
    timestamptz '2026-08-04 09:15:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000005',
    '{"sub":"10000000-0000-4000-8000-000000000005","email":"sam@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:20:00+05:30',
    timestamptz '2026-08-04 09:20:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000006',
    '{"sub":"10000000-0000-4000-8000-000000000006","email":"priya@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:25:00+05:30',
    timestamptz '2026-08-04 09:25:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000007',
    '{"sub":"10000000-0000-4000-8000-000000000007","email":"theo@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:30:00+05:30',
    timestamptz '2026-08-04 09:30:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000008',
    '{"sub":"10000000-0000-4000-8000-000000000008","email":"zara@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:35:00+05:30',
    timestamptz '2026-08-04 09:35:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000009',
    '{"sub":"10000000-0000-4000-8000-000000000009","email":"eli@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:40:00+05:30',
    timestamptz '2026-08-04 09:40:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000010',
    '{"sub":"10000000-0000-4000-8000-000000000010","email":"june@collabboard.demo","email_verified":true}'::jsonb,
    'email',
    null,
    timestamptz '2026-08-04 09:45:00+05:30',
    timestamptz '2026-08-04 09:45:00+05:30'
  )
on conflict do nothing;

-- The auth trigger creates these rows; this upsert also makes the display
-- names explicit and keeps the seed correct if the trigger already ran.
insert into public.profiles (id, display_name, created_at)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Ari',
    timestamptz '2026-08-04 09:00:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Maya',
    timestamptz '2026-08-04 09:05:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Leo',
    timestamptz '2026-08-04 09:10:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Noa',
    timestamptz '2026-08-04 09:15:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Sam',
    timestamptz '2026-08-04 09:20:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'Priya',
    timestamptz '2026-08-04 09:25:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'Theo',
    timestamptz '2026-08-04 09:30:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'Zara',
    timestamptz '2026-08-04 09:35:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    'Eli',
    timestamptz '2026-08-04 09:40:00+05:30'
  ),
  (
    '10000000-0000-4000-8000-000000000010',
    'June',
    timestamptz '2026-08-04 09:45:00+05:30'
  )
on conflict (id) do update
set display_name = excluded.display_name;

insert into public.rooms (id, name, created_by, created_at)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'Launch week planning',
    '10000000-0000-4000-8000-000000000001',
    timestamptz '2026-08-04 09:20:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Ideas and experiments',
    '10000000-0000-4000-8000-000000000002',
    timestamptz '2026-08-03 15:45:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Design critique',
    '10000000-0000-4000-8000-000000000006',
    timestamptz '2026-08-02 13:10:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'Sprint retro',
    '10000000-0000-4000-8000-000000000007',
    timestamptz '2026-08-01 11:30:00+05:30'
  )
on conflict (id) do update
set name = excluded.name;

insert into public.room_members (room_id, user_id, role, joined_at)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'owner',
    timestamptz '2026-08-04 09:20:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'member',
    timestamptz '2026-08-04 09:22:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    'member',
    timestamptz '2026-08-04 09:24:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'owner',
    timestamptz '2026-08-03 15:45:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'member',
    timestamptz '2026-08-03 15:48:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000006',
    'owner',
    timestamptz '2026-08-02 13:10:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000004',
    'member',
    timestamptz '2026-08-02 13:12:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000005',
    'member',
    timestamptz '2026-08-02 13:14:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000008',
    'member',
    timestamptz '2026-08-02 13:16:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000009',
    'member',
    timestamptz '2026-08-02 13:18:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000007',
    'owner',
    timestamptz '2026-08-01 11:30:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000003',
    'member',
    timestamptz '2026-08-01 11:32:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000009',
    'member',
    timestamptz '2026-08-01 11:34:00+05:30'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000010',
    'member',
    timestamptz '2026-08-01 11:36:00+05:30'
  )
on conflict (room_id, user_id) do update
set
  role = excluded.role,
  joined_at = excluded.joined_at;

insert into public.notes (
  id,
  room_id,
  content,
  position_x,
  position_y,
  created_by,
  created_at,
  updated_at,
  color
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Keep the first-run experience calm and obvious.',
    80,
    80,
    '10000000-0000-4000-8000-000000000001',
    timestamptz '2026-08-04 09:30:00+05:30',
    timestamptz '2026-08-04 09:30:00+05:30',
    'primary'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Add a short walkthrough before the first collaboration session.',
    390,
    110,
    '10000000-0000-4000-8000-000000000002',
    timestamptz '2026-08-04 09:34:00+05:30',
    timestamptz '2026-08-04 09:34:00+05:30',
    'secondary'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    'Realtime feels great when cursor movement stays lightweight.',
    170,
    330,
    '10000000-0000-4000-8000-000000000003',
    timestamptz '2026-08-04 09:38:00+05:30',
    timestamptz '2026-08-04 09:38:00+05:30',
    'chart'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000001',
    'Demo script: open two browser windows and move a note in each.',
    610,
    300,
    '10000000-0000-4000-8000-000000000001',
    timestamptz '2026-08-04 09:42:00+05:30',
    timestamptz '2026-08-04 09:42:00+05:30',
    'muted'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000002',
    'What if every idea started as a shared note?',
    120,
    100,
    '10000000-0000-4000-8000-000000000002',
    timestamptz '2026-08-03 16:00:00+05:30',
    timestamptz '2026-08-03 16:00:00+05:30',
    'primary'
  ),
  (
    '30000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000002',
    'Try a room with a small group before adding more structure.',
    460,
    180,
    '10000000-0000-4000-8000-000000000001',
    timestamptz '2026-08-03 16:05:00+05:30',
    timestamptz '2026-08-03 16:05:00+05:30',
    'secondary'
  ),
  (
    '30000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000002',
    'A good empty state should invite the next action.',
    260,
    390,
    '10000000-0000-4000-8000-000000000002',
    timestamptz '2026-08-03 16:10:00+05:30',
    timestamptz '2026-08-03 16:10:00+05:30',
    'chart'
  ),
  (
    '30000000-0000-4000-8000-000000000008',
    '20000000-0000-4000-8000-000000000003',
    'The hierarchy is clear, but the first glance feels a little dense.',
    100,
    90,
    '10000000-0000-4000-8000-000000000006',
    timestamptz '2026-08-02 13:30:00+05:30',
    timestamptz '2026-08-02 13:30:00+05:30',
    'primary'
  ),
  (
    '30000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000003',
    'Could the empty state show one example note before people start?',
    430,
    150,
    '10000000-0000-4000-8000-000000000004',
    timestamptz '2026-08-02 13:34:00+05:30',
    timestamptz '2026-08-02 13:34:00+05:30',
    'secondary'
  ),
  (
    '30000000-0000-4000-8000-000000000010',
    '20000000-0000-4000-8000-000000000003',
    'The collaboration signal should feel visible without being noisy.',
    230,
    360,
    '10000000-0000-4000-8000-000000000008',
    timestamptz '2026-08-02 13:38:00+05:30',
    timestamptz '2026-08-02 13:38:00+05:30',
    'chart'
  ),
  (
    '30000000-0000-4000-8000-000000000011',
    '20000000-0000-4000-8000-000000000004',
    'Keep the retro focused on moments we can actually change.',
    100,
    120,
    '10000000-0000-4000-8000-000000000007',
    timestamptz '2026-08-01 11:50:00+05:30',
    timestamptz '2026-08-01 11:50:00+05:30',
    'primary'
  ),
  (
    '30000000-0000-4000-8000-000000000012',
    '20000000-0000-4000-8000-000000000004',
    'One small experiment is better than five vague action items.',
    450,
    170,
    '10000000-0000-4000-8000-000000000009',
    timestamptz '2026-08-01 11:54:00+05:30',
    timestamptz '2026-08-01 11:54:00+05:30',
    'secondary'
  ),
  (
    '30000000-0000-4000-8000-000000000013',
    '20000000-0000-4000-8000-000000000004',
    'Celebrate the quiet wins: fewer handoffs, faster feedback, happier teams.',
    270,
    390,
    '10000000-0000-4000-8000-000000000010',
    timestamptz '2026-08-01 11:58:00+05:30',
    timestamptz '2026-08-01 11:58:00+05:30',
    'muted'
  )
on conflict (id) do update
set
  content = excluded.content,
  position_x = excluded.position_x,
  position_y = excluded.position_y,
  updated_at = excluded.updated_at,
  color = excluded.color;

commit;
