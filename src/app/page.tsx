import { Faq } from "@/components/home/faq";
import { HeroSection } from "@/components/home/hero-section";
import { HomeNav } from "@/components/home/home-nav";
import { HowItWorks } from "@/components/home/how-it-works";
import { SiteFooter } from "@/components/home/site-footer";
import { UseCases } from "@/components/home/use-cases";
import { RoomList } from "@/components/rooms/room-list";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <main>
      <HomeNav redirectTo={redirectTo} />
      <HeroSection />
      <HowItWorks />
      <UseCases />
      <RoomList />
      <Faq />
      <SiteFooter />
      <ThemeToggle className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 size-11 rounded-full border border-border bg-card text-card-foreground shadow-md hover:bg-muted sm:right-6 sm:bottom-6" />
    </main>
  );
}
