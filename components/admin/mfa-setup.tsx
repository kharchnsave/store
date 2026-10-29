"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { startMfaEnrollment, type EnrollmentResult } from "@/app/admin/mfa/actions";
import { MfaCodeForm } from "./mfa-code-form";

type Setup = Extract<EnrollmentResult, { ok: true }>;

function StartButton({ again }: { again: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={again ? "btn btn-outline" : "btn btn-forest h-11"}>
      {pending ? "Preparing…" : again ? "Start the setup again" : "Set up authenticator app"}
    </button>
  );
}

/**
 * Authenticator-app setup. The QR code and setup key exist only in this
 * component's memory: they are never stored in the browser, put in the URL
 * or logged, and they disappear on reload (the next "Set up" replaces the
 * unfinished setup).
 */
export function MfaSetup({ next }: { next: string }) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function begin(formData: FormData) {
    const result = await startMfaEnrollment(formData);
    if (result.ok) {
      setSetup(result);
      setError(null);
    } else {
      setSetup(null);
      setError(result.error);
    }
  }

  const startForm = (
    <form action={begin}>
      <input type="hidden" name="next" value={next} />
      <StartButton again={setup !== null} />
    </form>
  );

  if (!setup) {
    return (
      <div className="space-y-4">
        <p>
          Admin accounts need a second step at sign-in: a 6-digit code from an authenticator app on
          your phone, such as Google Authenticator, Microsoft Authenticator, 1Password or Authy.
          Install one first, then start the setup.
        </p>
        <p role="alert" className={error ? "text-sm font-medium text-danger" : "sr-only"}>
          {error}
        </p>
        {startForm}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="space-y-6">
        <li>
          <p className="font-semibold">1. Scan this QR code with your authenticator app.</p>
          {/* A data: URL returned by Supabase; next/image adds nothing here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.qrCode}
            alt="QR code for adding Kharch n Save to your authenticator app"
            width={192}
            height={192}
            className="mt-3 rounded-md border border-line bg-white p-2"
          />
        </li>
        <li>
          <p className="font-semibold">Can&apos;t scan it? Enter this setup key in the app instead:</p>
          <p className="mt-2 break-all rounded-md bg-cream px-3 py-2 font-mono text-base tracking-wider select-all">
            {setup.secret.replace(/(.{4})/g, "$1 ").trim()}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            Choose a time-based key if the app asks. Keep this key private: anyone with it can make
            codes for your account.
          </p>
        </li>
        <li>
          <p className="mb-3 font-semibold">2. Enter the 6-digit code the app now shows.</p>
          <MfaCodeForm
            key={setup.factorId}
            next={next}
            factorId={setup.factorId}
            submitLabel="Confirm and finish setup"
          />
        </li>
      </ol>
      <div className="border-t border-line pt-4">
        <p className="mb-3 text-xs text-muted">
          Lost this screen or the code keeps failing? Starting again replaces this setup with a new
          QR code.
        </p>
        {startForm}
      </div>
    </div>
  );
}
