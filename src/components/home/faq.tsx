import { SectionEyebrow } from "@/components/section-eyebrow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, focusRing } from "@/lib/utils";

const faqs = [
  {
    question: "Is CollabBoard free?",
    answer:
      "Yes. CollabBoard is a free demo project, so you can create and join rooms at no cost.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes. Sign up with your email and a password so your rooms and notes are saved to you.",
  },
  {
    question: "How many people can join a room?",
    answer:
      "There is no fixed limit. Share the room link and everyone who signs in can collaborate on the same board.",
  },
  {
    question: "Is my data private?",
    answer:
      "Notes are only visible to members of the room. Access is enforced in the database with Postgres Row-Level Security.",
  },
  {
    question: "Is it open source?",
    answer: "Yes. The full source code is available on GitHub.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 sm:px-10 sm:py-32 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2
              id="faq-heading"
              className="mt-4 max-w-md font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl"
            >
              Questions, answered.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
              Everything you need to know before opening your first room. Still
              curious?{" "}
              <a
                href="#rooms"
                className={cn(
                  "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-200 hover:decoration-foreground",
                  focusRing,
                )}
              >
                Jump into a room
              </a>
              .
            </p>
          </div>
        </div>

        <Accordion className="rounded-2xl border-border bg-card text-card-foreground md:col-span-7">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className="border-border transition-colors duration-200 data-open:bg-muted/40"
            >
              <AccordionTrigger className="cursor-pointer items-center gap-5 px-6 py-6 text-base font-medium text-foreground hover:no-underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-8 **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:transition-colors hover:**:data-[slot=accordion-trigger-icon]:text-foreground">
                <span
                  aria-hidden="true"
                  className="w-7 shrink-0 font-heading text-xl leading-none text-muted-foreground/60 italic transition-colors duration-200 group-hover/accordion-trigger:text-foreground group-aria-expanded/accordion-trigger:text-chart-2"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 text-sm leading-7 text-muted-foreground sm:pr-14 sm:pl-[4.5rem]">
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
