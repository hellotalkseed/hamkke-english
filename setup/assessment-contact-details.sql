begin;

alter table public.assessment_bookings
  add column if not exists contact_details jsonb not null default '{}'::jsonb;

-- Preserve existing bookings; the application falls back to their old contact ID.
-- No public Storage policies are created. Uploads/downloads use the authorized server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-contact-qr', 'assessment-contact-qr', false, 1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Restrict this bucket even if another existing policy grants broad access.
-- service_role bypasses RLS; public visitors and signed-in clients cannot read it directly.
drop policy if exists "Hamkke assessment QR server access only" on storage.objects;
create policy "Hamkke assessment QR server access only"
  on storage.objects as restrictive for all to anon, authenticated
  using (bucket_id <> 'assessment-contact-qr')
  with check (bucket_id <> 'assessment-contact-qr');

commit;
