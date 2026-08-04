"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/clients/client";
import { joinRoom } from "@/lib/supabase/queries/rooms";
import type {
  DataResult,
  Note,
  NoteColor,
  NotePosition,
  Unsubscribe,
} from "@/lib/supabase/types";

const noteColumns =
  "id, room_id, content, position_x, position_y, created_by, created_at, updated_at, color";

export function subscribeToRoomNotes(
  roomId: string,
  callback: (payload: RealtimePostgresChangesPayload<Note>) => void,
): Unsubscribe {
  const supabase = createClient();
  const channel = supabase.channel(`room-notes:${roomId}`);

  // Supabase cannot apply filters to DELETE events. Keep the room filter on
  // inserts/updates, and receive deletes unfiltered so other clients can
  // remove the note from their board too.
  channel
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notes",
        filter: `room_id=eq.${roomId}`,
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notes",
        filter: `room_id=eq.${roomId}`,
      },
      callback,
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "notes",
      },
      callback,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function getRoomNotes(
  roomId: string,
): Promise<DataResult<Note[]>> {
  const membershipResult = await joinRoom(roomId);

  if (membershipResult.error) {
    return { data: null, error: membershipResult.error };
  }

  return createClient()
    .from("notes")
    .select(noteColumns)
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .overrideTypes<Note[], { merge: false }>();
}

export async function createNote(
  roomId: string,
  content: string,
  position: NotePosition,
  color: NoteColor,
): Promise<DataResult<Note>> {
  const membershipResult = await joinRoom(roomId);

  if (membershipResult.error) {
    return { data: null, error: membershipResult.error };
  }

  return createClient()
    .from("notes")
    .insert({
      room_id: roomId,
      content,
      position_x: position.x,
      position_y: position.y,
      color,
    })
    .select(noteColumns)
    .single<Note>();
}

export async function updateNotePosition(
  noteId: string,
  position: NotePosition,
): Promise<DataResult<null>> {
  const { error } = await createClient()
    .from("notes")
    .update({ position_x: position.x, position_y: position.y })
    .eq("id", noteId);

  return { data: null, error };
}

export async function updateNoteContent(
  noteId: string,
  content: string,
): Promise<DataResult<null>> {
  const { error } = await createClient()
    .from("notes")
    .update({ content })
    .eq("id", noteId);

  return { data: null, error };
}

export async function deleteNote(noteId: string): Promise<DataResult<null>> {
  const { error } = await createClient()
    .from("notes")
    .delete()
    .eq("id", noteId);

  return { data: null, error };
}
