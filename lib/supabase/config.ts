/*
 * Supabase project settings shared by every client (catalogue, admin
 * session and the proxy). The values are the public URL and publishable key,
 * so this module is safe to import anywhere on the server, including
 * proxy.ts, which can't import "server-only" modules.
 */

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** The project URL and publishable key, or a clear error if they're unusable. */
export function getSupabaseConfig() {
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
  return { url, key };
}

/**
 * Auth cookie settings for the admin session. Nothing in the browser reads
 * the session (there is no client-side Supabase), so the cookies are
 * HttpOnly, and they're scoped to /admin so storefront requests never carry
 * them.
 */
export const SESSION_COOKIE_OPTIONS = {
  path: "/admin",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

/**
 * fetch for Supabase clients: keeps requests out of Next's fetch cache, which
 * persists across builds. Catalogue reads are cached explicitly with
 * "use cache"; session requests must never be cached at all.
 */
export function noStoreFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, cache: "no-store" });
}
