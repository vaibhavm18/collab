"use client";

import { useEffect, useState } from "react";

import { LoginDialogButton } from "@/components/auth/login-dialog";
import { LogoutButton } from "@/components/auth/logout-button";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { createClient } from "@/lib/supabase/clients/client";

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

  return isSignedIn ? (
    <>
      <CreateRoomDialog className="h-8 rounded-lg px-3 text-xs font-semibold" />
      <LogoutButton
        className="h-8 rounded-lg px-3 text-xs font-semibold"
        variant="ghost"
      />
    </>
  ) : (
    <LoginDialogButton
      autoOpen={Boolean(redirectTo)}
      className="h-8 rounded-lg px-3 text-xs font-semibold"
      initialMode={redirectTo ? "register" : "login"}
      redirectTo={redirectTo}
      variant="default"
    >
      Login
    </LoginDialogButton>
  );
}
