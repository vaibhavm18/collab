"use client";

import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  // Starts null so the first client render matches the server markup; the real
  // value comes from the class the blocking theme script already applied.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");

    // Elements with their own colour transitions (e.g. the sticky nav) would
    // otherwise fade at their own pace while everything else snaps. Swap all
    // tokens in one frame with transitions off, and let the View Transitions
    // API crossfade the whole page uniformly where it is supported.
    const applyTheme = () => {
      root.classList.add("theme-switching");
      root.classList.toggle("dark", next);
      root.style.colorScheme = next ? "dark" : "light";
      // Force a style flush so the new colours land before transitions return.
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.remove("theme-switching"));
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }

    setIsDark(next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }

  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={className}
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
    >
      <HugeiconsIcon
        icon={isDark ? Sun01Icon : Moon02Icon}
        size={16}
        strokeWidth={1.8}
      />
    </Button>
  );
}
