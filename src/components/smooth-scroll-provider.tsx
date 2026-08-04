"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
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
