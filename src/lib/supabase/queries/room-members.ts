"use client";

import { createClient } from "@/lib/supabase/clients/client";
import { joinRoom } from "@/lib/supabase/queries/rooms";
import type {
  DataResult,
  Profile,
  RoomMember,
  RoomMembership,
} from "@/lib/supabase/types";

export async function getRoomMembers(
  roomId: string,
): Promise<DataResult<RoomMember[]>> {
  const membershipResult = await joinRoom(roomId);

  if (membershipResult.error) {
    return { data: null, error: membershipResult.error };
  }

  const { data: memberships, error: membershipsError } = await createClient()
    .from("room_members")
    .select("id, room_id, user_id, role, joined_at")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true })
    .overrideTypes<RoomMembership[], { merge: false }>();

  if (membershipsError) {
    return { data: null, error: membershipsError };
  }

  if (memberships.length === 0) {
    return { data: [], error: null };
  }

  const userIds = memberships.map((membership) => membership.user_id);
  const { data: profiles, error: profilesError } = await createClient()
    .from("profiles")
    .select("id, display_name, created_at")
    .in("id", userIds)
    .overrideTypes<Profile[], { merge: false }>();

  if (profilesError) {
    return { data: null, error: profilesError };
  }

  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile.display_name]),
  );

  return {
    data: memberships.map((membership) => ({
      ...membership,
      display_name: profilesById.get(membership.user_id) ?? "User",
      online: false,
    })),
    error: null,
  };
}
