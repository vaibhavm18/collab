import { BoardPreview } from "./board-preview";
import { HeroAction } from "./hero-action";

export function HeroSection() {
  return (
    <section id="top" className="relative isolate flex min-h-screen items-center overflow-hidden bg-background px-5 pt-24 pb-12 text-foreground sm:pt-28 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_43%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_31%)]" />
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-[45%] border-l border-border/40 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--border)_42%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_42%,transparent)_1px,transparent_1px)] [background-size:3.5rem_3.5rem] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-14">
        <div className="max-w-2xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            <span className="h-px w-8 bg-primary" />
            Collaborative workspace
          </p>
          <h1 className="max-w-[44rem] font-heading text-[3rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-5xl lg:text-[4.75rem]">
            Make good ideas easier to <span className="text-primary">see.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Bring your team into one shared room to shape thoughts, align on what matters, and move forward together.</p>
          <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <HeroAction />
            <p className="max-w-48 text-xs leading-5 text-muted-foreground">Sign in to save and share your room.</p>
          </div>
          <div className="mt-10 flex max-w-md items-center gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
            <span><strong className="mr-1.5 text-foreground">01</strong> Create a room</span>
            <span className="h-3 w-px bg-border" />
            <span><strong className="mr-1.5 text-foreground">02</strong> Invite your team</span>
          </div>
        </div>
        <BoardPreview />
      </div>
    </section>
  );
}
