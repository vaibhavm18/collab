"use client";

import { ReactLenis } from "lenis/react";
import { type ReactNode, useEffect, useState } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  // Lenis hijacks the wheel in JS, so the CSS reduced-motion guard cannot reach it.
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        allowNestedScroll: true,
        smoothWheel: true,
        stopInertiaOnNavigate: true,
        lerp: 0.1,
        wheelMultiplier: 0.9,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
