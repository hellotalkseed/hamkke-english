-- Add dedicated teaching-focus selections to public teacher profiles.
-- Existing profile data is left unchanged.

alter table public.teacher_public_profiles
add column if not exists teaching_focus text[] not null default '{}'::text[];

comment on column public.teacher_public_profiles.teaching_focus is
'Teaching areas selected by the teacher for their public profile.';
