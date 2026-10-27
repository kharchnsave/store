import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Supabase client for server-side catalogue queries. It uses the project's
 * publishable key, so it only sees what row-level security allows anonymous
 * visitors to read. Never pass a secret (service-role) key here.
 *
 * Configuration is checked when the client is first requested, not on
 * import, so the demo storefront keeps working without it.
 */

let client: SupabaseClient | undefined;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    const missing = [
      !url && "NEXT_PUBLIC_SUPABASE_URL",
      !key && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ].filter(Boolean);
    throw new Error(
      `Supabase isn't configured: set ${missing.join(" and ")} in .env.local ` +
        "(see .env.example), then restart the server.",
    );
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key. Use the " +
        "project's publishable key; secret keys must never be NEXT_PUBLIC_.",
    );
  }

  // No user sessions on the server: every request reads as an anonymous visitor.
  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Callers cache results with "use cache" + cacheLife. Keep the raw
      // requests out of Next's separate fetch cache, which persists across
      // builds and would otherwise let data outlive that lifetime.
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}
