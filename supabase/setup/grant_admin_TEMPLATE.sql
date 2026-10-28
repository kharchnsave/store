-- =============================================================================
-- TEMPLATE: make one Supabase Auth user an admin. Do not run it unchanged.
-- =============================================================================
--
-- Before using it:
--   1. supabase/migrations/20261027200000_create_admin_members.sql has been run.
--   2. The user exists in Authentication → Users (created by you in the
--      dashboard; there is no public sign-up).
--   3. Copy that user's "User UID" and paste it below in place of
--      PASTE-USER-UID-HERE, keeping the quotes.
--
-- Paste the edited copy into the SQL Editor and run it. Don't save the real
-- UID back into this file or commit it: keep this file as a template.
--
-- Left unchanged, the statement fails with "invalid input syntax for type
-- uuid", so nothing is granted by accident. An unknown UID fails with a
-- foreign-key error. Running it twice is harmless.

insert into public.admin_members (user_id)
values ('PASTE-USER-UID-HERE')
on conflict (user_id) do nothing;

-- Check who has admin access (this lists every admin):
--   select m.user_id, u.email, m.created_at
--   from public.admin_members m
--   join auth.users u on u.id = m.user_id
--   order by m.created_at;

-- To remove someone's admin access later (their next page load is refused):
--   delete from public.admin_members where user_id = 'PASTE-USER-UID-HERE';
