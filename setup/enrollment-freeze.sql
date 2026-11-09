begin;

create table public.enrollment_pauses (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  student_id uuid references public.students(id) on delete restrict,
  starts_on date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  resumed_on date,
  resumed_at timestamptz,
  resumed_by uuid references public.profiles(id),
  original_lessons jsonb not null default '[]'::jsonb,
  check ((resumed_at is null and resumed_on is null and resumed_by is null)
      or (resumed_at is not null and resumed_on is not null and resumed_by is not null))
);
create index enrollment_pauses_open_idx on public.enrollment_pauses(enrollment_id) where resumed_at is null;
alter table public.enrollment_pauses enable row level security;
revoke all on public.enrollment_pauses from public, anon, authenticated;
grant select on public.enrollment_pauses to authenticated;
grant select, insert, update, delete on public.enrollment_pauses to service_role;
create policy "Owners read enrollment pauses" on public.enrollment_pauses for select to authenticated using (public.is_owner());

alter table public.lessons add column freeze_id uuid references public.enrollment_pauses(id) on delete restrict;
alter table public.lessons drop constraint lessons_attendance_status_check;
alter table public.lessons add constraint lessons_attendance_status_check check (attendance_status in (
 'scheduled','completed','no_show','late_cancellation','student_cancelled_rescheduled',
 'student_cancelled_credit','unexpected_circumstance','teacher_cancelled','frozen'
));
alter table public.lessons add constraint lessons_frozen_not_consumed check (
 attendance_status <> 'frozen' or (freeze_id is not null and not consumes_lesson and resolution is null)
);

-- Enforce the pause even when a stale teacher/owner tab tries to edit attendance.
create function public.guard_paused_lesson() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_pause public.enrollment_pauses%rowtype; v_student uuid;
begin
 -- Serialize new lesson generation with freeze/resume on the enrollment.
 if tg_op = 'INSERT' then perform 1 from public.enrollments where id=new.enrollment_id for update; end if;
 if tg_op <> 'INSERT' and old.freeze_id is not null then
   select * into v_pause from public.enrollment_pauses where id = old.freeze_id;
   if v_pause.resumed_at is null then
     if tg_op = 'DELETE' or new is distinct from old then
       raise exception 'This lesson is on hold. Resume classes from the enrollment first.';
     end if;
     return new;
   end if;
 end if;
 if tg_op = 'DELETE' then return old; end if;
 select coalesce(new.student_id, e.student_id) into v_student from public.enrollments e where e.id = new.enrollment_id;
 select * into v_pause from public.enrollment_pauses p
 where p.enrollment_id = new.enrollment_id and p.resumed_at is null
   and (p.student_id is null or p.student_id = v_student)
   and new.lesson_date >= p.starts_on
 order by p.created_at limit 1;
 if found then
   if new.attendance_status = 'scheduled' and not new.consumes_lesson and new.resolution is null then
     new.attendance_status := 'frozen'; new.freeze_id := v_pause.id;
   elsif new.attendance_status <> 'frozen' and (tg_op = 'INSERT' or new.attendance_status is distinct from old.attendance_status or new.consumes_lesson is distinct from old.consumes_lesson or new.lesson_date is distinct from old.lesson_date or new.student_id is distinct from old.student_id) then
     raise exception 'This participant is on hold for that date. Resume classes first.';
   end if;
 end if;
 if new.attendance_status = 'frozen' and (v_pause.id is null or new.freeze_id is distinct from v_pause.id) then
   raise exception 'A frozen lesson must belong to an open enrollment pause.';
 end if;
 return new;
end;
$$;
create trigger aaa_guard_paused_lesson before insert or update or delete on public.lessons for each row execute function public.guard_paused_lesson();
revoke all on function public.guard_paused_lesson() from public, anon, authenticated;

