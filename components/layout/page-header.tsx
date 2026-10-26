import Link from "next/link";

export function PageHeader({
  title,
  intro,
  crumb,
}: {
  title: string;
  intro?: React.ReactNode;
  crumb?: string;
}) {
  return (
    <div className="mb-8 border-b border-line pb-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex gap-1.5">
          <li>
            <Link href="/" className="hover:text-forest hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{crumb ?? title}</li>
        </ol>
      </nav>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      {intro ? <div className="mt-2 max-w-2xl text-[15px] text-muted">{intro}</div> : null}
    </div>
  );
}
