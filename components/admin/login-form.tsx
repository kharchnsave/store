"use client";

import { useActionState, useId } from "react";
import { signIn, type SignInState } from "@/app/admin/actions";

const INITIAL: SignInState = { error: null, email: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, INITIAL);
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <form action={action} className="space-y-4" aria-describedby={state.error ? errorId : undefined}>
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-semibold">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          className="h-11 w-full rounded-md border border-line px-3 text-sm focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest"
        />
      </div>
      <div>
        <label htmlFor={`${id}-password`} className="mb-1.5 block text-sm font-semibold">
          Password
        </label>
        <input
          id={`${id}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          className="h-11 w-full rounded-md border border-line px-3 text-sm focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-forest"
        />
      </div>
      <p id={errorId} role="alert" className={state.error ? "text-sm font-medium text-danger" : "sr-only"}>
        {state.error}
      </p>
      <button type="submit" disabled={pending} className="btn btn-forest h-11 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
