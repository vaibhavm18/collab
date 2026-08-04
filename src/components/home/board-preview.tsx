export function BoardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:mr-0">
      <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative rounded-2xl border border-border/80 bg-card/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:rounded-3xl sm:p-3">
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-inner sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                ✦
              </span>
              <div>
                <p className="text-xs font-semibold">Product brainstorm</p>
                <p className="text-[10px] text-muted-foreground">
                  3 people online
                </p>
              </div>
            </div>
            <div className="flex -space-x-2">
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground">
                M
              </span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-chart-2 text-[10px] font-bold text-background">
                A
              </span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-bold text-secondary-foreground">
                J
              </span>
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden bg-foreground/30 p-3 text-background [background-image:radial-gradient(color-mix(in_oklch,var(--background)_28%,transparent)_1px,transparent_1px)] [background-size:16px_16px] sm:min-h-80 sm:p-4">
            <StickyNote className="top-[15%] left-[7%] -rotate-3" accent="bg-primary/60">
              Improve the onboarding flow
              <NoteAuthor>Maya · just now</NoteAuthor>
            </StickyNote>
            <StickyNote className="top-[49%] left-[39%] z-10 rotate-2" accent="bg-chart-2">
              Make the main action clearer
              <NoteAuthor>Alex · 2 min ago</NoteAuthor>
            </StickyNote>
            <StickyNote className="top-[11%] right-[-3%] rotate-6" accent="bg-secondary-foreground/50">
              Review mobile spacing
              <NoteAuthor>Jordan · 5 min ago</NoteAuthor>
            </StickyNote>

            <CollaboratorCursor className="top-[36%] left-[31%]" color="primary">
              Maya
            </CollaboratorCursor>
            <CollaboratorCursor className="right-[24%] bottom-[14%]" color="chart-2">
              Alex
            </CollaboratorCursor>
          </div>

          <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-[10px] text-muted-foreground sm:px-5">
            <span className="size-1.5 rounded-full bg-primary" />
            Live board · Changes saved automatically
          </div>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-5 rounded-xl border border-border bg-card px-3 py-2 shadow-xl sm:-right-6">
        <p className="text-[10px] font-medium text-muted-foreground">
          Everyone is on the same page
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-16 rounded-full bg-primary/20">
            <span className="block h-1.5 w-11 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] font-semibold">72%</span>
        </div>
      </div>
    </div>
  );
}

function StickyNote({
  accent,
  children,
  className,
}: {
  accent: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className={`absolute w-40 rounded-xl border border-background/10 bg-muted p-3 text-foreground shadow-xl sm:w-48 ${className}`}>
      <span className={`mb-3 block h-1.5 w-8 rounded-full ${accent}`} />
      <p className="text-[11px] font-medium leading-5">{children}</p>
    </div>
  );
}

function NoteAuthor({ children }: { children: React.ReactNode }) {
  return <span className="mt-3 block text-[9px] text-muted-foreground">{children}</span>;
}

function CollaboratorCursor({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className: string;
  color: "primary" | "chart-2";
}) {
  const colorClass = color === "primary" ? "bg-primary" : "bg-chart-2";
  const textClass = color === "primary" ? "text-primary-foreground" : "text-background";

  return (
    <div className={`absolute z-20 flex items-start gap-1.5 text-[9px] font-semibold ${textClass} ${className}`}>
      <span className={`relative mt-0.5 block size-3 rotate-[-18deg] rounded-[2px] shadow-md after:absolute after:top-2 after:left-2 after:size-1.5 after:rotate-45 ${colorClass}`} />
      <span className={`rounded-full px-2 py-1 shadow-lg ${colorClass}`}>{children}</span>
    </div>
  );
}
