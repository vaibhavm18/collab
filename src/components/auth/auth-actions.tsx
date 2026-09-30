"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { LoginDialogButton } from "@/components/auth/login-dialog";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/clients/client";
import { cn } from "@/lib/utils";

const actionClassName = "h-11 rounded-full px-5 text-sm font-medium";

function getDisplayName(user: User) {
  const name = user.user_metadata?.display_name;

  return typeof name === "string" && name.trim() ? name.trim() : user.email ?? "Account";
}

function AccountMenu({ user }: { user: User }) {
  const displayName = getDisplayName(user);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label="Open account menu"
            className="size-11 rounded-full p-0"
            variant="ghost"
          />
        }
      >
        <Avatar>
          <AvatarFallback className="bg-secondary text-sm font-medium text-secondary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-2 p-2">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          {user.email && user.email !== displayName ? (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          ) : null}
        </div>
        <div className="h-px bg-border" />
        <LogoutButton
          className="h-11 w-full justify-start px-2 text-sm"
          variant="ghost"
        />
      </PopoverContent>
    </Popover>
  );
}

export function AuthActions({ redirectTo }: { redirectTo?: string }) {
  // undefined until the session resolves, so a signed-in visitor never sees "Log in" first.
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <Skeleton className="h-11 w-24 rounded-full sm:w-52" />;
  }

  if (user) {
    return <AccountMenu user={user} />;
  }

  return (
    <div className="flex items-center gap-2">
      <LoginDialogButton
        className={actionClassName}
        initialMode="login"
        redirectTo={redirectTo}
        variant="outline"
      >
        Log in
      </LoginDialogButton>
      <LoginDialogButton
        autoOpen={Boolean(redirectTo)}
        className={cn(actionClassName, "hidden sm:inline-flex")}
        initialMode="register"
        redirectTo={redirectTo}
        variant="default"
      >
        Get started
      </LoginDialogButton>
    </div>
  );
}
