-- Admin membership: which Supabase Auth users may use the /admin area.
--
-- Signing in proves who someone is; a row here is what makes them an admin.
-- Rows are added by the project owner in the SQL Editor (see
-- supabase/setup/grant_admin_TEMPLATE.sql). Nobody can add, change or
-- remove memberships through the API, and access never depends on email
-- addresses or user-editable metadata.
--
-- Access: RLS is enabled. Visitors (anon) have no access at all. A signed-in
-- user (authenticated) can read only their own row, which is how the app
-- checks "am I an admin?". No role has insert, update or delete rights.
--
-- Catalogue tables and their permissions are not changed by this migration.

create table public.admin_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_members is
  'Supabase Auth users allowed into /admin. Managed by the owner in the SQL Editor only.';
comment on column public.admin_members.user_id is
  'The user''s Supabase Auth UUID (Authentication → Users → User UID). Deleting the user removes the membership.';

-- Enabled explicitly, whatever the dashboard default is.
alter table public.admin_members enable row level security;

-- Supabase grants anon and authenticated full access to new tables in the
-- public schema by default. Reset that: visitors get nothing, signed-in
-- users may only read (and RLS limits that to their own row).
revoke all on table public.admin_members from public, anon, authenticated;
grant select on table public.admin_members to authenticated;

create policy "Users can see their own admin membership"
  on public.admin_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));
