
import { HeroSection } from "@/components/home/hero-section";
import { HomeNav } from "@/components/home/home-nav";
import { RoomList } from "@/components/rooms/room-list";

function getRoomReturnPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate) {
    return undefined;
  }

  try {
    const url = new URL(candidate, "http://localhost");

    if (url.origin !== "http://localhost" || !url.pathname.startsWith("/room/")) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
}) {
  const { returnTo } = await searchParams;
  const redirectTo = getRoomReturnPath(returnTo);

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <HomeNav redirectTo={redirectTo} />
      <HeroSection />
      <RoomList />
      <footer className="relative shrink-0 overflow-hidden border-t border-border/60 bg-card/35 px-5 pt-8 pb-10 text-muted-foreground sm:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        <div className="mx-auto flex min-h-24 w-full max-w-7xl items-center justify-between gap-6 py-8">
          <div className="flex items-center gap-3">
            <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-[0.7rem] bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25">
              <span className="absolute -right-1 -bottom-1 size-4 rounded-full border-2 border-primary-foreground/40" />
              <span className="relative">C</span>
            </span>
            <span className="font-heading text-sm font-semibold tracking-[-0.02em] text-foreground">
              CollabBoard
            </span>
          </div>
          <p className="text-right text-[0.65rem] tracking-[0.12em] uppercase">
            © {new Date().getFullYear()} CollabBoard
          </p>
        </div>
      </footer>
    </main>
  );
}
