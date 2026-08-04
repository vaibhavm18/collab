"use client";

import { createClient } from "@/lib/supabase/clients/client";
import type {
  DataResult,
  Room,
  RoomMembership,
} from "@/lib/supabase/types";

const roomColumns = "id, name, created_by, created_at";

export async function getRooms(): Promise<DataResult<Room[]>> {
  return createClient()
    .from("rooms")
    .select(roomColumns)
    .order("created_at", { ascending: false })
    .overrideTypes<Room[], { merge: false }>();
}

export async function createRoom(name: string): Promise<DataResult<Room>> {
  return await createClient()
    .rpc("create_room", { room_name: name })
    .single<Room>();
}

export async function joinRoom(
  roomId: string,
): Promise<DataResult<RoomMembership>> {
  return await createClient()
    .rpc("join_room", { requested_room_id: roomId })
    .single<RoomMembership>();
}

export async function getRoom(roomId: string): Promise<DataResult<Room>> {
  const membershipResult = await joinRoom(roomId);

  if (membershipResult.error) {
    return { data: null, error: membershipResult.error };
  }

  return createClient()
    .from("rooms")
    .select(roomColumns)
    .eq("id", roomId)
    .single<Room>();
}
