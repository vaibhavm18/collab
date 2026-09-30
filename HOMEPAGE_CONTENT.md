# CollabBoard Homepage — Content Inventory

This file lists all the content and behavior on the current homepage (`src/app/page.tsx`) and the components it renders. It leaves out visual styling on purpose, so a new design can start fresh without copying the current look.

Every string below appears exactly as it does in the code. Anything in `{curly braces}` is dynamic.

---

## 1. Product & brand basics

| Item | Value |
| --- | --- |
| Product name | CollabBoard |
| Logo mark | The letter **C** in a rounded tile (no image logo exists) |
| Brand tagline (nav subtitle) | Shared workspace |
| Site description (meta / OG / Twitter) | A collaborative workspace for teams to shape ideas and move forward together. |
| Page `<title>` | CollabBoard (sub-pages use `%s \| CollabBoard`) |
| OG image alt | CollabBoard — a collaborative workspace for teams |
| What the product does | Signed-in users create or join **rooms** and work together on draggable **sticky notes** in real time, with live presence (who is online, who is editing which note, live drag positions). |
| Note colors (closed set) | primary, secondary, chart, muted |

### OG / social share image text (`src/app/opengraph-image.tsx`)
- Logo: **C** + "CollabBoard"
- Headline: **Make good ideas easier to see.**
- Subline: One shared room to shape thoughts, align on what matters, and move forward together.

---

## 2. Page structure (top to bottom)

1. Navigation bar (fixed at the top)
2. Hero section (`#top`)
3. Room directory (`#rooms`)
4. Footer

---

## 3. Navigation bar — `components/home/home-nav.tsx`

**Left: brand link** → `/`
- Logo mark: "C"
- Name: **CollabBoard**
- Subtitle: Shared workspace (hidden on mobile)
- Accessible label: "CollabBoard home"

**Right: actions**
- Link: **Browse rooms** → `#rooms` (hidden on mobile)
- Theme toggle (icon button, moon/sun)
  - aria-label: "Switch to dark theme" / "Switch to light theme"
- Auth actions (`components/auth/auth-actions.tsx`), which depend on session state:
  - **Loading:** a skeleton placeholder, so "Log in" never flashes for a signed-in user
  - **Signed out:** **Log in** button (opens the Auth dialog, see §7)
    - If the URL has a valid `?returnTo=/room/...`, the dialog **auto-opens in Register mode** and sends the user back to that room after sign-in.
  - **Signed in:** **Create room** button (opens the Create Room dialog, see §8) + **Log out** button (label changes to "Logging out..." while it runs)

---

## 4. Hero section — `components/home/hero-section.tsx`

- **Eyebrow label:** Collaborative workspace
- **Headline (H1):** Make good ideas easier to **see.** ("see." is highlighted)
- **Subheadline:** Bring your team into one shared room to shape thoughts, align on what matters, and move forward together.
- **Primary CTA** (`hero-action.tsx`): **Start a new room ↗**
  - Loading: skeleton placeholder
  - Signed out: opens the Auth dialog
  - Signed in: opens the Create Room dialog
- **Helper text next to the CTA:** Sign in to save and share your room.
- **3-step "how it works" list:**
  1. **01** — Create a room
  2. **02** — Invite your team
  3. **03** — Decide together

### Hero visual: mock board preview — `components/home/board-preview.tsx`
A static illustration of a live board. It is decorative and not interactive.

- **Board header**
  - Room name: **Product brainstorm**
  - Status: 3 people online
  - Avatar stack: **M**, **A**, **J**
- **Canvas** (dotted grid) with 3 sticky notes, each with a color accent:
  | Note text | Author · time |
  | --- | --- |
  | Improve the onboarding flow | Maya · just now |
  | Make the main action clearer | Alex · 2 min ago |
  | Review mobile spacing | Jordan · 5 min ago |
- **Live cursors** with name tags: **Maya**, **Alex**
- **Board footer status:** Live board · Changes saved automatically (with a green "live" dot)
- **Floating callout card:**
  - Text: Everyone is on the same page
  - Progress bar: **72%**

---

## 5. Room directory — `components/rooms/room-list.tsx` (`#rooms`)

**Section header**
- Eyebrow: Room directory
- Heading (H2): **Find your next shared space.**
- Description: Browse every room in the workspace and join the conversation that matters next.
- Count badge (signed-in only): `{n} room` / `{n} rooms`

**States (the new design needs all of these):**

