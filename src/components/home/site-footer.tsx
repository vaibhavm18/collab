import { StickyNote01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { cn, focusRing } from "@/lib/utils";

const linkGroups = [
  {
    title: "Product",
    links: [
      { href: "#how-it-works", label: "How it works" },
      { href: "#use-cases", label: "Use cases" },
      { href: "#rooms", label: "Browse rooms" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#faq", label: "FAQ" },
      { href: "#top", label: "Back to top" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24 sm:px-10 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6">
            <Link
              href="/"
              aria-label="CollabBoard home"
              className={cn(
                "group/logo flex w-fit items-center gap-2.5 rounded-lg",
                focusRing,
              )}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover/logo:-rotate-6">
                <HugeiconsIcon
                  icon={StickyNote01Icon}
                  size={18}
                  strokeWidth={1.8}
                />
              </span>
              <span className="font-heading text-2xl leading-none tracking-tight text-foreground">
                CollabBoard
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
              A shared board for sticky notes, where every idea shows up for
              everyone the moment it lands.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 md:col-span-6 md:justify-items-end"
          >
            {linkGroups.map((group) => (
              <div key={group.title} className="min-w-36">
                <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.title}
                </h2>
                <ul className="mt-3 flex flex-col">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={cn(
                          "-mx-1 inline-flex min-h-11 items-center rounded-md px-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
                          focusRing,
                        )}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CollabBoard. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-chart-2"
            />
            Built with Next.js and Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
