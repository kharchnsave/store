import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig, noStoreFetch } from "./config";

export { isSupabaseConfigured } from "./config";

/*
 * Anonymous Supabase client for server-side catalogue queries. It uses the
 * project's publishable key and never reads cookies, so it only sees what
 * row-level security allows anonymous visitors to read, and its results are
 * safe to cache and share. Never pass a secret (service-role) key here.
 *
 * Signed-in (admin) requests use the separate per-request client in
 * ./session.ts instead.
 *
 * Configuration is checked when the client is first requested, not on
 * import.
 */

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const { url, key } = getSupabaseConfig();

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
      fetch: noStoreFetch,
    },
  });
  return client;
}
