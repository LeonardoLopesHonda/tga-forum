-- =====================================================================
-- profile_fields migration (roadmap row #9)
--
-- Part 1: avatars storage bucket + policies
-- Part 2: profiles table column additions  (added in next step)
-- =====================================================================


-- ---------------------------------------------------------------------
-- Part 1: avatars bucket
-- ---------------------------------------------------------------------

-- 1a. Create the bucket. Public so reads are anonymous; writes are gated
--     by the policies below. Idempotent on re-run.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


-- 1b. INSERT: an authenticated user can upload only to <their-uid>.<ext>.
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '.', 1)
);


-- 1c. UPDATE: same predicate, applied to both the existing row (USING)
--     and the new state (WITH CHECK). Re-upload overwrites.
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '.', 1)
)
with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '.', 1)
);


-- 1d. DELETE: same predicate.
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '.', 1)
);


-- SELECT: no policy — public bucket is anonymous-readable.


-- ---------------------------------------------------------------------
-- Part 2: profile column additions  (next step, leave blank for now)
-- ---------------------------------------------------------------------

alter table public.profiles
add column display_name varchar(50),
add column avatar_url   varchar(500),
add column location     varchar(100),
add column links        text[] not null default '{}';