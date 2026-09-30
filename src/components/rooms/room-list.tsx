"use client";

import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/clients/client";
import { getRooms, joinRoom } from "@/lib/supabase/queries/rooms";
import type { Room } from "@/lib/supabase/types";
import { cn, focusRing } from "@/lib/utils";

const INITIAL_VISIBLE = 6;

function formatRoomDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatIndex(value: number) {
  return String(value).padStart(2, "0");
}

function RoomRow({
  room,
  index,
  isJoining,
  isDisabled,
  onJoin,
}: {
  room: Room;
  index: number;
  isJoining: boolean;
  isDisabled: boolean;
  onJoin: (roomId: string) => void;
}) {
  return (
    <li>
      <button
        aria-busy={isJoining}
        className={cn(
          "group grid w-full cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-x-4 py-5 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:grid-cols-[3rem_1fr_auto_auto] sm:gap-x-8 sm:py-6",
          focusRing,
        )}
        disabled={isDisabled}
        onClick={() => onJoin(room.id)}
        type="button"
      >
        <span
          aria-hidden="true"
          className="font-heading text-xl leading-none text-muted-foreground/60 italic transition-colors duration-200 group-hover:text-foreground"
        >
          {formatIndex(index)}
        </span>

        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 scale-0 rounded-full bg-chart-2 opacity-0 transition-[opacity,scale] duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
          />
          <span className="-ml-5.5 truncate text-lg font-medium tracking-tight text-foreground transition-[margin] duration-200 ease-out group-hover:ml-0 group-focus-visible:ml-0 sm:text-xl">
            {room.name}
          </span>
        </span>

        <span className="col-start-2 mt-1 text-xs tracking-wide text-muted-foreground uppercase sm:col-start-auto sm:mt-0">
          {isJoining ? (
            <span aria-live="polite">Joining…</span>
          ) : (
            <time dateTime={room.created_at}>
              {formatRoomDate(room.created_at)}
            </time>
          )}
        </span>

        <span
          aria-hidden="true"
          className="col-start-3 row-span-2 row-start-1 flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background sm:col-start-auto sm:row-span-1"
        >
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={1.8} />
        </span>
      </button>
    </li>
  );
}

