begin;

create table if not exists public.staff_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  event_key text not null,
  kind text not null check (kind in ('assignment','reminder','starting','schedule','report')),
  title text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique(recipient_id,event_key)
);
create index if not exists staff_notifications_recipient_created on public.staff_notifications(recipient_id,created_at desc);
alter table public.staff_notifications enable row level security;
revoke all on public.staff_notifications from public,anon,authenticated;
-- All client operations use the authenticated, recipient-scoped functions below.

create or replace function public.staff_emit(p_key text,p_kind text,p_title text,p_message text,p_payload jsonb,p_teachers uuid[])
returns void language sql security definer set search_path='' as $$
  insert into public.staff_notifications(recipient_id,event_key,kind,title,message,payload)
  select p.id,p_key,p_kind,p_title,p_message,p_payload from public.profiles p
  where p.status='active' and (p.role='owner' or (p.role='teacher' and p.id=any(coalesce(p_teachers,'{}'::uuid[]))))
  on conflict(recipient_id,event_key) do update set
    message=excluded.message,payload=excluded.payload,read_at=null;
$$;
revoke all on function public.staff_emit(text,text,text,text,jsonb,uuid[]) from public,anon,authenticated;

create or replace function public.staff_assignment_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare es public.enrollment_students%rowtype; learner text; teacher_name text;
begin
  if new.status is distinct from 'active' then return new; end if;
  if tg_op='UPDATE' then
    if old.status is not distinct from new.status and old.teacher_id is not distinct from new.teacher_id
      and old.enrollment_student_id is not distinct from new.enrollment_student_id then return new; end if;
  end if;
  select * into es from public.enrollment_students where id=new.enrollment_student_id;
  select coalesce(nullif(preferred_name,''),full_name,'Student') into learner from public.students where id=es.student_id;
  select coalesce(full_name,'Teacher') into teacher_name from public.profiles where id=new.teacher_id;
  perform public.staff_emit('assignment:'||new.id||':'||txid_current(),'assignment','New assignment',
    teacher_name||' was assigned to '||learner||'.',
    jsonb_build_object('student_id',es.student_id,'enrollment_id',es.enrollment_id,'enrollment_student_id',es.id),array[new.teacher_id]);
  return new;
end; $$;
revoke all on function public.staff_assignment_notice() from public,anon,authenticated;
drop trigger if exists staff_assignment_notice on public.teacher_assignments;
create trigger staff_assignment_notice after insert or update on public.teacher_assignments for each row execute function public.staff_assignment_notice();

create or replace function public.staff_lesson_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare learner_id uuid; es_id uuid; learner text; zone text; teacher_ids uuid[]; k text; data jsonb;
begin
  if (old.lesson_date,old.schedule_time,old.attendance_status,old.substitute_teacher_id,old.resolution)
    is distinct from (new.lesson_date,new.schedule_time,new.attendance_status,new.substitute_teacher_id,new.resolution) then
    delete from public.staff_notifications where kind in ('reminder','starting') and payload->>'lesson_id'=new.id::text;
  end if;
  if (old.lesson_date,old.schedule_time) is not distinct from (new.lesson_date,new.schedule_time) then return new; end if;
  select coalesce(new.student_id,e.student_id) into learner_id from public.enrollments e where e.id=new.enrollment_id;
  select id into es_id from public.enrollment_students where enrollment_id=new.enrollment_id and student_id=learner_id limit 1;
  select coalesce(nullif(preferred_name,''),full_name,'Student'),coalesce(nullif(timezone,''),'Asia/Manila')
    into learner,zone from public.students where id=learner_id;
  select array_agg(teacher_id) into teacher_ids from public.teacher_assignments where enrollment_student_id=es_id and status='active';
  teacher_ids:=coalesce(teacher_ids,'{}'::uuid[])||array_remove(array[old.substitute_teacher_id,new.substitute_teacher_id],null);
  -- A bulk schedule edit becomes one entry per participant and transaction.
  k:='schedule:'||new.enrollment_id||':'||learner_id||':'||txid_current();
  select payload into data from public.staff_notifications where event_key=k limit 1;
  data:=jsonb_build_object('student_id',learner_id,'enrollment_id',new.enrollment_id,'enrollment_student_id',es_id,
    'timezone',zone,'changes',coalesce(data->'changes','[]'::jsonb)||jsonb_build_array(jsonb_build_object(
      'lesson_id',new.id,'old_date',old.lesson_date,'old_time',old.schedule_time,'date',new.lesson_date,'time',new.schedule_time,
      'old_starts_at',(old.lesson_date+old.schedule_time) at time zone zone,
      'starts_at',(new.lesson_date+new.schedule_time) at time zone zone)));
  perform public.staff_emit(k,'schedule','Schedule changed',learner||' has an updated class schedule.',data,teacher_ids);
  return new;
