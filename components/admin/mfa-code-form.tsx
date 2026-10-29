"use client";

import { useActionState, useId } from "react";
import { verifyMfaCode, type CodeState } from "@/app/admin/mfa/actions";

const INITIAL: CodeState = { error: null };

/**
 * The 6-digit authenticator code. `factorId` is only sent while finishing a
 * setup; the server checks it belongs to this user's unfinished setup.
 */
export function MfaCodeForm({
  next,
  factorId,
  submitLabel,
}: {
  next: string;
  factorId?: string;
  submitLabel: string;
}) {
  const [state, action, pending] = useActionState(verifyMfaCode, INITIAL);
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {factorId ? <input type="hidden" name="factorId" value={factorId} /> : null}
      <div>
        <label htmlFor={`${id}-code`} className="mb-1.5 block text-sm font-semibold">
          6-digit code
        </label>
        <input
          id={`${id}-code`}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
          aria-describedby={state.error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={state.error ? true : undefined}
          className="h-11 w-full max-w-[12rem] rounded-md border border-line px-3 font-mono text-lg tracking-[0.3em] focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest"
        />
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          Open your authenticator app and enter the code shown for Kharch n Save. It changes every 30
          seconds.
        </p>
      </div>
      <p id={errorId} role="alert" className={state.error ? "text-sm font-medium text-danger" : "sr-only"}>
        {state.error}
      </p>
      <button type="submit" disabled={pending} className="btn btn-forest h-11">
        {pending ? "Checking…" : submitLabel}
      </button>
    </form>
  );
}
