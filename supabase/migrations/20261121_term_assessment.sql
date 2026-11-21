alter table public.progress_reports
  add column if not exists term_assessment jsonb
  check (term_assessment is null or jsonb_typeof(term_assessment) = 'object');
