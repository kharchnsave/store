import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { safeAdminPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="mx-auto max-w-sm">
      <p className="eyebrow text-muted">Kharch n Save admin</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">For store staff. Accounts are set up by the store owner.</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-64 rounded-md bg-cream" aria-busy="true" />}>
          <LoginFormForReturnPath searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginFormForReturnPath({
  searchParams,
}: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={safeAdminPath(Array.isArray(next) ? next[0] : next)} />;
}
