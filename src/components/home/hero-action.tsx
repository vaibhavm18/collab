"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { LoginDialogButton } from "@/components/auth/login-dialog";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/clients/client";
import { cn, focusRing } from "@/lib/utils";

const ctaClassName =
  "h-12 gap-3 rounded-full px-6 text-sm shadow-lg shadow-primary/15 has-data-[icon=inline-end]:pr-5";

function ActionLabel() {
  return (
    <>
      Start a new room
      <HugeiconsIcon
        icon={ArrowRight02Icon}
        data-icon="inline-end"
        className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5"
      />
    </>
  );
}

function PrimaryAction() {
  // null until the session resolves, so the CTA never swaps under the visitor.
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setIsSignedIn(Boolean(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isSignedIn === null) {
    return <Skeleton className="h-12 w-48 rounded-full" />;
  }

  if (!isSignedIn) {
    return (
      <LoginDialogButton variant="default" className={ctaClassName}>
        <ActionLabel />
      </LoginDialogButton>
    );
  }

  return (
    <CreateRoomDialog className={ctaClassName}>
      <ActionLabel />
    </CreateRoomDialog>
  );
}

export function HeroAction() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <PrimaryAction />
      <a
        href="#rooms"
        className={cn(
          "group inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
          focusRing,
        )}
      >
        Browse rooms
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </a>
    </div>
  );
}
