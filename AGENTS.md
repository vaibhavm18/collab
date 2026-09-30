<!-- BEGIN:nextjs-agent-rules -->
claude --resume 50c51183-8504-41e5-83ec-b959f1acb25f


# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Development Commands

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
Prefer existing utilities and components before creating new ones
Do not duplicate Supabase client setup
Handle loading, empty, and error states
Do not change unrelated files

  ** Existing UI components and design system must be reused ** 