end; $$;
revoke all on function public.staff_lesson_notice() from public,anon,authenticated;
drop trigger if exists staff_lesson_notice on public.lessons;
create trigger staff_lesson_notice after update on public.lessons for each row execute function public.staff_lesson_notice();

create or replace function public.staff_schedule_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare es_id uuid; learner text; zone text; teachers uuid[]; pht_slots jsonb; first_start timestamptz;
begin
  select id into es_id from public.enrollment_students where enrollment_id=new.enrollment_id and student_id=new.student_id limit 1;
  select coalesce(nullif(preferred_name,''),full_name,'Student'),coalesce(nullif(timezone,''),'Asia/Manila') into learner,zone
    from public.students where id=new.student_id;
  select array_agg(teacher_id) into teachers from public.teacher_assignments where enrollment_student_id=es_id and status='active';
  select jsonb_agg(to_char(starts at time zone 'Asia/Manila','Dy HH12:MI AM') order by starts),min(starts)
    into pht_slots,first_start from (
      select ((new.effective_on+(((slot->>'day')::int-extract(dow from new.effective_on)::int+7)%7))
        +(slot->>'time')::time) at time zone zone starts from jsonb_array_elements(new.new_slots) slot
    ) times;
  perform public.staff_emit('schedule:'||new.enrollment_id||':'||new.student_id||':'||txid_current(),'schedule','Schedule changed',
    learner||' has a revised weekly schedule.',
    jsonb_build_object('student_id',new.student_id,'enrollment_id',new.enrollment_id,'enrollment_student_id',es_id,
      'effective_on',new.effective_on,'slots',new.new_slots,'timezone',zone,'slots_pht',pht_slots,'first_start',first_start),teachers);
  return new;
end; $$;
revoke all on function public.staff_schedule_notice() from public,anon,authenticated;
drop trigger if exists staff_schedule_notice on public.enrollment_schedule_changes;
create trigger staff_schedule_notice after insert on public.enrollment_schedule_changes for each row execute function public.staff_schedule_notice();

create or replace function public.staff_report_notice() returns trigger
language plpgsql security definer set search_path='' as $$
declare es record; teachers uuid[];
begin
  if new.status='completed' and old.status is distinct from 'completed' then
    for es in select p.id,p.student_id,coalesce(nullif(s.preferred_name,''),s.full_name,'Student') as name
      from public.enrollment_students p join public.students s on s.id=p.student_id where p.enrollment_id=new.id
    loop
      if exists(select from public.progress_reports where enrollment_student_id=es.id and status='completed') then continue; end if;
      -- Reports remain accessible to the last assigned teacher after the term ends.
      select array_agg(teacher_id) into teachers from (
        select teacher_id from public.teacher_assignments where enrollment_student_id=es.id
        order by (status='active') desc,created_at desc,id desc limit 1
      ) a;
      perform public.staff_emit('report:'||es.id,'report','Progress report due',es.name||'’s term has ended. Please complete the progress report.',
        jsonb_build_object('student_id',es.student_id,'enrollment_id',new.id,'enrollment_student_id',es.id),teachers);
    end loop;
  elsif new.status is distinct from 'completed' then
    delete from public.staff_notifications where kind='report' and payload->>'enrollment_id'=new.id::text;
  end if;
  return new;
end; $$;
revoke all on function public.staff_report_notice() from public,anon,authenticated;
drop trigger if exists staff_report_notice on public.enrollments;
create trigger staff_report_notice after update of status on public.enrollments for each row execute function public.staff_report_notice();

create or replace function public.staff_report_finished() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.status='completed' then
    delete from public.staff_notifications where kind='report' and payload->>'enrollment_student_id'=new.enrollment_student_id::text;
  end if;
  return new;
end; $$;
revoke all on function public.staff_report_finished() from public,anon,authenticated;
drop trigger if exists staff_report_finished on public.progress_reports;
create trigger staff_report_finished after insert or update on public.progress_reports for each row execute function public.staff_report_finished();

