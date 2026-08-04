"use client";

import {
  ArrowRight01Icon,
  Door01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/clients/client";
import { getRooms, joinRoom } from "@/lib/supabase/queries/rooms";
import type { Room } from "@/lib/supabase/types";

function formatRoomDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function RoomCard({
  room,
  isSignedIn,
  joiningRoomId,
  onJoin,
}: {
  room: Room;
  isSignedIn: boolean;
  joiningRoomId: string | null;
  onJoin: (roomId: string) => void;
}) {
  const isJoining = joiningRoomId === room.id;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/8">
      <CardContent className="flex min-h-56 flex-col p-5 sm:p-6">
        <div className=" min-w-0">
          <h3 className="truncate font-heading text-lg font-semibold tracking-[-0.03em] text-card-foreground">
            {room.name}
          </h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Created {formatRoomDate(room.created_at)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-5">
          <span className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
            Shared workspace
          </span>
          <Button
            className="h-9 rounded-lg px-3 text-xs"
            disabled={!isSignedIn || isJoining}
            onClick={() => onJoin(room.id)}
            variant="outline"
          >
            {isJoining ? "Joining…" : "Join room"}
            {!isJoining ? (
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={15}
                strokeWidth={2}
              />
            ) : null}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["one", "two", "three"].map((item) => (
        <Card className="rounded-2xl border-border/70 py-0" key={item}>
          <CardContent className="min-h-56 p-5 sm:p-6">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="mt-8 h-5 w-2/3" />
            <Skeleton className="mt-3 h-3 w-1/3" />
            <div className="mt-11 flex justify-between border-t border-border/70 pt-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RoomList() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getRooms();

    if (result.error) {
      setRooms([]);
      setError("We couldn't load your rooms. Please try again.");
    } else {
      setRooms(result.data ?? []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      const signedIn = Boolean(data.session);
      setIsSignedIn(signedIn);

      if (signedIn) {
        void loadRooms();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedIn = Boolean(session);
      setIsSignedIn(signedIn);

      if (signedIn) {
        void loadRooms();
      } else {
        setRooms([]);
        setError(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadRooms]);

  async function handleJoin(roomId: string) {
    if (!isSignedIn) {
      return;
    }

    setJoiningRoomId(roomId);
    const result = await joinRoom(roomId);

    if (result.error) {
      setError("We couldn't join that room. Please try again.");
      setJoiningRoomId(null);
      return;
    }

    router.push(`/room/${roomId}`);
  }

  return (
    <section
      className="relative overflow-hidden border-t border-border/60 bg-muted/15 px-5 py-20 text-foreground sm:px-6 lg:px-10 lg:py-28"
      id="rooms"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -z-0 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              <span className="h-px w-8 bg-primary" />
              Room directory
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Find your next shared space.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              Browse every room in the workspace and join the conversation
              that matters next.
            </p>
          </div>
          {isSignedIn ? (
            <Badge className="h-7 rounded-full px-3" variant="outline">
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </Badge>
          ) : null}
        </div>

        {isSignedIn === null ? <RoomSkeleton /> : null}

        {isSignedIn === false ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={21}
                strokeWidth={1.8}
              />
            </div>
            <h3 className="mt-5 font-heading text-lg font-semibold tracking-[-0.03em]">
              Sign in to browse rooms
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Your room directory is available once you are signed in. Join
              room actions stay locked until then.
            </p>
          </div>
        ) : null}

        {isSignedIn && !isLoading && error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/8 px-6 py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              className="mt-5 rounded-lg"
              onClick={() => void loadRooms()}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        ) : null}

        {isSignedIn && !isLoading && !error && rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <HugeiconsIcon icon={Door01Icon} size={21} strokeWidth={1.8} />
            </div>
            <h3 className="mt-5 font-heading text-lg font-semibold tracking-[-0.03em]">
              No rooms yet
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Start a room for your next idea, then invite your team to shape
              it together.
            </p>
            <CreateRoomDialog className="mt-6 h-10 rounded-lg px-4">
              Create your first room
            </CreateRoomDialog>
          </div>
        ) : null}

        {isSignedIn && !isLoading && !error && rooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                isSignedIn={isSignedIn}
                joiningRoomId={joiningRoomId}
                key={room.id}
                onJoin={handleJoin}
                room={room}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
