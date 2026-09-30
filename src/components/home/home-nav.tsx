"use client";

import { Menu01Icon, StickyNote01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthActions } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, focusRing } from "@/lib/utils";

const sections = [
  { id: "top", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "use-cases", label: "Use cases" },
  { id: "rooms", label: "Rooms" },
  { id: "faq", label: "FAQ" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function useHasScrolled() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > 8);

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return hasScrolled;
}

// Tracks which page section crosses the middle of the viewport, for the active tab.
function useActiveSection() {
  const [active, setActive] = useState<SectionId>("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const { id } of sections) {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  return active;
}

function MobileMenu({ active }: { active: SectionId }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            aria-label="Open menu"
            className="size-11 rounded-full text-muted-foreground hover:text-foreground lg:hidden"
            size="icon"
            variant="ghost"
          />
        }
      >
        <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.8} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 p-2">
        <nav aria-label="Sections" className="flex flex-col gap-1">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=location]:bg-muted aria-[current=location]:text-foreground",
                focusRing,
              )}
            >
              {label}
            </a>
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  );
}

export function HomeNav({ redirectTo }: { redirectTo?: string }) {
  const hasScrolled = useHasScrolled();
  const active = useActiveSection();

  return (
    <header
      data-scrolled={hasScrolled}
      className="sticky top-0 z-40 border-b border-transparent bg-background transition-[background-color,border-color] duration-200 data-[scrolled=true]:border-border data-[scrolled=true]:bg-background/90 data-[scrolled=true]:backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 sm:px-10">
        <Link
          href="/"
          aria-label="CollabBoard home"
          className={cn(
            "group/logo flex w-fit items-center gap-2.5 rounded-lg",
            focusRing,
          )}
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover/logo:-rotate-6">
            <HugeiconsIcon icon={StickyNote01Icon} size={18} strokeWidth={1.8} />
          </span>
          <span className="font-heading text-xl leading-none tracking-tight text-foreground max-[359px]:hidden sm:text-2xl">
            CollabBoard
          </span>
        </Link>

        <div className="flex h-full items-center gap-2 lg:gap-6">
          <nav aria-label="Main" className="hidden h-full items-center gap-6 lg:flex">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                className={cn(
                  "relative flex h-full items-center text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground aria-[current=location]:text-foreground",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 aria-[current=location]:after:scale-x-100",
                  focusRing,
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          <span aria-hidden className="hidden h-5 w-px bg-border lg:block" />

          <AuthActions redirectTo={redirectTo} />
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}
