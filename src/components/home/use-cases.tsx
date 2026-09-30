import { SectionEyebrow } from "@/components/section-eyebrow";
import { cn } from "@/lib/utils";

const useCases = [
  {
    title: "Sprint retros",
    description:
      "Collect what went well and what to improve, then group notes by colour.",
    notes: ["Went well", "To improve", "Next actions"],
  },
  {
    title: "Product brainstorms",
    description:
      "Throw every idea on the board and let the team shape the strongest ones.",
    notes: ["Wild ideas", "Quick wins", "Worth testing"],
  },
  {
    title: "Study groups",
    description:
      "Map out topics, split up the work, and keep everyone on the same page.",
    notes: ["Topics", "Who does what", "Questions"],
  },
];

// Same tints the board uses for primary, secondary, and chart notes.
const noteSurfaces = ["bg-primary/12", "bg-secondary/18", "bg-chart-2/16"];

export function UseCases() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 sm:px-10 sm:py-32 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <SectionEyebrow>Use cases</SectionEyebrow>
            <h2
              id="use-cases-heading"
              className="mt-4 max-w-md font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl"
            >
              Made for the moments teams think together.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
              From weekly rituals to one-off sessions, one shared board keeps
              everyone&apos;s ideas in view.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border border-y border-border md:col-span-7">
          {useCases.map((useCase) => (
            <li key={useCase.title} className="py-10 sm:py-12">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-chart-2"
                />
                <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                  {useCase.title}
                </h3>
              </div>

              <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
                {useCase.description}
              </p>

              <ul
                aria-label={`Example notes for ${useCase.title}`}
                className="mt-6 flex flex-wrap gap-2"
              >
                {useCase.notes.map((note, index) => (
                  <li
                    key={note}
                    className={cn(
                      "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground",
                      noteSurfaces[index % noteSurfaces.length],
                    )}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
