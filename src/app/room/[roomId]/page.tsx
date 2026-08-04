import { RoomPageClient } from "@/components/rooms/room-page-client";
import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(`/?returnTo=${encodeURIComponent(`/room/${roomId}`)}`);
  }

  return <RoomPageClient roomId={roomId} />;
}