create function public.manage_enrollment_pause(
 p_enrollment_id uuid, p_action text, p_student_id uuid default null,
 p_date date default null, p_pause_id uuid default null, p_expected_hash text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_actor uuid := auth.uid(); v_enrollment public.enrollments%rowtype;
 v_pause public.enrollment_pauses%rowtype; v_plan jsonb; v_hash text;
 v_used bigint; v_id uuid; v_count integer; v_today date; v_result jsonb;
begin
 if v_actor is null or not public.is_owner() then raise exception 'Only an active owner may freeze or resume classes.' using errcode='42501'; end if;
 select * into v_enrollment from public.enrollments where id=p_enrollment_id for update;
 if not found then raise exception 'Enrollment not found.'; end if;
 if p_action = 'state' then
   return jsonb_build_object(
     'pauses', coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'student_id',p.student_id,'starts_on',p.starts_on,'name',coalesce(s.preferred_name,s.full_name,'Everyone'),'lessons',(select count(*) from public.lessons l where l.freeze_id=p.id and l.attendance_status='frozen')) order by p.created_at) from public.enrollment_pauses p left join public.students s on s.id=p.student_id where p.enrollment_id=p_enrollment_id and p.resumed_at is null),'[]'::jsonb),
     'participants', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.full_name || case when nullif(btrim(s.preferred_name),'') is not null and s.preferred_name<>s.full_name then ' ('||s.preferred_name||')' else '' end,'timezone',s.timezone) order by s.full_name) from public.students s where s.id in (select v_enrollment.student_id union select es.student_id from public.enrollment_students es where es.enrollment_id=p_enrollment_id)),'[]'::jsonb),
     'schedules', coalesce((select jsonb_agg(jsonb_build_object('student_id',s.student_id,'day',s.day_of_week,'time',s.schedule_time) order by s.day_of_week,s.schedule_time) from public.enrollment_schedules s where s.enrollment_id=p_enrollment_id),'[]'::jsonb),
     'status',v_enrollment.status);
 end if;
 if p_action is null or p_action not in ('freeze_preview','freeze','resume_preview','resume') then raise exception 'Invalid action.'; end if;
 if p_date is null then raise exception 'Choose a date.'; end if;
 if p_action in ('freeze_preview','freeze') then
   if v_enrollment.status <> 'active' then raise exception 'Only active enrollments can be paused.'; end if;
   if p_student_id is not null and p_student_id is distinct from v_enrollment.student_id and not exists(select 1 from public.enrollment_students where enrollment_id=p_enrollment_id and student_id=p_student_id) then raise exception 'Participant does not belong to this enrollment.'; end if;
   if exists(select 1 from public.enrollment_pauses where enrollment_id=p_enrollment_id and resumed_at is null and (student_id is null or p_student_id is null or student_id=p_student_id)) then raise exception 'This selection overlaps an existing pause.'; end if;
 else
   select * into v_pause from public.enrollment_pauses where id=p_pause_id and enrollment_id=p_enrollment_id and resumed_at is null for update;
   if not found then raise exception 'This pause is no longer open. Refresh the enrollment.'; end if;
   p_student_id := v_pause.student_id;
   if p_date < v_pause.starts_on then raise exception 'Resume date cannot be before the freeze start date.'; end if;
   if v_enrollment.status <> 'active' then raise exception 'Review the enrollment status before resuming.'; end if;
 end if;
 -- The chosen date is interpreted in each affected learner's timezone.
 select max((now() at time zone case when exists(select 1 from pg_catalog.pg_timezone_names z where z.name=s.timezone) then s.timezone else 'Asia/Manila' end)::date)
 into v_today from public.students s where s.id in (select v_enrollment.student_id union select es.student_id from public.enrollment_students es where es.enrollment_id=p_enrollment_id) and (p_student_id is null or s.id=p_student_id);
 if p_date < coalesce(v_today,current_date) then raise exception 'Choose today or a future date.'; end if;
 perform 1 from public.lessons where enrollment_id=p_enrollment_id order by id for update;
 if p_action in ('freeze_preview','freeze') then
   select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'student_id',coalesce(l.student_id,v_enrollment.student_id),'name',coalesce(s.preferred_name,s.full_name,'Student'),'number',l.lesson_number,'old_date',l.lesson_date,'date',l.lesson_date,'time',l.schedule_time) order by l.lesson_date,l.schedule_time,l.id),'[]'::jsonb)
   into v_plan from public.lessons l left join public.students s on s.id=coalesce(l.student_id,v_enrollment.student_id)
   where l.enrollment_id=p_enrollment_id and l.lesson_date>=p_date and l.attendance_status='scheduled' and not l.consumes_lesson and l.resolution is null
   and (p_student_id is null or coalesce(l.student_id,v_enrollment.student_id)=p_student_id);
 else
   -- Reuse the held lesson IDs and each participant's own recurring schedule.
   with held as (
    select l.*,coalesce(l.student_id,v_enrollment.student_id) as learner,
      row_number() over(partition by coalesce(l.student_id,v_enrollment.student_id) order by l.lesson_date,l.schedule_time,l.lesson_number,l.id) as rn
    from public.lessons l where l.freeze_id=p_pause_id and l.attendance_status='frozen'
   ), candidates as (
    select distinct h.learner, d::date as day, es.schedule_time
    from (select distinct learner from held) h
    join public.enrollment_schedules es on es.enrollment_id=p_enrollment_id and es.student_id=h.learner
    cross join lateral generate_series(p_date::timestamp,(p_date+3650)::timestamp,interval '1 day') d
    join public.students learner on learner.id=h.learner
    where extract(dow from d)::integer=es.day_of_week
    and ((d::date + es.schedule_time) at time zone case when exists(select 1 from pg_catalog.pg_timezone_names z where z.name=learner.timezone) then learner.timezone else 'Asia/Manila' end) > now()
    and not exists(select 1 from public.lessons existing join public.enrollments e on e.id=existing.enrollment_id
      where coalesce(existing.student_id,e.student_id)=h.learner
      and existing.attendance_status in ('scheduled','completed','no_show','late_cancellation')
      and existing.lesson_date=d::date
      and existing.schedule_time < es.schedule_time + make_interval(mins=>v_enrollment.lesson_duration)
      and existing.schedule_time + make_interval(mins=>coalesce(existing.duration,25)) > es.schedule_time)
   ), ranked as (
    select *,row_number() over(partition by learner order by day,schedule_time) rn from candidates
   )
   select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'student_id',h.learner,'name',coalesce(s.preferred_name,s.full_name,'Student'),'number',h.lesson_number,'old_date',h.lesson_date,'date',r.day,'time',r.schedule_time) order by r.day,r.schedule_time,h.id),'[]'::jsonb)
   into v_plan from held h join ranked r on r.learner=h.learner and r.rn=h.rn left join public.students s on s.id=h.learner;
   if jsonb_array_length(v_plan) <> (select count(*) from public.lessons where freeze_id=p_pause_id and attendance_status='frozen') then raise exception 'A participant has no usable weekly schedule. Update their schedule before resuming.'; end if;
 end if;
 v_count := jsonb_array_length(v_plan);
 if exists(select 1 from public.lessons l where l.id in(select (x->>'id')::uuid from jsonb_array_elements(v_plan) x)
   and (l.actual_teacher_id is not null or l.substitute_teacher_id is not null or nullif(btrim(l.teacher_observation),'') is not null)) then
   raise exception 'An affected lesson has a recorded teacher, substitute or teaching observation. Review that lesson before freezing or resuming.';
 end if;
 if v_count=0 then raise exception 'There are no scheduled lessons available for this action.'; end if;
 if exists(select 1 from public.teacher_payroll_lessons p where p.lesson_id in (select (x->>'id')::uuid from jsonb_array_elements(v_plan) x)) then raise exception 'An affected lesson is linked to payroll. Review it before changing the schedule.'; end if;
 select count(*) into v_used from public.lessons l where l.enrollment_id=p_enrollment_id and (l.consumes_lesson or l.attendance_status in ('completed','no_show','late_cancellation') or (l.attendance_status='unexpected_circumstance' and l.resolution='counted_as_completed'));
 if p_action in ('resume_preview','resume') and v_used + (select count(*) from public.lessons where enrollment_id=p_enrollment_id and attendance_status in ('scheduled','frozen')) > v_enrollment.number_of_lessons then raise exception 'Scheduled and held lessons exceed the remaining balance. Review extra credit lessons before resuming.'; end if;
 v_hash := md5(jsonb_build_object('plan',v_plan,'used',v_used,'date',p_date,'participant',p_student_id,'pause',p_pause_id)::text);
 v_result := jsonb_build_object('plan',v_plan,'hash',v_hash,'count',v_count,'remaining',greatest(v_enrollment.number_of_lessons-v_used,0));
 if p_action in ('freeze_preview','resume_preview') then return v_result; end if;
 if p_expected_hash is distinct from v_hash then raise exception 'The lesson schedule changed. Preview again before confirming.'; end if;
 if p_action='freeze' then
   insert into public.enrollment_pauses(enrollment_id,student_id,starts_on,created_by,original_lessons) values(p_enrollment_id,p_student_id,p_date,v_actor,v_plan) returning id into v_id;
   update public.lessons set attendance_status='frozen',freeze_id=v_id where id in(select (x->>'id')::uuid from jsonb_array_elements(v_plan) x);
 else
   update public.enrollment_pauses set resumed_on=p_date,resumed_at=now(),resumed_by=v_actor where id=p_pause_id;
   update public.lessons l set attendance_status='scheduled',freeze_id=null,
     original_lesson_date=coalesce(l.original_lesson_date,l.lesson_date),
     original_schedule_time=coalesce(l.original_schedule_time,l.schedule_time),
     rescheduled_at=now(),lesson_date=(x->>'date')::date,schedule_time=(x->>'time')::time
   from jsonb_array_elements(v_plan) x where l.id=(x->>'id')::uuid;
 end if;
 return v_result;
