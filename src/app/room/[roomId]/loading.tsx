export default function Loading() {
  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-2 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="min-h-0 flex-1 p-3 sm:p-4">
        <div className="h-full animate-pulse rounded-2xl border border-border bg-muted/40" />
      </div>
    </main>
  );
}
