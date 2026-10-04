begin;

-- Private submissions never go into the publicly readable reflections table.
create table if not exists public.learner_feedback (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  payload_hash text not null,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  author_user_id uuid references auth.users(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  source text not null check (source in ('portal', 'public_link')),
  learning_context text not null check (learning_context in ('hamkke', 'elsewhere')),
  name text not null check (length(trim(name)) between 1 and 100),
  role text not null check (role in ('Student', 'Parent / Guardian')),
  country text check (length(country) <= 100),
  rating integer not null check (rating between 1 and 5),
  reflection text not null check (length(trim(reflection)) between 1 and 5000),
  share_with_teacher boolean not null default false,
  publish_consent boolean not null default false,
  consent_version text not null,
  consent_locale text not null check (consent_locale in ('en', 'ko', 'zh', 'ja')),
  consent_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending', 'reviewed', 'archived')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_reflection_id uuid unique references public.reflections(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint feedback_public_consent_requires_teacher_sharing check (not publish_consent or share_with_teacher)
);
alter table public.learner_feedback enable row level security;
revoke all on public.learner_feedback from public, anon, authenticated;
grant select, insert, update, delete on public.learner_feedback to service_role;
create index if not exists learner_feedback_teacher_idx on public.learner_feedback(teacher_id, review_status, created_at desc);
create index if not exists learner_feedback_review_idx on public.learner_feedback(review_status, created_at desc);

-- Public copies carry context, but no portal account or student identifiers.
alter table public.reflections add column if not exists learning_context text;

-- Called only by the server after authenticating the owner. The additional
-- owner check and row lock make publication atomic and safe to retry.
create or replace function public.moderate_learner_feedback(
  p_id uuid, p_owner uuid, p_action text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  f public.learner_feedback%rowtype;
  published_id uuid;
begin
  if not exists (select 1 from public.profiles where id = p_owner and role = 'owner' and status = 'active') then
    raise exception 'Owner access required.' using errcode = '42501';
  end if;
  if p_action not in ('review', 'publish', 'unpublish', 'archive') then
    raise exception 'Invalid review action.';
  end if;
  select * into f from public.learner_feedback where id = p_id for update;
  if not found then raise exception 'Feedback not found.'; end if;
  if p_action = 'publish' then
    if not f.publish_consent or not f.share_with_teacher then
      raise exception 'The writer did not give permission to publish.' using errcode = '42501';
    end if;
    if f.review_status = 'archived' then raise exception 'Review this feedback before publishing.'; end if;
    if f.published_reflection_id is null then
      insert into public.reflections(rating, name, role, country, reflection, approved, teacher_id, learning_context)
      values(f.rating, f.name, f.role || case when f.learning_context = 'elsewhere' then ' · Lessons outside Hamkke' else '' end, f.country, f.reflection, true, f.teacher_id, f.learning_context)
      returning id into published_id;
      update public.learner_feedback set published_reflection_id = published_id where id = f.id;
    else
      update public.reflections set approved = true where id = f.published_reflection_id;
    end if;
  elsif p_action in ('unpublish', 'archive') and f.published_reflection_id is not null then
    delete from public.reflections where id = f.published_reflection_id;
    -- FK sets the private record's published_reflection_id to null.
  end if;
  update public.learner_feedback
  set review_status = case when p_action = 'archive' then 'archived' else 'reviewed' end,
      reviewed_by = p_owner, reviewed_at = now()
  where id = f.id;
end;
$$;
revoke all on function public.moderate_learner_feedback(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.moderate_learner_feedback(uuid, uuid, text) to service_role;
commit;
