"use server";

import { isAuthApiError, type Factor } from "@supabase/supabase-js";
import { redirect, unstable_rethrow } from "next/navigation";
import { getMfaContext } from "@/lib/auth/admin";
import { ADMIN_LOGIN, mfaPath, safeAdminPath } from "@/lib/auth/safe-redirect";

/*
 * Two-step verification (authenticator app, TOTP) for admins.
 *
 * Both actions re-check identity and membership on the server
 * (getMfaContext) and only act for a member who still needs this step.
 * Nothing here removes a verified factor, and nothing is logged except error
 * codes: never codes, setup keys, QR contents or tokens. Codes arrive only as
 * form fields and setup details leave only as a return value, because Next.js
 * logs Server Action arguments in development (form fields excepted).
 */

export type EnrollmentResult =
  | { ok: true; factorId: string; qrCode: string; secret: string }
  | { ok: false; error: string };

export type CodeState = { error: string | null };

const isTotp = (f: Factor) => f.factor_type === "totp";
const newestFirst = (a: Factor, b: Factor) => Date.parse(b.created_at) - Date.parse(a.created_at);

const SETUP_FAILED = "We couldn't start the setup right now. Please try again.";
const VERIFY_FAILED = "We couldn't check your code right now. Please try again.";

function describeError(error: unknown, fallback: string): string {
  if (!isAuthApiError(error)) return fallback;
  switch (error.code) {
    case "mfa_verification_failed":
      return "That code didn't work. Enter the current 6-digit code from your authenticator app for Kharch n Save.";
    case "mfa_challenge_expired":
      return "That code expired. Enter the newest code from your authenticator app.";
    case "mfa_factor_not_found":
      return "This setup has expired. Start the setup again.";
    case "mfa_totp_enroll_not_enabled":
    case "mfa_totp_verify_not_enabled":
      return "Authenticator apps are turned off for this store's sign-in. Ask the store owner to turn them on.";
    case "too_many_enrolled_mfa_factors":
      return "This account has too many unfinished setups. Ask the store owner to reset them.";
  }
  if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
  return fallback;
}

/**
 * Starts authenticator-app setup. Runs only when the admin presses the
 * button, never during rendering or prefetching. Unfinished setups from
 * earlier attempts are removed first, so retries don't pile up factors; an
 * account that already has a verified factor is sent to the code step.
 */
export async function startMfaEnrollment(formData: FormData): Promise<EnrollmentResult> {
  const next = safeAdminPath(formData.get("next"));
  let result: EnrollmentResult;
  try {
    const { access, supabase, factors } = await getMfaContext();
    if (access.status === "signed-out") redirect(ADMIN_LOGIN);
    if (access.status !== "mfa-required" || access.step !== "enroll" || !supabase) {
      // Already verified, already enrolled, not an admin or unavailable: the
      // two-step page shows the right screen for each.
      redirect(mfaPath(next));
    }

    for (const factor of factors.filter((f) => isTotp(f) && f.status !== "verified")) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) {
        console.error("[admin] Couldn't clear an unfinished setup:", error.code ?? error.status);
        return { ok: false, error: describeError(error, SETUP_FAILED) };
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Kharch n Save admin",
      issuer: "Kharch n Save",
    });
    if (error || !data?.totp) {
      console.error("[admin] Setup couldn't start:", error?.code ?? error?.status ?? "no factor");
      return { ok: false, error: describeError(error, SETUP_FAILED) };
    }
    result = { ok: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] Setup couldn't start:", error instanceof Error ? error.name : "error");
    result = { ok: false, error: SETUP_FAILED };
  }
  return result;
}

/**
 * Checks a 6-digit code, either to finish setup (the factor from this setup)
 * or after password sign-in (the account's verified factor). On success the
 * session is upgraded to aal2 and the new session cookies are written.
 */
export async function verifyMfaCode(_previous: CodeState, formData: FormData): Promise<CodeState> {
  const next = safeAdminPath(formData.get("next"));
  const code = String(formData.get("code") ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };

  let failed: string | null = null;
  try {
    const { access, supabase, factors } = await getMfaContext();
    if (access.status === "signed-out") redirect(ADMIN_LOGIN);
    if (access.status !== "mfa-required" || !supabase) redirect(mfaPath(next));

    // The factor is always one Supabase Auth lists for this user. The form's
    // factor ID only picks which unfinished setup to complete.
    const factor =
      access.step === "enroll"
        ? factors.find((f) => isTotp(f) && f.status !== "verified" && f.id === formData.get("factorId"))
        : factors.filter((f) => isTotp(f) && f.status === "verified").sort(newestFirst)[0];
    if (!factor) return { error: "This setup has expired. Start the setup again." };

    const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challenge.error) {
      console.error("[admin] Code challenge failed:", challenge.error.code ?? challenge.error.status);
      return { error: describeError(challenge.error, VERIFY_FAILED) };
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.data.id,
      code,
    });
    if (error) {
      if (error.code !== "mfa_verification_failed") {
        console.error("[admin] Code check failed:", error.code ?? error.status);
      }
      failed = describeError(error, VERIFY_FAILED);
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("[admin] Code check failed:", error instanceof Error ? error.name : "error");
    failed = VERIFY_FAILED;
  }
  if (failed) return { error: failed };

  // The destination checks identity, membership and aal2 again.
  redirect(next);
}
