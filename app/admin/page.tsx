import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getAdminAccess } from "@/lib/auth/admin";
import { ADMIN_LOGIN } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Checking your access…</p>}>
      <AdminHome />
    </Suspense>
  );
}

// Reads the session, so it renders per request behind the boundary and is
// never cached. Access is decided here on the server, not by the proxy.
async function AdminHome() {
  const access = await getAdminAccess();

  if (access.status === "signed-out") redirect(ADMIN_LOGIN);

  if (access.status === "unavailable") {
    return (
      <Notice title="We couldn't verify your access">
        <p>Sign-in or the admin check isn&apos;t responding right now, so the admin area stays locked.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/admin" className="btn btn-forest">
            Try again
          </Link>
          <SignOutButton />
        </div>
      </Notice>
    );
  }

  if (access.status === "not-admin") {
    return (
      <Notice title="This account doesn't have admin access">
        <p>
          You&apos;re signed in{access.email ? ` as ${access.email}` : ""}, but this account
          hasn&apos;t been given admin access. Ask the store owner if you need it.
        </p>
        <div className="mt-5">
          <SignOutButton />
        </div>
      </Notice>
    );
  }

  return (
    <section aria-labelledby="admin-heading">
      <p className="eyebrow text-muted">Kharch n Save admin</p>
      <h1 id="admin-heading" className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
        Welcome{access.email ? `, ${access.email}` : ""}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink/85">
        You&apos;re signed in as a store administrator. Product editing will be added here in a
        later step.
      </p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </section>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby="admin-notice-heading" className="max-w-xl">
      <p className="eyebrow text-muted">Kharch n Save admin</p>
      <h1 id="admin-notice-heading" className="mt-2 text-2xl font-extrabold tracking-tight">
        {title}
      </h1>
      <div className="mt-3 text-sm text-ink/85">{children}</div>
    </section>
  );
}
