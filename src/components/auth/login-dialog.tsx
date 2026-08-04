"use client";

import {
  ArrowRight01Icon,
  LockPasswordIcon,
  Loading03Icon,
  Login01Icon,
  Mail01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/clients/client";

type LoginDialogButtonProps = {
  children?: React.ReactNode;
  className?: string;
  autoOpen?: boolean;
  initialMode?: "login" | "register";
  redirectTo?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export function LoginDialogButton({
  children = "Log in",
  className,
  autoOpen = false,
  initialMode = "login",
  redirectTo,
  variant = "outline",
  size = "default",
}: LoginDialogButtonProps) {
  const router = useRouter();
  const fieldId = useId();
  const emailId = `${fieldId}-email`;
  const passwordId = `${fieldId}-password`;
  const [open, setOpen] = useState(autoOpen);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(
    initialMode === "register",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const result = isRegistering
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setPassword("");

      if (isRegistering && !result.data.session) {
        setMessage("Account created. Check your email to confirm your address.");
        return;
      }

      if (redirectTo) {
        setIsRedirecting(true);
        router.replace(redirectTo);
        return;
      }

      setOpen(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setMessage(null);
      setPassword("");
      setShowPassword(false);
      setIsRedirecting(false);
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setError(null);
    setMessage(null);
    setShowPassword(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button className={className} size={size} variant={variant} />}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-2xl shadow-primary/10">
        {isRedirecting ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <HugeiconsIcon
                aria-hidden="true"
                className="animate-spin"
                icon={Loading03Icon}
                size={28}
                strokeWidth={1.8}
              />
            </div>
            <div className="space-y-1">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
                Joining your room…
              </DialogTitle>
              <DialogDescription className="text-sm leading-6">
                Signing you in and loading the shared workspace.
              </DialogDescription>
            </div>
          </div>
        ) : (
          <div className="py-10 px-6 sm:py12 sm:px-8">
            <DialogHeader className="gap-1 pr-6">
              <div className="space-y-1">
                <DialogTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                  {isRegistering ? "Create your account" : "Welcome back"}
                </DialogTitle>
                <DialogDescription className="text-sm leading-4">
                  {isRegistering
                    ? "Create an account to save your work."
                    : "Sign in to continue where you left off."}
                </DialogDescription>
              </div>
            </DialogHeader>

            <form
              aria-busy={isSubmitting}
              className="mt-6 flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-1">
                <Label className="text-sm" htmlFor={emailId}>
                  Email address
                </Label>
                <div className="relative">
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="pointer-events-none border-none outline-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    icon={Mail01Icon}
                    strokeWidth={1.8}
                  />
                  <Input
                    autoComplete="email"
                    className="h-12 rounded-lg bg-background/90 outline-none border-none ring-0 pl-10 text-sm"
                    id={emailId}
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm" htmlFor={passwordId}>
                  Password
                </Label>
                <div className="relative">
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    icon={LockPasswordIcon}
                    strokeWidth={1.8}
                  />
                  <Input
                    autoComplete={
                      isRegistering ? "new-password" : "current-password"
                    }
                    className="h-12 rounded-lg bg-background/60 pr-11 pl-10 text-lg"
                    id={passwordId}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      isRegistering
                        ? "At least 6 characters"
                        : "Enter your password"
                    }
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={isSubmitting}
                  />
                  <button
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      icon={showPassword ? ViewOffIcon : ViewIcon}
                      size={16}
                      strokeWidth={1.8}
                    />
                  </button>
                </div>
              </div>

              {error ? (
                <p
                  aria-live="assertive"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs leading-5 text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              {message ? (
                <p
                  aria-live="polite"
                  className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2.5 text-xs leading-5 text-primary"
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <DialogFooter className="gap-3 pt-1 sm:flex-col sm:justify-center">
                <Button
                  className="h-11 w-full rounded-lg text-sm"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="animate-spin"
                        icon={Loading03Icon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      {isRegistering ? "Creating account" : "Signing in"}
                    </>
                  ) : (
                    <>
                      {isRegistering ? "Create account" : "Sign in"}
                      <HugeiconsIcon
                        aria-hidden="true"
                        icon={ArrowRight01Icon}
                        size={16}
                        strokeWidth={2}
                      />
                    </>
                  )}
                </Button>
                <Button
                  className="h-auto py-1 text-xs"
                  disabled={isSubmitting}
                  onClick={toggleMode}
                  type="button"
                  variant="link"
                >
                  {isRegistering
                    ? "Already have an account? Sign in"
                    : "New here? Create an account"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