end;
$$;
revoke all on function public.manage_enrollment_pause(uuid,text,uuid,date,uuid,text) from public,anon;
grant execute on function public.manage_enrollment_pause(uuid,text,uuid,date,uuid,text) to authenticated;

CREATE OR REPLACE FUNCTION public.get_portal_lesson_details()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare output jsonb;
begin
  if not exists (
    select 1
    from public.portal_accounts a
    where a.user_id = auth.uid()
      and a.status = 'active'
  ) then
    raise exception 'Portal access is not available.'
      using errcode = '42501';
  end if;

  with accessible as (
    select
      o.*,
      case
        when exists (
          select 1
          from pg_catalog.pg_timezone_names z
          where z.name = o.student_timezone
        )
        then o.student_timezone
        else 'Asia/Manila'
      end as display_timezone
    from public.get_portal_enrollment_overview() o
    where o.enrollment_id is not null
      and o.enrollment_status = 'active'
  ),

  upcoming as (
    select
      a.student_id,
      a.enrollment_id,
      l.id,
      l.lesson_date,
      l.schedule_time,
      a.display_timezone as timezone,
      coalesce(l.duration, a.lesson_duration) as duration,

      coalesce(
        l.platform,
        inherited_info.platform
      ) as platform,

      coalesce(
        l.class_link,
        inherited_info.class_link
      ) as class_link,

      p.full_name as teacher_name,

      row_number() over (
        partition by a.student_id
        order by
          l.lesson_date,
          l.schedule_time nulls last,
          l.id
      ) as ordinal

    from accessible a

    join public.lessons l
      on l.enrollment_id = a.enrollment_id
      and (
        l.student_id = a.student_id
        or (
          l.student_id is null
          and not a.is_shared
        )
      )

    /*
      Find the most recently saved Class Info for this
      student and enrollment, up to the current lesson.

      This lets future lessons inherit a fixed platform/link
      without copying it into every lesson row.
    */
    left join lateral (
      select
        previous.platform,
        previous.class_link
      from public.lessons previous
      where previous.enrollment_id = a.enrollment_id
        and (
          previous.student_id = a.student_id
          or (
            previous.student_id is null
            and not a.is_shared
          )
        )
        and previous.class_info_updated_at is not null

        /*
          Do not inherit Class Info from a lesson that occurs
          after the lesson currently being displayed.
        */
        and (
          previous.lesson_date < l.lesson_date
          or (
            previous.lesson_date = l.lesson_date
            and previous.lesson_number <= l.lesson_number
          )
        )

      order by
        previous.lesson_date desc,
        previous.lesson_number desc nulls last,
        previous.class_info_updated_at desc,
        previous.id desc

      limit 1
    ) inherited_info on true

    left join lateral (
      select ta.teacher_id
      from public.teacher_assignments ta

      join public.enrollment_students es
        on es.id = ta.enrollment_student_id

      where es.enrollment_id = a.enrollment_id
        and es.student_id = a.student_id
        and ta.status = 'active'
        and ta.start_date <= l.lesson_date
        and (
          ta.end_date is null
          or ta.end_date >= l.lesson_date
        )

      order by
        ta.start_date desc,
        ta.created_at desc,
        ta.id

      limit 1
    ) assignment on true

    left join public.profiles p
      on p.id = coalesce(
        l.substitute_teacher_id,
        l.actual_teacher_id,
        assignment.teacher_id
      )

    where l.attendance_status in ('scheduled', 'rescheduled')
      and l.lesson_date is not null
      and (
        case
          when l.schedule_time is null
            then l.lesson_date >=
              (now() at time zone a.display_timezone)::date
          else
            (
              (l.lesson_date + l.schedule_time)
              at time zone a.display_timezone
            ) >= now()
        end
      )
  ),

  regular as (
    select
      a.student_id,
      a.enrollment_id,
      a.display_timezone as timezone,
      s.day_of_week::text as day,
      s.schedule_time::text as time

    from accessible a

    join public.enrollment_schedules s
      on s.enrollment_id = a.enrollment_id
      and s.student_id = a.student_id

    union all

    select
      a.student_id,
      a.enrollment_id,
      a.display_timezone,
      day.value,
      coalesce(
        es.schedule_time,
        case when not a.is_shared then e.schedule_time end
      )::text

    from accessible a

    join public.enrollments e
      on e.id = a.enrollment_id

    left join public.enrollment_students es
      on es.enrollment_id = a.enrollment_id
      and es.student_id = a.student_id

    cross join lateral unnest(
      case
        when cardinality(es.schedule_days) > 0
          then es.schedule_days
        when not a.is_shared
          then e.schedule_days
        else null
      end
    ) day(value)

    where not exists (
      select 1
      from public.enrollment_schedules s
      where s.enrollment_id = a.enrollment_id
        and s.student_id = a.student_id
    )
      and coalesce(
        es.schedule_time,
        case when not a.is_shared then e.schedule_time end
      ) is not null
  )

  select jsonb_build_object(
    'pauses', coalesce((select jsonb_agg(distinct jsonb_build_object('id',p.id,'student_id',a.student_id,'starts_on',p.starts_on))
      from accessible a join public.enrollment_pauses p on p.enrollment_id=a.enrollment_id
      and (p.student_id is null or p.student_id=a.student_id) and p.resumed_at is null),'[]'::jsonb),
    'lessons',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(u) - 'ordinal'
          order by
            u.lesson_date,
            u.schedule_time nulls last,
            u.id
        )
        from upcoming u
        where u.ordinal <= 6
      ),
      '[]'::jsonb
    ),

    'schedules',
    coalesce(
      (
        select jsonb_agg(distinct to_jsonb(r))
        from regular r
        where not exists(select 1 from public.enrollment_pauses p where p.enrollment_id=r.enrollment_id
          and (p.student_id is null or p.student_id=r.student_id) and p.resumed_at is null
          and p.starts_on <= (now() at time zone r.timezone)::date)
      ),
      '[]'::jsonb
    )
  )
  into output;

  return output;
end;
$function$;

commit;
