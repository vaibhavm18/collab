"use client";

import { createClient } from "@/lib/supabase/clients/client";
import type {
  NoteDragPayload,
  PresencePayload,
  PresenceState,
  PresenceEditor,
} from "@/lib/supabase/types";

export function calculatePresenceState(
  state: Record<string, PresencePayload[]>,
): PresenceState {
  const onlineUserIds = new Set<string>();
  const editingByNoteId: Record<string, PresenceEditor[]> = {};

  for (const presences of Object.values(state)) {
    for (const presence of presences) {
      onlineUserIds.add(presence.userId);

      if (!presence.editingNoteId) {
        continue;
      }

      const editors = editingByNoteId[presence.editingNoteId] ?? [];

      if (!editors.some((editor) => editor.userId === presence.userId)) {
        editors.push({
          userId: presence.userId,
          displayName: presence.displayName,
        });
      }

      editingByNoteId[presence.editingNoteId] = editors;
    }
  }

  return {
    onlineUserIds: Array.from(onlineUserIds),
    onlineCount: onlineUserIds.size,
    editingByNoteId,
  };
}

export type RoomPresenceSubscription = {
  setEditingNote: (noteId: string) => void;
  clearEditingNote: (noteId: string) => void;
  broadcastNoteDrag: (payload: NoteDragPayload) => void;
  unsubscribe: () => void;
};

type NoteDragListener = (payload: NoteDragPayload) => void;

function isNoteDragPayload(value: unknown): value is NoteDragPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const position = payload.position;

  if (typeof payload.noteId !== "string" || typeof payload.userId !== "string") {
    return false;
  }

  if (typeof position !== "object" || position === null) {
    return false;
  }

  const { x, y } = position as Record<string, unknown>;

  return typeof x === "number" && Number.isFinite(x) && typeof y === "number" && Number.isFinite(y);
}

export function subscribeToRoomPresence(
  roomId: string,
  userId: string,
  displayName: string,
  callback: (state: PresenceState) => void,
  onNoteDrag: NoteDragListener,
): RoomPresenceSubscription {
  const supabase = createClient();
  const channel = supabase.channel(roomId, {
    config: {
      presence: { key: userId },
    },
  });
  let editingNoteId: string | null = null;
  let isSubscribed = false;
  let isUnsubscribed = false;
  let pendingTrack: Promise<unknown> = Promise.resolve();

  const notify = () => {
    callback(
      calculatePresenceState(channel.presenceState<PresencePayload>()),
    );
  };

  const syncPresence = () => {
    if (!isSubscribed || isUnsubscribed) {
      return;
    }

    const payload: PresencePayload = {
      userId,
      displayName,
      ...(editingNoteId ? { editingNoteId } : {}),
    };

    pendingTrack = pendingTrack
      .then(() => channel.track(payload))
      .catch(() => undefined);
  };

  channel
    .on("presence", { event: "sync" }, notify)
    .on("presence", { event: "join" }, notify)
    .on("presence", { event: "leave" }, notify)
    .on("broadcast", { event: "note-drag" }, ({ payload }: { payload: unknown }) => {
      if (!isNoteDragPayload(payload) || payload.userId === userId) {
        return;
      }

      onNoteDrag(payload);
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        isSubscribed = true;
        syncPresence();
      }
    });

  return {
    setEditingNote(noteId) {
      editingNoteId = noteId;
      syncPresence();
    },
    clearEditingNote(noteId) {
      if (editingNoteId !== noteId) {
        return;
      }

      editingNoteId = null;
      syncPresence();
    },
    broadcastNoteDrag(payload) {
      if (!isSubscribed || isUnsubscribed) {
        return;
      }

      void channel
        .send({
          type: "broadcast",
          event: "note-drag",
          payload,
        })
        .catch(() => undefined);
    },
    unsubscribe() {
      isUnsubscribed = true;

      if (!isSubscribed) {
        void supabase.removeChannel(channel);
        return;
      }

      void pendingTrack.finally(() => {
        void channel.untrack().finally(() => {
          void supabase.removeChannel(channel);
        });
      });
    },
  };
}
