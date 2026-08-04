<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Structure

- `src/app/` contains the Next.js App Router entry points, layout, page, and global styles.
- `src/components/ui/` contains reusable shadcn-style UI components.
- `src/lib/` contains shared utilities such as `cn` helpers.
- `public/` contains static assets served from the site root.
- `components.json` and `src/app/globals.css` define the shadcn and Tailwind configuration.

## Development Commands

- `pnpm dev` starts the local development server.
- `pnpm build` creates a production build.
- `pnpm start` serves the production build locally.
- `pnpm lint` runs Biome checks.
- `pnpm format` formats supported files with Biome.

Use `pnpm` consistently because the repository includes `pnpm-lock.yaml`.

## CSS and Theming

Use Tailwind utility classes and the semantic CSS variables defined in `src/app/globals.css`. Prefer tokens such as `bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, and `ring-ring` instead of literal colors such as `bg-white`, `text-black`, or arbitrary hex/OKLCH values.

Use foreground tokens for readable content paired with their surface token, for example:

```tsx
<div className="bg-primary text-primary-foreground" />
<div className="bg-card text-card-foreground border-border" />
```

When a new theme role is needed, add the variable to both `:root` and `.dark`, expose it in the `@theme inline` block, and use its generated utility class. Keep spacing, radius, and typography in Tailwind utilities. Preserve responsive. make clean and simple and professional ui.

## Code Style

Use TypeScript and functional React components. Follow existing path aliases (`@/components`, `@/lib`) and component naming conventions. For token saving do not run
linting command or dev server or build command. User will run it and give you
the error message or anything to fix.
Use idiomatic TypeScript
Avoid `any`
Keep components focused and reasonably small
Prefer existing utilities and components before creating new ones
Do not duplicate Supabase client setup
Handle loading, empty, and error states
Do not change unrelated files

## Stack
 - Next.js App Router
 - TypeScript
 - Tailwind CSS
 - Supabase Auth, Database, and Realtime
 - React Flow using @xyflow/react

  ** Existing UI components and design system must be reused ** 

