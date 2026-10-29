"use server";

import { isAuthApiError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { ADMIN_LOGIN, mfaPath, safeAdminPath } from "@/lib/auth/safe-redirect";
import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/session";

export type SignInState = { error: string | null; email: string };

const GENERIC_FAILURE = "The email or password is incorrect.";

/**
 * Email/password sign-in. Messages are deliberately generic: they never say
 * whether an account exists. Signing in does not grant admin access: it
 * leads to the two-step page, which checks membership and asks for the
 * authenticator code before anything else.
 */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  const password = String(formData.get("password") ?? "");
  const next = safeAdminPath(formData.get("next"));

  if (!email.includes("@") || password.length === 0 || password.length > 1024) {
    return { error: GENERIC_FAILURE, email };
  }

  let failed: string | null = null;
  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      failed = isAuthApiError(error) && error.status === 429
        ? "Too many attempts. Please wait a minute and try again."
        : isAuthApiError(error) && error.status < 500
          ? GENERIC_FAILURE
          : "We couldn't sign you in right now. Please try again.";
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] Sign-in failed:", error);
    failed = "We couldn't sign you in right now. Please try again.";
  }
  if (failed) return { error: failed, email };

  redirect(mfaPath(next));
}

/** Ends this device's session, even if Supabase can't be reached. */
export async function signOut() {
  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] Sign-out request failed; clearing the session cookies:", error);
    const cookieStore = await cookies();
    for (const { name } of cookieStore.getAll()) {
      if (/^sb-.+-auth-token(\.\d+)?$/.test(name)) {
        cookieStore.delete({ name, path: SESSION_COOKIE_OPTIONS.path });
      }
    }
  }
  redirect(ADMIN_LOGIN);
}
