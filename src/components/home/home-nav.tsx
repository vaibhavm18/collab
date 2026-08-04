import { AuthActions } from "@/components/auth";

export function HomeNav({ redirectTo }: { redirectTo?: string }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-30 bg-background/85 px-4 pt-3 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[90rem] items-center justify-between px-3 sm:px-4">
        <a
          className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/70"
          href="#top"
          aria-label="CollabBoard home"
        >
          <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-[0.85rem] bg-gradient-to-br from-primary via-primary to-secondary text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <span className="absolute -top-1 -right-1 size-4 rounded-full border-2 border-primary-foreground/35" />
            <span className="absolute -right-1 -bottom-1 size-5 rounded-full border-2 border-primary-foreground/40" />
            <span className="absolute bottom-1.5 left-1.5 size-1 rounded-full bg-primary-foreground/80" />
            <span className="relative font-heading">C</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-heading text-sm font-semibold leading-none tracking-[-0.02em]">
              CollabBoard
            </span>
            <span className="hidden text-[0.6rem] font-medium tracking-[0.16em] text-muted-foreground uppercase sm:block">
              Shared workspace
            </span>
          </span>
        </a>

        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/35 p-1">
          <AuthActions redirectTo={redirectTo} />
        </div>
      </div>
    </nav>
  );
}
