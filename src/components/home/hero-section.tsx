import { HeroAction } from "./hero-action";

export function HeroSection() {
  return (
    <section
      id="top"
      className="flex min-h-[90svh] flex-col"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-10">
        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-heading text-5xl leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Make good ideas
            <span className="block italic text-chart-2">easier to see.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
            Some ideas just need room to breathe.
            <br className="hidden sm:block" /> Bring your team onto one shared
            board,
            <br className="hidden sm:block" /> and shape what comes next,
            together.
          </p>

          <div className="mt-10">
            <HeroAction />
          </div>
        </div>
      </div>

      <p className="mx-auto w-full max-w-6xl px-6 pb-8 font-heading text-lg italic text-muted-foreground sm:px-10">
        One board, many minds.
      </p>
    </section>
  );
}
