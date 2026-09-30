import { SectionEyebrow } from "@/components/section-eyebrow";

const steps = [
  {
    number: "01",
    title: "Create a room",
    description: "Give your shared board a name and it is ready in seconds.",
  },
  {
    number: "02",
    title: "Share the link",
    description:
      "Send the room link to your team. They sign in and land right on the board.",
  },
  {
    number: "03",
    title: "Brainstorm live",
    description:
      "Add, move, and edit sticky notes together and see every change as it happens.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <div>
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2
            id="how-it-works-heading"
            className="mt-4 max-w-md font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl"
          >
            From idea to shared board in three steps.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
            No setup, no installs. Open a room, invite your team, and start
            thinking out loud together.
          </p>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-20 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex flex-col bg-card p-8 text-card-foreground sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="font-heading text-5xl leading-none text-muted-foreground/60 italic"
                >
                  {step.number}
                </span>
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-chart-2"
                />
              </div>

              <h3 className="mt-12 text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                <span className="sr-only">Step {step.number}: </span>
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