create or replace function public.staff_notification_feed() returns jsonb
language plpgsql security definer set search_path='' as $$
declare who uuid:=auth.uid(); staff_role text; snapshot timestamptz:=now();
begin
  select role into staff_role from public.profiles where id=who and status='active' and role in ('owner','teacher');
  if staff_role is null then raise exception 'Active staff access required.' using errcode='42501'; end if;
  with candidates as (
    select l.id,l.enrollment_id,es.id es_id,s.id student_id,l.lesson_date,l.schedule_time,
      coalesce(nullif(s.preferred_name,''),s.full_name,'Student') learner,
      (l.lesson_date+l.schedule_time) at time zone coalesce(nullif(s.timezone,''),'Asia/Manila') starts,
      coalesce(l.substitute_teacher_id,a.teacher_id) teacher_id
    from public.lessons l join public.enrollments e on e.id=l.enrollment_id and e.status='active'
    join public.students s on s.id=coalesce(l.student_id,e.student_id)
    join pg_timezone_names tz on tz.name=coalesce(nullif(s.timezone,''),'Asia/Manila')
    left join public.enrollment_students es on es.enrollment_id=e.id and es.student_id=s.id
    left join lateral (
      select teacher_id from public.teacher_assignments where enrollment_student_id=es.id and status='active'
        and (start_date is null or start_date<=l.lesson_date) and (end_date is null or end_date>=l.lesson_date)
      order by created_at desc,id desc limit 1
    ) a on true
    where l.lesson_date between (snapshot at time zone 'UTC')::date-1 and (snapshot at time zone 'UTC')::date+1
      and l.schedule_time is not null and (l.attendance_status='scheduled' or
        (l.resolution='rescheduled' and l.attendance_status in ('student_cancelled_rescheduled','unexpected_circumstance','teacher_cancelled')))
      and not exists(select from public.enrollment_pauses p where p.enrollment_id=e.id and p.resumed_at is null
        and (p.student_id is null or p.student_id=s.id) and p.starts_on<=l.lesson_date)
  ), due as (
    select *,case when starts>snapshot then 'reminder' else 'starting' end kind from candidates
    where starts between snapshot-interval '2 minutes' and snapshot+interval '5 minutes'
      and (staff_role='owner' or teacher_id=who)
  )
  insert into public.staff_notifications(recipient_id,event_key,kind,title,message,payload)
  select who,kind||':'||id||':'||extract(epoch from starts)::text||':'||coalesce(teacher_id::text,'unassigned'),kind,
    case when kind='reminder' then 'Class in 5 minutes' else 'Class starts now' end,
    learner||case when kind='reminder' then '’s class is starting soon.' else '’s class is starting.' end,
    jsonb_build_object('lesson_id',id,'student_id',student_id,'enrollment_id',enrollment_id,
      'enrollment_student_id',es_id,'starts_at',starts,'teacher_id',teacher_id,
      'teacher_name',(select full_name from public.profiles where id=teacher_id))
  from due on conflict(recipient_id,event_key) do nothing;

  -- Supersede yellow reminders as their red start alert becomes due.
  update public.staff_notifications set read_at=snapshot where recipient_id=who and kind='reminder' and read_at is null
    and (payload->>'starts_at')::timestamptz<=snapshot;
  return jsonb_build_object('checked_at',snapshot,'unread',(
    select count(*) from public.staff_notifications where recipient_id=who and read_at is null and created_at>snapshot-interval '30 days'),
    'items',(select coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc,n.id),'[]'::jsonb) from (
      select id,kind,title,message,payload,created_at,read_at from public.staff_notifications
      where recipient_id=who and created_at>snapshot-interval '30 days' order by created_at desc,id limit 80
    ) n));
end; $$;
revoke all on function public.staff_notification_feed() from public,anon;
grant execute on function public.staff_notification_feed() to authenticated;

create or replace function public.staff_notifications_read(p_ids uuid[] default null,p_before timestamptz default null) returns void
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select from public.profiles where id=auth.uid() and status='active' and role in ('owner','teacher')) then
    raise exception 'Active staff access required.' using errcode='42501'; end if;
  update public.staff_notifications set read_at=now() where recipient_id=auth.uid() and read_at is null
    and ((p_ids is not null and id=any(p_ids)) or (p_before is not null and created_at<=least(p_before,now())));
end; $$;
revoke all on function public.staff_notifications_read(uuid[],timestamptz) from public,anon;
grant execute on function public.staff_notifications_read(uuid[],timestamptz) to authenticated;
commit;
