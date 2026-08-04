"use client";

import { ArrowRight01Icon, Door01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useState } from "react";

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
import { createRoom } from "@/lib/supabase/queries/rooms";

type CreateRoomDialogProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function CreateRoomDialog({
  children = "Create room",
  className,
  variant = "default",
}: CreateRoomDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setName("");
      setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Give your room a name to continue.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const { data, error: createError } = await createRoom(trimmedName);

    setIsSubmitting(false);

    if (createError || !data) {
      setError(
        createError?.code === "42501"
          ? "Please log in before creating a room."
          : createError?.message ?? "We couldn't create your room. Try again.",
      );
      return;
    }

    setOpen(false);
    router.push(`/room/${data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button className={className} variant={variant} />}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-2xl shadow-primary/10">
        <div className="h-1.5 bg-primary" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="gap-4 pr-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <HugeiconsIcon icon={Door01Icon} size={22} strokeWidth={1.8} />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                Start a new room
              </DialogTitle>
              <DialogDescription className="text-sm leading-6">
                Give your shared workspace a name. You can invite your team
                once it is ready.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label className="text-sm" htmlFor="room-name">
                Room name
              </Label>
              <Input
                autoFocus
                className="h-11 rounded-lg bg-background/60 text-sm"
                id="room-name"
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                placeholder="Product brainstorm"
                required
                value={name}
              />
            </div>

            {error ? (
              <p
                aria-live="polite"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs leading-5 text-destructive"
              >
                {error}
              </p>
            ) : null}

            <DialogFooter className="pt-1 sm:flex-col sm:justify-center">
              <Button
                className="h-11 w-full rounded-lg text-sm"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Creating room..." : "Create room"}
                {!isSubmitting ? (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    strokeWidth={2}
                  />
                ) : null}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
