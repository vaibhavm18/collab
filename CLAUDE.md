# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm start      # next start
pnpm lint       # biome check
pnpm format     # biome format --write
```

There is no test runner in this repository. Per `AGENTS.md`, do not run `dev`, `build`, or `lint` yourself — the user runs them and reports errors back.

Required env vars in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the publishable key, not the legacy anon key). `getSupabaseConfig()` throws with a named-variable message when either is missing.

## Stack

Next.js 16 App Router (`next@16.2`), React 19, Tailwind v4 (CSS-first, no `tailwind.config`), Supabase (auth + Postgres + Realtime), `@xyflow/react` for the board canvas, Biome for lint/format, Hugeicons for icons, Lenis for smooth scroll.

`components.json` pins the shadcn `base-mira` style, so `src/components/ui/*` are built on `@base-ui/react` primitives (not Radix). Match that when adding UI components; install new ones with the shadcn CLI so the style/registry config is respected.

## Architecture

The app is CollabBoard: authenticated users create/join rooms and collaborate on draggable sticky notes in real time.

### Request-level session refresh

`src/proxy.ts` is Next 16's replacement for `middleware.ts` — do not rename it. It delegates to `updateSession()` in `src/lib/supabase/middleware.ts`, which recreates a server client per request and calls `supabase.auth.getClaims()` to refresh cookies. The rules in that file are load-bearing: no code between `createServerClient` and `getClaims()`, and the `supabaseResponse` object must be returned as-is or sessions break intermittently.

### Supabase clients (never instantiate inline)

`src/lib/supabase/clients/` holds the only three entry points:
- `client.ts` — browser client for `"use client"` code.
- `server.ts` — async cookie-backed client for Server Components/Actions; `setAll` swallows errors because RSCs cannot set cookies (the proxy handles refresh).
- `config.ts` — validates env once and is used by all of the above.

### Data access layer

`src/lib/supabase/queries/*.ts` are all `"use client"` modules and are the only place that touches Supabase tables. They return `DataResult<T>` (`{ data, error }`) instead of throwing, so callers render loading/empty/error states directly (see `AGENTS.md`). Types for every row and payload live in `src/lib/supabase/types.ts`.

The important invariant: **read paths call `joinRoom(roomId)` first.** `getRoom`, `getRoomNotes`, `getRoomMembers`, and `createNote` all await the `join_room` RPC and bail on its error before querying, because RLS scopes rows to room members and `join_room` is the idempotent membership upsert. Adding a new room-scoped query means following the same prelude.

`getRoomMembers` joins memberships to `profiles` with two queries plus a client-side map — there is no FK-embedded select — because profile visibility goes through a `SECURITY DEFINER` helper to avoid recursive RLS.

### Realtime: two channels per room

1. `room-notes:${roomId}` (`queries/notes.ts`) — `postgres_changes` for note INSERT/UPDATE/DELETE. INSERT/UPDATE are filtered by `room_id`; DELETE is deliberately **unfiltered** because Supabase cannot filter delete payloads, so subscribers must ignore deletes for notes they don't hold.
2. `${roomId}` (`queries/presence.ts`) — presence keyed by user id (online list + which note each user is editing) plus a `note-drag` broadcast for live drag positions. Payloads from other clients are validated with `isNoteDragPayload` and self-echoes are dropped. `subscribeToRoomPresence` returns a handle (`setEditingNote` / `clearEditingNote` / `broadcastNoteDrag` / `unsubscribe`); track calls are serialized through a promise chain so unsubscribe cannot race an in-flight `track()`.

### Auth flow

Auth is email/password via the client (`components/auth/login-dialog.tsx`). Guarding is per-route in Server Components: `app/room/[roomId]/page.tsx` calls `supabase.auth.getUser()` and redirects to `/?returnTo=<path>`; `app/page.tsx` sanitizes `returnTo` through `getRoomReturnPath` (only same-origin `/room/*` paths survive) and hands it to the login dialog. Keep that validation if you add new return-path entry points.

### Page composition

`app/room/[roomId]/page.tsx` is a thin server guard that renders `RoomPageClient`. `components/rooms/room-page-client.tsx` (~1000 lines) is the whole board: React Flow canvas, custom note nodes, presence sidebar, share/delete dialogs, and all subscription wiring. `app/page.tsx` composes `HomeNav` + `HeroSection` + `RoomList`.

## Database migrations

SQL lives in `src/lib/supabase/migrations/` (`001_table.sql` … `006_room_directory.sql`) and is applied by hand in the Supabase SQL editor; `supabase/seed.sql` is a demo seed to run afterwards. There is no `supabase/config.toml` and the CLI is not wired up.

Migrations are append-only and later files intentionally supersede earlier ones — e.g. `002` replaces `001`'s permissive policies with membership-based ones, and `006` drops `002`'s "Members can view their rooms" select policy so the home page can list all rooms. **Read the highest-numbered file that touches a table before reasoning about its current policies**, and add changes as a new numbered file rather than editing history.

Helper functions live in the `private` schema (`is_room_member`, `is_room_owner`, `is_realtime_room_member`, `can_view_profile`) and are `SECURITY DEFINER` specifically to break RLS recursion; public RPCs are `create_room` and `join_room`. `notes.created_by` / `rooms.created_by` are locked by trigger, so never send them from the client.

## Theming detail

`src/app/globals.css` imports Tailwind, `tw-animate-css`, `shadcn/tailwind.css`, `@xyflow/react` styles, and Lenis styles, then defines `:root` / `.dark` tokens. Note there are **two** `@theme inline` blocks (the second one wins for overlapping keys and adds chart/shadow/tracking mappings) — when adding a theme role, add the variable to both `:root` and `.dark` and expose it in the block that actually defines the utility you intend to use.

Note colors are a closed set: `NoteColor = "primary" | "secondary" | "chart" | "muted"`, persisted in `notes.color`.
