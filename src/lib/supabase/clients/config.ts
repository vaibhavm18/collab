const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKeyEnv =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let hasLoggedConfiguration = false;

export function getSupabaseConfig() {
  const missingVariables = [
    !supabaseUrlEnv ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !supabasePublishableKeyEnv
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : null,
  ].filter((variable): variable is string => variable !== null);

  if (!supabaseUrlEnv || !supabasePublishableKeyEnv) {
    const message = `[Supabase] Missing required environment variable(s): ${missingVariables.join(
      ", ",
    )}`;
    console.error(message);
    throw new Error(message);
  }

  let supabaseOrigin: string;
  try {
    supabaseOrigin = new URL(supabaseUrlEnv).origin;
  } catch {
    const message =
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL must be a valid URL";
    console.error(message);
    throw new Error(message);
  }

  if (!hasLoggedConfiguration) {
    console.info("[Supabase] Client configuration loaded", {
      environment: process.env.NODE_ENV,
      runtime: typeof window === "undefined" ? "server" : "browser",
      supabaseOrigin,
      publishableKeyConfigured: true,
    });
    hasLoggedConfiguration = true;
  }

  return {
    supabaseUrl: supabaseUrlEnv,
    supabasePublishableKey: supabasePublishableKeyEnv,
  };
}
