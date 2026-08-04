"use client";

import { useEffect, useState } from "react";

import { LoginDialogButton } from "@/components/auth/login-dialog";
import { LogoutButton } from "@/components/auth/logout-button";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { createClient } from "@/lib/supabase/clients/client";

const actionClassName = "h-8 rounded-lg px-3 text-xs font-semibold";

export function AuthActions({ redirectTo }: { redirectTo?: string }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {isSignedIn ? (
        <>
          <CreateRoomDialog className={actionClassName} />
          <LogoutButton className={actionClassName} variant="default" />
        </>
      ) : (
        <LoginDialogButton
          autoOpen={Boolean(redirectTo)}
          className={actionClassName}
          initialMode={redirectTo ? "register" : "login"}
          redirectTo={redirectTo}
          variant="default"
        >
          Log in
        </LoginDialogButton>
      )}
    </div>
  );
}
