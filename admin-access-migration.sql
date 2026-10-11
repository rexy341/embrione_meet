-- Run this in Supabase SQL Editor if your project was set up using an older
-- version of the Embrione challenge SQL. It removes legacy permissive policies
-- and installs the intended public-read-approved / admin-manage-all policies.
alter table public.members enable row level security;

-- Remove old broad policies (these may have been created by the original brief).
drop policy if exists "Allow public insert" on public.members;
drop policy if exists "Allow public read" on public.members;
drop policy if exists "Allow admin updates" on public.members;
drop policy if exists "Allow admin deletes" on public.members;

-- Remove current versions too so this migration is safe to re-run.
drop policy if exists "Public can submit pending members" on public.members;
drop policy if exists "Public can read approved profiles" on public.members;
drop policy if exists "Admin can read all members" on public.members;
drop policy if exists "Admin can update members" on public.members;
drop policy if exists "Admin can delete members" on public.members;

revoke all on public.members from anon, authenticated;
grant select, insert on public.members to anon;
grant select, insert, update, delete on public.members to authenticated;

create policy "Public can submit pending members" on public.members
  for insert to anon, authenticated
  with check (status = 'pending');

create policy "Public can read approved profiles" on public.members
  for select to anon, authenticated
  using (status = 'approved');

create policy "Admin can read all members" on public.members
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

create policy "Admin can update members" on public.members
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu')
  with check ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

create policy "Admin can delete members" on public.members
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

-- Admin can delete uploaded photos from the public member-photos bucket.
drop policy if exists "Admin can delete member photos" on storage.objects;
create policy "Admin can delete member photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-photos' and (auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');
