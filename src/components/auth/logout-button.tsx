"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/clients/client";

type LogoutButtonProps = {
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function LogoutButton({
  className,
  variant = "ghost",
  size = "default",
}: LogoutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut();

      if (!error) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      className={className}
      disabled={isSigningOut}
      onClick={handleLogout}
      size={size}
      variant={variant}
    >
      {isSigningOut ? "Logging out..." : "Log out"}
    </Button>
  );
}