| State | Content |
| --- | --- |
| **Loading** (session resolving, or rooms fetching) | 3 skeleton cards |
| **Signed out** | Lock icon · Title: **Sign in to browse rooms** · Body: Your room directory is available once you are signed in. Join room actions stay locked until then. |
| **Error** | Message: We couldn't load your rooms. Please try again. · Button: **Try again** |
| **Join error** | Message: We couldn't join that room. Please try again. |
| **Empty** (signed in, 0 rooms) | Door icon · Title: **No rooms yet** · Body: Start a room for your next idea, then invite your team to shape it together. · Button: **Create your first room** (opens the Create Room dialog) |
| **List** | Grid of room cards (below) |

**Room card** (one per room)
- Title: `{room.name}` (truncated if too long)
- Meta: `Created {date}`, for example "Created 25 Sep 2026" (format: day, short month, year)
- Tag: SHARED WORKSPACE
- Button: **Join room →**, which shows "Joining…" while running and is disabled when signed out
- On success: goes to `/room/{roomId}`

Data available per room (from `Room` type): `id`, `name`, `created_at`, `created_by`. The homepage does **not** show member counts, note counts, activity, or owner, because that data isn't fetched here today.

---

## 6. Footer — `src/app/page.tsx`

- Logo mark "C" + **CollabBoard**
- Link: **Browse rooms** → `#rooms`
- Copyright: `© {current year} CollabBoard`

---

## 7. Auth dialog — `components/auth/login-dialog.tsx`

Opened by the "Log in" button in the nav and the hero CTA when signed out. It has two modes.

| | Login mode | Register mode |
| --- | --- | --- |
| Title | Welcome back | Create your account |
| Description | Sign in to continue where you left off. | Create an account to save your work. |
| Password placeholder | Enter your password | At least 6 characters |
| Submit button | Sign in → | Create account → |
| Submitting label | Signing in | Creating account |
| Mode switch link | New here? Create an account | Already have an account? Sign in |

**Fields**
- Label **Email address**, placeholder `you@example.com` (mail icon)
- Label **Password** (lock icon) + show/hide toggle (aria: "Show password" / "Hide password")

**Messages**
- Error: the message from Supabase, or the fallback "Something went wrong. Please try again."
- Success after sign-up (email confirmation required): Account created. Check your email to confirm your address.

**Redirecting state** (when signing in from a `returnTo` link)
- Spinner · Title: **Joining your room…** · Body: Signing you in and loading the shared workspace.

---

## 8. Create Room dialog — `components/rooms/create-room-dialog.tsx`

Opened by "Create room" in the nav, "Start a new room" in the hero, and "Create your first room" in the empty state.

- Door icon
- Title: **Start a new room**
- Description: Give your shared workspace a name. You can invite your team once it is ready.
- Field label: **Room name**, placeholder `Product brainstorm`, max 120 characters
- Submit: **Create room →**, which shows "Creating room..." while running
- Errors:
  - Empty name: Give your room a name to continue.
  - Not authorized: Please log in before creating a room.
  - Other: the message from Supabase, or the fallback "We couldn't create your room. Try again."
- On success: goes to `/room/{newRoomId}`

---

## 9. Functional constraints a redesign must keep

- **Auth-aware UI:** the nav actions, the hero CTA, and the room directory all have three states: *loading* (skeleton), *signed out*, and *signed in*. Don't render a guessed state before the session resolves.
- **`returnTo` flow:** `/?returnTo=/room/<id>` auto-opens the auth dialog in register mode and redirects after sign-in. Only same-origin `/room/*` paths are accepted (see `getRoomReturnPath` in `page.tsx`).
- **Anchor targets:** `#top` (hero) and `#rooms` (directory) are linked from the nav and footer.
- **Theme:** light and dark mode with a manual toggle, stored in `localStorage` under `theme`.
- **Smooth scrolling** (Lenis) wraps the whole app.
- **Fonts currently loaded:** Inter (body), Plus Jakarta Sans (headings), Geist Mono (mono). These can be changed.
- **Icons:** Hugeicons (`@hugeicons/core-free-icons`).
- **UI primitives:** shadcn `base-mira` style on `@base-ui/react` (Button, Card, Badge, Skeleton, Dialog, Input, Label).

---

## 10. Content gaps / opportunities (for the redesign)

These are **not** in the current page. They are listed so the redesign can decide whether to add them:
- No feature list or explanation of the real-time capabilities (presence, live drag, "who's editing", note colors), even though the product supports all of them.
- No social proof, use cases, or FAQ.
- The room cards only show name and creation date. Richer metadata would need new queries.
- The footer has no secondary links (about, privacy, GitHub, etc.).
- The hero preview uses made-up people (Maya, Alex, Jordan) and a made-up "72%" metric that doesn't correspond to a real feature.
