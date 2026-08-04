"use client";

import { useEffect, useState } from "react";

import { LoginDialogButton } from "@/components/auth/login-dialog";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { createClient } from "@/lib/supabase/clients/client";

const actionClassName =
  "h-12 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/25";

function ActionLabel() {
  return (
    <>
      Start a new room <span aria-hidden="true" className="ml-3 text-base">↗</span>
    </>
  );
}

export function HeroAction() {
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  if (!isSignedIn) {
    return (
      <LoginDialogButton className={actionClassName} variant="default">
        <ActionLabel />
      </LoginDialogButton>
    );
  }

  return (
    <CreateRoomDialog className={actionClassName}>
      <ActionLabel />
    </CreateRoomDialog>
  );
}
