-- Hamkke payroll lifecycle: Pending -> Paid -> Confirmed
alter table public.teacher_payroll
  add column if not exists received_at timestamptz null,
  add column if not exists received_by uuid null references public.profiles(id) on delete set null;

-- Approval is no longer a payroll step. Existing approved payrolls return to
-- Pending so the owner can record the actual transfer details.
update public.teacher_payroll set status = 'pending' where status = 'approved';
update public.teacher_payroll set status = 'confirmed' where status = 'received';

do $$
declare c record;
begin
  for c in select conname from pg_constraint where conrelid = 'public.teacher_payroll'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%status%' loop
    execute format('alter table public.teacher_payroll drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.teacher_payroll
  add constraint teacher_payroll_status_check
  check (status in ('pending','paid','confirmed'));

create table if not exists public.teacher_payroll_audit (
  id uuid primary key default gen_random_uuid(),
  payroll_id uuid not null references public.teacher_payroll(id) on delete cascade,
  actor_user_id uuid null references auth.users(id) on delete set null,
  actor_role text not null check (actor_role in ('owner','teacher','system')),
  event_type text not null check (event_type in ('approved','payment_sent','payment_received')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists teacher_payroll_audit_payroll_created_idx
  on public.teacher_payroll_audit(payroll_id, created_at);

alter table public.teacher_payroll_audit enable row level security;

comment on column public.teacher_payroll.paid_at is 'Server timestamp when the owner recorded the transfer as paid.';
comment on column public.teacher_payroll.received_at is 'Server timestamp when the teacher confirmed receipt.';
comment on table public.teacher_payroll_audit is 'Append-only payroll lifecycle evidence for payment and teacher receipt confirmation.';
