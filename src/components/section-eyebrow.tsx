import { cn } from "@/lib/utils";

/** Accent label that opens a content section, above its h2. */
export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium tracking-wide text-chart-2 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