function RoomSkeleton() {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading rooms"
      className="divide-y divide-border border-y border-border"
    >
      {["one", "two", "three", "four"].map((item) => (
        <li
          className="flex items-center gap-4 py-5 sm:gap-8 sm:py-6"
          key={item}
        >
          <Skeleton className="h-4 w-6 sm:w-8" />
          <Skeleton className="h-6 flex-1 sm:h-7 sm:max-w-md" />
          <Skeleton className="size-11 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

function RoomMessage({
  title,
  description,
  isAlert = false,
  children,
}: {
  title: string;
  description: string;
  isAlert?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-y border-border py-16 sm:py-20">
      <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
        {title}
      </h3>
      <p
        className="mt-4 max-w-md text-base leading-7 text-muted-foreground"
        role={isAlert ? "alert" : undefined}
      >
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}

export function RoomList() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

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
        setJoinError(null);
        setQuery("");
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadRooms]);

  const filteredRooms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return rooms;
    }
    return rooms.filter((room) => room.name.toLowerCase().includes(normalized));
  }, [rooms, query]);

  const visibleRooms =
    showAll || query ? filteredRooms : filteredRooms.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filteredRooms.length - visibleRooms.length;

  async function handleJoin(roomId: string) {
    if (!isSignedIn || joiningRoomId) {
      return;
    }

    setJoinError(null);
    setJoiningRoomId(roomId);
    const result = await joinRoom(roomId);

    if (result.error) {
      setJoinError("We couldn't join that room. Please try again.");
      setJoiningRoomId(null);
      return;
    }

    router.push(`/room/${roomId}`);
  }

  const isReady = isSignedIn && !isLoading && !error;
  const hasRooms = rooms.length > 0;

  return (
    <section
      aria-labelledby="rooms-heading"
      className="scroll-mt-20 border-t border-border"
      id="rooms"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-16">
          <div className="md:col-span-7">
            <SectionEyebrow>Room directory</SectionEyebrow>
            <h2
              className="mt-4 max-w-md font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl"
              id="rooms-heading"
            >
              Find your next shared space.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">
              Browse every room in the workspace and join the conversation that
              matters next.
            </p>
          </div>

          {isReady && hasRooms ? (
            <div className="flex items-end justify-between gap-6 md:col-span-5 md:flex-col md:items-end">
              <p className="leading-none text-foreground">
                <span className="font-heading text-4xl tracking-tight sm:text-5xl">
                  {formatIndex(rooms.length)}
                </span>
                <span className="ml-3 text-sm tracking-wide text-muted-foreground uppercase">
                  {rooms.length === 1 ? "room" : "rooms"}
                </span>
              </p>
              <CreateRoomDialog
                className="h-11 rounded-full px-5 text-sm"
                variant="outline"
              >
                New room
              </CreateRoomDialog>
            </div>
          ) : null}
        </div>

        <div className="mt-16 sm:mt-20">
          {isReady && hasRooms ? (
            <div className="mb-2 flex items-center gap-3 border-b border-border pb-3 transition-colors focus-within:border-foreground">
              <HugeiconsIcon
                aria-hidden="true"
                className="shrink-0 text-muted-foreground"
                icon={Search01Icon}
                size={18}
                strokeWidth={1.8}
              />
              <label className="sr-only" htmlFor="room-search">
                Search rooms
              </label>
              <input
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg [&::-webkit-search-cancel-button]:hidden"
                id="room-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the directory"
                type="search"
                value={query}
              />
              {query ? (
                <>
                  <span
                    aria-live="polite"
                    className="hidden text-xs tracking-wide text-muted-foreground uppercase sm:inline"
                  >
                    {filteredRooms.length} of {rooms.length}
                  </span>
                  <Button
                    aria-label="Clear search"
                    className="size-11 rounded-full"
                    onClick={() => setQuery("")}
                    size="icon"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}

          {joinError ? (
            <p
              className="mb-6 text-sm text-destructive"
              role="alert"
            >
              {joinError}
            </p>
          ) : null}

          {isSignedIn === null || (isSignedIn && isLoading) ? (
            <RoomSkeleton />
          ) : null}

          {isSignedIn === false ? (
            <RoomMessage
              description="The room directory opens once you are signed in. Use the sign in button above to get started."
              title="Sign in to see every room."
            />
          ) : null}

          {isSignedIn && !isLoading && error ? (
            <RoomMessage
              description={error}
              isAlert
              title="The directory didn't load."
            >
              <Button
                className="h-11 rounded-full px-5 text-sm"
                onClick={() => void loadRooms()}
                variant="outline"
              >
                Try again
              </Button>
            </RoomMessage>
          ) : null}

          {isReady && !hasRooms ? (
            <RoomMessage
              description="Start a room for your next idea, then invite your team to shape it together."
              title="No rooms yet. Start the first one."
            >
              <CreateRoomDialog className="h-11 rounded-full px-5 text-sm">
                Create your first room
              </CreateRoomDialog>
            </RoomMessage>
          ) : null}

          {isReady && hasRooms && filteredRooms.length === 0 ? (
            <RoomMessage
              description={`No room names match "${query.trim()}". Try a different search.`}
              title="Nothing by that name."
            >
              <Button
                className="h-11 rounded-full px-5 text-sm"
                onClick={() => setQuery("")}
                variant="outline"
              >
                Clear search
              </Button>
            </RoomMessage>
          ) : null}

          {isReady && visibleRooms.length > 0 ? (
            <ul className="divide-y divide-border border-b border-border">
              {visibleRooms.map((room, index) => (
                <RoomRow
                  index={index + 1}
                  isDisabled={joiningRoomId !== null}
                  isJoining={joiningRoomId === room.id}
                  key={room.id}
                  onJoin={handleJoin}
                  room={room}
                />
              ))}
            </ul>
          ) : null}

          {isReady && (hiddenCount > 0 || (showAll && !query && rooms.length > INITIAL_VISIBLE)) ? (
            <div className="mt-8 flex justify-center">
              <Button
                className="h-11 rounded-full px-5 text-sm"
                onClick={() => setShowAll((value) => !value)}
                variant="ghost"
              >
                {showAll ? "Show fewer" : `Show all ${filteredRooms.length} rooms`}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
