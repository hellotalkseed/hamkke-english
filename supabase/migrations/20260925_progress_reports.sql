-- Hamkke progress reports: one report per enrollment participant.
-- This keeps shared-enrollment learners independent while preserving their shared package.
create table if not exists public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  enrollment_student_id uuid not null references public.enrollment_students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id),
  status text not null default 'draft' check (status in ('draft','completed')),
  communication_expression text not null default '',
  speaking_interaction text not null default '',
  vocabulary_expression_range text not null default '',
  grammar_sentence_building text not null default '',
  pronunciation_clarity text not null default '',
  confidence_participation text not null default '',
  overall_progress text not null default '',
  next_focus text not null default '',
  teacher_note text not null default '',
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint progress_reports_one_per_enrollment_student unique (enrollment_student_id)
);
create index if not exists progress_reports_teacher_id_idx on public.progress_reports(teacher_id);
alter table public.progress_reports enable row level security;
comment on table public.progress_reports is 'One Hamkke progress report per student enrollment participant. Server APIs enforce teacher assignment access.';
