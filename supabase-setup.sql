-- Run this whole script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null check (domain in ('Web Development','Design','Logistics','Operations','Sponsorship','Hospitality','Social Media','Event Management')),
  position text not null check (position in ('Head','Vice-Head','Core Member','Member')),
  srn text not null unique,
  email text not null,
  linkedin_url text,
  github_url text,
  branch text not null,
  semester integer not null check (semester between 1 and 8),
  bio text check (char_length(bio) <= 200),
  photo_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.members enable row level security;
revoke all on public.members from anon, authenticated;
grant select, insert on public.members to anon;
grant select, insert, update, delete on public.members to authenticated;

drop policy if exists "Public can submit pending members" on public.members;
create policy "Public can submit pending members" on public.members
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Public can read approved profiles" on public.members;
create policy "Public can read approved profiles" on public.members
  for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "Admin can read all members" on public.members;
create policy "Admin can read all members" on public.members
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

drop policy if exists "Admin can update members" on public.members;
create policy "Admin can update members" on public.members
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu')
  with check ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

drop policy if exists "Admin can delete members" on public.members;
create policy "Admin can delete members" on public.members
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

-- Public profile photo bucket. Limit uploads to images and 10 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-photos', 'member-photos', true, 10485760, array['image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/webp'];

drop policy if exists "Anyone can upload member WebP photos" on storage.objects;
create policy "Anyone can upload member WebP photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'member-photos' and (storage.extension(name) = 'webp'));

drop policy if exists "Public can view member photos" on storage.objects;
create policy "Public can view member photos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'member-photos');

drop policy if exists "Admin can delete member photos" on storage.objects;
create policy "Admin can delete member photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-photos' and (auth.jwt() ->> 'email') = 'admin@embrione.pes.edu');

-- Seed sample approved profiles so /team is populated after connecting Supabase.
-- These use remote placeholder avatars; replace with locally uploaded images if preferred.
insert into public.members (name, domain, position, srn, email, linkedin_url, github_url, branch, semester, bio, photo_url, status)
values
('Aanya Rao','Web Development','Head','DEMO-SRN-001','aanya.demo@example.com','https://linkedin.com','https://github.com','CSE',6,'Building thoughtful digital experiences and exploring the space where design meets engineering.','https://i.pravatar.cc/240?img=47','approved'),
('Rohan Mehta','Design','Core Member','DEMO-SRN-002','rohan.demo@example.com','https://linkedin.com','https://github.com','AIML',4,'Turning complex ideas into simple, accessible interfaces with a little personality.','https://i.pravatar.cc/240?img=12','approved'),
('Ishita Nair','Operations','Vice-Head','DEMO-SRN-003','ishita.demo@example.com','https://linkedin.com','https://github.com','CSE',6,'A systems thinker who loves bringing people together and making good ideas happen.','https://i.pravatar.cc/240?img=44','approved'),
('Kabir Shah','Logistics','Member','DEMO-SRN-004','kabir.demo@example.com','https://linkedin.com','https://github.com','ECE',2,'Curious about technology, teamwork, and the details that make an event memorable.','https://i.pravatar.cc/240?img=13','approved'),
('Meera Iyer','Social Media','Core Member','DEMO-SRN-005','meera.demo@example.com','https://linkedin.com','https://github.com','CSE',4,'Storytelling, creative campaigns, and finding fresh ways to build a community.','https://i.pravatar.cc/240?img=49','approved'),
('Arjun Das','Event Management','Member','DEMO-SRN-006','arjun.demo@example.com','https://linkedin.com','https://github.com','ME',2,'Enjoys collaborative projects, practical problem-solving, and a well-planned event.','https://i.pravatar.cc/240?img=60','approved')
on conflict (srn) do nothing;
