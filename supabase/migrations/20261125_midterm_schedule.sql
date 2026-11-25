begin;

create table public.enrollment_schedule_changes (
  id bigint generated always as identity primary key,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  student_id uuid not null references public.students(id),
  effective_on date not null,
  previous_slots jsonb not null,
  new_slots jsonb not null,
  lesson_changes jsonb not null,
  changed_by uuid not null references public.profiles(id),
  changed_at timestamptz not null default now()
);
alter table public.enrollment_schedule_changes enable row level security;
revoke all on public.enrollment_schedule_changes from public, anon, authenticated;

create function public.change_enrollment_schedule(
  p_enrollment uuid, p_student uuid, p_date date, p_slots jsonb, p_confirm text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  e public.enrollments%rowtype;
  zone text;
  local_now timestamp;
  participants int;
  movable uuid[];
  plan jsonb;
  previous jsonb;
  slots jsonb;
  days text[];
  common_time time;
  fingerprint text;
  conflict_date date;
begin
  if auth.uid() is null or not coalesce(public.is_owner(),false) then
    raise exception 'Owner access required.';
  end if;
  -- Serialize schedule changes, including changes for different students sharing one teacher.
  perform pg_advisory_xact_lock(67450219);
  select * into e from public.enrollments where id=p_enrollment for update;
  if not found or e.status is distinct from 'active' then raise exception 'Choose an active enrollment.'; end if;
  select count(*) into participants from public.enrollment_students where enrollment_id=e.id;
  if not exists(select from public.enrollment_students where enrollment_id=e.id and student_id=p_student)
     and (participants<>0 or e.student_id is distinct from p_student) then raise exception 'Student is outside this enrollment.'; end if;
  select coalesce(nullif(timezone,''),'Asia/Manila') into strict zone from public.students where id=p_student;
  local_now := now() at time zone zone;
  if p_date is null or p_date < local_now::date then raise exception 'Choose today or a future date in the student’s timezone.'; end if;
  if jsonb_typeof(p_slots) is distinct from 'array' then raise exception 'Choose weekly lesson times.'; end if;
  if jsonb_array_length(p_slots) not between 1 and 7 or exists(
    select from jsonb_array_elements(p_slots) s where coalesce(s->>'day','') !~ '^[0-6]$'
    or coalesce(s->>'time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  ) then raise exception 'Choose valid weekdays and times.'; end if;
  select jsonb_agg(s order by s->>'day'), array_agg((array['sun','mon','tue','wed','thu','fri','sat'])[(s->>'day')::int+1] order by s->>'day'),
    case when count(distinct s->>'time')=1 then min((s->>'time')::time) end
    into slots,days,common_time from jsonb_array_elements(p_slots) s;
  if cardinality(days)<>(select count(distinct d) from unnest(days) d) then raise exception 'Choose one time per weekday.'; end if;
  if exists(select from public.enrollment_pauses where enrollment_id=e.id and resumed_at is null and (student_id is null or student_id=p_student)) then raise exception 'Resume this student’s paused package first.'; end if;
  perform 1 from public.lessons where enrollment_id=e.id order by id for update;
  if participants>1 and exists(select from public.lessons where enrollment_id=e.id and student_id is null) then
    raise exception 'A shared lesson has no student assigned. Link it to its participant before changing the recurring pattern.';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('day',day_of_week,'time',to_char(schedule_time,'HH24:MI')) order by day_of_week,schedule_time),'[]')
    into previous from public.enrollment_schedules where enrollment_id=e.id and (student_id=p_student or (student_id is null and participants<=1));
  select array_agg(l.id order by l.lesson_date,l.schedule_time,l.lesson_number,l.id) into movable
    from public.lessons l where l.enrollment_id=e.id and coalesce(l.student_id,e.student_id)=p_student
    and l.lesson_date>=p_date and l.lesson_date+l.schedule_time>local_now and l.attendance_status='scheduled'
    and not l.consumes_lesson and l.resolution is null and l.substitute_teacher_id is null and l.actual_teacher_id is null
    and l.rescheduled_at is null and l.rollover_source_lesson_id is null
    and nullif(trim(l.teacher_observation),'') is null and nullif(trim(l.notes),'') is null
    and not exists(select from public.teacher_payroll_lessons pay where pay.lesson_id=l.id);
  if movable is null then raise exception 'There are no remaining regular lessons to move from that date.'; end if;

  with candidates as (
    select d::date as day,(s->>'time')::time as tm from generate_series(p_date::timestamp,
      (p_date+7*(cardinality(movable)+1))::timestamp,interval '1 day') d
    join jsonb_array_elements(slots) s on (s->>'day')::int=extract(dow from d)
    where d::date+(s->>'time')::time>local_now
    order by day,tm limit cardinality(movable)
  ), numbered as (
    select *,row_number() over(order by day,tm) n from candidates
  )
  select jsonb_agg(jsonb_build_object('id',l.id,'number',l.lesson_number,'old_date',l.lesson_date,'old_time',l.schedule_time,
    'date',n.day,'time',n.tm) order by n.n) into plan
    from numbered n join public.lessons l on l.id=movable[n.n::int];
  if jsonb_array_length(plan) is distinct from cardinality(movable) then raise exception 'Unable to place all remaining lessons.'; end if;

  -- Compare actual instants so a student in Korea and a student in Malaysia can share a teacher safely.
  with booked as (
    select l.*,coalesce(l.student_id,en.student_id) learner,
      (l.lesson_date+l.schedule_time) at time zone coalesce(nullif(st.timezone,''),'Asia/Manila') starts
    from public.lessons l join public.enrollments en on en.id=l.enrollment_id
    join public.students st on st.id=coalesce(l.student_id,en.student_id)
    where not(l.id=any(movable)) and l.lesson_date between p_date-2 and (plan->-1->>'date')::date+2
      and l.attendance_status in ('scheduled','completed','no_show','late_cancellation')
  ), targets as (
    select x.day,x.tm,(x.day+x.tm) at time zone zone starts,coalesce(l.duration,e.lesson_duration,25) mins
    from jsonb_array_elements(plan) j
    cross join lateral (select (j->>'date')::date as day,(j->>'time')::time tm) x
    join public.lessons l on l.id=(j->>'id')::uuid
  )
  select t.day into conflict_date from targets t join booked b
    on b.starts<t.starts+make_interval(mins=>t.mins) and t.starts<b.starts+make_interval(mins=>coalesce(b.duration,25))
    where b.learner=p_student or exists(
      select from public.teacher_assignments a join public.enrollment_students es on es.id=a.enrollment_student_id
      where es.enrollment_id=e.id and es.student_id=p_student and a.status='active'
        and (a.start_date is null or a.start_date<=t.day) and (a.end_date is null or a.end_date>=t.day)
        and (a.teacher_id=coalesce(b.actual_teacher_id,b.substitute_teacher_id) or
          (coalesce(b.actual_teacher_id,b.substitute_teacher_id) is null and exists(
            select from public.teacher_assignments ba join public.enrollment_students bs on bs.id=ba.enrollment_student_id
            where bs.enrollment_id=b.enrollment_id and bs.student_id=b.learner and ba.teacher_id=a.teacher_id and ba.status='active'
              and (ba.start_date is null or ba.start_date<=b.lesson_date) and (ba.end_date is null or ba.end_date>=b.lesson_date)
          )))
    ) order by t.day limit 1;
  if conflict_date is not null then raise exception 'The student or teacher has an overlapping lesson on %. Choose another time.',conflict_date; end if;
  fingerprint := md5(jsonb_build_array(e.id,p_student,p_date,slots,previous,plan)::text);
  if p_confirm is not null then
    if p_confirm<>fingerprint then raise exception 'The schedule changed. Preview it again.'; end if;
    update public.lessons l set lesson_date=(j->>'date')::date,schedule_time=(j->>'time')::time
      from jsonb_array_elements(plan) j where l.id=(j->>'id')::uuid
      and (l.lesson_date,l.schedule_time) is distinct from ((j->>'date')::date,(j->>'time')::time);
    delete from public.enrollment_schedules where enrollment_id=e.id and (student_id=p_student or (student_id is null and participants<=1));
    insert into public.enrollment_schedules(enrollment_id,student_id,day_of_week,schedule_time)
      select e.id,p_student,(s->>'day')::int,(s->>'time')::time from jsonb_array_elements(slots) s;
    update public.enrollment_students set schedule_days=days,schedule_time=common_time where enrollment_id=e.id and student_id=p_student;
    update public.enrollments set lessons_per_week=case when participants<=1 then cardinality(days)
      else (select max(cardinality(es.schedule_days)) from public.enrollment_students es where es.enrollment_id=e.id) end,
      schedule_days=case when participants<=1 then days else schedule_days end,
      schedule_time=case when participants<=1 then common_time else schedule_time end where id=e.id;
    insert into public.enrollment_schedule_changes(enrollment_id,student_id,effective_on,previous_slots,new_slots,lesson_changes,changed_by)
      values(e.id,p_student,p_date,previous,slots,plan,auth.uid());
  end if;
  return jsonb_build_object('plan',plan,'hash',fingerprint);
end;
$$;
revoke all on function public.change_enrollment_schedule(uuid,uuid,date,jsonb,text) from public,anon;
grant execute on function public.change_enrollment_schedule(uuid,uuid,date,jsonb,text) to authenticated;
commit;
