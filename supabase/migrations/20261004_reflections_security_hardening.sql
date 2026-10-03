-- Reflection/testimonial security hardening.
-- Public visitors may read approved reflections only.
-- Reflection submissions and photo uploads are handled by the protected server API.

alter table public.reflections enable row level security;

drop policy if exists "Anyone can submit reflections"
on public.reflections;

drop policy if exists "Anyone can update reflections"
on public.reflections;

drop policy if exists "Anyone can delete reflections"
on public.reflections;

drop policy if exists "Anyone can view reflections"
on public.reflections;

drop policy if exists "Anyone can view approved reflections"
on public.reflections;

create policy "Anyone can view approved reflections"
on public.reflections
for select
to anon
using (approved is true);

drop policy if exists "Anyone can upload reflection photos 9tvqnc_0"
on storage.objects;

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
where id = 'reflections';
