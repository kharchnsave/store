import "server-only";
import { isAuthApiError, isAuthSessionMissingError } from "@supabase/supabase-js";
import { redirect, unstable_rethrow } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { ADMIN_LOGIN } from "./safe-redirect";

/*
 * Admin authorization, checked on the server for every admin page and
 * action. Being signed in is not enough: the user must also have a row in
 * public.admin_members (supabase/migrations/20261027200000_create_admin_members.sql),
 * which nobody can create through the API.
 *
 * It fails closed: if the user can't be verified with Supabase Auth, or the
 * membership lookup fails, access is refused.
 */

export type AdminAccess =
  | { status: "signed-out" }
  | { status: "not-admin"; email: string | null }
  | { status: "unavailable" }
  | { status: "admin"; userId: string; email: string | null };

export async function getAdminAccess(): Promise<AdminAccess> {
  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (error) {
    // Let Next.js handle its own signals (connection() and cookies() during
    // prerendering).
    unstable_rethrow(error);
    console.error("[admin] Supabase isn't configured:", error);
    return { status: "unavailable" };
  }

  // getUser() asks Supabase Auth to validate the session on every call, so a
  // signed-out, expired or deleted account is rejected straight away.
  // (getSession() only reads the cookie and must not be trusted here.)
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const invalidSession = isAuthApiError(error) && [400, 401, 403, 404].includes(error.status ?? 0);
    if (!error || isAuthSessionMissingError(error) || invalidSession) {
      return { status: "signed-out" };
    }
    console.error("[admin] Couldn't verify the session:", error.name, error.status ?? "");
    return { status: "unavailable" };
  }
  const user = data.user;

  // Row-level security only lets a user read their own membership row.
  const { data: membership, error: lookupError } = await supabase
    .from("admin_members")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (lookupError) {
    console.error("[admin] Membership lookup failed:", lookupError.code, lookupError.message);
    return { status: "unavailable" };
  }
  if (membership?.user_id !== user.id) {
    return { status: "not-admin", email: user.email ?? null };
  }
  return { status: "admin", userId: user.id, email: user.email ?? null };
}

/**
 * For Server Actions and Route Handlers that change admin data: returns the
 * verified admin, sends signed-out users to the login page, and throws for
 * everyone else. Call it inside every such action, not just on the page.
 */
export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access.status === "admin") return access;
  if (access.status === "signed-out") redirect(ADMIN_LOGIN);
  throw new Error("Admin access required.");
}
