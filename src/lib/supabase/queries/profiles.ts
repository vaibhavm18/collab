"use client";

import { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/clients/client";
import type { DataResult, Profile } from "@/lib/supabase/types";

export async function getCurrentProfile(): Promise<DataResult<Profile>> {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }

  if (!userData.user) {
    return {
      data: null,
      error: new AuthError("Authentication required", 401, "not_authenticated"),
    };
  }

  return supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("id", userData.user.id)
    .single<Profile>();
}
