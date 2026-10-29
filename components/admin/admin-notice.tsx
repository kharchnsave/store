export function AdminNotice({ title, children }: { title: string; children: React.ReactNode }) {
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
